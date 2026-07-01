import { beforeEach, describe, expect, it, vi } from "vitest";

const invokeLLMMock = vi.hoisted(() => vi.fn());

vi.mock("./_core/llm", () => ({
  invokeLLM: invokeLLMMock,
}));
import type { TrpcContext } from "./_core/context";
import {
  appRouter,
  buildSafeTriageGuidance,
  MARKETPLACE_COMMERCIAL_NOTICE,
} from "./routers";
import {
  CLINICAL_LLM_SCHEMA_NAME,
  MACHINE_LEARNING_FOUNDATION,
  buildClinicalAIAuditEvent,
  buildClinicalSafetyAssessment,
  buildClinicalSafetyAssessmentWithLLM,
  detectUnsafeClinicalOutput,
  evaluateClinicalSafetyDataset,
} from "./ai/clinicalSafety";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: role === "admin" ? 1 : 2,
    openId: `${role}-sample`,
    email: `${role}@example.com`,
    name: role === "admin" ? "Admin Sample" : "Patient Sample",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => undefined,
    } as TrpcContext["res"],
  };
}

function createAnonymousContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => undefined,
    } as TrpcContext["res"],
  };
}

function mockStructuredLLMContent(content: string) {
  invokeLLMMock.mockResolvedValueOnce({
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content,
        },
        finish_reason: "stop",
      },
    ],
  });
}

function mockStructuredLLMJSON(payload: Record<string, unknown>) {
  mockStructuredLLMContent(JSON.stringify(payload));
}

beforeEach(() => {
  invokeLLMMock.mockReset();
});

describe("health platform safety contracts", () => {
  it("blocks triage when mandatory LGPD consent is missing", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());

    await expect(
      caller.triage.evaluate({
        message: "Tenho cansaço e quero entender próximos passos.",
        consent: {
          privacyAccepted: true,
          healthDataAccepted: false,
          aiGuidanceAccepted: true,
          notificationsAccepted: false,
        },
      }),
    ).rejects.toThrow("LGPD consent is required before collecting health data.");
  });

  it("detects red flags and requires human fallback for urgent symptoms", () => {
    const guidance = buildSafeTriageGuidance("Estou com dor no peito e falta de ar.");

    expect(guidance.redFlag).toBe(true);
    expect(guidance.fallbackToHuman).toBe(true);
    expect(guidance.severity).toBe("urgent");
    expect(guidance.guardrailDecision).toBe("refuse_and_escalate");
    expect(guidance.aiGovernance.principle).toBe("answer_safely_or_do_not_answer");
    expect(guidance.disclaimer).toContain("não substitui");
  });

  it("declares uncertainty instead of inventing when context is insufficient", () => {
    const guidance = buildSafeTriageGuidance("Estou estranho.");

    expect(guidance.confidence).toBe("low");
    expect(guidance.guardrailDecision).toBe("ask_for_context");
    expect(guidance.uncertaintyReason).toContain("Contexto insuficiente");
    expect(guidance.guidance).toContain("Não tenho informações suficientes");
  });

  it("refuses prescription-like requests and escalates to a qualified human", () => {
    const guidance = buildSafeTriageGuidance("Tenho dor há dois dias, qual remédio e qual dose posso tomar?");

    expect(guidance.prescriptionRequest).toBe(true);
    expect(guidance.fallbackToHuman).toBe(true);
    expect(guidance.guardrailDecision).toBe("refuse_and_escalate");
    expect(guidance.guidance).not.toMatch(/tome \d+|mg|comprimido/i);
  });

  it("flags unsafe clinical output for hallucination and missing disclaimer controls", () => {
    const violations = detectUnsafeClinicalOutput("Você tem gastrite com certeza. Tome 40 mg todos os dias.");

    expect(violations).toContain("diagnosis_or_certainty_claim");
    expect(violations).toContain("prescriptive_language");
    expect(violations).toContain("missing_disclaimer");
  });

  it("exposes a Machine Learning foundation with registries, datasets, metrics and evaluation suites", () => {
    expect(MACHINE_LEARNING_FOUNDATION.modelRegistry.length).toBeGreaterThanOrEqual(2);
    expect(MACHINE_LEARNING_FOUNDATION.promptRegistry[0].policyVersion).toContain("clinical-safety");
    expect(MACHINE_LEARNING_FOUNDATION.evaluationSuites.map((suite) => suite.id)).toContain("anti_hallucination_core");
    expect(MACHINE_LEARNING_FOUNDATION.datasetRegistry.map((dataset) => dataset.id)).toContain("synthetic_clinical_safety_eval_v0");
    expect(MACHINE_LEARNING_FOUNDATION.metricsRegistry.map((metric) => metric.id)).toContain("guardrail_pass_rate");
  });

  it("runs the synthetic clinical safety evaluation suite with required metrics", () => {
    const summary = evaluateClinicalSafetyDataset();

    expect(summary.passRate).toBe(1);
    expect(summary.failedCaseIds).toHaveLength(0);
    expect(summary.metrics.redFlagRecallProxy).toBe(1);
    expect(summary.metrics.uncertaintyDisclosureRate).toBe(1);
  });

  it("builds an audit event for each AI safety decision without storing raw health text", () => {
    const input = { message: "Tenho cansaço há algumas semanas e quero preparar minha consulta.", flow: "onboarding_triage" as const };
    const assessment = buildClinicalSafetyAssessment(input);
    const auditEvent = buildClinicalAIAuditEvent(input, assessment, "2026-05-01T12:00:00.000Z");

    expect(auditEvent.eventType).toBe("clinical_ai_safety_decision");
    expect(auditEvent.policyVersion).toContain("clinical-safety");
    expect(auditEvent.flow).toBe("onboarding_triage");
    expect(JSON.stringify(auditEvent)).not.toContain(input.message);
  });

  it("keeps marketplace language explicitly commercial and non-prescriptive", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());
    const catalog = await caller.catalog.list();

    expect(MARKETPLACE_COMMERCIAL_NOTICE).toContain("Produto comercial opcional");
    expect(catalog.products).toHaveLength(3);
    expect(catalog.products.every((product) => product.commercialNotice.toLowerCase().includes("comercial"))).toBe(true);
    expect(catalog.products.every((product) => /não|nem/.test(product.commercialNotice.toLowerCase()))).toBe(true);
  });

  it("forbids non-admin users from administrative summary", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(caller.admin.summary()).rejects.toThrow();
  });

  it("allows admin users to view operational summary", async () => {
    const caller = appRouter.createCaller(createContext("admin"));
    const summary = await caller.admin.summary();

    expect(summary.role).toBe("admin");
    expect(summary.criticalFlows).toContain("ai_tracking");
    expect(summary.criticalFlows).toContain("ml_evaluation");
    expect(summary.machineLearningFoundation.evaluationSuites.map((suite) => suite.id)).toContain("anti_hallucination_core");
    expect(summary.clinicalSafetyEvaluation.passRate).toBe(1);
  });

  it("enhances safe educational triage through invokeLLM with strict JSON Schema", async () => {
    mockStructuredLLMJSON({
      guidance:
        "Esta é uma orientação educativa e não substitui avaliação médica. Você pode organizar duração, intensidade, rotina de sono, alimentação, medicamentos em uso e perguntas objetivas para a consulta.",
      nextStep: "Preparar um resumo dos sintomas e considerar consulta com profissional habilitado.",
      severity: "educational",
      confidence: "medium",
      uncertaintyReason: null,
    });

    const assessment = await buildClinicalSafetyAssessmentWithLLM({
      message: "Tenho cansaço há algumas semanas e quero organizar perguntas para conversar com meu médico.",
      flow: "appointment_preparation",
    });

    expect(invokeLLMMock).toHaveBeenCalledTimes(1);
    const llmParams = invokeLLMMock.mock.calls[0][0];
    expect(llmParams.response_format.type).toBe("json_schema");
    expect(llmParams.response_format.json_schema.name).toBe(CLINICAL_LLM_SCHEMA_NAME);
    expect(llmParams.response_format.json_schema.strict).toBe(true);
    expect(assessment.llmEnhanced).toBe(true);
    expect(assessment.llmAuditTrail.status).toBe("enhanced");
    expect(assessment.safetyActions).toContain("llm_json_schema_validated");
    expect(assessment.guidance).toContain("orientação educativa");
  });

  it("falls back to deterministic guidance when the LLM returns invalid JSON", async () => {
    mockStructuredLLMContent("não sou json estruturado");

    const assessment = await buildClinicalSafetyAssessmentWithLLM({
      message: "Tenho cansaço há algumas semanas e quero organizar perguntas para conversar com meu médico.",
      flow: "appointment_preparation",
    });

    expect(invokeLLMMock).toHaveBeenCalledTimes(1);
    expect(assessment.llmEnhanced).toBe(false);
    expect(assessment.llmAuditTrail.status).toBe("fallback_invalid_json");
    expect(assessment.guidance).toContain("Posso ajudar de forma educativa");
  });

  it("falls back to deterministic guidance when the LLM invocation fails", async () => {
    invokeLLMMock.mockRejectedValueOnce(new Error("upstream unavailable"));

    const assessment = await buildClinicalSafetyAssessmentWithLLM({
      message: "Tenho cansaço há algumas semanas e quero organizar perguntas para conversar com meu médico.",
      flow: "appointment_preparation",
    });

    expect(invokeLLMMock).toHaveBeenCalledTimes(1);
    expect(assessment.llmEnhanced).toBe(false);
    expect(assessment.llmAuditTrail.status).toBe("fallback_llm_error");
    expect(assessment.llmAuditTrail.reason).toContain("upstream unavailable");
  });

  it("rejects unsafe LLM clinical wording through the post-response guardrail", async () => {
    mockStructuredLLMJSON({
      guidance: "Você tem gastrite com certeza. Esta orientação educativa não substitui avaliação médica.",
      nextStep: "Levar a informação para consulta com profissional habilitado.",
      severity: "educational",
      confidence: "medium",
      uncertaintyReason: null,
    });

    const assessment = await buildClinicalSafetyAssessmentWithLLM({
      message: "Tenho desconforto abdominal há algumas semanas e quero preparar perguntas para consulta.",
      flow: "appointment_preparation",
    });

    expect(assessment.llmEnhanced).toBe(false);
    expect(assessment.llmAuditTrail.status).toBe("fallback_post_guardrail_violation");
    expect(assessment.llmAuditTrail.postGuardrailViolations).toContain("diagnosis_or_certainty_claim");
    expect(assessment.guidance).toContain("Posso ajudar de forma educativa");
  });

  it("does not invoke LLM when deterministic guardrails block prescriptions or red flags", async () => {
    const prescriptionAssessment = await buildClinicalSafetyAssessmentWithLLM({
      message: "Tenho dor há dois dias, qual remédio e qual dose posso tomar?",
      flow: "onboarding_triage",
    });
    const redFlagAssessment = await buildClinicalSafetyAssessmentWithLLM({
      message: "Estou com dor no peito desde hoje e falta de ar.",
      flow: "onboarding_triage",
    });

    expect(invokeLLMMock).not.toHaveBeenCalled();
    expect(prescriptionAssessment.guardrailDecision).toBe("refuse_and_escalate");
    expect(prescriptionAssessment.llmEnhanced).toBe(false);
    expect(redFlagAssessment.severity).toBe("urgent");
    expect(redFlagAssessment.llmAuditTrail.status).toBe("not_attempted_guardrail_blocked");
  });
});

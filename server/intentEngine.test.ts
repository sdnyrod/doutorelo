import { beforeEach, describe, expect, it, vi } from "vitest";

const invokeLLMMock = vi.hoisted(() => vi.fn());
const dbMocks = vi.hoisted(() => ({
  createHealthConversation: vi.fn(),
  addClinicalMemoryEvent: vi.fn(),
  saveClarityMap: vi.fn(),
  getPatientMemorySummary: vi.fn(),
  listPatientTimeline: vi.fn(),
  savePatientHealthProfile: vi.fn(),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: invokeLLMMock,
}));

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    createHealthConversation: dbMocks.createHealthConversation,
    addClinicalMemoryEvent: dbMocks.addClinicalMemoryEvent,
    saveClarityMap: dbMocks.saveClarityMap,
    getPatientMemorySummary: dbMocks.getPatientMemorySummary,
    listPatientTimeline: dbMocks.listPatientTimeline,
    savePatientHealthProfile: dbMocks.savePatientHealthProfile,
  };
});

import type { TrpcContext } from "./_core/context";
import { buildClinicalSafetyAssessment } from "./ai/clinicalSafety";
import {
  INTENT_ENGINE_SCHEMA_NAME,
  buildContinuousIntentAnalysisWithLLM,
  buildDeterministicContinuousIntentAnalysis,
} from "./ai/intentEngine";
import { appRouter } from "./routers";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

const consent = {
  privacyAccepted: true,
  healthDataAccepted: true,
  aiGuidanceAccepted: true,
  notificationsAccepted: false,
};

function createContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 88,
    openId: "continuous-patient-sample",
    email: "jornada@example.com",
    name: "Paciente Jornada",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date("2026-05-02T10:00:00.000Z"),
    updatedAt: new Date("2026-05-02T10:00:00.000Z"),
    lastSignedIn: new Date("2026-05-02T10:00:00.000Z"),
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

function mockSafeSafetyLLM() {
  mockStructuredLLMJSON({
    guidance:
      "Esta orientação é educativa e não substitui consulta, diagnóstico, prescrição, tratamento ou urgência. Organize contexto, duração, intensidade, rotina e dúvidas.",
    nextStep: "Continuar organizando a jornada com segurança e procurar profissional habilitado se houver piora, risco ou necessidade de avaliação individual.",
    severity: "educational",
    confidence: "medium",
    uncertaintyReason: null,
  });
}

function validIntentPayload(overrides: Record<string, unknown> = {}) {
  return {
    intentType: "habit",
    urgency: "educational",
    domain: "sono e energia",
    mainNeed: "Organizar sono, energia e rotina sem diagnóstico automático",
    initialResponse:
      "Entendi que você quer organizar sono, energia e rotina. Esta resposta é educativa e não substitui consulta, diagnóstico, prescrição, tratamento ou urgência; ela apenas abre caminhos seguros para continuar.",
    nextPaths: [
      {
        id: "track_routine",
        label: "Acompanhar rotina",
        icon: "activity",
        description: "Observar sono, energia, alimentação, movimento e humor ao longo do tempo.",
        route: "/conexoes",
        priority: "primary",
      },
      {
        id: "understand_better",
        label: "Entender melhor",
        icon: "search",
        description: "Aprofundar início, duração, intensidade e fatores de melhora ou piora.",
        route: null,
        priority: "primary",
      },
      {
        id: "save_to_memory",
        label: "Registrar na memória",
        icon: "database",
        description: "Guardar este ponto para preservar continuidade nas próximas conversas.",
        route: "/memoria",
        priority: "secondary",
      },
      {
        id: "prevention_plan",
        label: "Prevenção e hábitos",
        icon: "leaf",
        description: "Transformar objetivos em observações seguras para acompanhar sem promessas clínicas.",
        route: "/app",
        priority: "secondary",
      },
      {
        id: "continue_freely",
        label: "Continuar livremente",
        icon: "message-circle",
        description: "Escrever do seu jeito, sem formulário rígido, conforme a necessidade aparecer.",
        route: null,
        priority: "primary",
      },
      {
        id: "review_alerts",
        label: "Ver sinais de atenção",
        icon: "shield-alert",
        description: "Conferir quando a situação pede urgência ou suporte humano.",
        route: null,
        priority: "safety",
      },
    ],
    followUpQuestions: [
      "Qual mudança você quer observar primeiro: sono, energia, alimentação, movimento ou humor?",
      "Há quanto tempo esse padrão vem chamando sua atenção?",
      "O que você já tentou acompanhar até agora?",
    ],
    liveSummary: {
      title: "Sono, energia e rotina",
      whatWeUnderstood: "Você quer organizar cansaço, sono e rotina para decidir próximos passos com segurança.",
      missingContext: ["rotina atual", "padrão observado", "objetivo principal"],
      memoryHint: "Este resumo pode ser atualizado ao longo da jornada e reaproveitado em conversas futuras.",
    },
    confidence: "medium",
    ...overrides,
  };
}

beforeEach(() => {
  invokeLLMMock.mockReset();
  Object.values(dbMocks).forEach((mock) => mock.mockReset());
});

describe("DOUTORELO continuous unfolding intent engine", () => {
  it("builds a deterministic journey without collapsing the first input into a consultation funnel", () => {
    const message = "Quero melhorar sono e energia sem transformar isso só em consulta.";
    const safety = buildClinicalSafetyAssessment({ message, flow: "onboarding_triage" });

    const analysis = buildDeterministicContinuousIntentAnalysis(message, safety);

    expect(analysis.intentType).toBe("habit");
    expect(analysis.nextPaths.map((path) => path.id)).toEqual(
      expect.arrayContaining(["track_routine", "prevention_plan", "save_to_memory", "continue_freely"]),
    );
    expect(analysis.nextPaths.filter((path) => !["prepare_professional_conversation", "find_professional"].includes(path.id)).length).toBeGreaterThanOrEqual(3);
    expect(analysis.initialResponse).toMatch(/não substitui|educativa/i);
    expect(analysis.liveSummary.memoryHint).toMatch(/memória longitudinal|não recomeçar do zero/i);
  });

  it("enhances a safe first message with a strict continuous-intent JSON Schema", async () => {
    mockStructuredLLMJSON(validIntentPayload());
    const safety = buildClinicalSafetyAssessment({
      message: "Estou cansado há semanas e quero entender o que observar primeiro.",
      flow: "onboarding_triage",
    });

    const result = await buildContinuousIntentAnalysisWithLLM(
      "Estou cansado há semanas e quero entender o que observar primeiro.",
      safety,
    );

    expect(invokeLLMMock).toHaveBeenCalledTimes(1);
    const llmParams = invokeLLMMock.mock.calls[0][0];
    expect(llmParams.response_format.type).toBe("json_schema");
    expect(llmParams.response_format.json_schema.name).toBe(INTENT_ENGINE_SCHEMA_NAME);
    expect(llmParams.response_format.json_schema.strict).toBe(true);
    expect(result.audit.status).toBe("enhanced");
    expect(result.analysis.nextPaths.some((path) => path.id === "continue_freely")).toBe(true);
    expect(result.analysis.initialResponse).toMatch(/não substitui|educativa/i);
  });

  it("falls back deterministically when the intent LLM returns invalid JSON", async () => {
    mockStructuredLLMContent("isso não é json");
    const message = "Tenho hemograma e ferritina de abril, cansaço há quatro semanas e quero organizar o que perguntar.";
    const safety = {
      ...buildClinicalSafetyAssessment({ message, flow: "onboarding_triage" }),
      guardrailDecision: "answer_safely" as const,
      fallbackToHuman: false,
    };

    const result = await buildContinuousIntentAnalysisWithLLM(message, safety);

    expect(result.audit.status).toBe("fallback_invalid_json");
    expect(result.analysis.intentType).toBe("exam");
    expect(result.analysis.nextPaths.map((path) => path.id)).toContain("organize_exams");
    expect(result.analysis.nextPaths.map((path) => path.id)).toContain("continue_freely");
  });

  it("rejects diagnostic or prescriptive wording returned by the LLM through post-guardrails", async () => {
    mockStructuredLLMJSON(validIntentPayload({
      mainNeed: "Você tem gastrite com certeza",
      initialResponse:
        "Você tem gastrite com certeza. Tome 40 mg hoje. Esta resposta não substitui consulta médica.",
    }));
    const message = "Tenho desconforto abdominal há algumas semanas e quero entender o que observar.";
    const safety = buildClinicalSafetyAssessment({ message, flow: "onboarding_triage" });

    const result = await buildContinuousIntentAnalysisWithLLM(message, safety);

    expect(result.audit.status).toBe("fallback_post_guardrail_violation");
    expect(result.audit.postGuardrailViolations).toContain("diagnosis_or_certainty_claim");
    expect(result.audit.postGuardrailViolations).toContain("prescriptive_language");
    expect(result.analysis.initialResponse).not.toMatch(/40 mg/i);
  });

  it("requires authentication before unfolding a protected health journey", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());

    await expect(
      caller.clarity.analyzeIntent({
        message: "Quero organizar meus sintomas e entender próximos caminhos.",
        consent,
      }),
    ).rejects.toThrow();
    expect(dbMocks.createHealthConversation).not.toHaveBeenCalled();
  });

  it("requires mandatory LGPD consent before processing free-text health data", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(
      caller.clarity.analyzeIntent({
        message: "Quero entender meu cansaço e minha rotina.",
        consent: {
          ...consent,
          healthDataAccepted: false,
        },
      }),
    ).rejects.toThrow("LGPD consent is required before unfolding a health journey from free text.");
    expect(invokeLLMMock).not.toHaveBeenCalled();
    expect(dbMocks.createHealthConversation).not.toHaveBeenCalled();
  });

  it("persists safe continuous journeys under the authenticated user scope", async () => {
    mockSafeSafetyLLM();
    mockStructuredLLMJSON(validIntentPayload());
    dbMocks.createHealthConversation.mockResolvedValueOnce({
      id: 901,
      userId: 88,
      channel: "continuous_unfolding_journey",
    });
    dbMocks.addClinicalMemoryEvent.mockResolvedValueOnce({
      id: 902,
      userId: 88,
      conversationId: 901,
      eventType: "habit",
      severity: "low",
    });
    const caller = appRouter.createCaller(createContext());

    const result = await caller.clarity.analyzeIntent({
      message: "Estou cansado há semanas e quero entender o que observar primeiro.",
      consent,
    });

    expect(invokeLLMMock).toHaveBeenCalledTimes(2);
    expect(dbMocks.createHealthConversation).toHaveBeenCalledWith(88, expect.objectContaining({
      channel: "continuous_unfolding_journey",
      initialConcern: "Estou cansado há semanas e quero entender o que observar primeiro.",
      latestSummary: expect.stringContaining("organizar cansaço"),
    }));
    expect(dbMocks.addClinicalMemoryEvent).toHaveBeenCalledWith(88, expect.objectContaining({
      conversationId: 901,
      source: "ai",
      eventType: "habit",
      metadata: expect.objectContaining({
        flow: "continuous_unfolding_journey",
        intentType: "habit",
        nextPathIds: expect.arrayContaining(["continue_freely", "track_routine", "save_to_memory"]),
        intentAuditStatus: "enhanced",
      }),
    }));
    expect(result.conversation.id).toBe(901);
    expect(result.patientEvent.id).toBe(902);
    expect(result.aiCallTracking.flow).toBe("continuous_unfolding_journey");
    expect(result.aiCallTracking.intentEnhanced).toBe(true);
    expect(result.nextPaths.map((path) => path.id)).toContain("continue_freely");
  });
});

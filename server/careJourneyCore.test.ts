import { beforeEach, describe, expect, it, vi } from "vitest";

const invokeLLMMock = vi.hoisted(() => vi.fn());
const clinicalSafetyMock = vi.hoisted(() => vi.fn());
const dbMocks = vi.hoisted(() => ({
  createHealthConversation: vi.fn(),
  createCareJourneySession: vi.fn(),
  getCareJourneySession: vi.fn(),
  updateCareJourneySession: vi.fn(),
  addClinicalMemoryEvent: vi.fn(),
  logAiModelExecution: vi.fn(),
  recordMlLearningEvent: vi.fn(),
  recordDayanRagRetrievalEvent: vi.fn(),
  recordCareJourneyFeedback: vi.fn(),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: invokeLLMMock,
}));

vi.mock("./ai/clinicalSafety", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./ai/clinicalSafety")>();
  return {
    ...actual,
    buildClinicalSafetyAssessmentWithLLM: clinicalSafetyMock,
  };
});

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    createHealthConversation: dbMocks.createHealthConversation,
    createCareJourneySession: dbMocks.createCareJourneySession,
    getCareJourneySession: dbMocks.getCareJourneySession,
    updateCareJourneySession: dbMocks.updateCareJourneySession,
    addClinicalMemoryEvent: dbMocks.addClinicalMemoryEvent,
    logAiModelExecution: dbMocks.logAiModelExecution,
    recordMlLearningEvent: dbMocks.recordMlLearningEvent,
    recordDayanRagRetrievalEvent: dbMocks.recordDayanRagRetrievalEvent,
    recordCareJourneyFeedback: dbMocks.recordCareJourneyFeedback,
  };
});

import type { TrpcContext } from "./_core/context";
import { ENV } from "./_core/env";
import { buildClinicalSafetyAssessment } from "./ai/clinicalSafety";
import {
  CARE_JOURNEY_SCHEMA_NAME,
  runCareJourneyModelGateway,
} from "./ai/modelGateway";
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
    id: 91,
    openId: "care-journey-patient",
    email: "paciente-care@example.com",
    name: "Paciente Jornada",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date("2026-05-04T10:00:00.000Z"),
    updatedAt: new Date("2026-05-04T10:00:00.000Z"),
    lastSignedIn: new Date("2026-05-04T10:00:00.000Z"),
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

function mockStructuredLLMJSON(payload: Record<string, unknown>) {
  invokeLLMMock.mockResolvedValueOnce({
    choices: [
      {
        index: 0,
        message: {
          role: "assistant",
          content: JSON.stringify(payload),
        },
        finish_reason: "stop",
      },
    ],
    usage: {
      prompt_tokens: 120,
      completion_tokens: 80,
      total_tokens: 200,
    },
  });
}

function validGatewayPayload() {
  return {
    assistantMessage:
      "Esta é uma orientação educativa e não substitui avaliação médica. Pelo que você relatou, vale organizar início, duração, intensidade e dados de rotina para conversar com um profissional habilitado.",
    sessionSummary: "Resumo educativo: paciente relatou desconforto digestivo leve e busca organizar contexto para avaliação profissional. A orientação não substitui avaliação médica.",
    nextQuestion: "De forma educativa, quando começou, qual a intensidade e quais dados de rotina ajudam a contextualizar? Não substitui avaliação médica.",
    suggestedActions: [
      "Ação educativa: anotar início, duração, intensidade e relação com alimentação. Não substitui avaliação médica.",
      "Ação educativa: reunir alergias, exames recentes e histórico relevante. Não substitui avaliação médica.",
      "Ação educativa: levar o resumo para conversa com profissional habilitado. Não substitui avaliação médica.",
    ],
    escalationRecommended: false,
    escalationReason: null,
    severity: "educational",
    confidence: "medium",
    patientCanSaveToMemory: true,
  };
}

function safeAssessment() {
  return buildClinicalSafetyAssessment({
    message: "Tenho desconforto digestivo leve há alguns dias e quero organizar melhor antes de consultar.",
    flow: "onboarding_triage",
  });
}

beforeEach(() => {
  invokeLLMMock.mockReset();
  clinicalSafetyMock.mockReset();
  Object.values(dbMocks).forEach((mock) => mock.mockReset());
  ENV.anthropicApiKey = "";
  ENV.openAiApiKey = "";
  ENV.anthropicModel = "claude-sonnet-4-6";
  ENV.openAiModel = "gpt-4o";
  vi.unstubAllGlobals();
});

describe("DOUTORELO AI Care Journey Core", () => {
  it("calls the model through a strict care-journey JSON Schema and returns audited output", async () => {
    mockStructuredLLMJSON(validGatewayPayload());

    const result = await runCareJourneyModelGateway({
      message: "Tenho desconforto digestivo leve há alguns dias e quero organizar melhor antes de consultar.",
      safety: safeAssessment(),
      sessionContext: { sessionId: 10, totalTurns: 1, previousSummary: null },
    });

    expect(invokeLLMMock).toHaveBeenCalledTimes(1);
    const llmParams = invokeLLMMock.mock.calls[0][0];
    expect(llmParams.response_format.type).toBe("json_schema");
    expect(llmParams.response_format.json_schema.name).toBe(CARE_JOURNEY_SCHEMA_NAME);
    expect(llmParams.response_format.json_schema.strict).toBe(true);
    expect(result.audit.status).toBe("enhanced");
    expect(result.audit.logicalProvider).toBe("built_in_llm");
    expect(result.response.assistantMessage).toMatch(/não substitui avaliação médica/i);
    expect(result.response.confidence).toBe("medium");
  });

  it("prefers Anthropic Claude Sonnet when configured without exposing API keys in prompts or persisted audit fields", async () => {
    ENV.anthropicApiKey = "test-anthropic-key";
    ENV.openAiApiKey = "test-openai-key";
    ENV.anthropicModel = "claude-sonnet-test";

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({
        content: [{ type: "text", text: JSON.stringify(validGatewayPayload()) }],
        usage: { input_tokens: 88, output_tokens: 44 },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await runCareJourneyModelGateway({
      message: "Quero organizar sintomas leves antes de consultar.",
      safety: safeAssessment(),
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.anthropic.com/v1/messages");
    expect(result.audit.logicalProvider).toBe("anthropic");
    expect(result.audit.inputTokensEst).toBe(88);
    expect(result.audit.outputTokensEst).toBe(44);
    expect(JSON.stringify(result)).not.toContain("test-anthropic-key");
    expect(JSON.stringify(fetchMock.mock.calls[0][1].body)).not.toContain("test-anthropic-key");
  });

  it("falls back from Anthropic to OpenAI GPT when the primary external provider fails", async () => {
    ENV.anthropicApiKey = "test-anthropic-key";
    ENV.openAiApiKey = "test-openai-key";
    ENV.openAiModel = "gpt-fallback-test";

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => JSON.stringify({ error: { message: "rate limit" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({
          choices: [{ message: { content: JSON.stringify(validGatewayPayload()) } }],
          usage: { prompt_tokens: 99, completion_tokens: 55 },
        }),
      });
    vi.stubGlobal("fetch", fetchMock);

    const result = await runCareJourneyModelGateway({
      message: "Tenho uma dúvida educativa e quero próximos passos seguros.",
      safety: safeAssessment(),
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe("https://api.anthropic.com/v1/messages");
    expect(fetchMock.mock.calls[1][0]).toBe("https://api.openai.com/v1/chat/completions");
    expect(result.audit.logicalProvider).toBe("openai");
    expect(result.audit.inputTokensEst).toBe(99);
    expect(result.audit.outputTokensEst).toBe(55);
    expect(JSON.stringify(result)).not.toContain("test-openai-key");
  });

  it("falls back deterministically when the model returns invalid JSON", async () => {
    invokeLLMMock.mockResolvedValueOnce({
      choices: [{ index: 0, message: { role: "assistant", content: "não é json" }, finish_reason: "stop" }],
    });

    const result = await runCareJourneyModelGateway({
      message: "Tenho desconforto digestivo leve e quero organizar perguntas.",
      safety: safeAssessment(),
    });

    expect(result.audit.status).toBe("fallback_invalid_json");
    expect(result.audit.logicalProvider).toBe("deterministic_fallback");
    expect(result.response.assistantMessage).toMatch(/não substitui avaliação médica/i);
  });

  it("blocks unsafe diagnostic or prescriptive model wording through post-response guardrails", async () => {
    mockStructuredLLMJSON({
      ...validGatewayPayload(),
      assistantMessage:
        "Você tem gastrite com certeza e deve tomar 40 mg hoje. Esta orientação educativa não substitui avaliação médica, mas a causa está definida.",
      sessionSummary: "Diagnóstico fechado de gastrite informado pela IA.",
    });

    const result = await runCareJourneyModelGateway({
      message: "Tenho queimação no estômago e queria saber o que pode ser.",
      safety: safeAssessment(),
    });

    expect(result.audit.status).toBe("fallback_post_guardrail_violation");
    expect(result.audit.postGuardrailViolations.length).toBeGreaterThan(0);
    expect(result.audit.executionStatus).toBe("fallback");
  });

  it("requires authentication before continuing a governed care journey", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());

    await expect(
      caller.careJourney.continue({
        sessionId: null,
        message: "Quero organizar meus sintomas.",
        consent,
        intakeData: { mainConcern: "sintomas" },
      }),
    ).rejects.toThrow();
    expect(dbMocks.createHealthConversation).not.toHaveBeenCalled();
  });

  it("requires LGPD health-data consent before model execution or persistence", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(
      caller.careJourney.continue({
        sessionId: null,
        message: "Quero organizar meus sintomas.",
        consent: { ...consent, healthDataAccepted: false },
        intakeData: { mainConcern: "sintomas" },
      }),
    ).rejects.toThrow("LGPD consent is required before running a governed care journey.");
    expect(clinicalSafetyMock).not.toHaveBeenCalled();
    expect(dbMocks.createHealthConversation).not.toHaveBeenCalled();
  });

  it("persists session, clinical event, model execution and session update under the authenticated user scope", async () => {
    clinicalSafetyMock.mockResolvedValueOnce(safeAssessment());
    mockStructuredLLMJSON(validGatewayPayload());
    dbMocks.createHealthConversation.mockResolvedValueOnce({ id: 501, userId: 91, channel: "ai_care_journey_core" });
    dbMocks.createCareJourneySession.mockResolvedValueOnce({
      id: 601,
      userId: 91,
      conversationId: 501,
      status: "intake",
      severityLevel: "educational",
      confidenceScore: 60,
      policyVersion: "clinical_safety_policy_v1",
      escalationFlag: false,
      escalationReason: null,
      sessionSummary: null,
      totalTurns: 0,
    });
    dbMocks.addClinicalMemoryEvent.mockResolvedValueOnce({ id: 701, userId: 91, conversationId: 501, eventType: "note" });
    dbMocks.logAiModelExecution.mockResolvedValueOnce({ id: 801, userId: 91, sessionId: 601, status: "success" });
    dbMocks.recordMlLearningEvent.mockResolvedValueOnce({ id: 1001, userId: 91, sessionId: 601, aiExecutionId: 801, source: "care_journey" });
    dbMocks.recordDayanRagRetrievalEvent.mockResolvedValueOnce({ id: 1101, userId: 91, sessionId: 601, aiExecutionId: 801, learningEventId: 1001 });
    dbMocks.updateCareJourneySession.mockResolvedValueOnce({
      id: 601,
      userId: 91,
      conversationId: 501,
      status: "active",
      severityLevel: "educational",
      confidenceScore: 60,
      totalTurns: 1,
      sessionSummary: validGatewayPayload().sessionSummary,
    });

    const caller = appRouter.createCaller(createContext());
    const result = await caller.careJourney.continue({
      sessionId: null,
      message: "Tenho desconforto digestivo leve há alguns dias e quero organizar melhor antes de consultar.",
      consent,
      intakeData: { mainConcern: "desconforto digestivo", relevantContext: "sem anexos interpretados" },
    });

    expect(dbMocks.createHealthConversation).toHaveBeenCalledWith(91, expect.objectContaining({
      channel: "ai_care_journey_core",
      initialConcern: expect.stringContaining("desconforto digestivo"),
    }));
    expect(dbMocks.createCareJourneySession).toHaveBeenCalledWith(91, expect.objectContaining({
      conversationId: 501,
      consentSnapshot: consent,
      status: "intake",
    }));
    expect(dbMocks.addClinicalMemoryEvent).toHaveBeenCalledWith(91, expect.objectContaining({
      conversationId: 501,
      eventType: "note",
      source: "ai",
      severity: "low",
      title: "Jornada governada: nova interação",
      metadata: expect.objectContaining({
        flow: "ai_care_journey_core",
        sessionId: 601,
        gatewayAuditStatus: "enhanced",
        guardrailDecision: "answer_safely",
        escalationRecommended: false,
      }),
    }));
    expect(dbMocks.logAiModelExecution).toHaveBeenCalledWith(91, expect.objectContaining({
      sessionId: 601,
      logicalProvider: "built_in_llm",
      modelCapability: "care_journey_response",
      status: "success",
    }));
    expect(dbMocks.recordMlLearningEvent).toHaveBeenCalledWith(expect.objectContaining({
      userId: 91,
      sessionId: 601,
      aiExecutionId: 801,
      source: "care_journey",
      aiResponse: expect.stringContaining("orientação educativa"),
      ragContextSnapshot: expect.objectContaining({
        sourceCount: expect.any(Number),
      }),
    }));
    expect(dbMocks.recordDayanRagRetrievalEvent).toHaveBeenCalledWith(expect.objectContaining({
      userId: 91,
      sessionId: 601,
      aiExecutionId: 801,
      learningEventId: 1001,
      antiHallucinationStatus: expect.any(String),
    }));
    expect(dbMocks.updateCareJourneySession).toHaveBeenCalledWith(91, 601, expect.objectContaining({
      status: "active",
      sessionSummary: validGatewayPayload().sessionSummary,
      totalTurns: 1,
    }));
    expect(result.session?.id).toBe(601);
    expect(result.modelExecution?.id).toBe(801);
    expect(result.learningEvent?.id).toBe(1001);
    expect(result.ragRetrievalEvent?.id).toBe(1101);
    expect(result.ragContext.sourceCount).toBeGreaterThan(0);
    expect(result.aiCallTracking.flow).toBe("ai_care_journey_core");
  });

  it("records explicit feedback only for a care journey session owned by the current user", async () => {
    dbMocks.getCareJourneySession.mockResolvedValueOnce({ id: 601, userId: 91, conversationId: 501, status: "active" });
    dbMocks.recordCareJourneyFeedback.mockResolvedValueOnce({
      id: 901,
      userId: 91,
      sessionId: 601,
      aiExecutionId: 801,
      rating: "helpful",
      comment: "Resposta considerada útil pelo paciente.",
    });

    const caller = appRouter.createCaller(createContext());
    const result = await caller.careJourney.feedback({
      sessionId: 601,
      aiExecutionId: 801,
      rating: "helpful",
      comment: "Resposta considerada útil pelo paciente.",
    });

    expect(dbMocks.getCareJourneySession).toHaveBeenCalledWith(91, 601);
    expect(dbMocks.recordCareJourneyFeedback).toHaveBeenCalledWith(91, expect.objectContaining({
      sessionId: 601,
      aiExecutionId: 801,
      rating: "helpful",
    }));
    expect(result.accepted).toBe(true);
    expect(result.feedback.id).toBe(901);
  });
});

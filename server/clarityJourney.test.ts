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
  CLARITY_MAP_SCHEMA_NAME,
  buildClarityMapDraftWithLLM,
} from "./ai/clarityJourney";
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
    id: 77,
    openId: "clarity-patient-sample",
    email: "clareza@example.com",
    name: "Paciente Clareza",
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
      "Esta é uma orientação educativa e não substitui avaliação médica. Organize duração, intensidade, contexto, medicações em uso e perguntas para consulta.",
    nextStep: "Preparar um resumo dos sintomas e conversar com profissional habilitado.",
    severity: "educational",
    confidence: "medium",
    uncertaintyReason: null,
  });
}

function mockValidClarityLLM() {
  mockStructuredLLMJSON({
    mainConcern: "Cansaço recorrente para organizar em consulta",
    symptoms: "Cansaço há algumas semanas, pior no fim do dia.",
    patterns: "Piora após noites mal dormidas; faltam dados sobre intensidade e exames prévios.",
    questionsForDoctor: "Que dados do histórico importam? Quais sinais exigem urgência? Que exames faz sentido discutir?",
    suggestedSpecialty: "Clínica médica ou medicina integrativa para avaliação inicial",
    nextStep: "Registrar duração, intensidade, sono, rotina e conversar com profissional habilitado antes de decisões clínicas.",
    safetyFlags: "Sem sinal de urgência declarado; há incerteza por falta de dados objetivos.",
    confidence: "medium",
    assistantMessage:
      "Organizei um Mapa de Clareza educativo para apoiar sua conversa clínica. Ele não substitui avaliação médica.",
  });
}

beforeEach(() => {
  invokeLLMMock.mockReset();
  Object.values(dbMocks).forEach((mock) => mock.mockReset());
});

describe("DOUTORELO clarity journey contracts", () => {
  it("enhances a safe message with a strict clarity-map JSON Schema", async () => {
    mockValidClarityLLM();
    const safety = buildClinicalSafetyAssessment({
      message: "Tenho cansaço há algumas semanas e quero preparar minha consulta.",
      flow: "appointment_preparation",
    });

    const result = await buildClarityMapDraftWithLLM(
      "Tenho cansaço há algumas semanas e quero preparar minha consulta.",
      safety,
    );

    expect(invokeLLMMock).toHaveBeenCalledTimes(1);
    const llmParams = invokeLLMMock.mock.calls[0][0];
    expect(llmParams.response_format.type).toBe("json_schema");
    expect(llmParams.response_format.json_schema.name).toBe(CLARITY_MAP_SCHEMA_NAME);
    expect(llmParams.response_format.json_schema.strict).toBe(true);
    expect(result.audit.status).toBe("enhanced");
    expect(result.draft.nextStep).toContain("profissional habilitado");
    expect(result.assistantMessage).toMatch(/não substitui|educativo/i);
  });

  it("falls back deterministically when the clarity LLM returns invalid JSON", async () => {
    mockStructuredLLMContent("não é json");
    const safety = buildClinicalSafetyAssessment({
      message: "Tenho cansaço há algumas semanas e quero preparar minha consulta.",
      flow: "appointment_preparation",
    });

    const result = await buildClarityMapDraftWithLLM(
      "Tenho cansaço há algumas semanas e quero preparar minha consulta.",
      safety,
    );

    expect(result.audit.status).toBe("fallback_invalid_json");
    expect(result.draft.mainConcern).toContain("Tenho cansaço");
    expect(result.assistantMessage).toContain("Mapa de Clareza criado");
  });

  it("rejects unsafe diagnostic or prescriptive LLM wording through post-guardrails", async () => {
    mockStructuredLLMJSON({
      mainConcern: "Você tem gastrite com certeza",
      symptoms: "Desconforto abdominal.",
      patterns: null,
      questionsForDoctor: "Quais informações devo levar?",
      suggestedSpecialty: "Clínica médica",
      nextStep: "Tome 40 mg hoje e depois converse com profissional habilitado.",
      safetyFlags: null,
      confidence: "high",
      assistantMessage: "Isto não substitui avaliação médica.",
    });
    const safety = buildClinicalSafetyAssessment({
      message: "Tenho desconforto abdominal leve há três semanas, piora após refeições gordurosas e quero preparar perguntas para consulta.",
      flow: "appointment_preparation",
    });

    const result = await buildClarityMapDraftWithLLM(
      "Tenho desconforto abdominal leve há três semanas, piora após refeições gordurosas e quero preparar perguntas para consulta.",
      safety,
    );

    expect(result.audit.status).toBe("fallback_post_guardrail_violation");
    expect(result.audit.postGuardrailViolations).toContain("diagnosis_or_certainty_claim");
    expect(result.audit.postGuardrailViolations).toContain("prescriptive_language");
    expect(result.draft.nextStep).not.toMatch(/40 mg/i);
  });

  it("requires authentication before generating a persisted clarity journey", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());

    await expect(
      caller.clarity.generateMap({
        message: "Quero organizar meus sintomas para a consulta.",
        consent,
      }),
    ).rejects.toThrow();
    expect(dbMocks.createHealthConversation).not.toHaveBeenCalled();
  });

  it("requires mandatory LGPD consent before processing health data", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(
      caller.clarity.generateMap({
        message: "Tenho cansaço e quero entender o próximo passo.",
        consent: {
          ...consent,
          healthDataAccepted: false,
        },
      }),
    ).rejects.toThrow("LGPD consent is required before generating a clarity map from health data.");
    expect(invokeLLMMock).not.toHaveBeenCalled();
    expect(dbMocks.createHealthConversation).not.toHaveBeenCalled();
  });

  it("persists safe clarity journeys under the authenticated user scope", async () => {
    mockSafeSafetyLLM();
    mockValidClarityLLM();
    dbMocks.createHealthConversation.mockResolvedValueOnce({
      id: 101,
      userId: 77,
      channel: "clarity_journey",
    });
    dbMocks.addClinicalMemoryEvent.mockResolvedValueOnce({
      id: 202,
      userId: 77,
      conversationId: 101,
      eventType: "symptom",
      severity: "low",
    });
    dbMocks.saveClarityMap.mockResolvedValueOnce({
      id: 303,
      userId: 77,
      conversationId: 101,
      mainConcern: "Cansaço recorrente para organizar em consulta",
      confidence: "medium",
    });
    const caller = appRouter.createCaller(createContext());

    const result = await caller.clarity.generateMap({
      message: "Tenho cansaço há algumas semanas e quero preparar minha consulta.",
      consent,
    });

    expect(invokeLLMMock).toHaveBeenCalledTimes(2);
    expect(dbMocks.createHealthConversation).toHaveBeenCalledWith(77, expect.objectContaining({
      channel: "clarity_journey",
      initialConcern: "Tenho cansaço há algumas semanas e quero preparar minha consulta.",
    }));
    expect(dbMocks.addClinicalMemoryEvent).toHaveBeenCalledWith(77, expect.objectContaining({
      conversationId: 101,
      source: "patient",
      metadata: expect.objectContaining({
        flow: "clarity_journey",
        clarityAuditStatus: "enhanced",
      }),
    }));
    expect(dbMocks.saveClarityMap).toHaveBeenCalledWith(77, expect.objectContaining({
      conversationId: 101,
      status: "ready_for_review",
      nextStep: expect.stringContaining("profissional habilitado"),
    }));
    expect(result.clarityMap?.id).toBe(303);
    expect(result.aiCallTracking.flow).toBe("clarity_journey");
    expect(result.aiCallTracking.clarityMapEnhanced).toBe(true);
  });

  it("does not persist a clarity map when urgent red flags require escalation", async () => {
    dbMocks.createHealthConversation.mockResolvedValueOnce({
      id: 404,
      userId: 77,
      channel: "clarity_journey",
    });
    dbMocks.addClinicalMemoryEvent.mockResolvedValueOnce({
      id: 505,
      userId: 77,
      conversationId: 404,
      eventType: "symptom",
      severity: "urgent",
    });
    const caller = appRouter.createCaller(createContext());

    const result = await caller.clarity.generateMap({
      message: "Estou com dor no peito e falta de ar desde agora.",
      consent,
    });

    expect(invokeLLMMock).not.toHaveBeenCalled();
    expect(dbMocks.addClinicalMemoryEvent).toHaveBeenCalledWith(77, expect.objectContaining({
      severity: "urgent",
    }));
    expect(dbMocks.saveClarityMap).not.toHaveBeenCalled();
    expect(result.clarityMap).toBeNull();
    expect(result.safety.guardrailDecision).toBe("refuse_and_escalate");
    expect(result.aiCallTracking.clarityAudit.status).toBe("not_attempted_guardrail_limited");
  });
});

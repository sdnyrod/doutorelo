import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  getPatientMemorySummary: vi.fn(),
  listPatientTimeline: vi.fn(),
  savePatientHealthProfile: vi.fn(),
  createHealthConversation: vi.fn(),
  addClinicalMemoryEvent: vi.fn(),
  saveClarityMap: vi.fn(),
}));

vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    getPatientMemorySummary: dbMocks.getPatientMemorySummary,
    listPatientTimeline: dbMocks.listPatientTimeline,
    savePatientHealthProfile: dbMocks.savePatientHealthProfile,
    createHealthConversation: dbMocks.createHealthConversation,
    addClinicalMemoryEvent: dbMocks.addClinicalMemoryEvent,
    saveClarityMap: dbMocks.saveClarityMap,
  };
});

import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";
import { calculateHealthProfileCompleteness, serializeClinicalMetadata } from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 77,
    openId: "patient-memory-sample",
    email: "paciente@example.com",
    name: "Paciente DOUTORELO",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date("2026-05-01T10:00:00.000Z"),
    updatedAt: new Date("2026-05-01T10:00:00.000Z"),
    lastSignedIn: new Date("2026-05-01T10:00:00.000Z"),
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

beforeEach(() => {
  Object.values(dbMocks).forEach((mock) => mock.mockReset());
});

describe("DOUTORELO longitudinal memory contracts", () => {
  it("keeps health profile completeness deterministic and excludes not_informed biological sex", () => {
    expect(calculateHealthProfileCompleteness({})).toBe(0);
    expect(
      calculateHealthProfileCompleteness({
        preferredName: "Ana",
        birthYear: 1988,
        biologicalSex: "not_informed",
        mainGoal: "Dormir melhor",
      }),
    ).toBe(30);
    expect(
      calculateHealthProfileCompleteness({
        preferredName: "Ana",
        birthYear: 1988,
        biologicalSex: "female",
        mainGoal: "Dormir melhor",
        knownConditions: "Hipotireoidismo",
        medications: "Levotiroxina",
        allergies: "Nenhuma conhecida",
        lifestyleNotes: "Sono irregular",
        emotionalContext: "Estresse laboral",
        emergencyNotes: "Sem sinais de alerta atuais",
      }),
    ).toBe(100);
  });

  it("serializes structured metadata before clinical memory persistence", () => {
    expect(serializeClinicalMetadata(undefined)).toBeNull();
    expect(serializeClinicalMetadata(null)).toBeNull();
    expect(serializeClinicalMetadata("texto livre")).toBe("texto livre");
    expect(serializeClinicalMetadata({ clarityMapId: 12, confidence: "medium" })).toBe(
      JSON.stringify({ clarityMapId: 12, confidence: "medium" }),
    );
  });

  it("requires authentication before exposing patient memory summary", async () => {
    const caller = appRouter.createCaller(createAnonymousContext());

    await expect(caller.memory.summary()).rejects.toThrow();
    expect(dbMocks.getPatientMemorySummary).not.toHaveBeenCalled();
  });

  it("scopes memory summary reads to the authenticated user id", async () => {
    dbMocks.getPatientMemorySummary.mockResolvedValueOnce({
      profile: null,
      recentEvents: [],
      recentClarityMaps: [],
      documents: [],
      appointments: [],
      indicators: [],
      consents: [],
    });
    const caller = appRouter.createCaller(createContext());

    const summary = await caller.memory.summary();

    expect(dbMocks.getPatientMemorySummary).toHaveBeenCalledWith(77);
    expect(summary.recentEvents).toEqual([]);
  });

  it("validates and forwards profile saves as protected longitudinal memory", async () => {
    dbMocks.savePatientHealthProfile.mockResolvedValueOnce({
      id: 9,
      userId: 77,
      preferredName: "Ana",
      biologicalSex: "female",
      completenessScore: 40,
    });
    const caller = appRouter.createCaller(createContext());

    const saved = await caller.memory.saveProfile({
      preferredName: "Ana",
      birthYear: 1988,
      biologicalSex: "female",
      mainGoal: "Dormir melhor",
    });

    expect(dbMocks.savePatientHealthProfile).toHaveBeenCalledWith(77, {
      preferredName: "Ana",
      birthYear: 1988,
      biologicalSex: "female",
      mainGoal: "Dormir melhor",
    });
    expect(saved.completenessScore).toBe(40);
  });

  it("rejects invalid profile years before reaching the database", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(
      caller.memory.saveProfile({
        preferredName: "Paciente",
        birthYear: 1800,
      }),
    ).rejects.toThrow();
    expect(dbMocks.savePatientHealthProfile).not.toHaveBeenCalled();
  });

  it("creates a clarity map with a non-prescriptive next step and timeline side effect delegated to the helper", async () => {
    dbMocks.saveClarityMap.mockResolvedValueOnce({
      id: 41,
      userId: 77,
      mainConcern: "Cansaço persistente",
      suggestedSpecialty: "Clínica médica",
      nextStep: "Organizar sintomas e conversar com profissional habilitado.",
      confidence: "medium",
    });
    const caller = appRouter.createCaller(createContext());

    const clarityMap = await caller.memory.saveClarityMap({
      mainConcern: "Cansaço persistente",
      symptoms: "Fadiga no fim do dia",
      patterns: "Piora após noites mal dormidas",
      questionsForDoctor: "Quais exames fazem sentido discutir?",
      suggestedSpecialty: "Clínica médica",
      nextStep: "Organizar sintomas e conversar com profissional habilitado.",
      safetyFlags: null,
      confidence: "medium",
    });

    expect(dbMocks.saveClarityMap).toHaveBeenCalledWith(77, expect.objectContaining({
      mainConcern: "Cansaço persistente",
      confidence: "medium",
    }));
    expect(clarityMap.nextStep).toContain("profissional habilitado");
  });

  it("rejects empty clarity concerns before persistence", async () => {
    const caller = appRouter.createCaller(createContext());

    await expect(caller.memory.saveClarityMap({ mainConcern: " " })).rejects.toThrow();
    expect(dbMocks.saveClarityMap).not.toHaveBeenCalled();
  });

  it("adds patient-authored clinical events with structured metadata under the user scope", async () => {
    const occurredAt = new Date("2026-05-01T14:30:00.000Z");
    dbMocks.addClinicalMemoryEvent.mockResolvedValueOnce({
      id: 55,
      userId: 77,
      eventType: "symptom",
      source: "patient",
      severity: "attention",
      title: "Dor de cabeça recorrente",
      summary: "Três episódios na semana.",
      metadata: JSON.stringify({ trigger: "tela" }),
      occurredAt,
    });
    const caller = appRouter.createCaller(createContext());

    const event = await caller.memory.addEvent({
      eventType: "symptom",
      source: "patient",
      severity: "attention",
      title: "Dor de cabeça recorrente",
      summary: "Três episódios na semana.",
      metadata: { trigger: "tela" },
      occurredAt,
    });

    expect(dbMocks.addClinicalMemoryEvent).toHaveBeenCalledWith(77, expect.objectContaining({
      title: "Dor de cabeça recorrente",
      metadata: { trigger: "tela" },
    }));
    expect(event.severity).toBe("attention");
  });
});

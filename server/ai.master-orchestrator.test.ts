import { describe, expect, it } from "vitest";
import { buildMasterDecision, classifyMasterIntent, hasExplicitProfessionalSuggestionRequest } from "./ai/masterOrchestrator";
import { dayanNetworkProfessionalSeeds } from "./dayanNetworkProfessionalsSeed";

describe("IA Master decision contract", () => {
  it("ALWAYS suggests professionals when DB returned results — no regex gating", () => {
    const decision = buildMasterDecision({
      message: "Recebi meu exame de ferritina e glicemia em PDF, estou cansado e queria entender próximos passos.",
      isAuthenticated: false,
      professionalCandidates: [
        {
          name: "Dra. Helena Duarte Martins",
          specialty: "Medicina integrativa e clínica geral",
          city: "Cianorte",
          state: "PR",
          modality: "both",
          distanceKm: null,
        },
      ],
      productCandidates: [],
    });

    expect(decision.intent).toBe("exam_context");
    // Now ALWAYS suggest_professional when DB returned results — LLM decides relevance
    expect(decision.action).toBe("suggest_professional");
    expect(decision.shouldInterrupt).toBe(false);
    expect(decision.card).not.toBeNull();
    expect(decision.professionalCandidates).toHaveLength(1);
    expect(decision.opportunities.professional).toBe(true);
    expect(decision.animation).toEqual({
      preset: "graceful_suggestion",
      enter: "fade-rise-scale",
      glow: "soft-aura",
      attentionDelayMs: 240,
    });
  });

  it("suggests professionals when user explicitly asks for one", () => {
    const decision = buildMasterDecision({
      message: "Quero agendar com um nutricionista por causa de intestino e peso.",
      isAuthenticated: true,
      city: "Maringá",
      state: "PR",
      professionalCandidates: [
        {
          name: "Nutri. Paola Mendes Vilela",
          specialty: "Nutrição integrativa",
          city: "Maringá",
          state: "PR",
          modality: "both",
          score: 114,
          distanceKm: 2.4,
        },
      ],
      productCandidates: [],
    });

    expect(decision.intent).toBe("appointment_context");
    expect(decision.action).toBe("suggest_professional");
    expect(decision.card?.href).toBe("/diretorio-nacional");
    expect(decision.professionalCandidates).toHaveLength(1);
    expect(decision.professionalCandidates[0]).toMatchObject({
      city: "Maringá",
      state: "PR",
      modality: "both",
    });
  });

  it("hasExplicitProfessionalSuggestionRequest still works as a utility but is NOT a gatekeeper", () => {
    // These are utility checks — they no longer gate the flow
    expect(hasExplicitProfessionalSuggestionRequest("Preciso de boas noites de sono, acordo todas as noites às 3h." )).toBe(false);
    expect(hasExplicitProfessionalSuggestionRequest("Estou em Maringá, tenho cansaço, ansiedade e dificuldade para dormir." )).toBe(false);
    expect(hasExplicitProfessionalSuggestionRequest("Quero um médico perto de mim para avaliar meus exames." )).toBe(true);
    expect(hasExplicitProfessionalSuggestionRequest("Vc pode me dar uma lista de profissionais ligados ao Dayan em Cianorte, PR?" )).toBe(true);
  });

  it("does NOT suggest professionals when DB returned empty results", () => {
    expect(classifyMasterIntent("Olá, bom dia" )).toBe("greeting");

    const decision = buildMasterDecision({
      message: "Olá, bom dia",
      isAuthenticated: false,
      professionalCandidates: [],
      productCandidates: [],
    });

    expect(decision.action).toBe("none");
    expect(decision.card).toBeNull();
    expect(decision.opportunities).toMatchObject({
      signup: false,
      upload: false,
      professional: false,
      product: false,
      form: false,
    });
  });

  it("suggests products when products are available — LLM decides relevance", () => {
    const decision = buildMasterDecision({
      message: "Tenho dificuldade para dormir",
      isAuthenticated: false,
      professionalCandidates: [],
      productCandidates: [
        { id: "1", name: "Kit Sono", category: "apoio de rotina", commercialNotice: "test" },
      ],
    });

    // Products available = opportunity.product is true
    expect(decision.opportunities.product).toBe(true);
    expect(decision.action).toBe("suggest_product");
  });
});

describe("Rede Dayan fictitious professional base", () => {
  const priorityCities = [
    ["Cianorte", "PR"],
    ["Sobral", "CE"],
    ["Maringá", "PR"],
    ["Natal", "RN"],
  ] as const;

  const prioritySpecialties = {
    functionalNutrition: /nutri/i,
    endocrinology: /endo/i,
    dentistry: /odonto/i,
    cardiology: /cardio/i,
    generalPractice: /cl[ií]nica geral|cl[ií]nico geral|medicina integrativa/i,
    pediatrics: /pediatria|pedi[aá]trica/i,
  } as const;

  it("contains at least 30 active geolocated fictional professionals in DEV", () => {
    expect(dayanNetworkProfessionalSeeds.length).toBeGreaterThanOrEqual(30);
    expect(dayanNetworkProfessionalSeeds.every((professional) => professional.active === 1)).toBe(true);
    expect(
      dayanNetworkProfessionalSeeds.every((professional) => Number.isFinite(Number(professional.lat)) && Number.isFinite(Number(professional.lng))),
    ).toBe(true);
  });

  it("covers the priority cities with multiple professionals and priority specialties", () => {
    for (const [city, state] of priorityCities) {
      const professionals = dayanNetworkProfessionalSeeds.filter((professional) => professional.city === city && professional.state === state);

      expect(professionals.length, `${city}-${state} should have a robust DEV base`).toBeGreaterThanOrEqual(12);
      expect(professionals.every((professional) => professional.active === 1)).toBe(true);
      expect(professionals.every((professional) => Number.isFinite(Number(professional.lat)) && Number.isFinite(Number(professional.lng)))).toBe(true);

      for (const [specialtyName, specialtyRegex] of Object.entries(prioritySpecialties)) {
        const matchingProfessionals = professionals.filter((professional) => specialtyRegex.test(professional.specialty));
        expect(matchingProfessionals.length, `${city}-${state} should include ${specialtyName}`).toBeGreaterThanOrEqual(1);
      }
    }
  });
});

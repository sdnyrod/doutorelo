import { describe, expect, it } from "vitest";
import { detectUnsafeClinicalOutput, MEDICAL_DISCLAIMER } from "./ai/clinicalSafety";
import { buildDeterministicMarketplaceRecommendations, MARKETPLACE_RECOMMENDATION_NOTICE } from "./ai/marketplaceRecommendations";

describe("marketplace safe recommendations", () => {
  it("prioritizes available non-restricted items without clinical promises", () => {
    const result = buildDeterministicMarketplaceRecommendations(
      {
        mainGoal: "Quero organizar exames e preparar minha próxima consulta sem esquecer sintomas recentes.",
        lifestyleNotes: "Rotina corrida, sono irregular e dificuldade para reunir documentos.",
      },
      [
        {
          id: 1,
          name: "Organizador de exames e sintomas",
          kind: "service",
          subtitle: "Ajuda a organizar consulta e histórico.",
          description: "Serviço de apoio para reunir exames, sintomas e perguntas.",
          eligibility: "requires_profile",
          availableStock: 4,
          tags: ["consulta", "exames", "organização"],
          featured: true,
        },
        {
          id: 2,
          name: "Produto esgotado",
          kind: "product",
          eligibility: "general",
          availableStock: 0,
          tags: ["rotina"],
        },
        {
          id: 3,
          name: "Item restrito",
          kind: "product",
          eligibility: "restricted",
          availableStock: 10,
          tags: ["tratamento"],
        },
      ],
    );

    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0]?.itemId).toBe(1);
    expect(result.assistantMessage).toMatch(/opcionais/i);
    expect(result.safetyNotice).toBe(MARKETPLACE_RECOMMENDATION_NOTICE);
    expect(result.audit.status).toBe("deterministic_only");

    const renderedText = [
      result.assistantMessage,
      ...result.recommendations.flatMap((recommendation) => [
        recommendation.fitReason,
        recommendation.carefulUseNote,
        recommendation.safetyNotice,
      ]),
      MEDICAL_DISCLAIMER,
    ].join("\n");
    expect(detectUnsafeClinicalOutput(renderedText)).toEqual([]);
  });

  it("returns an empty safe state when no item is eligible", () => {
    const result = buildDeterministicMarketplaceRecommendations(
      { mainGoal: "Quero apoio para rotina." },
      [
        { id: 9, name: "Sem estoque", kind: "product", eligibility: "general", availableStock: 0 },
        { id: 10, name: "Restrito", kind: "service", eligibility: "restricted", availableStock: 2 },
      ],
    );

    expect(result.recommendations).toEqual([]);
    expect(result.assistantMessage).toMatch(/não há itens adequados/i);
    expect(result.audit.postGuardrailViolations).toEqual([]);
  });
});

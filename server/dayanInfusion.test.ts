import { describe, expect, it } from "vitest";
import { buildClinicalSafetyAssessment, detectUnsafeClinicalOutput } from "./ai/clinicalSafety";
import { buildDayanEducationalAnchor, buildDayanInfusionContext, DAYAN_INFUSION_NOTICE } from "./ai/dayanInfusion";
import { buildDeterministicContinuousIntentAnalysis } from "./ai/intentEngine";
import { buildDeterministicIntegrativeClinicalDNA, detectUnsafeIntegrativeDNAOutput } from "./ai/integrativeClinicalDNA";
import { buildDeterministicMarketplaceRecommendations } from "./ai/marketplaceRecommendations";

describe("safe Dayan infusion layer", () => {
  it("creates a compact traceable context from the consolidated Dayan corpus without impersonation", () => {
    const context = buildDayanInfusionContext({
      mode: "intent",
      query: "sono energia metabolismo cansaço",
      limit: 4,
    });

    expect(context.enabled).toBe(true);
    expect(context.sourceCount).toBeGreaterThan(0);
    expect(context.sourceCount).toBeLessThanOrEqual(4);
    expect(context.corpusVersion).toContain("dayan");
    expect(context.promptBlock).toContain("CAMADA DAYAN SEGURA E RASTREÁVEL");
    expect(context.promptBlock).toContain(DAYAN_INFUSION_NOTICE);
    expect(context.promptBlock).toMatch(/não dizer que você é o Dr\. Dayan/i);
    expect(context.sources[0]?.url).toContain("youtube.com/watch");
    expect(context.sources[0]?.excerpt.length).toBeGreaterThan(20);
  });

  it("adds a Dayan educational anchor to the first intent response while preserving clinical disclaimers", () => {
    const message = "Estou sem energia, durmo mal e quero entender minha rotina sem transformar tudo em consulta.";
    const safety = buildClinicalSafetyAssessment({ message, flow: "onboarding_triage" });

    const analysis = buildDeterministicContinuousIntentAnalysis(message, safety);

    expect(analysis.initialResponse).toMatch(/base Dayan consolidada/i);
    expect(analysis.initialResponse).toMatch(/educativa|não substitui/i);
    expect(analysis.initialResponse).not.toMatch(/sou o Dr\.? Dayan|aqui é o Dr\.? Dayan/i);
    expect(detectUnsafeClinicalOutput(analysis.initialResponse)).toEqual([]);
  });

  it("infuses the integrative DNA response with Dayan grounding without prescribing or promising outcomes", () => {
    const result = buildDeterministicIntegrativeClinicalDNA({
      message: "Quero entender metabolismo, sono e energia para organizar perguntas antes da consulta.",
      profileContext: {
        mainGoal: "ter mais disposição",
        lifestyleNotes: "rotina irregular e sono leve",
        recentCareThemes: ["metabolismo", "sono"],
      },
    });

    const joined = [result.assistantMessage, result.integrativeFrame, ...result.questionsToMap, ...result.safetyBoundaries].join("\n");
    expect(result.audit.status).toBe("deterministic_only");
    expect(joined).toMatch(/base Dayan consolidada/i);
    expect(joined).toMatch(/não substitui avaliação médica/i);
    expect(joined).not.toMatch(/tome \d+|protocolo definitivo|garanto resultado|resultado garantido em|cura garantida/i);
    expect(detectUnsafeIntegrativeDNAOutput(joined)).toEqual([]);
  });

  it("limits marketplace infusion to commercial routine support and keeps product suggestions non-prescriptive", () => {
    const result = buildDeterministicMarketplaceRecommendations(
      {
        mainGoal: "organizar sono e rotina",
        lifestyleNotes: "muita tela à noite e pouca consistência nos hábitos",
        recentCareThemes: ["sono", "energia"],
      },
      [
        {
          id: 1,
          name: "Diário de Rotina e Sono",
          subtitle: "Registro de hábitos",
          description: "Ferramenta para organizar observações de sono, energia e rotina.",
          kind: "product",
          eligibility: "general",
          tags: ["sono", "rotina", "organização"],
          featured: true,
          availableStock: 12,
          commercialNotice: "Item opcional de apoio à rotina; não é tratamento.",
          category: { name: "Organização do cuidado", slug: "organizacao" },
        },
        {
          id: 2,
          name: "Consulta Médica Integrativa",
          kind: "service",
          eligibility: "general",
          tags: ["consulta", "cuidado"],
          availableStock: 4,
          category: { name: "Serviços", slug: "servicos" },
        },
      ],
    );

    const joined = [result.assistantMessage, ...result.recommendations.flatMap((item) => [item.fitReason, item.carefulUseNote, item.safetyNotice])].join("\n");
    expect(result.recommendations.length).toBeGreaterThan(0);
    expect(result.assistantMessage).toMatch(/base Dayan consolidada/i);
    expect(joined).toMatch(/opcionais|não substituem|não é tratamento/i);
    expect(joined).not.toMatch(/melhora garantida|cura garantida|use para tratar|deve comprar|prescrevo/i);
    expect(detectUnsafeClinicalOutput(joined)).toEqual([]);
  });

  it("builds an educational anchor only when traceable corpus sources are available", () => {
    const context = buildDayanInfusionContext({
      mode: "clarity",
      query: "intestino energia sono estresse rotina",
      limit: 2,
    });

    const anchor = buildDayanEducationalAnchor(context);

    expect(anchor).toMatch(/base Dayan consolidada/i);
    expect(anchor).toMatch(/sem substituir avaliação profissional/i);
    expect(anchor.length).toBeLessThanOrEqual(360);
  });
});

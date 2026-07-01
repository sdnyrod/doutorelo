import { describe, expect, it } from "vitest";
import { enrichAssistantMessageWithContextualHint } from "./ai/homeChatMaestro";
import type { MasterDecision } from "./ai/masterOrchestrator";

function baseDecision(overrides: Partial<MasterDecision>): MasterDecision {
  return {
    intent: "symptom_context",
    action: "suggest_professional",
    confidence: "high",
    shouldInterrupt: false,
    reason: "Teste de sincronização textual e lateral.",
    card: {
      title: "Posso te aproximar de alguém da Rede Dayan",
      description: "Opções associadas ao contexto.",
      ctaLabel: "Ver profissionais sugeridos",
      href: "/profissionais?source=master",
      visualCue: "soft_pulse",
      priority: "high",
    },
    professionalCandidates: [
      {
        name: "Dra. Patrícia Goulart Neri",
        specialty: "Endocrinologia funcional",
        city: "Maringá",
        state: "PR",
        modality: "both",
        distanceKm: 2.4,
      },
    ],
    productCandidates: [],
    opportunities: { signup: true, upload: false, professional: true, product: false, form: true },
    animation: { preset: "graceful_suggestion", enter: "fade-rise-scale", glow: "soft-aura", attentionDelayMs: 240 },
    ...overrides,
  };
}

describe("enrichAssistantMessageWithContextualHint", () => {
  it("remove defesa crua e injeta menção sutil à Rede Dayan quando há sugestão profissional lateral", () => {
    const polished = enrichAssistantMessageWithContextualHint(
      "Como uma IA, não tenho acesso a profissionais da Rede Dayan. Cansaço, ansiedade e sono ruim merecem ser organizados com calma, olhando rotina, sinais de alerta e histórico.",
      baseDecision({}),
    );

    expect(polished).not.toMatch(/como uma IA|não tenho acesso/i);
    expect(polished).toMatch(/Rede Dayan/);
    expect(polished).toMatch(/Maringá-PR/);
    expect(polished.length).toBeLessThanOrEqual(700);
  });

  it("injeta apoio educativo de rotina sem transformar produto em prescrição", () => {
    const polished = enrichAssistantMessageWithContextualHint(
      "Podemos começar pelo básico: sono, alimentação, estresse e intensidade dos sintomas ajudam a organizar o próximo passo.",
      baseDecision({
        action: "suggest_product",
        card: {
          title: "Uma sugestão comercial pode ajudar sua rotina",
          description: "Opções educativas de autocuidado.",
          ctaLabel: "Ver opções com clareza",
          href: "/marketplace?source=master",
          visualCue: "gentle_glow",
          priority: "medium",
        },
        professionalCandidates: [],
        productCandidates: [{ id: "planner-habitos", name: "Planner Comercial de Hábitos Saudáveis", category: "Educação e organização" }],
      }),
    );

    expect(polished).toMatch(/sugestão educativa de apoio à rotina/i);
    expect(polished).toMatch(/separada de diagnóstico, prescrição ou tratamento/i);
  });
});

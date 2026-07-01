export const v2ExperienceContract = {
  version: "care-os-v7-copy-brasileira",
  language: "pt-BR",
  strategicThesis:
    "DOUTORELO deve falar como uma marca brasileira de saúde confiável: acolhedora, direta, responsável e comercialmente clara, sem parecer tradução, palestra técnica ou promessa milagrosa.",
  creativeReferences: [
    "linguagem cotidiana brasileira para desdobrar a primeira intenção de saúde, organizar histórico e reduzir confusão antes de qualquer próximo passo",
    "polimento de produto e confiança sensorial inspirados em marcas premium norte-americanas",
    "precisão clínica e contenção verbal inspiradas em healthtechs europeias",
  ],
  requiredFirstImpression: {
    mustFeel: ["proprietária", "cinematográfica", "humana", "tecnológica", "brasileira", "não genérica"],
    mustNotFeel: ["template SaaS", "landing básica", "IA preguiçosa", "tradução literal", "cartão genérico com ícones"],
    heroSignature: "jornada-continua-com-contexto",
    productMetaphor: "não recomeçar do zero quando a saúde tem muitos detalhes",
  },
  editorialRules: {
    language: "português brasileiro natural, com autoridade cultural e sem slogans traduzidos",
    externalFacingRule: "toda frase pública deve comunicar benefício direto para o visitante externo, sem jargão de bastidor, filosofia interna ou explicação autocentrada do produto",
    forbiddenPhrases: [
      "Jornada de Clareza",
      "Seu corpo pede escuta",
      "fallback humano",
      "humano no circuito",
      "Política IA",
      "Incerteza declarada",
      "Contexto antes da conduta",
      "IA com critério clínico",
      "Português humano, sem tradução automática",
      "Experiência reconstruída",
      "Guardrail clínico",
      "Mapa de Clareza",
      "clareza sistêmica",
      "memória longitudinal",
      "elo proposition",
      "observatório vivo",
      "Console de continuidade",
      "Carrinho DEV",
      "Checkout DEV",
      "Solicitação DEV",
    ],
    requiredSignals: [
      "Escreva livremente e veja caminhos seguros para continuar.",
      "Seu histórico de saúde reunido em um lugar só.",
      "Consulta é uma possibilidade, não o único destino da jornada.",
      "IA para organizar informações, sem diagnosticar nem prescrever.",
    ],
  },
  visualSystem: {
    palette: {
      deepInk: "#06110f",
      livingInk: "#0a1715",
      luminousHealth: "#d9ff8f",
      clinicalEmerald: "emerald-100/emerald-300 accents",
      warmSignal: "amber accents used as restrained signal, not decoration",
    },
    surfaces: ["alien-hero", "care-orbit", "glass depth", "radial spectral fields", "cinematic dark shell"],
    motion: ["orbit-breathe", "spectral-sweep"],
    accessibility: ["prefers-reduced-motion guarded", "visible focus", "touch-safe bottom navigation"],
  },
  productArchitecture: {
    primaryModules: ["home pública com benefício claro", "jornada contínua com IA", "histórico de saúde", "profissionais com contexto", "segurança clínica"],
    protectedFunctionalAreas: ["jornada contínua", "profissionais", "histórico de saúde", "marketplace", "administração"],
    clinicalResponsibility: "A tecnologia ajuda a organizar contexto, enquanto a decisão permanece na conversa com o profissional.",
  },
} as const;

export type V2ExperienceContract = typeof v2ExperienceContract;

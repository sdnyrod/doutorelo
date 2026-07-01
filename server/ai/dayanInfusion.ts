import { getDayanKnowledgeOverview, searchDayanKnowledge, type DayanSearchResult } from "./dayanKnowledge";

export const DAYAN_INFUSION_POLICY_VERSION = "dayan-infusion-safe-grounding-v0.1";

export const DAYAN_INFUSION_NOTICE =
  "Contexto educativo extraído do corpus consolidado de análises públicas associadas ao Dr. Dayan Siebra. Use como repertório temático rastreável, sem simular identidade pessoal, sem copiar falas, sem diagnóstico, sem prescrição e sem promessa de resultado.";

export type DayanInfusionMode = "intent" | "clarity" | "integrative_dna" | "marketplace";

export type DayanInfusionSource = {
  citation: string;
  videoIndex: number;
  videoId: string;
  title: string;
  url: string;
  section: string;
  theme: string;
  safetyRelevant: boolean;
  excerpt: string;
};

export type DayanInfusionContext = {
  enabled: boolean;
  mode: DayanInfusionMode;
  query: string;
  corpusVersion: string;
  sourceCount: number;
  themes: string[];
  safetyNotice: string;
  compactSummary: string;
  promptBlock: string;
  sources: DayanInfusionSource[];
  reason?: string;
};

export type DayanInfusionInput = {
  mode: DayanInfusionMode;
  query: string;
  extraContext?: string | null;
  limit?: number;
  safetyOnly?: boolean;
  theme?: string | null;
};

function compactText(value: unknown, maxLength = 520): string {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, Math.max(0, maxLength - 1)).trim()}…` : text;
}

function sourceExcerpt(result: DayanSearchResult, maxLength = 520): string {
  return compactText(result.chunk.text, maxLength);
}

function sourceFromResult(result: DayanSearchResult, index: number): DayanInfusionSource {
  return {
    citation: `Base Dayan ${index + 1}`,
    videoIndex: result.chunk.video_index,
    videoId: result.chunk.video_id,
    title: result.chunk.title,
    url: result.chunk.url,
    section: result.chunk.section,
    theme: result.chunk.initial_theme_label,
    safetyRelevant: result.chunk.safety_relevant,
    excerpt: sourceExcerpt(result),
  };
}

function buildQuery(input: DayanInfusionInput): string {
  return [input.query, input.extraContext].map((part) => compactText(part, 900)).filter(Boolean).join(" | ");
}

function inferThemes(sources: DayanInfusionSource[]): string[] {
  const counts = new Map<string, number>();
  for (const source of sources) {
    const theme = compactText(source.theme, 80) || "saúde funcional";
    counts.set(theme, (counts.get(theme) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"))
    .map(([theme]) => theme)
    .slice(0, 5);
}

function buildCompactSummary(mode: DayanInfusionMode, themes: string[], sources: DayanInfusionSource[]): string {
  if (sources.length === 0) {
    return "Sem trechos suficientemente aderentes para enriquecer esta resposta com corpus Dayan rastreável.";
  }
  const themeText = themes.length > 0 ? themes.join(", ") : "saúde funcional";
  const safetyText = sources.some((source) => source.safetyRelevant)
    ? " Inclua cautelas e limites humanos porque há trechos de segurança relevantes."
    : " Preserve limites educativos e incerteza clínica.";
  const modeText: Record<DayanInfusionMode, string> = {
    intent: "Use esse repertório para abrir uma jornada funcional mais inteligente, com investigação de padrões e contexto.",
    clarity: "Use esse repertório para organizar perguntas e lacunas úteis para uma conversa clínica.",
    integrative_dna: "Use esse repertório para reforçar o enquadramento funcional do DOUTORELO sem virar conduta individual.",
    marketplace: "Use esse repertório apenas para linguagem de apoio à rotina e cautela comercial, nunca para vender como tratamento.",
  };
  return compactText(`Temas Dayan recuperados: ${themeText}. ${modeText[mode]}${safetyText}`, 520);
}

function buildPromptBlock(input: DayanInfusionInput, contextQuery: string, sources: DayanInfusionSource[], themes: string[], compactSummary: string): string {
  const sourcePayload = sources.map((source) => ({
    citation: source.citation,
    title: source.title,
    url: source.url,
    section: source.section,
    theme: source.theme,
    safetyRelevant: source.safetyRelevant,
    excerpt: compactText(source.excerpt, 420),
  }));

  return [
    "CAMADA DAYAN SEGURA E RASTREÁVEL",
    DAYAN_INFUSION_NOTICE,
    `Modo de uso: ${input.mode}.`,
    `Consulta temática enviada ao corpus: ${compactText(contextQuery, 900)}`,
    `Síntese operacional: ${compactSummary}`,
    `Temas recuperados: ${themes.join(", ") || "não definido"}.`,
    "Regras obrigatórias: não dizer que você é o Dr. Dayan; não copiar estilo pessoal; não atribuir falas sem citar; não inventar fatos fora dos trechos; não diagnosticar; não prescrever dieta, suplemento, hormônio, medicamento, dose ou tratamento; não prometer cura, emagrecimento ou melhora.",
    "Como usar na resposta: transforme os trechos em perguntas, mapas de contexto, educação simples, sinais de atenção e preparação de conversa com profissional habilitado. Se o corpus não sustentar algo, declare incerteza.",
    `Trechos rastreáveis disponíveis: ${JSON.stringify(sourcePayload)}`,
  ].join("\n");
}

export function buildDayanInfusionContext(input: DayanInfusionInput): DayanInfusionContext {
  const contextQuery = buildQuery(input);
  const overview = getDayanKnowledgeOverview();
  const corpusVersion = overview.corpusVersion;

  if (!contextQuery) {
    return {
      enabled: false,
      mode: input.mode,
      query: "",
      corpusVersion,
      sourceCount: 0,
      themes: [],
      safetyNotice: DAYAN_INFUSION_NOTICE,
      compactSummary: "Sem pergunta ou contexto suficiente para buscar no corpus Dayan.",
      promptBlock: DAYAN_INFUSION_NOTICE,
      sources: [],
      reason: "empty_query",
    };
  }

  try {
    const results = searchDayanKnowledge({
      query: contextQuery,
      limit: input.limit ?? 5,
      safetyOnly: input.safetyOnly,
      theme: input.theme,
    });
    const sources = results.map(sourceFromResult);
    const themes = inferThemes(sources);
    const compactSummary = buildCompactSummary(input.mode, themes, sources);
    const promptBlock = buildPromptBlock(input, contextQuery, sources, themes, compactSummary);

    return {
      enabled: sources.length > 0,
      mode: input.mode,
      query: contextQuery,
      corpusVersion,
      sourceCount: sources.length,
      themes,
      safetyNotice: DAYAN_INFUSION_NOTICE,
      compactSummary,
      promptBlock,
      sources,
      reason: sources.length > 0 ? undefined : "no_matching_sources",
    };
  } catch (error) {
    return {
      enabled: false,
      mode: input.mode,
      query: contextQuery,
      corpusVersion,
      sourceCount: 0,
      themes: [],
      safetyNotice: DAYAN_INFUSION_NOTICE,
      compactSummary: "A camada Dayan não pôde ser carregada; a resposta deve seguir pelos guardrails determinísticos.",
      promptBlock: DAYAN_INFUSION_NOTICE,
      sources: [],
      reason: error instanceof Error ? error.message : "unknown_error",
    };
  }
}

export function buildDayanEducationalAnchor(context: DayanInfusionContext, maxLength = 360): string {
  if (!context.enabled) return "";
  const sourceText = context.sources.slice(0, 2).map((source) => source.citation).join(" e ");
  return compactText(
    `Vou também usar, de forma educativa e rastreável, a base Dayan consolidada (${context.themes.join(", ") || "saúde funcional"}; ${sourceText}), sem substituir avaliação profissional nem transformar conteúdo público em prescrição individual.`,
    maxLength,
  );
}

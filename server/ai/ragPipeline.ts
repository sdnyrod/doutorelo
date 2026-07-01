import { searchDayanKnowledge, type DayanSearchInput, type DayanSearchResult } from "./dayanKnowledge";

export const RAG_PIPELINE_VERSION = "dayan-rag-audit-v1";

export type RagAntiHallucinationStatus = "grounded" | "low_evidence" | "blocked" | "fallback";

export type AuditRagSource = {
  citation: string;
  chunkId: string;
  videoId: string;
  title: string;
  url: string;
  section: string;
  theme: string;
  score: number;
  matchedTerms: string[];
  excerpt: string;
  safetyRelevant: boolean;
};

export type AuditRagContext = {
  query: string;
  pipelineVersion: string;
  status: RagAntiHallucinationStatus;
  sourceCount: number;
  topScore: number;
  themes: string[];
  chunkIds: string[];
  sources: AuditRagSource[];
  promptBlock: string;
  safetyNotice: string;
};

const SAFETY_NOTICE =
  "Grounding educativo: use apenas os trechos recuperados como apoio informativo, sem diagnóstico, prescrição, dose, promessa de cura ou substituição de avaliação profissional.";

function compactExcerpt(text: string, maxLength = 540) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength - 1).trim()}…`;
}

function inferStatus(results: DayanSearchResult[]): RagAntiHallucinationStatus {
  if (results.length === 0) return "low_evidence";
  const topScore = results[0]?.score ?? 0;
  const distinctVideos = new Set(results.map((result) => result.chunk.video_id)).size;
  if (topScore >= 12 && distinctVideos >= 2) return "grounded";
  if (topScore >= 8 && results.length >= 2) return "grounded";
  return "low_evidence";
}

function buildPromptBlock(sources: AuditRagSource[], status: RagAntiHallucinationStatus) {
  if (sources.length === 0) {
    return [
      "RAG Dayan: nenhuma fonte suficientemente aderente foi recuperada.",
      "Regra: diga que a base interna não sustenta uma resposta específica e peça mais contexto, sem inventar conteúdo.",
      SAFETY_NOTICE,
    ].join("\n");
  }

  const sourceLines = sources.map((source, index) => {
    return [
      `[Fonte ${index + 1}] ${source.title}`,
      `Vídeo: ${source.url}`,
      `Seção: ${source.section}`,
      `Tema: ${source.theme}`,
      `Trecho: ${source.excerpt}`,
    ].join(" | ");
  });

  return [
    `RAG Dayan: status=${status}; fontes=${sources.length}; versão=${RAG_PIPELINE_VERSION}.`,
    "Use somente as fontes abaixo para qualquer afirmação atribuída ao corpus. Se faltar evidência, reconheça a limitação.",
    SAFETY_NOTICE,
    ...sourceLines,
  ].join("\n");
}

export function buildAuditRagContext(input: DayanSearchInput): AuditRagContext {
  const query = input.query.trim();
  const results = searchDayanKnowledge({ ...input, limit: Math.min(Math.max(input.limit ?? 6, 1), 10) });
  const sources: AuditRagSource[] = results.map((result, index) => ({
    citation: `Fonte ${index + 1}`,
    chunkId: result.chunk.chunk_id,
    videoId: result.chunk.video_id,
    title: result.chunk.title,
    url: result.chunk.url,
    section: result.chunk.section,
    theme: result.chunk.initial_theme_label,
    score: result.score,
    matchedTerms: result.matchedTerms,
    excerpt: compactExcerpt(result.chunk.text),
    safetyRelevant: result.chunk.safety_relevant,
  }));
  const status = inferStatus(results);
  const themes = Array.from(new Set(sources.flatMap((source) => [source.theme, ...source.matchedTerms]).filter(Boolean))).slice(0, 12);

  return {
    query,
    pipelineVersion: RAG_PIPELINE_VERSION,
    status,
    sourceCount: sources.length,
    topScore: sources[0]?.score ?? 0,
    themes,
    chunkIds: sources.map((source) => source.chunkId),
    sources,
    promptBlock: buildPromptBlock(sources, status),
    safetyNotice: SAFETY_NOTICE,
  };
}

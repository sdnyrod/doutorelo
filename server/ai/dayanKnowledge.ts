import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { invokeLLM } from "../_core/llm";

export type DayanKnowledgeChunk = {
  chunk_id: string;
  source: string;
  video_index: number;
  video_id: string;
  title: string;
  url: string;
  duration_string: string;
  initial_theme: string;
  initial_theme_label: string;
  query_themes: string[];
  section: string;
  text: string;
  word_count: number;
  safety_relevant: boolean;
};

export type DayanCorpusStats = {
  valid_videos: number;
  excluded_or_failed_videos: number;
  chunks: number;
  total_words: number;
  average_words_per_valid_video: number;
  safety_relevant_chunks: number;
  themes: Record<string, number>;
  query_themes: Record<string, number>;
};

type DayanFailedVideo = {
  index?: number;
  video_index?: number;
  video_id?: string;
  title?: string;
  url?: string;
  reason?: string;
  status?: string;
  word_count?: number;
};

export type DayanSearchInput = {
  query: string;
  limit?: number;
  theme?: string | null;
  safetyOnly?: boolean;
};

export type DayanSearchResult = {
  chunk: DayanKnowledgeChunk;
  score: number;
  matchedTerms: string[];
  citation: string;
};

export type DayanAnswerResult = {
  answer: string;
  sources: Array<{
    citation: string;
    videoIndex: number;
    videoId: string;
    title: string;
    url: string;
    section: string;
    theme: string;
    safetyRelevant: boolean;
    excerpt: string;
  }>;
  safetyNotice: string;
  retrieval: {
    query: string;
    totalChunks: number;
    returnedChunks: number;
    corpusVersion: string;
    failedVideos: DayanFailedVideo[];
  };
};

const CORPUS_VERSION = "dayan-public-youtube-analysis-2026-05-02";
const SAFETY_NOTICE =
  "Base educativa derivada de análises de vídeos públicos. Não emite diagnóstico, prescrição ou conduta individual. Em sinais de alerta, uso de medicamentos, gestação, doenças crônicas, crianças, idosos ou piora clínica, a orientação deve ser avaliação por profissional habilitado ou serviço de urgência.";

const STOPWORDS = new Set([
  "a", "as", "ao", "aos", "o", "os", "de", "da", "das", "do", "dos", "e", "em", "no", "na", "nos", "nas", "um", "uma", "uns", "umas", "por", "para", "com", "sem", "sobre", "que", "qual", "quais", "como", "quando", "onde", "porque", "pra", "pro", "pela", "pelo", "pelas", "pelos", "mais", "menos", "muito", "muita", "muitos", "muitas", "se", "eu", "me", "minha", "meu", "minhas", "meus", "voce", "voces", "ele", "ela", "eles", "elas", "isso", "isto", "esse", "essa", "esses", "essas", "este", "esta", "ser", "ter", "fazer", "pode", "posso", "devo", "tem", "the", "and", "or", "of", "to", "in", "for", "with", "without", "what", "how", "why", "when",
]);

const SAFETY_TERMS = new Set([
  "risco", "riscos", "alerta", "alertas", "contraindicacao", "contraindicacoes", "contraindicado", "perigo", "urgencia", "emergencia", "medico", "medica", "profissional", "diagnostico", "prescricao", "medicamento", "medicamentos", "dose", "doses", "gestante", "gestacao", "gravidez", "crianca", "idoso", "cancer", "diabetes", "hipertensao", "dor", "sangramento", "falta", "ar",
]);

let chunksCache: DayanKnowledgeChunk[] | null = null;
let statsCache: DayanCorpusStats | null = null;
let failedCache: DayanFailedVideo[] | null = null;

function corpusPath(fileName: string) {
  const moduleDir = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    resolve(process.cwd(), "research/dayan/corpus/consolidated", fileName),
    resolve(moduleDir, "../../research/dayan/corpus/consolidated", fileName),
    resolve(moduleDir, "../research/dayan/corpus/consolidated", fileName),
  ];
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error(`Corpus consolidado do Dr. Dayan não encontrado: ${fileName}`);
  }
  return found;
}

function readJson<T>(fileName: string): T {
  return JSON.parse(readFileSync(corpusPath(fileName), "utf8")) as T;
}

export function loadDayanKnowledgeChunks() {
  if (chunksCache) return chunksCache;
  const raw = readFileSync(corpusPath("dayan_knowledge_chunks.jsonl"), "utf8");
  chunksCache = raw
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line) as DayanKnowledgeChunk);
  return chunksCache;
}

export function getDayanCorpusStats() {
  if (!statsCache) statsCache = readJson<DayanCorpusStats>("dayan_corpus_stats.json");
  return statsCache;
}

export function getDayanFailedVideos() {
  if (!failedCache) failedCache = readJson<DayanFailedVideo[]>("dayan_failed_or_excluded.json");
  return failedCache;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function tokenize(value: string) {
  return Array.from(new Set(
    normalizeText(value)
      .split(/[^a-z0-9]+/i)
      .map((token) => token.trim())
      .filter((token) => token.length >= 3 && !STOPWORDS.has(token)),
  ));
}

function countOccurrences(haystack: string, needle: string) {
  if (!needle) return 0;
  const pattern = new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "g");
  return haystack.match(pattern)?.length ?? 0;
}

function citationFor(chunk: DayanKnowledgeChunk) {
  return `Vídeo ${String(chunk.video_index).padStart(3, "0")} · ${chunk.title} · seção ${chunk.section}`;
}

function excerpt(text: string, maxLength = 520) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= maxLength) return compact;
  return `${compact.slice(0, maxLength - 1).trim()}…`;
}

export function searchDayanKnowledge(input: DayanSearchInput): DayanSearchResult[] {
  const query = input.query.trim();
  const tokens = tokenize(query);
  const safetyQuestion = tokens.some((token) => SAFETY_TERMS.has(token));
  const normalizedTheme = input.theme ? normalizeText(input.theme) : null;
  const limit = Math.min(Math.max(input.limit ?? 8, 1), 20);

  if (!query || tokens.length === 0) return [];

  const scored = loadDayanKnowledgeChunks()
    .filter((chunk) => !input.safetyOnly || chunk.safety_relevant)
    .filter((chunk) => {
      if (!normalizedTheme) return true;
      return normalizeText(`${chunk.initial_theme} ${chunk.initial_theme_label} ${chunk.query_themes.join(" ")}`).includes(normalizedTheme);
    })
    .map((chunk) => {
      const title = normalizeText(chunk.title);
      const text = normalizeText(chunk.text);
      const section = normalizeText(chunk.section);
      const themes = normalizeText(`${chunk.initial_theme} ${chunk.initial_theme_label} ${chunk.query_themes.join(" ")}`);
      const matchedTerms: string[] = [];
      let score = 0;

      for (const token of tokens) {
        let tokenScore = 0;
        if (title.includes(token)) tokenScore += 9;
        if (section.includes(token)) tokenScore += 4;
        if (themes.includes(token)) tokenScore += 5;
        tokenScore += Math.min(countOccurrences(text, token), 6) * 2;
        if (tokenScore > 0) matchedTerms.push(token);
        score += tokenScore;
      }

      if (chunk.safety_relevant && safetyQuestion) score += 6;
      if (chunk.safety_relevant && input.safetyOnly) score += 3;
      if (chunk.section.includes("alertas") || chunk.section.includes("contraindicacoes")) score += safetyQuestion ? 5 : 1;
      if (chunk.section.includes("resumo") || chunk.section.includes("recomendacoes")) score += 1;

      return { chunk, score, matchedTerms, citation: citationFor(chunk) } satisfies DayanSearchResult;
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || b.chunk.word_count - a.chunk.word_count);

  const selected: DayanSearchResult[] = [];
  const perVideo = new Map<string, number>();
  for (const result of scored) {
    const count = perVideo.get(result.chunk.video_id) ?? 0;
    if (count >= 3) continue;
    selected.push(result);
    perVideo.set(result.chunk.video_id, count + 1);
    if (selected.length >= limit) break;
  }

  return selected;
}

function buildDeterministicAnswer(question: string, results: DayanSearchResult[]) {
  if (results.length === 0) {
    return [
      "Não encontrei trechos suficientemente aderentes no corpus consolidado do Dr. Dayan para responder com rastreabilidade adequada.",
      "A conduta segura é reformular a pergunta com sintomas, tema ou alimento específico, mantendo a decisão clínica com profissional habilitado.",
      SAFETY_NOTICE,
    ].join("\n\n");
  }

  const sourceSummary = results.slice(0, 5).map((result, index) => {
    return `Fonte ${index + 1}: ${result.citation}. Trecho relevante: ${excerpt(result.chunk.text, 380)}`;
  }).join("\n\n");

  return [
    `Com base no corpus consolidado, a pergunta "${question}" se relaciona principalmente aos seguintes trechos rastreáveis.`,
    sourceSummary,
    "Síntese segura: use esses pontos como educação e preparação de conversa, não como diagnóstico, prescrição ou substituição de avaliação individual. Se houver sinais de alerta, doenças crônicas, medicamentos em uso, gestação, crianças, idosos ou piora clínica, a decisão deve ser tomada com profissional habilitado.",
  ].join("\n\n");
}

export async function answerDayanKnowledgeQuestion(input: DayanSearchInput): Promise<DayanAnswerResult> {
  const results = searchDayanKnowledge({ ...input, limit: input.limit ?? 8 });
  const sourcePayload = results.slice(0, 8).map((result, index) => ({
    sourceNumber: index + 1,
    citation: result.citation,
    title: result.chunk.title,
    url: result.chunk.url,
    section: result.chunk.section,
    theme: result.chunk.initial_theme_label,
    safetyRelevant: result.chunk.safety_relevant,
    excerpt: excerpt(result.chunk.text, 780),
  }));

  let answer = buildDeterministicAnswer(input.query, results);

  if (sourcePayload.length > 0) {
    try {
      const llm = await invokeLLM({
        messages: [
          {
            role: "system",
            content: [
              "Você é a IA educativa do DOUTORELO usando apenas o corpus rastreável de análises públicas do Dr. Dayan Siebra.",
              "Responda em português claro, com tom prudente e clínico-educativo.",
              "Não diagnostique, não prescreva, não recomende dose individual, não prometa cura e não substitua avaliação médica.",
              "Quando houver risco, medicamentos, doenças crônicas, gestação, crianças, idosos ou sinais de alerta, recomende avaliação profissional.",
              "Cite as fontes no texto como [Fonte 1], [Fonte 2] conforme os trechos fornecidos. Se o corpus não sustentar uma afirmação, diga que não há base suficiente no corpus.",
            ].join("\n"),
          },
          {
            role: "user",
            content: `Pergunta do usuário: ${input.query}\n\nTrechos recuperados do corpus:\n${JSON.stringify(sourcePayload, null, 2)}\n\nAviso obrigatório: ${SAFETY_NOTICE}`,
          },
        ],
        maxTokens: 2200,
      });
      const content = llm.choices[0]?.message.content;
      if (typeof content === "string" && content.trim().length > 80) {
        answer = content.trim();
      }
    } catch {
      answer = buildDeterministicAnswer(input.query, results);
    }
  }

  return {
    answer,
    sources: sourcePayload.map((source, index) => ({
      citation: `Fonte ${index + 1}`,
      videoIndex: results[index].chunk.video_index,
      videoId: results[index].chunk.video_id,
      title: source.title,
      url: source.url,
      section: source.section,
      theme: source.theme,
      safetyRelevant: source.safetyRelevant,
      excerpt: source.excerpt,
    })),
    safetyNotice: SAFETY_NOTICE,
    retrieval: {
      query: input.query,
      totalChunks: loadDayanKnowledgeChunks().length,
      returnedChunks: sourcePayload.length,
      corpusVersion: CORPUS_VERSION,
      failedVideos: getDayanFailedVideos(),
    },
  };
}

export function getDayanKnowledgeOverview() {
  const stats = getDayanCorpusStats();
  return {
    corpusVersion: CORPUS_VERSION,
    stats,
    failedVideos: getDayanFailedVideos(),
    safetyNotice: SAFETY_NOTICE,
    availableThemes: Object.entries(stats.themes).map(([id, count]) => ({ id, count })),
    availableQueryThemes: Object.entries(stats.query_themes).map(([id, count]) => ({ id, count })),
  };
}

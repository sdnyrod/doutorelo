import { invokeLLM, type InvokeResult } from "../_core/llm";
import { detectUnsafeClinicalOutput, MEDICAL_DISCLAIMER } from "./clinicalSafety";
import { buildDayanEducationalAnchor, buildDayanInfusionContext, type DayanInfusionContext } from "./dayanInfusion";

export const MARKETPLACE_RECOMMENDATION_SCHEMA_NAME = "marketplace_safe_recommendations_v1";
export const MARKETPLACE_RECOMMENDATION_POLICY_VERSION = "marketplace-commercial-safety-v0.1";

export const MARKETPLACE_RECOMMENDATION_NOTICE =
  "Sugestões comerciais opcionais. Não são prescrição, diagnóstico, tratamento, promessa de resultado ou substituto de avaliação profissional.";

export type MarketplaceRecommendationAuditStatus =
  | "enhanced"
  | "fallback_llm_error"
  | "fallback_empty_response"
  | "fallback_invalid_json"
  | "fallback_invalid_schema"
  | "fallback_post_guardrail_violation"
  | "deterministic_only";

export type MarketplaceRecommendationCandidate = {
  id: number;
  name: string;
  subtitle?: string | null;
  description?: string | null;
  kind?: "product" | "service" | string;
  eligibility?: string | null;
  tags?: string[] | string | null;
  featured?: number | boolean | null;
  availableStock?: number | null;
  commercialNotice?: string | null;
  category?: { name?: string | null; slug?: string | null } | null;
};

export type MarketplacePatientContext = {
  mainGoal?: string | null;
  knownConditions?: string | null;
  medications?: string | null;
  allergies?: string | null;
  lifestyleNotes?: string | null;
  emotionalContext?: string | null;
  recentCareThemes?: string[];
};

export type SafeMarketplaceRecommendation = {
  itemId: number;
  itemName: string;
  fitReason: string;
  carefulUseNote: string;
  safetyNotice: string;
  confidence: "low" | "medium";
};

export type SafeMarketplaceRecommendationResult = {
  recommendations: SafeMarketplaceRecommendation[];
  assistantMessage: string;
  audit: {
    attempted: boolean;
    status: MarketplaceRecommendationAuditStatus;
    reason?: string;
    policyVersion: string;
    postGuardrailViolations: string[];
  };
  safetyNotice: string;
};

const MARKETPLACE_RECOMMENDATION_RESPONSE_SCHEMA = {
  name: MARKETPLACE_RECOMMENDATION_SCHEMA_NAME,
  strict: true,
  schema: {
    type: "object",
    properties: {
      assistantMessage: {
        type: "string",
        description: "Mensagem curta em português brasileiro, comercial e não prescritiva, explicando que as sugestões são opcionais.",
      },
      recommendations: {
        type: "array",
        minItems: 1,
        maxItems: 3,
        items: {
          type: "object",
          properties: {
            itemId: { type: "integer" },
            itemName: { type: "string" },
            fitReason: { type: "string" },
            carefulUseNote: { type: "string" },
            confidence: { type: "string", enum: ["low", "medium"] },
          },
          required: ["itemId", "itemName", "fitReason", "carefulUseNote", "confidence"],
          additionalProperties: false,
        },
      },
    },
    required: ["assistantMessage", "recommendations"],
    additionalProperties: false,
  },
} as const;

function normalize(value: unknown): string {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function compactText(value: unknown, maxLength = 420): string | null {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return null;
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

function tagsToText(tags: MarketplaceRecommendationCandidate["tags"]): string {
  if (Array.isArray(tags)) return tags.join(", ");
  return String(tags ?? "");
}

function buildContextText(context: MarketplacePatientContext): string {
  return [
    compactText(context.mainGoal),
    compactText(context.knownConditions),
    compactText(context.lifestyleNotes),
    compactText(context.emotionalContext),
    ...(context.recentCareThemes ?? []).map((theme) => compactText(theme, 120)),
  ]
    .filter(Boolean)
    .join(" | ");
}

function scoreCandidate(candidate: MarketplaceRecommendationCandidate, contextText: string): number {
  const haystack = normalize([
    candidate.name,
    candidate.subtitle,
    candidate.description,
    candidate.category?.name,
    tagsToText(candidate.tags),
  ].filter(Boolean).join(" "));
  const context = normalize(contextText);
  const weightedTerms = [
    "consulta",
    "exame",
    "organiza",
    "rotina",
    "sono",
    "estresse",
    "monitoramento",
    "cuidado",
    "bem-estar",
    "bem estar",
    "energia",
    "fadiga",
    "sintoma",
  ];
  let score = candidate.featured ? 4 : 0;
  if ((candidate.availableStock ?? 1) <= 0) score -= 20;
  if (candidate.eligibility === "general") score += 2;
  if (candidate.eligibility === "requires_profile") score += contextText ? 2 : -2;
  for (const term of weightedTerms) {
    if (context.includes(normalize(term)) && haystack.includes(normalize(term))) score += 3;
  }
  for (const rawToken of context.split(/\W+/).filter((token) => token.length >= 5).slice(0, 30)) {
    if (haystack.includes(rawToken)) score += 1;
  }
  return score;
}

function sanitizeRecommendation(candidate: MarketplaceRecommendationCandidate, fitReason: string | null, carefulUseNote: string | null, confidence: unknown): SafeMarketplaceRecommendation {
  return {
    itemId: candidate.id,
    itemName: candidate.name,
    fitReason: compactText(fitReason, 320) ?? "Pode ajudar a organizar sua rotina de cuidado sem substituir uma conversa com profissional de saúde.",
    carefulUseNote: compactText(carefulUseNote, 260) ?? "Confira se o item faz sentido para sua rotina e converse com um profissional se houver dúvida clínica.",
    safetyNotice: candidate.commercialNotice ?? MARKETPLACE_RECOMMENDATION_NOTICE,
    confidence: confidence === "medium" ? "medium" : "low",
  };
}

export function buildDeterministicMarketplaceRecommendations(
  context: MarketplacePatientContext,
  catalog: MarketplaceRecommendationCandidate[],
): SafeMarketplaceRecommendationResult {
  const contextText = buildContextText(context);
  const eligible = catalog
    .filter((item) => (item.availableStock ?? 1) > 0)
    .filter((item) => item.eligibility !== "restricted")
    .sort((a, b) => scoreCandidate(b, contextText) - scoreCandidate(a, contextText))
    .slice(0, 3);

  const dayanContext = buildDayanInfusionContext({ mode: "marketplace", query: contextText || "rotina de cuidado", extraContext: eligible.map((item) => `${item.name} ${item.category?.name ?? ""} ${tagsToText(item.tags)}`).join(" | "), limit: 4 });
  const dayanAnchor = buildDayanEducationalAnchor(dayanContext, 300);

  const recommendations = eligible.map((item) => sanitizeRecommendation(
    item,
    item.kind === "service"
      ? `Serviço opcional para apoiar organização e acompanhamento do cuidado, sem orientar diagnóstico ou conduta.`
      : `Item opcional que pode apoiar organização, conforto ou rotina de cuidado, sem promessa de resultado clínico.`,
    `Use como apoio prático. Para sintomas, medicamentos, exames ou mudança de conduta, mantenha avaliação com profissional habilitado.`,
    contextText ? "medium" : "low",
  ));

  return {
    recommendations,
    assistantMessage: recommendations.length > 0
      ? ["Separei opções comerciais de apoio à rotina e à organização do cuidado. Elas são opcionais e não substituem avaliação profissional.", dayanAnchor].filter(Boolean).join("\n\n")
      : "Ainda não há itens adequados para sugerir com segurança neste momento.",
    audit: {
      attempted: false,
      status: "deterministic_only",
      policyVersion: MARKETPLACE_RECOMMENDATION_POLICY_VERSION,
      postGuardrailViolations: [],
    },
    safetyNotice: MARKETPLACE_RECOMMENDATION_NOTICE,
  };
}

function extractLLMTextContent(result: InvokeResult): string | null {
  const content = result.choices[0]?.message.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .filter((part): part is { type: "text"; text: string } => part.type === "text")
      .map((part) => part.text)
      .join("\n")
      .trim();
  }
  return null;
}

function parseStructuredRecommendation(content: string):
  | { ok: true; value: { assistantMessage: string; recommendations: Array<{ itemId: number; itemName: string; fitReason: string; carefulUseNote: string; confidence: "low" | "medium" }> } }
  | { ok: false; status: "fallback_invalid_json" | "fallback_invalid_schema"; reason: string } {
  try {
    const value = JSON.parse(content) as unknown;
    if (!value || typeof value !== "object") {
      return { ok: false, status: "fallback_invalid_schema", reason: "Payload is not an object." };
    }
    const payload = value as { assistantMessage?: unknown; recommendations?: unknown };
    if (typeof payload.assistantMessage !== "string" || !Array.isArray(payload.recommendations)) {
      return { ok: false, status: "fallback_invalid_schema", reason: "Missing assistantMessage or recommendations." };
    }
    const recommendations = payload.recommendations.filter((entry): entry is { itemId: number; itemName: string; fitReason: string; carefulUseNote: string; confidence: "low" | "medium" } => {
      const candidate = entry as Record<string, unknown>;
      return Number.isInteger(candidate.itemId)
        && typeof candidate.itemName === "string"
        && typeof candidate.fitReason === "string"
        && typeof candidate.carefulUseNote === "string"
        && (candidate.confidence === "low" || candidate.confidence === "medium");
    });
    if (recommendations.length === 0) {
      return { ok: false, status: "fallback_invalid_schema", reason: "No valid recommendation entries." };
    }
    return { ok: true, value: { assistantMessage: payload.assistantMessage, recommendations } };
  } catch {
    return { ok: false, status: "fallback_invalid_json", reason: "Response is not valid JSON." };
  }
}

function buildMarketplaceRecommendationPrompt(context: MarketplacePatientContext, catalog: MarketplaceRecommendationCandidate[], dayanContext: DayanInfusionContext): string {
  const safeContext = {
    mainGoal: compactText(context.mainGoal),
    knownConditions: compactText(context.knownConditions),
    medications: context.medications ? "informado pelo paciente; não usar para sugerir conduta, dose ou substituição" : null,
    allergies: context.allergies ? "informado pelo paciente; reforçar checagem de rótulo e avaliação profissional" : null,
    lifestyleNotes: compactText(context.lifestyleNotes),
    emotionalContext: compactText(context.emotionalContext),
    recentCareThemes: context.recentCareThemes?.map((theme) => compactText(theme, 120)).filter(Boolean).slice(0, 5),
  };
  const safeCatalog = catalog.slice(0, 20).map((item) => ({
    id: item.id,
    name: item.name,
    kind: item.kind,
    category: item.category?.name ?? null,
    subtitle: compactText(item.subtitle, 180),
    tags: tagsToText(item.tags),
    eligibility: item.eligibility,
    availableStock: item.availableStock,
  }));
  return [
    "Escolha até 3 itens comerciais opcionais do marketplace DOUTORELO.",
    "Use português brasileiro natural. Não use linguagem prescritiva, diagnóstica, causal, terapêutica ou promessa de melhora.",
    "Não recomende medicamento, dose, suplemento, tratamento, substituição de consulta ou conduta clínica.",
    "Se mencionar condições, sintomas, medicamentos ou alergias, faça apenas como cautela para conversar com profissional habilitado.",
    "Inclua a ideia de que as sugestões são apoio de organização/rotina e não substituem avaliação profissional.",
    `Aviso obrigatório: ${MARKETPLACE_RECOMMENDATION_NOTICE} ${MEDICAL_DISCLAIMER}`,
    dayanContext.promptBlock,
    "A camada Dayan, quando presente, só pode influenciar linguagem educativa de rotina, organização, prudência e cautela; nunca pode justificar indicação de produto como tratamento.",
    `Contexto resumido do paciente: ${JSON.stringify(safeContext)}`,
    `Catálogo disponível: ${JSON.stringify(safeCatalog)}`,
  ].join("\n");
}

function withFallback(
  fallback: SafeMarketplaceRecommendationResult,
  status: MarketplaceRecommendationAuditStatus,
  reason: string,
  violations: string[] = [],
): SafeMarketplaceRecommendationResult {
  return {
    ...fallback,
    audit: {
      attempted: status !== "deterministic_only",
      status,
      reason,
      policyVersion: MARKETPLACE_RECOMMENDATION_POLICY_VERSION,
      postGuardrailViolations: violations,
    },
  };
}

export async function buildSafeMarketplaceRecommendationsWithLLM(
  context: MarketplacePatientContext,
  catalog: MarketplaceRecommendationCandidate[],
): Promise<SafeMarketplaceRecommendationResult> {
  const fallback = buildDeterministicMarketplaceRecommendations(context, catalog);
  if (fallback.recommendations.length === 0) return fallback;
  const dayanContext = buildDayanInfusionContext({
    mode: "marketplace",
    query: buildContextText(context) || "rotina de cuidado",
    extraContext: catalog.slice(0, 12).map((item) => `${item.name} ${item.category?.name ?? ""} ${tagsToText(item.tags)}`).join(" | "),
    limit: 4,
  });

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: [
            "Você é um curador comercial cauteloso do marketplace DOUTORELO.",
            "Você só pode sugerir itens opcionais de apoio à organização, rotina e preparo de cuidado.",
            "Você nunca diagnostica, prescreve, promete benefício clínico, indica tratamento ou substitui profissional de saúde.",
            "Responda exclusivamente no JSON Schema solicitado.",
          ].join(" "),
        },
        { role: "user", content: buildMarketplaceRecommendationPrompt(context, catalog, dayanContext) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: MARKETPLACE_RECOMMENDATION_RESPONSE_SCHEMA,
      },
    });

    const content = extractLLMTextContent(response);
    if (!content) return withFallback(fallback, "fallback_empty_response", "LLM returned an empty content payload.");
    const parsed = parseStructuredRecommendation(content);
    if (!parsed.ok) return withFallback(fallback, parsed.status, parsed.reason);

    const byId = new Map(catalog.map((item) => [item.id, item]));
    const recommendations = parsed.value.recommendations
      .map((entry) => {
        const candidate = byId.get(entry.itemId);
        if (!candidate || candidate.eligibility === "restricted" || (candidate.availableStock ?? 1) <= 0) return null;
        return sanitizeRecommendation(candidate, entry.fitReason, entry.carefulUseNote, entry.confidence);
      })
      .filter((entry): entry is SafeMarketplaceRecommendation => Boolean(entry))
      .slice(0, 3);

    if (recommendations.length === 0) return withFallback(fallback, "fallback_invalid_schema", "LLM selected unavailable or invalid catalog items.");

    const safetyText = [
      parsed.value.assistantMessage,
      ...recommendations.flatMap((entry) => [entry.fitReason, entry.carefulUseNote, entry.safetyNotice]),
      MARKETPLACE_RECOMMENDATION_NOTICE,
      MEDICAL_DISCLAIMER,
    ].join("\n");
    const postGuardrailViolations = detectUnsafeClinicalOutput(safetyText);
    if (postGuardrailViolations.length > 0) {
      return withFallback(fallback, "fallback_post_guardrail_violation", "LLM output failed commercial clinical-safety scan.", postGuardrailViolations);
    }

    return {
      recommendations,
      assistantMessage: compactText(parsed.value.assistantMessage, 500) ?? fallback.assistantMessage,
      audit: {
        attempted: true,
        status: "enhanced",
        policyVersion: MARKETPLACE_RECOMMENDATION_POLICY_VERSION,
        postGuardrailViolations: [],
      },
      safetyNotice: MARKETPLACE_RECOMMENDATION_NOTICE,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown LLM error.";
    return withFallback(fallback, "fallback_llm_error", message);
  }
}

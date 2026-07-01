import { invokeLLM, type InvokeResult } from "../_core/llm";
import {
  CLINICAL_POLICY_VERSION,
  MEDICAL_DISCLAIMER,
  type ClinicalSafetyAssessment,
  containsPrescriptionRequest,
} from "./clinicalSafety";
import { buildDayanEducationalAnchor, buildDayanInfusionContext, type DayanInfusionContext } from "./dayanInfusion";

export type ClarityJourneyConfidence = "low" | "medium" | "high";

export type ClarityMapDraft = {
  mainConcern: string;
  symptoms: string | null;
  patterns: string | null;
  questionsForDoctor: string | null;
  suggestedSpecialty: string | null;
  nextStep: string;
  safetyFlags: string | null;
  confidence: ClarityJourneyConfidence;
};

export type ClarityMapDraftAuditStatus =
  | "not_attempted_guardrail_limited"
  | "enhanced"
  | "fallback_llm_error"
  | "fallback_empty_response"
  | "fallback_invalid_json"
  | "fallback_invalid_schema"
  | "fallback_post_guardrail_violation";

export type ClarityMapDraftAudit = {
  attempted: boolean;
  status: ClarityMapDraftAuditStatus;
  reason: string | null;
  promptId: typeof CLARITY_MAP_PROMPT_ID;
  schemaName: typeof CLARITY_MAP_SCHEMA_NAME;
  policyVersion: typeof CLINICAL_POLICY_VERSION;
  postGuardrailViolations: string[];
};

export type ClarityMapDraftResult = {
  draft: ClarityMapDraft;
  assistantMessage: string;
  audit: ClarityMapDraftAudit;
};

export const CLARITY_MAP_SCHEMA_NAME = "clarity_map_structured_response_v1";
export const CLARITY_MAP_PROMPT_ID = "clarity_map_generation_prompt_v0";

const CLARITY_TEXT_MAX = 3000;
const MAIN_CONCERN_MAX = 240;
const SPECIALTY_MAX = 140;

const CERTAINTY_OR_DIAGNOSIS_PATTERNS = [
  /\b(você|voce)\s+tem\b/i,
  /\bdiagnóstico\s+é\b/i,
  /\bdiagnostico\s+e\b/i,
  /\bcom certeza\b/i,
  /\b100%\b/i,
  /\bgarantido\b/i,
];

const PRESCRIPTIVE_OUTPUT_PATTERN = /\b(tome|tomar\s+\d+|usar\s+\d+|mg\b|ml\b|comprimido|cápsula|capsula)\b/i;

export const CLARITY_MAP_SYSTEM_PROMPT = `Você é o copiloto de clareza do DOUTORELO. Sua função é transformar uma mensagem do paciente em um Mapa de Clareza para consulta médica, sem diagnosticar, prescrever, prometer causa, sugerir dose, tratamento, medicamento, suplemento ou conduta individualizada. O mapa deve organizar informações, indicar incertezas e orientar conversa com profissional habilitado. Se faltar contexto, preserve a incerteza e gere perguntas úteis. Responda somente em JSON válido conforme o schema.`;

export const CLARITY_MAP_RESPONSE_SCHEMA = {
  name: CLARITY_MAP_SCHEMA_NAME,
  strict: true,
  schema: {
    type: "object",
    properties: {
      mainConcern: {
        type: "string",
        description: "Preocupação principal resumida em português, sem diagnóstico e com no máximo 240 caracteres.",
      },
      symptoms: {
        type: ["string", "null"],
        description: "Sintomas, duração, intensidade e evolução citados pelo usuário, sem inventar fatos.",
      },
      patterns: {
        type: ["string", "null"],
        description: "Padrões, gatilhos, melhora, piora, rotina ou lacunas objetivas. Não inventar.",
      },
      questionsForDoctor: {
        type: ["string", "null"],
        description: "Perguntas prudentes para levar a profissional habilitado, sem pedir prescrição específica.",
      },
      suggestedSpecialty: {
        type: ["string", "null"],
        description: "Especialidade ampla possível para discussão, nunca encaminhamento definitivo.",
      },
      nextStep: {
        type: "string",
        description: "Próximo passo seguro, educativo e não prescritivo, preferindo organizar dados e conversar com profissional habilitado.",
      },
      safetyFlags: {
        type: ["string", "null"],
        description: "Sinais de atenção, limites de segurança, incertezas ou necessidade de urgência/humano no circuito.",
      },
      confidence: {
        type: "string",
        enum: ["low", "medium", "high"],
        description: "Confiança na organização do mapa, nunca certeza clínica.",
      },
      assistantMessage: {
        type: "string",
        description: "Mensagem acolhedora ao paciente com disclaimer explícito de que não substitui avaliação médica.",
      },
    },
    required: [
      "mainConcern",
      "symptoms",
      "patterns",
      "questionsForDoctor",
      "suggestedSpecialty",
      "nextStep",
      "safetyFlags",
      "confidence",
      "assistantMessage",
    ],
    additionalProperties: false,
  },
} as const;

export function buildDeterministicClarityMapDraft(
  patientMessage: string,
  safety: ClinicalSafetyAssessment,
): ClarityMapDraft {
  const mainConcern = truncate(cleanSingleLine(patientMessage), MAIN_CONCERN_MAX) || "Preocupação de saúde para organizar em consulta";
  const safetyFlags = buildSafetyFlags(safety);
  const baseNextStep = safety.guardrailDecision === "refuse_and_escalate"
    ? safety.nextStep
    : "Organizar início, duração, intensidade, fatores de melhora ou piora, medicamentos em uso, histórico relevante e dúvidas para conversar com profissional habilitado.";

  return {
    mainConcern,
    symptoms: truncate(patientMessage.trim(), CLARITY_TEXT_MAX) || null,
    patterns: safety.uncertaintyReason
      ? "Ainda faltam dados objetivos sobre início, duração, intensidade, gatilhos, melhora, piora e contexto da rotina."
      : null,
    questionsForDoctor:
      "Quais informações do meu histórico mudam a avaliação? Que sinais exigem urgência? Que exames ou acompanhamentos fazem sentido discutir, sem presumir diagnóstico?",
    suggestedSpecialty: safety.redFlag ? "Atendimento de urgência" : "Clínica médica ou medicina funcional para avaliação inicial",
    nextStep: ensureProfessionalNextStep(baseNextStep),
    safetyFlags,
    confidence: safety.confidence,
  };
}

export function buildClarityAssistantMessage(draft: ClarityMapDraft, safety: ClinicalSafetyAssessment, dayanContext?: DayanInfusionContext): string {
  const dayanAnchor = dayanContext ? buildDayanEducationalAnchor(dayanContext) : "";
  const withDayanAnchor = (message: string) => dayanAnchor ? `${message}\n\n${dayanAnchor}` : message;
  if (safety.guardrailDecision === "refuse_and_escalate") {
    return withDayanAnchor(`${safety.guidance}\n\n${MEDICAL_DISCLAIMER}`);
  }

  const uncertainty = draft.confidence === "low" || safety.uncertaintyReason
    ? "Há incerteza porque ainda faltam dados objetivos; por isso, o mapa prioriza perguntas e organização de contexto."
    : "O mapa abaixo organiza o que você informou para facilitar uma conversa clínica mais objetiva.";

  return withDayanAnchor(`${uncertainty}\n\n**Mapa de Clareza criado:** ${draft.mainConcern}.\n\n**Próximo passo seguro:** ${draft.nextStep}\n\n${MEDICAL_DISCLAIMER}`);
}

export async function buildClarityMapDraftWithLLM(
  patientMessage: string,
  safety: ClinicalSafetyAssessment,
): Promise<ClarityMapDraftResult> {
  const deterministicDraft = buildDeterministicClarityMapDraft(patientMessage, safety);
  const dayanContext = buildDayanInfusionContext({
    mode: "clarity",
    query: patientMessage,
    extraContext: `${deterministicDraft.mainConcern} ${deterministicDraft.patterns ?? ""}`,
    limit: 5,
    safetyOnly: safety.redFlag,
  });

  if (safety.guardrailDecision !== "answer_safely") {
    return {
      draft: deterministicDraft,
      assistantMessage: buildClarityAssistantMessage(deterministicDraft, safety, dayanContext),
      audit: buildAudit({
        attempted: false,
        status: "not_attempted_guardrail_limited",
        reason: `Clinical safety guardrail returned ${safety.guardrailDecision}.`,
        postGuardrailViolations: [],
      }),
    };
  }

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: CLARITY_MAP_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildClarityMapUserPrompt(patientMessage, safety, dayanContext),
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: CLARITY_MAP_RESPONSE_SCHEMA,
      },
    });

    const content = extractLLMTextContent(response);
    if (!content) {
      return withFallback(deterministicDraft, safety, "fallback_empty_response", "LLM returned an empty content payload.", [], dayanContext);
    }

    const parsed = parseClarityJSON(content);
    if (!parsed.ok) {
      return withFallback(deterministicDraft, safety, parsed.status, parsed.reason, [], dayanContext);
    }

    const normalized = normalizeClarityResponse(parsed.value);
    const validationErrors = validateClarityDraft(normalized.draft, normalized.assistantMessage);
    if (validationErrors.length > 0) {
      return withFallback(deterministicDraft, safety, "fallback_invalid_schema", validationErrors.join("; "), [], dayanContext);
    }

    const postGuardrailViolations = detectUnsafeClarityOutput(normalized);
    if (postGuardrailViolations.length > 0) {
      return withFallback(
        deterministicDraft,
        safety,
        "fallback_post_guardrail_violation",
        `Post-response guardrail detected: ${postGuardrailViolations.join(", ")}.`,
        postGuardrailViolations,
        dayanContext,
      );
    }

    return {
      draft: normalized.draft,
      assistantMessage: normalized.assistantMessage,
      audit: buildAudit({
        attempted: true,
        status: "enhanced",
        reason: null,
        postGuardrailViolations: [],
      }),
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown LLM error.";
    return withFallback(deterministicDraft, safety, "fallback_llm_error", reason, [], dayanContext);
  }
}

function buildClarityMapUserPrompt(patientMessage: string, safety: ClinicalSafetyAssessment, dayanContext: DayanInfusionContext): string {
  return [
    "Transforme a mensagem abaixo em um Mapa de Clareza para consulta médica.",
    "Não invente sintomas, exames, histórico, diagnóstico, causa, prognóstico ou tratamento.",
    "Use null quando uma seção não tiver informação suficiente.",
    "O próximo passo deve ser educativo, seguro e não prescritivo.",
    "Inclua disclaimer explícito na assistantMessage.",
    `Decisão de segurança: ${safety.guardrailDecision}; severidade: ${safety.severity}; confiança: ${safety.confidence}; ações: ${safety.safetyActions.join(", ")}.`,
    dayanContext.promptBlock,
    `Mensagem do paciente: ${patientMessage}`,
  ].join("\n");
}

function normalizeClarityResponse(value: RawClarityResponse): { draft: ClarityMapDraft; assistantMessage: string } {
  return {
    draft: {
      mainConcern: truncate(cleanSingleLine(typeof value.mainConcern === "string" ? value.mainConcern : ""), MAIN_CONCERN_MAX) || "Preocupação de saúde para organizar em consulta",
      symptoms: normalizeNullableText(value.symptoms, CLARITY_TEXT_MAX),
      patterns: normalizeNullableText(value.patterns, CLARITY_TEXT_MAX),
      questionsForDoctor: normalizeNullableText(value.questionsForDoctor, CLARITY_TEXT_MAX),
      suggestedSpecialty: normalizeNullableText(value.suggestedSpecialty, SPECIALTY_MAX),
      nextStep: ensureProfessionalNextStep(truncate(cleanMultiline(value.nextStep), CLARITY_TEXT_MAX)),
      safetyFlags: normalizeNullableText(value.safetyFlags, CLARITY_TEXT_MAX),
      confidence: normalizeConfidence(value.confidence),
    },
    assistantMessage: ensureDisclaimer(truncate(cleanMultiline(value.assistantMessage), CLARITY_TEXT_MAX)),
  };
}

type RawClarityResponse = {
  mainConcern: unknown;
  symptoms: unknown;
  patterns: unknown;
  questionsForDoctor: unknown;
  suggestedSpecialty: unknown;
  nextStep: unknown;
  safetyFlags: unknown;
  confidence: unknown;
  assistantMessage: unknown;
};

function parseClarityJSON(content: string):
  | { ok: true; value: RawClarityResponse }
  | { ok: false; status: "fallback_invalid_json" | "fallback_invalid_schema"; reason: string } {
  try {
    const parsed = JSON.parse(content) as Partial<RawClarityResponse>;
    const requiredFields: Array<keyof RawClarityResponse> = [
      "mainConcern",
      "symptoms",
      "patterns",
      "questionsForDoctor",
      "suggestedSpecialty",
      "nextStep",
      "safetyFlags",
      "confidence",
      "assistantMessage",
    ];
    const missing = requiredFields.filter((field) => !(field in parsed));
    if (missing.length > 0) {
      return { ok: false, status: "fallback_invalid_schema", reason: `Missing required fields: ${missing.join(", ")}.` };
    }
    return { ok: true, value: parsed as RawClarityResponse };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Invalid JSON.";
    return { ok: false, status: "fallback_invalid_json", reason };
  }
}

function validateClarityDraft(draft: ClarityMapDraft, assistantMessage: string): string[] {
  const errors: string[] = [];
  if (draft.mainConcern.trim().length < 2) errors.push("mainConcern is too short");
  if (draft.nextStep.trim().length < 20) errors.push("nextStep is too short");
  if (!/profissional|m[eé]dic|consulta|urg[eê]ncia/i.test(draft.nextStep)) {
    errors.push("nextStep must mention professional evaluation, medical consultation, or urgency");
  }
  if (!/não substitui|nao substitui|educativa/i.test(assistantMessage)) {
    errors.push("assistantMessage must include educational disclaimer");
  }
  return errors;
}

function detectUnsafeClarityOutput(output: { draft: ClarityMapDraft; assistantMessage: string }): string[] {
  const joined = [
    output.draft.mainConcern,
    output.draft.symptoms,
    output.draft.patterns,
    output.draft.questionsForDoctor,
    output.draft.suggestedSpecialty,
    output.draft.nextStep,
    output.draft.safetyFlags,
    output.assistantMessage,
  ]
    .filter(Boolean)
    .join("\n");

  const violations: string[] = [];
  if (CERTAINTY_OR_DIAGNOSIS_PATTERNS.some((pattern) => pattern.test(joined))) {
    violations.push("diagnosis_or_certainty_claim");
  }
  if (containsPrescriptionRequest(joined) || PRESCRIPTIVE_OUTPUT_PATTERN.test(joined)) {
    violations.push("prescriptive_language");
  }
  return violations;
}

function withFallback(
  deterministicDraft: ClarityMapDraft,
  safety: ClinicalSafetyAssessment,
  status: Exclude<ClarityMapDraftAuditStatus, "enhanced" | "not_attempted_guardrail_limited">,
  reason: string,
  postGuardrailViolations: string[] = [],
  dayanContext?: DayanInfusionContext,
): ClarityMapDraftResult {
  return {
    draft: deterministicDraft,
    assistantMessage: buildClarityAssistantMessage(deterministicDraft, safety, dayanContext),
    audit: buildAudit({
      attempted: true,
      status,
      reason,
      postGuardrailViolations,
    }),
  };
}

function buildAudit(input: Omit<ClarityMapDraftAudit, "promptId" | "schemaName" | "policyVersion">): ClarityMapDraftAudit {
  return {
    ...input,
    promptId: CLARITY_MAP_PROMPT_ID,
    schemaName: CLARITY_MAP_SCHEMA_NAME,
    policyVersion: CLINICAL_POLICY_VERSION,
  };
}

function extractLLMTextContent(response: InvokeResult): string | null {
  const content = response.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((part): part is { type: "text"; text: string } => part.type === "text")
      .map((part) => part.text)
      .join("\n") || null;
  }
  return null;
}

function buildSafetyFlags(safety: ClinicalSafetyAssessment): string | null {
  const flags: string[] = [];
  if (safety.redFlag) flags.push("Possível sinal de alerta: priorizar atendimento de urgência e suporte humano.");
  if (safety.prescriptionRequest) flags.push("Pedido de prescrição, dose ou tratamento individualizado bloqueado por segurança.");
  if (safety.uncertaintyReason) flags.push(safety.uncertaintyReason);
  if (safety.fallbackToHuman) flags.push("Humano no circuito recomendado antes de qualquer decisão clínica.");
  return flags.length > 0 ? flags.join(" ") : null;
}

function normalizeNullableText(value: unknown, maxLength: number): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;
  const cleaned = truncate(cleanMultiline(value), maxLength);
  return cleaned.length > 0 ? cleaned : null;
}

function normalizeConfidence(value: unknown): ClarityJourneyConfidence {
  if (value === "high" || value === "medium" || value === "low") return value;
  return "medium";
}

function ensureProfessionalNextStep(value: string): string {
  const cleaned = cleanMultiline(value);
  const fallback = "Organizar as informações e conversar com profissional habilitado antes de tomar decisões clínicas.";
  const base = cleaned.length > 0 ? cleaned : fallback;
  if (/profissional|m[eé]dic|consulta|urg[eê]ncia/i.test(base)) return base;
  return `${base} Discuta este mapa com profissional habilitado antes de qualquer decisão clínica.`;
}

function ensureDisclaimer(value: string): string {
  const cleaned = cleanMultiline(value);
  const base = cleaned.length > 0 ? cleaned : "Organizei um Mapa de Clareza para apoiar sua próxima conversa clínica.";
  if (/não substitui|nao substitui|educativa/i.test(base)) return base;
  return `${base}\n\n${MEDICAL_DISCLAIMER}`;
}

function cleanSingleLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function cleanMultiline(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

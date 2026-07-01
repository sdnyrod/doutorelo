import { invokeLLM, type InvokeResult } from "../_core/llm";
import {
  CLINICAL_POLICY_VERSION,
  MEDICAL_DISCLAIMER,
  type ClinicalSafetyAssessment,
  containsPrescriptionRequest,
} from "./clinicalSafety";
import { buildDayanEducationalAnchor, buildDayanInfusionContext, type DayanInfusionContext } from "./dayanInfusion";

export type HealthIntentType =
  | "symptom"
  | "exam"
  | "habit"
  | "prevention"
  | "professional-search"
  | "emotional"
  | "alert"
  | "general";

export type JourneyUrgency = "educational" | "attention" | "urgent";
export type JourneyConfidence = "low" | "medium" | "high";

export type JourneyNextPathId =
  | "understand_better"
  | "organize_exams"
  | "track_routine"
  | "save_to_memory"
  | "prepare_professional_conversation"
  | "find_professional"
  | "review_alerts"
  | "continue_freely"
  | "emotional_context"
  | "prevention_plan";

export type JourneyNextPath = {
  id: JourneyNextPathId;
  label: string;
  icon: string;
  description: string;
  route: string | null;
  priority: "primary" | "secondary" | "safety";
};

export type LiveSummarySeed = {
  title: string;
  whatWeUnderstood: string;
  missingContext: string[];
  memoryHint: string;
};

export type ContinuousIntentAnalysis = {
  intentType: HealthIntentType;
  urgency: JourneyUrgency;
  domain: string;
  mainNeed: string;
  initialResponse: string;
  nextPaths: JourneyNextPath[];
  followUpQuestions: string[];
  liveSummary: LiveSummarySeed;
  confidence: JourneyConfidence;
};

export type IntentEngineAuditStatus =
  | "not_attempted_guardrail_limited"
  | "enhanced"
  | "fallback_llm_error"
  | "fallback_empty_response"
  | "fallback_invalid_json"
  | "fallback_invalid_schema"
  | "fallback_post_guardrail_violation";

export type IntentEngineAudit = {
  attempted: boolean;
  status: IntentEngineAuditStatus;
  reason: string | null;
  promptId: typeof INTENT_ENGINE_PROMPT_ID;
  schemaName: typeof INTENT_ENGINE_SCHEMA_NAME;
  policyVersion: typeof CLINICAL_POLICY_VERSION;
  postGuardrailViolations: string[];
};

export type ContinuousIntentResult = {
  analysis: ContinuousIntentAnalysis;
  audit: IntentEngineAudit;
};

export const INTENT_ENGINE_SCHEMA_NAME = "continuous_unfolding_intent_response_v1";
export const INTENT_ENGINE_PROMPT_ID = "continuous_unfolding_intent_prompt_v0";

const TEXT_MAX = 1800;
const SHORT_TEXT_MAX = 260;
const RESPONSE_MAX = 1400;
const PATH_DESCRIPTION_MAX = 220;
const QUESTION_MAX = 220;

const INTENT_TYPES: HealthIntentType[] = ["symptom", "exam", "habit", "prevention", "professional-search", "emotional", "alert", "general"];
const URGENCIES: JourneyUrgency[] = ["educational", "attention", "urgent"];
const CONFIDENCES: JourneyConfidence[] = ["low", "medium", "high"];
const NEXT_PATH_IDS: JourneyNextPathId[] = [
  "understand_better",
  "organize_exams",
  "track_routine",
  "save_to_memory",
  "prepare_professional_conversation",
  "find_professional",
  "review_alerts",
  "continue_freely",
  "emotional_context",
  "prevention_plan",
];

const CERTAINTY_OR_DIAGNOSIS_PATTERNS = [
  /\b(você|voce)\s+tem\b/i,
  /\bdiagnóstico\s+é\b/i,
  /\bdiagnostico\s+e\b/i,
  /\bcom certeza\b/i,
  /\b100%\b/i,
  /\bgarantido\b/i,
  /\bcausa\s+é\b/i,
];

const PRESCRIPTIVE_OUTPUT_PATTERN = /\b(tome|tomar\s+\d+|usar\s+\d+|mg\b|ml\b|comprimido|cápsula|capsula|prescrevo|receito)\b/i;
const SINGLE_FUNNEL_PATTERN = /prepar(ar|ação de)? consulta/gi;

export const INTENT_ENGINE_SYSTEM_PROMPT = `Você é o Motor de Desdobramento Contínuo do DOUTORELO, uma plataforma de saúde funcional com IA. Sua função é transformar a primeira mensagem livre do usuário em uma jornada aberta, segura e longitudinal. Não force tudo para consulta: consulta, busca de profissional e preparação de conversa clínica são apenas alguns caminhos possíveis. Também existem caminhos para entender melhor, organizar exames, acompanhar rotina, registrar memória, revisar sinais de atenção, cuidar de contexto emocional, prevenção e continuar livremente. Nunca diagnostique, prescreva, prometa causa, indique dose, tratamento, suplemento ou conduta individualizada. Seja acolhedor, claro e útil. Responda somente em JSON válido conforme o schema.`;

export const INTENT_ENGINE_RESPONSE_SCHEMA = {
  name: INTENT_ENGINE_SCHEMA_NAME,
  strict: true,
  schema: {
    type: "object",
    properties: {
      intentType: {
        type: "string",
        enum: INTENT_TYPES,
        description: "Classificação primária da primeira intenção do usuário.",
      },
      urgency: {
        type: "string",
        enum: URGENCIES,
        description: "Nível de urgência da jornada: educational, attention ou urgent.",
      },
      domain: {
        type: "string",
        description: "Domínio amplo em português, como sono, energia, exames, dor, saúde emocional, prevenção, nutrição, rotina ou profissional.",
      },
      mainNeed: {
        type: "string",
        description: "Necessidade central inferida sem diagnóstico, com no máximo 260 caracteres.",
      },
      initialResponse: {
        type: "string",
        description: "Resposta inicial curta, acolhedora, educativa, sem diagnóstico/prescrição e com limite clínico explícito.",
      },
      nextPaths: {
        type: "array",
        minItems: 5,
        maxItems: 7,
        items: {
          type: "object",
          properties: {
            id: { type: "string", enum: NEXT_PATH_IDS },
            label: { type: "string" },
            icon: { type: "string" },
            description: { type: "string" },
            route: { type: ["string", "null"] },
            priority: { type: "string", enum: ["primary", "secondary", "safety"] },
          },
          required: ["id", "label", "icon", "description", "route", "priority"],
          additionalProperties: false,
        },
      },
      followUpQuestions: {
        type: "array",
        minItems: 2,
        maxItems: 3,
        items: { type: "string" },
      },
      liveSummary: {
        type: "object",
        properties: {
          title: { type: "string" },
          whatWeUnderstood: { type: "string" },
          missingContext: {
            type: "array",
            minItems: 1,
            maxItems: 4,
            items: { type: "string" },
          },
          memoryHint: { type: "string" },
        },
        required: ["title", "whatWeUnderstood", "missingContext", "memoryHint"],
        additionalProperties: false,
      },
      confidence: {
        type: "string",
        enum: CONFIDENCES,
        description: "Confiança na organização da jornada, nunca certeza clínica.",
      },
    },
    required: [
      "intentType",
      "urgency",
      "domain",
      "mainNeed",
      "initialResponse",
      "nextPaths",
      "followUpQuestions",
      "liveSummary",
      "confidence",
    ],
    additionalProperties: false,
  },
} as const;

export async function buildContinuousIntentAnalysisWithLLM(
  patientMessage: string,
  safety: ClinicalSafetyAssessment,
): Promise<ContinuousIntentResult> {
  const deterministicAnalysis = buildDeterministicContinuousIntentAnalysis(patientMessage, safety);
  const dayanContext = buildDayanInfusionContext({
    mode: "intent",
    query: patientMessage,
    extraContext: `${deterministicAnalysis.domain} ${deterministicAnalysis.mainNeed}`,
    limit: 5,
    safetyOnly: safety.redFlag,
  });

  if (safety.guardrailDecision !== "answer_safely") {
    return {
      analysis: deterministicAnalysis,
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
        { role: "system", content: INTENT_ENGINE_SYSTEM_PROMPT },
        { role: "user", content: buildIntentEngineUserPrompt(patientMessage, safety, dayanContext) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: INTENT_ENGINE_RESPONSE_SCHEMA,
      },
    });

    const content = extractLLMTextContent(response);
    if (!content) {
      return withFallback(deterministicAnalysis, "fallback_empty_response", "LLM returned an empty content payload.");
    }

    const parsed = parseIntentJSON(content);
    if (!parsed.ok) {
      return withFallback(deterministicAnalysis, parsed.status, parsed.reason);
    }

    const normalized = normalizeIntentResponse(parsed.value, patientMessage, safety);
    const validationErrors = validateContinuousIntentAnalysis(normalized);
    if (validationErrors.length > 0) {
      return withFallback(deterministicAnalysis, "fallback_invalid_schema", validationErrors.join("; "));
    }

    const postGuardrailViolations = detectUnsafeIntentOutput(normalized);
    if (postGuardrailViolations.length > 0) {
      return withFallback(
        deterministicAnalysis,
        "fallback_post_guardrail_violation",
        `Post-response guardrail detected: ${postGuardrailViolations.join(", ")}.`,
        postGuardrailViolations,
      );
    }

    return {
      analysis: normalized,
      audit: buildAudit({
        attempted: true,
        status: "enhanced",
        reason: null,
        postGuardrailViolations: [],
      }),
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown LLM error.";
    return withFallback(deterministicAnalysis, "fallback_llm_error", reason);
  }
}

export function buildDeterministicContinuousIntentAnalysis(
  patientMessage: string,
  safety: ClinicalSafetyAssessment,
): ContinuousIntentAnalysis {
  const cleaned = truncate(cleanSingleLine(patientMessage), TEXT_MAX);
  const intentType = classifyIntent(cleaned, safety);
  const urgency = safety.redFlag || safety.severity === "urgent" ? "urgent" : safety.fallbackToHuman ? "attention" : "educational";
  const domain = inferDomain(cleaned, intentType);
  const mainNeed = buildMainNeed(cleaned, intentType, domain);
  const dayanContext = buildDayanInfusionContext({ mode: "intent", query: cleaned, extraContext: `${intentType} ${domain}`, limit: 4, safetyOnly: urgency === "urgent" });
  const initialResponse = buildInitialResponse(mainNeed, safety, dayanContext);
  const nextPaths = buildDeterministicNextPaths(intentType, urgency);
  const followUpQuestions = buildFollowUpQuestions(intentType, urgency);

  return {
    intentType,
    urgency,
    domain,
    mainNeed,
    initialResponse,
    nextPaths,
    followUpQuestions,
    liveSummary: {
      title: mainNeed,
      whatWeUnderstood: cleaned || "Você quer organizar uma questão de saúde com segurança e sem conclusões precipitadas.",
      missingContext: buildMissingContext(intentType, urgency),
      memoryHint: "Se fizer sentido para você, esta conversa pode virar um ponto da sua memória longitudinal para não recomeçar do zero depois.",
    },
    confidence: safety.confidence,
  };
}

function buildIntentEngineUserPrompt(patientMessage: string, safety: ClinicalSafetyAssessment, dayanContext: DayanInfusionContext): string {
  return [
    "Analise a primeira mensagem livre abaixo e devolva uma jornada aberta de próximos passos.",
    "Não invente sintomas, exames, histórico, diagnóstico, causa, prognóstico ou tratamento.",
    "A resposta inicial deve reconhecer o que foi dito, declarar limites educativos e abrir possibilidades.",
    "Gere de 5 a 7 nextPaths; inclua continue_freely e pelo menos três caminhos que NÃO sejam consulta, busca de profissional ou preparação de consulta.",
    "Use prepare_professional_conversation ou find_professional somente quando fizer sentido como uma possibilidade, nunca como funil obrigatório.",
    "Se houver sinais de alerta, priorize review_alerts, urgência e humano no circuito.",
    "As perguntas devem aprofundar sem virar formulário rígido.",
    `Decisão de segurança: ${safety.guardrailDecision}; severidade: ${safety.severity}; confiança: ${safety.confidence}; ações: ${safety.safetyActions.join(", ")}; próximo passo seguro: ${safety.nextStep}.`,
    dayanContext.promptBlock,
    `Mensagem do usuário: ${patientMessage}`,
  ].join("\n");
}

function normalizeIntentResponse(value: RawIntentResponse, patientMessage: string, safety: ClinicalSafetyAssessment): ContinuousIntentAnalysis {
  const intentType = normalizeIntentType(value.intentType, safety);
  const urgency = normalizeUrgency(value.urgency, safety);
  const domain = truncate(cleanSingleLine(value.domain), 120) || inferDomain(patientMessage, intentType);
  const mainNeed = truncate(cleanSingleLine(value.mainNeed), SHORT_TEXT_MAX) || buildMainNeed(patientMessage, intentType, domain);
  const normalizedPaths = normalizeNextPaths(value.nextPaths, intentType, urgency);

  return {
    intentType,
    urgency,
    domain,
    mainNeed,
    initialResponse: ensureDisclaimer(truncate(cleanMultiline(value.initialResponse), RESPONSE_MAX), safety),
    nextPaths: normalizedPaths,
    followUpQuestions: normalizeQuestions(value.followUpQuestions, intentType, urgency),
    liveSummary: normalizeLiveSummary(value.liveSummary, mainNeed, patientMessage, intentType, urgency),
    confidence: normalizeConfidence(value.confidence, safety),
  };
}

type RawIntentResponse = {
  intentType: unknown;
  urgency: unknown;
  domain: unknown;
  mainNeed: unknown;
  initialResponse: unknown;
  nextPaths: unknown;
  followUpQuestions: unknown;
  liveSummary: unknown;
  confidence: unknown;
};

function parseIntentJSON(content: string):
  | { ok: true; value: RawIntentResponse }
  | { ok: false; status: "fallback_invalid_json" | "fallback_invalid_schema"; reason: string } {
  try {
    const parsed = JSON.parse(content) as Partial<RawIntentResponse>;
    const requiredFields: Array<keyof RawIntentResponse> = [
      "intentType",
      "urgency",
      "domain",
      "mainNeed",
      "initialResponse",
      "nextPaths",
      "followUpQuestions",
      "liveSummary",
      "confidence",
    ];
    const missing = requiredFields.filter((field) => !(field in parsed));
    if (missing.length > 0) {
      return { ok: false, status: "fallback_invalid_schema", reason: `Missing required fields: ${missing.join(", ")}.` };
    }
    return { ok: true, value: parsed as RawIntentResponse };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Invalid JSON.";
    return { ok: false, status: "fallback_invalid_json", reason };
  }
}

function validateContinuousIntentAnalysis(analysis: ContinuousIntentAnalysis): string[] {
  const errors: string[] = [];
  if (analysis.mainNeed.length < 3) errors.push("mainNeed is too short");
  if (analysis.initialResponse.length < 40) errors.push("initialResponse is too short");
  if (!/não substitui|nao substitui|educativa|educativo/i.test(analysis.initialResponse)) {
    errors.push("initialResponse must include educational disclaimer");
  }
  if (analysis.nextPaths.length < 5 || analysis.nextPaths.length > 7) errors.push("nextPaths must include 5 to 7 items");
  if (!analysis.nextPaths.some((path) => path.id === "continue_freely")) errors.push("nextPaths must include continue_freely");
  const uniqueIds = new Set(analysis.nextPaths.map((path) => path.id));
  if (uniqueIds.size !== analysis.nextPaths.length) errors.push("nextPaths must not duplicate ids");
  const nonConsultationPaths = analysis.nextPaths.filter((path) => !["prepare_professional_conversation", "find_professional"].includes(path.id));
  if (nonConsultationPaths.length < 3) errors.push("nextPaths must not collapse into consultation funnel");
  const joinedLabels = analysis.nextPaths.map((path) => `${path.label} ${path.description}`).join(" ");
  const consultationMentions = joinedLabels.match(SINGLE_FUNNEL_PATTERN)?.length ?? 0;
  if (consultationMentions > 3) errors.push("nextPaths overemphasize consultation");
  if (analysis.followUpQuestions.length < 2 || analysis.followUpQuestions.length > 3) errors.push("followUpQuestions must include 2 to 3 questions");
  if (analysis.liveSummary.missingContext.length < 1) errors.push("liveSummary missingContext must not be empty");
  return errors;
}

function detectUnsafeIntentOutput(output: ContinuousIntentAnalysis): string[] {
  const joined = [
    output.intentType,
    output.urgency,
    output.domain,
    output.mainNeed,
    output.initialResponse,
    ...output.nextPaths.flatMap((path) => [path.label, path.description, path.route ?? ""]),
    ...output.followUpQuestions,
    output.liveSummary.title,
    output.liveSummary.whatWeUnderstood,
    ...output.liveSummary.missingContext,
    output.liveSummary.memoryHint,
  ].join("\n");

  const violations: string[] = [];
  if (CERTAINTY_OR_DIAGNOSIS_PATTERNS.some((pattern) => pattern.test(joined))) violations.push("diagnosis_or_certainty_claim");
  if (containsPrescriptionRequest(joined) || PRESCRIPTIVE_OUTPUT_PATTERN.test(joined)) violations.push("prescriptive_language");
  return violations;
}

function withFallback(
  deterministicAnalysis: ContinuousIntentAnalysis,
  status: Exclude<IntentEngineAuditStatus, "enhanced" | "not_attempted_guardrail_limited">,
  reason: string,
  postGuardrailViolations: string[] = [],
): ContinuousIntentResult {
  return {
    analysis: deterministicAnalysis,
    audit: buildAudit({
      attempted: true,
      status,
      reason,
      postGuardrailViolations,
    }),
  };
}

function buildAudit(input: Omit<IntentEngineAudit, "promptId" | "schemaName" | "policyVersion">): IntentEngineAudit {
  return {
    ...input,
    promptId: INTENT_ENGINE_PROMPT_ID,
    schemaName: INTENT_ENGINE_SCHEMA_NAME,
    policyVersion: CLINICAL_POLICY_VERSION,
  };
}

function classifyIntent(message: string, safety: ClinicalSafetyAssessment): HealthIntentType {
  if (safety.redFlag) return "alert";
  if (/\b(exame|exames|hemograma|colesterol|glicose|vitamina|tsh|resultado|laudo|laboratorial)\b/i.test(message)) return "exam";
  if (/\b(hábito|habito|rotina|sono|dormir|alimentação|alimentacao|treino|exercício|exercicio|energia|cansaço|cansaco)\b/i.test(message)) return "habit";
  if (/\b(prevenir|prevenção|prevencao|check-up|checkup|longevidade|melhorar saúde|melhorar minha saúde)\b/i.test(message)) return "prevention";
  if (/\b(médico|medico|profissional|especialista|consulta|agendar|quem procurar)\b/i.test(message)) return "professional-search";
  if (/\b(ansiedade|estresse|stress|triste|humor|emocional|medo|pânico|panico|sono ruim)\b/i.test(message)) return "emotional";
  if (/\b(dor|sintoma|sinto|sentindo|febre|náusea|nausea|tontura|mal-estar|mal estar)\b/i.test(message)) return "symptom";
  return "general";
}

function inferDomain(message: string, intentType: HealthIntentType): string {
  if (/\b(sono|dormir|insônia|insonia)\b/i.test(message)) return "sono e recuperação";
  if (/\b(cansaço|cansaco|fadiga|energia)\b/i.test(message)) return "energia e rotina";
  if (/\b(ansiedade|estresse|humor|emocional|pânico|panico)\b/i.test(message)) return "saúde emocional";
  if (/\b(exame|hemograma|colesterol|glicose|tsh|vitamina|laudo)\b/i.test(message)) return "exames e investigação";
  if (/\b(dor|febre|tontura|náusea|nausea|sintoma)\b/i.test(message)) return "sintomas e sinais corporais";
  if (/\b(alimentação|alimentacao|nutrição|nutricao|peso|intestino)\b/i.test(message)) return "nutrição e metabolismo";
  if (intentType === "professional-search") return "busca de profissional";
  if (intentType === "prevention") return "prevenção e longevidade";
  if (intentType === "alert") return "sinais de alerta";
  return "saúde funcional";
}

function buildMainNeed(message: string, intentType: HealthIntentType, domain: string): string {
  const cleaned = truncate(cleanSingleLine(message), 150);
  if (cleaned) return `Organizar ${domain}: ${cleaned}`;
  if (intentType === "professional-search") return "Encontrar o tipo de profissional mais adequado para conversar com segurança.";
  if (intentType === "prevention") return "Organizar próximos passos de prevenção e acompanhamento sem pressa nem promessas.";
  return "Entender e organizar uma necessidade de saúde com segurança.";
}

function buildInitialResponse(mainNeed: string, safety: ClinicalSafetyAssessment, dayanContext?: DayanInfusionContext): string {
  const dayanAnchor = dayanContext ? buildDayanEducationalAnchor(dayanContext) : "";
  const withDayanAnchor = (message: string) => dayanAnchor ? `${message}\n\n${dayanAnchor}` : message;
  if (safety.guardrailDecision === "refuse_and_escalate") {
    return ensureDisclaimer(withDayanAnchor(`${safety.guidance}\n\nPróximo passo seguro: ${safety.nextStep}`), safety);
  }

  if (safety.guardrailDecision === "ask_for_context") {
    return ensureDisclaimer(withDayanAnchor(`Entendi que você quer ${mainNeed.toLowerCase()}. Ainda faltam alguns dados para eu organizar isso com segurança, então vou abrir caminhos simples para entender melhor, registrar o que já existe e decidir o próximo passo sem concluir diagnóstico.`), safety);
  }

  return ensureDisclaimer(withDayanAnchor(`Entendi: você quer ${mainNeed.toLowerCase()}. Posso ajudar a transformar isso em uma jornada organizada, com caminhos para entender melhor, acompanhar rotina, registrar memória, revisar sinais de atenção e, se fizer sentido, preparar uma conversa com profissional.`), safety);
}

function buildDeterministicNextPaths(intentType: HealthIntentType, urgency: JourneyUrgency): JourneyNextPath[] {
  const catalog: Record<JourneyNextPathId, JourneyNextPath> = {
    understand_better: {
      id: "understand_better",
      label: "Entender melhor",
      icon: "search",
      description: "Aprofundar início, duração, intensidade, contexto e o que muda ao longo do tempo.",
      route: null,
      priority: "primary",
    },
    organize_exams: {
      id: "organize_exams",
      label: "Organizar exames",
      icon: "file-text",
      description: "Separar resultados, datas, dúvidas e lacunas para interpretação com profissional habilitado.",
      route: "/memoria",
      priority: "secondary",
    },
    track_routine: {
      id: "track_routine",
      label: "Acompanhar rotina",
      icon: "activity",
      description: "Observar sono, energia, alimentação, movimento, humor e padrões sem tirar conclusões sozinho.",
      route: "/conexoes",
      priority: "primary",
    },
    save_to_memory: {
      id: "save_to_memory",
      label: "Registrar na memória",
      icon: "database",
      description: "Guardar este ponto na sua linha do tempo para preservar continuidade nas próximas conversas.",
      route: "/memoria",
      priority: "secondary",
    },
    prepare_professional_conversation: {
      id: "prepare_professional_conversation",
      label: "Preparar conversa clínica",
      icon: "clipboard-list",
      description: "Montar perguntas e contexto para uma conversa com profissional, se esse for o melhor caminho.",
      route: "/preparar-consulta",
      priority: "secondary",
    },
    find_professional: {
      id: "find_professional",
      label: "Buscar profissional",
      icon: "stethoscope",
      description: "Ver profissionais disponíveis quando houver necessidade de avaliação humana ou continuidade do cuidado.",
      route: "/profissionais",
      priority: "secondary",
    },
    review_alerts: {
      id: "review_alerts",
      label: "Ver sinais de atenção",
      icon: "shield-alert",
      description: "Conferir quando a situação pede urgência ou suporte humano antes de qualquer outro passo.",
      route: null,
      priority: "safety",
    },
    continue_freely: {
      id: "continue_freely",
      label: "Continuar livremente",
      icon: "message-circle",
      description: "Escrever do seu jeito, sem formulário rígido, para a jornada se desdobrar conforme sua necessidade.",
      route: null,
      priority: "primary",
    },
    emotional_context: {
      id: "emotional_context",
      label: "Contexto emocional",
      icon: "heart-handshake",
      description: "Organizar estresse, humor, medo, rotina e apoio sem reduzir tudo a sintoma físico.",
      route: null,
      priority: "secondary",
    },
    prevention_plan: {
      id: "prevention_plan",
      label: "Prevenção e hábitos",
      icon: "leaf",
      description: "Transformar objetivos de saúde em observações seguras para acompanhar ao longo do tempo.",
      route: "/app",
      priority: "secondary",
    },
  };

  const ids: JourneyNextPathId[] = urgency === "urgent"
    ? ["review_alerts", "find_professional", "continue_freely", "save_to_memory", "understand_better"]
    : intentType === "exam"
      ? ["organize_exams", "understand_better", "save_to_memory", "prepare_professional_conversation", "continue_freely", "review_alerts"]
      : intentType === "habit" || intentType === "prevention"
        ? ["track_routine", "prevention_plan", "understand_better", "save_to_memory", "continue_freely", "review_alerts"]
        : intentType === "professional-search"
          ? ["find_professional", "prepare_professional_conversation", "understand_better", "save_to_memory", "continue_freely", "review_alerts"]
          : intentType === "emotional"
            ? ["emotional_context", "track_routine", "understand_better", "save_to_memory", "continue_freely", "review_alerts"]
            : ["understand_better", "track_routine", "save_to_memory", "prepare_professional_conversation", "continue_freely", "review_alerts"];

  return ids.map((id) => catalog[id]);
}

function buildFollowUpQuestions(intentType: HealthIntentType, urgency: JourneyUrgency): string[] {
  if (urgency === "urgent") {
    return [
      "Esse sinal está acontecendo agora ou piorou rapidamente?",
      "Você está sozinho ou tem alguém que possa ajudar a procurar atendimento presencial/urgente?",
    ];
  }
  if (intentType === "exam") {
    return [
      "Quais exames ou resultados você quer entender melhor e de que data eles são?",
      "O que motivou esses exames: sintoma, rotina preventiva ou acompanhamento de algo já conhecido?",
      "Você já tem uma pergunta principal para levar ao profissional sobre esses resultados?",
    ];
  }
  if (intentType === "habit" || intentType === "prevention") {
    return [
      "Qual mudança você mais quer observar primeiro: sono, energia, alimentação, movimento, humor ou exames?",
      "Há quanto tempo esse objetivo ou padrão vem chamando sua atenção?",
      "O que você já tentou acompanhar ou organizar até agora?",
    ];
  }
  if (intentType === "emotional") {
    return [
      "Quando esse contexto emocional costuma aparecer com mais força?",
      "Isso tem afetado sono, energia, alimentação, trabalho, relações ou segurança pessoal?",
      "Existe algum sinal de risco imediato ou necessidade de apoio humano agora?",
    ];
  }
  return [
    "Quando isso começou e como tem evoluído?",
    "O que melhora, piora ou aparece junto no seu dia a dia?",
    "Qual seria o resultado mais útil desta conversa para você agora?",
  ];
}

function buildMissingContext(intentType: HealthIntentType, urgency: JourneyUrgency): string[] {
  if (urgency === "urgent") return ["momento de início", "intensidade atual", "presença de apoio humano", "acesso a atendimento imediato"];
  if (intentType === "exam") return ["nome e data dos exames", "motivo da solicitação", "sintomas ou histórico relacionado"];
  if (intentType === "habit" || intentType === "prevention") return ["rotina atual", "padrão observado", "objetivo principal", "métricas disponíveis"];
  if (intentType === "emotional") return ["gatilhos", "impacto na rotina", "rede de apoio", "sinais de risco"];
  return ["início", "duração", "intensidade", "fatores de melhora ou piora"];
}

function normalizeNextPaths(value: unknown, intentType: HealthIntentType, urgency: JourneyUrgency): JourneyNextPath[] {
  if (!Array.isArray(value)) return buildDeterministicNextPaths(intentType, urgency);
  const normalized: JourneyNextPath[] = [];
  const seen = new Set<string>();

  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const id = normalizeNextPathId(record.id);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    normalized.push({
      id,
      label: truncate(cleanSingleLine(record.label), 42) || defaultPathLabel(id),
      icon: truncate(cleanSingleLine(record.icon), 40) || defaultPathIcon(id),
      description: truncate(cleanSingleLine(record.description), PATH_DESCRIPTION_MAX) || defaultPathDescription(id),
      route: normalizeRoute(record.route, id),
      priority: normalizePriority(record.priority, id),
    });
  }

  const defaults = buildDeterministicNextPaths(intentType, urgency);
  for (const path of defaults) {
    if (normalized.length >= 7) break;
    if (!seen.has(path.id)) {
      normalized.push(path);
      seen.add(path.id);
    }
  }

  if (!seen.has("continue_freely")) normalized.push(defaults.find((path) => path.id === "continue_freely") ?? buildDeterministicNextPaths("general", "educational").find((path) => path.id === "continue_freely")!);
  return normalized.slice(0, 7);
}

function normalizeQuestions(value: unknown, intentType: HealthIntentType, urgency: JourneyUrgency): string[] {
  const defaults = buildFollowUpQuestions(intentType, urgency);
  if (!Array.isArray(value)) return defaults.slice(0, 3);
  const normalized = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => truncate(cleanSingleLine(item), QUESTION_MAX))
    .filter((item) => item.length > 8);
  const merged = [...normalized, ...defaults].filter((item, index, array) => array.indexOf(item) === index);
  return merged.slice(0, 3).length >= 2 ? merged.slice(0, 3) : defaults.slice(0, 3);
}

function normalizeLiveSummary(value: unknown, mainNeed: string, patientMessage: string, intentType: HealthIntentType, urgency: JourneyUrgency): LiveSummarySeed {
  const defaults: LiveSummarySeed = {
    title: mainNeed,
    whatWeUnderstood: truncate(cleanSingleLine(patientMessage), TEXT_MAX) || "Primeira intenção de saúde registrada para organização segura.",
    missingContext: buildMissingContext(intentType, urgency),
    memoryHint: "Este resumo pode ser atualizado ao longo da jornada e reaproveitado em conversas futuras.",
  };

  if (!value || typeof value !== "object") return defaults;
  const record = value as Record<string, unknown>;
  const missingContext = Array.isArray(record.missingContext)
    ? record.missingContext
      .filter((item): item is string => typeof item === "string")
      .map((item) => truncate(cleanSingleLine(item), 80))
      .filter(Boolean)
      .slice(0, 4)
    : defaults.missingContext;

  return {
    title: truncate(cleanSingleLine(record.title), 160) || defaults.title,
    whatWeUnderstood: truncate(cleanMultiline(record.whatWeUnderstood), TEXT_MAX) || defaults.whatWeUnderstood,
    missingContext: missingContext.length > 0 ? missingContext : defaults.missingContext,
    memoryHint: truncate(cleanMultiline(record.memoryHint), TEXT_MAX) || defaults.memoryHint,
  };
}

function normalizeIntentType(value: unknown, safety: ClinicalSafetyAssessment): HealthIntentType {
  if (safety.redFlag) return "alert";
  return typeof value === "string" && INTENT_TYPES.includes(value as HealthIntentType) ? value as HealthIntentType : "general";
}

function normalizeUrgency(value: unknown, safety: ClinicalSafetyAssessment): JourneyUrgency {
  if (safety.redFlag || safety.severity === "urgent") return "urgent";
  if (safety.fallbackToHuman) return "attention";
  return typeof value === "string" && URGENCIES.includes(value as JourneyUrgency) ? value as JourneyUrgency : "educational";
}

function normalizeConfidence(value: unknown, safety: ClinicalSafetyAssessment): JourneyConfidence {
  if (typeof value === "string" && CONFIDENCES.includes(value as JourneyConfidence)) return value as JourneyConfidence;
  return safety.confidence;
}

function normalizeNextPathId(value: unknown): JourneyNextPathId | null {
  return typeof value === "string" && NEXT_PATH_IDS.includes(value as JourneyNextPathId) ? value as JourneyNextPathId : null;
}

function normalizePriority(value: unknown, id: JourneyNextPathId): JourneyNextPath["priority"] {
  if (value === "primary" || value === "secondary" || value === "safety") return value;
  if (id === "review_alerts") return "safety";
  if (id === "continue_freely" || id === "understand_better" || id === "track_routine") return "primary";
  return "secondary";
}

function normalizeRoute(value: unknown, id: JourneyNextPathId): string | null {
  if (typeof value === "string" && value.startsWith("/") && !value.startsWith("//")) return value;
  const routes: Partial<Record<JourneyNextPathId, string>> = {
    organize_exams: "/memoria",
    save_to_memory: "/memoria",
    prepare_professional_conversation: "/preparar-consulta",
    find_professional: "/profissionais",
    track_routine: "/conexoes",
    prevention_plan: "/app",
  };
  return routes[id] ?? null;
}

function defaultPathLabel(id: JourneyNextPathId): string {
  return buildDeterministicNextPaths("general", "educational").find((path) => path.id === id)?.label ?? "Continuar";
}

function defaultPathIcon(id: JourneyNextPathId): string {
  return buildDeterministicNextPaths("general", "educational").find((path) => path.id === id)?.icon ?? "sparkles";
}

function defaultPathDescription(id: JourneyNextPathId): string {
  return buildDeterministicNextPaths("general", "educational").find((path) => path.id === id)?.description ?? "Seguir de forma aberta e segura.";
}

function ensureDisclaimer(value: string, safety: ClinicalSafetyAssessment): string {
  const base = value.trim().length > 0 ? value.trim() : safety.guidance;
  if (/não substitui|nao substitui|educativa|educativo/i.test(base)) return base;
  return `${base}\n\n${MEDICAL_DISCLAIMER}`;
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

function cleanSingleLine(value: unknown): string {
  if (typeof value !== "string") return "";
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

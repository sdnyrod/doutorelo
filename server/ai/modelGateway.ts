import { ENV } from "../_core/env";
import { invokeLLM, type InvokeResult } from "../_core/llm";
import {
  CLINICAL_POLICY_VERSION,
  MEDICAL_DISCLAIMER,
  type ClinicalConfidence,
  type ClinicalSafetyAssessment,
  type ClinicalSeverity,
  detectUnsafeClinicalOutput,
} from "./clinicalSafety";

export const CARE_JOURNEY_PROMPT_ID = "care_journey_core_response_prompt_v1";
export const CARE_JOURNEY_SCHEMA_NAME = "care_journey_core_structured_response_v1";

export type CareJourneyGatewayExecutionStatus = "success" | "guardrail_blocked" | "fallback" | "error";
export type CareJourneyGatewayAuditStatus =
  | "not_attempted_guardrail_limited"
  | "enhanced"
  | "fallback_empty_response"
  | "fallback_invalid_json"
  | "fallback_invalid_schema"
  | "fallback_post_guardrail_violation"
  | "fallback_llm_error";

export type CareJourneyLogicalProvider = "anthropic" | "openai" | "built_in_llm" | "deterministic_fallback";

type CareJourneyModelProvider = {
  logicalProvider: Exclude<CareJourneyLogicalProvider, "deterministic_fallback">;
  label: string;
  invoke: (params: { systemPrompt: string; userPrompt: string }) => Promise<CareJourneyProviderInvocationResult>;
};

type CareJourneyProviderInvocationResult = {
  content: string | null;
  promptTokens?: number;
  completionTokens?: number;
};

type CareJourneyProviderFailure = {
  status: Exclude<CareJourneyGatewayAuditStatus, "not_attempted_guardrail_limited" | "enhanced">;
  reason: string;
  postGuardrailViolations: string[];
  outputTokensEst: number;
  latencyMs: number;
  executionStatus?: CareJourneyGatewayExecutionStatus;
};

export type CareJourneyGatewayRequest = {
  message: string;
  safety: ClinicalSafetyAssessment;
  sessionContext?: {
    sessionId?: number;
    totalTurns?: number;
    previousSummary?: string | null;
    intakeData?: unknown;
  };
};

export type CareJourneyStructuredResponse = {
  assistantMessage: string;
  sessionSummary: string;
  nextQuestion: string | null;
  suggestedActions: string[];
  escalationRecommended: boolean;
  escalationReason: string | null;
  severity: ClinicalSeverity;
  confidence: Exclude<ClinicalConfidence, "high">;
  patientCanSaveToMemory: boolean;
};

export type CareJourneyGatewayAudit = {
  attempted: boolean;
  status: CareJourneyGatewayAuditStatus;
  executionStatus: CareJourneyGatewayExecutionStatus;
  reason: string | null;
  promptId: typeof CARE_JOURNEY_PROMPT_ID;
  schemaName: typeof CARE_JOURNEY_SCHEMA_NAME;
  policyVersion: typeof CLINICAL_POLICY_VERSION;
  logicalProvider: CareJourneyLogicalProvider;
  modelCapability: "care_journey_response";
  postGuardrailViolations: string[];
  inputTokensEst: number;
  outputTokensEst: number;
  latencyMs: number;
};

export type CareJourneyGatewayResult = {
  response: CareJourneyStructuredResponse;
  audit: CareJourneyGatewayAudit;
};

export const CARE_JOURNEY_SYSTEM_PROMPT = `Você é o copiloto clínico governado do DOUTORELO para uma jornada de cuidado funcional. Sua função é acolher, organizar informações e orientar próximos passos seguros sem diagnosticar, prescrever, sugerir dose, medicamento, suplemento, tratamento individualizado, prognóstico ou promessa de causa. Responda somente em JSON válido conforme o schema. Sempre preserve incerteza clínica, inclua disclaimer explícito e recomende profissional habilitado quando apropriado.`;

export const CARE_JOURNEY_RESPONSE_SCHEMA = {
  name: CARE_JOURNEY_SCHEMA_NAME,
  strict: true,
  schema: {
    type: "object",
    properties: {
      assistantMessage: {
        type: "string",
        description: "Resposta em português, acolhedora, educativa, não diagnóstica, com disclaimer explícito de que não substitui avaliação médica.",
      },
      sessionSummary: {
        type: "string",
        description: "Resumo curto e seguro do turno para memória longitudinal, sem inferir fatos não informados.",
      },
      nextQuestion: {
        type: ["string", "null"],
        description: "Uma pergunta objetiva para coletar contexto seguro, ou null se houver necessidade de urgência/humano.",
      },
      suggestedActions: {
        type: "array",
        minItems: 1,
        maxItems: 4,
        items: { type: "string" },
        description: "Ações educativas e organizacionais, nunca conduta clínica individualizada.",
      },
      escalationRecommended: {
        type: "boolean",
        description: "true quando a conversa deve envolver profissional habilitado ou urgência por limitação de segurança.",
      },
      escalationReason: {
        type: ["string", "null"],
        description: "Motivo da escalada, se houver, sem diagnóstico.",
      },
      severity: {
        type: "string",
        enum: ["educational", "uncertain", "urgent"],
      },
      confidence: {
        type: "string",
        enum: ["low", "medium"],
        description: "Confiança conservadora; nunca high em cuidado clínico assistido por IA.",
      },
      patientCanSaveToMemory: {
        type: "boolean",
        description: "true apenas se o conteúdo for seguro para memória longitudinal não diagnóstica.",
      },
    },
    required: [
      "assistantMessage",
      "sessionSummary",
      "nextQuestion",
      "suggestedActions",
      "escalationRecommended",
      "escalationReason",
      "severity",
      "confidence",
      "patientCanSaveToMemory",
    ],
    additionalProperties: false,
  },
} as const;

export async function runCareJourneyModelGateway(request: CareJourneyGatewayRequest): Promise<CareJourneyGatewayResult> {
  const deterministicResponse = buildDeterministicCareJourneyResponse(request.message, request.safety);
  const userPrompt = buildCareJourneyUserPrompt(request);
  const inputTokensEst = estimateTokens(`${request.message}\n${request.safety.guidance}\n${request.sessionContext?.previousSummary ?? ""}`);

  if (request.safety.guardrailDecision !== "answer_safely") {
    return withAudit(deterministicResponse, {
      attempted: false,
      status: "not_attempted_guardrail_limited",
      executionStatus: "guardrail_blocked",
      reason: `Clinical safety guardrail returned ${request.safety.guardrailDecision}.`,
      logicalProvider: "deterministic_fallback",
      postGuardrailViolations: [],
      inputTokensEst,
      outputTokensEst: estimateTokens(deterministicResponse.assistantMessage),
      latencyMs: 0,
    });
  }

  let lastFailure: CareJourneyProviderFailure | null = null;

  for (const provider of getCareJourneyModelProviders()) {
    const startedAt = Date.now();
    try {
      const result = await provider.invoke({
        systemPrompt: CARE_JOURNEY_SYSTEM_PROMPT,
        userPrompt,
      });
      const latencyMs = Date.now() - startedAt;
      const content = result.content;

      if (!content) {
        lastFailure = {
          status: "fallback_empty_response",
          reason: `${provider.label} returned an empty content payload.`,
          postGuardrailViolations: [],
          outputTokensEst: 0,
          latencyMs,
        };
        continue;
      }

      const parsed = parseCareJourneyJSON(content);
      if (!parsed.ok) {
        lastFailure = {
          status: parsed.status,
          reason: `${provider.label}: ${parsed.reason}`,
          postGuardrailViolations: [],
          outputTokensEst: estimateTokens(content),
          latencyMs,
        };
        continue;
      }

      const normalized = normalizeCareJourneyResponse(parsed.value);
      const validationErrors = validateCareJourneyResponse(normalized);
      if (validationErrors.length > 0) {
        lastFailure = {
          status: "fallback_invalid_schema",
          reason: `${provider.label}: ${validationErrors.join("; ")}`,
          postGuardrailViolations: [],
          outputTokensEst: estimateTokens(content),
          latencyMs,
        };
        continue;
      }

      const violations = detectUnsafeCareJourneyOutput(normalized);
      if (violations.length > 0) {
        lastFailure = {
          status: "fallback_post_guardrail_violation",
          reason: `${provider.label}: post-response guardrail detected ${violations.join(", ")}.`,
          postGuardrailViolations: violations,
          outputTokensEst: estimateTokens(content),
          latencyMs,
        };
        continue;
      }

      return withAudit(normalized, {
        attempted: true,
        status: "enhanced",
        executionStatus: "success",
        reason: null,
        logicalProvider: provider.logicalProvider,
        postGuardrailViolations: [],
        inputTokensEst: result.promptTokens ?? inputTokensEst,
        outputTokensEst: result.completionTokens ?? estimateTokens(content),
        latencyMs,
      });
    } catch (error) {
      lastFailure = {
        status: "fallback_llm_error",
        reason: `${provider.label}: ${error instanceof Error ? error.message : "Unknown LLM invocation error."}`,
        postGuardrailViolations: [],
        outputTokensEst: estimateTokens(deterministicResponse.assistantMessage),
        latencyMs: Date.now() - startedAt,
        executionStatus: "error",
      };
    }
  }

  const failure = lastFailure ?? {
    status: "fallback_llm_error" as const,
    reason: "No LLM provider was available.",
    postGuardrailViolations: [],
    outputTokensEst: estimateTokens(deterministicResponse.assistantMessage),
    latencyMs: 0,
  };

  return fallback(
    deterministicResponse,
    failure.status,
    failure.reason,
    failure.postGuardrailViolations,
    inputTokensEst,
    failure.outputTokensEst,
    failure.latencyMs,
    failure.executionStatus ?? "fallback",
  );
}

function getCareJourneyModelProviders(): CareJourneyModelProvider[] {
  const providers: CareJourneyModelProvider[] = [];

  if (ENV.anthropicApiKey) {
    providers.push({
      logicalProvider: "anthropic",
      label: "Anthropic Claude Sonnet",
      invoke: invokeAnthropicCareJourneyProvider,
    });
  }

  if (ENV.openAiApiKey) {
    providers.push({
      logicalProvider: "openai",
      label: "OpenAI GPT",
      invoke: invokeOpenAiCareJourneyProvider,
    });
  }

  providers.push({
    logicalProvider: "built_in_llm",
    label: "Built-in LLM",
    invoke: invokeBuiltInCareJourneyProvider,
  });

  return providers;
}

async function invokeBuiltInCareJourneyProvider(params: { systemPrompt: string; userPrompt: string }): Promise<CareJourneyProviderInvocationResult> {
  const result = await invokeLLM({
    messages: [
      { role: "system", content: params.systemPrompt },
      { role: "user", content: params.userPrompt },
    ],
    response_format: {
      type: "json_schema",
      json_schema: CARE_JOURNEY_RESPONSE_SCHEMA,
    },
  });

  return {
    content: extractLLMTextContent(result),
    promptTokens: result.usage?.prompt_tokens,
    completionTokens: result.usage?.completion_tokens,
  };
}

async function invokeAnthropicCareJourneyProvider(params: { systemPrompt: string; userPrompt: string }): Promise<CareJourneyProviderInvocationResult> {
  const payload = await postJsonToProvider("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": ENV.anthropicApiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ENV.anthropicModel,
      max_tokens: 1800,
      temperature: 0.2,
      system: `${params.systemPrompt}\nResponda apenas com JSON válido que siga exatamente o schema ${CARE_JOURNEY_SCHEMA_NAME}.`,
      messages: [{ role: "user", content: params.userPrompt }],
    }),
  });

  const record = asRecord(payload);
  const usage = asRecord(record.usage);
  return {
    content: extractAnthropicText(payload),
    promptTokens: typeof usage.input_tokens === "number" ? usage.input_tokens : undefined,
    completionTokens: typeof usage.output_tokens === "number" ? usage.output_tokens : undefined,
  };
}

async function invokeOpenAiCareJourneyProvider(params: { systemPrompt: string; userPrompt: string }): Promise<CareJourneyProviderInvocationResult> {
  const payload = await postJsonToProvider("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.openAiApiKey}`,
    },
    body: JSON.stringify({
      model: ENV.openAiModel,
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: CARE_JOURNEY_RESPONSE_SCHEMA,
      },
      temperature: 0.2,
      max_tokens: 1800,
    }),
  });

  const record = asRecord(payload);
  const usage = asRecord(record.usage);
  return {
    content: extractOpenAiText(payload),
    promptTokens: typeof usage.prompt_tokens === "number" ? usage.prompt_tokens : undefined,
    completionTokens: typeof usage.completion_tokens === "number" ? usage.completion_tokens : undefined,
  };
}

async function postJsonToProvider(url: string, init: RequestInit, timeoutMs = ENV.externalProviderTimeoutMs): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const text = await response.text();
    const payload = parseProviderPayload(text);

    if (!response.ok) {
      const errorMessage = extractProviderErrorMessage(payload) ?? `HTTP ${response.status}`;
      throw new Error(errorMessage);
    }

    return payload;
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`Provider timeout after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function parseProviderPayload(text: string): unknown {
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { rawText: text };
  }
}

function extractProviderErrorMessage(payload: unknown): string | null {
  const record = asRecord(payload);
  const error = asRecord(record.error);
  return typeof error.message === "string" ? error.message : null;
}

function extractAnthropicText(payload: unknown): string | null {
  const content = asRecord(payload).content;
  if (!Array.isArray(content)) return null;

  const text = content
    .map((part) => asRecord(part))
    .filter((part) => part.type === "text" && typeof part.text === "string")
    .map((part) => part.text)
    .join("\n")
    .trim();

  return text || null;
}

function extractOpenAiText(payload: unknown): string | null {
  const choices = asRecord(payload).choices;
  if (!Array.isArray(choices)) return null;
  const firstChoice = asRecord(choices[0]);
  const message = asRecord(firstChoice.message);
  return typeof message.content === "string" ? message.content.trim() || null : null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function buildDeterministicCareJourneyResponse(message: string, safety: ClinicalSafetyAssessment): CareJourneyStructuredResponse {
  const redFlagOrEscalation = safety.guardrailDecision === "refuse_and_escalate" || safety.redFlag;
  const needsMoreContext = safety.guardrailDecision === "ask_for_context" || safety.uncertaintyReason !== null;
  const safeContextQuestion = "Para organizar melhor, você pode informar início, duração, intensidade, fatores de melhora ou piora, medicamentos em uso, condições conhecidas e se há algum sinal de alerta?";
  const assistantMessage = redFlagOrEscalation
    ? `${safety.guidance}\n\n${MEDICAL_DISCLAIMER}`
    : `${safety.guidance}\n\nPosso ajudar a organizar o que você relatou em perguntas e pontos para conversar com um profissional habilitado, sem concluir diagnóstico ou indicar tratamento.\n\n${MEDICAL_DISCLAIMER}`;

  return {
    assistantMessage,
    sessionSummary: truncate(cleanSingleLine(message), 360) || "Interação clínica educativa registrada sem conclusão diagnóstica.",
    nextQuestion: redFlagOrEscalation ? null : safeContextQuestion,
    suggestedActions: redFlagOrEscalation
      ? ["Procure avaliação presencial ou serviço de urgência conforme a gravidade dos sinais relatados.", "Leve histórico, medicamentos em uso, alergias e exames recentes se estiverem disponíveis."]
      : ["Anote início, duração, intensidade e evolução dos sinais relatados.", "Liste medicamentos, suplementos, alergias, condições conhecidas e exames recentes.", "Use estas informações para conversar com um profissional habilitado."],
    escalationRecommended: redFlagOrEscalation || safety.fallbackToHuman,
    escalationReason: redFlagOrEscalation ? safety.nextStep : needsMoreContext ? safety.uncertaintyReason : null,
    severity: safety.severity,
    confidence: safety.confidence === "high" ? "medium" : safety.confidence,
    patientCanSaveToMemory: !redFlagOrEscalation,
  };
}

function buildCareJourneyUserPrompt(request: CareJourneyGatewayRequest): string {
  return [
    "Gere a próxima resposta da jornada de cuidado com linguagem humana, conservadora e auditável.",
    "Não invente sintomas, histórico, exames, diagnóstico, causa, tratamento, medicamento, suplemento, dose ou prognóstico.",
    "Se faltarem dados, faça apenas uma pergunta objetiva de contexto e deixe a incerteza explícita.",
    "Se houver sinal de alerta ou pedido prescritivo, preserve a limitação e recomende profissional habilitado/urgência conforme a avaliação de segurança.",
    `Versão de política clínica: ${CLINICAL_POLICY_VERSION}`,
    `Decisão de segurança: ${request.safety.guardrailDecision}`,
    `Severidade: ${request.safety.severity}; confiança: ${request.safety.confidence}`,
    `Ações de segurança: ${request.safety.safetyActions.join(", ")}`,
    `Resumo prévio da sessão: ${request.sessionContext?.previousSummary ?? "sem resumo prévio"}`,
    `Turnos anteriores registrados: ${request.sessionContext?.totalTurns ?? 0}`,
    `Mensagem atual do paciente: ${request.message}`,
  ].join("\n");
}

function normalizeCareJourneyResponse(value: unknown): CareJourneyStructuredResponse {
  if (!isRecord(value)) return buildEmptyInvalidResponse("Resposta LLM não é um objeto JSON.");
  const suggestedActions = Array.isArray(value.suggestedActions)
    ? value.suggestedActions.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 4)
    : [];
  const severity = isClinicalSeverity(value.severity) ? value.severity : "uncertain";
  const confidence = value.confidence === "medium" ? "medium" : "low";

  return {
    assistantMessage: typeof value.assistantMessage === "string" ? value.assistantMessage.trim() : "",
    sessionSummary: typeof value.sessionSummary === "string" ? value.sessionSummary.trim() : "",
    nextQuestion: typeof value.nextQuestion === "string" ? value.nextQuestion.trim() || null : null,
    suggestedActions,
    escalationRecommended: typeof value.escalationRecommended === "boolean" ? value.escalationRecommended : true,
    escalationReason: typeof value.escalationReason === "string" ? value.escalationReason.trim() || null : null,
    severity,
    confidence,
    patientCanSaveToMemory: typeof value.patientCanSaveToMemory === "boolean" ? value.patientCanSaveToMemory : false,
  };
}

function validateCareJourneyResponse(response: CareJourneyStructuredResponse): string[] {
  const errors: string[] = [];
  if (response.assistantMessage.length < 80) errors.push("assistant_message_too_short");
  if (response.assistantMessage.length > 1800) errors.push("assistant_message_too_long");
  if (response.sessionSummary.length < 10) errors.push("session_summary_too_short");
  if (response.sessionSummary.length > 500) errors.push("session_summary_too_long");
  if (response.suggestedActions.length < 1 || response.suggestedActions.length > 4) errors.push("invalid_suggested_actions_count");
  if (!/não substitui|nao substitui|educativa/i.test(response.assistantMessage)) errors.push("missing_disclaimer_or_educational_scope");
  if (response.escalationRecommended && !response.escalationReason) errors.push("escalation_requires_reason");
  if (!response.escalationRecommended && response.severity === "urgent") errors.push("urgent_requires_escalation");
  return errors;
}

function detectUnsafeCareJourneyOutput(response: CareJourneyStructuredResponse): string[] {
  return Array.from(new Set([
    ...detectUnsafeClinicalOutput(response.assistantMessage),
    ...detectUnsafeClinicalOutput(response.sessionSummary),
    ...response.suggestedActions.flatMap((action) => detectUnsafeClinicalOutput(action)),
  ]));
}

function fallback(
  response: CareJourneyStructuredResponse,
  status: Exclude<CareJourneyGatewayAuditStatus, "not_attempted_guardrail_limited" | "enhanced">,
  reason: string,
  postGuardrailViolations: string[],
  inputTokensEst: number,
  outputTokensEst: number,
  latencyMs: number,
  executionStatus: CareJourneyGatewayExecutionStatus = "fallback",
): CareJourneyGatewayResult {
  return withAudit(response, {
    attempted: true,
    status,
    executionStatus,
    reason,
    logicalProvider: "deterministic_fallback",
    postGuardrailViolations,
    inputTokensEst,
    outputTokensEst,
    latencyMs,
  });
}

function withAudit(
  response: CareJourneyStructuredResponse,
  params: Omit<CareJourneyGatewayAudit, "promptId" | "schemaName" | "policyVersion" | "modelCapability">,
): CareJourneyGatewayResult {
  return {
    response,
    audit: {
      ...params,
      promptId: CARE_JOURNEY_PROMPT_ID,
      schemaName: CARE_JOURNEY_SCHEMA_NAME,
      policyVersion: CLINICAL_POLICY_VERSION,
      modelCapability: "care_journey_response",
    },
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

function parseCareJourneyJSON(content: string):
  | { ok: true; value: unknown }
  | { ok: false; status: "fallback_invalid_json" | "fallback_invalid_schema"; reason: string } {
  try {
    return { ok: true, value: JSON.parse(content) };
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { ok: false, status: "fallback_invalid_json", reason: "LLM content was not valid JSON." };
    try {
      return { ok: true, value: JSON.parse(jsonMatch[0]) };
    } catch {
      return { ok: false, status: "fallback_invalid_json", reason: "LLM content contained malformed JSON." };
    }
  }
}

function buildEmptyInvalidResponse(reason: string): CareJourneyStructuredResponse {
  return {
    assistantMessage: `${reason} ${MEDICAL_DISCLAIMER}`,
    sessionSummary: reason,
    nextQuestion: null,
    suggestedActions: ["Revisar a informação com profissional habilitado."],
    escalationRecommended: true,
    escalationReason: reason,
    severity: "uncertain",
    confidence: "low",
    patientCanSaveToMemory: false,
  };
}

function cleanSingleLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function estimateTokens(value: string): number {
  return Math.max(1, Math.ceil(value.length / 4));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isClinicalSeverity(value: unknown): value is ClinicalSeverity {
  return value === "educational" || value === "uncertain" || value === "urgent";
}

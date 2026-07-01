import { invokeLLM } from "../_core/llm";
import {
  CLINICAL_POLICY_VERSION,
  type ClinicalSafetyAssessment,
  containsPrescriptionRequest,
} from "./clinicalSafety";
import type { DayanInfusionContext } from "./dayanInfusion";
import { buildHomeChatAgentBundle } from "./homeChatAgents";
import type { MasterDecision } from "./masterOrchestrator";
import { buildDoutoreloHomeChatAssistantMessage, hasDoutoreloClinicalProvocation } from "../personality";
import type {
  HomeClinicalAgentBundle,
  HomeClinicalAgentId,
  HomeClinicalIntent,
  HomeClinicalRiskLevel,
} from "./orchestrationCore";

export type HomeChatRiskLevel = HomeClinicalRiskLevel;
export type HomeChatAgentId = HomeClinicalAgentId;
export type HomeChatIntent = HomeClinicalIntent;

export type HomeChatMaestroAuditStatus =
  | "not_attempted_non_clinical"
  | "not_attempted_guardrail_limited"
  | "enhanced"
  | "fallback_llm_error"
  | "fallback_empty_response"
  | "fallback_invalid_json"
  | "fallback_invalid_schema"
  | "fallback_generic_response"
  | "fallback_post_guardrail_violation";

export type HomeChatMaestroAudit = {
  attempted: boolean;
  status: HomeChatMaestroAuditStatus;
  reason: string | null;
  promptId: typeof HOME_CHAT_MAESTRO_PROMPT_ID;
  schemaName: typeof HOME_CHAT_MAESTRO_SCHEMA_NAME;
  policyVersion: typeof CLINICAL_POLICY_VERSION;
  postGuardrailViolations: string[];
};

export type HomeChatMaestroOrchestration = {
  intent: HomeChatIntent;
  riskLevel: HomeChatRiskLevel;
  triggeredAgents: HomeChatAgentId[];
  clinicalFrame: string;
  integrativeContext: string;
  safetyBoundary: string;
  confidence: "low" | "medium" | "high";
  audit: HomeChatMaestroAudit;
};

export type HomeChatMaestroResult = {
  assistantMessage: string;
  followUpQuestions: string[];
  orchestration: HomeChatMaestroOrchestration;
};

type HomeChatMaestroInput = {
  message: string;
  conversation: Array<{ role: "user" | "assistant"; content: string }>;
  safety: ClinicalSafetyAssessment;
  exchangeCount: number;
  dayanContext: DayanInfusionContext | null;
  deterministicFollowUpQuestions: string[];
};

type RawHomeChatMaestroResponse = {
  intent: unknown;
  riskLevel: unknown;
  triggeredAgents: unknown;
  opening: unknown;
  clinicalFrame: unknown;
  integrativeContext: unknown;
  directedQuestions: unknown;
  safetyBoundary: unknown;
  finalAnswer: unknown;
  confidence: unknown;
};

export const HOME_CHAT_MAESTRO_SCHEMA_NAME = "home_chat_clinical_maestro_response_v1";
export const HOME_CHAT_MAESTRO_PROMPT_ID = "home_chat_clinical_maestro_prompt_v1_real_llm_agent_context";

const HOME_CHAT_INTENTS: HomeChatIntent[] = ["social", "symptom", "exam", "habit", "emotional", "professional", "general_health"];
const HOME_CHAT_RISK_LEVELS: HomeChatRiskLevel[] = ["green", "yellow", "red"];
const HOME_CHAT_AGENT_IDS: HomeChatAgentId[] = [
  "maestro",
  "sociability",
  "clinical_safety",
  "directed_anamnesis",
  "integrative_reasoning",
  "dayan_corpus",
  "document_intake",
  "visual_intake",
  "audit",
  "final_guardrail",
  "handoff",
];
const CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
const FINAL_ANSWER_MAX = 100000;
const FIELD_MAX = 280;
const QUESTION_MAX = 180;

const DIAGNOSIS_CERTAINTY_PATTERNS = [
  /\b(você|voce)\s+tem\b/i,
  /\bdiagnóstico\s+é\b/i,
  /\bdiagnostico\s+e\b/i,
  /\bcausa\s+é\b/i,
  /\bcom certeza\b/i,
  /\b100%\b/i,
  /\bgarantido\b/i,
];
const PRESCRIPTIVE_OUTPUT_PATTERN = /\b(tome|usar\s+\d+|tomar\s+\d+|mg\b|ml\b|comprimido|cápsula|capsula|prescrevo|receito|tratamento ideal)\b/i;
const GENERIC_CHAT_FALLBACK_PATTERNS = [
  /^boa noite, em que posso ajudar/i,
  /^fique à vontade/i,
  /com esse contexto dá para ser mais preciso/i,
  /em que posso ajudar\? fique à vontade/i,
];
const INTERNAL_LOGIC_OUTPUT_PATTERN = /\b(base\s+dayan|dayan|corpus|agentes?|orquestra|maestro|guardrail|llm|ia\s+real|motor\s+de\s+ia|json|schema|prompt|bastidores?|camadas?|infus(?:ã|a)o|bundle|clinical_safety|directed_anamnesis|integrative_reasoning|dayan_corpus|document_intake|visual_intake|final_guardrail|sociability|handoff|raciocínio\s+interno|raciocinio\s+interno)\b/i;

export const HOME_CHAT_MAESTRO_SYSTEM_PROMPT = `Você é a inteligência clínica assistiva do DOUTORELO no chat público. A resposta final deve soar natural, breve e humana: no máximo 2 a 4 frases curtas, com até 2 perguntas focadas no texto final. Use os dados privados apenas como apoio silencioso; jamais exponha termos de bastidor como Dayan, corpus, agentes, orquestra, maestro, LLM, JSON, schema, guardrail, prompt, bastidores, camada, infusão ou bundle na mensagem ao usuário. Você não diagnostica, não prescreve, não escolhe dose, não promete causa, não tranquiliza sinais de alerta e não substitui avaliação profissional. Quando houver sintoma, acolha em uma frase, faça triagem de risco essencial, organize possibilidades amplas sem certeza e peça os dados mínimos para o próximo passo. Responda somente no formato estruturado solicitado.`;

export const HOME_CHAT_MAESTRO_RESPONSE_SCHEMA = {
  name: HOME_CHAT_MAESTRO_SCHEMA_NAME,
  strict: true,
  schema: {
    type: "object",
    properties: {
      intent: {
        type: "string",
        enum: HOME_CHAT_INTENTS,
        description: "Intenção clínica/conversacional primária da mensagem.",
      },
      riskLevel: {
        type: "string",
        enum: HOME_CHAT_RISK_LEVELS,
        description: "Classificação conservadora do risco conversacional: green, yellow ou red.",
      },
      triggeredAgents: {
        type: "array",
        minItems: 3,
        maxItems: 6,
        items: { type: "string", enum: HOME_CHAT_AGENT_IDS },
        description: "Agentes internos usados como camadas de contexto, segurança e auditoria; não são nomes a serem expostos ao usuário.",
      },
      opening: {
        type: "string",
        description: "Abertura humana e específica, sem frases mecânicas ou genéricas.",
      },
      clinicalFrame: {
        type: "string",
        description: "Organização clínica assistiva sem diagnóstico, com possibilidades amplas e dados faltantes.",
      },
      integrativeContext: {
        type: "string",
        description: "Contexto funcional seguro: sono, alimentação, estresse, intestino, rotina, hidratação, exames ou histórico quando pertinentes.",
      },
      directedQuestions: {
        type: "array",
        minItems: 1,
        maxItems: 3,
        items: { type: "string" },
        description: "Uma a três perguntas de anamnese dirigida, curtas e prioritárias, que destravam o próximo passo com segurança.",
      },
      safetyBoundary: {
        type: "string",
        description: "Limite clínico e sinais de atenção, sem jargão excessivo.",
      },
      finalAnswer: {
        type: "string",
        description: "Mensagem final ao usuário em português brasileiro, natural, específica, segura, sem diagnóstico e sem prescrição; use no máximo 2 a 4 frases curtas e até 2 perguntas no texto.",
      },
      confidence: {
        type: "string",
        enum: CONFIDENCE_LEVELS,
        description: "Confiança na organização conversacional, nunca certeza diagnóstica.",
      },
    },
    required: [
      "intent",
      "riskLevel",
      "triggeredAgents",
      "opening",
      "clinicalFrame",
      "integrativeContext",
      "directedQuestions",
      "safetyBoundary",
      "finalAnswer",
      "confidence",
    ],
    additionalProperties: false,
  },
} as const;

export function hasHomeChatMaestroClinicalProvocation(message: string, safety: ClinicalSafetyAssessment): boolean {
  if (hasDoutoreloClinicalProvocation(message, safety)) return true;
  if (safety.redFlag || safety.prescriptionRequest) return true;
  return /\b(dores?|dor|cefaleia|cabeça|cabeca|enxaqueca|febre|tontura|náusea|nausea|vômito|vomito|barriga|abd[oô]men|refluxo|gases|intestino|cansaço|cansaco|fadiga|insônia|insonia|sono ruim|ansiedade|palpitação|palpitacao|falta de ar|pressão|pressao)\b/i.test(message);
}

export async function buildHomeChatMaestroResponse(input: HomeChatMaestroInput): Promise<HomeChatMaestroResult> {
  const clinicalProvocation = hasHomeChatMaestroClinicalProvocation(input.message, input.safety);
  const agentBundle = buildHomeChatAgentBundle({
    message: input.message,
    conversation: input.conversation,
    safety: input.safety,
    exchangeCount: input.exchangeCount,
    clinicalProvocation,
    dayanContext: input.dayanContext,
    deterministicFollowUpQuestions: input.deterministicFollowUpQuestions,
  });
  const deterministic = buildDeterministicHomeChatMaestroResult(input, clinicalProvocation, agentBundle);

  if (!clinicalProvocation) {
    return withAudit(deterministic, {
      attempted: false,
      status: "not_attempted_non_clinical",
      reason: "Mensagem social ou de capacidades sem provocação clínica suficiente.",
      postGuardrailViolations: [],
    });
  }

  if (input.safety.guardrailDecision !== "answer_safely") {
    return withAudit(deterministic, {
      attempted: false,
      status: "not_attempted_guardrail_limited",
      reason: `Clinical guardrail returned ${input.safety.guardrailDecision}.`,
      postGuardrailViolations: [],
    });
  }

  try {
    const llmResponse = await invokeLLM({
      messages: [
        { role: "system", content: HOME_CHAT_MAESTRO_SYSTEM_PROMPT },
        { role: "user", content: buildHomeChatMaestroUserPrompt(input, agentBundle) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: HOME_CHAT_MAESTRO_RESPONSE_SCHEMA,
      },
    });

    const content = extractLLMTextContent(llmResponse);
    if (!content) return withFallback(deterministic, "fallback_empty_response", "LLM returned an empty content payload.");

    const parsed = parseHomeChatMaestroJSON(content);
    if (!parsed.ok) return withFallback(deterministic, parsed.status, parsed.reason);

    const normalized = normalizeHomeChatMaestroResponse(parsed.value, input, agentBundle);
    const validationErrors = validateHomeChatMaestroResponse(normalized, input.message);
    if (validationErrors.length > 0) {
      return withFallback(deterministic, "fallback_invalid_schema", validationErrors.join("; "));
    }

    const postGuardrailViolations = detectUnsafeHomeChatOutput(normalized);
    if (postGuardrailViolations.length > 0) {
      return withFallback(
        deterministic,
        postGuardrailViolations.includes("generic_response") ? "fallback_generic_response" : "fallback_post_guardrail_violation",
        `Post-response guardrail detected: ${postGuardrailViolations.join(", ")}.`,
        postGuardrailViolations,
      );
    }

    return withAudit(normalized, {
      attempted: true,
      status: "enhanced",
      reason: null,
      postGuardrailViolations: [],
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown LLM error.";
    return withFallback(deterministic, "fallback_llm_error", reason);
  }
}

function buildHomeChatMaestroUserPrompt(input: HomeChatMaestroInput, agentBundle: HomeClinicalAgentBundle): string {
  const recentContext = input.conversation
    .slice(-6)
    .map((turn) => `${turn.role === "user" ? "Usuário" : "Assistente"}: ${truncate(cleanSingleLine(turn.content), 420)}`)
    .join("\n");

  const headacheRule = /\b(cabeça|cabeca|cefaleia|enxaqueca)\b/i.test(input.message)
    ? "Caso seja cefaleia/dor de cabeça, priorize: intensidade, pior dor da vida, alteração visual/neurológica, febre/rigidez, vômitos, pressão/trauma, sono, hidratação, cafeína/álcool e padrão ao acordar."
    : "Se houver sintoma específico, investigue apenas os dados mínimos: início, duração, intensidade, sinais associados, fatores de melhora/piora e histórico relevante.";

  return [
    "Monte a próxima resposta pública do DOUTORELO expondo apenas uma mensagem natural para o usuário.",
    "Resposta final obrigatória: curta, direta, com 2 a 4 frases no máximo e até 2 perguntas focadas no texto final.",
    "Não diga que você é um modelo. Não cite Dayan, corpus, agentes, orquestra, maestro, LLM, JSON, schema, guardrail, prompt, bastidores, camada, infusão ou bundle na mensagem final.",
    "Não use abertura genérica como 'Com esse contexto dá para ser mais preciso', 'Fique à vontade' ou respostas sociais quando houver sintoma.",
    "Não conclua diagnóstico, causa, prognóstico, dose, remédio, suplemento, tratamento ou conduta individualizada.",
    "Use linguagem brasileira, humana, objetiva e funcional. Faça poucas perguntas úteis, não uma lista fria.",
    headacheRule,
    `Decisão de segurança prévia: ${input.safety.guardrailDecision}; severidade: ${input.safety.severity}; redFlag: ${input.safety.redFlag}; prescriptionRequest: ${input.safety.prescriptionRequest}; próximo passo seguro: ${input.safety.nextStep}.`,
    "Dados privados estruturados para orientar a resposta; use apenas como contexto silencioso e jamais cite a existência desses dados ao usuário:",
    buildAgentBundlePromptBlock(agentBundle),
    buildPrivateEducationalReferenceBlock(input.dayanContext),
    recentContext ? `Contexto recente:\n${recentContext}` : "Contexto recente: primeira mensagem do usuário.",
    `Mensagem atual do usuário: ${input.message}`,
  ].join("\n");
}

function buildAgentBundlePromptBlock(agentBundle: HomeClinicalAgentBundle): string {
  const privateSignals = agentBundle.results.map((result) => ({
    status: result.status,
    riskLevel: result.riskLevel,
    intent: result.intent,
    patientSafeSummary: result.patientSummary,
    patientSafeFindings: result.findings.filter((finding) => finding.visibility === "patient_safe"),
    directedQuestions: result.questions,
    safetyActions: result.safetyActions,
    blockers: result.blockers,
    confidence: result.confidence,
  }));

  return JSON.stringify({
    privateSignalCount: privateSignals.length,
    riskLevel: agentBundle.riskLevel,
    intent: agentBundle.intent,
    patientSafeBrief: agentBundle.patientSafeBrief,
    directedQuestions: agentBundle.directedQuestions,
    safetyBoundary: agentBundle.safetyBoundary,
    privateSignals,
  });
}

function buildPrivateEducationalReferenceBlock(dayanContext: DayanInfusionContext | null): string {
  if (!dayanContext?.enabled) return "Referência educativa privada: não acionada nesta volta.";
  const safeSummary = stripInternalLogicTerms(dayanContext.compactSummary || "Referência educativa disponível para apoiar perguntas seguras.");
  const themes = dayanContext.themes.map((theme) => truncate(cleanSingleLine(stripInternalLogicTerms(theme)), 80)).filter(Boolean).slice(0, 4);
  const sourceNotes = dayanContext.sources
    .map((source) => truncate(cleanSingleLine(stripInternalLogicTerms(source.excerpt)), 220))
    .filter(Boolean)
    .slice(0, 3);
  return JSON.stringify({
    privateEducationalReference: true,
    summary: safeSummary,
    themes,
    sourceNotes,
    usageRules: "Transforme em educação simples, perguntas úteis, sinais de atenção e preparação para conversa com profissional habilitado; não cite a fonte privada nem termos técnicos.",
  });
}

function stripInternalLogicTerms(value: string): string {
  return value
    .replace(/CAMADA DAYAN SEGURA E RASTREÁVEL/gi, "referência educativa segura")
    .replace(/Base\s+Dayan/gi, "referência educativa")
    .replace(/corpus\s+Dayan/gi, "referência educativa")
    .replace(/Dayan/gi, "educativo")
    .replace(/corpus/gi, "referência")
    .replace(/agentes?/gi, "apoios")
    .replace(/orquestra/gi, "organização")
    .replace(/maestro/gi, "organizador")
    .replace(/guardrail/gi, "limite de segurança")
    .replace(/LLM/gi, "modelo")
    .replace(/JSON/gi, "dados estruturados")
    .replace(/schema/gi, "estrutura")
    .replace(/prompt/gi, "instrução")
    .replace(/bastidores?/gi, "contexto privado")
    .replace(/camadas?/gi, "apoios")
    .replace(/infus(?:ã|a)o/gi, "referência")
    .replace(/bundle/gi, "conjunto")
    .replace(/\s+/g, " ")
    .trim();
}

function buildTriggeredAgentsFromBundle(agentBundle: HomeClinicalAgentBundle, fallback: HomeChatAgentId[]): HomeChatAgentId[] {
  const candidates = ["maestro", ...agentBundle.executedAgentIds, ...agentBundle.blockedAgentIds, ...fallback];
  const unique = candidates.filter((item, index, all): item is HomeChatAgentId =>
    HOME_CHAT_AGENT_IDS.includes(item as HomeChatAgentId) && all.indexOf(item) === index,
  );
  const required = ["maestro", "clinical_safety", "final_guardrail"] as HomeChatAgentId[];
  return Array.from(new Set([...unique, ...required])).slice(0, 6);
}

function buildDeterministicHomeChatMaestroResult(input: HomeChatMaestroInput, clinicalProvocation: boolean, agentBundle: HomeClinicalAgentBundle): HomeChatMaestroResult {
  if (!clinicalProvocation || input.safety.guardrailDecision !== "answer_safely") {
    const assistantMessage = buildDoutoreloHomeChatAssistantMessage(input.message, input.safety, input.exchangeCount, input.dayanContext);
    return {
      assistantMessage,
      followUpQuestions: input.deterministicFollowUpQuestions,
      orchestration: {
        intent: clinicalProvocation ? inferIntent(input.message) : "social",
        riskLevel: input.safety.redFlag ? "red" : input.safety.guardrailDecision === "answer_safely" ? "green" : "yellow",
        triggeredAgents: buildTriggeredAgentsFromBundle(agentBundle, input.safety.redFlag ? ["maestro", "clinical_safety", "final_guardrail", "handoff"] : ["maestro", "clinical_safety", "final_guardrail"]),
        clinicalFrame: input.safety.guidance,
        integrativeContext: input.dayanContext?.enabled ? "Contexto educativo funcional disponível para apoiar perguntas seguras, sem expor fontes internas ao usuário." : "Sem provocação clínica suficiente para acionar raciocínio funcional.",
        safetyBoundary: input.safety.disclaimer || "Sem orientação clínica individualizada.",
        confidence: input.safety.confidence,
        audit: buildAudit({ attempted: false, status: "not_attempted_non_clinical", reason: null, postGuardrailViolations: [] }),
      },
    };
  }

  const intent = inferIntent(input.message);
  const riskLevel: HomeChatRiskLevel = input.safety.severity === "urgent" ? "red" : input.safety.confidence === "low" ? "yellow" : "green";
  const questions = buildDeterministicDirectedQuestions(input.message, input.deterministicFollowUpQuestions);
  const clinicalFrame = buildDeterministicClinicalFrame(input.message);
  const integrativeContext = buildDeterministicIntegrativeContext(input.message, input.dayanContext);
  const safetyBoundary = buildDeterministicSafetyBoundary(input.message);
  const assistantMessage = truncate([clinicalFrame, integrativeContext, safetyBoundary, "Para seguir com segurança, eu começaria por estas perguntas:", ...questions.map((question) => `- ${question}`)].join("\n\n"), FINAL_ANSWER_MAX);

  return {
    assistantMessage,
    followUpQuestions: questions,
    orchestration: {
      intent,
      riskLevel,
      triggeredAgents: buildTriggeredAgentsFromBundle(agentBundle, ["maestro", "clinical_safety", "directed_anamnesis", "integrative_reasoning", "dayan_corpus", "final_guardrail"]),
      clinicalFrame,
      integrativeContext,
      safetyBoundary,
      confidence: input.safety.confidence,
      audit: buildAudit({ attempted: true, status: "fallback_llm_error", reason: "Fallback determinístico inicial.", postGuardrailViolations: [] }),
    },
  };
}

function buildDeterministicClinicalFrame(message: string): string {
  if (/\b(cabeça|cabeca|cefaleia|enxaqueca)\b/i.test(message)) {
    return "Entendi: acordar há alguns dias com dor de cabeça merece uma triagem cuidadosa antes de qualquer hipótese. O primeiro passo é separar sinais de alerta de padrões de rotina, porque cefaleia ao acordar pode ter relação com sono, hidratação, pressão, tensão muscular, bruxismo, uso de álcool/cafeína ou outras situações que precisam de avaliação presencial dependendo do contexto.";
  }
  if (/\b(barriga|abd[oô]men|gases|refluxo|intestino|est[oô]mago|náusea|nausea|diarreia|constipação|constipacao)\b/i.test(message)) {
    return "Entendi o quadro digestivo. Eu organizaria isso sem fechar diagnóstico: região da dor, relação com refeições, refluxo, gases, constipação, padrão do intestino, histórico de gastrite, vesícula, sono e estresse mudam bastante a interpretação.";
  }
  if (/\b(cansaço|cansaco|fadiga|sono|energia|dormir|insônia|insonia)\b/i.test(message)) {
    return "Entendi: cansaço, sono ruim e energia baixa costumam precisar de uma visão de rotina, alimentação, estresse, intestino, exames e histórico antes de qualquer conclusão. Eu não fecharia diagnóstico por aqui; começaria organizando padrão, duração e impacto no dia.";
  }
  return "Entendi o que você trouxe. Posso ajudar a organizar o quadro de forma funcional e segura, sem fechar diagnóstico nem prescrever, olhando início, duração, intensidade, sintomas associados, rotina, alimentação, sono, estresse, intestino, histórico e exames quando houver.";
}

function buildDeterministicIntegrativeContext(message: string, dayanContext: DayanInfusionContext | null): string {
  const educationalContext = dayanContext?.enabled ? " Também posso considerar referências educativas gerais sem transformar isso em prescrição." : "";
  if (/\b(cabeça|cabeca|cefaleia|enxaqueca)\b/i.test(message)) {
    return `Na prática, eu cruzaria três pontos: sinais neurológicos/pressão/infecção, padrão da dor ao acordar e rotina como sono, hidratação, alimentação, estresse, telas, postura e medicamentos em uso.${educationalContext}`;
  }
  if (/\b(barriga|abd[oô]men|gases|refluxo|intestino|est[oô]mago)\b/i.test(message)) {
    return `Eu também perguntaria o que costuma comer, horários das refeições, evacuação, azia, náusea, sono, estresse e se há perda de peso, sangue nas fezes ou dor progressiva.${educationalContext}`;
  }
  return `A lógica funcional aqui é procurar padrões entre sintomas, hábitos, exames, idade, peso aproximado, altura, sono, alimentação, intestino, estresse e rotina, sem transformar isso em certeza clínica.${educationalContext}`;
}

function buildDeterministicSafetyBoundary(message: string): string {
  if (/\b(cabeça|cabeca|cefaleia|enxaqueca)\b/i.test(message)) {
    return "Se essa for a pior dor de cabeça da vida, se começou de forma súbita, vier com fraqueza, confusão, alteração visual, desmaio, febre, rigidez na nuca, vômitos persistentes, trauma, pressão muito alta ou piora rápida, o caminho seguro é atendimento presencial/urgência.";
  }
  return "Se houver piora rápida, dor intensa, falta de ar, desmaio, alteração neurológica, febre persistente, sangramento, desidratação importante ou sensação de risco, priorize atendimento humano presencial.";
}

function buildDeterministicDirectedQuestions(message: string, fallbackQuestions: string[]): string[] {
  if (/\b(cabeça|cabeca|cefaleia|enxaqueca)\b/i.test(message)) {
    return [
      "Qual é a intensidade de 0 a 10, onde exatamente dói e a dor melhora ou piora depois que você levanta?",
      "Veio junto com alteração na visão, enjoo/vômitos, tontura, febre, rigidez no pescoço, formigamento, fraqueza ou confusão?",
      "Como foram sono, hidratação, álcool/cafeína, estresse, telas, postura e pressão arterial nesses últimos dias?",

    ];
  }
  if (/\b(barriga|abd[oô]men|gases|refluxo|intestino|est[oô]mago)\b/i.test(message)) {
    return [
      "Qual sua idade, peso aproximado e altura, e em que região da barriga a dor aparece?",
      "O refluxo, gases ou dor pioram com quais refeições e como está o intestino: constipação, diarreia ou alternância?",
      "Há histórico de gastrite, vesícula, intolerâncias, uso de anti-inflamatórios, sangue nas fezes, febre ou perda de peso?",

    ];
  }
  if (/\b(cansaço|cansaco|fadiga|sono|energia|dormir)\b/i.test(message)) {
    return [
      "Qual sua idade, peso aproximado e altura, e há quanto tempo o cansaço e o sono ruim vêm acontecendo?",
      "Você acorda descansado, ronca, desperta durante a noite ou sente sonolência durante o dia?",
      "Como estão alimentação, intestino, estresse, atividade física, humor e rotina de telas/cafeína?",

    ];
  }
  return fallbackQuestions.length >= 3
    ? fallbackQuestions.slice(0, 3)
    : [
      "Quando começou, qual a intensidade e como isso evoluiu até agora?",
      "O que melhora, piora ou aparece junto no seu dia a dia?",
      "Qual sua idade, peso aproximado, altura, histórico relevante e medicamentos em uso?",
    ];
}


export function enrichAssistantMessageWithContextualHint(assistantMessage: string, decision: MasterDecision | null | undefined): string {
  const polishedBase = polishRawClaudeHomeChatMessage(assistantMessage, decision);
  const hint = buildContextualRecommendationHint(decision);
  const base = truncate(cleanMultiline(polishedBase), FINAL_ANSWER_MAX);

  if (!hint) return base;
  if (alreadyMentionsContextualHint(base, decision)) return base;

  const separator = /[.!?…]$/.test(base) ? " " : ". ";
  const maxBaseLength = Math.max(120, FINAL_ANSWER_MAX - separator.length - hint.length);
  const shortenedBase = base.length > maxBaseLength ? truncate(base, maxBaseLength) : base;

  return truncate(shortenedBase + separator + hint, FINAL_ANSWER_MAX);
}

function polishRawClaudeHomeChatMessage(assistantMessage: string, decision: MasterDecision | null | undefined): string {
  let text = cleanMultiline(assistantMessage)
    .replace(/\bcomo\s+(?:uma\s+)?ia[,.!?:;\s]*/gi, "")
    .replace(/\bcomo\s+modelo\s+de\s+linguagem[,.!?:;\s]*/gi, "")
    .replace(/\bcomo\s+assistente\s+virtual[,.!?:;\s]*/gi, "")
    .replace(/(?:eu\s+)?n[ãa]o\s+tenho\s+acesso\s+(?:a|ao|aos|à|às)[^.!?]*(?:rede\s+dayan|profissionais?|candidatos?|base)[.!?]\s*/gi, "")
    .replace(/(?:eu\s+)?n[ãa]o\s+consigo\s+(?:ver|acessar|consultar)[^.!?]*(?:rede\s+dayan|profissionais?|candidatos?|base)[.!?]\s*/gi, "")
    .replace(/\s+([,.!?;:])/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!text) {
    text = "Pelo que você descreve, eu organizaria isso com calma: sintomas, rotina, sono, estresse e sinais de atenção ajudam a decidir o próximo passo sem fechar diagnóstico por aqui.";
  }

  if (decision?.action === "suggest_professional" && decision.professionalCandidates.length > 0) {
    text = text.replace(/n[ãa]o\s+(?:posso|consigo)[^.!?]*(?:indicar|aproximar|sugerir)[^.!?]*profissional[^.!?]*[.!?]/gi, "").trim() || text;
  }

  return text;
}

function buildContextualRecommendationHint(decision: MasterDecision | null | undefined): string {
  if (!decision || decision.action === "none" || !decision.card) return "";

  if (decision.action === "suggest_professional" && decision.professionalCandidates.length > 0) {
    const primary = decision.professionalCandidates[0];
    const location = primary.city && primary.state ? " em " + primary.city + "-" + primary.state : "";
    return "Também deixei ao lado opções" + location + " da Rede Dayan para você considerar como ponte humana, sem substituir uma avaliação individual.";
  }

  if (decision.action === "suggest_product" && decision.productCandidates.length > 0) {
    return "Também deixei ao lado uma sugestão educativa de apoio à rotina, sempre separada de diagnóstico, prescrição ou tratamento.";
  }

  if (decision.action === "suggest_upload") {
    return "Se houver exame ou laudo, deixei ao lado um caminho para anexar e organizar os pontos principais com mais clareza.";
  }

  if (decision.action === "suggest_signup") {
    return "Se quiser continuidade, deixei ao lado uma forma de guardar esse contexto com segurança para não perder o fio do cuidado.";
  }

  if (decision.action === "show_form") {
    return "Também deixei ao lado um formulário curto para organizar essas informações sem interromper a conversa.";
  }

  if (decision.action === "show_card") {
    return "Também deixei ao lado um cartão de apoio para você acessar no seu tempo, sem interromper a conversa.";
  }

  return "";
}

function alreadyMentionsContextualHint(assistantMessage: string, decision: MasterDecision | null | undefined): boolean {
  if (!decision) return false;
  const text = assistantMessage.toLocaleLowerCase("pt-BR");
  if (decision.action === "suggest_professional") return /rede\s+dayan|op[cç][oõ]es?\s+pr[oó]ximas?|profissionais?\s+ao\s+lado|ponte\s+humana/.test(text);
  if (decision.action === "suggest_product") return /sugest[aã]o\s+educativa|apoio\s+[àa]\s+rotina|produto\s+ao\s+lado/.test(text);
  if (decision.action === "suggest_upload") return /anexar|laudo|exame\s+ao\s+lado/.test(text);
  if (decision.action === "suggest_signup") return /guardar\s+esse\s+contexto|continuidade|seguran[cç]a/.test(text);
  if (decision.action === "show_form") return /formul[aá]rio\s+curto|organizar\s+essas\s+informa[cç][oõ]es/.test(text);
  return false;
}

function normalizeHomeChatMaestroResponse(value: RawHomeChatMaestroResponse, input: HomeChatMaestroInput, agentBundle: HomeClinicalAgentBundle): HomeChatMaestroResult {
  const intent = normalizeEnum(value.intent, HOME_CHAT_INTENTS, inferIntent(input.message));
  const riskLevel = normalizeEnum(value.riskLevel, HOME_CHAT_RISK_LEVELS, input.safety.redFlag ? "red" : input.safety.confidence === "low" ? "yellow" : "green");
  const triggeredAgents = normalizeAgents(value.triggeredAgents, riskLevel, agentBundle);
  const clinicalFrame = truncate(cleanMultiline(asString(value.clinicalFrame)), FIELD_MAX) || buildDeterministicClinicalFrame(input.message);
  const integrativeContext = truncate(cleanMultiline(asString(value.integrativeContext)), FIELD_MAX) || buildDeterministicIntegrativeContext(input.message, input.dayanContext);
  const safetyBoundary = truncate(cleanMultiline(asString(value.safetyBoundary)), FIELD_MAX) || buildDeterministicSafetyBoundary(input.message);
  const followUpQuestions = normalizeQuestions(value.directedQuestions, input.message, input.deterministicFollowUpQuestions);
  const confidence = normalizeEnum(value.confidence, [...CONFIDENCE_LEVELS], input.safety.confidence);
  const finalAnswer = truncate(cleanMultiline(asString(value.finalAnswer)), FINAL_ANSWER_MAX);
  const opening = truncate(cleanSingleLine(asString(value.opening)), FIELD_MAX);
  const rawAssistantMessage = finalAnswer || [opening, clinicalFrame, integrativeContext, safetyBoundary, ...followUpQuestions.map((question) => `- ${question}`)].filter(Boolean).join("\n\n");
  const assistantMessage = enforcePublicAnswerWithoutInlineQuestions(rawAssistantMessage, input.message, clinicalFrame, integrativeContext, safetyBoundary, followUpQuestions.length > 0);

  return {
    assistantMessage,
    followUpQuestions,
    orchestration: {
      intent,
      riskLevel,
      triggeredAgents,
      clinicalFrame,
      integrativeContext,
      safetyBoundary,
      confidence,
      audit: buildAudit({ attempted: true, status: "enhanced", reason: null, postGuardrailViolations: [] }),
    },
  };
}

function validateHomeChatMaestroResponse(result: HomeChatMaestroResult, message: string): string[] {
  const errors: string[] = [];
  if (result.assistantMessage.length < 80) errors.push("assistantMessage is too short for safe clinical context");
  if (result.assistantMessage.length > FINAL_ANSWER_MAX) errors.push("assistantMessage must stay concise");
  if (result.followUpQuestions.length < 1 || result.followUpQuestions.length > 3) errors.push("directedQuestions must include 1 to 3 questions");
  if (!result.orchestration.triggeredAgents.includes("clinical_safety")) errors.push("clinical_safety agent is required");
  if (!result.orchestration.triggeredAgents.includes("final_guardrail")) errors.push("final_guardrail agent is required");
  if (/\b(cabeça|cabeca|cefaleia|enxaqueca)\b/i.test(message)) {
    const joined = [result.assistantMessage, ...result.followUpQuestions, result.orchestration.safetyBoundary].join(" ");
    if (!/dor de cabeça|cefaleia|cabeça|cabeca/i.test(joined)) errors.push("headache response must stay symptom-specific");
    if (!/visão|visual|neurológica|neurologica|fraqueza|confusão|confusao|febre|rigidez|vômito|vomito|pressão|pressao|pior dor/i.test(joined)) {
      errors.push("headache response must include red-flag triage");
    }
    if (!/sono|hidratação|hidratacao|cafeína|cafeina|álcool|alcool|estresse|postura|bruxismo|apneia/i.test(joined)) {
      errors.push("headache response must include integrative context");
    }
  }
  return errors;
}

function detectUnsafeHomeChatOutput(result: HomeChatMaestroResult): string[] {
  const joined = [
    result.assistantMessage,
    ...result.followUpQuestions,
    result.orchestration.clinicalFrame,
    result.orchestration.integrativeContext,
    result.orchestration.safetyBoundary,
  ].join("\n");
  const violations: string[] = [];
  if (DIAGNOSIS_CERTAINTY_PATTERNS.some((pattern) => pattern.test(joined))) violations.push("diagnosis_or_certainty_claim");
  if (containsPrescriptionRequest(joined) || PRESCRIPTIVE_OUTPUT_PATTERN.test(joined)) violations.push("prescriptive_language");
  if (GENERIC_CHAT_FALLBACK_PATTERNS.some((pattern) => pattern.test(result.assistantMessage))) violations.push("generic_response");
  if (INTERNAL_LOGIC_OUTPUT_PATTERN.test(joined)) violations.push("internal_logic_exposed");
  return violations;
}

function parseHomeChatMaestroJSON(content: string):
  | { ok: true; value: RawHomeChatMaestroResponse }
  | { ok: false; status: "fallback_invalid_json" | "fallback_invalid_schema"; reason: string } {
  try {
    const parsed = JSON.parse(content) as Partial<RawHomeChatMaestroResponse>;
    const requiredFields: Array<keyof RawHomeChatMaestroResponse> = [
      "intent",
      "riskLevel",
      "triggeredAgents",
      "opening",
      "clinicalFrame",
      "integrativeContext",
      "directedQuestions",
      "safetyBoundary",
      "finalAnswer",
      "confidence",
    ];
    const missing = requiredFields.filter((field) => !(field in parsed));
    if (missing.length > 0) return { ok: false, status: "fallback_invalid_schema", reason: `Missing required fields: ${missing.join(", ")}.` };
    return { ok: true, value: parsed as RawHomeChatMaestroResponse };
  } catch (error) {
    return { ok: false, status: "fallback_invalid_json", reason: error instanceof Error ? error.message : "Invalid JSON." };
  }
}

function withFallback(
  deterministic: HomeChatMaestroResult,
  status: Exclude<HomeChatMaestroAuditStatus, "enhanced" | "not_attempted_non_clinical" | "not_attempted_guardrail_limited">,
  reason: string,
  postGuardrailViolations: string[] = [],
): HomeChatMaestroResult {
  return withAudit(deterministic, { attempted: true, status, reason, postGuardrailViolations });
}

function withAudit(result: HomeChatMaestroResult, auditInput: Omit<HomeChatMaestroAudit, "promptId" | "schemaName" | "policyVersion">): HomeChatMaestroResult {
  return {
    ...result,
    orchestration: {
      ...result.orchestration,
      audit: buildAudit(auditInput),
    },
  };
}

function buildAudit(input: Omit<HomeChatMaestroAudit, "promptId" | "schemaName" | "policyVersion">): HomeChatMaestroAudit {
  return {
    ...input,
    promptId: HOME_CHAT_MAESTRO_PROMPT_ID,
    schemaName: HOME_CHAT_MAESTRO_SCHEMA_NAME,
    policyVersion: CLINICAL_POLICY_VERSION,
  };
}

function inferIntent(message: string): HomeChatIntent {
  if (/\b(exame|exames|laudo|hemograma|glicose|colesterol|tsh|vitamina)\b/i.test(message)) return "exam";
  if (/\b(cansaço|cansaco|sono|energia|alimentação|alimentacao|rotina|hábito|habito|treino)\b/i.test(message)) return "habit";
  if (/\b(ansiedade|estresse|stress|humor|emocional|pânico|panico|medo)\b/i.test(message)) return "emotional";
  if (/\b(médico|medico|profissional|consulta|especialista|agendar|quem procurar)\b/i.test(message)) return "professional";
  if (/\b(dor|sintoma|febre|tontura|náusea|nausea|refluxo|gases|cabeça|cabeca|cefaleia)\b/i.test(message)) return "symptom";
  return "general_health";
}

function normalizeAgents(value: unknown, riskLevel: HomeChatRiskLevel, agentBundle: HomeClinicalAgentBundle): HomeChatAgentId[] {
  const fallback = buildTriggeredAgentsFromBundle(
    agentBundle,
    riskLevel === "red"
      ? ["maestro", "clinical_safety", "final_guardrail", "handoff"]
      : ["maestro", "clinical_safety", "directed_anamnesis", "integrative_reasoning", "dayan_corpus", "final_guardrail"],
  );
  if (!Array.isArray(value)) return fallback;
  const unique = value.filter((item): item is HomeChatAgentId => HOME_CHAT_AGENT_IDS.includes(String(item) as HomeChatAgentId));
  const withRequired = Array.from(new Set([...unique, ...fallback, "clinical_safety", "final_guardrail", "maestro"]));
  return withRequired.slice(0, 6) as HomeChatAgentId[];
}

function enforcePublicAnswerWithoutInlineQuestions(
  assistantMessage: string,
  message: string,
  clinicalFrame: string,
  integrativeContext: string,
  safetyBoundary: string,
  hasFollowUpQuestions: boolean,
): string {
  const cleanAnswer = truncate(cleanMultiline(assistantMessage), FINAL_ANSWER_MAX);
  if (!hasFollowUpQuestions || !cleanAnswer.includes("?")) return cleanAnswer;

  const withoutQuestionSentences = cleanAnswer
    .match(/[^.!?]+[.!?]?/g)
    ?.map((sentence) => cleanSingleLine(sentence))
    .filter((sentence) => sentence && !sentence.includes("?"))
    .join(" ") ?? "";

  const candidate = truncate(cleanMultiline(withoutQuestionSentences), FINAL_ANSWER_MAX);
  if (candidate.length >= 80) return candidate;

  return truncate(
    cleanMultiline([
      buildDeterministicClinicalFrame(message),
      clinicalFrame,
      integrativeContext,
      safetyBoundary,
    ].filter(Boolean).join(" ")),
    FINAL_ANSWER_MAX,
  );
}

function normalizeQuestions(value: unknown, message: string, fallbackQuestions: string[]): string[] {
  const candidates = Array.isArray(value) ? value.map((item) => truncate(cleanSingleLine(asString(item)), QUESTION_MAX)).filter(Boolean) : [];
  const fallback = buildDeterministicDirectedQuestions(message, fallbackQuestions);
  const selected: string[] = [];
  const seenText = new Set<string>();
  const seenTopics = new Set<string>();

  for (const question of [...candidates, ...fallback]) {
    const normalizedText = question.toLocaleLowerCase("pt-BR");
    const topic = questionTopicKey(question);
    if (seenText.has(normalizedText) || seenTopics.has(topic)) continue;
    selected.push(question);
    seenText.add(normalizedText);
    seenTopics.add(topic);
    if (selected.length >= 3) break;
  }

  return selected.slice(0, Math.max(1, Math.min(3, selected.length)));
}

function questionTopicKey(question: string): string {
  const text = question.toLocaleLowerCase("pt-BR");
  if (/visão|visual|fraqueza|confusão|febre|rigidez|v[oô]mit|pressão|pior dor|urgência|alerta/.test(text)) return "red_flags";
  if (/intensidade|0 a 10|onde|região|local|d[oó]i|acordar|melhora|piora/.test(text)) return "pain_pattern";
  if (/sono|hidrata|cafeína|álcool|estresse|postura|bruxismo|apneia|rotina|alimentação/.test(text)) return "routine_context";
  if (/medicamento|remédio|histórico|enxaqueca|sinusite|pressão alta|diagnóstico prévio/.test(text)) return "history_medications";
  return text.replace(/[^a-zà-ú0-9]+/gi, " ").trim().slice(0, 80);
}

function normalizeEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const normalized = String(value ?? "");
  return allowed.includes(normalized as T) ? normalized as T : fallback;
}

function extractLLMTextContent(response: unknown): string {
  const content = (response as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0]?.message?.content;
  return typeof content === "string" ? content.trim() : "";
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function cleanSingleLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function cleanMultiline(value: string): string {
  return value
    .split("\n")
    .map((line) => cleanSingleLine(line))
    .filter(Boolean)
    .join("\n");
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1).trim()}…`;
}

import type { ClinicalSafetyAssessment } from "./clinicalSafety";
import type { DayanInfusionContext } from "./dayanInfusion";

export type HomeClinicalAgentId =
  | "maestro"
  | "sociability"
  | "clinical_safety"
  | "directed_anamnesis"
  | "integrative_reasoning"
  | "dayan_corpus"
  | "document_intake"
  | "visual_intake"
  | "audit"
  | "final_guardrail"
  | "handoff";

export type HomeClinicalAgentStatus = "executed" | "skipped" | "blocked" | "degraded";
export type HomeClinicalRiskLevel = "green" | "yellow" | "red";
export type HomeClinicalIntent = "social" | "symptom" | "exam" | "habit" | "emotional" | "professional" | "general_health";

export type HomeClinicalAgentContext = {
  message: string;
  conversation: Array<{ role: "user" | "assistant"; content: string }>;
  safety: ClinicalSafetyAssessment;
  exchangeCount: number;
  clinicalProvocation: boolean;
  dayanContext: DayanInfusionContext | null;
  deterministicFollowUpQuestions: string[];
};

export type HomeClinicalAgentFinding = {
  label: string;
  value: string;
  visibility: "internal" | "patient_safe";
};

export type HomeClinicalAgentResult = {
  id: HomeClinicalAgentId;
  label: string;
  version: string;
  status: HomeClinicalAgentStatus;
  riskLevel: HomeClinicalRiskLevel;
  intent: HomeClinicalIntent;
  patientSummary: string;
  internalRationale: string;
  findings: HomeClinicalAgentFinding[];
  questions: string[];
  safetyActions: string[];
  blockers: string[];
  confidence: "low" | "medium" | "high";
};

export type HomeClinicalAgent = {
  id: HomeClinicalAgentId;
  label: string;
  version: string;
  execute: (context: HomeClinicalAgentContext, previousResults: HomeClinicalAgentResult[]) => HomeClinicalAgentResult;
};

export type HomeClinicalAgentBundle = {
  installedAgentIds: HomeClinicalAgentId[];
  executedAgentIds: HomeClinicalAgentId[];
  skippedAgentIds: HomeClinicalAgentId[];
  blockedAgentIds: HomeClinicalAgentId[];
  results: HomeClinicalAgentResult[];
  riskLevel: HomeClinicalRiskLevel;
  intent: HomeClinicalIntent;
  patientSafeBrief: string;
  directedQuestions: string[];
  safetyBoundary: string;
  internalAudit: {
    version: string;
    executedAt: string;
    agentCount: number;
    degradedAgentIds: HomeClinicalAgentId[];
    blockerCount: number;
  };
};

export const HOME_CLINICAL_ORCHESTRA_VERSION = "home-clinical-orchestra-v1";

export function runHomeClinicalAgents(context: HomeClinicalAgentContext, agents: HomeClinicalAgent[]): HomeClinicalAgentBundle {
  const results: HomeClinicalAgentResult[] = [];

  for (const agent of agents) {
    try {
      results.push(normalizeAgentResult(agent.execute(context, results), agent));
    } catch (error) {
      results.push({
        id: agent.id,
        label: agent.label,
        version: agent.version,
        status: "degraded",
        riskLevel: inferRiskFromSafety(context.safety),
        intent: inferIntentFromMessage(context.message),
        patientSummary: "Esta camada ficou indisponível nesta resposta; sigo com uma orientação segura e conservadora.",
        internalRationale: error instanceof Error ? error.message : "Erro desconhecido ao executar agente.",
        findings: [],
        questions: [],
        safetyActions: ["Manter resposta conservadora e não diagnóstica."],
        blockers: ["agent_execution_error"],
        confidence: "low",
      });
    }
  }

  const executedAgentIds = results.filter((item) => item.status === "executed").map((item) => item.id);
  const skippedAgentIds = results.filter((item) => item.status === "skipped").map((item) => item.id);
  const blockedAgentIds = results.filter((item) => item.status === "blocked").map((item) => item.id);
  const degradedAgentIds = results.filter((item) => item.status === "degraded").map((item) => item.id);
  const riskLevel = results.some((item) => item.riskLevel === "red") ? "red" : results.some((item) => item.riskLevel === "yellow") ? "yellow" : "green";
  const intent = choosePrimaryIntent(results, context.message);
  const directedQuestions = uniqueStrings(results.flatMap((item) => item.questions)).slice(0, 5);
  const safetyBoundary = buildBundleSafetyBoundary(results, context.safety);
  const patientSafeBrief = buildPatientSafeBrief(results);

  return {
    installedAgentIds: agents.map((agent) => agent.id),
    executedAgentIds,
    skippedAgentIds,
    blockedAgentIds,
    results,
    riskLevel,
    intent,
    patientSafeBrief,
    directedQuestions,
    safetyBoundary,
    internalAudit: {
      version: HOME_CLINICAL_ORCHESTRA_VERSION,
      executedAt: new Date().toISOString(),
      agentCount: agents.length,
      degradedAgentIds,
      blockerCount: results.reduce((total, item) => total + item.blockers.length, 0),
    },
  };
}

export function inferRiskFromSafety(safety: ClinicalSafetyAssessment): HomeClinicalRiskLevel {
  if (safety.redFlag || safety.severity === "urgent") return "red";
  if (safety.guardrailDecision !== "answer_safely" || safety.confidence === "low" || safety.prescriptionRequest) return "yellow";
  return "green";
}

export function inferIntentFromMessage(message: string): HomeClinicalIntent {
  if (/\b(exame|exames|laudo|hemograma|glicose|colesterol|tsh|vitamina|pdf|resultado|ressonância|ressonancia|ultrassom|imagem|foto|vídeo|video)\b/i.test(message)) return "exam";
  if (/\b(cansaço|cansaco|sono|energia|alimentação|alimentacao|rotina|hábito|habito|treino|hidratação|hidratacao)\b/i.test(message)) return "habit";
  if (/\b(ansiedade|estresse|stress|humor|emocional|pânico|panico|medo|angústia|angustia)\b/i.test(message)) return "emotional";
  if (/\b(médico|medico|profissional|consulta|especialista|agendar|quem procurar)\b/i.test(message)) return "professional";
  if (/\b(dor|sintoma|febre|tontura|náusea|nausea|refluxo|gases|cabeça|cabeca|cefaleia|mal estar|indisposição|indisposicao|vômito|vomito|falta de ar)\b/i.test(message)) return "symptom";
  if (/\b(oi|olá|ola|bom dia|boa tarde|boa noite|quem é você|quem e voce|o que você faz|o que voce faz)\b/i.test(message)) return "social";
  return "general_health";
}

export function createAgentResult(params: Omit<HomeClinicalAgentResult, "findings" | "questions" | "safetyActions" | "blockers"> & Partial<Pick<HomeClinicalAgentResult, "findings" | "questions" | "safetyActions" | "blockers">>): HomeClinicalAgentResult {
  return {
    ...params,
    findings: params.findings ?? [],
    questions: uniqueStrings(params.questions ?? []).slice(0, 6),
    safetyActions: uniqueStrings(params.safetyActions ?? []).slice(0, 6),
    blockers: uniqueStrings(params.blockers ?? []).slice(0, 8),
  };
}

export function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function normalizeAgentResult(result: HomeClinicalAgentResult, agent: HomeClinicalAgent): HomeClinicalAgentResult {
  return {
    ...result,
    id: agent.id,
    label: agent.label,
    version: agent.version,
    patientSummary: result.patientSummary.trim(),
    internalRationale: result.internalRationale.trim(),
    findings: result.findings.filter((finding) => finding.label.trim() && finding.value.trim()),
    questions: uniqueStrings(result.questions).slice(0, 6),
    safetyActions: uniqueStrings(result.safetyActions).slice(0, 6),
    blockers: uniqueStrings(result.blockers).slice(0, 8),
  };
}

function choosePrimaryIntent(results: HomeClinicalAgentResult[], message: string): HomeClinicalIntent {
  const nonSocial = results.map((item) => item.intent).find((intent) => intent !== "social" && intent !== "general_health");
  return nonSocial ?? inferIntentFromMessage(message);
}

function buildBundleSafetyBoundary(results: HomeClinicalAgentResult[], safety: ClinicalSafetyAssessment): string {
  const explicit = results.find((item) => item.id === "clinical_safety" && item.patientSummary)?.patientSummary;
  if (explicit) return explicit;
  if (safety.redFlag) return "Pelo que foi descrito, há sinais que precisam de avaliação presencial ou urgência, principalmente se houver piora, falta de ar, desmaio, alteração neurológica, dor intensa ou febre persistente.";
  if (safety.prescriptionRequest) return "Posso ajudar a organizar dúvidas para conversar com um profissional, mas não posso indicar remédio, dose ou troca de tratamento por aqui.";
  return "Se houver piora rápida, dor intensa, falta de ar, desmaio, alteração neurológica, febre persistente, sangramento ou sensação de risco, procure atendimento presencial.";
}

function buildPatientSafeBrief(results: HomeClinicalAgentResult[]): string {
  const visible = results
    .filter((item) => item.status === "executed")
    .map((item) => item.patientSummary)
    .filter(Boolean);
  return uniqueStrings(visible).slice(0, 4).join("\n\n");
}

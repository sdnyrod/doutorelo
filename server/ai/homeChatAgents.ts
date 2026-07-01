import {
  createAgentResult,
  inferIntentFromMessage,
  inferRiskFromSafety,
  runHomeClinicalAgents,
  uniqueStrings,
  type HomeClinicalAgent,
  type HomeClinicalAgentBundle,
  type HomeClinicalAgentContext,
  type HomeClinicalAgentId,
  type HomeClinicalAgentResult,
  type HomeClinicalIntent,
} from "./orchestrationCore";

export const INSTALLED_HOME_CHAT_AGENT_IDS: HomeClinicalAgentId[] = [
  "sociability",
  "clinical_safety",
  "directed_anamnesis",
  "integrative_reasoning",
  "dayan_corpus",
  "document_intake",
  "visual_intake",
  "audit",
  "final_guardrail",
];

const AGENT_VERSION = "2026-05-02.home-chat-agents-v1";

export function buildHomeChatAgentBundle(context: HomeClinicalAgentContext): HomeClinicalAgentBundle {
  return runHomeClinicalAgents(context, HOME_CHAT_AGENTS);
}

export const HOME_CHAT_AGENTS: HomeClinicalAgent[] = [
  {
    id: "sociability",
    label: "Agente de Sociabilidade",
    version: AGENT_VERSION,
    execute: (context) => {
      const intent = inferIntentFromMessage(context.message);
      const isSocialOnly = !context.clinicalProvocation && intent === "social";
      return createAgentResult({
        id: "sociability",
        label: "Agente de Sociabilidade",
        version: AGENT_VERSION,
        status: isSocialOnly ? "executed" : "skipped",
        riskLevel: inferRiskFromSafety(context.safety),
        intent,
        patientSummary: isSocialOnly
          ? "Posso te ajudar a organizar sintomas, rotina, exames e dúvidas de saúde com cuidado e sem substituir uma consulta."
          : "Mensagem com conteúdo de saúde; a conversa deve priorizar contexto clínico e segurança.",
        internalRationale: isSocialOnly
          ? "Cumprimento ou pergunta de capacidade sem provocação clínica; manter resposta breve e humana."
          : "Há provocação clínica ou intenção de saúde; sociabilidade não deve dominar a resposta.",
        findings: [{ label: "social_only", value: String(isSocialOnly), visibility: "internal" }],
        questions: isSocialOnly ? ["O que você gostaria de organizar primeiro: sintomas, rotina, exames ou dúvidas para uma consulta?"] : [],
        safetyActions: [],
        blockers: [],
        confidence: isSocialOnly ? "high" : "medium",
      });
    },
  },
  {
    id: "clinical_safety",
    label: "Agente de Segurança Clínica",
    version: AGENT_VERSION,
    execute: (context) => {
      const riskLevel = inferRiskFromSafety(context.safety);
      const actions = uniqueStrings([
        ...context.safety.safetyActions,
        context.safety.redFlag ? "Orientar atendimento presencial/urgência quando houver sinais de alarme." : "Manter orientação educativa, sem diagnóstico fechado.",
        context.safety.prescriptionRequest ? "Bloquear indicação de medicamento, dose, troca ou suspensão de tratamento." : "Não prescrever nem dosar condutas.",
      ]);
      const boundary = context.safety.redFlag
        ? "Alguns sinais podem exigir avaliação presencial. Se houver piora rápida, dor forte, falta de ar, desmaio, confusão, fraqueza, febre persistente ou sensação de risco, procure atendimento agora."
        : context.safety.prescriptionRequest
          ? "Posso ajudar a organizar a dúvida para um profissional, mas não posso indicar remédio, dose, troca ou suspensão de tratamento."
          : "Vou te ajudar a organizar possibilidades e próximos pontos de observação, sem fechar diagnóstico nem substituir avaliação profissional.";
      return createAgentResult({
        id: "clinical_safety",
        label: "Agente de Segurança Clínica",
        version: AGENT_VERSION,
        status: context.clinicalProvocation || riskLevel !== "green" ? "executed" : "skipped",
        riskLevel,
        intent: inferIntentFromMessage(context.message),
        patientSummary: boundary,
        internalRationale: `Safety severity=${context.safety.severity}; decision=${context.safety.guardrailDecision}; nextStep=${context.safety.nextStep}.`,
        findings: [
          { label: "red_flag", value: String(context.safety.redFlag), visibility: "internal" },
          { label: "prescription_request", value: String(context.safety.prescriptionRequest), visibility: "internal" },
          { label: "next_step", value: context.safety.nextStep, visibility: "internal" },
        ],
        questions: context.safety.redFlag
          ? ["Você está em segurança agora e consegue procurar atendimento presencial?", "Houve piora rápida, desmaio, falta de ar, fraqueza, confusão, febre persistente ou dor muito intensa?"]
          : [],
        safetyActions: actions,
        blockers: context.safety.guardrailDecision === "refuse_and_escalate" ? ["clinical_guardrail_block"] : [],
        confidence: context.safety.confidence,
      });
    },
  },
  {
    id: "directed_anamnesis",
    label: "Agente de Anamnese Dirigida",
    version: AGENT_VERSION,
    execute: (context) => {
      const intent = inferIntentFromMessage(context.message);
      const questions = buildDirectedQuestions(context.message, context.deterministicFollowUpQuestions, intent);
      return createAgentResult({
        id: "directed_anamnesis",
        label: "Agente de Anamnese Dirigida",
        version: AGENT_VERSION,
        status: context.clinicalProvocation ? "executed" : "skipped",
        riskLevel: inferRiskFromSafety(context.safety),
        intent,
        patientSummary: context.clinicalProvocation
          ? "Para entender melhor, o mais útil agora é organizar início, duração, intensidade, sintomas associados e fatores que melhoram ou pioram."
          : "Sem sintoma específico informado, ainda não há anamnese dirigida a fazer.",
        internalRationale: "Coleta progressiva de contexto clínico sem induzir diagnóstico ou prescrição.",
        findings: classifySymptomFindings(context.message),
        questions,
        safetyActions: [],
        blockers: [],
        confidence: context.clinicalProvocation ? "high" : "medium",
      });
    },
  },
  {
    id: "integrative_reasoning",
    label: "Agente de Contexto funcional",
    version: AGENT_VERSION,
    execute: (context) => {
      const contextQuestions = buildIntegrativeQuestions(context.message);
      return createAgentResult({
        id: "integrative_reasoning",
        label: "Agente de Contexto funcional",
        version: AGENT_VERSION,
        status: context.clinicalProvocation ? "executed" : "skipped",
        riskLevel: inferRiskFromSafety(context.safety),
        intent: inferIntentFromMessage(context.message),
        patientSummary: context.clinicalProvocation
          ? "Além do sintoma em si, vale observar sono, hidratação, alimentação, intestino, estresse, uso de álcool/cafeína, remédios e mudanças recentes de rotina."
          : "Quando você trouxer um sintoma ou objetivo de saúde, posso ajudar a relacionar rotina, exames e hábitos com segurança.",
        internalRationale: "Camada contextual para padrões de rotina, sem converter correlações em certeza clínica.",
        findings: detectIntegrativeSignals(context.message),
        questions: contextQuestions,
        safetyActions: ["Não transformar associação de hábitos em diagnóstico."],
        blockers: [],
        confidence: context.clinicalProvocation ? "medium" : "low",
      });
    },
  },
  {
    id: "dayan_corpus",
    label: "Agente Dayan/Corpus",
    version: AGENT_VERSION,
    execute: (context) => {
      const shouldRun = context.clinicalProvocation || inferIntentFromMessage(context.message) !== "social";
      const hasContext = Boolean(context.dayanContext);
      return createAgentResult({
        id: "dayan_corpus",
        label: "Agente Dayan/Corpus",
        version: AGENT_VERSION,
        status: shouldRun ? (hasContext ? "executed" : "degraded") : "skipped",
        riskLevel: inferRiskFromSafety(context.safety),
        intent: inferIntentFromMessage(context.message),
        patientSummary: hasContext
          ? "Vou manter a orientação em linguagem educativa, sem transformar material de referência em prescrição individual."
          : "A camada educativa de referência ficou indisponível nesta resposta; sigo com orientação clínica conservadora e perguntas de contexto.",
        internalRationale: hasContext
          ? "Corpus contextual disponível para uso educativo e rastreável, sem exposição ao paciente."
          : "dayanContext ausente; agente instalado, mas executando em modo degradado seguro.",
        findings: [{ label: "corpus_available", value: String(hasContext), visibility: "internal" }],
        questions: [],
        safetyActions: ["Não citar base, corpus, Dayan ou mecanismo interno na resposta ao paciente."],
        blockers: hasContext ? [] : ["dayan_context_unavailable"],
        confidence: hasContext ? "medium" : "low",
      });
    },
  },
  {
    id: "document_intake",
    label: "Agente de Documentos/Anexos",
    version: AGENT_VERSION,
    execute: (context) => {
      const intent = inferIntentFromMessage(context.message);
      const mentionsDocument = /\b(exame|exames|laudo|pdf|documento|arquivo|anexo|resultado|hemograma|glicose|colesterol|tsh|vitamina)\b/i.test(context.message);
      return createAgentResult({
        id: "document_intake",
        label: "Agente de Documentos/Anexos",
        version: AGENT_VERSION,
        status: mentionsDocument ? "degraded" : "skipped",
        riskLevel: inferRiskFromSafety(context.safety),
        intent,
        patientSummary: mentionsDocument
          ? "Se você tiver um exame ou laudo, posso ajudar a organizar os pontos importantes, mas preciso que o conteúdo esteja disponível no chat e sempre devo correlacionar com sintomas e contexto."
          : "Nenhum documento foi recebido nesta mensagem.",
        internalRationale: mentionsDocument
          ? "Agente instalado com contrato de intake; processamento de bytes/extração real depende do fluxo de upload ser entregue ao backend."
          : "Sem referência a documento ou exame nesta mensagem.",
        findings: [{ label: "document_requested_or_mentioned", value: String(mentionsDocument), visibility: "internal" }],
        questions: mentionsDocument
          ? ["Qual exame ou laudo você quer entender, em que data foi feito e qual foi o motivo do pedido?", "Há sintomas junto ou resultado anterior para comparar?"]
          : [],
        safetyActions: ["Não interpretar exame isoladamente como diagnóstico."],
        blockers: mentionsDocument ? ["document_bytes_not_available_in_current_contract"] : [],
        confidence: mentionsDocument ? "medium" : "high",
      });
    },
  },
  {
    id: "visual_intake",
    label: "Agente de Imagem/Vídeo",
    version: AGENT_VERSION,
    execute: (context) => {
      const mentionsVisual = /\b(foto|imagem|vídeo|video|pele|mancha|ferida|inchaço|inchaco|raio x|ressonância|ressonancia|ultrassom)\b/i.test(context.message);
      return createAgentResult({
        id: "visual_intake",
        label: "Agente de Imagem/Vídeo",
        version: AGENT_VERSION,
        status: mentionsVisual ? "degraded" : "skipped",
        riskLevel: inferRiskFromSafety(context.safety),
        intent: inferIntentFromMessage(context.message),
        patientSummary: mentionsVisual
          ? "Quando houver imagem ou vídeo disponível, a análise deve ser apenas orientativa e precisa considerar sintomas, evolução e sinais de alerta."
          : "Nenhuma imagem ou vídeo foi recebido nesta mensagem.",
        internalRationale: mentionsVisual
          ? "Agente visual instalado com contrato seguro; análise multimodal real depende de arquivo disponível para o backend."
          : "Sem referência visual nesta mensagem.",
        findings: [{ label: "visual_media_requested_or_mentioned", value: String(mentionsVisual), visibility: "internal" }],
        questions: mentionsVisual
          ? ["Quando a alteração apareceu e ela está aumentando, doendo, sangrando, coçando ou com secreção?", "Há febre, piora rápida, falta de ar, dor intensa ou outro sinal geral junto?"]
          : [],
        safetyActions: ["Não diagnosticar imagem sem avaliação profissional quando houver risco, lesão progressiva ou sinais sistêmicos."],
        blockers: mentionsVisual ? ["visual_file_not_available_in_current_contract"] : [],
        confidence: mentionsVisual ? "medium" : "high",
      });
    },
  },
  {
    id: "audit",
    label: "Agente de Auditoria",
    version: AGENT_VERSION,
    execute: (context, previousResults) => {
      const executed = previousResults.filter((item) => item.status === "executed").map((item) => item.id).join(",") || "none";
      const degraded = previousResults.filter((item) => item.status === "degraded").map((item) => item.id).join(",") || "none";
      const blockers = previousResults.flatMap((item) => item.blockers);
      return createAgentResult({
        id: "audit",
        label: "Agente de Auditoria",
        version: AGENT_VERSION,
        status: "executed",
        riskLevel: inferRiskFromSafety(context.safety),
        intent: inferIntentFromMessage(context.message),
        patientSummary: "", 
        internalRationale: `Orquestra auditada. executed=${executed}; degraded=${degraded}; blockers=${blockers.join(",") || "none"}; exchangeCount=${context.exchangeCount}.`,
        findings: [
          { label: "executed_agents", value: executed, visibility: "internal" },
          { label: "degraded_agents", value: degraded, visibility: "internal" },
          { label: "blocker_count", value: String(blockers.length), visibility: "internal" },
        ],
        questions: [],
        safetyActions: [],
        blockers: [],
        confidence: "high",
      });
    },
  },
  {
    id: "final_guardrail",
    label: "Guardrail Final",
    version: AGENT_VERSION,
    execute: (context, previousResults) => {
      const rawPatientText = previousResults.map((item) => item.patientSummary).join("\n");
      const exposesInternals = /\b(base dayan|dayan|corpus|maestro|agente|orquestra|llm|prompt|guardrail|lógica funcional|logica funcional)\b/i.test(rawPatientText);
      const unsafeClinical = /\b(tome|use|dose|mg|ml|prescrevo|diagnóstico é|diagnostico é|certeza que é|certeza que e)\b/i.test(rawPatientText);
      const mustBlock = context.safety.guardrailDecision === "refuse_and_escalate" || unsafeClinical;
      return createAgentResult({
        id: "final_guardrail",
        label: "Guardrail Final",
        version: AGENT_VERSION,
        status: mustBlock || exposesInternals ? "executed" : "executed",
        riskLevel: mustBlock ? "red" : inferRiskFromSafety(context.safety),
        intent: inferIntentFromMessage(context.message),
        patientSummary: mustBlock
          ? "Não posso fechar diagnóstico, prescrever ou orientar dose por aqui. Se houver sinais de piora, dor intensa, falta de ar, desmaio, alteração neurológica, febre persistente ou sensação de risco, procure atendimento presencial."
          : exposesInternals
            ? "Vou responder de forma simples e segura, focando no que você sente, nos sinais de alerta e nas próximas perguntas úteis."
            : "Resposta liberada para linguagem natural ao paciente, desde que sem diagnóstico fechado, prescrição ou bastidores internos.",
        internalRationale: `exposesInternals=${exposesInternals}; unsafeClinical=${unsafeClinical}; guardrailDecision=${context.safety.guardrailDecision}.`,
        findings: [
          { label: "exposes_internal_logic", value: String(exposesInternals), visibility: "internal" },
          { label: "unsafe_clinical_language", value: String(unsafeClinical), visibility: "internal" },
        ],
        questions: [],
        safetyActions: ["Remover bastidores internos da resposta final ao paciente.", "Bloquear diagnóstico fechado, prescrição, dose e promessa terapêutica."],
        blockers: mustBlock ? ["final_guardrail_block"] : exposesInternals ? ["final_guardrail_rewrite_required"] : [],
        confidence: "high",
      });
    },
  },
];

function buildDirectedQuestions(message: string, deterministicQuestions: string[], intent: HomeClinicalIntent): string[] {
  const normalized = message.toLowerCase();
  const questions: string[] = [...deterministicQuestions];

  if (/cabeça|cabeca|cefaleia|enxaqueca/.test(normalized)) {
    questions.push(
      "A dor vem ao acordar, em qual região da cabeça, com que intensidade de 0 a 10 e melhora ao longo do dia?",
      "Teve visão turva, fraqueza, confusão, febre, rigidez na nuca, vômitos, pressão alta ou a pior dor de cabeça da vida?",
      "Como estão sono, hidratação, café/álcool, estresse, postura, bruxismo ou ronco nos últimos dias?",
    );
  } else if (/mal estar|indisposição|indisposicao|cansaço|cansaco|fadiga|energia/.test(normalized)) {
    questions.push(
      "Há quantos dias isso acontece, quanto tempo demora para melhorar e aparece só pela manhã ou em outros horários?",
      "Existe febre, tontura, náusea, falta de ar, dor no peito, desmaio, perda de peso ou outro sinal novo?",
      "Como foram sono, alimentação à noite, hidratação, intestino, estresse, álcool, café e medicamentos nesses dias?",
    );
  } else if (/intest|digest|reflux|gases|abd[oô]men|barriga/.test(normalized)) {
    questions.push(
      "Onde exatamente é o desconforto, quando começou e há relação com refeição, evacuação ou algum alimento?",
      "Há vômitos persistentes, sangue, febre, dor forte, barriga rígida ou perda de peso?",
      "Como está o padrão do intestino, hidratação, fibras, estresse, sono e medicamentos em uso?",
    );
  } else if (intent === "exam") {
    questions.push(
      "Qual exame ou valor você quer entender, em que data foi feito e qual era o motivo do pedido?",
      "Existe sintoma junto, diagnóstico prévio, remédio, suplemento ou resultado anterior para comparar?",
      "O laudo marca algo como alterado, urgente ou recomendado para correlacionar com avaliação clínica?",
    );
  } else {
    questions.push(
      "Quando começou, com que frequência aparece e qual a intensidade de 0 a 10?",
      "O que melhora, piora ou acompanha esse quadro?",
      "Qual sua idade, condições conhecidas, medicamentos em uso e exames recentes relevantes?",
    );
  }

  return uniqueStrings(questions).slice(0, 5);
}

function buildIntegrativeQuestions(message: string): string[] {
  const normalized = message.toLowerCase();
  const questions = [
    "Como estão sono, hidratação, alimentação, intestino e estresse nos últimos dias?",
    "Houve mudança recente de rotina, trabalho, treino, viagem, álcool, café, telas à noite ou medicação?",
  ];
  if (/manhã|manha|acord/.test(normalized)) {
    questions.push("Ao acordar você percebe boca seca, ronco, sono não reparador, jejum prolongado, náusea, tontura ou pressão diferente do habitual?");
  }
  if (/dor|mal estar|indisposição|indisposicao|cansaço|cansaco/.test(normalized)) {
    questions.push("Esse padrão já aconteceu antes ou é diferente do seu habitual?");
  }
  return uniqueStrings(questions).slice(0, 4);
}

function classifySymptomFindings(message: string) {
  const normalized = message.toLowerCase();
  const findings: HomeClinicalAgentResult["findings"] = [];
  if (/3 dias|três dias|tres dias/.test(normalized)) findings.push({ label: "duration", value: "aproximadamente três dias", visibility: "patient_safe" });
  if (/manhã|manha|acord/.test(normalized)) findings.push({ label: "timing", value: "predomínio pela manhã/ao acordar", visibility: "patient_safe" });
  if (/cabeça|cabeca|cefaleia|enxaqueca/.test(normalized)) findings.push({ label: "symptom_cluster", value: "cefaleia", visibility: "patient_safe" });
  if (/mal estar|indisposição|indisposicao/.test(normalized)) findings.push({ label: "symptom_cluster", value: "mal-estar/indisposição", visibility: "patient_safe" });
  if (/febre|falta de ar|desmaio|confusão|confusao|fraqueza|dor no peito|vômito|vomito/.test(normalized)) findings.push({ label: "possible_alarm_term", value: "mensagem contém termo que exige triagem de alarme", visibility: "internal" });
  return findings;
}

function detectIntegrativeSignals(message: string) {
  const normalized = message.toLowerCase();
  const findings: HomeClinicalAgentResult["findings"] = [];
  const signalMap: Array<[RegExp, string]> = [
    [/sono|dorm|acord|manhã|manha|ronco|apneia/, "sono/ritmo circadiano"],
    [/alimenta|comi|jejum|açúcar|acucar|café|cafe|álcool|alcool/, "alimentação/hidratação"],
    [/intest|diarreia|constipa|gases|reflux/, "intestino/digestão"],
    [/estresse|stress|ansiedade|trabalho|preocupa/, "estresse/carga mental"],
    [/treino|atividade|exercício|exercicio|sedent/, "movimento/recuperação"],
    [/remédio|remedio|medicamento|suplement|dose/, "medicamentos/suplementos"],
  ];
  for (const [pattern, value] of signalMap) {
    if (pattern.test(normalized)) findings.push({ label: "context_signal", value, visibility: "patient_safe" });
  }
  return findings;
}

import type { ConversationRoute, GeneratedAnswer, IntentClassification } from './types';

export type QualityDimension =
  | 'human_opening'
  | 'specificity'
  | 'working_hypotheses'
  | 'practical_action'
  | 'decision_question'
  | 'clinical_boundary'
  | 'non_generic';

export interface ConversationQualityEvaluation {
  passed: boolean;
  score: number;
  dimensions: Record<QualityDimension, boolean>;
  failures: QualityDimension[];
  summary: string;
}

const normalize = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

const countWords = (value: string) => value.trim().split(/\s+/).filter(Boolean).length;

const hasAny = (text: string, patterns: RegExp[]) => patterns.some((pattern) => pattern.test(text));

const fixedTemplatePatterns = [
  /em que posso ajudar\??/i,
  /fique a vontade/i,
  /fique à vontade/i,
  /estou por aqui/i,
  /com esse contexto da para ser mais preciso/i,
  /com esse contexto dá para ser mais preciso/i,
  /me diga como posso ajudar/i,
];

const backstagePatterns = /\b(prompt|llm|fallback|json|schema|classificador|agente|maestro|guardrail|corpus|bastidor|orquestra)\b/i;

const topicSignals: Record<string, RegExp[]> = {
  insonia: [/\bsono\b/i, /\binsonia\b/i, /\binsônia\b/i, /\bdormir\b/i, /\bdespertar\b/i, /\bcircadiano\b/i],
  dor_de_cabeca: [/\bdor de cabeca\b/i, /\bdor de cabeça\b/i, /\bcefaleia\b/i, /\benxaqueca\b/i, /\bcabeca\b/i, /\bcabeça\b/i],
  ansiedade_estresse: [/\bansiedade\b/i, /\bestresse\b/i, /\bhiperalerta\b/i, /\bhumor\b/i],
  alimentacao: [/\bdigest\b/i, /\bintestino\b/i, /\baliment\b/i, /\brefluxo\b/i, /\bgases\b/i],
  exames: [/\bexame\b/i, /\bresultado\b/i, /\blaboratorial\b/i, /\bmarcador\b/i],
  medicamentos: [/\bmedicamento\b/i, /\bsuplemento\b/i, /\bdose\b/i, /\buso\b/i],
  dor_no_peito: [/\bdor no peito\b/i, /\burgencia\b/i, /\burgência\b/i],
  saude_geral: [/\brotina\b/i, /\bhabito\b/i, /\bhábito\b/i, /\bsaude\b/i, /\bsaúde\b/i],
  unknown: [/\bpadrao\b/i, /\bpadrão\b/i, /\brotina\b/i, /\bcontexto\b/i],
  social: [/\bol[aá]\b/i, /\bbom dia\b/i, /\bboa tarde\b/i, /\bboa noite\b/i, /\bconte\b/i, /\btrazer\b/i],
};

const hypothesisPatterns = [
  /\bhipotese\b/i,
  /\bhipótese\b/i,
  /\bpode ter relacao\b/i,
  /\bpode ter relação\b/i,
  /\bcostuma envolver\b/i,
  /\beixos?\b/i,
  /\btrilhas?\b/i,
  /\bfatores?\b/i,
  /\bpistas?\b/i,
  /\bmais provavel\b/i,
  /\bmais provável\b/i,
  /\bpadrao\b/i,
  /\bpadrão\b/i,
];

const practicalPatterns = [
  /\bobservar\b/i,
  /\banotar\b/i,
  /\bmapear\b/i,
  /\bdiario\b/i,
  /\bdiário\b/i,
  /\bluz natural\b/i,
  /\bhidratacao\b/i,
  /\bhidratação\b/i,
  /\bcafeina\b/i,
  /\bcafeína\b/i,
  /\btelas\b/i,
  /\brotina\b/i,
  /\bhorario\b/i,
  /\bhorário\b/i,
  /\bproximo passo\b/i,
  /\bpróximo passo\b/i,
  /\bbaixo risco\b/i,
];

const boundaryPatterns = [
  /\bsem fechar diagnostico\b/i,
  /\bsem fechar diagnóstico\b/i,
  /\bnao vou definir dose\b/i,
  /\bnão vou definir dose\b/i,
  /\bsem dose\b/i,
  /\bsem prescricao\b/i,
  /\bsem prescrição\b/i,
  /\burgencia\b/i,
  /\burgência\b/i,
  /\batendimento\b/i,
];

function evaluateSocialReply(answer: GeneratedAnswer): ConversationQualityEvaluation {
  const text = answer.text.trim();
  const normalized = normalize(text);
  const dimensions: Record<QualityDimension, boolean> = {
    human_opening: text.length >= 18 && text.length <= 260 && !fixedTemplatePatterns.some((pattern) => pattern.test(text)),
    specificity: true,
    working_hypotheses: true,
    practical_action: true,
    decision_question: answer.askedQuestions.length === 0,
    clinical_boundary: true,
    non_generic: !fixedTemplatePatterns.some((pattern) => pattern.test(text)) && !backstagePatterns.test(normalized),
  };
  const failures = (Object.entries(dimensions) as Array<[QualityDimension, boolean]>).filter(([, passed]) => !passed).map(([dimension]) => dimension);
  const score = Math.round((Object.values(dimensions).filter(Boolean).length / Object.values(dimensions).length) * 100);
  return {
    passed: failures.length === 0,
    score,
    dimensions,
    failures,
    summary: failures.length === 0 ? 'Saudação humana, curta e sem template fixo.' : `Saudação social reprovada em: ${failures.join(', ')}.`,
  };
}

export function evaluateConversationQuality(input: {
  answer: GeneratedAnswer;
  classification: IntentClassification;
  route: Pick<ConversationRoute, 'mode' | 'maxQuestions'>;
  originalMessage: string;
}): ConversationQualityEvaluation {
  if (input.route.mode === 'social_reply') return evaluateSocialReply(input.answer);

  const text = input.answer.text.trim();
  const full = [text, ...input.answer.askedQuestions].join(' ');
  const normalized = normalize(full);
  const topicPatternList = topicSignals[input.classification.topic] ?? topicSignals.unknown;
  const asksDecisionQuestion = input.route.maxQuestions === 0
    ? input.answer.askedQuestions.length === 0
    : input.answer.askedQuestions.length > 0 && input.answer.askedQuestions.length <= input.route.maxQuestions;
  const hasBoundary = input.route.mode === 'clinical_boundary' || input.route.mode === 'medication_boundary' || input.route.mode === 'emergency_redirect'
    ? hasAny(full, boundaryPatterns)
    : true;
  const meaningfulLength = countWords(text) >= 35 || input.route.mode === 'off_topic_redirect';

  const dimensions: Record<QualityDimension, boolean> = {
    human_opening: text.length > 0 && !backstagePatterns.test(normalized),
    specificity: hasAny(full, topicPatternList) || input.classification.topic === 'unknown',
    working_hypotheses: hasAny(full, hypothesisPatterns),
    practical_action: hasAny(full, practicalPatterns),
    decision_question: asksDecisionQuestion,
    clinical_boundary: hasBoundary,
    non_generic: meaningfulLength && !fixedTemplatePatterns.some((pattern) => pattern.test(text)) && !backstagePatterns.test(normalized),
  };

  if (input.route.mode === 'emergency_redirect') {
    dimensions.specificity = true;
    dimensions.working_hypotheses = true;
    dimensions.practical_action = /atendimento|emergencia|emergência|urgencia|urgência|ligar|servico|serviço/i.test(full);
    dimensions.decision_question = input.answer.askedQuestions.length === 0;
    dimensions.non_generic = countWords(text) >= 18 && !backstagePatterns.test(normalized);
  }

  if (input.route.mode === 'medication_boundary') {
    dimensions.working_hypotheses = true;
    dimensions.practical_action = /organizar|profissional|medicacao|medicação|medicamento|suplemento|dose/i.test(full);
    dimensions.decision_question = input.answer.askedQuestions.length === 0;
    dimensions.non_generic = countWords(text) >= 24 && !backstagePatterns.test(normalized);
  }

  if (input.route.mode === 'off_topic_redirect') {
    dimensions.working_hypotheses = true;
    dimensions.practical_action = true;
    dimensions.decision_question = true;
  }

  const failures = (Object.entries(dimensions) as Array<[QualityDimension, boolean]>).filter(([, passed]) => !passed).map(([dimension]) => dimension);
  const passedCount = Object.values(dimensions).filter(Boolean).length;
  const score = Math.round((passedCount / Object.values(dimensions).length) * 100);

  return {
    passed: failures.length === 0,
    score,
    dimensions,
    failures,
    summary: failures.length === 0 ? 'Resposta específica, útil e operacional.' : `Resposta reprovada em: ${failures.join(', ')}.`,
  };
}

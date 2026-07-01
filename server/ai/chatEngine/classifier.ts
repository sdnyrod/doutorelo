import type { ChatIntent, ClassifyInput, HealthTopic, IntentClassification } from './types';

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const hasAny = (text: string, terms: string[]) => terms.some(term => text.includes(term));

const extractTopic = (text: string): HealthTopic => {
  if (hasAny(text, ['insonia', 'insônia', 'nao consigo dormir', 'não consigo dormir', 'dormir', 'sono'])) return 'insonia';
  if (hasAny(text, ['dor de cabeca', 'dor de cabeça', 'dores de cabeca', 'dores de cabeça', 'cefaleia', 'enxaqueca'])) return 'dor_de_cabeca';
  if (hasAny(text, ['dor no peito', 'peito apertado', 'aperto no peito'])) return 'dor_no_peito';
  if (hasAny(text, ['ansiedade', 'ansioso', 'ansiosa', 'estresse', 'stress', 'panico', 'pânico'])) return 'ansiedade_estresse';
  if (hasAny(text, ['alimentacao', 'alimentação', 'dieta', 'comer', 'nutricao', 'nutrição', 'barriga', 'refluxo', 'gases', 'intestino', 'gastrite', 'constipacao', 'constipação', 'digestivo'])) return 'alimentacao';
  if (hasAny(text, ['atividade fisica', 'atividade física', 'exercicio', 'exercício', 'treino', 'caminhada'])) return 'atividade_fisica';
  if (hasAny(text, ['exame', 'hemograma', 'colesterol', 'glicose', 'vitamina d', 'resultado'])) return 'exames';
  if (hasAny(text, ['remedio', 'remédio', 'medicamento', 'suplemento', 'suplementacao', 'suplementação', 'dose', 'dosagem', 'melatonina', 'clonazepam', 'zolpidem', 'diazepam', 'antidepressivo'])) return 'medicamentos';
  if (hasAny(text, ['saude', 'saúde', 'bem estar', 'bem-estar'])) return 'saude_geral';
  return 'unknown';
};

const extractTopicFromHistory = (historyText: string): HealthTopic => {
  const topic = extractTopic(historyText);
  return topic === 'unknown' ? 'saude_geral' : topic;
};

const isGreeting = (text: string) => /^(oi|ola|olá|bom dia|boa tarde|boa noite|hey|hello)\b/.test(text);
const isThanks = (text: string) => /^(obrigado|obrigada|valeu|grato|grata)\b/.test(text);

const isContinuation = (text: string) => {
  const compact = text.replace(/[?!.,]/g, '').trim();
  return [
    'me conta mais',
    'explique melhor',
    'continua',
    'continue',
    'e isso',
    'e isso?',
    'como assim',
    'pode explicar',
    'fala mais',
  ].includes(compact) || compact.length <= 12 && hasAny(compact, ['mais', 'sim', 'isso']);
};

const buildRoutingHint = (topic: HealthTopic, intent: ChatIntent) => {
  if (topic === 'insonia') return 'INSONIA_ROTINA_SONO_SEGURA';
  if (topic === 'dor_de_cabeca') return 'DOR_CABECA_SINAIS_ALERTA_E_AUTOCUIDADO';
  if (topic === 'dor_no_peito') return 'DOR_PEITO_PRIORIZAR_RISCO';
  if (topic === 'medicamentos') return 'MEDICAMENTOS_SEM_DOSE_SEM_PRESCRICAO';
  if (intent === 'greeting') return 'SAUDACAO_CURTA_ACOLHEDORA';
  return 'SAUDE_INTEGRATIVA_EDUCACIONAL_SEGURA';
};

export function classifyIntent(input: ClassifyInput): IntentClassification {
  const original = input.message || '';
  const text = normalize(original);
  const historyText = normalize((input.history || []).slice(-4).map(item => item.content).join(' '));
  const flags: string[] = [];

  if (hasAny(text, ['dose', 'dosagem', 'quantos mg', 'mg posso', 'posso tomar', 'devo tomar', 'receita', 'qual suplemento', 'suplemento tomar', 'suplementação tomar', 'suplementacao tomar'])) flags.push('asks_medication_dose');
  if (hasAny(text, ['o que eu tenho', 'qual diagnostico', 'qual diagnóstico', 'diagnostico', 'diagnóstico', 'estou com que doenca', 'estou com que doença'])) flags.push('asks_diagnosis');
  if (hasAny(text, ['dor no peito', 'falta de ar', 'desmaio', 'convulsao', 'convulsão', 'sangramento intenso'])) flags.push('possible_emergency');

  let intent: ChatIntent = 'unknown';
  let topic: HealthTopic = extractTopic(text);

  if (isGreeting(text)) {
    intent = 'greeting';
    topic = 'social';
  } else if (isThanks(text)) {
    intent = 'thanks';
    topic = 'social';
  } else if (flags.includes('possible_emergency')) {
    intent = 'emergency_symptom';
    topic = topic === 'unknown' ? 'saude_geral' : topic;
  } else if (flags.includes('asks_medication_dose') || topic === 'medicamentos') {
    intent = 'medication_or_prescription';
    topic = topic === 'unknown' || topic === 'medicamentos' ? 'medicamentos' : topic;
  } else if (flags.includes('asks_diagnosis')) {
    intent = 'diagnosis_request';
    topic = topic === 'unknown' ? extractTopicFromHistory(historyText) : topic;
  } else if (isContinuation(text) && historyText.length > 0) {
    intent = 'continuation';
    topic = extractTopicFromHistory(historyText);
  } else if (topic !== 'unknown') {
    intent = topic === 'alimentacao' || topic === 'atividade_fisica' ? 'habit_or_lifestyle' : topic === 'exames' ? 'exam_or_lab' : 'symptom';
  } else if (hasAny(text, ['obra', 'concreto', 'parede', 'engenharia', 'financeiro', 'preco', 'preço'])) {
    intent = 'off_topic';
  } else {
    intent = 'general_health_question';
    topic = 'saude_geral';
  }

  return {
    intent,
    topic,
    language: 'pt',
    confidence: original.trim().length === 0 ? 'low' : 'high',
    flags,
    routingHint: buildRoutingHint(topic, intent),
    shouldAskQuestion: !['greeting', 'thanks', 'emergency_symptom', 'off_topic'].includes(intent),
  };
}

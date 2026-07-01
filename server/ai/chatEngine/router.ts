import type { ConversationRoute, RouteInput } from './types';

export function routeConversation(input: RouteInput): ConversationRoute {
  const { classification, risk } = input;

  if (risk.level === 'emergency' || classification.intent === 'emergency_symptom') {
    return {
      mode: 'emergency_redirect',
      allowLLMGeneration: false,
      maxQuestions: 0,
      requiredSafetyNote: 'ORIENTAR_URGENCIA_SEM_DIAGNOSTICO',
      routingHint: classification.routingHint,
    };
  }

  if (classification.intent === 'medication_or_prescription' || classification.flags.includes('asks_medication_dose')) {
    return {
      mode: 'medication_boundary',
      allowLLMGeneration: false,
      maxQuestions: 3,
      requiredSafetyNote: 'SEM_DOSE_SEM_PRESCRICAO_ORIENTAR_PROFISSIONAL',
      routingHint: classification.routingHint,
    };
  }

  if (classification.intent === 'diagnosis_request' || classification.flags.includes('asks_diagnosis')) {
    return {
      mode: 'clinical_boundary',
      allowLLMGeneration: true,
      maxQuestions: 2,
      routingHint: classification.routingHint,
    };
  }

  if (classification.intent === 'greeting' || classification.intent === 'thanks') {
    return {
      mode: 'social_reply',
      allowLLMGeneration: true,
      maxQuestions: 0,
      routingHint: classification.routingHint,
    };
  }

  if (classification.intent === 'off_topic') {
    return {
      mode: 'off_topic_redirect',
      allowLLMGeneration: false,
      maxQuestions: 0,
      routingHint: 'REDIRECIONAR_PARA_SAUDE_INTEGRATIVA',
    };
  }

  return {
    mode: 'educational_support',
    allowLLMGeneration: true,
    maxQuestions: 3,
    routingHint: classification.routingHint,
  };
}

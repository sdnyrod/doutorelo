export type ChatLanguage = 'pt' | 'en';

export type ChatIntent =
  | 'greeting'
  | 'thanks'
  | 'symptom'
  | 'habit_or_lifestyle'
  | 'exam_or_lab'
  | 'medication_or_prescription'
  | 'diagnosis_request'
  | 'emergency_symptom'
  | 'continuation'
  | 'general_health_question'
  | 'off_topic'
  | 'unknown';

export type HealthTopic =
  | 'social'
  | 'insonia'
  | 'dor_de_cabeca'
  | 'dor_no_peito'
  | 'ansiedade_estresse'
  | 'alimentacao'
  | 'atividade_fisica'
  | 'exames'
  | 'medicamentos'
  | 'saude_geral'
  | 'unknown';

export type RiskLevel = 'none' | 'low' | 'moderate' | 'high' | 'emergency';

export type ResponseMode =
  | 'social_reply'
  | 'educational_support'
  | 'clinical_boundary'
  | 'medication_boundary'
  | 'emergency_redirect'
  | 'off_topic_redirect'
  | 'safe_fallback';

export type ValidationViolation =
  | 'diagnosis_language'
  | 'prescription_or_dosage'
  | 'internal_backstage_terms'
  | 'too_many_questions'
  | 'emergency_not_redirected'
  | 'unsupported_certainty'
  | 'hallucination_risk'
  | 'empty_answer'
  | 'wrong_language'
  | 'unsafe_claim';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface IntentClassification {
  intent: ChatIntent;
  topic: HealthTopic;
  language: ChatLanguage;
  confidence: 'low' | 'medium' | 'high';
  flags: string[];
  routingHint: string;
  shouldAskQuestion: boolean;
}

export interface HealthRiskAssessment {
  level: RiskLevel;
  emergencySignals: string[];
  cautionSignals: string[];
  flags: string[];
}

export interface ConversationRoute {
  mode: ResponseMode;
  allowLLMGeneration: boolean;
  maxQuestions: number;
  requiredSafetyNote?: string;
  routingHint?: string;
}

export interface GeneratedAnswer {
  text: string;
  askedQuestions: string[];
  claims: string[];
}

export interface AnswerValidation {
  isValid: boolean;
  confidence: number;
  violations: ValidationViolation[];
  warnings: string[];
  hallucinationScore: number;
}

export interface ConversationQualitySignal {
  passed: boolean;
  score: number;
  dimensions: Record<string, boolean>;
  failures: string[];
  summary: string;
}

export interface ChatEngineResult {
  answer: string;
  classification: IntentClassification;
  risk: HealthRiskAssessment;
  route: ConversationRoute;
  validation: AnswerValidation;
  quality: ConversationQualitySignal;
  metadata: {
    regenerated: boolean;
    usedFallback: boolean;
    generatorCalls: number;
  };
}

export interface ClassifyInput {
  message: string;
  history?: ChatMessage[];
}

export interface RouteInput {
  message: string;
  classification: IntentClassification;
  risk: HealthRiskAssessment;
}

export interface ValidateInput {
  answer: GeneratedAnswer;
  route: Pick<ConversationRoute, 'mode' | 'allowLLMGeneration' | 'maxQuestions'>;
  originalMessage: string;
}

export interface BuildChatResponseInput {
  message: string;
  history?: ChatMessage[];
  generate?: (context: {
    message: string;
    history: ChatMessage[];
    classification: IntentClassification;
    risk: HealthRiskAssessment;
    route: ConversationRoute;
    attempt: 1 | 2;
  }) => Promise<GeneratedAnswer>;
}

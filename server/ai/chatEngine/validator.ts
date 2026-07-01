import { detectResponseHallucination } from './hallucination';
import type { AnswerValidation, ValidateInput, ValidationViolation } from './types';

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const hasPattern = (text: string, patterns: RegExp[]) => patterns.some(pattern => pattern.test(text));

const diagnosisPatterns = [
  /\bvoce tem\b/,
  /\bvoc[eê] tem\b/,
  /\bseu diagnostico e\b/,
  /\bseu diagnóstico é\b/,
  /\bdiagnostico fechado\b/,
  /\bdiagnóstico fechado\b/,
  /\bfechar diagnostico\b/,
  /\bfechar diagnóstico\b/,
  /\be enxaqueca\b/,
  /\bé enxaqueca\b/,
  /\be ansiedade generalizada\b/,
  /\bé ansiedade generalizada\b/,
];

const prescriptionPatterns = [
  /\btome\s+\d+/,
  /\buse\s+\d+/,
  /\b\d+([,.]\d+)?\s?(mg|mcg|g|ml|gotas|comprimidos?)\b/,
  /\baumente a dose\b/,
  /\breduza a dose\b/,
  /\bpor\s+\d+\s+dias\b/,
];

const backstagePatterns = [
  /\bprompt\b/,
  /\bllm\b/,
  /\bclassificador\b/,
  /\brisklevel\b/,
  /\bfallback deterministico\b/,
  /\bsystem message\b/,
  /\btoken\b/,
  /\bscore\b/,
  /\bdayan\b/,
  /\bcorpus\b/,
  /\bagentes?\b/,
  /\borquestra\b/,
  /\bmaestro\b/,
  /\bguardrail\b/,
  /\bjson\b/,
  /\bschema\b/,
  /\bbastidores?\b/,
];

const certaintyPatterns = [
  /\bcura\b/,
  /\bgarante\b/,
  /\bcom certeza\b/,
  /\bsem duvida\b/,
  /\bsempre funciona\b/,
];

export function validateAssistantAnswer(input: ValidateInput): AnswerValidation {
  const text = input.answer.text || '';
  const normalized = normalize(text);
  const violations: ValidationViolation[] = [];
  const warnings: string[] = [];
  const hallucinationScore = detectResponseHallucination(text);

  if (!normalized.trim()) violations.push('empty_answer');
  if (hasPattern(normalized, diagnosisPatterns)) violations.push('diagnosis_language');
  if (hasPattern(normalized, prescriptionPatterns)) violations.push('prescription_or_dosage');
  if (hasPattern(normalized, backstagePatterns)) violations.push('internal_backstage_terms');
  if (hasPattern(normalized, certaintyPatterns)) violations.push('unsupported_certainty');
  if (input.answer.askedQuestions.length > input.route.maxQuestions) violations.push('too_many_questions');
  if (input.route.mode === 'emergency_redirect' && !hasPattern(normalized, [/urgencia/, /urgência/, /192/, /pronto atendimento/, /emergencia/, /emergência/])) {
    violations.push('emergency_not_redirected');
  }
  if (hallucinationScore >= 3) violations.push('hallucination_risk');

  const uniqueViolations = Array.from(new Set(violations));

  return {
    isValid: uniqueViolations.length === 0,
    confidence: uniqueViolations.length === 0 ? 0.95 : 0.35,
    violations: uniqueViolations,
    warnings,
    hallucinationScore,
  };
}

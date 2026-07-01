import type { HealthRiskAssessment, RiskLevel } from './types';

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const EMERGENCY_PATTERNS = [
  'dor no peito',
  'falta de ar',
  'desmaio',
  'convulsao',
  'sangramento intenso',
  'fraqueza em um lado',
  'perda de fala',
  'ideia de suicidio',
  'vontade de morrer',
  'overdose',
];

const HIGH_RISK_PATTERNS = [
  'pior dor de cabeca da vida',
  'dor de cabeca súbita',
  'dor de cabeca subita',
  'febre alta',
  'rigidez na nuca',
  'gravida',
  'gestante',
  'pressao muito alta',
  'pressão muito alta',
  'sangue nas fezes',
  'vomito persistente',
];

const CAUTION_PATTERNS = [
  'todo dia',
  'ha semanas',
  'há semanas',
  'piorando',
  'muito forte',
  'nao melhora',
  'não melhora',
  'perda de peso',
  'muita dor',
];

const matches = (text: string, patterns: string[]) => patterns.filter(pattern => text.includes(normalize(pattern)));

export function detectHealthRisk(message: string): HealthRiskAssessment {
  const text = normalize(message || '');
  const emergencySignals = matches(text, EMERGENCY_PATTERNS);
  const highRiskSignals = matches(text, HIGH_RISK_PATTERNS);
  const cautionSignals = [...highRiskSignals, ...matches(text, CAUTION_PATTERNS)];
  const flags: string[] = [];

  let level: RiskLevel = 'none';

  if (emergencySignals.length > 0) {
    level = 'emergency';
    flags.push('needs_immediate_care');
  } else if (highRiskSignals.length > 0) {
    level = 'high';
    flags.push('needs_professional_assessment_soon');
  } else if (cautionSignals.length > 0) {
    level = 'moderate';
    flags.push('monitor_and_consider_care');
  } else if (text.length > 0) {
    level = 'low';
  }

  return {
    level,
    emergencySignals,
    cautionSignals,
    flags,
  };
}

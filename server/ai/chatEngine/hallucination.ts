const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const precisePercentPattern = /\b\d{1,3}([,.]\d+)?\s?%/;
const dosagePattern = /\b\d+([,.]\d+)?\s?(mg|mcg|g|ml|gotas|comprimidos?)\b/i;
const namedStudyPattern = /\b(harvard|stanford|oxford|pubmed|jama|lancet|nejm|estudo|pesquisa)\b/i;
const certaintyPattern = /\b(provou|garante|cura|sempre|nunca|com certeza|sem duvida|sem dúvida)\b/i;
const medicationPattern = /\b(clonazepam|zolpidem|diazepam|alprazolam|fluoxetina|sertralina|antibiotico|antibiótico)\b/i;

export function detectResponseHallucination(answer: string): number {
  const text = normalize(answer || '');
  let score = 0;

  if (precisePercentPattern.test(text)) score += 2;
  if (dosagePattern.test(text)) score += 3;
  if (namedStudyPattern.test(text) && precisePercentPattern.test(text)) score += 2;
  if (certaintyPattern.test(text)) score += 1;
  if (medicationPattern.test(text) && dosagePattern.test(text)) score += 3;
  if (text.includes('lista de medicamentos') || /\b1\.\s+[\s\S]*\b2\.\s+/.test(text)) score += 1;

  return score;
}

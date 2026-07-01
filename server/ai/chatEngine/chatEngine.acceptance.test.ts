import { describe, expect, it } from 'vitest';
import {
  buildChatResponse,
  classifyIntent,
  detectHealthRisk,
  detectResponseHallucination,
  evaluateConversationQuality,
  routeConversation,
  validateAssistantAnswer,
  type ChatMessage,
  type GeneratedAnswer,
} from './index';

const historyAboutInsomnia: ChatMessage[] = [
  { role: 'user', content: 'Estou com insônia faz alguns dias.' },
  { role: 'assistant', content: 'Entendi. Vamos olhar rotina, horários, cafeína e sinais de alerta.' },
];

describe('Chat Engine Acceptance: deterministic pre-LLM classification', () => {
  it('classifies greetings as social, without turning them into clinical triage', () => {
    const result = classifyIntent({ message: 'Oi, bom dia', history: [] });

    expect(result.intent).toBe('greeting');
    expect(result.topic).toBe('social');
    expect(result.shouldAskQuestion).toBe(false);
  });

  it('classifies insomnia as a symptom topic and preserves the specific topic', () => {
    const result = classifyIntent({ message: 'Tenho tido muita insônia', history: [] });

    expect(result.intent).toBe('symptom');
    expect(result.topic).toBe('insonia');
    expect(result.language).toBe('pt');
  });

  it('uses recent context when the user sends a vague continuation', () => {
    const result = classifyIntent({ message: 'me conta mais', history: historyAboutInsomnia });

    expect(result.intent).toBe('continuation');
    expect(result.topic).toBe('insonia');
    expect(result.routingHint).toContain('INSONIA');
  });

  it('detects medication dosage requests before any LLM call', () => {
    const result = classifyIntent({ message: 'Qual dose de clonazepam eu posso tomar?', history: [] });

    expect(result.intent).toBe('medication_or_prescription');
    expect(result.flags).toContain('asks_medication_dose');
  });
});

describe('Chat Engine Acceptance: risk routing', () => {
  it('routes chest pain with shortness of breath to emergency guidance', () => {
    const risk = detectHealthRisk('Estou com dor no peito e falta de ar');
    const route = routeConversation({
      message: 'Estou com dor no peito e falta de ar',
      classification: classifyIntent({ message: 'Estou com dor no peito e falta de ar', history: [] }),
      risk,
    });

    expect(risk.level).toBe('emergency');
    expect(route.mode).toBe('emergency_redirect');
    expect(route.allowLLMGeneration).toBe(false);
  });

  it('routes direct diagnosis requests to a safety boundary, not to diagnosis', () => {
    const classification = classifyIntent({ message: 'Com esses sintomas, o que eu tenho?', history: [] });
    const route = routeConversation({ message: 'Com esses sintomas, o que eu tenho?', classification, risk: detectHealthRisk('Com esses sintomas, o que eu tenho?') });

    expect(classification.flags).toContain('asks_diagnosis');
    expect(route.mode).toBe('clinical_boundary');
  });

  it('routes greetings to live generation instead of a fixed deterministic opening', () => {
    const classification = classifyIntent({ message: 'Oi, bom dia', history: [] });
    const route = routeConversation({ message: 'Oi, bom dia', classification, risk: detectHealthRisk('Oi, bom dia') });

    expect(route.mode).toBe('social_reply');
    expect(route.allowLLMGeneration).toBe(true);
    expect(route.maxQuestions).toBe(0);
  });
});

describe('Chat Engine Acceptance: post-generation validation', () => {
  it('rejects direct diagnosis language', () => {
    const answer: GeneratedAnswer = {
      text: 'Você tem ansiedade generalizada. Esse é o diagnóstico mais provável.',
      askedQuestions: ['Você sente isso há quanto tempo?'],
      claims: [],
    };

    const validation = validateAssistantAnswer({ answer, route: { mode: 'educational_support', allowLLMGeneration: true, maxQuestions: 2 }, originalMessage: 'Estou ansioso' });

    expect(validation.isValid).toBe(false);
    expect(validation.violations).toContain('diagnosis_language');
  });

  it('rejects prescription or dosage instructions', () => {
    const answer: GeneratedAnswer = {
      text: 'Tome 10 mg à noite por 7 dias e depois aumente se precisar.',
      askedQuestions: [],
      claims: [],
    };

    const validation = validateAssistantAnswer({ answer, route: { mode: 'educational_support', allowLLMGeneration: true, maxQuestions: 2 }, originalMessage: 'O que faço para dormir?' });

    expect(validation.isValid).toBe(false);
    expect(validation.violations).toContain('prescription_or_dosage');
  });

  it('rejects internal backstage terms exposed to the public user', () => {
    const answer: GeneratedAnswer = {
      text: 'Meu classificador marcou riskLevel=low e o prompt de sistema escolheu fallback determinístico.',
      askedQuestions: [],
      claims: [],
    };

    const validation = validateAssistantAnswer({ answer, route: { mode: 'educational_support', allowLLMGeneration: true, maxQuestions: 2 }, originalMessage: 'Estou cansado' });

    expect(validation.isValid).toBe(false);
    expect(validation.violations).toContain('internal_backstage_terms');
  });

  it('rejects responses with more questions than the route allows', () => {
    const answer: GeneratedAnswer = {
      text: 'Vamos entender melhor. Você dorme que horas? Usa cafeína? Ronca? Tem ansiedade?',
      askedQuestions: ['Você dorme que horas?', 'Usa cafeína?', 'Ronca?', 'Tem ansiedade?'],
      claims: [],
    };

    const validation = validateAssistantAnswer({ answer, route: { mode: 'educational_support', allowLLMGeneration: true, maxQuestions: 2 }, originalMessage: 'Tenho insônia' });

    expect(validation.isValid).toBe(false);
    expect(validation.violations).toContain('too_many_questions');
  });
});

describe('Chat Engine Acceptance: conversation quality evaluation', () => {
  it('rejects fixed-template social openings even when they are clinically safe', () => {
    const classification = classifyIntent({ message: 'Oi, bom dia', history: [] });
    const route = routeConversation({ message: 'Oi, bom dia', classification, risk: detectHealthRisk('Oi, bom dia') });
    const quality = evaluateConversationQuality({
      answer: { text: 'Bom dia, em que posso ajudar? Fique à vontade! Estou por aqui.', askedQuestions: [], claims: [] },
      classification,
      route,
      originalMessage: 'Oi, bom dia',
    });

    expect(quality.passed).toBe(false);
    expect(quality.failures).toContain('human_opening');
    expect(quality.failures).toContain('non_generic');
  });

  it('accepts a clinically useful insomnia response with hypotheses, practical action and focused question', () => {
    const classification = classifyIntent({ message: 'Tenho insônia há semanas', history: [] });
    const route = routeConversation({ message: 'Tenho insônia há semanas', classification, risk: detectHealthRisk('Tenho insônia há semanas') });
    const quality = evaluateConversationQuality({
      answer: {
        text: 'Insônia por semanas costuma ter alguns eixos de hipótese: hiperalerta mental, ritmo circadiano irregular, cafeína ou álcool tarde, telas à noite, dor, refluxo ou ronco. Como ação prática de baixo risco, eu começaria observando horário de deitar e acordar, luz natural pela manhã, cafeína, álcool, telas, despertares e energia ao acordar.',
        askedQuestions: ['Você demora para pegar no sono, acorda no meio da noite ou acorda cedo demais?'],
        claims: [],
      },
      classification,
      route,
      originalMessage: 'Tenho insônia há semanas',
    });

    expect(quality.passed).toBe(true);
    expect(quality.score).toBe(100);
  });

  it('rejects generic health replies that do not advance reasoning or action', () => {
    const classification = classifyIntent({ message: 'Tenho dor de cabeça todo dia', history: [] });
    const route = routeConversation({ message: 'Tenho dor de cabeça todo dia', classification, risk: detectHealthRisk('Tenho dor de cabeça todo dia') });
    const quality = evaluateConversationQuality({
      answer: { text: 'Entendi. Isso pode acontecer por vários motivos. Me conte mais para eu te ajudar melhor.', askedQuestions: ['Quando começou?'], claims: [] },
      classification,
      route,
      originalMessage: 'Tenho dor de cabeça todo dia',
    });

    expect(quality.passed).toBe(false);
    expect(quality.failures).toContain('specificity');
    expect(quality.failures).toContain('working_hypotheses');
    expect(quality.failures).toContain('practical_action');
  });
});

describe('Chat Engine Acceptance: deterministic hallucination scoring', () => {
  it('flags precise clinical statistics without source context', () => {
    const score = detectResponseHallucination('Um estudo de Harvard em 2024 provou que 87,3% dos pacientes melhoram em 3 dias.');

    expect(score).toBeGreaterThanOrEqual(3);
  });

  it('flags fabricated medication lists', () => {
    const score = detectResponseHallucination('Opções: 1. Zolpidem 10mg 2. Clonazepam 2mg 3. Diazepam 5mg');

    expect(score).toBeGreaterThanOrEqual(3);
  });

  it('does not flag a short safe lifestyle response', () => {
    const score = detectResponseHallucination('Pode ajudar observar horários, cafeína, telas à noite e procurar atendimento se houver piora importante.');

    expect(score).toBe(0);
  });
});

describe('Chat Engine Acceptance: full pipeline with injected generator', () => {
  it('returns emergency fallback without calling the LLM generator', async () => {
    let generatorWasCalled = false;

    const result = await buildChatResponse({
      message: 'Estou com dor no peito e falta de ar',
      history: [],
      generate: async () => {
        generatorWasCalled = true;
        return { text: 'resposta indevida', askedQuestions: [], claims: [] };
      },
    });

    expect(generatorWasCalled).toBe(false);
    expect(result.route.mode).toBe('emergency_redirect');
    expect(result.answer).toMatch(/urgência|atendimento imediato|serviço de emergência/i);
    expect(result.validation.isValid).toBe(true);
  });

  it('generates social openings through the injected live generator and does not use the old fixed template', async () => {
    let calls = 0;

    const result = await buildChatResponse({
      message: 'Oi, bom dia',
      history: [],
      generate: async () => {
        calls += 1;
        return { text: 'Bom dia. Vamos olhar com calma o que seu corpo está sinalizando hoje; traga o ponto principal e eu organizo o caminho.', askedQuestions: [], claims: [] };
      },
    });

    expect(calls).toBe(1);
    expect(result.route.mode).toBe('social_reply');
    expect(result.answer).not.toMatch(/em que posso ajudar|fique à vontade|estou por aqui/i);
    expect(result.quality.passed).toBe(true);
  });

  it('regenerates once when the first generated answer is safe but generic, then accepts the useful answer', async () => {
    let calls = 0;

    const result = await buildChatResponse({
      message: 'Tenho dor de cabeça todo dia',
      history: [],
      generate: async () => {
        calls += 1;
        if (calls === 1) {
          return { text: 'Entendi. Dor de cabeça pode acontecer por vários motivos. Me conte mais para eu te ajudar melhor.', askedQuestions: ['Quando começou?'], claims: [] };
        }
        return {
          text: 'Dor de cabeça diária merece mapear hipóteses como tensão muscular ou bruxismo, sono ruim, hidratação baixa, cafeína ou álcool, pressão arterial, sinusite, telas e estresse. Como ação prática de baixo risco, observe por alguns dias horário, região da dor, intensidade, água, café, sono, postura, telas e o que melhora ou piora.',
          askedQuestions: ['A dor fica em que região e qual a intensidade de 0 a 10?', 'Ela veio de repente ou foi aumentando com o tempo?'],
          claims: [],
        };
      },
    });

    expect(calls).toBe(2);
    expect(result.metadata.regenerated).toBe(true);
    expect(result.quality.passed).toBe(true);
    expect(result.answer).toMatch(/tensão muscular|bruxismo|hidratação|pressão|estresse/i);
  });

  it('regenerates once when the first generated answer violates the contract, then accepts the safe answer', async () => {
    let calls = 0;

    const result = await buildChatResponse({
      message: 'Tenho insônia',
      history: [],
      generate: async () => {
        calls += 1;
        if (calls === 1) {
          return { text: 'Você tem ansiedade. Tome 10 mg à noite.', askedQuestions: [], claims: [] };
        }
        return {
          text: 'Insônia pode ter relação com rotina, estresse, cafeína, telas, álcool, horários irregulares e hiperalerta. Como hipótese de trabalho, eu começaria observando padrão de sono, energia ao acordar, luz natural pela manhã e gatilhos de fim de dia.',
          askedQuestions: ['Há quanto tempo isso vem acontecendo?'],
          claims: [],
        };
      },
    });

    expect(calls).toBe(2);
    expect(result.answer).toMatch(/rotina|estresse|cafeína|telas|hiperalerta/i);
    expect(result.answer).not.toMatch(/sem substituir|não substitui|avaliação profissional/i);
    expect(result.validation.isValid).toBe(true);
    expect(result.metadata.regenerated).toBe(true);
  });

  it('handles middle-of-the-night insomnia with supplement request without prescribing product or dose', async () => {
    let generatorWasCalled = false;

    const result = await buildChatResponse({
      message: 'Acordo no meio da noite e queria saber qual suplemento tomar para dormir melhor',
      history: [],
      generate: async () => {
        generatorWasCalled = true;
        return { text: 'Tome magnésio 300 mg antes de dormir.', askedQuestions: [], claims: [] };
      },
    });

    expect(generatorWasCalled).toBe(false);
    expect(result.route.mode).toBe('medication_boundary');
    expect(result.answer).toMatch(/acorda no meio da noite|hiperalerta|álcool|cafeína|refluxo|ronco|apneia|noctúria/i);
    expect(result.answer).toMatch(/não vou definir dose|não vou definir.*produto|suplemento ou medicamento/i);
    expect(result.answer).not.toMatch(/\b\d+\s?(mg|mcg|g|gotas)\b|tome|use .* antes de dormir/i);
    expect(result.validation.isValid).toBe(true);
  });

  it('falls back deterministically if generation and regeneration both fail validation', async () => {
    const result = await buildChatResponse({
      message: 'Tenho dor de cabeça todo dia',
      history: [],
      generate: async () => ({ text: 'Você tem enxaqueca crônica. Tome remédio diariamente.', askedQuestions: [], claims: [] }),
    });

    expect(result.metadata.usedFallback).toBe(true);
    expect(result.validation.isValid).toBe(true);
    expect(result.answer).not.toContain('Você tem enxaqueca');
    expect(result.answer).toMatch(/hipótese|tensão muscular|bruxismo|sono|hidratação|pressão/i);
    expect(result.answer).not.toMatch(/não consigo fechar diagnóstico|não substitui consulta/i);
  });
});

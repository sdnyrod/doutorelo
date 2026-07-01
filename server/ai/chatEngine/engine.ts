import { classifyIntent } from './classifier';
import { deterministicAnswer, safeValidationFallback } from './fallback';
import { generateWithLLM } from './llmGenerator';
import { evaluateConversationQuality } from './qualityEvaluator';
import { detectHealthRisk } from './risk';
import { routeConversation } from './router';
import type { BuildChatResponseInput, ChatEngineResult, GeneratedAnswer } from './types';
import { validateAssistantAnswer } from './validator';

export async function buildChatResponse(input: BuildChatResponseInput): Promise<ChatEngineResult> {
  const history = input.history || [];
  const classification = classifyIntent({ message: input.message, history });
  const risk = detectHealthRisk(input.message);
  const route = routeConversation({ message: input.message, classification, risk });
  const isProtectedDeterministicRoute = ['emergency_redirect', 'medication_boundary', 'off_topic_redirect'].includes(route.mode);
  const generator = input.generate || generateWithLLM;
  let generated: GeneratedAnswer;
  let generatorCalls = 0;
  let regenerated = false;
  let usedFallback = false;

  if (!route.allowLLMGeneration) {
    generated = deterministicAnswer({ route, classification, originalMessage: input.message });
  } else {
    try {
      generatorCalls += 1;
      generated = await generator({
        message: input.message,
        history,
        classification,
        risk,
        route,
        attempt: 1,
      });
    } catch {
      usedFallback = true;
      generatorCalls = Math.max(generatorCalls, 1);
      generated = safeValidationFallback({ classification, originalMessage: input.message });
    }
  }

  let validation = validateAssistantAnswer({ answer: generated, route, originalMessage: input.message });
  let quality = evaluateConversationQuality({ answer: generated, classification, route, originalMessage: input.message });

  if (validation.violations.includes('internal_backstage_terms') && route.allowLLMGeneration) {
    regenerated = true;
    usedFallback = true;
    generated = safeValidationFallback({ classification, originalMessage: input.message });
    validation = validateAssistantAnswer({ answer: generated, route, originalMessage: input.message });
    quality = evaluateConversationQuality({ answer: generated, classification, route, originalMessage: input.message });
  }

  if ((!validation.isValid || !quality.passed) && route.allowLLMGeneration && !usedFallback) {
    try {
      regenerated = true;
      generatorCalls += 1;
      const secondTry = await generator({
        message: input.message,
        history,
        classification,
        risk,
        route,
        attempt: 2,
      });
      const secondValidation = validateAssistantAnswer({ answer: secondTry, route, originalMessage: input.message });
      const secondQuality = evaluateConversationQuality({ answer: secondTry, classification, route, originalMessage: input.message });
      if (secondValidation.isValid && secondQuality.passed) {
        generated = secondTry;
        validation = secondValidation;
        quality = secondQuality;
      } else {
        usedFallback = true;
        generated = safeValidationFallback({ classification, originalMessage: input.message });
        validation = validateAssistantAnswer({ answer: generated, route, originalMessage: input.message });
        quality = evaluateConversationQuality({ answer: generated, classification, route, originalMessage: input.message });
      }
    } catch {
      usedFallback = true;
      generated = safeValidationFallback({ classification, originalMessage: input.message });
      validation = validateAssistantAnswer({ answer: generated, route, originalMessage: input.message });
      quality = evaluateConversationQuality({ answer: generated, classification, route, originalMessage: input.message });
    }
  }

  if ((!validation.isValid || !quality.passed) && !usedFallback && !isProtectedDeterministicRoute) {
    usedFallback = true;
    generated = safeValidationFallback({ classification, originalMessage: input.message });
    validation = validateAssistantAnswer({ answer: generated, route, originalMessage: input.message });
    quality = evaluateConversationQuality({ answer: generated, classification, route, originalMessage: input.message });
  }

  return {
    answer: generated.text,
    classification,
    risk,
    route,
    validation,
    quality,
    metadata: {
      regenerated,
      usedFallback,
      generatorCalls,
    },
  };
}

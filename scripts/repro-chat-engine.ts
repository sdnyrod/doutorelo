import { buildChatResponse, classifyIntent, detectHealthRisk, routeConversation, safeValidationFallback, evaluateConversationQuality, validateAssistantAnswer } from '../server/ai/chatEngine/index';

const message = 'Preciso de um conselho em relação a quais suplementos ou dieta ajudaria no fortalecimento das unhas e prevenção de queda de cabelo';

const classification = classifyIntent({ message, history: [] });
const risk = detectHealthRisk(message);
const route = routeConversation({ message, classification, risk });
const fallback = safeValidationFallback({ classification, originalMessage: message });
const fallbackValidation = validateAssistantAnswer({ answer: fallback, route, originalMessage: message });
const fallbackQuality = evaluateConversationQuality({ answer: fallback, classification, route, originalMessage: message });

console.log('INPUT:', message);
console.log('CLASSIFICATION:', JSON.stringify(classification, null, 2));
console.log('RISK:', JSON.stringify(risk, null, 2));
console.log('ROUTE:', JSON.stringify(route, null, 2));
console.log('SAFE_FALLBACK:', JSON.stringify(fallback, null, 2));
console.log('FALLBACK_VALIDATION:', JSON.stringify(fallbackValidation, null, 2));
console.log('FALLBACK_QUALITY:', JSON.stringify(fallbackQuality, null, 2));

const resultWithInvalidGenerator = await buildChatResponse({
  message,
  history: [],
  generate: async ({ attempt }) => ({
    text: attempt === 1 ? 'Resposta genérica insuficiente.' : 'Ainda não tenho elementos suficientes.',
    askedQuestions: [],
    claims: [],
  }),
});

console.log('RESULT_WHEN_GENERATION_FAILS_QUALITY:', JSON.stringify(resultWithInvalidGenerator, null, 2));

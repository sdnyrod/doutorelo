from pathlib import Path
import re

path = Path('/home/ubuntu/saude-integrativa-ia-dev/server/routers.ts')
text = path.read_text()

text = text.replace('import { buildChatResponse } from "./ai/chatEngine";\n', '')
text = text.replace('import { hasDoutoreloClinicalProvocation } from "./personality";\n', '')

text = re.sub(
    r'type HomeChatFeature = \{.*?\n\}\n\nasync function callPureAnthropicMessage',
    'async function callPureAnthropicMessage',
    text,
    flags=re.S,
)

text = re.sub(
    r'async function buildAnonymousHomeChatResponse\(input: z\.infer<typeof homeChatInput>\) \{.*?\n\}\n\nasync function buildAnonymousHomeChatResponseLegacy',
    '''async function buildAnonymousHomeChatResponse(input: z.infer<typeof homeChatInput>) {
  const pureAnthropic = await callPureAnthropicMessage(input.message);

  return {
    assistantMessage: pureAnthropic.text,
    provider: pureAnthropic.provider,
    model: pureAnthropic.model,
    raw: pureAnthropic.raw,
  };
}

async function buildAnonymousHomeChatResponseLegacy''',
    text,
    flags=re.S,
)

text = re.sub(
    r'\nasync function buildAnonymousHomeChatResponseLegacy\(input: z\.infer<typeof homeChatInput>\) \{.*?\n\}\n\nexport const appRouter',
    '\n\nexport const appRouter',
    text,
    flags=re.S,
)

for forbidden in [
    'buildChatResponse',
    'hasDoutoreloClinicalProvocation',
    'buildAnonymousHomeChatResponseLegacy',
    'buildHomeChatFollowUpQuestions',
    'buildHomeChatDayanExtraContext',
    'inferHomeChatFeatures',
    'HOME_CHAT_PRIVACY_NOTICE',
    'HomeChatFeature',
]:
    if forbidden in text:
        raise SystemExit(f'Forbidden legacy chat symbol still present: {forbidden}')

path.write_text(text)

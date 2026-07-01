import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(__dirname, "..");
const homeSource = readFileSync(resolve(projectRoot, "client/src/pages/Home.tsx"), "utf8");
const routerSource = readFileSync(resolve(projectRoot, "server/routers.ts"), "utf8");

function extractBetween(source: string, start: string, end: string): string {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex);
  expect(startIndex).toBeGreaterThanOrEqual(0);
  expect(endIndex).toBeGreaterThan(startIndex);
  return source.slice(startIndex, endIndex);
}

describe("homeChat contextual sync", () => {
  it("uses invokeLLM with conversation history and enriches with contextual hints", () => {
    const homeChatBlock = extractBetween(routerSource, "const homeChatInput", "export const appRouter");

    expect(homeChatBlock).toContain("callLLM(locationAwareInput.message, input.conversationHistory");
    expect(homeChatBlock).toContain("enrichAssistantMessageWithContextualHint");
    expect(homeChatBlock).toContain("buildHomeChatMasterDecision");
    expect(homeChatBlock).toContain("buildSystemPrompt(masterDecision)");
    expect(homeChatBlock).toContain("invokeLLM({ messages })");
    // No more direct Anthropic calls or regex scope filtering
    expect(homeChatBlock).not.toMatch(/api\.anthropic\.com|callAnthropicText|integrativeHealthScopePattern|outOfScopePatterns/);
  });

  it("does not render a separate master.observe call or local segmentation layers in Home", () => {
    expect(homeSource).toContain("trpc.homeChat.send.useMutation");
    expect(homeSource).not.toContain("trpc.master.observe.useMutation");
    expect(homeSource).not.toMatch(/O que entendi|Ponto importante|Pergunta para continuar|visual-cards|COMMON_TYPO|draftFeedback|correctionNotice|pendingAttachments|handleCorrect|handleDrop|formatAttachment|attachmentNotice/i);
    expect(homeSource).not.toMatch(/Reconheci|tempo de início|intensidade|anexar|anexe|guardrail|camada|tratamento/i);
  });

  it("frontend passes conversationHistory to the backend", () => {
    expect(homeSource).toContain("conversationHistory: messages");
  });
});

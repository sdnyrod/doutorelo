import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
const mockFetch = vi.hoisted(() => vi.fn());
vi.stubGlobal("fetch", mockFetch);
function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}
function mockLLMResponse(text: string) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      id: "chatcmpl-test",
      object: "chat.completion",
      choices: [{ index: 0, message: { role: "assistant", content: text }, finish_reason: "stop" }],
    }),
    text: async () => JSON.stringify({
      choices: [{ message: { role: "assistant", content: text } }],
    }),
  };
}
describe("homeChat.send", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue(mockLLMResponse(
      "Cansaço, ansiedade e sono ruim merecem ser organizados com calma. Vamos conversar sobre isso."
    ));
  });

  it("ALWAYS sends messages to LLM — no regex filtering or gating", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.homeChat.send({
      message: "Estou em Maringá, tenho cansaço, ansiedade e dificuldade para dormir.",
      city: "Maringá",
      state: "PR",
      route: "/",
    });

    // LLM was always called — no regex pre-filtering
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result.assistantMessage).toBeTruthy();
    // Professionals are ALWAYS fetched from DB (LLM decides relevance)
    expect(result.masterDecision).not.toBeNull();
    expect(result.masterDecision?.action).toBe("suggest_professional");
  });

  it("ALWAYS fetches professionals from DB regardless of message content", async () => {
    mockFetch.mockResolvedValueOnce(mockLLMResponse(
      "Acordar por volta das 3h pode acontecer por variações de rotina, estresse, luz ou cafeína."
    ));
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.homeChat.send({
      message: "Preciso de boas noites de sono, algo que tem sido raro... acordo todas as noites por volta das 3 da manhã... o que pode ser isso?",
      route: "/",
    });

    // LLM was called
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result.assistantMessage).toBeTruthy();
    // masterDecision always has professionals from DB (even if message is about sleep)
    expect(result.masterDecision).not.toBeNull();
  });

  it("filters professionals by city when city is resolved from message", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.homeChat.send({
      message: "Onde consigo um profissional da rede do Dr. Dayan em Natal?",
      route: "/",
    });

    expect(result.masterDecision?.action).toBe("suggest_professional");
    expect(result.masterDecision?.professionalCandidates.length).toBeGreaterThan(0);
    expect(result.masterDecision?.professionalCandidates.every((p) => p.city === "Natal" && p.state === "RN")).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("filters professionals by city Cianorte-PR when explicitly mentioned", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.homeChat.send({
      message: "Vc pode me dar uma lista de profissionais ligados ao Dayan na cidade de Cianorte, PR?",
      route: "/",
    });

    expect(result.masterDecision?.action).toBe("suggest_professional");
    expect(result.masterDecision?.professionalCandidates.length).toBeGreaterThan(0);
    expect(result.masterDecision?.professionalCandidates.every((p) => p.city === "Cianorte" && p.state === "PR")).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("still calls LLM even without location — no more location-blocking fallback", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.homeChat.send({
      message: "Quero um endocrinologista perto de mim.",
      proximityIntentWithoutExplicitCity: true,
      locationPermissionStatus: "denied",
      route: "/",
    });

    // Now always goes to LLM — no more hardcoded location-missing message
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result.assistantMessage).toBeTruthy();
    expect(result.masterDecision).not.toBeNull();
  });

  it("uses geolocation coordinates to rank nearby professionals", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    const result = await caller.homeChat.send({
      message: "Quero um médico perto de mim para avaliar meus exames.",
      lat: -5.79448,
      lng: -35.211,
      proximityIntentWithoutExplicitCity: true,
      locationPermissionStatus: "granted",
      route: "/",
    });

    expect(result.masterDecision?.action).toBe("suggest_professional");
    expect(result.masterDecision?.professionalCandidates.length).toBeGreaterThan(0);
    expect(result.masterDecision?.professionalCandidates[0]?.distanceKm).toBeTypeOf("number");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("passes conversationHistory to LLM as multi-turn messages", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    await caller.homeChat.send({
      message: "E sobre minha insônia?",
      conversationHistory: [
        { role: "user", content: "Boa noite" },
        { role: "assistant", content: "Boa noite! Como posso ajudar?" },
      ],
      route: "/",
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    // Should have system + 2 history messages + current message = 4 messages
    expect(requestBody.messages.length).toBe(4);
    expect(requestBody.messages[0].role).toBe("system");
    expect(requestBody.messages[1]).toEqual({ role: "user", content: "Boa noite" });
    expect(requestBody.messages[2]).toEqual({ role: "assistant", content: "Boa noite! Como posso ajudar?" });
    expect(requestBody.messages[3].role).toBe("user");
    expect(requestBody.messages[3].content).toBe("E sobre minha insônia?");
  });

  it("sends all messages to LLM without regex filtering — even off-topic", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    // Even a political question now goes to the LLM (no regex blocking)
    await caller.homeChat.send({
      message: "Quem você acha que vence a próxima eleição presidencial?",
    });

    // The LLM was called (no pre-filtering)
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("verifies code uses invokeLLM and has no regex gating in the response path", async () => {
    const source = await import("node:fs/promises").then((fs) => fs.readFile("server/routers.ts", "utf8"));
    const homeChatBlock = source.slice(source.indexOf("async function buildAnonymousHomeChatResponse"), source.indexOf("export const appRouter"));

    expect(homeChatBlock).toContain("const locationAwareInput = await resolveHomeChatInputLocation(input)");
    expect(homeChatBlock).toContain("buildHomeChatMasterDecision(locationAwareInput, isAuthenticated)");
    expect(homeChatBlock).toContain("callLLM(locationAwareInput.message, input.conversationHistory");
    expect(homeChatBlock).toContain("enrichAssistantMessageWithContextualHint(rawAssistantMessage, masterDecision)");
    // No more Anthropic direct calls or regex scope checking
    expect(homeChatBlock).not.toMatch(/callAnthropicText|classifyHomeChatScope|hasExplicitProfessionalSuggestionRequest|buildNeedsLocationForProfessionalSuggestion/);
  });
});

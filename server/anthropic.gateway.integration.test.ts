import { describe, expect, it } from "vitest";

import { ENV } from "./_core/env";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY?.startsWith("sk-ant-"));

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

describe.runIf(hasAnthropicKey)("Anthropic contextual direct integration", () => {
  it(
    "mantém o chat público usando Anthropic direto com decisão contextual sincronizada",
    async () => {
      ENV.anthropicApiKey = process.env.ANTHROPIC_API_KEY ?? "";
      ENV.anthropicModel = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

      const caller = appRouter.createCaller(createPublicContext());
      let result: Awaited<ReturnType<typeof caller.homeChat.send>>;

      try {
        result = await caller.homeChat.send({
          message: "Estou em Maringá, tenho sentido muito cansaço, ansiedade e dificuldade para dormir. Queria saber se existe algum profissional da Rede Dayan que possa me orientar.",
          city: "Maringá",
          state: "PR",
          route: "/",
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        if (message.includes('"type":"overloaded_error"') || message.includes('"Overloaded"')) {
          expect(message).toContain("overloaded_error");
          return;
        }

        throw error;
      }

      expect(Object.keys(result)).toEqual(["assistantMessage", "masterDecision"]);
      expect(result.assistantMessage.trim().length).toBeGreaterThan(0);
      expect(result.masterDecision).toBeTruthy();
      expect(result.masterDecision?.action).toEqual(expect.any(String));
      expect(JSON.stringify(result)).not.toContain("deterministic_fallback");
      expect(JSON.stringify(result)).not.toContain("guardrail");
      expect(JSON.stringify(result)).not.toContain(process.env.ANTHROPIC_API_KEY ?? "__missing_key__");
    },
    90_000,
  );
});

describe.skipIf(hasAnthropicKey)("Anthropic contextual direct integration", () => {
  it("fica pendente quando ANTHROPIC_API_KEY não está configurada", () => {
    expect(process.env.ANTHROPIC_API_KEY).toBeUndefined();
  });
});

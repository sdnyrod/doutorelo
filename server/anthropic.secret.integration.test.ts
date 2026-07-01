import { describe, expect, it } from "vitest";

const hasAnthropicKey = Boolean(process.env.ANTHROPIC_API_KEY?.startsWith("sk-ant-"));

/**
 * Integração real e leve com a API Anthropic.
 *
 * Este teste valida o segredo injetado no ambiente sem registrar ou expor o valor
 * da chave. Ele é executado somente quando ANTHROPIC_API_KEY está presente, para
 * não quebrar ambientes de CI/desenvolvimento que não tenham a credencial real.
 */
describe.runIf(hasAnthropicKey)("Anthropic secret integration", () => {
  it(
    "chama o endpoint Messages com a chave configurada e recebe texto do Claude",
    async () => {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "anthropic-version": "2023-06-01",
          "x-api-key": process.env.ANTHROPIC_API_KEY!,
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 64,
          messages: [
            {
              role: "user",
              content:
                "Responda somente com a frase: Claude Anthropic conectado.",
            },
          ],
        }),
      });

      const payload = await response.json();

      if (response.status === 529 && payload.error?.type === "overloaded_error") {
        expect(payload.error.message).toBeTypeOf("string");
        return;
      }

      expect(response.ok, JSON.stringify({ status: response.status, error: payload.error })).toBe(true);
      expect(payload.model).toBeTypeOf("string");
      expect(payload.content?.[0]?.type).toBe("text");
      expect(payload.content?.[0]?.text).toContain("Claude Anthropic conectado");
    },
    20_000,
  );
});

describe.skipIf(hasAnthropicKey)("Anthropic secret integration", () => {
  it("fica pendente quando ANTHROPIC_API_KEY não está configurada", () => {
    expect(process.env.ANTHROPIC_API_KEY).toBeUndefined();
  });
});

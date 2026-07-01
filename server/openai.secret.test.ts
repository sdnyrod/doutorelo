import { describe, expect, it } from "vitest";

const OPENAI_MODELS_ENDPOINT = "https://api.openai.com/v1/models";

async function validateOpenAIKey(apiKey: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(OPENAI_MODELS_ENDPOINT, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
    });

    const bodyText = await response.text();
    let parsed: unknown = null;
    try {
      parsed = bodyText ? JSON.parse(bodyText) : null;
    } catch {
      parsed = null;
    }

    return {
      ok: response.ok,
      status: response.status,
      parsed,
    };
  } finally {
    clearTimeout(timeout);
  }
}

describe("OpenAI secret configuration", () => {
  it("uses OPENAI_API_KEY from the secure environment and validates it against OpenAI without leaking the key", async () => {
    const apiKey = process.env.OPENAI_API_KEY;

    expect(apiKey, "OPENAI_API_KEY must be configured as an environment secret").toBeTruthy();
    expect(apiKey).toMatch(/^sk-/);

    const result = await validateOpenAIKey(apiKey as string);

    expect(result.status, "OpenAI credential should authenticate successfully").toBe(200);
    expect(result.ok).toBe(true);
    expect(JSON.stringify(result.parsed)).not.toContain(apiKey as string);
  }, 15_000);
});

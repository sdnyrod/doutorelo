import { describe, expect, it } from "vitest";
import { USER_INFO_STORAGE_KEY, buildPreparationPath, hasKnownAuthenticatedUser } from "./entryGateway";

function createStorage(value: string | null) {
  return {
    getItem: (key: string) => (key === USER_INFO_STORAGE_KEY ? value : null),
  };
}

describe("entryGateway", () => {
  it("builds the preparation route with an encoded, trimmed health intention", () => {
    const path = buildPreparationPath("  dor de cabeça há 3 dias & exames recentes  ");

    expect(path).toBe("/preparar-consulta?intencao=dor+de+cabe%C3%A7a+h%C3%A1+3+dias+%26+exames+recentes");
  });

  it("limits the intention payload to keep the entry path safe and compact", () => {
    const longIntention = "a".repeat(725);
    const path = buildPreparationPath(longIntention);
    const intention = new URLSearchParams(path.split("?")[1]).get("intencao");

    expect(intention).toHaveLength(700);
  });

  it("recognizes a locally known authenticated user", () => {
    const storage = createStorage(JSON.stringify({ openId: "user-123", name: "Paciente" }));

    expect(hasKnownAuthenticatedUser(storage)).toBe(true);
  });

  it("does not trust missing, null, empty, or malformed user records", () => {
    expect(hasKnownAuthenticatedUser(createStorage(null))).toBe(false);
    expect(hasKnownAuthenticatedUser(createStorage("null"))).toBe(false);
    expect(hasKnownAuthenticatedUser(createStorage("{}"))).toBe(false);
    expect(hasKnownAuthenticatedUser(createStorage("not-json"))).toBe(false);
  });
});

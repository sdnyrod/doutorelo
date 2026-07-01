import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("home chat copy and geolocation helper", () => {
  const homeSource = readFileSync(join(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

  it("não exibe frase fixa de geolocalização no campo inicial do chat", () => {
    expect(homeSource).not.toContain("Se escrever “perto de mim”, pediremos sua localização antes de indicar alguém.");
    expect(homeSource).not.toContain("Se escrever ‘perto de mim’, pediremos sua localização antes de indicar alguém.");
    expect(homeSource).not.toContain("pediremos sua localização antes de indicar alguém");
  });

  it("mantém o estado de busca de localização apenas quando a permissão é solicitada de fato", () => {
    expect(homeSource).toContain("Buscando sua localização aproximada...");
    expect(homeSource).toContain('geolocationStatus === "requesting"');
    expect(homeSource).toContain("shouldRequestBrowserGeolocation");
    expect(homeSource).toContain("PROXIMITY_INTENT_PATTERN");
  });
});

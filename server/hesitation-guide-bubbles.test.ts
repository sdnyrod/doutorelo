import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(__dirname, "..");
const homeSource = readFileSync(resolve(projectRoot, "client/src/pages/Home.tsx"), "utf8");
const globalCss = readFileSync(resolve(projectRoot, "client/src/index.css"), "utf8");

describe("hesitation guide bubbles usability", () => {
  it("keeps every guide bubble visible for a real reading window without rushing the text", () => {
    const durationMatches = homeSource.match(/durationMs:\s*13000/g) ?? [];

    expect(durationMatches).toHaveLength(4);
    expect(homeSource).not.toMatch(/durationMs:\s*5[0-9]{3}/);
  });

  it("renders the bubbles from subtle dynamic positions without sending them around the screen", () => {
    expect(homeSource).toContain('orbitClassName: "alien-intent-fragment--subtle-left"');
    expect(homeSource).toContain('orbitClassName: "alien-intent-fragment--subtle-center-high"');
    expect(homeSource).toContain('orbitClassName: "alien-intent-fragment--subtle-right"');
    expect(homeSource).toContain('orbitClassName: "alien-intent-fragment--subtle-center-low"');
    expect(homeSource).not.toContain('orbitClassName: "alien-intent-fragment--fixed-reading"');
    expect(homeSource).not.toContain('orbitClassName: "alien-intent-fragment--northwest"');
    expect(homeSource).not.toContain('orbitClassName: "alien-intent-fragment--east"');
    expect(homeSource).not.toContain('orbitClassName: "alien-intent-fragment--southwest"');
    expect(globalCss).toContain(".alien-intent-fragment--subtle-left");
    expect(globalCss).toContain(".alien-intent-fragment--subtle-center-high");
    expect(globalCss).toContain(".alien-intent-fragment--subtle-right");
    expect(globalCss).toContain(".alien-intent-fragment--subtle-center-low");
    expect(globalCss).toContain("translateY(0.22rem) !important;");
  });

  it("uses a larger, soft readable bubble style without heavy bold or red accents", () => {
    expect(homeSource).toContain("hesitation-guide-bubble--readable");
    expect(homeSource).toContain("sm:text-lg");
    expect(homeSource).toContain("font-normal");
    expect(homeSource).toContain("text-[#64748B]");
    expect(homeSource).toContain("rounded-[1.65rem] border border-[#E7ECF2] bg-[#FBFCFC]/95");
    expect(homeSource).not.toContain("border border-[#FF2432]/55 bg-white");
    expect(globalCss).toContain("font-weight: 400 !important;");
    expect(globalCss).toContain("color: #64748B !important;");
    expect(globalCss).toContain("animation: hesitation-guide-dynamic-appear 260ms ease-out both !important;");
    expect(globalCss).toContain("will-change: opacity;");
  });

  it("uses Sidney's exact four guide bubble texts", () => {
    expect(homeSource).toContain("Pode me perguntar o que quiser em relação à saúde e bem estar, vou procurar te ajudar");
    expect(homeSource).toContain("Você pode me pedir dicas de dieta, informações sobre nutrição");
    expect(homeSource).toContain("Se quiser indicação de algum profissional de saúde, bem estar, clínica, fique à vontade!");
    expect(homeSource).toContain("Está procurando algum nutracêutico, ou algum suplemento? Digite o nome que eu tento achar pra você");
  });
});

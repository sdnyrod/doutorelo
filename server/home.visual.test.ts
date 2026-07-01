import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const homeSource = readFileSync(join(projectRoot, "client/src/pages/Home.tsx"), "utf8");
const globalCss = readFileSync(join(projectRoot, "client/src/index.css"), "utf8");

describe("Home approved visual implementation", () => {
  it("removes the top system status dot and any visible active-status phrase", () => {
    expect(homeSource).not.toContain('data-home-system-status="visual-indicator-only"');
    expect(homeSource).not.toContain("DOUTORELO ativo sem texto no topo");
    expect(homeSource).not.toContain("IA integrativa ativa");
    expect(homeSource).not.toContain("IA INTEGRATIVA ATIVA");
  });

  it("uses a small black outlined arrow button without a filled background", () => {
    expect(homeSource).toContain('data-send-button-style="thin-black-circle-arrow-no-background"');
    expect(homeSource).toContain("rounded-full border border-[#0F1B33] bg-transparent text-[#0F1B33]");
    expect(homeSource).toContain('strokeWidth="1.8"');
    expect(homeSource).toContain('className="size-4"');
    expect(globalCss).toContain(".alien-send-button::after { content: none; }");
  });

  it("keeps the first fold on an absolute white background without red stains, mist, glow or gradients", () => {
    expect(homeSource).toContain('data-seamless-home-background="approved-white-offcanvas-field"');
    expect(homeSource).toContain('data-home-background="plain-white-field-no-red-stains"');
    expect(homeSource).toContain('className="min-h-dvh overflow-x-clip bg-white text-[#0F1B33] thumb-safe-bottom"');
    expect(homeSource).toContain('className="relative isolate flex min-h-[100svh] min-w-0 flex-col bg-white"');
    expect(globalCss).toContain("background: #ffffff;");
    expect(globalCss).toContain("body::before,");
    expect(globalCss).toContain("content: none;");

    const firstFoldSource = homeSource.slice(homeSource.indexOf('data-home-background="plain-white-field-no-red-stains"'));
    expect(firstFoldSource).not.toContain("bg-[linear-gradient(180deg");
    expect(firstFoldSource).not.toContain("bg-[radial-gradient");
    expect(firstFoldSource).not.toContain("0_0_72px_rgba(255,36,50");
    expect(firstFoldSource).not.toContain("0_0_44px_rgba(255,36,50");
    expect(firstFoldSource).not.toContain("0_0_38px_rgba(255,36,50");
    expect(globalCss).not.toContain("circle at 12% -8%, rgba(255, 36, 50, 0.18)");
    expect(globalCss).not.toContain("circle at 75% 84%, rgba(255, 36, 50, 0.16)");
    expect(globalCss).not.toContain("0 0 74px rgba(255, 36, 50");
  });
});

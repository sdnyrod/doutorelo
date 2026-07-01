import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const homeSource = () => readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const cssSource = () => readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

describe("Home public chat contract", () => {
  it("uses the public anonymous homeChat route for first-fold chat submissions", () => {
    const source = homeSource();

    expect(source).toContain("trpc.homeChat.send.useMutation");
    expect(source).toContain("homeChat.mutate");
    expect(source).not.toContain("trpc.careJourney.continue.useMutation");
    expect(source).not.toContain("careJourney.mutate({");
  });

  it("does not inject internal care-journey governance text into public chat responses", () => {
    const source = homeSource();

    expect(source).not.toContain("Governança: severidade");
    expect(source).not.toContain("data.aiCallTracking.policyVersion");
  });

  it("turns the Home into an alien command composer with an adaptive side capsule after the answer", () => {
    const source = homeSource();

    expect(source).toContain('data-chat-layout="alien-command-composer-responsive-drawer"');
    expect(source).toContain('data-chat-width="orbital-command-center"');
    expect(source).toContain('data-chat-surface="bioluminescent-orbital-command-surface"');
    expect(source).toContain('data-chat-input-shape="alien-single-line-command-capsule"');
    expect(source).toContain('doutorelo-logo.png');
    expect(source).toContain('data-chat-portal="future-commerce-4-intent-core"');
    expect(source).toContain('data-master-suggestion="alien-next-step-capsule"');
    expect(source).toContain('data-master-surface="desktop-orbital-side-capsule-mobile-inline"');
    expect(source).toContain('lg:grid-cols-[minmax(0,1fr)_24rem]');
    expect(source).toContain('xl:grid-cols-[minmax(0,1fr)_26rem]');
    expect(source).toContain('lg:sticky lg:top-8');
    expect(source).not.toContain('data-master-idle-rail="reserved-side-context"');
  });

  it("keeps the Home composer focused, accessible and not shaped like a heavy text area", () => {
    const source = homeSource();

    expect(source).toContain('data-chat-input-shape="alien-single-line-command-capsule"');
    expect(source).toContain('focus-within:border-[#0F1B33]');
    expect(source).toContain("autoFocus");
    expect(source).toContain("textareaRef.current?.focus({ preventScroll: true })");
    expect(source).toContain("requestAnimationFrame");
    expect(source).toContain("border border-[#E7ECF2] bg-white");
    expect(source).toContain("bg-transparent px-1 py-2");
    expect(source).not.toContain("alien-input-core-indicator");
    expect(cssSource()).toContain(".alien-composer-capsule::after { content: none; display: none; }");
    expect(cssSource()).not.toContain("border-top: 1px solid rgba(255, 36, 50, 0.78)");
    expect(source).not.toContain("health-question-counter");
    expect(source).not.toContain("{draft.length}/{MAX_DRAFT_LENGTH}");
    expect(source).not.toContain('data-chat-input-shape="large-body-text-area"');
  });

  it("keeps the Home footer as thin black text links without framed surface", () => {
    const source = homeSource();

    expect(source).toContain('aria-label="Compromissos de cuidado do DOUTORELO"');
    expect(source).toContain('font-normal text-[#64748B]');
    expect(source).toContain('shadow-none');
    expect(source).not.toContain('border border-[#DDE3EA] bg-white px-4 py-4 text-xs font-semibold');
    expect(source).not.toContain('font-black text-[#FF2432]');
  });

  it("guides hesitant first-time users with subtle, readable suggestions that stop on interaction", () => {
    const source = homeSource();
    const css = cssSource();

    expect(source).toContain("HESITATION_GUIDE_BUBBLES");
    expect(source).toContain("delayMs: 3200");
    expect(source).toContain("delayMs: 16800");
    expect(source).toContain("delayMs: 30400");
    expect(source).toContain("delayMs: 44000");
    expect(source.match(/durationMs:\s*13000/g) ?? []).toHaveLength(4);
    expect(source).toContain("alien-intent-fragment--subtle-left");
    expect(source).toContain("alien-intent-fragment--subtle-center-high");
    expect(source).toContain("alien-intent-fragment--subtle-right");
    expect(source).toContain("alien-intent-fragment--subtle-center-low");
    expect(source).not.toContain("alien-intent-fragment--fixed-reading");
    expect(source).not.toContain("alien-intent-fragment--northwest");
    expect(source).not.toContain("alien-intent-fragment--east");
    expect(source).not.toContain("alien-intent-fragment--southwest");
    expect(source).toContain("hesitation-guide-bubble--readable");
    expect(source).toContain("sm:text-lg");
    expect(source).toContain("font-normal");
    expect(source).toContain("text-[#64748B]");
    expect(source).toContain("border border-[#E7ECF2] bg-[#FBFCFC]/95");
    expect(source).not.toContain("border border-[#FF2432]/55 bg-white");
    expect(source).toContain("shouldRunHesitationGuides");
    expect(source).toContain("hesitationGuideTimersRef");
    expect(source).toContain('data-hesitation-guide-system="distributed-orbital-ai-first-experience"');
    expect(source).toContain('data-hesitation-guide="dynamic-readable-stop-on-interaction-suggestion"');
    expect(source).toContain("setActiveHesitationGuideIndex(index)");
    expect(source).toContain("guide.delayMs + guide.durationMs");
    expect(source).toContain("setHesitationGuidesDismissed(true)");
    expect(source).toContain("hesitationGuideTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))");
    expect(source).toContain("setLiveAnnouncement(`Sugestão breve para começar: ${guide.text}`)");
    expect(source).not.toContain("HESITATION_GUIDE_BUBBLES.map");
    expect(css).toContain(".alien-intent-fragment--subtle-left");
    expect(css).toContain(".alien-intent-fragment--subtle-center-high");
    expect(css).toContain(".alien-intent-fragment--subtle-right");
    expect(css).toContain(".alien-intent-fragment--subtle-center-low");
    expect(css).toContain(".hesitation-guide-bubble--readable");
    expect(css).toContain("transform: translateX(-50%) translateY(0.22rem) !important;");
    expect(css).toContain("hesitation-guide-dynamic-appear");
    expect(css).toContain("will-change: opacity;");
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(source).toContain("Pode me perguntar o que quiser em relação à saúde e bem estar, vou procurar te ajudar");
    expect(source).toContain("Você pode me pedir dicas de dieta, informações sobre nutrição");
    expect(source).toContain("Se quiser indicação de algum profissional de saúde, bem estar, clínica, fique à vontade!");
    expect(source).toContain("Está procurando algum nutracêutico, ou algum suplemento? Digite o nome que eu tento achar pra você");
  });

  it("documents the post-answer attention choreography and illuminated alien capsule reveal", () => {
    const source = homeSource();
    const css = cssSource();

    expect(source).toContain('data-attention-choreography="bioluminescent-capsule-reveal-after-answer"');
    expect(source).toContain("suggestionRevealTimerRef");
    expect(source).toContain("}, 1650)");
    expect(source).toContain('data-master-action={suggestion.action}');
    expect(source).toContain("setMessages((current) => [...current, { role: \"assistant\", content: data.assistantMessage }])");
    expect(source.indexOf("setMessages((current) => [...current, { role: \"assistant\", content: data.assistantMessage }])")).toBeLessThan(source.indexOf("window.setTimeout"));
    expect(css).toContain(".alien-master-capsule");
    expect(css).toContain("master-graceful-side");
    expect(css).toContain("master-card-illumination");
    expect(css).toContain("master-soft-shimmer");
    expect(css).toContain("master-attention-breathe");
    expect(css).toContain("opacity: 0.64");
    expect(css).toContain(".alien-master-capsule:hover");
    expect(css).toContain("--doutorelo-mint: #ffffff;");
    expect(css).toContain("--font-sans: \"Poppins\", ui-sans-serif, system-ui, sans-serif;");
    expect(css).toContain(".alien-composer-capsule::before,");
    expect(css).toContain(".alien-composer-capsule::after { content: none; display: none; }");
    expect(css).not.toContain("0 0 150px rgba(255, 36, 50, 0.28)");
    expect(css).not.toMatch(/box-shadow:[^\n]*rgba\(255,\s*36,\s*50/);
    expect(css).not.toMatch(/background:[^\n]*(?:#FF2432|rgba\(255,\s*36,\s*50)/);
    expect(css).toContain("prefers-reduced-motion: reduce");
  });
});

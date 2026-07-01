import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(__dirname, "..");
const homeSource = readFileSync(resolve(projectRoot, "client/src/pages/Home.tsx"), "utf8");
const adminSource = readFileSync(resolve(projectRoot, "client/src/pages/Admin.tsx"), "utf8");
const appSource = readFileSync(resolve(projectRoot, "client/src/App.tsx"), "utf8");
const globalStyles = readFileSync(resolve(projectRoot, "client/src/index.css"), "utf8");
const indexHtml = readFileSync(resolve(projectRoot, "client/index.html"), "utf8");
const loginDialogSource = readFileSync(resolve(projectRoot, "client/src/components/DoutoreloAuthDialog.tsx"), "utf8");
const loginPageSource = readFileSync(resolve(projectRoot, "client/src/pages/Login.tsx"), "utf8");
const loginConstSource = readFileSync(resolve(projectRoot, "client/src/const.ts"), "utf8");
const entryGatewaySource = readFileSync(resolve(projectRoot, "client/src/lib/entryGateway.ts"), "utf8");
const useAuthSource = readFileSync(resolve(projectRoot, "client/src/_core/hooks/useAuth.ts"), "utf8");
const viteConfigSource = readFileSync(resolve(projectRoot, "vite.config.ts"), "utf8");
const publicManusPath = resolve(projectRoot, "client/public/__manus__");
const legacyManusDialogPath = resolve(projectRoot, "client/src/components/ManusDialog.tsx");
const finalTransparentLogoPath = "/home/ubuntu/webdev-static-assets/doutorelo-logo-branca-pulso-vermelho.png";
const verifyLogoTransparencyScript = resolve(projectRoot, "scripts/verify_logo_transparency.py");

const expectAll = (source: string, markers: string[]) => {
  for (const marker of markers) {
    expect(source).toContain(marker);
  }
};

const forbiddenArtificialOrDefensiveCopy = [
  "organize seus sinais",
  "ORGANIZE SEUS SINAIS",
  "Seu corpo pede escuta",
  "o que seu corpo está tentando dizer",
  "Jornada de Clareza",
  "Mapa de Clareza",
  "Memória longitudinal",
  "memória longitudinal",
  "clareza sistêmica",
  "fallback humano",
  "humano no circuito",
  "Política IA",
  "Incerteza declarada",
  "IA com limite",
  "Contexto antes da conduta",
  "IA com critério clínico",
  "Português humano, sem tradução automática",
  "Experiência reconstruída",
  "Guardrail clínico",
  "Console de continuidade",
  "Um console para enxergar continuidade",
  "Carrinho DEV",
  "Checkout DEV",
  "Solicitação DEV",
];

const brandPalette = [
  "#0D1B2D",
  "#0F1B33",
  "#F7F8FA",
  "#E5E7EB",
];

describe("DOUTORELO official home brand contract", () => {
  it("uses only the official DOUTORELO logo asset provided by the user", () => {
    expectAll(homeSource, [
      "data-doutorelo-home-signature=\"elos-premium\"",
      "OFFICIAL_DOUTORELO_LOGO_URL",
      "doutorelo-logo.png",
      "data-official-doutorelo-logo=\"true\"",
      "alt=\"DOUTORELO · IA de saúde funcional\"",
      "BrandLogo",
    ]);

    expect(homeSource).not.toContain("import.meta.env.VITE_APP_LOGO");
    expect(homeSource).not.toContain("/manus-storage/doutorelo-logo-oficial-web_eba9ae94.png");
    expect(homeSource).not.toContain(">\n        D\n      </span>");
    expect(homeSource).not.toContain("rounded-2xl object-contain shadow-[0_18px_40px_rgba(18,63,58,0.12)]");
  });

  it("keeps the approved transparent white wordmark with red pulse visible", () => {
    expect(existsSync(finalTransparentLogoPath)).toBe(true);
    expect(existsSync(verifyLogoTransparencyScript)).toBe(true);
    const verification = execFileSync("python3.11", [verifyLogoTransparencyScript], {
      cwd: projectRoot,
      encoding: "utf8",
    });
    expect(verification).toContain("visible_white_pixels=");
    expect(verification).toContain("visible_red_pixels=");
    expect(verification).toContain("PASS: approved white wordmark and red pulse logo remains visible with transparency");
  });

  it("keeps the approved white, navy and red identity while preserving the product structure", () => {
    expectAll(`${homeSource}\n${globalStyles}\n${loginPageSource}`, brandPalette);
    expectAll(globalStyles, [
      "--doutorelo-ink: #0D1B2D",
      "--doutorelo-deep: #0D1B2D",
      "--doutorelo-teal: #6EC1B4",
      "--doutorelo-mint: #ffffff",
      "--doutorelo-aqua: #ffffff",
      "--doutorelo-foam: #F7F8FA",
      "--doutorelo-border: #E5E7EB",
      "--doutorelo-spectrum-cyan: #22D3EE",
      "--doutorelo-spectrum-coral: #F97373",
      "--doutorelo-abyss: #0D1B2D",
    ]);
  });

  it("replaces the quiet chat-first page with a silent intent-led portal", () => {
    expectAll(homeSource, [
      "bg-white",
      "data-chat-first-home=\"doutorelo-conversa-primeiro\"",
      "Digite sua mensagem.",
      "data-clean-first-fold=\"only-field-instruction\"",
      "data-seamless-home-background=\"approved-white-offcanvas-field\"",
      "data-home-background=\"plain-white-field-no-red-stains\"",
      "data-chat-portal=\"future-commerce-4-intent-core\"",
      "trpc.homeChat.send.useMutation",
      "aria-label=\"Começar conversa de saúde no DOUTORELO\"",
      "Mensagem de saúde para o DOUTORELO",
    ]);

    expect(homeSource).not.toContain("observatorio-vivo-cuidado");
    expect(homeSource).not.toContain("Escreva o que está acontecendo");
    expect(homeSource).not.toContain("Organizar minha consulta");
    expect(homeSource).not.toContain("organizar para sua consulta");
    expect(homeSource).not.toMatch(/desdobrar|desdobramento|desdobrado|desdobrada/i);
    expect(homeSource).not.toContain("Curadoria neural");
    expect(homeSource).not.toContain("Future Commerce 4.0");
    expect(homeSource).not.toContain("Marketplace vivo");
    expect(homeSource).not.toContain("Você descreve a intenção");
  });

  it("keeps the first fold chat-led while making the sophistication structural, not verbose", () => {
    expectAll(homeSource, [
      "data-clean-first-fold=\"only-field-instruction\"",
      "placeholder={hasConversation ? \"\" : INITIAL_CHAT_PLACEHOLDER}",
      "aria-label={hasConversation ? \"Enviar resposta\" : \"Começar conversa\"}",
      "AmbientSignalField",
      "pointer-events-none absolute inset-0 bg-white",
      "alien-composer-capsule",
    ]);

    expect(homeSource).not.toContain("<h1");
    expect(homeSource).not.toContain("Qual é a sua dúvida sobre saúde?");
    expect(homeSource).not.toMatch(/>\s*(Começar conversa|Enviar resposta|Entrar)\s*</);
    expect(homeSource).not.toContain("A resposta é educativa e não substitui consulta");
    expect(homeSource).not.toContain("Primeiro a conversa. Depois, os recursos certos.");
  });

  it("uses the approved white/off-white first fold and avoids regression to filled red-glow styling", () => {
    expectAll(homeSource, [
      "min-h-dvh overflow-x-clip bg-white",
      "relative isolate flex min-h-[100svh] min-w-0 flex-col bg-white",
      "data-chat-surface=\"bioluminescent-orbital-command-surface\"",
      "data-chat-input-shape=\"alien-single-line-command-capsule\"",
      "data-home-background=\"plain-white-field-no-red-stains\"",
      "bg-transparent p-0 shadow-none",
      "data-send-button-style=\"thin-black-circle-arrow-no-background\"",
    ]);

    expectAll(globalStyles, [
      ".alien-lumen { display: none;",
      ".alien-send-button::after { content: none; }",
      ".alien-composer-capsule::before,\n.alien-composer-capsule::after { content: none; display: none; }",
      "body {",
      "background: #ffffff;",
    ]);

    expect(homeSource).not.toContain("data-home-system-status=\"visual-indicator-only\"");
    expect(homeSource).not.toContain("data-home-constellation=\"silent-orbital-atmosphere\"");
    expect(homeSource).not.toContain("silent-orbital-thread--left");
    expect(homeSource).not.toContain("silent-orbital-prism");
    expect(homeSource).not.toContain("alien-lumen--a");
    expect(homeSource).not.toContain("alien-dimensional-rift");
    expect(homeSource).not.toContain("alien-bio-lattice--left");
    expect(homeSource).not.toContain("alien-depth-node--alpha");
    expect(globalStyles).not.toMatch(/background:[^\n]*(?:#FF2432|rgba\(255,\s*36,\s*50)/);
    expect(globalStyles).not.toMatch(/box-shadow:[^\n]*rgba\(255,\s*36,\s*50/);
    expect(globalStyles).not.toMatch(/(?:linear-gradient|radial-gradient)\([^\n]*(?:#FF2432|255,\s*36,\s*50)/);

    expect(homeSource).not.toContain("IA integrativa ativa");
    expect(homeSource).not.toContain("IA INTEGRATIVA ATIVA");
    expect(homeSource).not.toContain("health-question-counter");
    expect(homeSource).not.toContain("{draft.length}/{MAX_DRAFT_LENGTH}");
    expect(homeSource).not.toContain("shadow-[inset_0_0_0_1px_rgba(217,244,235,0.96)]");
    expect(homeSource).not.toContain("bg-[radial-gradient(circle_at_20%_10%,rgba(255,36,50,0.30)");
  });

  it("keeps the visible home language Brazilian, mature and free from premature clinical education", () => {
    expectAll(homeSource, [
      "Digite sua mensagem.",
      "function TypingDots()",
      "onKeyDown={handleTextareaKeyDown}",
      "autoFocus",
      "textareaRef.current?.focus({ preventScroll: true })",
      "event.key !== \"Enter\" || event.shiftKey",
    ]);

    expect(homeSource).not.toContain("A plataforma não substitui consulta, diagnóstico ou atendimento de urgência.");
    expect(homeSource).not.toContain("A resposta é educativa e não substitui consulta");
    expect(homeSource).not.toContain("Se houver sinal grave ou piora rápida, procure atendimento imediato.");
    expect(homeSource).not.toContain("Pensando com cuidado clínico");
    expect(homeSource).not.toContain("Respondendo com cuidado clínico");
  });

  it("blocks artificial, defensive or internal phrases that make the experience sound like a product meeting", () => {
    for (const phrase of forbiddenArtificialOrDefensiveCopy) {
      expect(homeSource).not.toContain(phrase);
      expect(adminSource).not.toContain(phrase);
    }
  });

  it("keeps the page responsive, accessible and safe from dead-end public links", () => {
    expectAll(homeSource, [
      "sm:",
      "thumb-safe-bottom",
      "overflow-x-clip",
      "max-w-[min(92vw,34rem)]",
      "focus-visible:ring-2",
      "aria-label=\"Começar conversa de saúde no DOUTORELO\"",
      "sr-only",
      "aria-live=\"polite\"",
      "min-h-11",
    ]);
  });

  it("keeps the app shell and typography foundations intact", () => {
    expect(indexHtml).toContain("fonts.googleapis.com");
    expect(indexHtml).toContain("Poppins:wght@400;500;600;700;800;900");
    expect(globalStyles).toContain("--font-sans: \"Poppins\", ui-sans-serif, system-ui, sans-serif;");
    expect(appSource).toContain("ThemeProvider");
    expect(indexHtml).not.toContain("THIS IS THE START OF A COMMENT BLOCK");
  });

  it("keeps the DOUTORELO login flow with multiple auth methods and functional email+password", () => {
    expectAll(appSource, [
      "import Login from \"./pages/Login\";",
      "<Route path=\"/login\" component={Login} />",
    ]);

    expectAll(loginPageSource, [
      "/doutorelo-logo.png",
      "Continuar com Google",
      "Continuar com Apple",
      "Receber código por email",
      "Receber código por WhatsApp",
      "Entrar com email e senha",
      "Acesse sua conta",
      "trpc.auth.login.useMutation",
      "trpc.auth.register.useMutation",
      "Em breve",
    ]);

    expectAll(loginConstSource, [
      "export const getLoginUrl",
      "export const getOAuthLoginUrl",
      "export const getDoutoreloAuthHandoffUrl",
    ]);

    expect(loginPageSource).not.toMatch(/Manus OAuth|login via Manus|Entrar com Manus/i);
  });

  it("keeps level 2 white-label public surfaces free from explicit Manus exposure", () => {
    expectAll(indexHtml, [
      "DOUTORELO | IA para cuidar da sua saúde, do seu jeito.",
      "og:site_name",
      "twitter:card",
      "orientação de saúde não diagnóstica",
    ]);
    expectAll(loginDialogSource, [
      "/manus-storage/doutorelo-logo-branca-pulso-vermelho_1fef1ed6.png",
      "data-official-doutorelo-logo=\"access-dialog\"",
      "Acesse sua conta para continuar com segurança no DOUTORELO.",
      "Acessar minha conta",
    ]);
    expect(entryGatewaySource).toContain("doutorelo-session-info");
    expect(useAuthSource).toContain("USER_INFO_STORAGE_KEY");
    expect(viteConfigSource).toContain("/__doutorelo_dev__");
    expect(viteConfigSource).toContain('apply: "serve"');

    const publicCopySurface = [indexHtml, homeSource, loginPageSource, loginDialogSource]
      .join("\n")
      .replaceAll("/manus-storage/doutorelo-logo-branca-pulso-vermelho_1fef1ed6.png", "")
      .replaceAll("/manus-storage/doutorelo-logo.png", "");
    expect(publicCopySurface).not.toMatch(/\bmanus\b/i);
    expect(indexHtml).not.toContain("VITE_ANALYTICS_ENDPOINT");
    expect(indexHtml).not.toContain("manus-analytics");
    expect(loginDialogSource).not.toContain("w-16 h-16 bg-white rounded-xl");
    expect(loginDialogSource).not.toContain("Ilustração de acesso seguro");
    expect(loginDialogSource).not.toContain("Entre com sua conta Manus");
    expect(loginDialogSource).not.toContain("Entrar com Manus");
    expect(loginPageSource).not.toMatch(/Manus OAuth|login via Manus|Entrar com Manus|Entre com sua conta Manus/i);
    expect(loginPageSource).not.toContain("getOAuthLoginUrl(nextPath)");
    expect(loginPageSource).not.toContain("fluxo seguro da plataforma");
    expect(`${entryGatewaySource}\n${useAuthSource}`).not.toContain("manus-runtime-user-info");
    expect(viteConfigSource).not.toContain("/__manus__/debug-collector.js");
    expect(viteConfigSource).not.toContain("/__manus__/logs");
    expect(existsSync(publicManusPath)).toBe(false);
    expect(existsSync(legacyManusDialogPath)).toBe(false);
  });
});

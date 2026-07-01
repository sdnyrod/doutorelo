import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = resolve(__dirname, "..");
const homeSource = readFileSync(resolve(projectRoot, "client/src/pages/Home.tsx"), "utf8");
const appSource = readFileSync(resolve(projectRoot, "client/src/App.tsx"), "utf8");

describe("Home hidden DOUTORELO product navigation drawer", () => {
  it("keeps navigation hidden by default and exposes a discreet alien constellation trigger", () => {
    expect(homeSource).toContain("function ProductNavigationDrawer");
    expect(homeSource).toContain("const [productNavigationOpen, setProductNavigationOpen] = useState(false);");
    expect(homeSource).toContain('data-home-product-nav-trigger="alien-constellation-left-trigger"');
    expect(homeSource).toContain('data-home-product-navigation="alien-left-constellation-drawer"');
    expect(homeSource).toContain('data-home-product-navigation-state="closed-by-default"');
    expect(homeSource).toContain('data-home-product-navigation-position="left-hidden-prismatic-overlay"');
    expect(homeSource).toContain('data-home-product-navigation-interaction="discreet-trigger-orbital-accordion"');
    expect(homeSource).toContain('data-home-product-nav-backdrop="alien-constellation-overlay"');
    expect(homeSource).toContain('aria-label={open ? "Fechar menu DOUTORELO" : "Abrir menu DOUTORELO"}');
    expect(homeSource).toContain('data-mobile-logo-clearance="product-menu-safe-spacing"');
    expect(homeSource).toContain('className="ml-[4.75rem] inline-flex min-h-11 min-w-11 items-center');
    expect(homeSource).toContain('focus-visible:ring-[#0F1B33]" aria-label="Voltar ao início DOUTORELO"');
    expect(homeSource).toContain('open ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-[calc(100%+1.75rem)] opacity-0"');

    for (const rejectedPermanentSidebarPattern of [
      'className="fixed inset-y-4 left-4 z-40 hidden w-[18rem] lg:block"',
      'data-home-product-navigation-position="left-fixed-never-right"',
      'data-home-product-navigation="left-premium-command-sidebar"',
      'lg:pl-[20rem]',
      'data-home-product-navigation-mode="desktop-visible-rail-mobile-compact-trigger"',
    ]) {
      expect(homeSource).not.toContain(rejectedPermanentSidebarPattern);
    }
  });

  it("uses a white DOUTORELO panel instead of the old green/menta sidebar surface", () => {
    expect(homeSource).toContain('data-home-product-navigation-surface="doutorelo-bioluminescent-prism-panel"');
    expect(homeSource).toContain('rounded-[2rem] border border-[#E7ECF2] bg-white text-[#0F1B33]');
    expect(homeSource).toContain('shadow-[0_18px_56px_rgba(13,27,45,0.10)]');
    expect(homeSource).not.toContain('bg-[linear-gradient(152deg,rgba(255,255,255,0.94)_0%,rgba(247,248,250,0.92)_42%,rgba(229,231,235,0.66)_100%)]');
    expect(homeSource).not.toContain('#FF2432');
    expect(homeSource).toContain('#0F1B33');
    expect(homeSource).toContain('#64748B');
    expect(homeSource).toContain('#F8FAFC');
    expect(homeSource).not.toContain('#3BC7A2');

    for (const copiedReferenceColor of [
      'bg-[linear-gradient(165deg,#07111f_0%,#0a1f39_36%,#123f68_68%,#21649a_100%)]',
      '#07111f',
      '#0a1f39',
      '#123f68',
      '#21649a',
      'text-[0.64rem] font-black uppercase tracking-[0.32em] text-[#0F1B33]">Constelação DOUTORELO',
      'shadow-[0_24px_80px_rgba(13,27,45,0.16)]',
      'left-premium-gradient-sidebar',
    ]) {
      expect(homeSource).not.toContain(copiedReferenceColor);
    }
  });

  it("removes copied, non-implemented, and behind-the-scenes language from the menu", () => {
    for (const forbiddenCopy of [
      'Assistente DOUTORELO',
      'DOUTORELO Copilot',
      'Usuário DOUTORELO',
      'Constelação DOUTORELO',
      'Rotas de cuidado e comércio inteligente',
      'Área do paciente',
      'Memória de saúde',
      'Rede integrada',
      'Loja e operação',
      'Conta e administração',
      'Marketplace',
      'Curadoria da loja',
      'Administração',
      'Entrada segura',
      'Precisa de ajuda?',
      'Conta protegida',
      'Menu oculto',
      'A navegação aparece só quando você chama, preservando foco na conversa.',
      'navegação aparece',
      'quando você chama',
      'preservando foco',
      'left-premium-mobile-trigger',
      'left-light-active-item',
      'left-hover-accordion',
      'DemoFeatureMenu',
      'Tudo pronto para mostrar.',
      'Reunião 15:30',
      'Profissionais ligados ao Dayan',
      'ultra-modern-sidebar-rail',
      '[writing-mode:vertical-rl]',
      'fixed right',
    ]) {
      expect(homeSource).not.toContain(forbiddenCopy);
    }
  });

  it("links only to implemented product areas that exist in App routes", () => {
    const expectedHomeMenuLinks = [
      '/',
      '/app',
      '/preparar-consulta',
      '/memoria',
      '/profissionais',
      '/consultas',
      '/conexoes',
      '/marketplace',
      '/admin/marketplace',
      '/admin',
      '/login',
    ];

    for (const href of expectedHomeMenuLinks) {
      expect(homeSource).toContain(`href: "${href}"`);
    }

    expect(homeSource).not.toContain('href: "/componentes"');
    expect(homeSource).toContain('Continue no seu ritmo');
    expect(homeSource).toContain('Meu espaço');
    expect(homeSource).toContain('Preparar');
    expect(homeSource).toContain('Memória');
    expect(homeSource).toContain('Apoio');
    expect(homeSource).toContain('Explorar');
    expect(homeSource).toContain('Loja');
    expect(homeSource).toContain('Curadoria');
    expect(homeSource).toContain('Painel');
    expect(homeSource).toContain('Entrar');
  });

  it("keeps the referenced product areas mounted in the router", () => {
    for (const routePath of [
      '<Route path="/app"',
      '<Route path="/preparar-consulta"',
      '<Route path="/memoria"',
      '<Route path="/consultas"',
      '<Route path="/conexoes"',
      '<Route path="/marketplace"',
      '<Route path="/admin/marketplace"',
      '<Route path="/admin"',
      '<Route path="/login"',
    ]) {
      expect(appSource).toContain(routePath);
    }
  });

  it("uses an orbital AI command composer that recenters when drawer or next-step capsule are present", () => {
    expect(homeSource).toContain('data-chat-layout="alien-command-composer-responsive-drawer"');
    expect(homeSource).toContain('data-chat-realtime-position={productNavigationOpen ? "shifted-right-for-open-constellation" : "centered-orbital-command"}');
    expect(homeSource).toContain('data-chat-context-card-state={masterSuggestion ? "resized-with-next-step-capsule" : "wide-centered-intent-field"}');
    expect(homeSource).toContain('data-chat-width="orbital-command-center"');
    expect(homeSource).toContain('data-chat-surface="bioluminescent-orbital-command-surface"');
    expect(homeSource).toContain('data-chat-input-shape="alien-single-line-command-capsule"');
    expect(homeSource).toContain('lg:grid-cols-[minmax(0,1fr)_24rem]');
    expect(homeSource).toContain('xl:grid-cols-[minmax(0,1fr)_26rem]');
    expect(homeSource).toContain('max-h-24 min-h-10 flex-1 resize-none');
    expect(homeSource).toContain('autoFocus');
    expect(homeSource).not.toContain('health-question-counter');
    expect(homeSource).not.toContain('{draft.length}/{MAX_DRAFT_LENGTH}');

    for (const rejectedFatTextAreaPattern of [
      'min-h-[14rem]',
      'min-h-[16rem]',
      'min-h-[18rem]',
      'data-chat-input-shape="large-body-text-area"',
      'data-chat-layout="centered-fat-text-box"',
      'max-w-[48rem]',
    ]) {
      expect(homeSource).not.toContain(rejectedFatTextAreaPattern);
    }
  });
});

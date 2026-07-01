import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const homePath = resolve("/home/ubuntu/saude-integrativa-ia-dev/client/src/pages/Home.tsx");
let source = readFileSync(homePath, "utf8");

const navSectionsStart = source.indexOf("const DOUTORELO_PRODUCT_NAV_SECTIONS: ProductNavSection[] = [");
const navSectionsEnd = source.indexOf("const NAV_ICON_PATHS", navSectionsStart);
if (navSectionsStart === -1 || navSectionsEnd === -1) {
  throw new Error("Bloco DOUTORELO_PRODUCT_NAV_SECTIONS não encontrado.");
}

const navSectionsReplacement = `const DOUTORELO_PRODUCT_NAV_SECTIONS: ProductNavSection[] = [
  {
    title: "Cuidado",
    eyebrow: "Sua jornada",
    items: [
      { label: "Início", href: "/", icon: "grid", badge: "agora", description: "Retome a conversa inicial e os próximos passos do cuidado." },
      { label: "Área do paciente", href: "/app", icon: "layers", description: "Acesse o painel protegido com sua jornada de cuidado." },
      { label: "Preparar consulta", href: "/preparar-consulta", icon: "calendar", description: "Organize sintomas, dúvidas e objetivos antes da consulta." },
      { label: "Memória de saúde", href: "/memoria", icon: "memory", description: "Reúna informações importantes em uma linha de cuidado." },
    ],
  },
  {
    title: "Rede integrada",
    eyebrow: "Profissionais e vínculos",
    items: [
      { label: "Profissionais", href: "/profissionais", icon: "users", description: "Encontre especialistas por cidade, especialidade e modalidade." },
      { label: "Consultas", href: "/consultas", icon: "calendar", description: "Acompanhe solicitações, histórico e próximos passos." },
      { label: "Conexões", href: "/conexoes", icon: "network", description: "Veja encaminhamentos e vínculos da rede de cuidado." },
    ],
  },
  {
    title: "Soluções",
    eyebrow: "Loja e operação",
    items: [
      { label: "Marketplace", href: "/marketplace", icon: "shop", description: "Produtos com comunicação comercial separada de conduta clínica." },
      { label: "Curadoria da loja", href: "/admin/marketplace", icon: "admin", description: "Gestão do catálogo, disponibilidade e pedidos." },
    ],
  },
  {
    title: "Gestão",
    eyebrow: "Conta e administração",
    items: [
      { label: "Administração", href: "/admin", icon: "layers", description: "Rotinas protegidas de gestão do sistema." },
      { label: "Entrada segura", href: "/login", icon: "lock", description: "Acesse sua conta preservando a experiência protegida." },
    ],
  },
];

`;
source = `${source.slice(0, navSectionsStart)}${navSectionsReplacement}${source.slice(navSectionsEnd)}`;

const drawerStart = source.indexOf("function ProductNavigationDrawer(");
const drawerEnd = source.indexOf("function BrandLogo", drawerStart);
if (drawerStart === -1 || drawerEnd === -1) {
  throw new Error("Função ProductNavigationDrawer não encontrada.");
}

const drawerReplacement = `function ProductNavigationDrawer({ open, onToggle, onClose }: { open: boolean; onToggle: () => void; onClose: () => void }) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Cuidado: true,
    "Rede integrada": true,
  });
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  const toggleSection = (title: string) => {
    setExpandedSections((current) => ({ ...current, [title]: !current[title] }));
  };

  const handleNavigationClick = () => {
    onClose();
  };

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="doutorelo-product-navigation"
        aria-label={open ? "Fechar menu DOUTORELO" : "Abrir menu DOUTORELO"}
        data-home-product-nav-trigger="left-discreet-hidden-menu-trigger"
        className={\`fixed left-3 top-3 z-[60] grid size-11 touch-manipulation place-items-center rounded-full border transition duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28d7a3] focus-visible:ring-offset-2 sm:left-4 sm:top-4 \${open ? "border-[#d9f4eb] bg-white text-[#123f3a] shadow-[0_18px_48px_rgba(18,63,58,0.16)]" : "border-[#d9f4eb]/90 bg-white/88 text-[#123f3a] shadow-[0_14px_38px_rgba(18,63,58,0.11)] backdrop-blur-2xl hover:-translate-y-0.5 hover:border-[#28d7a3]/55 hover:bg-[#f2fffb] hover:shadow-[0_18px_48px_rgba(18,63,58,0.14)]"}\`}
      >
        <span className="sr-only">{open ? "Fechar menu" : "Abrir menu"}</span>
        <span className="relative flex size-5 items-center justify-center" aria-hidden="true">
          <span className={\`absolute h-[2px] w-5 rounded-full bg-current transition duration-300 \${open ? "rotate-45" : "-translate-y-1.5"}\`} />
          <span className={\`absolute h-[2px] w-4 rounded-full bg-current transition duration-300 \${open ? "opacity-0" : "translate-x-0.5 opacity-100"}\`} />
          <span className={\`absolute h-[2px] w-5 rounded-full bg-current transition duration-300 \${open ? "-rotate-45" : "translate-y-1.5"}\`} />
        </span>
      </button>

      <div
        aria-hidden="true"
        onClick={onClose}
        data-home-product-nav-backdrop="hidden-menu-overlay"
        className={\`fixed inset-0 z-40 bg-[#123f3a]/18 transition duration-500 \${open ? "opacity-100 backdrop-blur-[6px]" : "pointer-events-none opacity-0 backdrop-blur-0"}\`}
      />

      <aside
        id="doutorelo-product-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Menu DOUTORELO"
        data-home-product-navigation="hidden-left-doutorelo-drawer"
        data-home-product-navigation-state="closed-by-default"
        data-home-product-navigation-position="left-hidden-overlay"
        data-home-product-navigation-surface="doutorelo-light-foam-teal-panel"
        data-home-product-navigation-interaction="discreet-trigger-overlay-accordion"
        className={\`fixed inset-y-3 left-3 z-50 w-[min(88vw,22rem)] transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:inset-y-4 sm:left-4 sm:w-[22rem] \${open ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-[calc(100%+1.5rem)] opacity-0"}\`}
      >
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[1.85rem] border border-[#d9f4eb] bg-[linear-gradient(180deg,#ffffff_0%,#fbfffd_46%,#f2fffb_100%)] text-[#123f3a] shadow-[0_28px_90px_rgba(18,63,58,0.18)]" data-home-product-navigation-panel="doutorelo-brand-panel">
          <div className="pointer-events-none absolute -right-20 top-0 size-52 rounded-full bg-[#56e8b5]/22 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 bottom-10 size-60 rounded-full bg-[#28d7a3]/14 blur-3xl" />
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#28d7a3]/42 to-transparent" />

          <div className="relative border-b border-[#d9f4eb]/82 px-5 pb-4 pt-5">
            <a href="/" onClick={handleNavigationClick} className="group ml-12 flex min-w-0 items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28d7a3]" aria-label="Ir para o início DOUTORELO">
              <span className="grid size-10 shrink-0 place-items-center rounded-[1rem] border border-[#d9f4eb] bg-white text-[#16846f] shadow-[0_10px_26px_rgba(18,63,58,0.08)] transition duration-300 group-hover:-translate-y-0.5 group-hover:border-[#28d7a3]/52 group-hover:bg-[#f2fffb]">
                <ProductNavIcon icon="layers" />
              </span>
              <span className="min-w-0">
                <span className="block text-base font-black leading-none tracking-[-0.04em] text-[#202327]">DOUTORELO</span>
                <span className="mt-1 block truncate text-[0.67rem] font-bold uppercase tracking-[0.18em] text-[#16846f]">Saúde integrativa IA</span>
              </span>
            </a>
          </div>

          <nav className="relative min-h-0 flex-1 overflow-y-auto px-3 py-4" aria-label="Navegação principal do DOUTORELO">
            <div className="space-y-2">
              {DOUTORELO_PRODUCT_NAV_SECTIONS.map((section) => {
                const expanded = expandedSections[section.title] ?? false;
                const sectionIsActive = section.items.some((item) => currentPath === item.href || (item.href !== "/" && currentPath.startsWith(item.href)));
                return (
                  <section key={section.title} className="rounded-[1.25rem]" data-home-product-nav-group="doutorelo-light-accordion">
                    <button
                      type="button"
                      onClick={() => toggleSection(section.title)}
                      aria-expanded={expanded}
                      className={\`group flex min-h-12 w-full items-center gap-3 rounded-[1.05rem] px-3.5 py-2.5 text-left transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28d7a3] \${sectionIsActive ? "bg-[#f2fffb] text-[#123f3a] shadow-[inset_0_0_0_1px_rgba(40,215,163,0.22)]" : "text-[#4c635d] hover:-translate-y-0.5 hover:bg-white hover:text-[#123f3a] hover:shadow-[0_14px_34px_rgba(18,63,58,0.07)]"}\`}
                    >
                      <span className={\`grid size-9 shrink-0 place-items-center rounded-[0.85rem] border transition duration-300 \${sectionIsActive ? "border-[#28d7a3]/34 bg-white text-[#16846f]" : "border-[#d9f4eb] bg-white/74 text-[#16846f] group-hover:border-[#28d7a3]/40 group-hover:bg-[#f2fffb]"}\`}>
                        <ProductNavIcon icon={section.items[0]?.icon ?? "layers"} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-black tracking-[-0.02em]">{section.title}</span>
                        <span className="mt-0.5 block truncate text-[0.68rem] font-semibold text-[#6d827c]">{section.eyebrow}</span>
                      </span>
                      <svg aria-hidden="true" viewBox="0 0 24 24" className={\`size-4 shrink-0 transition duration-300 \${expanded ? "rotate-90 text-[#16846f]" : "text-[#8aa19a] group-hover:translate-x-0.5 group-hover:text-[#16846f]"}\`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 6 6 6-6 6" />
                      </svg>
                    </button>

                    <div className={\`grid transition-all duration-300 ease-out \${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}\`}>
                      <div className="min-h-0 overflow-hidden">
                        <div className="ml-[2.05rem] mt-1 space-y-1 border-l border-[#d9f4eb] pl-3">
                          {section.items.map((item) => {
                            const isActive = currentPath === item.href || (item.href !== "/" && currentPath.startsWith(item.href));
                            return (
                              <a
                                key={\`\${section.title}-\${item.href}\`}
                                href={item.href}
                                onClick={handleNavigationClick}
                                aria-current={isActive ? "page" : undefined}
                                data-home-product-nav-active={isActive ? "doutorelo-light-active-item" : undefined}
                                className={\`group/item flex min-h-11 items-center gap-2 rounded-[0.95rem] px-2.5 py-2 text-sm font-bold transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28d7a3] \${isActive ? "bg-white text-[#123f3a] shadow-[0_12px_30px_rgba(18,63,58,0.09),inset_0_0_0_1px_rgba(40,215,163,0.24)]" : "text-[#4c635d] hover:translate-x-1 hover:bg-white hover:text-[#123f3a] hover:shadow-[0_10px_26px_rgba(18,63,58,0.06)]"}\`}
                              >
                                <span className={\`grid size-7 shrink-0 place-items-center rounded-[0.72rem] transition duration-300 \${isActive ? "bg-[#f2fffb] text-[#16846f]" : "bg-[#f6fffc] text-[#16846f]/76 group-hover/item:bg-[#f2fffb] group-hover/item:text-[#16846f]"}\`}>
                                  <ProductNavIcon icon={item.icon} />
                                </span>
                                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                                {item.badge ? <span className="rounded-full bg-[#28d7a3]/14 px-1.5 py-0.5 text-[0.58rem] font-black uppercase tracking-[0.1em] text-[#16846f]">{item.badge}</span> : null}
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>
          </nav>

          <div className="relative border-t border-[#d9f4eb]/82 p-3">
            <div className="rounded-[1.2rem] border border-[#d9f4eb] bg-white/72 px-3.5 py-3 shadow-[0_14px_34px_rgba(18,63,58,0.06)]">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#16846f]">Menu oculto</p>
              <p className="mt-1 text-sm font-semibold leading-5 text-[#4c635d]">A navegação aparece só quando você chama, preservando foco na conversa.</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

`;
source = `${source.slice(0, drawerStart)}${drawerReplacement}${source.slice(drawerEnd)}`;

source = source.replace(
  'className="relative isolate flex min-h-[100svh] flex-col bg-[linear-gradient(180deg,#ffffff_0%,#fbfffd_54%,#f7fffc_100%)] lg:pl-[20rem]"',
  'className="relative isolate flex min-h-[100svh] flex-col bg-[linear-gradient(180deg,#ffffff_0%,#fbfffd_54%,#f7fffc_100%)]"',
);

writeFileSync(homePath, source);

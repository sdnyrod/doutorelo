from pathlib import Path

home_path = Path('/home/ubuntu/saude-integrativa-ia-dev/client/src/pages/Home.tsx')
text = home_path.read_text()
start = text.index('type ProductNavItem = {')
end = text.index('\nfunction BrandLogo')

new_block = r'''type ProductNavItem = {
  label: string;
  href: string;
  description: string;
  icon: "grid" | "spark" | "calendar" | "memory" | "users" | "network" | "shop" | "admin" | "lock" | "layers";
  badge?: string;
};

type ProductNavSection = {
  title: string;
  eyebrow: string;
  items: ProductNavItem[];
};

const DOUTORELO_PRODUCT_NAV_SECTIONS: ProductNavSection[] = [
  {
    title: "Cuidado",
    eyebrow: "Jornada do paciente",
    items: [
      { label: "Painel", href: "/", icon: "grid", badge: "ativo", description: "Conversa inicial, sinais recentes e próximos passos do cuidado." },
      { label: "Assistente DOUTORELO", href: "/app", icon: "spark", description: "Acompanhe prioridades e orientações em uma leitura simples." },
      { label: "Preparar consulta", href: "/preparar-consulta", icon: "calendar", description: "Organize sintomas, dúvidas e objetivos antes da consulta." },
      { label: "Memória de saúde", href: "/memoria", icon: "memory", description: "Reúna fatos importantes do cuidado em uma linha viva." },
    ],
  },
  {
    title: "Rede integrada",
    eyebrow: "Profissionais e conexões",
    items: [
      { label: "Profissionais", href: "/profissionais", icon: "users", description: "Encontre especialistas por cidade, especialidade e modalidade." },
      { label: "Consultas", href: "/consultas", icon: "calendar", description: "Veja solicitações, histórico e próximos movimentos." },
      { label: "Conexões", href: "/conexoes", icon: "network", description: "Entenda encaminhamentos entre paciente, rede e suporte." },
    ],
  },
  {
    title: "Soluções",
    eyebrow: "Curadoria e operação",
    items: [
      { label: "Marketplace", href: "/marketplace", icon: "shop", description: "Produtos e recomendações alinhados ao cuidado integrativo." },
      { label: "Curadoria da loja", href: "/admin/marketplace", icon: "admin", description: "Catálogo, disponibilidade, pedidos e publicações." },
    ],
  },
  {
    title: "Gestão",
    eyebrow: "Conta e sistema",
    items: [
      { label: "Administração", href: "/admin", icon: "layers", description: "Rotinas operacionais, agenda e visão de gestão." },
      { label: "Acesso seguro", href: "/login", icon: "lock", description: "Entre na conta e mantenha a experiência protegida." },
      { label: "Biblioteca visual", href: "/componentes", icon: "layers", description: "Padrões de interface e componentes reutilizáveis." },
    ],
  },
];

const NAV_ICON_PATHS: Record<ProductNavItem["icon"], JSX.Element> = {
  grid: (
    <>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h3A1.5 1.5 0 0 1 10 5.5v3A1.5 1.5 0 0 1 8.5 10h-3A1.5 1.5 0 0 1 4 8.5v-3Z" />
      <path d="M14 5.5A1.5 1.5 0 0 1 15.5 4h3A1.5 1.5 0 0 1 20 5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 14 8.5v-3Z" />
      <path d="M4 15.5A1.5 1.5 0 0 1 5.5 14h3a1.5 1.5 0 0 1 1.5 1.5v3A1.5 1.5 0 0 1 8.5 20h-3A1.5 1.5 0 0 1 4 18.5v-3Z" />
      <path d="M14 15.5a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a1.5 1.5 0 0 1-1.5-1.5v-3Z" />
    </>
  ),
  spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm6 11 1 2.8 3 1.2-3 1.1-1 2.9-1-2.9-3-1.1 3-1.2 1-2.8Z" />,
  calendar: <><path d="M7 3v3" /><path d="M17 3v3" /><path d="M4.5 8h15" /><path d="M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" /></>,
  memory: <><path d="M8 3v3" /><path d="M16 3v3" /><path d="M8 18v3" /><path d="M16 18v3" /><path d="M3 8h3" /><path d="M18 8h3" /><path d="M3 16h3" /><path d="M18 16h3" /><path d="M7 6h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" /></>,
  users: <><path d="M16 11a4 4 0 1 0-8 0" /><path d="M4 20a8 8 0 0 1 16 0" /><path d="M18.5 8.5a2.5 2.5 0 0 1 0 5" /></>,
  network: <><path d="M12 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" /><path d="M5 15a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" /><path d="M19 15a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" /><path d="m10 10-3.5 5.3" /><path d="m14 10 3.5 5.3" /></>,
  shop: <><path d="M5 10h14l-1.2 9H6.2L5 10Z" /><path d="M8 10V8a4 4 0 0 1 8 0v2" /><path d="M8.5 14h7" /></>,
  admin: <><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="M12 12l8-4.5" /><path d="M12 12v9" /><path d="M12 12 4 7.5" /></>,
  lock: <><path d="M7 11V8a5 5 0 0 1 10 0v3" /><path d="M6 11h12v9H6v-9Z" /><path d="M12 15v2" /></>,
  layers: <><path d="m12 3 8 4-8 4-8-4 8-4Z" /><path d="m4 12 8 4 8-4" /><path d="m4 17 8 4 8-4" /></>,
};

function ProductNavIcon({ icon }: { icon: ProductNavItem["icon"] }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      {NAV_ICON_PATHS[icon]}
    </svg>
  );
}

function ProductNavigationDrawer({ open, onToggle, onClose }: { open: boolean; onToggle: () => void; onClose: () => void }) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Cuidado: true,
    "Rede integrada": true,
  });
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";

  const toggleSection = (title: string) => {
    setExpandedSections((current) => ({ ...current, [title]: !current[title] }));
  };

  const sidebarContent = (mode: "desktop" | "mobile") => (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[1.65rem] border border-white/10 bg-[linear-gradient(165deg,#07111f_0%,#0a1f39_36%,#123f68_68%,#21649a_100%)] text-white shadow-[0_28px_90px_rgba(7,17,31,0.34)]" data-home-product-navigation-surface="left-premium-gradient-sidebar">
      <div className="pointer-events-none absolute -right-24 top-0 size-64 rounded-full bg-[#47b7ff]/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-28 bottom-20 size-72 rounded-full bg-[#28d7a3]/18 blur-3xl" />
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/44 to-transparent" />

      <div className="relative flex items-center justify-between border-b border-white/10 px-4 py-4">
        <a href="/" onClick={mode === "mobile" ? onClose : undefined} className="group flex min-w-0 items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8bd8ff]" aria-label="Ir para o painel DOUTORELO">
          <span className="grid size-11 shrink-0 place-items-center rounded-[1.05rem] border border-white/12 bg-white/[0.08] text-[#c6edff] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_12px_32px_rgba(0,0,0,0.18)] duration-300 group-hover:scale-[1.03] group-hover:bg-white/[0.14]">
            <ProductNavIcon icon="layers" />
          </span>
          <span className="min-w-0">
            <span className="block text-xl font-black leading-none tracking-[-0.05em] text-white">DOUTORELO</span>
            <span className="mt-1 block truncate text-[0.68rem] font-bold uppercase tracking-[0.22em] text-[#8bd8ff]">Saúde integrativa IA</span>
          </span>
        </a>
        <button
          type="button"
          onClick={mode === "mobile" ? onClose : onToggle}
          aria-label={mode === "mobile" ? "Fechar navegação" : "Recolher navegação"}
          className="grid size-10 shrink-0 place-items-center rounded-[0.95rem] border border-white/10 bg-white/[0.06] text-[#b7cae0] duration-300 hover:-translate-y-0.5 hover:bg-white/[0.13] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8bd8ff]"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {mode === "mobile" ? <><path d="m7 7 10 10" /><path d="M17 7 7 17" /></> : <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>}
          </svg>
        </button>
      </div>

      <nav className="relative min-h-0 flex-1 overflow-y-auto px-3 py-4" aria-label="Navegação principal do DOUTORELO">
        <a
          href="/"
          onClick={mode === "mobile" ? onClose : undefined}
          aria-current={currentPath === "/" ? "page" : undefined}
          data-home-product-nav-active="left-light-active-item"
          className="group mb-3 flex min-h-[3.8rem] items-center gap-3 rounded-[1.1rem] bg-white px-3.5 py-3 text-[#07111f] shadow-[0_18px_42px_rgba(0,0,0,0.22)] duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_54px_rgba(0,0,0,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8bd8ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111f]"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-[0.9rem] bg-[#eaf7ff] text-[#2f7fb3] duration-300 group-hover:scale-[1.04]">
            <ProductNavIcon icon="grid" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-base font-black tracking-[-0.035em]">Painel</span>
            <span className="mt-0.5 block truncate text-xs font-semibold text-[#607080]">Início da jornada</span>
          </span>
          <span className="size-2.5 rounded-full bg-[#28d7a3] shadow-[0_0_20px_rgba(40,215,163,0.85)]" />
        </a>

        <a
          href="/app"
          onClick={mode === "mobile" ? onClose : undefined}
          className="group mb-5 flex min-h-12 items-center gap-3 rounded-[1rem] px-3.5 py-2.5 text-[#b7cae0] duration-300 hover:translate-x-1 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8bd8ff]"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-[0.85rem] border border-white/10 bg-white/[0.04] duration-300 group-hover:bg-white/[0.12] group-hover:text-[#8bd8ff]">
            <ProductNavIcon icon="spark" />
          </span>
          <span className="min-w-0 flex-1 text-sm font-black tracking-[-0.02em]">Assistente DOUTORELO</span>
          <span className="rounded-full bg-[#28d7a3]/12 px-2 py-1 text-[0.62rem] font-black uppercase tracking-[0.12em] text-[#8fffe1]">IA</span>
        </a>

        <div className="h-px bg-white/10" />

        <div className="mt-4 space-y-2">
          {DOUTORELO_PRODUCT_NAV_SECTIONS.slice(1).map((section) => {
            const expanded = expandedSections[section.title] ?? false;
            return (
              <section key={section.title} className="rounded-[1.1rem]" data-home-product-nav-group="left-hover-accordion">
                <button
                  type="button"
                  onClick={() => toggleSection(section.title)}
                  aria-expanded={expanded}
                  className="group flex min-h-12 w-full items-center gap-3 rounded-[1rem] px-3.5 py-2.5 text-left text-[#aabbd0] duration-300 hover:translate-x-1 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8bd8ff]"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-[0.85rem] border border-white/10 bg-white/[0.04] duration-300 group-hover:bg-white/[0.12] group-hover:text-[#8bd8ff]">
                    <ProductNavIcon icon={section.items[0]?.icon ?? "layers"} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black tracking-[-0.02em]">{section.title}</span>
                    <span className="mt-0.5 block truncate text-[0.68rem] font-semibold text-[#72869f] group-hover:text-[#b7cae0]">{section.eyebrow}</span>
                  </span>
                  <svg aria-hidden="true" viewBox="0 0 24 24" className={`size-4 shrink-0 duration-300 ${expanded ? "rotate-90 text-[#8bd8ff]" : "text-[#5e7189] group-hover:translate-x-0.5 group-hover:text-[#b7cae0]"}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </button>

                <div className={`grid duration-300 ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="min-h-0 overflow-hidden">
                    <div className="ml-[2.05rem] mt-1 space-y-1 border-l border-white/10 pl-3">
                      {section.items.map((item) => {
                        const isActive = currentPath === item.href;
                        return (
                          <a
                            key={`${section.title}-${item.href}`}
                            href={item.href}
                            onClick={mode === "mobile" ? onClose : undefined}
                            aria-current={isActive ? "page" : undefined}
                            className={`group/item flex min-h-10 items-center gap-2 rounded-[0.85rem] px-2.5 py-2 text-sm font-bold duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8bd8ff] ${isActive ? "bg-white text-[#07111f] shadow-[0_14px_34px_rgba(0,0,0,0.18)]" : "text-[#94a8bf] hover:translate-x-1 hover:bg-white/[0.07] hover:text-white"}`}
                          >
                            <span className={`grid size-7 shrink-0 place-items-center rounded-[0.7rem] duration-300 ${isActive ? "bg-[#eaf7ff] text-[#2f7fb3]" : "bg-white/[0.04] text-[#7f94ac] group-hover/item:bg-white/[0.12] group-hover/item:text-[#8bd8ff]"}`}>
                              <ProductNavIcon icon={item.icon} />
                            </span>
                            <span className="min-w-0 flex-1 truncate">{item.label}</span>
                            {item.badge ? <span className="rounded-full bg-[#28d7a3]/16 px-1.5 py-0.5 text-[0.58rem] font-black uppercase tracking-[0.1em] text-[#8fffe1]">{item.badge}</span> : null}
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

      <div className="relative border-t border-white/10 p-3">
        <a href="/app" onClick={mode === "mobile" ? onClose : undefined} className="group mb-3 flex items-center gap-3 rounded-[1.15rem] border border-[#6ba7ff]/22 bg-[linear-gradient(135deg,rgba(58,111,255,0.42),rgba(132,86,255,0.38))] p-3 text-white shadow-[0_18px_48px_rgba(41,91,170,0.24)] duration-300 hover:-translate-y-0.5 hover:border-[#8bd8ff]/50 hover:shadow-[0_22px_58px_rgba(41,91,170,0.34)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8bd8ff]">
          <span className="grid size-11 shrink-0 place-items-center rounded-[1rem] bg-white/12 text-[#dfeaff] duration-300 group-hover:scale-[1.04] group-hover:bg-white/18">
            <ProductNavIcon icon="spark" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-black tracking-[-0.02em]">Precisa de ajuda?</span>
            <span className="mt-0.5 block text-xs font-semibold text-[#cfddff]">DOUTORELO Copilot</span>
          </span>
        </a>

        <a href="/login" onClick={mode === "mobile" ? onClose : undefined} className="group flex items-center gap-3 rounded-[1.05rem] px-2 py-2.5 text-[#d6e2f0] duration-300 hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8bd8ff]">
          <span className="grid size-11 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.06] text-sm font-black duration-300 group-hover:bg-white/[0.13]">D</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-black tracking-[-0.02em]">Usuário DOUTORELO</span>
            <span className="mt-0.5 block truncate text-xs font-semibold text-[#72869f] group-hover:text-[#b7cae0]">Conta protegida</span>
          </span>
        </a>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="doutorelo-product-navigation-mobile"
        aria-label={open ? "Fechar navegação principal" : "Abrir navegação principal"}
        data-home-product-nav-trigger="left-premium-mobile-trigger"
        className="fixed left-4 top-4 z-50 grid size-12 place-items-center rounded-[1.05rem] border border-white/72 bg-[#07111f] text-white shadow-[0_18px_48px_rgba(7,17,31,0.24)] duration-300 hover:-translate-y-0.5 hover:bg-[#0a1f39] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8bd8ff] lg:hidden"
      >
        <span className="relative flex size-6 items-center justify-center">
          <span className={`absolute h-0.5 w-5 rounded-full bg-current duration-300 ${open ? "rotate-45" : "-translate-y-1.5"}`} />
          <span className={`absolute h-0.5 w-5 rounded-full bg-current duration-300 ${open ? "opacity-0" : "opacity-100"}`} />
          <span className={`absolute h-0.5 w-5 rounded-full bg-current duration-300 ${open ? "-rotate-45" : "translate-y-1.5"}`} />
        </span>
      </button>

      <aside
        id="doutorelo-product-navigation"
        aria-label="Navegação principal esquerda do DOUTORELO"
        data-home-product-navigation="left-premium-command-sidebar"
        data-home-product-navigation-position="left-fixed-never-right"
        data-home-product-navigation-interaction="hover-active-accordion-footer-profile"
        className="fixed inset-y-4 left-4 z-40 hidden w-[18rem] lg:block"
      >
        {sidebarContent("desktop")}
      </aside>

      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-[#07111f]/38 duration-500 lg:hidden ${open ? "opacity-100 backdrop-blur-[7px]" : "pointer-events-none opacity-0 backdrop-blur-0"}`}
      />

      <aside
        id="doutorelo-product-navigation-mobile"
        aria-label="Navegação principal esquerda do DOUTORELO"
        className={`fixed inset-y-3 left-3 z-50 w-[min(88vw,21rem)] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${open ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-[110%] opacity-0"}`}
      >
        {sidebarContent("mobile")}
      </aside>
    </>
  );
}
'''

text = text[:start] + new_block + text[end:]
text = text.replace('className="relative isolate flex min-h-[100svh] flex-col bg-[linear-gradient(180deg,#ffffff_0%,#fbfffd_54%,#f7fffc_100%)]"', 'className="relative isolate flex min-h-[100svh] flex-col bg-[linear-gradient(180deg,#ffffff_0%,#fbfffd_54%,#f7fffc_100%)] lg:pl-[20rem]"')
home_path.write_text(text)

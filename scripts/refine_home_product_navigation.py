from pathlib import Path

home_path = Path('/home/ubuntu/saude-integrativa-ia-dev/client/src/pages/Home.tsx')
text = home_path.read_text()

start = text.index('type DemoFeatureItem = {')
end = text.index('function BrandLogo')
new_block = r'''type ProductNavItem = {
  label: string;
  href: string;
  description: string;
};

type ProductNavSection = {
  title: string;
  summary: string;
  items: ProductNavItem[];
};

const DOUTORELO_PRODUCT_NAV_SECTIONS: ProductNavSection[] = [
  {
    title: "Seu cuidado",
    summary: "Comece, acompanhe e organize sua jornada de saúde.",
    items: [
      { label: "Conversa com DOUTORELO", href: "/", description: "Inicie pelo que sente, pelo que precisa entender ou pelo próximo passo." },
      { label: "Visão do cuidado", href: "/app", description: "Acompanhe prioridades, sinais recentes e orientações em uma leitura simples." },
      { label: "Preparar consulta", href: "/preparar-consulta", description: "Organize sintomas, dúvidas e objetivos antes de falar com um profissional." },
      { label: "Memória de saúde", href: "/memoria", description: "Mantenha fatos importantes do cuidado reunidos em uma linha viva." },
    ],
  },
  {
    title: "Rede integrada",
    summary: "Profissionais, consultas e conexões em um só percurso.",
    items: [
      { label: "Profissionais", href: "/profissionais", description: "Encontre especialistas vinculados à curadoria Dayan e à rede de cuidado." },
      { label: "Consultas", href: "/consultas", description: "Veja solicitações, histórico e próximos movimentos do acompanhamento." },
      { label: "Conexões", href: "/conexoes", description: "Entenda os encaminhamentos e pontes entre paciente, rede e suporte." },
    ],
  },
  {
    title: "Soluções integrativas",
    summary: "Produtos, recomendações e gestão da experiência de compra.",
    items: [
      { label: "Marketplace", href: "/marketplace", description: "Acesse produtos e recomendações alinhados ao cuidado integrativo." },
      { label: "Curadoria da loja", href: "/admin/marketplace", description: "Gerencie catálogo, disponibilidade, pedidos e publicações." },
    ],
  },
  {
    title: "Conta e gestão",
    summary: "Acesso, administração e biblioteca visual do produto.",
    items: [
      { label: "Administração", href: "/admin", description: "Organize rotinas operacionais, agenda e visão de gestão do sistema." },
      { label: "Acesso seguro", href: "/login", description: "Entre na conta e mantenha sua experiência protegida." },
      { label: "Biblioteca visual", href: "/componentes", description: "Consulte padrões de interface e componentes reutilizáveis." },
    ],
  },
];

function ProductNavigationDrawer({ open, onToggle, onClose }: { open: boolean; onToggle: () => void; onClose: () => void }) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="doutorelo-product-navigation"
        aria-label={open ? "Fechar navegação principal" : "Abrir navegação principal"}
        data-home-product-nav-trigger="premium-floating-control"
        className="group fixed right-4 top-4 z-50 inline-flex min-h-12 items-center gap-2 rounded-full border border-white/70 bg-white/72 px-3.5 text-[#123f3a] shadow-[0_18px_55px_rgba(18,63,58,0.12)] backdrop-blur-2xl transition duration-500 hover:-translate-y-0.5 hover:bg-white/92 hover:shadow-[0_24px_70px_rgba(18,63,58,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28d7a3] focus-visible:ring-offset-2 sm:right-6 sm:top-6"
      >
        <span className="relative flex size-7 items-center justify-center rounded-full bg-[#f2fffb] shadow-inner shadow-white/80">
          <span className={`absolute h-0.5 w-4 rounded-full bg-current transition duration-300 ${open ? "rotate-45" : "-translate-y-1.5"}`} />
          <span className={`absolute h-0.5 w-4 rounded-full bg-current transition duration-300 ${open ? "opacity-0" : "opacity-100"}`} />
          <span className={`absolute h-0.5 w-4 rounded-full bg-current transition duration-300 ${open ? "-rotate-45" : "translate-y-1.5"}`} />
        </span>
        <span className="hidden text-[0.72rem] font-bold uppercase tracking-[0.22em] sm:inline">Menu</span>
      </button>

      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-[#061f1c]/18 backdrop-blur-[7px] transition duration-500 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <aside
        id="doutorelo-product-navigation"
        aria-label="Navegação principal do DOUTORELO"
        data-home-product-navigation="premium-minimal-sidebar"
        data-home-product-navigation-effect="glass-depth-and-soft-motion"
        className={`fixed inset-y-0 right-0 z-50 flex w-[min(94vw,25rem)] flex-col overflow-hidden rounded-l-[2rem] border-l border-white/70 bg-white/78 text-[#123f3a] shadow-[0_34px_110px_rgba(6,31,28,0.22)] backdrop-blur-3xl transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${open ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-[calc(100%+1rem)] opacity-0"}`}
      >
        <div className="pointer-events-none absolute -left-20 top-0 size-72 rounded-full bg-[#d9fff1]/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 size-72 rounded-full bg-[#28d7a3]/18 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#28d7a3]/70 to-transparent" />

        <div className="relative px-6 pb-5 pt-6">
          <div className="flex items-start justify-between gap-5">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="size-2.5 rounded-full bg-[#28d7a3] shadow-[0_0_26px_rgba(40,215,163,0.9)]" />
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-[#16846f]">Navegação</p>
              </div>
              <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.045em] text-[#0b302c]">Cuidado integrativo, sem atrito.</h2>
              <p className="mt-2 max-w-[19rem] text-sm font-medium leading-6 text-[#5b6a66]">
                Acesse cada área do DOUTORELO com clareza, fluidez e poucos toques.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar navegação"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-[#e4f4ef] bg-white/82 text-[#123f3a] shadow-[0_12px_30px_rgba(18,63,58,0.08)] transition duration-300 hover:rotate-90 hover:bg-[#f2fffb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28d7a3]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
                <path d="m7 7 10 10" />
                <path d="M17 7 7 17" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="relative flex-1 overflow-y-auto px-3 pb-4" aria-label="Áreas do produto">
          {DOUTORELO_PRODUCT_NAV_SECTIONS.map((section, sectionIndex) => (
            <details
              key={section.title}
              open={sectionIndex === 0}
              className="group border-t border-[#e4f4ef]/90 first:border-t-0"
            >
              <summary className="flex min-h-[4.75rem] cursor-pointer list-none items-center justify-between gap-4 rounded-[1.3rem] px-3 text-left transition duration-300 hover:bg-white/66 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28d7a3] [&::-webkit-details-marker]:hidden">
                <span className="min-w-0">
                  <span className="block text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#16846f]">0{sectionIndex + 1}</span>
                  <span className="mt-1 block text-base font-semibold tracking-[-0.025em] text-[#0b302c]">{section.title}</span>
                  <span className="mt-0.5 block text-xs font-medium leading-5 text-[#6d827c]">{section.summary}</span>
                </span>
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#f2fffb] text-[#16846f] shadow-inner shadow-white transition duration-300 group-open:rotate-180 group-hover:bg-[#d9fff1]">
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </summary>

              <div className="grid gap-1.5 px-2 pb-3">
                {section.items.map((item, itemIndex) => (
                  <a
                    key={`${section.title}-${item.href}`}
                    href={item.href}
                    onClick={onClose}
                    className="group/item relative flex items-center gap-3 overflow-hidden rounded-[1.15rem] px-3 py-3 text-[#123f3a] transition duration-300 hover:-translate-y-0.5 hover:bg-white/84 hover:shadow-[0_18px_45px_rgba(18,63,58,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28d7a3]"
                  >
                    <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[#28d7a3] opacity-0 transition duration-300 group-hover/item:opacity-100" />
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/70 text-[0.68rem] font-bold text-[#16846f] shadow-inner shadow-white transition duration-300 group-hover/item:bg-[#d9fff1] group-hover/item:text-[#0b302c]">
                      {itemIndex + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold tracking-[-0.018em] text-[#0b302c]">{item.label}</span>
                      <span className="mt-0.5 block text-xs font-medium leading-5 text-[#6d827c]">{item.description}</span>
                    </span>
                    <span className="grid size-8 shrink-0 place-items-center rounded-full text-[#9fb3ad] transition duration-300 group-hover/item:translate-x-0.5 group-hover/item:bg-[#f2fffb] group-hover/item:text-[#16846f]">
                      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" />
                        <path d="m13 6 6 6-6 6" />
                      </svg>
                    </span>
                  </a>
                ))}
              </div>
            </details>
          ))}
        </nav>

        <div className="relative px-6 pb-6 pt-2">
          <div className="rounded-[1.25rem] border border-[#e4f4ef] bg-white/68 px-4 py-3 shadow-[0_12px_36px_rgba(18,63,58,0.06)]">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#16846f]">DOUTORELO</p>
            <p className="mt-1 text-xs font-medium leading-5 text-[#6d827c]">IA de saúde integrativa para orientar, conectar e simplificar o cuidado.</p>
          </div>
        </div>
      </aside>
    </>
  );
}

'''
text = text[:start] + new_block + text[end:]
text = text.replace('const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);', 'const [isProductNavOpen, setIsProductNavOpen] = useState(false);')
text = text.replace('<DemoFeatureMenu open={isDemoMenuOpen} onToggle={() => setIsDemoMenuOpen((current) => !current)} onClose={() => setIsDemoMenuOpen(false)} />', '<ProductNavigationDrawer open={isProductNavOpen} onToggle={() => setIsProductNavOpen((current) => !current)} onClose={() => setIsProductNavOpen(false)} />')
home_path.write_text(text)

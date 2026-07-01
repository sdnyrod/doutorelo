import { trpc } from "@/lib/trpc";
import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, KeyboardEvent, ReactNode } from "react";

const HOME_LOGO_STORAGE_ROOT = "";
const OFFICIAL_DOUTORELO_LOGO_URL = `${HOME_LOGO_STORAGE_ROOT}/doutorelo-logo.png`;
const INITIAL_CHAT_PLACEHOLDER = "Digite sua mensagem.";
const MAX_DRAFT_LENGTH = 1200;

const HESITATION_GUIDE_BUBBLES = [
  {
    id: "pergunta-livre",
    delayMs: 3200,
    durationMs: 13000,
    tone: "ciano",
    orbitClassName: "alien-intent-fragment--subtle-left",
    text: "Pode me perguntar o que quiser em relação à saúde e bem estar, vou procurar te ajudar",
  },
  {
    id: "dieta-nutricao",
    delayMs: 16800,
    durationMs: 13000,
    tone: "coral",
    orbitClassName: "alien-intent-fragment--subtle-center-high",
    text: "Você pode me pedir dicas de dieta, informações sobre nutrição",
  },
  {
    id: "rede-profissional",
    delayMs: 30400,
    durationMs: 13000,
    tone: "verde",
    orbitClassName: "alien-intent-fragment--subtle-right",
    text: "Se quiser indicação de algum profissional de saúde, bem estar, clínica, fique à vontade!",
  },
  {
    id: "produto-suplemento",
    delayMs: 44000,
    durationMs: 13000,
    tone: "coral",
    orbitClassName: "alien-intent-fragment--subtle-center-low",
    text: "Está procurando algum nutracêutico, ou algum suplemento? Digite o nome que eu tento achar pra você",
  },
] as const;

type LocationPermissionStatus = "granted" | "denied" | "unavailable" | "prompt" | "not_requested";
type GeolocationUiStatus = "idle" | "requesting" | "granted" | "denied" | "unavailable";

const PROXIMITY_INTENT_PATTERN = /\b(perto de mim|na minha cidade|aqui perto|pr[oó]ximo de mim|pr[oó]xima de mim|perto daqui|perto da minha casa|na minha regi[aã]o|aqui na regi[aã]o)\b/i;
const EXPLICIT_CITY_STATE_PATTERN = /\b[A-Za-zÀ-ÿ]{3,}(?:\s+[A-Za-zÀ-ÿ]{2,})*\s*[-,/]\s*[A-Za-z]{2}\b/i;

function shouldRequestBrowserGeolocation(message: string) {
  return PROXIMITY_INTENT_PATTERN.test(message) && !EXPLICIT_CITY_STATE_PATTERN.test(message);
}

function getBrowserLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("geolocation_unavailable"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 5 * 60 * 1000 },
    );
  });
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type MasterCandidate = {
  name: string;
  specialty?: string;
  city?: string;
  state?: string;
  modality?: string;
  distanceKm?: number | null;
};

type MasterProductCandidate = {
  id: string | number;
  name: string;
  category?: string | null;
};

type MasterSuggestion = {
  action: string;
  confidence: "low" | "medium" | "high";
  card: {
    title: string;
    description: string;
    ctaLabel: string;
    href?: string;
    priority: "low" | "medium" | "high";
  } | null;
  professionalCandidates: MasterCandidate[];
  productCandidates: MasterProductCandidate[];
  animation: {
    preset: "graceful_suggestion";
  };
};

type ProductNavItem = {
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
    title: "Começar",
    eyebrow: "No seu ritmo",
    items: [
      { label: "Início", href: "/", icon: "grid", badge: "agora", description: "Retome a conversa inicial com tranquilidade." },
      { label: "Meu espaço", href: "/app", icon: "layers", description: "Acesse seu ambiente protegido." },
      { label: "Preparar", href: "/preparar-consulta", icon: "calendar", description: "Organize pontos importantes antes do atendimento." },
      { label: "Memória", href: "/memoria", icon: "memory", description: "Guarde informações que ajudam no acompanhamento." },
    ],
  },
  {
    title: "Apoio",
    eyebrow: "Quando precisar",
    items: [
      { label: "Profissionais", href: "/profissionais", icon: "users", description: "Veja opções de apoio disponíveis." },
      { label: "Consultas", href: "/consultas", icon: "calendar", description: "Acompanhe seus próximos passos." },
      { label: "Conexões", href: "/conexoes", icon: "network", description: "Consulte vínculos e encaminhamentos." },
    ],
  },
  {
    title: "Explorar",
    eyebrow: "Opções disponíveis",
    items: [
      { label: "Loja", href: "/marketplace", icon: "shop", description: "Explore itens disponíveis." },
      { label: "Curadoria", href: "/admin/marketplace", icon: "admin", description: "Organize informações da vitrine." },
    ],
  },
  {
    title: "Conta",
    eyebrow: "Acesso e ajustes",
    items: [
      { label: "Painel", href: "/admin", icon: "layers", description: "Acesse rotinas protegidas." },
      { label: "Entrar", href: "/login", icon: "lock", description: "Entre com segurança." },
    ],
  },
];

const NAV_ICON_PATHS: Record<ProductNavItem["icon"], ReactNode> = {
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
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round">
      {NAV_ICON_PATHS[icon]}
    </svg>
  );
}

function ProductNavigationDrawer({ open, onToggle, onClose }: { open: boolean; onToggle: () => void; onClose: () => void }) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Começar: true,
    Apoio: true,
  });
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
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
        data-home-product-nav-trigger="alien-constellation-left-trigger"
        className={`fixed left-3 top-3 z-[60] grid size-12 touch-manipulation place-items-center rounded-full border bg-white text-[#0F1B33] transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1B33] focus-visible:ring-offset-2 sm:left-5 sm:top-5 ${open ? "border-[#0F1B33]/45 shadow-[0_8px_22px_rgba(13,27,45,0.10)]" : "border-[#E7ECF2] shadow-[0_8px_22px_rgba(13,27,45,0.08)] hover:-translate-y-0.5 hover:border-[#0F1B33]/38 hover:bg-white"}`}
      >
        <span className="sr-only">{open ? "Fechar menu" : "Abrir menu"}</span>
        <span className="alien-menu-trigger-core" aria-hidden="true">
          <span className={`alien-menu-trigger-line ${open ? "rotate-45" : "-translate-y-1.5"}`} />
          <span className={`alien-menu-trigger-line w-3.5 ${open ? "opacity-0" : "translate-x-0.5 opacity-100"}`} />
          <span className={`alien-menu-trigger-line ${open ? "-rotate-45" : "translate-y-1.5"}`} />
        </span>
      </button>

      <div
        aria-hidden="true"
        onClick={onClose}
        data-home-product-nav-backdrop="alien-constellation-overlay"
        className={`fixed inset-0 z-40 bg-[#0F1B33]/12 transition duration-700 ${open ? "opacity-100 backdrop-blur-[8px]" : "pointer-events-none opacity-0 backdrop-blur-0"}`}
      />

      <aside
        id="doutorelo-product-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Menu DOUTORELO"
        data-home-product-navigation="alien-left-constellation-drawer"
        data-home-product-navigation-state="closed-by-default"
        data-home-product-navigation-position="left-hidden-prismatic-overlay"
        data-home-product-navigation-surface="doutorelo-bioluminescent-prism-panel"
        data-home-product-navigation-interaction="discreet-trigger-orbital-accordion"
        className={`alien-nav-drawer fixed inset-y-3 left-3 z-50 w-[min(91vw,23.5rem)] transition duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:inset-y-5 sm:left-5 sm:w-[23.5rem] ${open ? "translate-x-0 opacity-100" : "pointer-events-none -translate-x-[calc(100%+1.75rem)] opacity-0"}`}
      >
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[2rem] border border-[#E7ECF2] bg-white text-[#0F1B33] shadow-[0_18px_56px_rgba(13,27,45,0.10)]">
          <div className="pointer-events-none absolute inset-0 bg-white" />

          <div className="relative flex items-start gap-3 px-6 pb-4 pt-7">
            <div className="grid size-10 shrink-0 place-items-center rounded-full border border-[#E7ECF2] bg-[#F8FAFC] text-[#64748B] shadow-none">
              <ProductNavIcon icon="spark" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[#64748B]">DOUTORELO</p>
              <p className="mt-1 text-base font-medium leading-snug tracking-[-0.01em] text-[#0F1B33] font-display">Continue no seu ritmo</p>
            </div>
          </div>

          <nav className="relative min-h-0 flex-1 overflow-y-auto px-4 pb-6" aria-label="Navegação principal do DOUTORELO">
            <div className="space-y-2">
              {DOUTORELO_PRODUCT_NAV_SECTIONS.map((section) => {
                const expanded = expandedSections[section.title] ?? false;
                const sectionIsActive = section.items.some((item) => currentPath === item.href || (item.href !== "/" && currentPath.startsWith(item.href)));
                return (
                  <section key={section.title} className="rounded-[1.35rem]" data-home-product-nav-group="doutorelo-orbital-accordion">
                    <button
                      type="button"
                      onClick={() => toggleSection(section.title)}
                      aria-expanded={expanded}
                      className={`group flex min-h-12 w-full items-center gap-3 rounded-[1.15rem] px-3.5 py-2.5 text-left transition duration-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1B33]/70 ${sectionIsActive ? "bg-[#F8FAFC] text-[#0F1B33] shadow-[0_8px_22px_rgba(13,27,45,0.06)]" : "text-[#64748B] hover:-translate-y-0.5 hover:bg-[#FAFBFC] hover:text-[#0F1B33]"}`}
                    >
                      <span className={`grid size-9 shrink-0 place-items-center rounded-full border transition duration-300 ${sectionIsActive ? "border-[#E7ECF2] bg-white text-[#0F1B33]" : "border-[#E7ECF2] bg-white text-[#64748B] group-hover:border-[#E7ECF2] group-hover:text-[#0F1B33]"}`}>
                        <ProductNavIcon icon={section.items[0]?.icon ?? "layers"} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold tracking-[-0.015em]">{section.title}</span>
                        <span className="mt-0.5 block truncate text-[0.72rem] font-normal normal-case tracking-[-0.01em] text-[#64748B]">{section.eyebrow}</span>
                      </span>
                      <svg aria-hidden="true" viewBox="0 0 24 24" className={`size-4 shrink-0 transition duration-300 ${expanded ? "rotate-90 text-[#0F1B33]" : "text-[#64748B] group-hover:translate-x-0.5 group-hover:text-[#64748B]"}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 6 6 6-6 6" />
                      </svg>
                    </button>

                    <div className={`grid transition-all duration-300 ease-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                      <div className="min-h-0 overflow-hidden">
                        <div className="ml-[2.05rem] mt-1 space-y-1 border-l border-[#E7ECF2] pl-3">
                          {section.items.map((item) => {
                            const isActive = currentPath === item.href || (item.href !== "/" && currentPath.startsWith(item.href));
                            return (
                              <a
                                key={`${section.title}-${item.href}`}
                                href={item.href}
                                onClick={handleNavigationClick}
                                aria-current={isActive ? "page" : undefined}
                                data-home-product-nav-active={isActive ? "doutorelo-orbital-active-item" : undefined}
                                className={`group/item flex min-h-11 items-center gap-2 rounded-[1rem] px-2.5 py-2 text-sm font-medium transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1B33]/70 ${isActive ? "bg-[#F8FAFC] text-[#0F1B33] shadow-[0_6px_18px_rgba(13,27,45,0.06)]" : "text-[#64748B] hover:translate-x-0.5 hover:bg-[#FAFBFC] hover:text-[#0F1B33]"}`}
                              >
                                <span className={`grid size-7 shrink-0 place-items-center rounded-full transition duration-300 ${isActive ? "bg-white text-[#0F1B33]" : "bg-white text-[#64748B] group-hover/item:bg-white group-hover/item:text-[#0F1B33]"}`}>
                                  <ProductNavIcon icon={item.icon} />
                                </span>
                                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                                {item.badge ? <span className="rounded-full border border-[#E7ECF2] bg-white px-1.5 py-0.5 text-[0.56rem] font-semibold lowercase tracking-[0.03em] text-[#64748B]">{item.badge}</span> : null}
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
        </div>
      </aside>
    </>
  );
}

function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <img
      src={OFFICIAL_DOUTORELO_LOGO_URL}
      alt="DOUTORELO · IA de saúde funcional"
      data-official-doutorelo-logo="true"
      className={`${compact ? "h-[2.8rem] sm:h-[3.6rem]" : "h-16 sm:h-20"} w-auto max-w-[280px] sm:max-w-[360px] object-contain`}
    />
  );
}

function AmbientSignalField() {
  return <div className="pointer-events-none absolute inset-0 bg-white" aria-hidden="true" data-home-background="plain-white-field-no-red-stains" />;
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={
          isUser
            ? "max-w-[86%] whitespace-pre-wrap break-words rounded-[1.7rem] rounded-tr-[0.55rem] border border-[#0F1B33]/10 bg-[#0F1B33] px-5 py-4 text-left text-sm leading-6 text-white shadow-[0_18px_54px_rgba(13,27,45,0.18)] sm:text-base"
            : "w-full max-w-[92%] whitespace-pre-wrap break-words rounded-[1.7rem] rounded-tl-[0.55rem] border border-[#E7ECF2] bg-white px-5 py-4 text-left text-sm leading-6 text-[#0F1B33] shadow-[0_14px_42px_rgba(13,27,45,0.08)] sm:text-base"
        }
        data-chat-rendering={isUser ? "user-raw-text" : "assistant-doutorelo-polished-text"}
      >
        {message.content}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex justify-start" aria-label="DOUTORELO está digitando" aria-live="polite" aria-atomic="true">
      <div className="inline-flex min-h-11 items-center gap-1 rounded-[1.7rem] rounded-tl-[0.55rem] border border-[#E7ECF2] bg-white px-5 py-4 shadow-[0_14px_42px_rgba(13,27,45,0.08)]">
        <span className="size-2 animate-bounce rounded-full bg-[#0F1B33] [animation-delay:-0.24s]" />
        <span className="size-2 animate-bounce rounded-full border border-[#0F1B33] bg-white [animation-delay:-0.12s]" />
        <span className="size-2 animate-bounce rounded-full bg-[#0F1B33]" />
        <span className="sr-only">...</span>
      </div>
    </div>
  );
}

function confidenceLabel(confidence: MasterSuggestion["confidence"]) {
  if (confidence === "high") return "Alta precisão";
  if (confidence === "medium") return "Boa leitura";
  return "Sinal inicial";
}

function MasterSuggestionPanel({ suggestion }: { suggestion: MasterSuggestion }) {
  if (!suggestion.card || suggestion.action === "none") return null;
  const primaryProfessional = suggestion.professionalCandidates[0];
  const primaryProduct = suggestion.productCandidates[0];

  return (
    <aside
      className="master-suggestion-enter master-suggestion-side alien-master-capsule relative overflow-hidden rounded-[2.25rem] border border-[#E7ECF2] bg-white p-5 text-[#0F1B33] shadow-[0_22px_70px_rgba(13,27,45,0.12)]"
      aria-label="Sugestão contextual da IA Master"
      aria-live="polite"
      data-master-suggestion="alien-next-step-capsule"
      data-master-surface="desktop-orbital-side-capsule-mobile-inline"
      data-attention-choreography="bioluminescent-capsule-reveal-after-answer"
      data-master-action={suggestion.action}
    >
      <div className="relative">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#0F1B33] font-display">Próximo passo</p>
          <span className="rounded-full border border-[#0F1B33]/45 bg-white px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.1em] text-[#64748B] shadow-none">
            {confidenceLabel(suggestion.confidence)}
          </span>
        </div>

        <h2 className="text-[1.35rem] font-semibold leading-[1.1] tracking-[-0.03em] text-[#0F1B33] font-display sm:text-[1.5rem]">{suggestion.card.title}</h2>
        <p className="mt-3 text-sm font-medium leading-6 text-[#0F1B33]">{suggestion.card.description}</p>

        {suggestion.card.href ? (
          <a
            href={suggestion.card.href}
            className="alien-primary-cta mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#0F1B33] px-5 py-2 text-sm font-semibold text-white shadow-[0_16px_44px_rgba(13,27,45,0.18)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_58px_rgba(13,27,45,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1B33] focus-visible:ring-offset-2"
          >
            {suggestion.card.ctaLabel}
          </a>
        ) : null}
      </div>

      {primaryProfessional || primaryProduct ? (
        <div className="relative mt-5 grid gap-3">
          {primaryProfessional ? (
            <div className="alien-mini-module rounded-[1.45rem] border border-[#E7ECF2] bg-white px-4 py-3 shadow-[0_12px_32px_rgba(13,27,45,0.08)]">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[#0F1B33]">Rede Dayan</p>
              <p className="mt-1 font-semibold leading-snug text-[#0F1B33]">{primaryProfessional.name}</p>
              <p className="mt-1 text-sm leading-5 text-[#64748B]">{primaryProfessional.specialty} · {primaryProfessional.city}-{primaryProfessional.state}</p>
            </div>
          ) : null}
          {primaryProduct ? (
            <div className="alien-mini-module rounded-[1.45rem] border border-[#E7ECF2] bg-white px-4 py-3 shadow-[0_12px_32px_rgba(13,27,45,0.08)]">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[#64748B]">Apoio de rotina</p>
              <p className="mt-1 font-semibold leading-snug text-[#0F1B33]">{primaryProduct.name}</p>
              <p className="mt-1 text-sm leading-5 text-[#64748B]">{primaryProduct.category ?? "Sugestão comercial educativa"}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </aside>
  );
}

function Home() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [liveAnnouncement, setLiveAnnouncement] = useState("");
  const [masterSuggestion, setMasterSuggestion] = useState<MasterSuggestion | null>(null);
  const [geolocationStatus, setGeolocationStatus] = useState<GeolocationUiStatus>("idle");
  const [geolocationNotice, setGeolocationNotice] = useState<string | null>(null);
  const [productNavigationOpen, setProductNavigationOpen] = useState(false);
  const [activeHesitationGuideIndex, setActiveHesitationGuideIndex] = useState<number | null>(null);
  const [hesitationGuidesDismissed, setHesitationGuidesDismissed] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const suggestionRevealTimerRef = useRef<number | null>(null);
  const hesitationGuideTimersRef = useRef<number[]>([]);
  const trimmedDraft = draft.trim();
  const hasConversation = messages.length > 0;
  const visibleHesitationGuide = activeHesitationGuideIndex === null ? null : HESITATION_GUIDE_BUBBLES[activeHesitationGuideIndex];
  const composerMode = geolocationStatus === "requesting" ? "localizando" : hasConversation ? "continuidade" : "primeiro-contato";

  const homeChat = trpc.homeChat.send.useMutation({
    onSuccess: (data) => {
      setMessages((current) => [...current, { role: "assistant", content: data.assistantMessage }]);
      setLiveAnnouncement(`Nova resposta do DOUTORELO: ${data.assistantMessage.slice(0, 180)}`);
      if (suggestionRevealTimerRef.current) {
        window.clearTimeout(suggestionRevealTimerRef.current);
      }
      if (data.masterDecision?.card && data.masterDecision.action !== "none") {
        const nextSuggestion = data.masterDecision as MasterSuggestion;
        suggestionRevealTimerRef.current = window.setTimeout(() => {
          setMasterSuggestion(nextSuggestion);
          setLiveAnnouncement(`Sugestão contextual apareceu ao lado: ${nextSuggestion.card?.title ?? "próximo passo"}`);
          suggestionRevealTimerRef.current = null;
        }, 1650);
      } else {
        setMasterSuggestion(null);
      }
      setErrorMessage(null);
    },
    onError: (error) => {
      setErrorMessage(error.message);
      setLiveAnnouncement(error.message);
    },
  });

  const shouldRunHesitationGuides = !hasConversation && !homeChat.isPending && !productNavigationOpen && !hesitationGuidesDismissed && trimmedDraft.length === 0 && geolocationStatus !== "requesting";
  const sendButtonDisabled = trimmedDraft.length === 0 || homeChat.isPending || geolocationStatus === "requesting";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, homeChat.isPending]);

  useEffect(() => {
    const focusFrame = window.requestAnimationFrame(() => {
      textareaRef.current?.focus({ preventScroll: true });
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, []);

  useEffect(() => {
    hesitationGuideTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    hesitationGuideTimersRef.current = [];

    if (!shouldRunHesitationGuides) {
      setActiveHesitationGuideIndex(null);
      return undefined;
    }

    HESITATION_GUIDE_BUBBLES.forEach((guide, index) => {
      const showTimer = window.setTimeout(() => {
        setActiveHesitationGuideIndex(index);
        setLiveAnnouncement(`Sugestão breve para começar: ${guide.text}`);
      }, guide.delayMs);

      const hideTimer = window.setTimeout(() => {
        setActiveHesitationGuideIndex((current) => (current === index ? null : current));
      }, guide.delayMs + guide.durationMs);

      hesitationGuideTimersRef.current.push(showTimer, hideTimer);
    });

    return () => {
      hesitationGuideTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      hesitationGuideTimersRef.current = [];
    };
  }, [shouldRunHesitationGuides]);

  useEffect(() => {
    return () => {
      if (suggestionRevealTimerRef.current) {
        window.clearTimeout(suggestionRevealTimerRef.current);
      }
      hesitationGuideTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, []);

  const sendMessage = async (content: string) => {
    const nextMessage = content.trim();
    if (nextMessage.length === 0 || homeChat.isPending || geolocationStatus === "requesting") return;

    const requiresBrowserLocation = shouldRequestBrowserGeolocation(nextMessage);
    setMessages((current) => [...current, { role: "user", content: nextMessage }]);
    setDraft("");
    setHesitationGuidesDismissed(true);
    setActiveHesitationGuideIndex(null);
    hesitationGuideTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    hesitationGuideTimersRef.current = [];
    window.requestAnimationFrame(() => textareaRef.current?.focus({ preventScroll: true }));
    setErrorMessage(null);
    setMasterSuggestion(null);
    setGeolocationNotice(null);
    if (suggestionRevealTimerRef.current) {
      window.clearTimeout(suggestionRevealTimerRef.current);
      suggestionRevealTimerRef.current = null;
    }

    if (!requiresBrowserLocation) {
      setGeolocationStatus("idle");
      setLiveAnnouncement("Mensagem enviada ao DOUTORELO.");
      homeChat.mutate({
        message: nextMessage,
        conversationHistory: messages,
        route: window.location.pathname,
        locationPermissionStatus: "not_requested" satisfies LocationPermissionStatus,
      });
      return;
    }

    setGeolocationStatus("requesting");
    setGeolocationNotice("Para indicar alguém perto de você, o DOUTORELO vai tentar usar sua localização aproximada. Você também pode negar e informar cidade/UF manualmente.");
    setLiveAnnouncement("Solicitando permissão de localização para buscar profissionais próximos.");

    try {
      const position = await getBrowserLocation();
      setGeolocationStatus("granted");
      setGeolocationNotice("Localização recebida. Vou priorizar profissionais próximos da sua região.");
      setLiveAnnouncement("Localização recebida. Mensagem enviada ao DOUTORELO.");
      homeChat.mutate({
        message: nextMessage,
        conversationHistory: messages,
        route: window.location.pathname,
        lat: position.lat,
        lng: position.lng,
        proximityIntentWithoutExplicitCity: true,
        locationPermissionStatus: "granted" satisfies LocationPermissionStatus,
      });
    } catch (error) {
      const unavailable = error instanceof Error && error.message === "geolocation_unavailable";
      const nextStatus: GeolocationUiStatus = unavailable ? "unavailable" : "denied";
      setGeolocationStatus(nextStatus);
      setGeolocationNotice("Não consegui acessar sua localização. Informe a cidade e o estado no formato Cidade-UF para eu consultar a base de profissionais sem sugerir outra praça por engano.");
      setLiveAnnouncement("Localização não autorizada ou indisponível. Pedirei cidade e estado para indicar profissionais.");
      homeChat.mutate({
        message: nextMessage,
        conversationHistory: messages,
        route: window.location.pathname,
        proximityIntentWithoutExplicitCity: true,
        locationPermissionStatus: (unavailable ? "unavailable" : "denied") satisfies LocationPermissionStatus,
      });
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(trimmedDraft);
  };

  const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(event.target.value);
    if (event.target.value.length > 0) {
      setHesitationGuidesDismissed(true);
      setActiveHesitationGuideIndex(null);
      hesitationGuideTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      hesitationGuideTimersRef.current = [];
    }
  };

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    sendMessage(trimmedDraft);
  };

  return (
    <main
      data-doutorelo-home-signature="elos-premium"
      data-chat-first-home="doutorelo-conversa-primeiro"
      data-clean-first-fold="only-field-instruction"
      data-seamless-home-background="approved-white-offcanvas-field"
      className="min-h-dvh overflow-x-clip bg-white text-[#0F1B33] thumb-safe-bottom"
    >
      <section
        id="conversa"
        className="relative isolate flex min-h-[100svh] min-w-0 flex-col bg-white"
      >
        <AmbientSignalField />
        <div className="sr-only" aria-live="assertive" aria-atomic="true">{liveAnnouncement}</div>

        <ProductNavigationDrawer open={productNavigationOpen} onToggle={() => { setHesitationGuidesDismissed(true); setActiveHesitationGuideIndex(null); setProductNavigationOpen((current) => !current); }} onClose={() => setProductNavigationOpen(false)} />

          <header className="container relative z-10 flex items-center justify-between gap-4 py-6 sm:py-8" data-mobile-logo-clearance="product-menu-safe-spacing">
          <a href="#conversa" className="ml-[4.75rem] inline-flex min-h-11 min-w-11 items-center rounded-[1.65rem] opacity-95 transition hover:-translate-y-0.5 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1B33]" aria-label="Voltar ao início DOUTORELO">
            <BrandLogo compact />
          </a>
        </header>

        <div className="container relative z-10 flex flex-1 items-center justify-center pb-10 pt-1 sm:pb-16">
          <div
            className={`mx-auto w-full min-w-0 transition-[max-width,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${productNavigationOpen ? "lg:max-w-[calc(100vw-32rem)] lg:translate-x-[10rem] xl:translate-x-[11rem]" : "max-w-[94rem] translate-x-0"}`}
            data-chat-layout="alien-command-composer-responsive-drawer"
            data-chat-realtime-position={productNavigationOpen ? "shifted-right-for-open-constellation" : "centered-orbital-command"}
            data-chat-context-card-state={masterSuggestion ? "resized-with-next-step-capsule" : "wide-centered-intent-field"}
          >
            <div className={`grid w-full min-w-0 items-start gap-4 transition-all duration-700 sm:gap-6 ${masterSuggestion ? "lg:grid-cols-[minmax(0,1fr)_24rem] xl:grid-cols-[minmax(0,1fr)_26rem]" : "grid-cols-1"}`}>
              <div className={`mx-auto w-full min-w-0 transition-[max-width,transform] duration-700 ${masterSuggestion ? "max-w-[68rem]" : "max-w-[82rem]"} ${productNavigationOpen ? "lg:max-w-[62rem]" : ""}`} data-chat-width="orbital-command-center">
                <div className="relative" data-chat-portal="future-commerce-4-intent-core">
                  <div className={`alien-command-shell min-w-0 rounded-[1.65rem] transition-all duration-700 sm:rounded-[2.4rem] ${hasConversation ? "min-h-[28rem] border border-[#E7ECF2] bg-white p-1.5 shadow-[0_24px_72px_rgba(13,27,45,0.10)] sm:min-h-[35rem] sm:p-2" : "bg-transparent p-0 shadow-none"}`} data-chat-surface="bioluminescent-orbital-command-surface">
                    {hasConversation ? (
                      <div className="max-h-[46svh] min-h-56 min-w-0 space-y-3 overflow-y-auto px-2.5 py-3 sm:max-h-[50svh] sm:min-h-64 sm:space-y-4 sm:px-4 sm:py-4" role="log" aria-live="polite" aria-relevant="additions text" aria-label="Histórico da conversa com o DOUTORELO">
                        {messages.map((message, index) => (
                          <MessageBubble key={`${message.role}-${index}-${message.content.slice(0, 12)}`} message={message} />
                        ))}
                        {homeChat.isPending ? <TypingDots /> : null}
                        <div ref={endRef} />
                      </div>
                    ) : null}

                    <div className="relative" data-hesitation-guide-system="distributed-orbital-ai-first-experience">
                      {visibleHesitationGuide ? (
                        <div
                          className={`hesitation-guide-bubble hesitation-guide-bubble--readable pointer-events-none absolute z-20 max-w-[min(92vw,34rem)] rounded-[1.65rem] border border-[#E7ECF2] bg-[#FBFCFC]/95 px-5 py-4 text-left text-base font-normal leading-6 text-[#64748B] shadow-[0_16px_42px_rgba(13,27,45,0.08),0_0_0_1px_rgba(255,255,255,0.9)] sm:px-6 sm:py-5 sm:text-lg sm:leading-7 ${visibleHesitationGuide.orbitClassName}`}
                          role="status"
                          aria-live="polite"
                          data-hesitation-guide="dynamic-readable-stop-on-interaction-suggestion"
                          data-hesitation-guide-tone={visibleHesitationGuide.tone}
                          data-hesitation-guide-id={visibleHesitationGuide.id}
                          data-hesitation-guide-index={activeHesitationGuideIndex}
                        >
                          <span className="hesitation-guide-bubble__spark" aria-hidden="true" />
                          <span className="relative z-10">{visibleHesitationGuide.text}</span>
                        </div>
                      ) : null}

                      <form
                        onSubmit={handleSubmit}
                        aria-label="Começar conversa de saúde no DOUTORELO"
                        className="alien-composer-capsule rounded-[1.55rem] border border-[#E7ECF2] bg-white px-3 py-3 shadow-[0_18px_48px_rgba(13,27,45,0.08)] transition duration-500 focus-within:border-[#0F1B33] focus-within:shadow-[0_20px_56px_rgba(13,27,45,0.10)] sm:rounded-[2.35rem] sm:px-4"
                        data-chat-input-shape="alien-single-line-command-capsule"
                        data-composer-mode={composerMode}
                      >
                        <label htmlFor="health-question" className="sr-only">Mensagem de saúde para o DOUTORELO</label>
                        {geolocationNotice ? (
                          <div
                            className="mb-2 rounded-[1.25rem] border border-[#E7ECF2] bg-white px-4 py-2 text-sm font-bold leading-5 text-[#64748B] shadow-none"
                            role="status"
                            aria-live="polite"
                            data-geolocation-status={geolocationStatus}
                          >
                            {geolocationNotice}
                          </div>
                        ) : null}

                        <div className="flex min-h-[4.25rem] min-w-0 items-end gap-2 sm:gap-3">
                          <textarea
                            ref={textareaRef}
                            id="health-question"
                            value={draft}
                            onChange={handleTextareaChange}
                            onKeyDown={handleTextareaKeyDown}
                            rows={1}
                            maxLength={MAX_DRAFT_LENGTH}
                            aria-keyshortcuts="Enter"
                            autoFocus
                            placeholder={hasConversation ? "" : INITIAL_CHAT_PLACEHOLDER}
                            className="max-h-24 min-h-10 flex-1 resize-none border-0 bg-transparent px-1 py-2 text-left text-base font-normal leading-6 text-[#0F1B33] font-sans outline-none placeholder:text-[#64748B] placeholder:font-normal focus-visible:ring-0 sm:text-lg"
                          />

                          <div className="flex shrink-0 items-center gap-2 pb-1">
                            <button
                              type="submit"
                              aria-label={hasConversation ? "Enviar resposta" : "Começar conversa"}
                              disabled={sendButtonDisabled}
                              className="alien-send-button inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-[#0F1B33] bg-transparent text-[#0F1B33] shadow-none transition duration-300 hover:-translate-y-0.5 hover:border-[#0F1B33] hover:text-[#0F1B33] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1B33] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:translate-y-0 sm:size-10"
                              data-send-button-style="thin-black-circle-arrow-no-background"
                            >
                              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h13" />
                                <path d="m13 6 6 6-6 6" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {geolocationStatus === "requesting" ? (
                          <p className="mt-2 text-xs font-bold leading-5 text-[#64748B]" data-location-helper="near-me-geolocation" role="status">
                            Buscando sua localização aproximada...
                          </p>
                        ) : null}
                      </form>
                    </div>
                  </div>

                  {errorMessage ? (
                    <div className="mt-4 rounded-[1.35rem] border border-[#ffc7bb] bg-[#fff7f5]/90 px-4 py-3 text-sm font-semibold text-[#7d3428] shadow-[0_14px_44px_rgba(125,52,40,0.08)]" role="alert">
                      {errorMessage}
                    </div>
                  ) : null}
                </div>
              </div>

              {masterSuggestion ? (
                <div className="lg:sticky lg:top-8" data-side-rail-visibility="desktop-after-answer-mobile-after-chat" data-master-reveal-sequence="assistant-answer-first-card-after-delay">
                  <MasterSuggestionPanel suggestion={masterSuggestion} />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <footer className="container relative z-10 pb-8" aria-label="Compromissos de cuidado do DOUTORELO">
          <div className="mx-auto flex w-full max-w-[84rem] flex-col gap-3 bg-white px-4 py-4 text-xs font-normal leading-5 text-[#64748B] shadow-none sm:flex-row sm:items-center sm:justify-between supports-[padding:max(0px)]:pb-[max(1rem,env(safe-area-inset-bottom))]">
            <nav className="flex flex-wrap items-center gap-x-7 gap-y-2" aria-label="Links de segurança e transparência">
              <a id="dados-protegidos" href="#dados-protegidos" className="inline-flex min-h-11 items-center whitespace-nowrap font-normal text-[#64748B] underline-offset-4 transition hover:text-[#0F1B33] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0F1B33]">Seus dados protegidos</a>
              <a id="orientacao-segura" href="#orientacao-segura" className="inline-flex min-h-11 items-center whitespace-nowrap font-normal text-[#64748B] underline-offset-4 transition hover:text-[#0F1B33] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0F1B33]">Orientação segura</a>
              <a id="encaminhamento-necessario" href="#encaminhamento-necessario" className="inline-flex min-h-11 items-center whitespace-nowrap font-normal text-[#64748B] underline-offset-4 transition hover:text-[#0F1B33] hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0F1B33]">Encaminhamento quando necessário</a>
            </nav>
          </div>
        </footer>
      </section>
    </main>
  );
}

export default Home;

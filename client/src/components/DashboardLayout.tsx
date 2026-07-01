import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { Brain, CalendarCheck2, Database, HeartPulse, Home, LayoutDashboard, LogOut, PanelLeft, PlugZap, ShieldCheck, ShoppingBag, Stethoscope } from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from './DashboardLayoutSkeleton';
import { Button } from "./ui/button";

const menuItems = [
  { icon: LayoutDashboard, label: "Painel do paciente", path: "/app" },
  { icon: Brain, label: "Jornada IA", path: "/preparar-consulta" },
  { icon: HeartPulse, label: "Memória clínica", path: "/memoria" },
  { icon: CalendarCheck2, label: "Consultas", path: "/consultas" },
  { icon: PlugZap, label: "Conexões", path: "/conexoes" },
  { icon: ShoppingBag, label: "Marketplace", path: "/marketplace" },
  { icon: Stethoscope, label: "Profissionais", path: "/profissionais" },
  { icon: Database, label: "Diretório nacional", path: "/diretorio-nacional" },
  { icon: Home, label: "Página pública", path: "/" },
  { icon: ShoppingBag, label: "Backoffice loja", path: "/admin/marketplace" },
  { icon: ShieldCheck, label: "Admin", path: "/admin" },
];

const OFFICIAL_DOUTORELO_LOGO_URL = "/manus-storage/doutorelo-logo-branca-pulso-vermelho_1fef1ed6.png";
// TODO: Replace logo with MIV-aligned version (navy + pulso verde #6EC1B4)

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh items-center justify-center overflow-x-hidden bg-white p-4 supports-[padding:max(0px)]:pt-[max(1rem,env(safe-area-inset-top))] supports-[padding:max(0px)]:pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="flex w-full max-w-md flex-col items-center gap-6 rounded-[1.5rem] border border-[#E5E7EB] bg-white p-5 shadow-2xl shadow-[0_24px_80px_rgba(13,27,45,0.10)] sm:gap-8 sm:rounded-[2rem] sm:p-8">
          <div className="flex flex-col items-center gap-6">
              <h1 className="text-2xl font-semibold tracking-tight text-center font-display">
              Entre para continuar
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
As áreas do DOUTORELO precisam de entrada protegida para cuidar dos seus dados de saúde. Você poderá entrar com Google, Apple, código por email ou email e senha.
            </p>
          </div>
          <Button
            onClick={() => {
              const returnPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
              window.location.href = getLoginUrl(returnPath === "/" ? undefined : returnPath);
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
Escolher forma de entrada
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = menuItems.find(item => item.path === location || (item.path !== "/" && location.startsWith(item.path)));
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r-0"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-16 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Abrir ou fechar navegação"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex min-w-0 items-center">
                  <img
                    src={OFFICIAL_DOUTORELO_LOGO_URL}
                    alt="DOUTORELO · HUB de saúde inteligente"
                    data-official-doutorelo-logo="authenticated-layout"
                    className="h-9 w-auto max-w-[10.5rem] object-contain"
                  />
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarMenu className="px-2 py-1">
              {menuItems.map(item => {
                const isActive = item.path === location || (item.path !== "/" && location.startsWith(item.path));
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className={`h-10 transition-all font-normal`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 rounded-lg px-1 py-1 hover:bg-accent/50 transition-colors w-full text-left group-data-[collapsible=icon]:justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-medium truncate leading-none">
                      {user?.name || "-"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-1.5">
                      {user?.email || "-"}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="min-w-0 overflow-x-hidden bg-white">
        {isMobile && (
          <div className="sticky top-0 z-40 flex min-h-14 items-center justify-between border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:backdrop-blur supports-[padding:max(0px)]:pt-[env(safe-area-inset-top)]">
            <div className="flex min-w-0 items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <span className="block max-w-[62vw] truncate text-sm font-semibold tracking-tight text-foreground">
                    {activeMenuItem?.label ?? "Menu"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <main className="app-shell-content min-w-0 flex-1 overflow-x-hidden bg-white p-2 pb-32 sm:p-4 sm:pb-4 supports-[padding:max(0px)]:pb-[calc(max(7.75rem,env(safe-area-inset-bottom))+0.75rem)] sm:supports-[padding:max(0px)]:pb-4">{children}</main>
        {isMobile && (
          <nav
            aria-label="Navegação principal do aplicativo"
            className="fixed inset-x-0 bottom-0 z-50 border-t border-[#E5E7EB] bg-white/96 px-2 pt-2 shadow-[0_-18px_52px_rgba(13,27,45,0.10)] backdrop-blur-2xl thumb-safe-bottom supports-[padding:max(0px)]:pb-[max(0.95rem,env(safe-area-inset-bottom))]"
          >
            <div className="mx-auto grid w-full max-w-md grid-cols-5 gap-1 rounded-[1.2rem] border border-[#E5E7EB] bg-white p-1 sm:rounded-[1.35rem]">
              {menuItems.filter((item) => ["/app", "/preparar-consulta", "/memoria", "/consultas", "/conexoes"].includes(item.path)).map((item) => {
                const isActive = item.path === location || (item.path !== "/" && location.startsWith(item.path));
                return (
                  <button
                    key={item.path}
                    type="button"
                    onClick={() => setLocation(item.path)}
                    className={`flex min-h-[3.55rem] min-w-0 touch-manipulation flex-col items-center justify-center gap-1 rounded-[0.95rem] px-0.5 text-[0.62rem] font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6EC1B4] min-[390px]:text-[0.66rem] sm:min-h-[3.75rem] sm:rounded-[1rem] sm:px-1 ${isActive ? "bg-[#EFF9F7] text-[#0F1B33] shadow-sm ring-1 ring-[#6EC1B4]/25" : "text-[#0F1B33]/62 active:bg-[#EFF9F7]"}`}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={item.label}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? "text-[#6EC1B4]" : "text-[#0F1B33]/58"}`} />
                    <span className="w-full truncate text-center leading-none">{item.label.replace("Painel do paciente", "Início").replace("Jornada IA", "Jornada").replace("Memória clínica", "Histórico").replace("Marketplace", "Loja").replace("Conexões", "Conectar")}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}
      </SidebarInset>
    </>
  );
}

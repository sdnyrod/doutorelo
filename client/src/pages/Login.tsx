import { useState, useMemo, useEffect, type ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";
import {
  ArrowRight,
  KeyRound,
  LockKeyhole,
  Mail,
  MessageCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
} from "lucide-react";

/* ─── Types ─── */
type LoginChoice = {
  id: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }> | "google" | "apple";
  enabled: boolean;
};

/* ─── Constants ─── */
const LOGO_URL = "/doutorelo-logo.png";

const loginChoices: LoginChoice[] = [
  {
    id: "google",
    title: "Continuar com Google",
    description: "A opção mais rápida para quem já usa uma conta Google.",
    icon: "google",
    enabled: false,
  },
  {
    id: "apple",
    title: "Continuar com Apple",
    description: "Entrada simples para iPhone, iPad, Mac ou Apple ID.",
    icon: "apple",
    enabled: false,
  },
  {
    id: "email-code",
    title: "Receber código por email",
    description: "Use um código ou link seguro sem precisar lembrar senha.",
    icon: Mail,
    enabled: false,
  },
  {
    id: "whatsapp-code",
    title: "Receber código por WhatsApp",
    description: "Receba um código direto no seu WhatsApp.",
    icon: MessageCircle,
    enabled: false,
  },
  {
    id: "email-password",
    title: "Entrar com email e senha",
    description: "Acesso tradicional com credenciais cadastradas.",
    icon: KeyRound,
    enabled: true,
  },
];

/* ─── Helpers ─── */
const safeNextFromUrl = () => {
  if (typeof window === "undefined") return "/app";
  const next = new URLSearchParams(window.location.search).get("next");
  if (!next || next === "/" || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/api/")) {
    return "/app";
  }
  return next;
};

/* ─── Icon Components ─── */
function ChoiceIcon({ icon }: { icon: LoginChoice["icon"] }) {
  if (icon === "google") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    );
  }

  if (icon === "apple") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 fill-[#0F1B33]">
        <path d="M16.49 12.02c-.03-2.03 1.66-3.02 1.74-3.07-.95-1.38-2.41-1.57-2.92-1.59-1.23-.13-2.43.74-3.05.74-.64 0-1.61-.72-2.65-.7-1.36.02-2.63.8-3.33 2.02-1.43 2.48-.36 6.12 1 8.12.69.98 1.49 2.08 2.55 2.04 1.03-.04 1.41-.65 2.65-.65 1.23 0 1.58.65 2.66.63 1.11-.02 1.81-.98 2.47-1.97.79-1.12 1.1-2.23 1.11-2.29-.02-.01-2.2-.85-2.23-3.28ZM14.5 6.06c.56-.7.94-1.65.84-2.61-.81.04-1.82.56-2.4 1.24-.52.6-.99 1.59-.87 2.52.92.07 1.85-.46 2.43-1.15Z" />
      </svg>
    );
  }

  const Icon = icon;
  return <Icon className="h-5 w-5 text-[#6EC1B4]" />;
}

/* ─── Email/Password Form ─── */
function EmailPasswordForm({ mode, onBack, onSuccess }: { mode: "login" | "register"; onBack: () => void; onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(mode === "register");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("Login realizado com sucesso");
      onSuccess();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao entrar");
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("Conta criada com sucesso");
      onSuccess();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao criar conta");
    },
  });

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      if (!name.trim()) {
        toast.error("Informe seu nome");
        return;
      }
      registerMutation.mutate({ email, password, name: name.trim() });
    } else {
      loginMutation.mutate({ email, password });
    }
  };

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] transition hover:text-[#0F1B33]"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar às opções
      </button>

      <div>
        <h2 className="font-display text-2xl font-bold text-[#0F1B33]">
          {isRegister ? "Criar conta" : "Entrar com email"}
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">
          {isRegister ? "Preencha seus dados para começar." : "Use suas credenciais cadastradas."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <div>
            <label htmlFor="auth-name" className="mb-1.5 block text-sm font-medium text-[#0F1B33]">
              Nome
            </label>
            <input
              id="auth-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full rounded-xl border border-[#E7ECF2] bg-white px-4 py-3 text-sm text-[#0F1B33] placeholder:text-[#94A3B8] outline-none transition focus:border-[#6EC1B4] focus:ring-2 focus:ring-[#6EC1B4]/20"
              autoComplete="name"
              disabled={isLoading}
            />
          </div>
        )}

        <div>
          <label htmlFor="auth-email" className="mb-1.5 block text-sm font-medium text-[#0F1B33]">
            Email
          </label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full rounded-xl border border-[#E7ECF2] bg-white px-4 py-3 text-sm text-[#0F1B33] placeholder:text-[#94A3B8] outline-none transition focus:border-[#6EC1B4] focus:ring-2 focus:ring-[#6EC1B4]/20"
            autoComplete="email"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="auth-password" className="mb-1.5 block text-sm font-medium text-[#0F1B33]">
            Senha
          </label>
          <div className="relative">
            <input
              id="auth-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isRegister ? "Mínimo 6 caracteres" : "Sua senha"}
              className="w-full rounded-xl border border-[#E7ECF2] bg-white px-4 py-3 pr-12 text-sm text-[#0F1B33] placeholder:text-[#94A3B8] outline-none transition focus:border-[#6EC1B4] focus:ring-2 focus:ring-[#6EC1B4]/20"
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
              minLength={isRegister ? 6 : 1}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-[#0F1B33] py-3 font-display text-sm font-semibold text-white shadow-md transition hover:bg-[#1a2d4d] disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {isRegister ? "Criar conta" : "Entrar"}
        </Button>
      </form>

      <div className="pt-2 text-center text-sm text-[#64748B]">
        {isRegister ? (
          <>
            Já tem conta?{" "}
            <button type="button" onClick={() => setIsRegister(false)} className="font-semibold text-[#6EC1B4] hover:underline">
              Entrar
            </button>
          </>
        ) : (
          <>
            Não tem conta?{" "}
            <button type="button" onClick={() => setIsRegister(true)} className="font-semibold text-[#6EC1B4] hover:underline">
              Criar conta
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Main Login Page ─── */
export default function Login() {
  const nextPath = useMemo(() => safeNextFromUrl(), []);
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeForm, setActiveForm] = useState<"choices" | "email-password">("choices");

  useEffect(() => {
    if (!loading && user) {
      navigate(nextPath, { replace: true });
    }
  }, [loading, user, nextPath, navigate]);

  const handleChoiceClick = (choice: LoginChoice) => {
    if (!choice.enabled) {
      toast.info("Em breve", { description: `${choice.title} estará disponível em breve.` });
      return;
    }
    if (choice.id === "email-password") {
      setActiveForm("email-password");
    }
  };

  const handleAuthSuccess = () => {
    window.location.href = nextPath;
  };

  return (
    <main className="min-h-dvh bg-white font-sans text-[#0F1B33]">
      <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <a href="/" aria-label="Voltar para a Home DOUTORELO">
              <img
                src={LOGO_URL}
                alt="DOUTORELO"
                className="h-12 w-auto object-contain sm:h-14"
              />
            </a>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-[#E7ECF2] bg-white p-6 shadow-lg shadow-[#0F1B33]/[0.04] sm:p-8">
            {activeForm === "choices" ? (
              <>
                {/* Header */}
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#E7ECF2]">
                    <LockKeyhole className="h-5 w-5 text-[#0F1B33]" />
                  </div>
                  <h1 className="font-display text-2xl font-bold tracking-tight text-[#0F1B33]">
                    Acesse sua conta
                  </h1>
                  <p className="mt-2 text-sm text-[#64748B]">
                    Escolha como prefere entrar no DoutorElo.
                  </p>
                </div>

                {/* Choices */}
                <div className="space-y-3">
                  {loginChoices.map((choice) => (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => handleChoiceClick(choice)}
                      className={`group flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition duration-150 ${
                        choice.enabled
                          ? "border-[#6EC1B4] bg-[#6EC1B4]/[0.04] hover:bg-[#6EC1B4]/[0.08] hover:shadow-sm"
                          : "border-[#E7ECF2] bg-white opacity-70 hover:opacity-90 hover:border-[#E7ECF2]"
                      }`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-[#E7ECF2]">
                        <ChoiceIcon icon={choice.icon} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-[#0F1B33]">{choice.title}</span>
                        <span className="mt-0.5 block text-xs leading-4 text-[#64748B]">{choice.description}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-[#64748B] transition group-hover:translate-x-0.5 group-hover:text-[#6EC1B4]" />
                      {!choice.enabled && (
                        <span className="shrink-0 rounded-full bg-[#E7ECF2] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#64748B]">
                          Em breve
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                  <a
                    href="/"
                    className="text-sm font-medium text-[#64748B] transition hover:text-[#0F1B33]"
                  >
                    Voltar para a página inicial
                  </a>
                </div>
              </>
            ) : (
              <EmailPasswordForm
                mode="login"
                onBack={() => setActiveForm("choices")}
                onSuccess={handleAuthSuccess}
              />
            )}
          </div>

          {/* Bottom note */}
          <p className="mt-6 text-center text-xs text-[#94A3B8]">
            Seus dados de saúde ficam protegidos. O DoutorElo não compartilha informações sem seu consentimento.
          </p>
        </div>
      </div>
    </main>
  );
}

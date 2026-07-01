import DashboardLayout from "@/components/DashboardLayout";
import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  ClipboardList,
  Database,
  FileText,
  HeartHandshake,
  Leaf,
  LockKeyhole,
  MessageCircle,
  MessageCircleHeart,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const CONSENT_STORAGE_KEY = "doutorelo-continuous-journey-consent-v1";

type ConsentState = {
  privacyAccepted: boolean;
  healthDataAccepted: boolean;
  medicalDisclaimerAccepted: boolean;
};

type PathIconName =
  | "search"
  | "file-text"
  | "activity"
  | "database"
  | "clipboard-list"
  | "stethoscope"
  | "shield-alert"
  | "message-circle"
  | "heart-handshake"
  | "leaf";

const emptyConsent: ConsentState = {
  privacyAccepted: false,
  healthDataAccepted: false,
  medicalDisclaimerAccepted: false,
};

const suggestedPrompts = [
  "Estou cansado há semanas e quero entender o que observar primeiro.",
  "Tenho exames recentes e não sei como organizar minhas dúvidas.",
  "Quero melhorar sono, energia e rotina sem transformar isso só em consulta.",
];

const iconMap: Record<PathIconName, typeof Search> = {
  search: Search,
  "file-text": FileText,
  activity: Activity,
  database: Database,
  "clipboard-list": ClipboardList,
  stethoscope: Stethoscope,
  "shield-alert": ShieldAlert,
  "message-circle": MessageCircle,
  "heart-handshake": HeartHandshake,
  leaf: Leaf,
};

function loadConsent(): ConsentState {
  try {
    const saved = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!saved) return emptyConsent;
    return { ...emptyConsent, ...JSON.parse(saved) };
  } catch {
    return emptyConsent;
  }
}

function readInitialIntention() {
  if (typeof window === "undefined") return "";

  const intention = new URLSearchParams(window.location.search).get("intencao")?.trim() ?? "";
  return intention.slice(0, 700);
}

function urgencyLabel(value: string | undefined) {
  const labels: Record<string, string> = {
    educational: "educativo",
    attention: "atenção",
    urgent: "urgente",
  };
  return value ? labels[value] ?? value : "a definir";
}

function intentLabel(value: string | undefined) {
  const labels: Record<string, string> = {
    symptom: "sintoma",
    exam: "exame",
    habit: "hábito/rotina",
    prevention: "prevenção",
    "professional-search": "busca profissional",
    emotional: "emocional",
    alert: "alerta",
    general: "geral",
  };
  return value ? labels[value] ?? value : "jornada";
}

function guardrailLabel(value: string | undefined) {
  const labels: Record<string, string> = {
    answer_safely: "desdobramento seguro",
    ask_for_context: "pede mais contexto",
    refuse_and_escalate: "priorizar cuidado humano",
  };
  return value ? labels[value] ?? value : "sem avaliação";
}

export default function Clarity() {
  const utils = trpc.useUtils();
  const [consent, setConsent] = useState<ConsentState>(() => loadConsent());
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [initialIntention] = useState(() => readInitialIntention());

  const hasConsent = consent.privacyAccepted && consent.healthDataAccepted && consent.medicalDisclaimerAccepted;
  const latestAssistantMessage = messages.filter((message) => message.role === "assistant").at(-1)?.content;
  const contextualPrompts = useMemo(() => {
    if (!initialIntention) return suggestedPrompts;
    return [initialIntention, ...suggestedPrompts.filter((prompt) => prompt !== initialIntention)];
  }, [initialIntention]);

  useEffect(() => {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  }, [consent]);

  const analyzeIntentMutation = trpc.clarity.analyzeIntent.useMutation({
    onSuccess: async (result) => {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: result.initialResponse },
      ]);
      await Promise.all([utils.memory.summary.invalidate(), utils.memory.timeline.invalidate()]);
      toast.success(result.safety.redFlag ? "Sinal de atenção registrado com orientação de segurança." : "Jornada inicial organizada e salva na sua memória de saúde.");
    },
    onError: (error) => {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: `Não consegui desdobrar sua jornada agora. ${error.message}` },
      ]);
      toast.error(error.message);
    },
  });

  const result = analyzeIntentMutation.data;
  const isEscalated = result?.safety.guardrailDecision === "refuse_and_escalate";

  const progressSteps = useMemo(
    () => [
      { label: "Consentimento", complete: hasConsent, icon: LockKeyhole },
      { label: "Primeira intenção", complete: messages.some((message) => message.role === "user"), icon: MessageCircleHeart },
      { label: "Desdobramento", complete: Boolean(result?.nextPaths?.length), icon: Sparkles },
      { label: "Memória", complete: Boolean(result?.patientEvent), icon: Database },
    ],
    [hasConsent, messages, result?.nextPaths?.length, result?.patientEvent],
  );

  const progressValue = (progressSteps.filter((step) => step.complete).length / progressSteps.length) * 100;

  const handleConsentChange = (key: keyof ConsentState, value: boolean) => {
    setConsent((current) => ({ ...current, [key]: value }));
  };

  const handleSendMessage = (content: string) => {
    if (!hasConsent) {
      toast.error("Confirme os três termos de segurança antes de enviar dados de saúde.");
      return;
    }

    setMessages((current) => [...current, { role: "user", content }]);
    analyzeIntentMutation.mutate({
      message: content,
      consent: {
        privacyAccepted: consent.privacyAccepted,
        healthDataAccepted: consent.healthDataAccepted,
        aiGuidanceAccepted: consent.medicalDisclaimerAccepted,
      },
    });
  };

  const handlePathClick = (path: { id: string; label: string; route: string | null; description: string }) => {
    setSelectedPathId(path.id);
    if (path.route) {
      toast.info(`Abrindo caminho: ${path.label}`);
      window.location.href = path.route;
      return;
    }

    const pathPrompt = `Quero seguir pelo caminho "${path.label}". ${path.description}`;
    setMessages((current) => [...current, { role: "user", content: pathPrompt }]);
    analyzeIntentMutation.mutate({
      message: pathPrompt,
      consent: {
        privacyAccepted: consent.privacyAccepted,
        healthDataAccepted: consent.healthDataAccepted,
        aiGuidanceAccepted: consent.medicalDisclaimerAccepted,
      },
    });
  };

  return (
    <DashboardLayout>
      <div className="min-h-dvh overflow-x-clip rounded-[1.25rem] bg-white p-3 sm:p-4 md:rounded-[2rem] md:p-8">
        <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5 sm:gap-8">
          <section className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-end">
            <div className="space-y-5">
              <Badge className="w-fit rounded-full bg-white px-4 py-1 text-[#0F1B33] hover:bg-white">
                Jornada contínua · múltiplos próximos passos
              </Badge>
              <div className="space-y-4">
                <h1 className="max-w-4xl text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl md:text-6xl">
                  Sua primeira resposta abre caminhos, não um funil único.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                  Você escreve livremente. O DOUTORELO identifica se faz mais sentido entender melhor, organizar exames, acompanhar rotina, registrar memória, preparar uma conversa profissional, buscar ajuda humana, revisar sinais de atenção ou simplesmente continuar explorando. A IA não diagnostica nem prescreve; ela organiza possibilidades seguras.
                </p>
              </div>
            </div>
            <Card className="border-white/70 bg-white/80 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-950">
                  <Sparkles className="h-5 w-5 text-[#0F1B33]" />
                  Progresso da jornada
                </CardTitle>
                <CardDescription>
                  Cada etapa preserva consentimento, segurança clínica e continuidade longitudinal.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progressValue} className="h-3" />
                <div className="grid gap-2 sm:grid-cols-2">
                  {progressSteps.map((step) => (
                    <div key={step.label} className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      <step.icon className={`h-4 w-4 ${step.complete ? "text-[#0F1B33]" : "text-slate-400"}`} />
                      <span>{step.label}</span>
                      {step.complete ? <CheckCircle2 className="ml-auto h-4 w-4 text-[#0F1B33]" /> : null}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid min-w-0 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
            <div className="min-w-0 space-y-5 sm:space-y-6">
              <Card className="border-white/70 bg-white/85 shadow-xl shadow-slate-900/5 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-950">
                    <ShieldCheck className="h-5 w-5 text-[#0F1B33]" />
                    Consentimento e limites
                  </CardTitle>
                  <CardDescription>
                    Antes de contar informações de saúde, confirme como seus dados serão usados e os limites da ferramenta.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ConsentRow
                    id="privacyAccepted"
                    checked={consent.privacyAccepted}
                    onCheckedChange={(value) => handleConsentChange("privacyAccepted", value)}
                    label="Li e aceito a política de privacidade para iniciar uma jornada de saúde protegida."
                  />
                  <ConsentRow
                    id="healthDataAccepted"
                    checked={consent.healthDataAccepted}
                    onCheckedChange={(value) => handleConsentChange("healthDataAccepted", value)}
                    label="Autorizo o tratamento de dados de saúde para organizar, salvar e dar continuidade ao meu contexto."
                  />
                  <ConsentRow
                    id="medicalDisclaimerAccepted"
                    checked={consent.medicalDisclaimerAccepted}
                    onCheckedChange={(value) => handleConsentChange("medicalDisclaimerAccepted", value)}
                    label="Entendo que a resposta é educativa e não substitui consulta, diagnóstico, prescrição, tratamento ou emergência."
                  />
                  <Separator />
                  <div className="rounded-3xl bg-white p-4 text-sm leading-6 text-[#0F1B33]">
                    {hasConsent ? "Tudo certo. Agora você pode escrever com suas palavras e escolher o caminho depois da resposta inicial." : "A jornada fica bloqueada até os três termos serem confirmados."}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/70 bg-slate-950 text-white shadow-xl shadow-slate-950/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-[#0F1B33]" />
                    O que acontece depois da primeira resposta
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    O sistema escolhe caminhos conforme a sua intenção, sem presumir que tudo termina em consulta.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-6 text-slate-200">
                  <p>
                    A resposta inicial mostra o que foi entendido, os limites de segurança, perguntas úteis e chips de ação. Você pode seguir por memória, rotina, exames, prevenção, profissional, sinais de atenção ou continuação livre.
                  </p>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    Se houver dor intensa súbita, falta de ar, desmaio, sinais neurológicos, sangramento importante, autoagressão ou risco imediato, procure urgência em vez de depender da ferramenta.
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="min-w-0 space-y-5 sm:space-y-6">
              <AIChatBox
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={analyzeIntentMutation.isPending}
                height="clamp(32rem, calc(100svh - 12rem), 42.5rem)"
                className="min-w-0 border-white/70 bg-white/90 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)] backdrop-blur"
                placeholder={hasConsent ? "Continue livremente: sintomas, exames, rotina, hábitos, emoções ou dúvidas..." : "Confirme os termos para começar"}
                emptyStateMessage={initialIntention ? "Revise a intenção trazida da Home, confirme os termos de segurança e envie quando estiver confortável." : "Conte com suas palavras o que quer entender, organizar, acompanhar ou decidir sobre sua saúde."}
                suggestedPrompts={contextualPrompts}
                initialInput={messages.length === 0 ? initialIntention : ""}
              />

              <Card className="border-white/70 bg-white/85 shadow-xl shadow-slate-900/5 backdrop-blur">
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2 text-slate-950">
                      {isEscalated ? <ShieldAlert className="h-5 w-5 text-red-600" /> : <Sparkles className="h-5 w-5 text-[#0F1B33]" />}
                      Motor de desdobramento contínuo
                    </CardTitle>
                    {result ? (
                      <div className="flex flex-wrap gap-2">
                        <Badge className="rounded-full bg-white text-[#0F1B33] hover:bg-white">{intentLabel(result.intentType)}</Badge>
                        <Badge className={result.urgency === "urgent" ? "rounded-full bg-red-100 text-red-800 hover:bg-red-100" : "rounded-full bg-blue-100 text-blue-800 hover:bg-blue-100"}>{urgencyLabel(result.urgency)}</Badge>
                        <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">{guardrailLabel(result.safety.guardrailDecision)}</Badge>
                      </div>
                    ) : null}
                  </div>
                  <CardDescription>
                    A primeira intenção vira um mapa vivo de possibilidades. Consulta é uma das trilhas possíveis, não o destino obrigatório.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {result ? (
                    <div className="min-w-0 space-y-5 sm:space-y-6">
                      <div className="min-w-0 rounded-3xl border border-[#6EC1B4]/20 bg-white p-4 text-[#0F1B33] sm:p-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0F1B33]">resposta inicial segura</p>
                        <p className="mt-3 whitespace-pre-line text-sm leading-7">{result.initialResponse}</p>
                      </div>

                      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                        <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">resumo vivo</p>
                          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-950">{result.liveSummary.title}</h2>
                          <p className="mt-3 text-sm leading-6 text-slate-600">{result.liveSummary.whatWeUnderstood}</p>
                          <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">ainda falta entender</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {result.liveSummary.missingContext.map((item) => (
                                <Badge key={item} variant="outline" className="rounded-full border-slate-200 bg-white text-slate-600">{item}</Badge>
                              ))}
                            </div>
                          </div>
                          <p className="mt-4 text-sm leading-6 text-slate-500">{result.liveSummary.memoryHint}</p>
                        </div>

                        <div className={isEscalated ? "rounded-3xl bg-red-50 p-5 text-red-950" : "rounded-3xl bg-blue-50 p-5 text-blue-950"}>
                          <p className="flex items-center gap-2 text-sm font-semibold">
                            {isEscalated ? <AlertTriangle className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                            Segurança clínica
                          </p>
                          <p className="mt-2 text-sm leading-6">{result.safety.nextStep}</p>
                          <div className="mt-4 space-y-2">
                            {result.safety.safetyActions.map((action) => (
                              <div key={action} className="rounded-2xl bg-white/60 px-3 py-2 text-xs font-medium">{action}</div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="mb-3 text-sm font-semibold text-slate-950">Escolha um próximo caminho ou continue escrevendo livremente</p>
                        <div className="grid gap-3 md:grid-cols-2">
                          {result.nextPaths.map((path) => {
                            const Icon = iconMap[(path.icon as PathIconName)] ?? Sparkles;
                            const active = selectedPathId === path.id;
                            return (
                              <button
                                key={path.id}
                                type="button"
                                onClick={() => handlePathClick(path)}
                                className={`group rounded-3xl border p-4 text-left transition duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6EC1B4]/25 ${active ? "border-[#6EC1B4]/20 bg-white shadow-lg shadow-[0_18px_64px_rgba(13,27,45,0.08)]" : path.priority === "safety" ? "border-amber-200 bg-amber-50/70 hover:border-amber-300" : "border-slate-200 bg-white hover:border-[#6EC1B4]/20 hover:shadow-lg hover:shadow-slate-900/5"}`}
                              >
                                <div className="flex items-start gap-3">
                                  <span className={`rounded-2xl p-2 ${path.priority === "safety" ? "bg-amber-100 text-amber-700" : "bg-white text-[#0F1B33]"}`}>
                                    <Icon className="h-4 w-4" />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block font-semibold text-slate-950">{path.label}</span>
                                    <span className="mt-1 block text-sm leading-6 text-slate-600">{path.description}</span>
                                    {path.route ? <span className="mt-2 inline-flex text-xs font-semibold text-[#0F1B33]">Abrir área relacionada →</span> : <span className="mt-2 inline-flex text-xs font-semibold text-slate-500">Continuar nesta conversa →</span>}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-4 sm:p-5">
                        <p className="text-sm font-semibold text-slate-950">Perguntas inteligentes para continuar</p>
                        <div className="mt-4 grid gap-3">
                          {result.followUpQuestions.map((question) => (
                            <Button
                              key={question}
                              type="button"
                              variant="outline"
                              className="h-auto min-h-11 justify-start whitespace-normal rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm leading-6 text-slate-700 hover:bg-white"
                              onClick={() => handleSendMessage(question)}
                            >
                              {question}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-60 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center sm:min-h-72 sm:p-8">
                      <Sparkles className="h-10 w-10 text-slate-300" />
                      <div className="space-y-2">
                        <p className="font-medium text-slate-950">Nenhum caminho aberto ainda.</p>
                        <p className="max-w-md text-sm leading-6 text-slate-500">
                          Depois da primeira mensagem, a IA mostrará uma resposta inicial, caminhos dinâmicos, resumo vivo e perguntas para continuar sem becos sem saída.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {latestAssistantMessage ? (
                <Card className="border-white/70 bg-white/85 shadow-sm backdrop-blur">
                  <CardHeader>
                    <CardTitle className="text-base text-slate-950">Última resposta da IA</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-line text-sm leading-6 text-slate-600">{latestAssistantMessage}</p>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ConsentRow({ id, checked, onCheckedChange, label }: { id: string; checked: boolean; onCheckedChange: (value: boolean) => void; label: string }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:p-4">
      <Checkbox id={id} checked={checked} onCheckedChange={(value) => onCheckedChange(value === true)} className="mt-1" />
      <Label htmlFor={id} className="cursor-pointer text-sm leading-6 text-slate-700">
        {label}
      </Label>
    </div>
  );
}

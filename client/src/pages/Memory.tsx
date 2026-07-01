import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Activity, Brain, CalendarClock, ClipboardCheck, FileText, HeartPulse, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type SexValue = "female" | "male" | "intersex" | "not_informed";
type EventSeverity = "low" | "medium" | "attention" | "urgent";

type ProfileForm = {
  preferredName: string;
  birthYear: string;
  biologicalSex: SexValue;
  mainGoal: string;
  knownConditions: string;
  medications: string;
  allergies: string;
  lifestyleNotes: string;
  emotionalContext: string;
  emergencyNotes: string;
};

type ClarityForm = {
  mainConcern: string;
  symptoms: string;
  patterns: string;
  questionsForDoctor: string;
  suggestedSpecialty: string;
  nextStep: string;
  safetyFlags: string;
  confidence: string;
};

const emptyProfile: ProfileForm = {
  preferredName: "",
  birthYear: "",
  biologicalSex: "not_informed",
  mainGoal: "",
  knownConditions: "",
  medications: "",
  allergies: "",
  lifestyleNotes: "",
  emotionalContext: "",
  emergencyNotes: "",
};

const emptyClarity: ClarityForm = {
  mainConcern: "",
  symptoms: "",
  patterns: "",
  questionsForDoctor: "",
  suggestedSpecialty: "",
  nextStep: "",
  safetyFlags: "",
  confidence: "medium",
};

function nullableText(value: string) {
  const normalized = value.trim();
  return normalized.length ? normalized : null;
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Sem data";
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function severityLabel(severity: string) {
  const labels: Record<string, string> = {
    low: "registro simples",
    medium: "vale acompanhar",
    attention: "ponto de atenção",
    urgent: "atenção urgente",
  };
  return labels[severity] ?? severity;
}

function sourceLabel(source: string) {
  const labels: Record<string, string> = {
    patient: "anotado por você",
    ai: "organizado pela IA",
    professional: "registrado pela equipe",
    appointment: "consulta",
    manual: "registro manual",
  };
  return labels[source] ?? "registro do histórico";
}

function severityClass(severity: string) {
  if (severity === "urgent") return "border-red-200 bg-red-50 text-red-700";
  if (severity === "attention") return "border-amber-200 bg-amber-50 text-amber-700";
  if (severity === "medium") return "border-sky-200 bg-sky-50 text-sky-700";
  return "border-[#6EC1B4]/20 bg-white text-[#0F1B33]";
}

export default function Memory() {
  const utils = trpc.useUtils();
  const summary = trpc.memory.summary.useQuery();
  const timeline = trpc.memory.timeline.useQuery();
  const [profile, setProfile] = useState<ProfileForm>(emptyProfile);
  const [clarity, setClarity] = useState<ClarityForm>(emptyClarity);
  const [eventTitle, setEventTitle] = useState("");
  const [eventSummary, setEventSummary] = useState("");
  const [eventSeverity, setEventSeverity] = useState<EventSeverity>("low");

  useEffect(() => {
    const saved = summary.data?.profile;
    if (!saved) return;
    setProfile({
      preferredName: saved.preferredName ?? "",
      birthYear: saved.birthYear ? String(saved.birthYear) : "",
      biologicalSex: (saved.biologicalSex ?? "not_informed") as SexValue,
      mainGoal: saved.mainGoal ?? "",
      knownConditions: saved.knownConditions ?? "",
      medications: saved.medications ?? "",
      allergies: saved.allergies ?? "",
      lifestyleNotes: saved.lifestyleNotes ?? "",
      emotionalContext: saved.emotionalContext ?? "",
      emergencyNotes: saved.emergencyNotes ?? "",
    });
  }, [summary.data?.profile]);

  const completeness = summary.data?.profile?.completenessScore ?? 0;
  const recentEvents = summary.data?.recentEvents ?? [];
  const recentMaps = summary.data?.recentClarityMaps ?? [];
  const timelineItems = timeline.data ?? [];

  const stats = useMemo(
    () => [
      { label: "Perfil", value: `${completeness}%`, icon: ShieldCheck, detail: "preenchido" },
      { label: "Eventos", value: String(recentEvents.length), icon: Activity, detail: "últimos registros" },
      { label: "Resumos", value: String(recentMaps.length), icon: Brain, detail: "para consulta" },
      { label: "Linha do tempo", value: String(timelineItems.length), icon: CalendarClock, detail: "registros reunidos" },
    ],
    [completeness, recentEvents.length, recentMaps.length, timelineItems.length],
  );

  const invalidateMemory = async () => {
    await Promise.all([utils.memory.summary.invalidate(), utils.memory.timeline.invalidate()]);
  };

  const saveProfileMutation = trpc.memory.saveProfile.useMutation({
    onSuccess: async () => {
      toast.success("Perfil de saúde salvo no DOUTORELO.");
      await invalidateMemory();
    },
    onError: (error) => toast.error(error.message),
  });

  const saveClarityMutation = trpc.memory.saveClarityMap.useMutation({
    onSuccess: async () => {
      toast.success("Resumo para consulta salvo e conectado à linha do tempo.");
      setClarity(emptyClarity);
      await invalidateMemory();
    },
    onError: (error) => toast.error(error.message),
  });

  const addEventMutation = trpc.memory.addEvent.useMutation({
    onSuccess: async () => {
      toast.success("Registro adicionado ao seu histórico de saúde.");
      setEventTitle("");
      setEventSummary("");
      setEventSeverity("low");
      await invalidateMemory();
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSaveProfile = () => {
    saveProfileMutation.mutate({
      preferredName: nullableText(profile.preferredName),
      birthYear: profile.birthYear ? Number(profile.birthYear) : null,
      biologicalSex: profile.biologicalSex,
      mainGoal: nullableText(profile.mainGoal),
      knownConditions: nullableText(profile.knownConditions),
      medications: nullableText(profile.medications),
      allergies: nullableText(profile.allergies),
      lifestyleNotes: nullableText(profile.lifestyleNotes),
      emotionalContext: nullableText(profile.emotionalContext),
      emergencyNotes: nullableText(profile.emergencyNotes),
    });
  };

  const handleSaveClarity = () => {
    saveClarityMutation.mutate({
      mainConcern: clarity.mainConcern,
      symptoms: nullableText(clarity.symptoms),
      patterns: nullableText(clarity.patterns),
      questionsForDoctor: nullableText(clarity.questionsForDoctor),
      suggestedSpecialty: nullableText(clarity.suggestedSpecialty),
      nextStep: nullableText(clarity.nextStep),
      safetyFlags: nullableText(clarity.safetyFlags),
      confidence: clarity.confidence,
      status: "ready_for_review",
    });
  };

  const handleAddEvent = () => {
    addEventMutation.mutate({
      title: eventTitle,
      summary: nullableText(eventSummary),
      severity: eventSeverity,
      eventType: "note",
      source: "patient",
    });
  };

  return (
    <DashboardLayout>
      <div className="min-h-dvh overflow-x-clip rounded-[1.25rem] bg-white p-3 sm:p-4 md:rounded-[2rem] md:p-8">
        <div className="mx-auto flex max-w-7xl min-w-0 flex-col gap-5 sm:gap-8">
          <section className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:items-end">
            <div className="min-w-0 space-y-5">
              <Badge className="w-fit rounded-full bg-white px-4 py-1 text-[#0F1B33] hover:bg-white">
                Histórico de saúde · DOUTORELO
              </Badge>
              <div className="min-w-0 space-y-4">
                <h1 className="max-w-4xl text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl md:text-6xl">
                  Seu histórico de saúde organizado para você não ter que repetir tudo do zero.
                </h1>
                <p className="max-w-3xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                  Esta primeira versão reúne perfil, contexto emocional, registros importantes, resumos para consulta e uma linha do tempo segura para ajudar você a se preparar melhor.
                </p>
              </div>
            </div>
            <Card className="border-white/70 bg-white/75 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)] backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-950">
                  <Sparkles className="h-5 w-5 text-[#0F1B33]" />
                  Sinal de continuidade
                </CardTitle>
                <CardDescription>
                  A ideia é simples: guardar o que importa para que sua história de saúde faça mais sentido a cada consulta.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={completeness} className="h-3" />
                <p className="text-sm text-slate-600">{completeness}% do perfil essencial preenchido.</p>
              </CardContent>
            </Card>
          </section>

          <section className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
                <CardContent className="flex items-center justify-between pt-6">
                  <div>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <p className="mt-1 text-3xl font-semibold text-slate-950">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.detail}</p>
                  </div>
                  <div className="rounded-2xl bg-white p-3 text-[#0F1B33]">
                    <stat.icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid min-w-0 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <Card className="border-white/70 bg-white/85 shadow-xl shadow-slate-900/5 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-950">
                  <ClipboardCheck className="h-5 w-5 text-[#0F1B33]" />
                  Perfil essencial de saúde
                </CardTitle>
                <CardDescription>
                  Preencha apenas o necessário para criar contexto. Este histórico não substitui prontuário médico e deve ser revisado em consulta.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="space-y-2">
                    <Label>Nome de preferência</Label>
                    <Input value={profile.preferredName} onChange={(event) => setProfile({ ...profile, preferredName: event.target.value })} placeholder="Como devemos chamar você?" />
                  </div>
                  <div className="space-y-2">
                    <Label>Ano de nascimento</Label>
                    <Input inputMode="numeric" value={profile.birthYear} onChange={(event) => setProfile({ ...profile, birthYear: event.target.value })} placeholder="Ex.: 1988" />
                  </div>
                </div>
                <div className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="space-y-2">
                    <Label>Sexo biológico</Label>
                    <Select value={profile.biologicalSex} onValueChange={(value: SexValue) => setProfile({ ...profile, biologicalSex: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not_informed">Prefiro não informar</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="intersex">Intersexo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Objetivo principal</Label>
                    <Input value={profile.mainGoal} onChange={(event) => setProfile({ ...profile, mainGoal: event.target.value })} placeholder="Sono, energia, prevenção, dor, rotina..." />
                  </div>
                </div>
                <Textarea value={profile.knownConditions} onChange={(event) => setProfile({ ...profile, knownConditions: event.target.value })} placeholder="Condições conhecidas, diagnósticos prévios ou pontos importantes" />
                <Textarea value={profile.medications} onChange={(event) => setProfile({ ...profile, medications: event.target.value })} placeholder="Medicamentos, suplementos ou tratamentos em uso" />
                <Textarea value={profile.allergies} onChange={(event) => setProfile({ ...profile, allergies: event.target.value })} placeholder="Alergias ou reações relevantes" />
                <Textarea value={profile.lifestyleNotes} onChange={(event) => setProfile({ ...profile, lifestyleNotes: event.target.value })} placeholder="Sono, alimentação, movimento, trabalho e rotina" />
                <Textarea value={profile.emotionalContext} onChange={(event) => setProfile({ ...profile, emotionalContext: event.target.value })} placeholder="Contexto emocional que pode afetar sua saúde" />
                <Textarea value={profile.emergencyNotes} onChange={(event) => setProfile({ ...profile, emergencyNotes: event.target.value })} placeholder="Sinais de atenção, restrições ou instruções importantes" />
                <Button onClick={handleSaveProfile} disabled={saveProfileMutation.isPending} className="w-full bg-slate-950 text-white hover:bg-slate-800">
                  {saveProfileMutation.isPending ? "Salvando..." : "Salvar perfil de saúde"}
                </Button>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-[#6EC1B4]/20 bg-white/90 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)] backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-950">
                    <Brain className="h-5 w-5 text-[#0F1B33]" />
                    Primeiro resumo para consulta
                  </CardTitle>
                  <CardDescription>
                    O resumo organiza preocupação principal, sintomas, padrões, perguntas e próximo passo prudente. A meta é simples: chegar à consulta sabendo o que contar e o que perguntar.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input value={clarity.mainConcern} onChange={(event) => setClarity({ ...clarity, mainConcern: event.target.value })} placeholder="Qual é a principal preocupação agora?" />
                  <Textarea value={clarity.symptoms} onChange={(event) => setClarity({ ...clarity, symptoms: event.target.value })} placeholder="Sintomas percebidos, intensidade e evolução" />
                  <Textarea value={clarity.patterns} onChange={(event) => setClarity({ ...clarity, patterns: event.target.value })} placeholder="Padrões: horários, gatilhos, melhora, piora" />
                  <Textarea value={clarity.questionsForDoctor} onChange={(event) => setClarity({ ...clarity, questionsForDoctor: event.target.value })} placeholder="Perguntas que você quer levar ao médico" />
                  <div className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4">
                    <Input value={clarity.suggestedSpecialty} onChange={(event) => setClarity({ ...clarity, suggestedSpecialty: event.target.value })} placeholder="Especialidade sugerida" />
                    <Select value={clarity.confidence} onValueChange={(value) => setClarity({ ...clarity, confidence: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Ainda tenho poucas informações</SelectItem>
                        <SelectItem value="medium">Tenho um contexto razoável</SelectItem>
                        <SelectItem value="high">Tenho bastante informação organizada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea value={clarity.nextStep} onChange={(event) => setClarity({ ...clarity, nextStep: event.target.value })} placeholder="Próximo passo prudente e não prescritivo" />
                  <Textarea value={clarity.safetyFlags} onChange={(event) => setClarity({ ...clarity, safetyFlags: event.target.value })} placeholder="Sinais de atenção ou alerta para discutir com profissional" />
                  <Button onClick={handleSaveClarity} disabled={saveClarityMutation.isPending || clarity.mainConcern.trim().length < 2} className="w-full bg-[#0F1B33] text-white hover:bg-[#162240]">
                    {saveClarityMutation.isPending ? "Salvando..." : "Salvar resumo para consulta"}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-white/70 bg-white/85 shadow-sm backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-950">
                    <FileText className="h-5 w-5 text-slate-700" />
                    Registro rápido
                  </CardTitle>
                  <CardDescription>
                    Use para anotar algo que não pode se perder: sintoma, observação, exame recebido ou contexto de consulta.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input value={eventTitle} onChange={(event) => setEventTitle(event.target.value)} placeholder="Título do registro" />
                  <Textarea value={eventSummary} onChange={(event) => setEventSummary(event.target.value)} placeholder="Resumo do que aconteceu" />
                  <Select value={eventSeverity} onValueChange={(value: EventSeverity) => setEventSeverity(value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Registro simples</SelectItem>
                      <SelectItem value="medium">Vale acompanhar</SelectItem>
                      <SelectItem value="attention">Ponto de atenção</SelectItem>
                      <SelectItem value="urgent">Atenção urgente</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" onClick={handleAddEvent} disabled={addEventMutation.isPending || eventTitle.trim().length < 2} className="w-full bg-white">
                    {addEventMutation.isPending ? "Registrando..." : "Adicionar à linha do tempo"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
            <Card className="border-white/70 bg-white/80 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-950">
                  <HeartPulse className="h-5 w-5 text-[#0F1B33]" />
                  Últimos resumos
                </CardTitle>
                <CardDescription>Resumos recentes salvos para dar continuidade ao cuidado.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentMaps.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Nenhum resumo para consulta salvo ainda.</p>
                ) : (
                  recentMaps.map((map) => (
                    <div key={map.id} className="rounded-2xl border border-[#6EC1B4]/20 bg-white p-4">
                      <p className="font-medium text-slate-950">{map.mainConcern}</p>
                      <p className="mt-1 text-sm text-slate-600">{map.nextStep ?? "Sem próximo passo registrado."}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-white/70 bg-white/90 shadow-xl shadow-slate-900/5 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-950">
                  <CalendarClock className="h-5 w-5 text-slate-700" />
                  Linha do tempo de saúde
                </CardTitle>
                <CardDescription>
                  Eventos, resumos e consultas aparecem juntos para reduzir esquecimentos e melhorar sua preparação.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summary.isLoading || timeline.isLoading ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">Carregando seu histórico de saúde...</p>
                ) : timelineItems.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">A linha do tempo começará quando você salvar o perfil, um resumo ou um registro rápido.</p>
                ) : (
                  <div className="space-y-5">
                    {timelineItems.map((item, index) => (
                      <div key={item.id} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-3 sm:gap-4">
                        <div className="flex flex-col items-center">
                          <div className="h-3 w-3 rounded-full bg-[#0F1B33]" />
                          {index < timelineItems.length - 1 ? <div className="h-full w-px bg-white" /> : null}
                        </div>
                        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="font-medium text-slate-950">{item.title}</p>
                              <p className="text-xs text-slate-500">{formatDate(item.date)}</p>
                            </div>
                            <Badge variant="outline" className={severityClass(item.severity)}>{severityLabel(item.severity)}</Badge>
                          </div>
                          {item.summary ? <p className="mt-3 text-sm leading-6 text-slate-600">{item.summary}</p> : null}
                          <Separator className="my-3" />
                          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{item.kind === "event" ? "registro" : "resumo"} · {sourceLabel(item.source)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}

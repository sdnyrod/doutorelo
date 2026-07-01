import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, Brain, CalendarCheck, CheckCircle2, DatabaseZap, Edit3, FileText, LockKeyhole, Plus, Search, ShieldCheck, Stethoscope, Trash2, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type ProfessionalFormState = {
  id: string;
  name: string;
  specialty: string;
  credentials: string;
  approach: string;
  focusText: string;
  availabilityText: string;
  bio: string;
  languagesText: string;
  consultationModesText: string;
  featured: boolean;
  active: boolean;
};

type ContentFormState = {
  id: string;
  title: string;
  category: string;
  summary: string;
  body: string;
  status: "draft" | "published";
  safeLanguageNotice: string;
};

const appointmentStatuses = ["planned", "requested", "confirmed", "completed", "cancelled"] as const;
type AppointmentStatus = (typeof appointmentStatuses)[number];
type AppointmentStatusFilter = AppointmentStatus | "all";

type AdminAppointment = {
  id: number;
  userId: number;
  clarityMapId?: number | null;
  doctorName?: string | null;
  specialty?: string | null;
  status: AppointmentStatus;
  reason?: string | null;
  scheduledAt?: string | number | Date | null;
  notes?: string | null;
  createdAt?: string | number | Date | null;
  updatedAt?: string | number | Date | null;
};

const appointmentStatusLabels: Record<AppointmentStatus, { label: string; className: string }> = {
  planned: { label: "Planejada", className: "border-[#6EC1B4]/20 bg-white text-[#0F1B33]" },
  requested: { label: "Solicitada", className: "border-amber-200 bg-amber-50 text-amber-800" },
  confirmed: { label: "Confirmada", className: "border-[#6EC1B4]/20 bg-white text-[#0F1B33]" },
  completed: { label: "Concluída", className: "border-slate-200 bg-slate-50 text-slate-700" },
  cancelled: { label: "Cancelada", className: "border-red-200 bg-red-50 text-red-700" },
};

const makeFutureIso = (dayOffset: number, hour: number) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

const blankProfessional = (): ProfessionalFormState => ({
  id: `profissional-${Date.now()}`,
  name: "",
  specialty: "",
  credentials: "",
  approach: "",
  focusText: "",
  availabilityText: [makeFutureIso(2, 9), makeFutureIso(4, 14)].join("\n"),
  bio: "",
  languagesText: "Português",
  consultationModesText: "Teleconsulta",
  featured: false,
  active: true,
});

const blankContent = (): ContentFormState => ({
  id: `conteudo-${Date.now()}`,
  title: "",
  category: "Educação em saúde",
  summary: "",
  body: "",
  status: "draft",
  safeLanguageNotice: "Material educativo. Não é prescrição, diagnóstico ou substituto de orientação médica.",
});

const splitList = (value: string) => value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
const splitSlots = (value: string) => value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean).map((item) => new Date(item).toISOString());

function formatAppointmentDate(value: AdminAppointment["scheduledAt"]) {
  if (!value) return "Horário a confirmar";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Horário a confirmar";
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function appointmentDateKey(value: AdminAppointment["scheduledAt"]) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function appointmentStatusBadge(status: AppointmentStatus) {
  const config = appointmentStatusLabels[status];
  return <Badge variant="outline" className={`rounded-full px-3 py-1 ${config.className}`}>{config.label}</Badge>;
}

export default function Admin() {
  return (
    <DashboardLayout>
      <AdminContent />
    </DashboardLayout>
  );
}

function AdminContent() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();
  const summary = trpc.admin.summary.useQuery(undefined, { enabled: isAdmin, retry: false });
  const professionals = trpc.admin.professionals.useQuery(undefined, { enabled: isAdmin, retry: false });
  const contents = trpc.admin.contents.useQuery(undefined, { enabled: isAdmin, retry: false });
  const appointments = trpc.admin.appointments.useQuery(undefined, { enabled: isAdmin, retry: false });
  const mlDailyReview = trpc.admin.mlDailyReview.useQuery(undefined, { enabled: isAdmin, retry: false });
  const mlLearningEvents = trpc.admin.mlLearningEvents.useQuery({ limit: 24, label: "all" }, { enabled: isAdmin, retry: false });
  const healthDirectorySummary = trpc.admin.healthDirectorySummary.useQuery(undefined, { enabled: isAdmin, retry: false, staleTime: 60_000 });
  const healthDirectoryProviders = trpc.admin.healthDirectoryProviders.useQuery({ limit: 12, activeOnly: false }, { enabled: isAdmin, retry: false, staleTime: 30_000 });
  const [professionalForm, setProfessionalForm] = useState<ProfessionalFormState>(() => blankProfessional());
  const [contentForm, setContentForm] = useState<ContentFormState>(() => blankContent());
  const [editingProfessionalId, setEditingProfessionalId] = useState<string | null>(null);
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [appointmentStatusFilter, setAppointmentStatusFilter] = useState<AppointmentStatusFilter>("all");
  const [appointmentProfessionalFilter, setAppointmentProfessionalFilter] = useState("all");
  const [appointmentDateFilter, setAppointmentDateFilter] = useState("");
  const [appointmentNotesDrafts, setAppointmentNotesDrafts] = useState<Record<number, string>>({});
  const [mlReviewNotes, setMlReviewNotes] = useState<Record<number, string>>({});
  const [ragAuditQuery, setRagAuditQuery] = useState("desconforto digestivo leve e organização para consulta");
  const [lastRagAudit, setLastRagAudit] = useState<{ status: string; sourceCount: number; pipelineVersion: string } | null>(null);

  const professionalMutation = trpc.admin.upsertProfessional.useMutation({
    onSuccess: async (result) => {
      await Promise.all([utils.admin.professionals.invalidate(), utils.professionals.list.invalidate(), utils.admin.summary.invalidate()]);
      toast.success(result.mode === "created" ? "Profissional criado no catálogo." : "Profissional atualizado.");
      setProfessionalForm(blankProfessional());
      setEditingProfessionalId(null);
    },
    onError: (error) => toast.error(error.message || "Não foi possível salvar o profissional."),
  });

  const professionalDelete = trpc.admin.deleteProfessional.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.admin.professionals.invalidate(), utils.professionals.list.invalidate(), utils.admin.summary.invalidate()]);
      toast.success("Profissional arquivado e removido do catálogo público.");
    },
    onError: (error) => toast.error(error.message || "Não foi possível arquivar o profissional."),
  });

  const contentMutation = trpc.admin.upsertContent.useMutation({
    onSuccess: async (result) => {
      await Promise.all([utils.admin.contents.invalidate(), utils.admin.summary.invalidate()]);
      toast.success(result.mode === "created" ? "Conteúdo oficial criado." : "Conteúdo oficial atualizado.");
      setContentForm(blankContent());
      setEditingContentId(null);
    },
    onError: (error) => toast.error(error.message || "Não foi possível salvar o conteúdo."),
  });

  const contentDelete = trpc.admin.deleteContent.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.admin.contents.invalidate(), utils.admin.summary.invalidate()]);
      toast.success("Conteúdo movido para rascunho.");
    },
    onError: (error) => toast.error(error.message || "Não foi possível arquivar o conteúdo."),
  });

  const appointmentMutation = trpc.admin.updateAppointment.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.admin.appointments.invalidate(), utils.admin.summary.invalidate(), utils.appointments.mine.invalidate(), utils.professionals.myAppointments.invalidate(), utils.dashboard.overview.invalidate(), utils.memory.timeline.invalidate()]);
      toast.success("Consulta atualizada com segurança operacional.");
    },
    onError: (error) => toast.error(error.message || "Não foi possível atualizar a consulta."),
  });

  const reviewLearningEvent = trpc.admin.reviewMlLearningEvent.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.admin.mlLearningEvents.invalidate(), utils.admin.mlDailyReview.invalidate(), utils.admin.summary.invalidate()]);
      toast.success("Evento aprendível revisado e registrado para governança.");
    },
    onError: (error) => toast.error(error.message || "Não foi possível revisar o evento aprendível."),
  });

  const trainingExampleMutation = trpc.admin.createMlTrainingExample.useMutation({
    onSuccess: async () => {
      await utils.admin.mlTrainingExamples.invalidate();
      toast.success("Exemplo de treino criado para curadoria futura.");
    },
    onError: (error) => toast.error(error.message || "Não foi possível criar o exemplo de treino."),
  });

  const improvementCycleMutation = trpc.admin.createMlImprovementCycle.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.admin.mlDailyReview.invalidate(), utils.admin.summary.invalidate()]);
      toast.success("Ciclo de melhoria aberto para revisão diária.");
    },
    onError: (error) => toast.error(error.message || "Não foi possível abrir o ciclo de melhoria."),
  });

  const ragAuditMutation = trpc.admin.auditDayanRagSearch.useMutation({
    onSuccess: (result) => {
      setLastRagAudit({
        status: result.governance.antiHallucinationStatus,
        sourceCount: result.governance.sourceCount,
        pipelineVersion: result.governance.pipelineVersion,
      });
      toast.success("Busca RAG auditável executada.");
    },
    onError: (error) => toast.error(error.message || "Não foi possível auditar a busca RAG."),
  });

  const data = summary.data;
  const appointmentRows = (appointments.data?.appointments ?? []) as AdminAppointment[];
  const activeProfessionals = useMemo(() => professionals.data?.professionals.filter((item) => item.active).length ?? 0, [professionals.data]);
  const pendingAppointments = useMemo(() => appointmentRows.filter((appointment) => appointment.status === "requested" || appointment.status === "planned").length, [appointmentRows]);
  const professionalOptions = useMemo(() => {
    const names = appointmentRows.map((appointment) => appointment.doctorName ?? "Profissional DOUTORELO").filter(Boolean);
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [appointmentRows]);
  const filteredAppointments = useMemo(() => appointmentRows.filter((appointment) => {
    const doctorName = appointment.doctorName ?? "Profissional DOUTORELO";
    const statusMatches = appointmentStatusFilter === "all" || appointment.status === appointmentStatusFilter;
    const professionalMatches = appointmentProfessionalFilter === "all" || doctorName === appointmentProfessionalFilter;
    const dateMatches = !appointmentDateFilter || appointmentDateKey(appointment.scheduledAt) === appointmentDateFilter;
    return statusMatches && professionalMatches && dateMatches;
  }), [appointmentRows, appointmentStatusFilter, appointmentProfessionalFilter, appointmentDateFilter]);
  const mlMetrics = mlDailyReview.data?.metrics ?? data?.mlDailyReview;
  const mlPendingReview = mlMetrics?.reviewCandidates ?? 0;
  const mlTrainingCandidates = mlMetrics?.trainingExamples ?? 0;
  const mlLowQuality = (mlMetrics?.labelCounts?.unsafe ?? 0) + (mlMetrics?.labelCounts?.generic ?? 0) + (mlMetrics?.labelCounts?.too_long ?? 0) + (mlMetrics?.labelCounts?.not_useful ?? 0);
  const nationalDirectoryTotals = healthDirectorySummary.data?.totals;
  const nationalDirectoryProviders = healthDirectoryProviders.data?.providers ?? [];
  const mlEvents = (mlLearningEvents.data?.events ?? []) as Array<{
    id: number;
    userId?: number | null;
    sessionId?: number | null;
    source?: string | null;
    userInput?: string | null;
    aiResponse?: string | null;
    autoQualityScore?: number | null;
    autoQualityLabel?: string | null;
    humanLabel?: string | null;
    isTrainingCandidate?: boolean | number | null;
    createdAt?: string | number | Date | null;
  }>;
  const mlTotalEvents = mlMetrics?.totalLearningEvents ?? mlEvents.length;
  const reviewMlEvent = (eventId: number, humanLabel: "excellent" | "good" | "generic" | "unsafe" | "too_long" | "not_useful" | "training_candidate" | "rejected", isTrainingCandidate = false) => {
    reviewLearningEvent.mutate({ id: eventId, humanLabel, isTrainingCandidate, reviewerNotes: mlReviewNotes[eventId] ?? null });
  };
  const createTrainingExampleFromEvent = (event: (typeof mlEvents)[number]) => {
    trainingExampleMutation.mutate({
      learningEventId: event.id,
      inputSnapshot: event.userInput ?? `Evento aprendível #${event.id}`,
      expectedOutput: event.aiResponse ?? null,
      critique: mlReviewNotes[event.id] ?? "Exemplo criado a partir da revisão humana do painel diário.",
      status: "review_ready",
      exampleType: "care_journey_review",
    });
  };

  if (!isAdmin) {
    return (
      <div className="relative min-h-[72vh] overflow-hidden rounded-[1.5rem] border border-[#6EC1B4]/20 bg-white/90 p-5 text-slate-950 shadow-2xl shadow-[0_18px_64px_rgba(13,27,45,0.08)] sm:rounded-[2rem] sm:p-8">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-white blur-[90px]" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-white blur-[90px]" />
        <div className="relative mx-auto flex max-w-xl flex-col items-center justify-center pt-20 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] border border-white/80 bg-white text-[#0F1B33] shadow-[0_18px_60px_rgba(6,95,70,0.12)] backdrop-blur-xl">
            <LockKeyhole className="h-9 w-9" />
          </div>
          <Badge className="mb-5 rounded-full bg-white px-4 py-1 text-[#0F1B33] hover:bg-white">Acesso protegido</Badge>
          <h1 className="text-3xl font-semibold tracking-tight font-display sm:text-4xl md:text-5xl">A área administrativa exige papel de administrador.</h1>
          <p className="mt-5 text-sm leading-7 text-slate-600">Aqui ficam profissionais, conteúdos oficiais e governança de agenda. As operações são protegidas por permissão administrativa no servidor.</p>
        </div>
      </div>
    );
  }

  const saveProfessional = () => {
    try {
      professionalMutation.mutate({
        id: professionalForm.id,
        name: professionalForm.name,
        specialty: professionalForm.specialty,
        credentials: professionalForm.credentials,
        approach: professionalForm.approach,
        focus: splitList(professionalForm.focusText),
        availability: splitSlots(professionalForm.availabilityText),
        bio: professionalForm.bio,
        languages: splitList(professionalForm.languagesText),
        consultationModes: splitList(professionalForm.consultationModesText),
        featured: professionalForm.featured,
        active: professionalForm.active,
      });
    } catch {
      toast.error("Revise os horários: use ISO válido, como 2026-05-04T12:00:00.000Z.");
    }
  };

  const saveContent = () => {
    contentMutation.mutate({ ...contentForm });
  };

  const getAppointmentNotesDraft = (appointment: AdminAppointment) => appointmentNotesDrafts[appointment.id] ?? appointment.notes ?? "";
  const saveAppointment = (appointment: AdminAppointment, status = appointment.status) => {
    const notes = getAppointmentNotesDraft(appointment).trim();
    appointmentMutation.mutate({ id: appointment.id, status, notes: notes.length > 0 ? notes : null });
  };

  return (
    <div className="space-y-6 text-slate-950">
      <section className="relative min-w-0 overflow-hidden rounded-[1.5rem] border border-white/80 bg-white p-4 shadow-2xl shadow-[0_18px_64px_rgba(13,27,45,0.08)] sm:rounded-[2rem] sm:p-6 md:p-8">
        <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div className="max-w-4xl">
            <Badge className="mb-4 rounded-full bg-white px-4 py-1 text-[#0F1B33] hover:bg-white">Backoffice DOUTORELO · CRUD real · RBAC ativo</Badge>
            <h1 className="max-w-4xl text-3xl font-semibold tracking-tight font-display sm:text-4xl md:text-6xl">Administre profissionais, agenda e conteúdos oficiais com segurança.</h1>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">As operações abaixo usam procedures administrativas protegidas. Conteúdos com promessa de cura, prescrição ou substituição de consulta são bloqueados no servidor.</p>
          </div>
          <div className="grid w-full min-w-0 gap-3 rounded-[1.5rem] border border-white/80 bg-white/72 p-4 shadow-[0_18px_70px_rgba(6,95,70,0.10)] backdrop-blur-2xl lg:max-w-[20rem] lg:rounded-[2rem]">
            <div className="flex items-center justify-between gap-4"><span className="text-xs uppercase tracking-[0.26em] text-slate-500">governança</span><ShieldCheck className="h-5 w-5 text-[#0F1B33]" /></div>
            <p className="text-3xl font-semibold tracking-tight font-display sm:text-4xl">{data?.activeDoctors ?? activeProfessionals}</p>
            <p className="text-xs leading-5 text-slate-500">profissionais ativos no catálogo autenticado.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Pessoas acompanhadas" value={data?.users ?? 0} icon={UsersRound} description="identidade, consentimento e jornada" />
        <MetricCard label="Profissionais ativos" value={data?.activeDoctors ?? activeProfessionals} icon={Stethoscope} description="rede humana verificável" />
        <MetricCard label="Consultas pendentes" value={data?.appointmentsPending ?? pendingAppointments} icon={CalendarCheck} description="solicitações e horários planejados" />
        <MetricCard label="Eventos ML para revisar" value={mlPendingReview || mlEvents.length} icon={Brain} description="feedback humano e dataset vivo" />
      </div>

      <Card className="border-[#6EC1B4]/20 bg-white/92 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <CardTitle className="flex items-center gap-2"><DatabaseZap className="h-5 w-5 text-[#0F1B33]" /> Diretório Nacional DoutorElo</CardTitle>
              <CardDescription>Fundação nacional aplicada ao banco, sem scraping ou importação massiva nesta entrega. Use a página pública para testar a busca.</CardDescription>
            </div>
            <Button variant="outline" className="rounded-full border-[#6EC1B4]/20 bg-white text-[#0F1B33]" onClick={() => window.location.assign("/diretorio-nacional")}>Abrir busca pública</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-[1.4rem] border border-[#6EC1B4]/20 bg-white p-4"><p className="text-xs uppercase tracking-[0.2em] text-[#0F1B33]">Prestadores</p><p className="mt-2 text-3xl font-semibold font-display">{nationalDirectoryTotals?.providers ?? 0}</p></div>
            <div className="rounded-[1.4rem] border border-[#6EC1B4]/20 bg-white p-4"><p className="text-xs uppercase tracking-[0.2em] text-[#0F1B33]">Ativos</p><p className="mt-2 text-3xl font-semibold font-display">{nationalDirectoryTotals?.activeProviders ?? 0}</p></div>
            <div className="rounded-[1.4rem] border border-[#6EC1B4]/20 bg-white p-4"><p className="text-xs uppercase tracking-[0.2em] text-[#0F1B33]">Verificados</p><p className="mt-2 text-3xl font-semibold font-display">{nationalDirectoryTotals?.verifiedProviders ?? 0}</p></div>
            <div className="rounded-[1.4rem] border border-[#6EC1B4]/20 bg-white p-4"><p className="text-xs uppercase tracking-[0.2em] text-[#0F1B33]">Cidades</p><p className="mt-2 text-3xl font-semibold font-display">{nationalDirectoryTotals?.cities ?? 0}</p></div>
            <div className="rounded-[1.4rem] border border-[#6EC1B4]/20 bg-white p-4"><p className="text-xs uppercase tracking-[0.2em] text-[#0F1B33]">Jobs</p><p className="mt-2 text-3xl font-semibold font-display">{nationalDirectoryTotals?.ingestionJobs ?? 0}</p></div>
          </div>
          {healthDirectorySummary.isLoading ? <Skeleton className="h-24 rounded-3xl" /> : null}
          {!healthDirectorySummary.isLoading && nationalDirectoryProviders.length === 0 ? <div className="rounded-3xl border border-dashed border-[#6EC1B4]/20 bg-white/72 p-5 text-sm leading-6 text-slate-600">A base estrutural está pronta, mas ainda não possui registros piloto. A próxima etapa pode incluir curadoria manual ou importações oficiais autorizadas.</div> : null}
          {nationalDirectoryProviders.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {nationalDirectoryProviders.map((provider) => (
                <article key={provider.id} className="rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-4">
                  <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                    <div><p className="font-semibold text-slate-950">{provider.displayName}</p><p className="text-sm text-slate-600">{provider.primarySpecialty ?? provider.entityType} · {provider.city}-{provider.state}</p></div>
                    <Badge variant="outline" className="w-fit rounded-full bg-white">{provider.verificationStatus}</Badge>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-[#6EC1B4]/20 bg-white/92 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-[#0F1B33]" /> Avaliação diária ML/RAG</CardTitle>
              <CardDescription>Revisão humana dos eventos aprendíveis, exemplos de treino e busca Dayan auditável. A inteligência evolui por curadoria, não por aprendizado invisível.</CardDescription>
            </div>
            <Button className="min-h-11 rounded-full bg-[#0F1B33] text-white hover:bg-[#162240]" disabled={improvementCycleMutation.isPending} onClick={() => improvementCycleMutation.mutate({ triggeredBy: "admin_daily_review_panel", notes: "Ciclo aberto pelo painel de avaliação diária ML/RAG.", status: "open" })}>
              <DatabaseZap className="mr-2 h-4 w-4" /> Abrir ciclo de melhoria
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[1.4rem] border border-[#6EC1B4]/20 bg-white p-4"><p className="text-xs uppercase tracking-[0.2em] text-[#0F1B33]">Pendentes</p><p className="mt-2 text-3xl font-semibold font-display">{mlPendingReview}</p></div>
            <div className="rounded-[1.4rem] border border-[#6EC1B4]/20 bg-white p-4"><p className="text-xs uppercase tracking-[0.2em] text-[#0F1B33]">Exemplos</p><p className="mt-2 text-3xl font-semibold font-display">{mlTrainingCandidates}</p></div>
            <div className="rounded-[1.4rem] border border-amber-100 bg-amber-50/70 p-4"><p className="text-xs uppercase tracking-[0.2em] text-amber-800">Baixa qualidade</p><p className="mt-2 text-3xl font-semibold font-display">{mlLowQuality}</p></div>
            <div className="rounded-[1.4rem] border border-slate-100 bg-slate-50/80 p-4"><p className="text-xs uppercase tracking-[0.2em] text-slate-600">Total vivo</p><p className="mt-2 text-3xl font-semibold font-display">{mlTotalEvents}</p></div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <label className="grid flex-1 gap-1.5 text-sm font-medium text-slate-700">Auditar busca RAG Dayan
                <input value={ragAuditQuery} onChange={(event) => setRagAuditQuery(event.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#6EC1B4]/200 focus:ring-4 focus:ring-[#6EC1B4]/25" placeholder="Tema, pergunta ou hipótese a recuperar com fontes" />
              </label>
              <Button variant="outline" className="min-h-11 rounded-full border-[#6EC1B4]/20 bg-white text-[#0F1B33]" disabled={ragAuditMutation.isPending || ragAuditQuery.trim().length < 2} onClick={() => ragAuditMutation.mutate({ query: ragAuditQuery, limit: 8 })}>
                <Search className="mr-2 h-4 w-4" /> Auditar grounding
              </Button>
            </div>
            {lastRagAudit ? <p className="mt-3 text-xs leading-5 text-slate-600">Última auditoria: <span className="font-semibold text-slate-950">{lastRagAudit.status}</span>, {lastRagAudit.sourceCount} fontes, pipeline {lastRagAudit.pipelineVersion}.</p> : null}
          </div>

          {mlLearningEvents.isLoading ? <Skeleton className="h-36 rounded-3xl" /> : null}
          {!mlLearningEvents.isLoading && mlEvents.length === 0 ? <div className="rounded-3xl border border-dashed border-[#6EC1B4]/20 bg-white/72 p-5 text-sm leading-6 text-slate-600">Ainda não há eventos aprendíveis para revisar. Eles aparecerão quando a jornada de cuidado registrar interações auditáveis.</div> : null}
          <div className="grid gap-3">
            {mlEvents.map((event) => (
              <article key={event.id} className="rounded-[1.6rem] border border-slate-100 bg-white p-4 shadow-sm">
                <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2"><span className="font-semibold text-slate-950">Evento #{event.id}</span><Badge variant="outline" className="rounded-full border-[#6EC1B4]/20 bg-white text-[#0F1B33]">{event.autoQualityLabel ?? "sem rótulo"}</Badge>{event.isTrainingCandidate ? <Badge className="rounded-full bg-white text-[#0F1B33] hover:bg-white">candidato a treino</Badge> : null}</div>
                    <p className="text-xs text-slate-500">usuário #{event.userId ?? "—"} · sessão #{event.sessionId ?? "—"} · score {event.autoQualityScore ?? "—"} · {formatAppointmentDate(event.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" className="rounded-full bg-white" disabled={reviewLearningEvent.isPending} onClick={() => reviewMlEvent(event.id, "good")}>Aprovar</Button>
                    <Button size="sm" variant="outline" className="rounded-full bg-white" disabled={reviewLearningEvent.isPending} onClick={() => reviewMlEvent(event.id, "training_candidate", true)}>Marcar treino</Button>
                    <Button size="sm" variant="outline" className="rounded-full border-red-200 bg-white text-red-700" disabled={reviewLearningEvent.isPending} onClick={() => reviewMlEvent(event.id, "rejected")}>Rejeitar</Button>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-sm leading-6 text-slate-700"><span className="font-medium text-slate-950">Entrada: </span>{event.userInput ?? "Sem entrada textual registrada."}</div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-sm leading-6 text-slate-700"><span className="font-medium text-slate-950">Resposta: </span>{event.aiResponse ?? "Sem resposta registrada."}</div>
                </div>
                <label className="mt-3 grid gap-1.5 text-sm font-medium text-slate-700">Nota da revisão humana
                  <Textarea value={mlReviewNotes[event.id] ?? ""} onChange={(change) => setMlReviewNotes((current) => ({ ...current, [event.id]: change.target.value }))} className="min-h-20 rounded-2xl bg-white" placeholder="Registre por que aprovar, rejeitar ou transformar em exemplo de treino." />
                </label>
                <div className="mt-3 flex justify-end"><Button variant="outline" className="rounded-full border-[#6EC1B4]/20 bg-white text-[#0F1B33]" disabled={trainingExampleMutation.isPending} onClick={() => createTrainingExampleFromEvent(event)}>Criar exemplo de treino</Button></div>
              </article>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#6EC1B4]/20 bg-white/92 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div>
              <CardTitle className="flex items-center gap-2"><CalendarCheck className="h-5 w-5 text-[#0F1B33]" /> Consultas</CardTitle>
              <CardDescription>Filtre a operação por status, data e profissional. Observações internas organizam continuidade, sem orientar conduta clínica.</CardDescription>
            </div>
            <Badge variant="outline" className="w-fit rounded-full border-[#6EC1B4]/20 bg-white px-3 py-1 text-[#0F1B33]">{filteredAppointments.length} de {appointmentRows.length} registros</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid min-w-0 gap-3 rounded-[1.5rem] border border-[#6EC1B4]/20 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">Status
              <select value={appointmentStatusFilter} onChange={(event) => setAppointmentStatusFilter(event.target.value as AppointmentStatusFilter)} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#6EC1B4]/200 focus:ring-4 focus:ring-[#6EC1B4]/25">
                <option value="all">Todos</option>
                {appointmentStatuses.map((status) => <option key={status} value={status}>{appointmentStatusLabels[status].label}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">Data
              <input type="date" value={appointmentDateFilter} onChange={(event) => setAppointmentDateFilter(event.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#6EC1B4]/200 focus:ring-4 focus:ring-[#6EC1B4]/25" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">Profissional
              <select value={appointmentProfessionalFilter} onChange={(event) => setAppointmentProfessionalFilter(event.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#6EC1B4]/200 focus:ring-4 focus:ring-[#6EC1B4]/25">
                <option value="all">Todos</option>
                {professionalOptions.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <div className="flex items-end">
              <Button variant="outline" className="min-h-11 w-full rounded-full border-[#6EC1B4]/20 bg-white text-[#0F1B33]" onClick={() => { setAppointmentStatusFilter("all"); setAppointmentProfessionalFilter("all"); setAppointmentDateFilter(""); }}>Limpar filtros</Button>
            </div>
          </div>

          {appointments.isLoading ? <Skeleton className="h-40 rounded-3xl" /> : null}
          {!appointments.isLoading && filteredAppointments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-[#6EC1B4]/20 bg-white/72 p-5 text-sm leading-6 text-slate-600">Nenhuma consulta encontrada com os filtros atuais.</div>
          ) : null}
          <div className="grid gap-3">
            {filteredAppointments.map((appointment) => {
              const notesDraft = getAppointmentNotesDraft(appointment);
              return (
                <article key={appointment.id} className="rounded-[1.6rem] border border-slate-100 bg-slate-50/80 p-4">
                  <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-950">#{appointment.id} · {appointment.doctorName ?? "Profissional DOUTORELO"}</span>
                        {appointmentStatusBadge(appointment.status)}
                      </div>
                      <div className="text-sm text-[#0F1B33]">{appointment.specialty ?? "Cuidado funcional"} · usuário #{appointment.userId}</div>
                      <div className="text-xs text-slate-500">{formatAppointmentDate(appointment.scheduledAt)} · criado em {formatAppointmentDate(appointment.createdAt)}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {appointmentStatuses.map((status) => (
                        <Button key={status} size="sm" variant="outline" disabled={appointmentMutation.isPending || appointment.status === status} className="min-h-10 rounded-full bg-white" onClick={() => saveAppointment(appointment, status)}>{appointmentStatusLabels[status].label}</Button>
                      ))}
                    </div>
                  </div>
                  {appointment.reason ? <div className="mt-3 rounded-2xl border border-white bg-white/80 p-3 text-sm leading-6 text-slate-700"><span className="font-medium text-slate-950">Motivo informado pelo paciente: </span>{appointment.reason}</div> : null}
                  <label className="mt-3 grid gap-1.5 text-sm font-medium text-slate-700">Observações operacionais internas
                    <Textarea value={notesDraft} onChange={(event) => setAppointmentNotesDrafts((current) => ({ ...current, [appointment.id]: event.target.value }))} className="min-h-20 rounded-2xl bg-white" placeholder="Ex.: confirmar documentação, alinhar canal de contato ou registrar contexto administrativo sem orientação clínica." />
                  </label>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="max-w-2xl text-xs leading-5 text-slate-500">As observações devem apoiar operação e continuidade. Evite diagnóstico, prescrição ou promessas de resultado.</p>
                    <Button className="min-h-11 rounded-full bg-[#0F1B33] text-white hover:bg-[#162240]" disabled={appointmentMutation.isPending} onClick={() => saveAppointment(appointment)}><CheckCircle2 className="mr-2 h-4 w-4" /> Salvar observação</Button>
                  </div>
                </article>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <section className="grid min-w-0 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="border-[#6EC1B4]/20 bg-white/92 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div><CardTitle className="flex items-center gap-2"><Stethoscope className="h-5 w-5 text-[#0F1B33]" /> Profissionais</CardTitle><CardDescription>Crie, edite, destaque ou arquive perfis e horários de atendimento.</CardDescription></div>
              <Button variant="outline" className="rounded-full" onClick={() => { setProfessionalForm(blankProfessional()); setEditingProfessionalId(null); }}><Plus className="mr-2 h-4 w-4" /> Novo</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {professionals.isLoading ? <Skeleton className="h-32 rounded-3xl" /> : null}
            <div className="grid gap-3">
              {(professionals.data?.professionals ?? []).map((professional) => (
                <div key={professional.id} className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div><div className="font-semibold text-slate-950">{professional.name}</div><div className="text-sm text-[#0F1B33]">{professional.specialty}</div><div className="mt-1 text-xs text-slate-500">{professional.availability.length} horários · {professional.active ? "ativo" : "arquivado"} · {professional.featured ? "destaque" : "regular"}</div></div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => { setEditingProfessionalId(professional.id); setProfessionalForm({ id: professional.id, name: professional.name, specialty: professional.specialty, credentials: professional.credentials, approach: professional.approach, focusText: professional.focus.join(", "), availabilityText: professional.availability.join("\n"), bio: professional.bio, languagesText: professional.languages.join(", "), consultationModesText: professional.consultationModes.join(", "), featured: professional.featured, active: professional.active }); }}><Edit3 className="mr-2 h-3.5 w-3.5" /> Editar</Button>
                      <Button size="sm" variant="outline" className="rounded-full border-red-200 text-red-700" onClick={() => window.confirm("Arquivar este profissional e removê-lo do catálogo público?") && professionalDelete.mutate({ id: professional.id })}><Trash2 className="mr-2 h-3.5 w-3.5" /> Arquivar</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Separator />
            <ProfessionalForm form={professionalForm} setForm={setProfessionalForm} isEditing={Boolean(editingProfessionalId)} isPending={professionalMutation.isPending} onSubmit={saveProfessional} />
          </CardContent>
        </Card>

        <Card className="border-[#6EC1B4]/20 bg-white/92 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-[#0F1B33]" /> Conteúdos oficiais</CardTitle><CardDescription>Gerencie materiais educativos com linguagem segura e status de publicação.</CardDescription></div>
              <Button variant="outline" className="rounded-full" onClick={() => { setContentForm(blankContent()); setEditingContentId(null); }}><Plus className="mr-2 h-4 w-4" /> Novo</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {contents.isLoading ? <Skeleton className="h-32 rounded-3xl" /> : null}
            <div className="grid gap-3">
              {(contents.data?.contents ?? []).map((content) => (
                <div key={content.id} className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                    <div><div className="font-semibold text-slate-950">{content.title}</div><div className="text-sm text-[#0F1B33]">{content.category}</div><div className="mt-1 text-xs text-slate-500">{content.status === "published" ? "publicado" : "rascunho"}</div></div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => { setEditingContentId(content.id); setContentForm({ id: content.id, title: content.title, category: content.category, summary: content.summary, body: content.body, status: content.status, safeLanguageNotice: content.safeLanguageNotice }); }}><Edit3 className="mr-2 h-3.5 w-3.5" /> Editar</Button>
                      <Button size="sm" variant="outline" className="rounded-full border-red-200 text-red-700" onClick={() => window.confirm("Mover este conteúdo para rascunho?") && contentDelete.mutate({ id: content.id })}><Trash2 className="mr-2 h-3.5 w-3.5" /> Rascunho</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Separator />
            <ContentForm form={contentForm} setForm={setContentForm} isEditing={Boolean(editingContentId)} isPending={contentMutation.isPending} onSubmit={saveContent} />
          </CardContent>
        </Card>
      </section>

      <Card className="border-amber-100 bg-amber-50/70 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-950"><AlertTriangle className="h-5 w-5" /> Régua editorial obrigatória</CardTitle>
          <CardDescription className="text-amber-900">Conteúdos oficiais e observações operacionais devem preparar perguntas e organizar contexto, nunca prometer cura, diagnóstico, tratamento garantido ou conduta individual.</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, disabled = false }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      <input disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#6EC1B4]/200 focus:ring-4 focus:ring-[#6EC1B4]/25 disabled:bg-slate-100" />
    </label>
  );
}

function ProfessionalForm({ form, setForm, isEditing, isPending, onSubmit }: { form: ProfessionalFormState; setForm: React.Dispatch<React.SetStateAction<ProfessionalFormState>>; isEditing: boolean; isPending: boolean; onSubmit: () => void }) {
  const disabled = isPending;
  return (
    <div className="space-y-4 rounded-[1.6rem] border border-[#6EC1B4]/20 bg-white p-4">
      <div><h3 className="font-semibold">{isEditing ? "Editar profissional" : "Criar profissional"}</h3><p className="text-xs text-slate-600">Use listas separadas por vírgula ou linha. Horários devem estar em ISO.</p></div>
      <div className="grid gap-3 md:grid-cols-2"><Field label="ID" value={form.id} disabled={isEditing || disabled} onChange={(id) => setForm((current) => ({ ...current, id }))} /><Field label="Nome" value={form.name} onChange={(name) => setForm((current) => ({ ...current, name }))} /><Field label="Especialidade" value={form.specialty} onChange={(specialty) => setForm((current) => ({ ...current, specialty }))} /><Field label="Credenciais" value={form.credentials} onChange={(credentials) => setForm((current) => ({ ...current, credentials }))} /></div>
      <Field label="Abordagem" value={form.approach} onChange={(approach) => setForm((current) => ({ ...current, approach }))} />
      <label className="grid gap-1.5 text-sm font-medium text-slate-700">Bio<Textarea value={form.bio} onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))} className="min-h-24 rounded-2xl bg-white" /></label>
      <div className="grid gap-3 md:grid-cols-2"><Field label="Focos" value={form.focusText} onChange={(focusText) => setForm((current) => ({ ...current, focusText }))} placeholder="sono, energia, rotina" /><Field label="Idiomas" value={form.languagesText} onChange={(languagesText) => setForm((current) => ({ ...current, languagesText }))} /><Field label="Modalidades" value={form.consultationModesText} onChange={(consultationModesText) => setForm((current) => ({ ...current, consultationModesText }))} /></div>
      <label className="grid gap-1.5 text-sm font-medium text-slate-700">Slots ISO<Textarea value={form.availabilityText} onChange={(event) => setForm((current) => ({ ...current, availabilityText: event.target.value }))} className="min-h-24 rounded-2xl bg-white font-mono text-xs" /></label>
      <div className="flex flex-wrap gap-4 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(event) => setForm((current) => ({ ...current, featured: event.target.checked }))} /> Destaque</label><label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} /> Ativo</label></div>
      <Button className="rounded-full bg-[#0F1B33] text-white hover:bg-[#162240]" disabled={disabled} onClick={onSubmit}><CheckCircle2 className="mr-2 h-4 w-4" /> {isEditing ? "Salvar alterações" : "Criar profissional"}</Button>
    </div>
  );
}

function ContentForm({ form, setForm, isEditing, isPending, onSubmit }: { form: ContentFormState; setForm: React.Dispatch<React.SetStateAction<ContentFormState>>; isEditing: boolean; isPending: boolean; onSubmit: () => void }) {
  return (
    <div className="space-y-4 rounded-[1.6rem] border border-[#6EC1B4]/20 bg-white p-4">
      <div><h3 className="font-semibold">{isEditing ? "Editar conteúdo" : "Criar conteúdo"}</h3><p className="text-xs text-slate-600">O servidor bloqueia linguagem prescritiva ou promessas clínicas fortes.</p></div>
      <div className="grid gap-3 md:grid-cols-2"><Field label="ID" value={form.id} disabled={isEditing || isPending} onChange={(id) => setForm((current) => ({ ...current, id }))} /><Field label="Título" value={form.title} onChange={(title) => setForm((current) => ({ ...current, title }))} /><Field label="Categoria" value={form.category} onChange={(category) => setForm((current) => ({ ...current, category }))} /></div>
      <label className="grid gap-1.5 text-sm font-medium text-slate-700">Resumo<Textarea value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} className="min-h-20 rounded-2xl bg-white" /></label>
      <label className="grid gap-1.5 text-sm font-medium text-slate-700">Corpo educativo<Textarea value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} className="min-h-32 rounded-2xl bg-white" /></label>
      <Field label="Aviso de linguagem segura" value={form.safeLanguageNotice} onChange={(safeLanguageNotice) => setForm((current) => ({ ...current, safeLanguageNotice }))} />
      <label className="grid gap-1.5 text-sm font-medium text-slate-700">Status<select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ContentFormState["status"] }))} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-[#6EC1B4]/200 focus:ring-4 focus:ring-[#6EC1B4]/25"><option value="draft">Rascunho</option><option value="published">Publicado</option></select></label>
      <Button className="rounded-full bg-[#0F1B33] text-white hover:bg-[#162240]" disabled={isPending} onClick={onSubmit}><CheckCircle2 className="mr-2 h-4 w-4" /> {isEditing ? "Salvar alterações" : "Criar conteúdo"}</Button>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, description }: { label: string; value: number; icon: LucideIcon; description: string }) {
  return (
    <Card className="overflow-hidden border-[#6EC1B4]/20 bg-white/90 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
      <CardContent className="relative flex items-center justify-between p-5">
        <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white blur-2xl" />
        <div className="relative"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-3xl font-semibold tracking-tight font-display sm:text-4xl">{value}</p><p className="mt-1 text-xs text-slate-500">{description}</p></div>
        <div className="relative flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-white text-[#0F1B33] shadow-inner"><Icon className="h-6 w-6" /></div>
      </CardContent>
    </Card>
  );
}

import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { ArrowRight, CalendarCheck2, Clock3, FileText, HeartPulse, History, RefreshCw, ShieldAlert, Stethoscope, Wifi } from "lucide-react";
import { useLocation } from "wouter";

type AppointmentLike = {
  id: string | number;
  doctorName?: string | null;
  specialty?: string | null;
  reason?: string | null;
  notes?: string | null;
  status?: string | null;
  scheduledAt?: string | number | Date | null;
  createdAt?: string | number | Date | null;
};

const statusLabels: Record<string, { label: string; className: string }> = {
  requested: { label: "Solicitada", className: "border-amber-200 bg-amber-50 text-amber-800" },
  planned: { label: "Planejada", className: "border-[#6EC1B4]/20 bg-white text-[#0F1B33]" },
  scheduled: { label: "Agendada", className: "border-[#6EC1B4]/20 bg-white text-[#0F1B33]" },
  confirmed: { label: "Confirmada", className: "border-[#6EC1B4]/20 bg-white text-[#0F1B33]" },
  completed: { label: "Concluída", className: "border-slate-200 bg-slate-50 text-slate-700" },
  cancelled: { label: "Cancelada", className: "border-red-200 bg-red-50 text-red-700" },
};

function formatDateTime(value: AppointmentLike["scheduledAt"]) {
  if (!value) return "Horário a confirmar";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Horário a confirmar";
  return date.toLocaleString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadge(status?: string | null) {
  const config = statusLabels[status ?? "requested"] ?? statusLabels.requested;
  return <Badge variant="outline" className={`rounded-full px-3 py-1 ${config.className}`}>{config.label}</Badge>;
}

function AppointmentCard({ appointment, compact = false }: { appointment: AppointmentLike; compact?: boolean }) {
  return (
    <article className="rounded-[1.75rem] border border-white/80 bg-white/88 p-4 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-base font-semibold text-[#0F1B33]">{appointment.doctorName ?? "Profissional DOUTORELO"}</p>
          <p className="text-sm text-slate-600">{appointment.specialty ?? "Cuidado funcional"}</p>
        </div>
        {statusBadge(appointment.status)}
      </div>
      <div className="mt-4 grid gap-3 text-sm text-slate-700">
        <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-[#0F1B33]">
          <Clock3 className="h-4 w-4 shrink-0" />
          <span>{formatDateTime(appointment.scheduledAt)}</span>
        </div>
        {!compact && appointment.reason ? (
          <div className="rounded-2xl border border-slate-100 bg-white/70 px-3 py-2 leading-6">
            <span className="font-medium text-slate-950">Motivo informado: </span>{appointment.reason}
          </div>
        ) : null}
        {!compact && appointment.notes ? (
          <div className="rounded-2xl border border-[#6EC1B4]/20 bg-white px-3 py-2 leading-6 text-[#0F1B33]">
            {appointment.notes}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function ConsultationsSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-48 rounded-[2rem]" />
      <Skeleton className="h-64 rounded-[2rem]" />
      <Skeleton className="h-40 rounded-[2rem]" />
    </div>
  );
}

export default function Consultations() {
  const [, setLocation] = useLocation();
  const { data, isLoading, isFetching, error, refetch } = trpc.appointments.mine.useQuery();
  const upcoming = (data?.upcoming ?? []) as AppointmentLike[];
  const history = (data?.history ?? []) as AppointmentLike[];
  const preparation = data?.preparation ?? [];
  const nextAppointment = upcoming[0];

  return (
    <DashboardLayout>
      <div className="min-h-dvh overflow-x-clip rounded-[1.25rem] bg-white p-3 text-slate-950 sm:p-5 md:rounded-[2rem] md:p-8">
        {isLoading ? <ConsultationsSkeleton /> : null}
        {error ? (
          <Card className="border-red-100 bg-white/90 shadow-xl shadow-red-900/5">
            <CardHeader className="gap-4">
              <CardTitle>Não foi possível carregar suas consultas</CardTitle>
              <CardDescription>Verifique sua conexão e tente novamente. Em urgências, procure atendimento presencial imediatamente.</CardDescription>
              <Button variant="outline" className="min-h-12 w-full rounded-full border-red-200 bg-white text-red-700 sm:w-fit" onClick={() => refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" /> Tentar novamente
              </Button>
            </CardHeader>
          </Card>
        ) : null}
        {data ? (
          <div className="mx-auto max-w-6xl space-y-6">
            <section className="rounded-[2rem] border border-[#6EC1B4]/20 bg-white/82 p-3 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)] backdrop-blur sm:p-4">
              <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
                <div className="flex min-h-12 items-center gap-2 rounded-2xl bg-white px-3 py-2 text-[#0F1B33]"><Wifi className="h-4 w-4" /> {isFetching ? "Sincronizando agenda" : "Agenda atualizada"}</div>
                <div className="flex min-h-12 items-center rounded-2xl bg-white px-3 py-2">{upcoming.length} consulta(s) ativa(s)</div>
                <div className="flex min-h-12 items-center rounded-2xl bg-white px-3 py-2">{history.length} registro(s) no histórico</div>
              </div>
            </section>

            <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <Card className="overflow-hidden border-white/80 bg-white/90 shadow-2xl shadow-[0_18px_64px_rgba(13,27,45,0.08)] backdrop-blur">
                <CardHeader className="space-y-4 p-5 sm:p-7">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full bg-white px-3 py-1 text-[#0F1B33] hover:bg-white">Consultas</Badge>
                    <Badge variant="outline" className="rounded-full border-[#6EC1B4]/20 bg-white/70 px-3 py-1 text-[#0F1B33]">App-first iOS/Android</Badge>
                  </div>
                  <div className="space-y-3">
                    <CardTitle className="text-3xl font-semibold tracking-tight text-[#0F1B33] font-display sm:text-4xl">Sua agenda de cuidado, pronta para o dia a dia.</CardTitle>
                    <CardDescription className="text-base leading-7 text-slate-600">
                      Veja próximos horários, histórico e preparo antes de conversar com profissionais. A IA ajuda a organizar contexto, mas não substitui avaliação clínica.
                    </CardDescription>
                  </div>
                  <div className="grid gap-2 sm:flex sm:flex-wrap">
                    <Button className="min-h-[3.25rem] touch-manipulation rounded-full bg-[#0F1B33] px-5 text-white hover:bg-[#162240]" onClick={() => setLocation("/profissionais")}>Agendar com profissional <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    <Button variant="outline" className="min-h-[3.25rem] touch-manipulation rounded-full border-[#6EC1B4]/20 bg-white px-5 text-[#0F1B33]" onClick={() => setLocation("/memoria")}>Atualizar memória clínica</Button>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-slate-950/90 bg-slate-950 text-white shadow-2xl shadow-slate-950/16">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-[#0F1B33]" /> Limites e segurança</CardTitle>
                  <CardDescription className="text-slate-300">Use esta área para organização de cuidado. Sintomas agudos, piora importante ou sinais de alerta exigem atendimento imediato.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-6 text-slate-200">
                  <div className="rounded-3xl border border-white/10 bg-white/6 p-4">Status e observações ajudam a manter continuidade, não constituem diagnóstico ou prescrição.</div>
                  <div className="rounded-3xl border border-[#6EC1B4]/20 bg-white p-4">Recomendações futuras de produtos e serviços deverão ser transparentes, rastreáveis e baseadas em consentimento.</div>
                </CardContent>
              </Card>
            </section>

            <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <Card className="border-white/80 bg-white/90 shadow-2xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CalendarCheck2 className="h-5 w-5 text-[#0F1B33]" /> Próxima consulta</CardTitle>
                  <CardDescription>Acesso rápido para a consulta mais próxima.</CardDescription>
                </CardHeader>
                <CardContent>
                  {nextAppointment ? <AppointmentCard appointment={nextAppointment} /> : (
                    <div className="rounded-[1.75rem] border border-dashed border-[#6EC1B4]/20 bg-white/72 p-5 text-sm leading-6 text-slate-600">
                      Você ainda não possui consulta futura confirmada. Escolha um profissional para solicitar um horário disponível.
                      <Button className="mt-4 min-h-[3.25rem] w-full touch-manipulation rounded-full bg-[#0F1B33] text-white hover:bg-[#162240]" onClick={() => setLocation("/profissionais")}>Ver profissionais</Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-white/80 bg-white/90 shadow-2xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-[#0F1B33]" /> Preparo para consulta</CardTitle>
                  <CardDescription>Checklist simples para chegar com contexto organizado.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {preparation.map((item, index) => (
                    <div key={item} className="flex gap-3 rounded-3xl border border-[#6EC1B4]/20 bg-white p-4 text-sm leading-6 text-[#0F1B33]">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#0F1B33]">{index + 1}</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <Card className="border-white/80 bg-white/90 shadow-2xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Stethoscope className="h-5 w-5 text-[#0F1B33]" /> Próximos agendamentos</CardTitle>
                  <CardDescription>{upcoming.length} registro(s) ativo(s).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcoming.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-[#6EC1B4]/20 bg-white/72 p-5 text-sm text-slate-600">Solicitações e horários agendados aparecerão aqui.</div>
                  ) : upcoming.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} />)}
                </CardContent>
              </Card>

              <Card className="border-white/80 bg-white/90 shadow-2xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><History className="h-5 w-5 text-slate-600" /> Histórico</CardTitle>
                  <CardDescription>Registros anteriores ou encerrados preservados para continuidade.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {history.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-200 bg-white/72 p-5 text-sm text-slate-600">Seu histórico de consultas será formado conforme você usa o DOUTORELO.</div>
                  ) : history.map((appointment) => <AppointmentCard key={appointment.id} appointment={appointment} compact />)}
                </CardContent>
              </Card>
            </section>

            <div className="fixed inset-x-3 bottom-[calc(7.5rem+env(safe-area-inset-bottom))] z-40 sm:hidden">
              <Button className="min-h-[3.35rem] w-full rounded-full bg-[#0F1B33] text-white shadow-2xl shadow-[0_18px_64px_rgba(13,27,45,0.08)] hover:bg-[#162240]" onClick={() => setLocation("/profissionais")}>Agendar cuidado <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

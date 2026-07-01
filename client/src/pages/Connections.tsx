import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Activity, CalendarClock, CheckCircle2, DatabaseZap, HeartPulse, LockKeyhole, Smartphone, Watch } from "lucide-react";
import { toast } from "sonner";

const healthStack = [
  { title: "Apple Health", subtitle: "HealthKit no app iOS nativo", icon: HeartPulse },
  { title: "Apple Watch", subtitle: "sono, batimentos, treino e sinais contínuos", icon: Watch },
  { title: "Android Health Connect", subtitle: "camada universal moderna do Android", icon: Smartphone },
  { title: "Wearables Android", subtitle: "relógios, pulseiras e sensores parceiros", icon: Activity },
];

const calendarStack = [
  { title: "Google Calendar", subtitle: "sincronização bidirecional futura" },
  { title: "Apple Calendar", subtitle: "eventos iOS e macOS via app nativo" },
  { title: "Outlook Calendar", subtitle: "agenda Microsoft 365 e corporativa" },
];

function StatusPill({ connected }: { connected: boolean }) {
  return connected ? (
    <Badge className="rounded-full bg-white text-[#0F1B33] hover:bg-white">pronto no modelo</Badge>
  ) : (
    <Badge variant="outline" className="rounded-full border-amber-200 bg-amber-50 text-amber-800">aguardando conexão real</Badge>
  );
}

export default function Connections() {
  const { data, isLoading } = trpc.integrations.overview.useQuery();
  const registerHealth = trpc.integrations.registerHealthConnection.useMutation({
    onSuccess: () => toast.success("Conector de saúde registrado no núcleo longitudinal."),
    onError: (error) => toast.error(error.message),
  });
  const registerCalendar = trpc.integrations.registerCalendarConnection.useMutation({
    onSuccess: () => toast.success("Conector de calendário registrado para sincronização futura."),
    onError: (error) => toast.error(error.message),
  });

  return (
    <DashboardLayout>
      <div className="min-h-full rounded-[2rem] bg-white p-4 sm:p-6">
        <section className="mx-auto flex max-w-7xl min-w-0 flex-col gap-4 sm:gap-6">
          <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <Card className="overflow-hidden rounded-[2rem] border-[#6EC1B4]/20 bg-white/90 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
              <CardHeader className="space-y-4 p-6 sm:p-8">
                <Badge className="w-fit rounded-full bg-white px-3 py-1 text-[#0F1B33] hover:bg-white">Arquitetura universal de conexões</Badge>
                <div className="space-y-3">
                  <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-[#0F1B33] sm:text-5xl">
                    Núcleo clínico longitudinal preparado para iOS, Android, wearables e calendários.
                  </h1>
                  <p className="max-w-3xl text-base leading-7 text-[#0F1B33] sm:text-lg">
                    Esta central transforma o DOUTORELO em uma plataforma app-first: cada dado futuro do Apple Health, Apple Watch, Health Connect, wearables Android e agendas externas entra por uma camada de consentimento, origem, rastreabilidade e limite clínico claro.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 px-6 pb-6 sm:grid-cols-3 sm:px-8 sm:pb-8">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-2xl font-semibold text-[#0F1B33]">{data?.readiness.deviceReadiness.connectedCount ?? 0}</p>
                  <p className="text-sm text-[#0F1B33]">fontes de saúde conectadas</p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-2xl font-semibold text-[#0F1B33]">{data?.readiness.calendarReadiness.connectedCount ?? 0}</p>
                  <p className="text-sm text-[#0F1B33]">calendários conectados</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-2xl font-semibold text-[#0F1B33]">v1</p>
                  <p className="text-sm text-[#0F1B33]">contratos universais ativos</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-[#6EC1B4]/20 bg-[#0F1B33] text-white shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><LockKeyhole className="h-5 w-5" /> Governança clínica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-6 text-[#0F1B33]">
                <p>{data?.governance.clinicalBoundary ?? "Carregando limites clínicos de segurança..."}</p>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="font-semibold text-white">Consentimento granular e revogável</p>
                  <p className="mt-1 text-[#0F1B33]">Cada fonte guarda permissões, finalidade, status e snapshot de consentimento. O dado é longitudinal, mas o controle continua com o paciente.</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="font-semibold text-white">Pronto para app nativo</p>
                  <p className="mt-1 text-[#0F1B33]">O web app já possui as pontas de backend que o futuro app iOS/Android poderá chamar após autorização do dispositivo.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid min-w-0 gap-4 xl:grid-cols-2">
            <Card className="rounded-[2rem] border-[#6EC1B4]/20 bg-white/92 shadow-lg shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#0F1B33]"><DatabaseZap className="h-5 w-5 text-[#0F1B33]" /> Saúde, devices e wearables</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {healthStack.map((item) => (
                  <div key={item.title} className="flex items-center justify-between gap-3 rounded-2xl border border-[#6EC1B4]/20 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-white p-3 text-[#0F1B33] shadow-sm"><item.icon className="h-5 w-5" /></div>
                      <div>
                        <p className="font-semibold text-[#0F1B33]">{item.title}</p>
                        <p className="text-sm text-[#0F1B33]">{item.subtitle}</p>
                      </div>
                    </div>
                    <StatusPill connected={false} />
                  </div>
                ))}
                <Button
                  className="w-full rounded-2xl bg-[#0F1B33] text-white hover:bg-[#162240]"
                  disabled={registerHealth.isPending || isLoading}
                  onClick={() => registerHealth.mutate({
                    provider: "manual_entry",
                    displayName: "Entrada manual longitudinal",
                    status: "connected",
                    permissions: { metrics: ["symptom_score", "energy_score", "sleep_quality"], mode: "manual_dev" },
                    consentSnapshot: { purpose: "device_sync", version: "doutorelo-universal-connectors-v1" },
                  })}
                >
                  Registrar fonte manual segura
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-[#6EC1B4]/20 bg-white/92 shadow-lg shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#0F1B33]"><CalendarClock className="h-5 w-5 text-[#0F1B33]" /> Agendas externas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {calendarStack.map((item) => (
                  <div key={item.title} className="flex items-center justify-between gap-3 rounded-2xl border border-[#6EC1B4]/20 bg-white p-4">
                    <div>
                      <p className="font-semibold text-[#0F1B33]">{item.title}</p>
                      <p className="text-sm text-[#0F1B33]">{item.subtitle}</p>
                    </div>
                    <StatusPill connected={false} />
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full rounded-2xl border-[#6EC1B4]/20 bg-white text-[#0F1B33] hover:bg-white"
                  disabled={registerCalendar.isPending || isLoading}
                  onClick={() => registerCalendar.mutate({
                    provider: "manual",
                    displayName: "Agenda DOUTORELO interna",
                    status: "connected",
                    permissions: { appointments: ["read", "prepare", "sync_queue"], mode: "manual_dev" },
                    consentSnapshot: { purpose: "calendar_sync", version: "doutorelo-calendar-connectors-v1" },
                  })}
                >
                  Registrar agenda interna como base
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-[2rem] border-[#6EC1B4]/20 bg-white/92 shadow-lg shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0F1B33]"><CheckCircle2 className="h-5 w-5 text-[#0F1B33]" /> O que já fica construído nesta etapa</CardTitle>
            </CardHeader>
            <CardContent className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-4"><p className="font-semibold text-[#0F1B33]">Contratos de origem</p><p className="mt-1 text-sm text-muted-foreground">Toda métrica sabe de onde veio, qual dispositivo enviou, quando foi medida e sob qual consentimento.</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="font-semibold text-[#0F1B33]">Plano longitudinal</p><p className="mt-1 text-sm text-muted-foreground">Itens de plano de cuidado são ligados a consulta, mapa de clareza, métrica-alvo e limites de segurança.</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><p className="font-semibold text-[#0F1B33]">Calendário universal</p><p className="mt-1 text-sm text-muted-foreground">Consultas passam a ter estrutura para sync, conflito, evento externo e revogação de provedores.</p></div>
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}

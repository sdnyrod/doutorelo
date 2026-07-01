import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Activity, ArrowRight, Brain, CalendarCheck, FileText, HeartPulse, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { useLocation } from "wouter";

function formatDate(value: unknown) {
  if (!value) return "Sem data";
  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return "Sem data";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-52 rounded-[2rem]" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
      </div>
      <Skeleton className="h-80 rounded-[2rem]" />
    </div>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data, isLoading, error } = trpc.dashboard.overview.useQuery();

  const evolution = data?.evolution;
  const profileCompleteness = evolution?.profileCompleteness ?? 0;
  const hasAttention = (evolution?.openAttentionCount ?? 0) > 0;

  return (
    <DashboardLayout>
      <div className="min-h-dvh overflow-x-clip rounded-[1.25rem] bg-white p-3 text-slate-950 sm:p-4 md:rounded-[2rem] md:p-8">
        {isLoading ? <DashboardSkeleton /> : null}
        {error ? (
          <Card className="border-red-100 bg-white/90 shadow-xl shadow-red-900/5">
            <CardHeader>
              <CardTitle>Não foi possível carregar seu painel agora</CardTitle>
              <CardDescription>Atualize a página ou tente novamente em instantes.</CardDescription>
            </CardHeader>
          </Card>
        ) : null}
        {data ? (
          <div className="space-y-8">
            <section className="grid min-w-0 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              <Card className="overflow-hidden border-white/80 bg-white/90 shadow-2xl shadow-[0_18px_64px_rgba(13,27,45,0.08)] backdrop-blur">
                <CardHeader className="space-y-5 p-5 sm:p-6 md:p-8">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="rounded-full bg-white px-4 py-1 text-[#0F1B33] hover:bg-white">Área do paciente</Badge>
                    <Badge variant="outline" className="rounded-full border-[#6EC1B4]/20 bg-white/70 px-4 py-1 text-[#0F1B33]">Histórico de saúde ativo</Badge>
                  </div>
                  <div className="max-w-3xl space-y-4">
                    <CardTitle className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">Sua saúde organizada para a próxima conversa com o profissional.</CardTitle>
                    <CardDescription className="text-base leading-7 text-slate-600 md:text-lg">
                      O painel reúne seu perfil de saúde, resumos para consulta, documentos, indicadores e próximos passos para você chegar mais preparado à conversa com profissionais habilitados.
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button className="rounded-full bg-[#0F1B33] px-5 text-white hover:bg-[#162240]" onClick={() => setLocation("/preparar-consulta")}>Preparar consulta <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    <Button variant="outline" className="rounded-full border-[#6EC1B4]/20 bg-white px-5 text-[#0F1B33]" onClick={() => setLocation("/profissionais")}>Ver profissionais</Button>
                  </div>
                </CardHeader>
              </Card>
              <Card className="border-white/80 bg-slate-950 text-white shadow-2xl shadow-slate-950/15">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-[#0F1B33]" /> Limites seguros</CardTitle>
                  <CardDescription className="text-slate-300">A IA organiza contexto e sinaliza atenção, mas não substitui consulta, diagnóstico, prescrição ou tratamento.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-6 text-slate-200">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">{hasAttention ? "Há sinais de atenção registrados. Priorize avaliação profissional e procure urgência em situações agudas." : "Nenhum sinal urgente recente foi destacado no histórico carregado."}</div>
                  <div className="rounded-3xl border border-[#6EC1B4]/20 bg-white p-4">Toda orientação aparece como apoio educativo e deve ser conferida com um profissional habilitado antes de qualquer decisão de saúde.</div>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card className="border-white/80 bg-white/85 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><HeartPulse className="h-5 w-5 text-[#0F1B33]" /> Perfil</CardTitle><CardDescription>{profileCompleteness}% completo</CardDescription></CardHeader><CardContent><Progress value={profileCompleteness} className="h-3" /></CardContent></Card>
              <Card className="border-white/80 bg-white/85 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Brain className="h-5 w-5 text-[#0F1B33]" /> Resumos</CardTitle><CardDescription>{evolution?.mapsCreated ?? 0} registros recentes</CardDescription></CardHeader><CardContent className="text-2xl font-semibold">{data.latestMap?.mainConcern ?? "Prepare sua consulta"}</CardContent></Card>
              <Card className="border-white/80 bg-white/85 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><FileText className="h-5 w-5 text-cyan-600" /> Documentos</CardTitle><CardDescription>{evolution?.documentsCount ?? 0} itens recentes</CardDescription></CardHeader><CardContent className="text-sm text-slate-600">Exames e arquivos ajudam a contextualizar sua linha do tempo.</CardContent></Card>
              <Card className="border-white/80 bg-white/85 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]"><CardHeader><CardTitle className="flex items-center gap-2 text-base"><CalendarCheck className="h-5 w-5 text-lime-700" /> Próxima consulta</CardTitle><CardDescription>{data.latestAppointment?.status ?? "sem solicitação ativa"}</CardDescription></CardHeader><CardContent className="text-sm text-slate-600">{data.latestAppointment?.specialty ?? "Escolha um profissional quando quiser avançar."}</CardContent></Card>
            </section>

            <section className="grid min-w-0 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <Card className="border-white/80 bg-white/90 shadow-2xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-[#0F1B33]" /> Recomendações de continuidade</CardTitle>
                  <CardDescription>Próximos passos organizados a partir do seu histórico recente.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.recommendations.map((item, index) => (
                    <div key={item} className="rounded-3xl border border-[#6EC1B4]/20 bg-white p-4 text-sm leading-6 text-[#0F1B33]">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[#0F1B33]">passo {index + 1}</span>
                      {item}
                    </div>
                  ))}
                  <Separator />
                  <Button variant="outline" className="w-full rounded-full border-[#6EC1B4]/20 bg-white text-[#0F1B33]" onClick={() => setLocation("/memoria")}>Atualizar histórico de saúde</Button>
                </CardContent>
              </Card>

              <Card className="border-white/80 bg-white/90 shadow-2xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-[#0F1B33]" /> Linha do tempo recente</CardTitle>
                  <CardDescription>Eventos, resumos e solicitações conectados ao seu histórico.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.timeline.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-[#6EC1B4]/20 bg-white/70 p-6 text-sm text-slate-600">Sua linha do tempo aparecerá aqui após salvar perfil, resumo ou solicitação.</div>
                  ) : data.timeline.map((item) => (
                    <div key={item.id} className="flex gap-4 rounded-3xl border border-slate-100 bg-white/80 p-4 shadow-sm">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0F1B33]"><Stethoscope className="h-5 w-5" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2"><p className="font-medium text-slate-950">{item.title}</p><Badge variant="outline" className="rounded-full border-slate-200">{item.kind}</Badge></div>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{item.summary ?? "Registro salvo para continuidade."}</p>
                        <p className="mt-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{formatDate(item.date)}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

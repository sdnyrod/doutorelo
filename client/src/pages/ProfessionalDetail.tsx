import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CalendarCheck2, CheckCircle2, Clock, FileText, Languages, ShieldCheck, Sparkles, Stethoscope, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";

const formatSlot = (slotIso: string) => new Date(slotIso).toLocaleString("pt-BR", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export default function ProfessionalDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/profissionais/:professionalId");
  const professionalId = params?.professionalId ?? "";
  const utils = trpc.useUtils();
  const detail = trpc.professionals.detail.useQuery({ professionalId }, { enabled: professionalId.length > 0 });
  const dashboard = trpc.dashboard.overview.useQuery(undefined, { staleTime: 30_000 });
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const defaultReason = useMemo(() => {
    const map = dashboard.data?.latestMap;
    if (!map) return "Quero preparar uma consulta com meu histórico, dúvidas e próximos passos de forma organizada.";
    return `Quero discutir meu resumo para consulta sobre ${map.mainConcern} e preparar perguntas para a consulta.`;
  }, [dashboard.data?.latestMap]);
  const [reason, setReason] = useState(defaultReason);
  const [reasonTouched, setReasonTouched] = useState(false);

  useEffect(() => {
    if (!reasonTouched) setReason(defaultReason);
  }, [defaultReason, reasonTouched]);

  const requestAppointment = trpc.professionals.requestAppointment.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.professionals.detail.invalidate({ professionalId }),
        utils.professionals.myAppointments.invalidate(),
        utils.dashboard.overview.invalidate(),
        utils.memory.timeline.invalidate(),
      ]);
      toast.success("Horário solicitado com segurança e registrado no seu histórico de saúde.");
    },
    onError: (error) => toast.error(error.message || "Não foi possível reservar este horário agora."),
  });

  const professional = detail.data?.professional;
  const availableSlots = detail.data?.slots.filter((slot) => slot.status === "available") ?? [];
  const effectiveSlot = selectedSlot ?? availableSlots[0]?.slotIso ?? null;

  return (
    <DashboardLayout>
      <main className="min-h-dvh overflow-x-clip rounded-[1.25rem] bg-white p-3 text-slate-950 sm:p-4 md:rounded-[2rem] md:p-8">
        <Button variant="ghost" className="mb-5 rounded-full text-[#0F1B33] hover:bg-white" onClick={() => setLocation("/profissionais")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar ao catálogo
        </Button>

        {detail.isLoading ? (
          <div className="grid min-w-0 gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.65fr)]"><Skeleton className="h-[24rem] rounded-[1.5rem] sm:h-[32rem] sm:rounded-[2rem]" /><Skeleton className="h-[24rem] rounded-[1.5rem] sm:h-[32rem] sm:rounded-[2rem]" /></div>
        ) : null}

        {!detail.isLoading && !professional ? (
          <Card className="border-red-100 bg-white/90 shadow-xl"><CardHeader><CardTitle>Profissional não encontrado</CardTitle><CardDescription>Volte ao catálogo para escolher outro perfil ativo.</CardDescription></CardHeader></Card>
        ) : null}

        {professional ? (
          <div className="grid min-w-0 gap-4 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)]">
            <section className="space-y-6">
              <Card className="overflow-hidden border-white/80 bg-white/92 shadow-2xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
                <CardHeader className="space-y-5 p-5 sm:p-6 md:p-8">
                  <div className="flex flex-wrap gap-3">
                    <Badge className="rounded-full bg-white px-4 py-1 text-[#0F1B33] hover:bg-white">Perfil profissional</Badge>
                    {professional.featured ? <Badge variant="outline" className="rounded-full border-[#6EC1B4]/20 bg-white px-4 py-1 text-[#0F1B33]">Destaque DOUTORELO</Badge> : null}
                  </div>
                  <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    <div className="max-w-2xl space-y-3">
                      <CardTitle className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">{professional.name}</CardTitle>
                      <CardDescription className="text-lg font-medium text-[#0F1B33]">{professional.specialty}</CardDescription>
                      <p className="text-sm leading-6 text-slate-600">{professional.credentials}</p>
                    </div>
                    <div className="flex h-20 w-20 items-center justify-center rounded-[1.6rem] bg-white text-[#0F1B33] shadow-inner"><Stethoscope className="h-9 w-9" /></div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5 px-5 pb-5 sm:space-y-6 sm:px-6 sm:pb-6 md:px-8 md:pb-8">
                  <div className="rounded-[1.6rem] bg-white p-5 text-sm leading-7 text-[#0F1B33]"><Sparkles className="mb-2 h-5 w-5 text-[#0F1B33]" />{professional.approach}</div>
                  <p className="text-base leading-8 text-slate-700">{professional.bio}</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.4rem] border border-[#6EC1B4]/20 bg-white p-4"><div className="mb-2 flex items-center gap-2 font-semibold text-slate-950"><Languages className="h-4 w-4 text-[#0F1B33]" /> Idiomas</div><div className="flex flex-wrap gap-2">{professional.languages.map((item) => <Badge key={item} variant="secondary" className="rounded-full">{item}</Badge>)}</div></div>
                    <div className="rounded-[1.4rem] border border-[#6EC1B4]/20 bg-white p-4"><div className="mb-2 flex items-center gap-2 font-semibold text-slate-950"><Video className="h-4 w-4 text-[#0F1B33]" /> Modalidades</div><div className="flex flex-wrap gap-2">{professional.consultationModes.map((item) => <Badge key={item} variant="secondary" className="rounded-full">{item}</Badge>)}</div></div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <h2 className="text-xl font-semibold">Focos de cuidado</h2>
                    <div className="flex flex-wrap gap-2">{professional.focus.map((tag) => <Badge key={tag} className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">{tag}</Badge>)}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#6EC1B4]/20 bg-white/90 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-[#0F1B33]" /> Conteúdos relacionados</CardTitle>
                  <CardDescription>Materiais educativos para preparar perguntas; não substituem avaliação clínica individual.</CardDescription>
                </CardHeader>
                <CardContent className="grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {(detail.data?.relatedContent ?? []).length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-[#6EC1B4]/20 bg-white p-4 text-sm text-[#0F1B33] md:col-span-3">Ainda não há conteúdo relacionado publicado. O administrador pode publicar materiais oficiais quando estiverem revisados.</div>
                  ) : null}
                  {(detail.data?.relatedContent ?? []).slice(0, 3).map((content) => (
                    <div key={content.id} className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4 text-sm">
                      <div className="font-semibold text-slate-950">{content.title}</div>
                      <div className="mt-2 text-slate-600">{content.summary}</div>
                      <div className="mt-3 text-xs font-medium text-[#0F1B33]">{content.safeLanguageNotice}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </section>

            <aside className="space-y-5">
              <Card className="border-white/80 bg-slate-950 text-white shadow-2xl shadow-slate-950/15">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CalendarCheck2 className="h-5 w-5 text-[#0F1B33]" /> Solicitar horário</CardTitle>
                  <CardDescription className="text-slate-300">Escolha um horário disponível. Se outra pessoa solicitar antes, o sistema evita conflito de agenda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    {detail.data?.slots.map((slot) => (
                      <button key={slot.slotIso} type="button" aria-label={`${slot.status === "reserved" ? "Horário reservado" : "Selecionar horário disponível"}: ${formatSlot(slot.slotIso)}`} disabled={slot.status === "reserved"} onClick={() => setSelectedSlot(slot.slotIso)} className={`w-full rounded-3xl border px-4 py-3 text-left text-sm transition ${effectiveSlot === slot.slotIso ? "border-[#6EC1B4]/20 bg-white text-[#0F1B33]" : slot.status === "reserved" ? "border-white/10 bg-white/5 text-slate-500" : "border-white/10 bg-white/8 text-white hover:border-[#6EC1B4]/20"}`}>
                        <div className="flex items-center justify-between gap-2"><span>{formatSlot(slot.slotIso)}</span><span className="text-xs uppercase tracking-wide">{slot.status === "reserved" ? "reservado" : "disponível"}</span></div>
                      </button>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-100"><Clock className="h-4 w-4 text-[#0F1B33]" /> Motivo e contexto</label>
                    <Textarea value={reason} onChange={(event) => { setReasonTouched(true); setReason(event.target.value); }} className="min-h-32 rounded-3xl border-white/10 bg-white/10 text-white placeholder:text-slate-400" />
                  </div>
                  <Button className="w-full rounded-full bg-[#0F1B33] text-[#0F1B33] hover:bg-white" disabled={!effectiveSlot || reason.trim().length < 2 || requestAppointment.isPending} onClick={() => effectiveSlot && requestAppointment.mutate({ professionalId, reason, slotIso: effectiveSlot, preferredSlot: formatSlot(effectiveSlot), clarityMapId: dashboard.data?.latestMap?.id ?? null })}>
                    {requestAppointment.isSuccess ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <CalendarCheck2 className="mr-2 h-4 w-4" />}
                    Solicitar este horário
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-[#6EC1B4]/20 bg-white/90 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-[#0F1B33]" /> Limites e segurança</CardTitle>
                  <CardDescription>{detail.data?.safetyNotice}</CardDescription>
                </CardHeader>
              </Card>
            </aside>
          </div>
        ) : null}
      </main>
    </DashboardLayout>
  );
}

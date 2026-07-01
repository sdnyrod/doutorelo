import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Brain, CalendarPlus, CheckCircle2, Clock, Filter, HeartHandshake, ShieldCheck, Sparkles, Stethoscope, UserRoundSearch } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type ReasonState = Record<string, string>;

type SlotState = Record<string, string>;

const appointmentStatusLabel: Record<string, string> = {
  requested: "pedido enviado",
  confirmed: "confirmado",
  completed: "consulta realizada",
  cancelled: "cancelado",
  pending: "aguardando retorno",
};

const formatSlot = (slotIso: string) => new Date(slotIso).toLocaleString("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export default function Professionals() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.professionals.list.useQuery();
  const dashboard = trpc.dashboard.overview.useQuery(undefined, { staleTime: 30_000 });
  const myAppointments = trpc.professionals.myAppointments.useQuery(undefined, { staleTime: 15_000 });
  const [reasons, setReasons] = useState<ReasonState>({});
  const [slots, setSlots] = useState<SlotState>({});
  const [selectedSpecialty, setSelectedSpecialty] = useState("Todos");

  const latestMap = dashboard.data?.latestMap;
  const defaultReason = useMemo(() => {
    if (!latestMap) return "Quero organizar minha história de saúde e entender qual próximo passo discutir em consulta.";
    return `Quero conversar sobre meu resumo para consulta: ${latestMap.mainConcern}.`;
  }, [latestMap]);

  const specialtyOptions = useMemo(() => {
    const specialties = data?.professionals.map((professional) => professional.specialty) ?? [];
    return ["Todos", ...Array.from(new Set(specialties))];
  }, [data?.professionals]);

  const filteredProfessionals = useMemo(() => {
    const professionals = data?.professionals ?? [];
    if (selectedSpecialty === "Todos") return professionals;
    return professionals.filter((professional) => professional.specialty === selectedSpecialty);
  }, [data?.professionals, selectedSpecialty]);

  const requestAppointment = trpc.professionals.requestAppointment.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.dashboard.overview.invalidate(),
        utils.memory.summary.invalidate(),
        utils.memory.timeline.invalidate(),
        utils.professionals.myAppointments.invalidate(),
      ]);
      toast.success("Pedido enviado. A equipe vai confirmar o horário antes da consulta.");
    },
    onError: (error) => {
      toast.error(error.message || "Não foi possível registrar a solicitação agora.");
    },
  });

  return (
    <DashboardLayout>
      <div className="min-h-dvh overflow-x-clip rounded-[1.25rem] bg-white p-3 text-slate-950 sm:p-4 md:rounded-[2rem] md:p-8">
        <section className="mb-6 grid min-w-0 gap-4 sm:mb-8 sm:gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.78fr)]">
          <Card className="border-white/80 bg-white/90 shadow-2xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
            <CardHeader className="space-y-5 p-5 sm:p-6 md:p-8">
              <div className="flex flex-wrap gap-3">
                <Badge className="rounded-full bg-white px-4 py-1 text-[#0F1B33] hover:bg-white">Encontre quem pode cuidar de você</Badge>
                <Badge variant="outline" className="rounded-full border-[#6EC1B4]/20 bg-white px-4 py-1 text-[#0F1B33]">horários sujeitos à confirmação</Badge>
              </div>
              <div className="max-w-3xl space-y-4">
                <CardTitle className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">Escolha um profissional já com sua história organizada.</CardTitle>
                <CardDescription className="text-base leading-7 text-slate-600 md:text-lg">
                  Aqui você escolhe um profissional, informa o que está sentindo e leva para a consulta um resumo mais organizado. A IA ajuda a preparar a conversa; quem avalia, orienta e decide a conduta é sempre o profissional de saúde.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button className="rounded-full bg-[#0F1B33] text-white hover:bg-[#162240]" onClick={() => setLocation("/app")}>Voltar ao painel</Button>
                <Button variant="outline" className="rounded-full border-[#6EC1B4]/20 bg-white text-[#0F1B33]" onClick={() => setLocation("/preparar-consulta")}>Preparar consulta</Button>
              </div>
            </CardHeader>
          </Card>
          <Card className="border-white/80 bg-slate-950 text-white shadow-2xl shadow-slate-950/15">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-[#0F1B33]" /> Cuidado com responsabilidade</CardTitle>
              <CardDescription className="text-slate-300">O pedido de horário facilita a organização do atendimento, mas a equipe ainda confirma disponibilidade, preparo e próximos passos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-slate-200">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">Se você tiver dor intensa de início súbito, falta de ar, desmaio, sinais neurológicos ou qualquer risco imediato, procure um pronto atendimento.</div>
              <div className="rounded-3xl border border-[#6EC1B4]/20 bg-white p-4">{data?.persistenceNote ?? "Suas solicitações ficam registradas para facilitar a continuidade do cuidado."}</div>
            </CardContent>
          </Card>
        </section>

        {isLoading ? (
          <div className="grid min-w-0 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            <Skeleton className="h-96 rounded-[2rem]" />
            <Skeleton className="h-96 rounded-[2rem]" />
            <Skeleton className="h-96 rounded-[2rem]" />
          </div>
        ) : null}

        {data === undefined && !isLoading ? (
          <Card className="mb-5 border-red-100 bg-red-50/80">
            <CardHeader>
              <CardTitle>Não foi possível carregar o catálogo</CardTitle>
              <CardDescription>Tente de novo em alguns instantes. Se continuar acontecendo, entre novamente na sua conta.</CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        {data && data.professionals.length === 0 ? (
          <Card className="mb-5 border-dashed border-[#6EC1B4]/20 bg-white/80">
            <CardHeader>
              <CardTitle>Ainda não há profissionais disponíveis</CardTitle>
              <CardDescription>A equipe poderá publicar novos perfis assim que a rede de atendimento estiver pronta.</CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        <section className="mb-5 rounded-[2rem] border border-[#6EC1B4]/20 bg-white/78 p-4 shadow-lg shadow-[0_18px_64px_rgba(13,27,45,0.08)]" aria-label="Filtro por especialidade dos profissionais DOUTORELO">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#0F1B33]"><Filter className="h-4 w-4 text-[#0F1B33]" /> Filtro por especialidade</div>
          <div className="flex flex-wrap gap-2">
            {specialtyOptions.map((specialty) => (
              <button
                key={specialty}
                type="button"
                onClick={() => setSelectedSpecialty(specialty)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${selectedSpecialty === specialty ? "border-[#6EC1B4]/20 bg-[#0F1B33] text-white shadow-md shadow-[0_18px_64px_rgba(13,27,45,0.08)]" : "border-[#6EC1B4]/20 bg-white text-[#0F1B33] hover:border-[#6EC1B4]/20"}`}
              >
                {specialty}
              </button>
            ))}
          </div>
        </section>

        <section className="grid min-w-0 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredProfessionals.map((professional) => {
            const reason = reasons[professional.id] ?? defaultReason;
            const selectedSlot = slots[professional.id] ?? professional.availability[0];
            const isPending = requestAppointment.isPending;
            return (
              <Card key={professional.id} className="flex flex-col overflow-hidden border-white/80 bg-white/90 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0F1B33]"><Stethoscope className="h-6 w-6" /></div>
                    <Badge variant="outline" className="rounded-full border-[#6EC1B4]/20 bg-white text-[#0F1B33]">Atendimento com contexto</Badge>
                  </div>
                  <div>
                    <CardTitle className="text-2xl">{professional.name}</CardTitle>
                    <CardDescription className="mt-1 text-base text-[#0F1B33]">{professional.specialty}</CardDescription>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{professional.credentials}</p>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-5">
                  <div className="rounded-3xl bg-white p-4 text-sm leading-6 text-[#0F1B33]"><Sparkles className="mb-2 h-5 w-5 text-[#0F1B33]" />{professional.approach}</div>
                  <div className="flex flex-wrap gap-2">
                    {professional.focus.map((tag) => <Badge key={tag} variant="secondary" className="rounded-full bg-slate-100 text-slate-700">{tag}</Badge>)}
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-900"><Clock className="h-4 w-4 text-[#0F1B33]" /> Escolha um horário</p>
                    <div className="flex flex-wrap gap-2">
                      {professional.availability.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          aria-label={`Selecionar horário ${formatSlot(slot)} com ${professional.name}`}
                          onClick={() => setSlots((current) => ({ ...current, [professional.id]: slot }))}
                          className={`rounded-full border px-3 py-1 text-sm transition ${selectedSlot === slot ? "border-[#6EC1B4]/20 bg-[#0F1B33] text-white" : "border-[#6EC1B4]/20 bg-white text-[#0F1B33] hover:border-[#6EC1B4]/20"}`}
                        >
                          {formatSlot(slot)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-900"><Brain className="h-4 w-4 text-[#0F1B33]" /> Conte, do seu jeito, o motivo da consulta</p>
                    <Textarea
                      value={reason}
                      onChange={(event) => setReasons((current) => ({ ...current, [professional.id]: event.target.value }))}
                      className="min-h-28 rounded-3xl border-[#6EC1B4]/20 bg-white/80"
                    />
                  </div>
                  <Button
                    className="mt-auto rounded-full bg-[#0F1B33] text-white hover:bg-[#162240]"
                    disabled={isPending || reason.trim().length < 2 || !selectedSlot}
                    onClick={() => requestAppointment.mutate({ professionalId: professional.id, reason, preferredSlot: formatSlot(selectedSlot), slotIso: selectedSlot, clarityMapId: latestMap?.id ?? null })}
                  >
                    {requestAppointment.isSuccess ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <CalendarPlus className="mr-2 h-4 w-4" />}
                    Pedir horário
                  </Button>
                  <Button
                    variant="outline"
                    className="rounded-full border-[#6EC1B4]/20 bg-white text-[#0F1B33]"
                    onClick={() => setLocation(`/profissionais/${professional.id}`)}
                  >
                    <UserRoundSearch className="mr-2 h-4 w-4" />
                    Conhecer melhor o profissional
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="mt-8 grid min-w-0 gap-4 sm:gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Card className="border-[#6EC1B4]/20 bg-white/85 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><HeartHandshake className="h-5 w-5 text-[#0F1B33]" /> Depois que você pede um horário</CardTitle>
              <CardDescription>Seu pedido fica salvo para acompanhamento. Assim, quando a equipe retornar, você não precisa repetir tudo do zero.</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-[#6EC1B4]/20 bg-white/90 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5 text-[#0F1B33]" /> Horários que eu pedi</CardTitle>
              <CardDescription>Veja seus pedidos recentes e acompanhe o que ainda depende de retorno da equipe.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {myAppointments.isLoading ? <Skeleton className="h-24 rounded-3xl" /> : null}
              {(myAppointments.data ?? []).length === 0 && !myAppointments.isLoading ? (
                <div className="rounded-3xl border border-dashed border-[#6EC1B4]/20 bg-white p-4 text-sm text-[#0F1B33]">Você ainda não pediu nenhum horário. Escolha um profissional, conte brevemente o motivo da consulta e peça o melhor horário disponível.</div>
              ) : null}
              {(myAppointments.data ?? []).slice(0, 4).map((appointment) => (
                <div key={appointment.id} className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4 text-sm">
                  <div className="font-semibold text-slate-950">{appointment.doctorName} · {appointment.specialty}</div>
                  <div className="mt-1 text-slate-600">{appointment.scheduledAt ? formatSlot(new Date(appointment.scheduledAt).toISOString()) : "Aguardando confirmação do horário"} · {appointmentStatusLabel[appointment.status] ?? appointment.status}</div>
                  <div className="mt-2 line-clamp-2 text-slate-500">{appointment.reason}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </DashboardLayout>
  );
}

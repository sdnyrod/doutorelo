import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Building2, Database, Filter, MapPin, Search, ShieldCheck, Stethoscope } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

const providerTypeLabels: Record<string, string> = {
  professional: "Profissional",
  clinic: "Clínica",
  hospital: "Hospital",
  laboratory: "Laboratório",
  pharmacy: "Farmácia",
  health_facility: "Unidade de saúde",
  other: "Outro",
};

const verificationLabels: Record<string, string> = {
  unverified: "não verificado",
  source_verified: "fonte verificada",
  manually_verified: "verificado manualmente",
  conflict: "conflito",
  rejected: "rejeitado",
};

const statusLabels: Record<string, string> = {
  active: "ativo",
  inactive: "inativo",
  pending_review: "em revisão",
  archived: "arquivado",
};

function formatDate(value?: string | number | Date | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR");
}

export default function NationalHealthDirectory() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [entityType, setEntityType] = useState("all");

  const searchInput = useMemo(() => ({
    query: query.trim().length >= 2 ? query.trim() : undefined,
    city: city.trim().length >= 2 ? city.trim() : undefined,
    state: state.trim().length === 2 ? state.trim().toUpperCase() : undefined,
    specialty: specialty.trim().length >= 2 ? specialty.trim() : undefined,
    entityType: entityType === "all" ? undefined : entityType as "professional" | "clinic" | "hospital" | "laboratory" | "pharmacy" | "health_facility" | "other",
    limit: 80,
  }), [city, entityType, query, specialty, state]);

  const summary = trpc.healthDirectory.summary.useQuery(undefined, { staleTime: 60_000 });
  const searchResult = trpc.healthDirectory.search.useQuery(searchInput, { staleTime: 30_000 });
  const providers = searchResult.data?.providers ?? [];

  return (
    <main className="min-h-dvh overflow-x-clip bg-[#F7F4EF] text-slate-950">
      <section className="relative overflow-hidden border-b border-[#6EC1B4]/10 bg-[#0F1B33] text-white">
        <div className="absolute -left-28 top-10 h-72 w-72 rounded-full bg-[#0F1B33]/20 blur-[96px]" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-white/10 blur-[120px]" />
        <div className="container relative py-8 sm:py-12 lg:py-16">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <Button variant="outline" className="rounded-full border-white/20 bg-white/10 text-white hover:bg-white hover:text-[#0F1B33]" onClick={() => setLocation("/") }>
              <ArrowLeft className="mr-2 h-4 w-4" /> Página inicial
            </Button>
            <Badge className="rounded-full bg-white px-4 py-1 text-[#0F1B33] hover:bg-white">Diretório Nacional · fundação DEV</Badge>
          </div>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-end">
            <div className="max-w-4xl space-y-5">
              <Badge variant="outline" className="rounded-full border-white/20 bg-white/5 px-4 py-1 text-white">Busca informativa e auditável</Badge>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">Encontre profissionais e estabelecimentos de saúde com rastreabilidade de origem.</h1>
              <p className="max-w-3xl text-base leading-8 text-white/78 sm:text-lg">Esta primeira versão prepara o DoutorElo para organizar um diretório nacional com fontes, evidências e cobertura territorial. Os resultados são informativos e exigem confirmação direta nas fontes oficiais ou com o próprio serviço.</p>
            </div>
            <Card className="border-white/15 bg-white/10 text-white shadow-2xl shadow-black/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-[#6EC1B4]" /> Visão da base</CardTitle>
                <CardDescription className="text-white/70">Métricas lidas do banco aplicado nesta etapa.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-3xl border border-white/10 bg-white/10 p-4"><p className="text-2xl font-semibold">{summary.data?.totals.providers ?? 0}</p><p className="text-white/65">prestadores</p></div>
                <div className="rounded-3xl border border-white/10 bg-white/10 p-4"><p className="text-2xl font-semibold">{summary.data?.totals.activeProviders ?? 0}</p><p className="text-white/65">ativos</p></div>
                <div className="rounded-3xl border border-white/10 bg-white/10 p-4"><p className="text-2xl font-semibold">{Object.keys(summary.data?.stateCounts ?? {}).length}</p><p className="text-white/65">UFs</p></div>
                <div className="rounded-3xl border border-white/10 bg-white/10 p-4"><p className="text-2xl font-semibold">{summary.data?.totals.coverageRows ?? 0}</p><p className="text-white/65">coberturas</p></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container py-6 sm:py-8 lg:py-10">
        <Card className="border-white/80 bg-white/92 shadow-2xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5 text-[#6EC1B4]" /> Filtros de busca</CardTitle>
            <CardDescription>Use pelo menos dois caracteres em nome, cidade ou especialidade. Estados devem usar UF com duas letras.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr_0.45fr_0.85fr_0.85fr]">
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome, clínica, conselho ou resumo" className="min-h-11 rounded-2xl bg-white" />
            <Input value={city} onChange={(event) => setCity(event.target.value)} placeholder="Cidade" className="min-h-11 rounded-2xl bg-white" />
            <Input value={state} onChange={(event) => setState(event.target.value.toUpperCase().slice(0, 2))} placeholder="UF" className="min-h-11 rounded-2xl bg-white" />
            <Input value={specialty} onChange={(event) => setSpecialty(event.target.value)} placeholder="Especialidade" className="min-h-11 rounded-2xl bg-white" />
            <select value={entityType} onChange={(event) => setEntityType(event.target.value)} className="min-h-11 rounded-2xl border border-input bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-[#6EC1B4]/30">
              <option value="all">Todos os tipos</option>
              <option value="professional">Profissional</option>
              <option value="clinic">Clínica</option>
              <option value="hospital">Hospital</option>
              <option value="laboratory">Laboratório</option>
              <option value="pharmacy">Farmácia</option>
              <option value="health_facility">Unidade de saúde</option>
              <option value="other">Outro</option>
            </select>
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Resultados do diretório</h2>
            <p className="mt-1 text-sm text-slate-600">{searchResult.isLoading ? "Carregando base nacional..." : `${providers.length} registro(s) encontrados nesta consulta.`}</p>
          </div>
          <Badge variant="outline" className="w-fit rounded-full border-[#6EC1B4]/20 bg-white px-4 py-1 text-[#0F1B33]">sem importação massiva nesta entrega</Badge>
        </div>

        {searchResult.isLoading ? (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Skeleton className="h-64 rounded-[2rem]" />
            <Skeleton className="h-64 rounded-[2rem]" />
            <Skeleton className="h-64 rounded-[2rem]" />
          </div>
        ) : null}

        {!searchResult.isLoading && providers.length === 0 ? (
          <Card className="mt-5 border-dashed border-[#6EC1B4]/20 bg-white/82">
            <CardHeader>
              <CardTitle>Nenhum registro encontrado ainda</CardTitle>
              <CardDescription>A estrutura nacional já existe, mas esta versão não executa coleta automática. Os registros aparecerão após curadoria manual ou importações oficiais autorizadas.</CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        <section className="mt-5 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {providers.map((provider) => (
            <Card key={provider.id} className="overflow-hidden border-white/80 bg-white/94 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F1B33] text-white">
                    {provider.entityType === "professional" ? <Stethoscope className="h-5 w-5" /> : <Building2 className="h-5 w-5" />}
                  </div>
                  <Badge variant="outline" className="rounded-full border-[#6EC1B4]/20 bg-white text-[#0F1B33]">{providerTypeLabels[provider.entityType] ?? provider.entityType}</Badge>
                </div>
                <div>
                  <CardTitle className="text-2xl">{provider.displayName}</CardTitle>
                  <CardDescription className="mt-1 text-[#0F1B33]">{provider.primarySpecialty ?? "Especialidade em curadoria"}</CardDescription>
                </div>
                <p className="flex items-center gap-2 text-sm text-slate-600"><MapPin className="h-4 w-4 text-[#6EC1B4]" /> {provider.city}-{provider.state}</p>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-6 text-slate-600">
                <p>{provider.publicSummary ?? provider.bio ?? "Registro preparado para curadoria e enriquecimento de fontes auditáveis."}</p>
                <div className="grid gap-2 rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                  <div className="flex items-center justify-between gap-3"><span>Verificação</span><span className="font-medium text-slate-950">{verificationLabels[provider.verificationStatus] ?? provider.verificationStatus}</span></div>
                  <div className="flex items-center justify-between gap-3"><span>Status</span><span className="font-medium text-slate-950">{statusLabels[provider.status] ?? provider.status}</span></div>
                  <div className="flex items-center justify-between gap-3"><span>Última atualização</span><span className="font-medium text-slate-950">{formatDate(provider.updatedAt)}</span></div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700">qualidade {provider.qualityScore ?? 0}/100</Badge>
                  <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700">confiança {provider.sourceConfidenceScore ?? 0}/100</Badge>
                  {provider.modality ? <Badge variant="secondary" className="rounded-full bg-slate-100 text-slate-700">{provider.modality}</Badge> : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="mt-8 border-[#6EC1B4]/20 bg-white/92">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-[#6EC1B4]" /> Aviso de uso responsável</CardTitle>
            <CardDescription>{searchResult.data?.safetyNotice ?? "Diretório informativo. Confirme credenciais, agenda e vínculo diretamente nas fontes oficiais."}</CardDescription>
          </CardHeader>
        </Card>
      </section>
    </main>
  );
}

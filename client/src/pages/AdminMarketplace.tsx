import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, Archive, Boxes, CheckCircle2, ClipboardCheck, Edit3, LockKeyhole, PackageSearch, RefreshCw, Save, ShieldCheck, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type MarketplaceAdminItem = {
  id: number;
  slug: string;
  kind: "product" | "service";
  categoryId?: number | null;
  partnerId?: number | null;
  name: string;
  subtitle?: string | null;
  description?: string | null;
  claimReviewNotes?: string | null;
  commercialNotice?: string | null;
  priceCents: number;
  currency?: string | null;
  publicationStatus?: "draft" | "published" | "inactive" | string | null;
  eligibility?: "general" | "requires_profile" | "requires_professional_context" | "restricted" | string | null;
  inventoryPolicy?: "track_stock" | "unlimited" | "service_capacity" | string | null;
  tags?: string[] | string | null;
  requiresConsent?: number | boolean | null;
  featured?: number | boolean | null;
  availableStock: number;
  category?: { id: number; slug: string; name: string } | null;
  inventory?: { stockOnHand?: number | null; lowStockThreshold?: number | null; restockNote?: string | null } | null;
};

type MarketplaceOrder = {
  id: number;
  userId?: number | null;
  status?: string | null;
  subtotalCents?: number | null;
  checkoutMode?: string | null;
  createdAt?: string | Date | null;
  safetyNotice?: string | null;
};

type MarketplaceFormState = {
  id: string;
  slug: string;
  kind: "product" | "service";
  categoryId: string;
  name: string;
  subtitle: string;
  description: string;
  claimReviewNotes: string;
  commercialNotice: string;
  priceReais: string;
  publicationStatus: "draft" | "published" | "inactive";
  eligibility: "general" | "requires_profile" | "requires_professional_context" | "restricted";
  inventoryPolicy: "track_stock" | "unlimited" | "service_capacity";
  tags: string;
  requiresConsent: boolean;
  featured: boolean;
};

const safeCommercialNotice = "Produto ou serviço comercial do DOUTORELO. Não substitui avaliação médica, diagnóstico, prescrição, orientação de urgência ou acompanhamento profissional.";

function blankForm(): MarketplaceFormState {
  return {
    id: "",
    slug: "",
    kind: "product",
    categoryId: "",
    name: "",
    subtitle: "",
    description: "",
    claimReviewNotes: "Sem promessa clínica. Item de apoio, organização ou educação em saúde.",
    commercialNotice: safeCommercialNotice,
    priceReais: "0,00",
    publicationStatus: "draft",
    eligibility: "general",
    inventoryPolicy: "track_stock",
    tags: "",
    requiresConsent: true,
    featured: false,
  };
}

function formatMoney(cents?: number | null) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format((cents ?? 0) / 100);
}

function parsePriceToCents(value: string) {
  const normalized = value.replace(/\./g, "").replace(",", ".").replace(/[^0-9.]/g, "");
  const parsed = Number(normalized || "0");
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

function formatDate(value: MarketplaceOrder["createdAt"]) {
  if (!value) return "Data a confirmar";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data a confirmar";
  return date.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function statusBadge(status?: string | null) {
  const config = status === "published"
    ? "border-[#6EC1B4]/20 bg-white text-[#0F1B33]"
    : status === "inactive"
      ? "border-slate-200 bg-slate-50 text-slate-600"
      : "border-amber-200 bg-amber-50 text-amber-800";
  const label = status === "published" ? "Publicado" : status === "inactive" ? "Inativo" : "Rascunho";
  return <Badge variant="outline" className={`rounded-full px-3 py-1 ${config}`}>{label}</Badge>;
}

function editFormFromItem(item: MarketplaceAdminItem): MarketplaceFormState {
  return {
    id: String(item.id),
    slug: item.slug,
    kind: item.kind,
    categoryId: item.categoryId ? String(item.categoryId) : item.category?.id ? String(item.category.id) : "",
    name: item.name,
    subtitle: item.subtitle ?? "",
    description: item.description ?? "",
    claimReviewNotes: item.claimReviewNotes ?? "Sem promessa clínica. Revisar antes de publicar.",
    commercialNotice: item.commercialNotice ?? safeCommercialNotice,
    priceReais: ((item.priceCents ?? 0) / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    publicationStatus: (item.publicationStatus as MarketplaceFormState["publicationStatus"]) ?? "draft",
    eligibility: (item.eligibility as MarketplaceFormState["eligibility"]) ?? "general",
    inventoryPolicy: (item.inventoryPolicy as MarketplaceFormState["inventoryPolicy"]) ?? "track_stock",
    tags: Array.isArray(item.tags) ? item.tags.join(", ") : item.tags ?? "",
    requiresConsent: Boolean(item.requiresConsent),
    featured: Boolean(item.featured),
  };
}

function AdminMarketplaceContent() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();
  const catalog = trpc.admin.marketplaceCatalog.useQuery(undefined, { enabled: isAdmin, retry: false });
  const orders = trpc.admin.marketplaceOrders.useQuery(undefined, { enabled: isAdmin, retry: false });
  const [form, setForm] = useState<MarketplaceFormState>(() => blankForm());
  const [stockDrafts, setStockDrafts] = useState<Record<number, { stockOnHand: string; lowStockThreshold: string; restockNote: string }>>({});
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "inactive">("all");

  const upsertItem = trpc.admin.upsertMarketplaceItem.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.admin.marketplaceCatalog.invalidate(), utils.marketplace.list.invalidate(), utils.admin.summary.invalidate()]);
      toast.success("Item do marketplace salvo com revisão de linguagem segura.");
      setForm(blankForm());
    },
    onError: (error) => toast.error(error.message || "Não foi possível salvar o item."),
  });

  const updateInventory = trpc.admin.updateMarketplaceInventory.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.admin.marketplaceCatalog.invalidate(), utils.marketplace.list.invalidate(), utils.admin.summary.invalidate()]);
      toast.success("Estoque atualizado.");
    },
    onError: (error) => toast.error(error.message || "Não foi possível atualizar o estoque."),
  });

  const items = (catalog.data?.items ?? []) as MarketplaceAdminItem[];
  const orderRows = (orders.data?.orders ?? []) as MarketplaceOrder[];
  const categoryOptions = useMemo(() => {
    const categories = new Map<number, string>();
    items.forEach((item) => {
      if (item.category?.id) categories.set(item.category.id, item.category.name);
    });
    return Array.from(categories.entries()).map(([id, name]) => ({ id, name }));
  }, [items]);
  const filteredItems = useMemo(() => items.filter((item) => statusFilter === "all" || item.publicationStatus === statusFilter), [items, statusFilter]);
  const lowStockItems = useMemo(() => items.filter((item) => item.inventoryPolicy !== "unlimited" && item.availableStock <= (item.inventory?.lowStockThreshold ?? 0)), [items]);

  if (!isAdmin) {
    return (
      <div className="relative min-h-[72vh] overflow-hidden rounded-[1.5rem] border border-[#6EC1B4]/20 bg-white/90 p-5 text-slate-950 shadow-2xl shadow-[0_18px_64px_rgba(13,27,45,0.08)] sm:rounded-[2rem] sm:p-8">
        <div className="relative mx-auto flex max-w-xl flex-col items-center justify-center pt-20 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] border border-white/80 bg-white text-[#0F1B33] shadow-[0_18px_60px_rgba(6,95,70,0.12)] backdrop-blur-xl">
            <LockKeyhole className="h-9 w-9" />
          </div>
          <Badge className="mb-5 rounded-full bg-white px-4 py-1 text-[#0F1B33] hover:bg-white">Acesso protegido</Badge>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">O backoffice do marketplace exige papel de administrador.</h1>
          <p className="mt-5 text-sm leading-7 text-slate-600">Catálogo, estoque, publicação e revisão de claims são operações protegidas no servidor.</p>
        </div>
      </div>
    );
  }

  const saveItem = () => {
    const forbidden = /\b(cura garantida|tratamento garantido|substitui consulta|prescrição definitiva|diagnóstico garantido|resultado garantido)\b/i;
    const textForReview = `${form.name} ${form.subtitle} ${form.description} ${form.claimReviewNotes}`;
    if (forbidden.test(textForReview)) {
      toast.error("Remova promessas clínicas antes de salvar. A loja deve manter linguagem não prescritiva.");
      return;
    }
    upsertItem.mutate({
      id: form.id ? Number(form.id) : undefined,
      slug: form.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
      kind: form.kind,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      name: form.name.trim(),
      subtitle: form.subtitle.trim() || null,
      description: form.description.trim() || null,
      claimReviewNotes: form.claimReviewNotes.trim() || null,
      commercialNotice: form.commercialNotice.trim() || safeCommercialNotice,
      priceCents: parsePriceToCents(form.priceReais),
      currency: "BRL",
      publicationStatus: form.publicationStatus,
      eligibility: form.eligibility,
      inventoryPolicy: form.inventoryPolicy,
      tags: form.tags.trim() || null,
      requiresConsent: form.requiresConsent ? 1 : 0,
      featured: form.featured ? 1 : 0,
    });
  };

  return (
    <div className="min-h-dvh overflow-x-clip rounded-[1.25rem] bg-white p-3 text-slate-950 sm:p-5 md:rounded-[2rem] lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <Card className="border-white/80 bg-white/92 shadow-2xl shadow-[0_18px_64px_rgba(13,27,45,0.08)] backdrop-blur">
            <CardHeader className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full bg-slate-950 px-3 py-1 text-white hover:bg-slate-950">Backoffice</Badge>
                <Badge variant="outline" className="rounded-full border-[#6EC1B4]/20 bg-white px-3 py-1 text-[#0F1B33]">Marketplace DEV</Badge>
              </div>
              <CardTitle className="text-3xl font-semibold tracking-tight sm:text-5xl">Curadoria comercial com trava de segurança clínica.</CardTitle>
              <CardDescription className="max-w-3xl text-base leading-7 text-slate-600">Cadastre produtos e serviços, publique apenas itens revisados, acompanhe estoque e mantenha claims sem promessa terapêutica.</CardDescription>
            </CardHeader>
          </Card>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <Card className="border-white/80 bg-white/90 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]"><CardContent className="flex items-center gap-3 p-5"><ShoppingBag className="h-8 w-8 text-[#0F1B33]" /><div><p className="text-2xl font-semibold">{items.length}</p><p className="text-sm text-slate-500">Itens no catálogo</p></div></CardContent></Card>
            <Card className="border-white/80 bg-white/90 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]"><CardContent className="flex items-center gap-3 p-5"><AlertTriangle className="h-8 w-8 text-amber-600" /><div><p className="text-2xl font-semibold">{lowStockItems.length}</p><p className="text-sm text-slate-500">Baixo estoque</p></div></CardContent></Card>
            <Card className="border-white/80 bg-white/90 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]"><CardContent className="flex items-center gap-3 p-5"><ClipboardCheck className="h-8 w-8 text-[#0F1B33]" /><div><p className="text-2xl font-semibold">{orderRows.length}</p><p className="text-sm text-slate-500">Pedidos DEV</p></div></CardContent></Card>
          </div>
        </section>

        <section className="grid min-w-0 gap-4 sm:gap-5 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
          <Card className="border-white/80 bg-white/94 shadow-2xl shadow-[0_18px_64px_rgba(13,27,45,0.08)] backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Edit3 className="h-5 w-5 text-[#0F1B33]" /> {form.id ? "Editar item" : "Novo item"}</CardTitle>
              <CardDescription>Use linguagem comercial segura. Itens publicados aparecem na loja mobile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1 text-sm font-medium text-slate-700">Nome<Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 min-h-11 rounded-2xl" /></label>
                <label className="space-y-1 text-sm font-medium text-slate-700">Slug<Input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="exemplo-produto" className="mt-1 min-h-11 rounded-2xl" /></label>
                <label className="space-y-1 text-sm font-medium text-slate-700">Tipo<select value={form.kind} onChange={(event) => setForm({ ...form, kind: event.target.value as MarketplaceFormState["kind"] })} className="mt-1 min-h-11 w-full rounded-2xl border border-input bg-white px-3 text-sm"><option value="product">Produto</option><option value="service">Serviço</option></select></label>
                <label className="space-y-1 text-sm font-medium text-slate-700">Categoria<select value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })} className="mt-1 min-h-11 w-full rounded-2xl border border-input bg-white px-3 text-sm"><option value="">Sem categoria</option>{categoryOptions.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
                <label className="space-y-1 text-sm font-medium text-slate-700">Preço em R$<Input value={form.priceReais} onChange={(event) => setForm({ ...form, priceReais: event.target.value })} className="mt-1 min-h-11 rounded-2xl" /></label>
                <label className="space-y-1 text-sm font-medium text-slate-700">Publicação<select value={form.publicationStatus} onChange={(event) => setForm({ ...form, publicationStatus: event.target.value as MarketplaceFormState["publicationStatus"] })} className="mt-1 min-h-11 w-full rounded-2xl border border-input bg-white px-3 text-sm"><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="inactive">Inativo</option></select></label>
                <label className="space-y-1 text-sm font-medium text-slate-700">Elegibilidade<select value={form.eligibility} onChange={(event) => setForm({ ...form, eligibility: event.target.value as MarketplaceFormState["eligibility"] })} className="mt-1 min-h-11 w-full rounded-2xl border border-input bg-white px-3 text-sm"><option value="general">Uso geral</option><option value="requires_profile">Usa perfil</option><option value="requires_professional_context">Contexto profissional</option><option value="restricted">Restrito</option></select></label>
                <label className="space-y-1 text-sm font-medium text-slate-700">Estoque<select value={form.inventoryPolicy} onChange={(event) => setForm({ ...form, inventoryPolicy: event.target.value as MarketplaceFormState["inventoryPolicy"] })} className="mt-1 min-h-11 w-full rounded-2xl border border-input bg-white px-3 text-sm"><option value="track_stock">Controlar estoque</option><option value="service_capacity">Capacidade de serviço</option><option value="unlimited">Sem limite</option></select></label>
              </div>
              <label className="space-y-1 text-sm font-medium text-slate-700">Subtítulo<Input value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} className="mt-1 min-h-11 rounded-2xl" /></label>
              <label className="space-y-1 text-sm font-medium text-slate-700">Descrição<Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 min-h-28 rounded-2xl" /></label>
              <label className="space-y-1 text-sm font-medium text-slate-700">Notas de revisão de claim<Textarea value={form.claimReviewNotes} onChange={(event) => setForm({ ...form, claimReviewNotes: event.target.value })} className="mt-1 min-h-24 rounded-2xl" /></label>
              <label className="space-y-1 text-sm font-medium text-slate-700">Aviso comercial seguro<Textarea value={form.commercialNotice} onChange={(event) => setForm({ ...form, commercialNotice: event.target.value })} className="mt-1 min-h-20 rounded-2xl" /></label>
              <label className="space-y-1 text-sm font-medium text-slate-700">Tags<Input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="consulta, organização, rotina" className="mt-1 min-h-11 rounded-2xl" /></label>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-[#0F1B33]"><input type="checkbox" checked={form.requiresConsent} onChange={(event) => setForm({ ...form, requiresConsent: event.target.checked })} /> Exige consentimento</label>
                <label className="flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm text-amber-900"><input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} /> Destaque</label>
              </div>
              <div className="rounded-3xl border border-[#6EC1B4]/20 bg-white p-4 text-sm leading-6 text-[#0F1B33]"><ShieldCheck className="mr-2 inline h-4 w-4" /> Evite termos como “cura garantida”, “substitui consulta”, “diagnóstico garantido” ou “prescrição definitiva”.</div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={saveItem} disabled={upsertItem.isPending} className="min-h-12 rounded-full bg-[#0F1B33] px-6 text-white hover:bg-[#162240]"><Save className="mr-2 h-4 w-4" /> Salvar item</Button>
                <Button type="button" variant="outline" onClick={() => setForm(blankForm())} className="min-h-12 rounded-full border-slate-200 bg-white px-6"><RefreshCw className="mr-2 h-4 w-4" /> Limpar</Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-white/80 bg-white/92 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
              <CardHeader className="gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div><CardTitle className="flex items-center gap-2"><PackageSearch className="h-5 w-5 text-[#0F1B33]" /> Catálogo</CardTitle><CardDescription>Edite publicação, claims e estoque dos itens existentes.</CardDescription></div>
                  <div className="flex gap-2 overflow-x-auto">
                    {(["all", "published", "draft", "inactive"] as const).map((status) => <Button key={status} size="sm" variant={statusFilter === status ? "default" : "outline"} onClick={() => setStatusFilter(status)} className={`rounded-full ${statusFilter === status ? "bg-slate-950 text-white" : "bg-white"}`}>{status === "all" ? "Todos" : status === "published" ? "Publicados" : status === "draft" ? "Rascunhos" : "Inativos"}</Button>)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {catalog.isLoading ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-3xl" />) : null}
                {filteredItems.map((item) => {
                  const draft = stockDrafts[item.id] ?? { stockOnHand: String(item.inventory?.stockOnHand ?? item.availableStock ?? 0), lowStockThreshold: String(item.inventory?.lowStockThreshold ?? 3), restockNote: item.inventory?.restockNote ?? "" };
                  return (
                    <article key={item.id} className="rounded-[1.5rem] border border-slate-100 bg-white p-4 shadow-sm">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">{statusBadge(item.publicationStatus)}<Badge variant="outline" className="rounded-full bg-white">{item.kind === "service" ? "Serviço" : "Produto"}</Badge>{item.requiresConsent ? <Badge variant="outline" className="rounded-full border-[#6EC1B4]/20 bg-white text-[#0F1B33]">Consentimento</Badge> : null}</div>
                          <h3 className="text-lg font-semibold text-slate-950">{item.name}</h3>
                          <p className="line-clamp-2 text-sm leading-6 text-slate-600">{item.subtitle ?? item.description ?? "Sem descrição."}</p>
                          <p className="text-sm font-semibold text-slate-950">{formatMoney(item.priceCents)} · {item.availableStock} disponível(is)</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button variant="outline" onClick={() => setForm(editFormFromItem(item))} className="rounded-full bg-white"><Edit3 className="mr-2 h-4 w-4" /> Editar</Button>
                          <Button variant="outline" onClick={() => updateInventory.mutate({ itemId: item.id, stockOnHand: Number(draft.stockOnHand || 0), lowStockThreshold: Number(draft.lowStockThreshold || 0), restockNote: draft.restockNote || null })} className="rounded-full border-[#6EC1B4]/20 bg-white text-[#0F1B33]"><Boxes className="mr-2 h-4 w-4" /> Salvar estoque</Button>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-2 sm:grid-cols-[8rem_8rem_1fr]">
                        <Input value={draft.stockOnHand} onChange={(event) => setStockDrafts({ ...stockDrafts, [item.id]: { ...draft, stockOnHand: event.target.value } })} className="rounded-2xl" />
                        <Input value={draft.lowStockThreshold} onChange={(event) => setStockDrafts({ ...stockDrafts, [item.id]: { ...draft, lowStockThreshold: event.target.value } })} className="rounded-2xl" />
                        <Input value={draft.restockNote} onChange={(event) => setStockDrafts({ ...stockDrafts, [item.id]: { ...draft, restockNote: event.target.value } })} placeholder="Nota de reposição" className="rounded-2xl" />
                      </div>
                    </article>
                  );
                })}
              </CardContent>
            </Card>

            <Card className="border-white/80 bg-white/92 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
              <CardHeader><CardTitle className="flex items-center gap-2"><Archive className="h-5 w-5 text-[#0F1B33]" /> Pedidos simulados</CardTitle><CardDescription>Separados de qualquer pagamento real.</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                {orderRows.length === 0 ? <div className="rounded-3xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">Nenhum pedido DEV registrado ainda.</div> : orderRows.slice(0, 8).map((order) => (
                  <div key={order.id} className="flex flex-col gap-2 rounded-3xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div><p className="font-semibold text-slate-950">Pedido #{order.id} · usuário {order.userId ?? "—"}</p><p className="text-sm text-slate-500">{formatDate(order.createdAt)} · {order.checkoutMode ?? "dev_simulated"}</p></div>
                    <div className="flex items-center gap-2"><Badge variant="outline" className="rounded-full border-[#6EC1B4]/20 bg-white text-[#0F1B33]"><CheckCircle2 className="mr-1 h-3 w-3" /> {order.status ?? "simulado"}</Badge><span className="font-semibold">{formatMoney(order.subtotalCents)}</span></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function AdminMarketplace() {
  return (
    <DashboardLayout>
      <AdminMarketplaceContent />
    </DashboardLayout>
  );
}

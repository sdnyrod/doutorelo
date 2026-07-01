import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BadgeCheck, Boxes, CheckCircle2, Clock3, Minus, PackageCheck, Plus, RefreshCw, Search, ShieldAlert, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type MarketplaceItem = {
  id: number;
  slug: string;
  kind: "product" | "service";
  name: string;
  subtitle?: string | null;
  description?: string | null;
  priceCents: number;
  currency?: string | null;
  publicationStatus?: string | null;
  eligibility?: string | null;
  inventoryPolicy?: string | null;
  availableStock: number;
  featured?: number | boolean | null;
  requiresConsent?: number | boolean | null;
  commercialNotice?: string | null;
  tags?: string[] | string | null;
  category?: { id: number; slug: string; name: string } | null;
  partner?: { id: number; name: string } | null;
  inventory?: { lowStockThreshold?: number | null; stockOnHand?: number | null } | null;
};

type CartRow = {
  itemId: number;
  quantity: number;
  lineTotalCents: number;
  item?: MarketplaceItem | null;
};

type MarketplaceOrder = {
  id: number;
  status?: string | null;
  subtotalCents?: number | null;
  checkoutMode?: string | null;
  createdAt?: string | Date | null;
  safetyNotice?: string | null;
};

type MarketplaceRecommendation = {
  itemId: number;
  itemName: string;
  fitReason: string;
  carefulUseNote: string;
  safetyNotice: string;
  confidence: "low" | "medium";
};

const kindLabels: Record<string, string> = {
  product: "Produto",
  service: "Serviço",
};

const eligibilityLabels: Record<string, string> = {
  general: "Uso geral",
  requires_profile: "Usa seu perfil",
  requires_professional_context: "Melhor com contexto profissional",
  restricted: "Restrito",
};

function formatMoney(cents: number | null | undefined, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).format((cents ?? 0) / 100);
}

function formatDate(value: MarketplaceOrder["createdAt"]) {
  if (!value) return "Agora há pouco";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data a confirmar";
  return date.toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function tagsOf(item: MarketplaceItem) {
  if (Array.isArray(item.tags)) return item.tags;
  if (typeof item.tags === "string") return item.tags.split(",").map((tag) => tag.trim()).filter(Boolean);
  return [];
}

function MarketplaceSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <Skeleton className="h-64 rounded-[2rem]" />
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,22rem)]">
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-64 rounded-[1.75rem]" />)}
        </div>
        <Skeleton className="h-96 rounded-[2rem]" />
      </div>
    </div>
  );
}

function StockBadge({ item }: { item: MarketplaceItem }) {
  if (item.inventoryPolicy === "unlimited") {
    return <Badge variant="outline" className="rounded-full border-[#6EC1B4]/20 bg-white text-[#0F1B33]">Disponível</Badge>;
  }
  if (item.availableStock <= 0) {
    return <Badge variant="outline" className="rounded-full border-red-200 bg-red-50 text-red-700">Esgotado</Badge>;
  }
  const threshold = item.inventory?.lowStockThreshold ?? 3;
  if (item.availableStock <= threshold) {
    return <Badge variant="outline" className="rounded-full border-amber-200 bg-amber-50 text-amber-800">Poucas unidades</Badge>;
  }
  return <Badge variant="outline" className="rounded-full border-[#6EC1B4]/20 bg-white text-[#0F1B33]">Em estoque</Badge>;
}

function ItemCard({ item, cartQuantity, isPending, onAdd, onOpen }: { item: MarketplaceItem; cartQuantity: number; isPending: boolean; onAdd: () => void; onOpen: () => void }) {
  const disabled = isPending || (item.inventoryPolicy !== "unlimited" && item.availableStock <= 0);
  return (
    <article className="flex min-h-[22rem] flex-col rounded-[1.85rem] border border-white/82 bg-white/92 p-4 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)] backdrop-blur transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white to-[#F7F8FA] text-[#0F1B33]">
          {item.kind === "service" ? <Clock3 className="h-6 w-6" /> : <ShoppingBag className="h-6 w-6" />}
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge className="rounded-full bg-slate-950 px-3 py-1 text-white hover:bg-slate-950">{kindLabels[item.kind] ?? "Item"}</Badge>
          <StockBadge item={item} />
        </div>
      </div>
      <div className="mt-4 flex-1 space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0F1B33]">{item.category?.name ?? "DOUTORELO"}</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{item.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{item.subtitle ?? item.description ?? "Item de apoio à organização do cuidado."}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tagsOf(item).slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#0F1B33]">{tag}</span>
          ))}
        </div>
        <div className="rounded-3xl border border-[#6EC1B4]/20 bg-white p-3 text-xs leading-5 text-[#0F1B33]">
          {eligibilityLabels[item.eligibility ?? "general"] ?? "Uso geral"}. Não é prescrição nem promessa de resultado.
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <button type="button" onClick={onOpen} className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6EC1B4]/25">
          <span className="block text-2xl font-semibold tracking-tight text-slate-950">{formatMoney(item.priceCents, item.currency ?? "BRL")}</span>
          <span className="text-xs text-slate-500">{cartQuantity > 0 ? `${cartQuantity} no carrinho` : "Toque para ver detalhes"}</span>
        </button>
        <Button disabled={disabled} onClick={onAdd} className="min-h-12 touch-manipulation rounded-full bg-[#0F1B33] px-4 text-white hover:bg-[#162240] disabled:opacity-55">
          <Plus className="mr-1 h-4 w-4" /> Adicionar
        </Button>
      </div>
    </article>
  );
}

function CartPanel({ rows, subtotalCents, notice, isPending, onChange, onCheckout }: { rows: CartRow[]; subtotalCents: number; notice?: string | null; isPending: boolean; onChange: (itemId: number, quantity: number) => void; onCheckout: () => void }) {
  return (
    <Card className="overflow-hidden border-slate-950/10 bg-white/94 shadow-2xl shadow-[0_18px_64px_rgba(13,27,45,0.08)] backdrop-blur lg:sticky lg:top-20">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-2xl"><ShoppingBag className="h-5 w-5 text-[#0F1B33]" /> Carrinho</CardTitle>
          <Badge variant="outline" className="rounded-full border-[#6EC1B4]/20 bg-white text-[#0F1B33]">DEV</Badge>
        </div>
        <CardDescription>Checkout simulado para validar a jornada. Nenhuma cobrança real será feita nesta etapa.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.length === 0 ? (
          <div className="rounded-[1.6rem] border border-dashed border-[#6EC1B4]/20 bg-white p-5 text-sm leading-6 text-slate-600">
            Adicione produtos ou serviços para testar carrinho, estoque e pedido DEV.
          </div>
        ) : rows.map((row) => (
          <div key={row.itemId} className="rounded-[1.45rem] border border-slate-100 bg-white p-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-slate-950">{row.item?.name ?? "Item do marketplace"}</p>
                <p className="mt-1 text-sm text-slate-500">{formatMoney(row.lineTotalCents, row.item?.currency ?? "BRL")}</p>
              </div>
              <button type="button" aria-label="Remover item" onClick={() => onChange(row.itemId, 0)} className="rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-full bg-slate-50 p-1">
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm disabled:opacity-40" disabled={isPending} onClick={() => onChange(row.itemId, row.quantity - 1)}><Minus className="h-4 w-4" /></button>
              <span className="text-sm font-semibold text-slate-950">{row.quantity} un.</span>
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm disabled:opacity-40" disabled={isPending} onClick={() => onChange(row.itemId, row.quantity + 1)}><Plus className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        <div className="rounded-[1.6rem] bg-slate-950 p-4 text-white">
          <div className="flex items-center justify-between text-sm text-slate-300"><span>Subtotal</span><span>{rows.length} item(ns)</span></div>
          <div className="mt-2 text-3xl font-semibold tracking-tight">{formatMoney(subtotalCents)}</div>
        </div>
        {notice ? <p className="rounded-3xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">{notice}</p> : null}
        <Button disabled={rows.length === 0 || isPending} onClick={onCheckout} className="min-h-[3.25rem] w-full touch-manipulation rounded-full bg-[#0F1B33] text-white hover:bg-[#162240] disabled:opacity-50">
          Simular pedido DEV <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default function Marketplace() {
  const utils = trpc.useUtils();
  const [kind, setKind] = useState<"all" | "product" | "service">("all");
  const [categorySlug, setCategorySlug] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);

  const listInput = useMemo(() => ({
    kind: kind === "all" ? undefined : kind,
    categorySlug: categorySlug === "all" ? undefined : categorySlug,
    query: query.trim() || undefined,
  }), [categorySlug, kind, query]);

  const catalog = trpc.marketplace.list.useQuery(listInput);
  const cart = trpc.marketplace.cart.useQuery();
  const orders = trpc.marketplace.orders.useQuery();
  const safeRecommendations = trpc.marketplace.recommendations.useQuery();
  const addToCart = trpc.marketplace.addToCart.useMutation({
    onSuccess: async () => {
      await utils.marketplace.cart.invalidate();
      toast.success("Item adicionado ao carrinho.");
    },
    onError: () => toast.error("Não foi possível adicionar agora. Confira estoque e tente de novo."),
  });
  const updateCart = trpc.marketplace.updateCartItem.useMutation({
    onSuccess: async () => utils.marketplace.cart.invalidate(),
    onError: () => toast.error("Não foi possível atualizar o carrinho."),
  });
  const checkout = trpc.marketplace.checkoutDev.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.marketplace.cart.invalidate(), utils.marketplace.orders.invalidate(), utils.marketplace.list.invalidate()]);
      toast.success("Pedido DEV registrado. Nenhuma cobrança real foi feita.");
    },
    onError: () => toast.error("Não foi possível simular o pedido. Confira o carrinho e o estoque."),
  });

  const items = (catalog.data?.items ?? []) as MarketplaceItem[];
  const cartRows = (cart.data?.items ?? []) as CartRow[];
  const patientOrders = (orders.data?.orders ?? []) as MarketplaceOrder[];
  const recommendations = (safeRecommendations.data?.recommendations ?? []) as MarketplaceRecommendation[];
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    items.forEach((item) => {
      if (item.category?.slug) map.set(item.category.slug, item.category.name);
    });
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [items]);
  const cartQuantityByItem = useMemo(() => new Map(cartRows.map((row) => [row.itemId, row.quantity])), [cartRows]);
  const subtotalCents = cart.data?.subtotalCents ?? 0;
  const isMutating = addToCart.isPending || updateCart.isPending || checkout.isPending;

  return (
    <DashboardLayout>
      <div className="min-h-dvh overflow-x-clip rounded-[1.25rem] bg-white p-3 text-slate-950 sm:p-5 md:rounded-[2rem] md:p-8">
        {catalog.isLoading ? <MarketplaceSkeleton /> : null}
        {catalog.error ? (
          <Card className="mx-auto max-w-4xl border-red-100 bg-white/92 shadow-xl shadow-red-900/5">
            <CardHeader className="gap-4">
              <CardTitle>Não foi possível carregar a loja</CardTitle>
              <CardDescription>Confira sua conexão e tente novamente. Produtos e serviços desta área não substituem consulta profissional.</CardDescription>
              <Button variant="outline" className="min-h-12 w-full rounded-full border-red-200 bg-white text-red-700 sm:w-fit" onClick={() => catalog.refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" /> Tentar novamente
              </Button>
            </CardHeader>
          </Card>
        ) : null}

        {catalog.data ? (
          <div className="mx-auto max-w-7xl space-y-6">
            <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]">
              <Card className="overflow-hidden border-white/80 bg-white/90 shadow-2xl shadow-[0_18px_64px_rgba(13,27,45,0.08)] backdrop-blur">
                <CardHeader className="space-y-5 p-5 sm:p-7">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="rounded-full bg-white px-3 py-1 text-[#0F1B33] hover:bg-white">Marketplace DEV</Badge>
                    <Badge variant="outline" className="rounded-full border-[#6EC1B4]/20 bg-white/70 px-3 py-1 text-[#0F1B33]">App-first iOS/Android</Badge>
                    <Badge variant="outline" className="rounded-full border-amber-200 bg-amber-50 px-3 py-1 text-amber-800">Sem cobrança real</Badge>
                  </div>
                  <div className="space-y-3">
                    <CardTitle className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Loja de apoio ao cuidado, sem promessa clínica.</CardTitle>
                    <CardDescription className="max-w-3xl text-base leading-7 text-slate-600">
                      Produtos e serviços para organizar rotina, documentos e preparo de consulta. A compra nesta fase é simulada em DEV e toda recomendação precisa ser transparente, consentida e não prescritiva.
                    </CardDescription>
                  </div>
                  <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
                    <div className="flex min-h-12 items-center gap-2 rounded-2xl bg-white px-3 py-2 text-[#0F1B33]"><Boxes className="h-4 w-4" /> {items.length} item(ns)</div>
                    <div className="flex min-h-12 items-center gap-2 rounded-2xl bg-white px-3 py-2"><PackageCheck className="h-4 w-4 text-[#0F1B33]" /> Estoque rastreado</div>
                    <div className="flex min-h-12 items-center gap-2 rounded-2xl bg-white px-3 py-2"><BadgeCheck className="h-4 w-4 text-amber-600" /> Claims revisáveis</div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border-slate-950/90 bg-slate-950 text-white shadow-2xl shadow-slate-950/16">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-[#0F1B33]" /> Segurança comercial</CardTitle>
                  <CardDescription className="text-slate-300">A loja apoia organização e continuidade, mas não diagnostica, não prescreve e não orienta urgências.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm leading-6 text-slate-200">
                  <div className="rounded-3xl border border-white/10 bg-white/6 p-4">Itens com dados de saúde exigem consentimento e devem ser apresentados com motivo claro.</div>
                  <div className="rounded-3xl border border-[#6EC1B4]/20 bg-white p-4">Checkout real ficará separado da simulação DEV para evitar cobrança acidental.</div>
                </CardContent>
              </Card>
            </section>

            <section className="rounded-[2rem] border border-white/80 bg-white/82 p-3 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)] backdrop-blur sm:p-4">
              <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por produto, serviço ou tema" className="min-h-[3.1rem] rounded-full border-[#6EC1B4]/20 bg-white pl-11 text-base shadow-sm" />
                </label>
                <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
                  {(["all", "product", "service"] as const).map((value) => (
                    <Button key={value} type="button" variant={kind === value ? "default" : "outline"} onClick={() => setKind(value)} className={`min-h-[3.1rem] shrink-0 rounded-full px-5 ${kind === value ? "bg-[#0F1B33] text-white hover:bg-[#162240]" : "border-[#6EC1B4]/20 bg-white text-[#0F1B33]"}`}>
                      {value === "all" ? "Todos" : value === "product" ? "Produtos" : "Serviços"}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 lg:max-w-sm lg:pb-0">
                  <Button type="button" variant={categorySlug === "all" ? "default" : "outline"} onClick={() => setCategorySlug("all")} className={`min-h-[3.1rem] shrink-0 rounded-full px-5 ${categorySlug === "all" ? "bg-slate-950 text-white hover:bg-slate-900" : "border-slate-200 bg-white text-slate-800"}`}>Todas categorias</Button>
                  {categories.map((category) => (
                    <Button key={category.slug} type="button" variant={categorySlug === category.slug ? "default" : "outline"} onClick={() => setCategorySlug(category.slug)} className={`min-h-[3.1rem] shrink-0 rounded-full px-5 ${categorySlug === category.slug ? "bg-slate-950 text-white hover:bg-slate-900" : "border-slate-200 bg-white text-slate-800"}`}>
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-[2rem] border border-[#6EC1B4]/20 bg-white/88 p-4 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)] backdrop-blur sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <Badge className="w-fit rounded-full bg-white px-3 py-1 text-[#0F1B33] hover:bg-white">Sugestões seguras</Badge>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950">Opções que podem combinar com sua rotina</h2>
                  <p className="max-w-3xl text-sm leading-6 text-slate-600">
                    A IA pode priorizar itens com base no seu perfil e histórico do app, mas sempre com linguagem comercial cautelosa: não prescreve, não promete resultado e não substitui avaliação profissional.
                  </p>
                </div>
                <Button type="button" variant="outline" onClick={() => safeRecommendations.refetch()} disabled={safeRecommendations.isFetching} className="min-h-11 rounded-full border-[#6EC1B4]/20 bg-white text-[#0F1B33]">
                  <RefreshCw className={`mr-2 h-4 w-4 ${safeRecommendations.isFetching ? "animate-spin" : ""}`} /> Atualizar
                </Button>
              </div>
              {safeRecommendations.isLoading ? (
                <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-44 rounded-[1.5rem]" />)}
                </div>
              ) : safeRecommendations.error ? (
                <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  Não foi possível carregar sugestões agora. A loja continua disponível por busca e categorias.
                </div>
              ) : recommendations.length === 0 ? (
                <div className="mt-4 rounded-3xl border border-dashed border-[#6EC1B4]/20 bg-white p-4 text-sm leading-6 text-slate-600">
                  Complete seu perfil e use a preparação de consulta para receber sugestões comerciais mais contextualizadas, sempre opcionais.
                </div>
              ) : (
                <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {recommendations.map((recommendation) => {
                    const item = items.find((candidate) => candidate.id === recommendation.itemId);
                    return (
                      <article key={`${recommendation.itemId}-${recommendation.itemName}`} className="flex min-h-[15rem] flex-col justify-between rounded-[1.55rem] border border-[#6EC1B4]/20 bg-gradient-to-br from-white to-[#F7F8FA] p-4 shadow-sm">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0F1B33]">{recommendation.confidence === "medium" ? "Boa aderência" : "Baixa certeza"}</p>
                              <h3 className="mt-1 text-lg font-semibold text-slate-950">{recommendation.itemName}</h3>
                            </div>
                            <Sparkles className="h-5 w-5 shrink-0 text-[#0F1B33]" />
                          </div>
                          <p className="text-sm leading-6 text-slate-650">{recommendation.fitReason}</p>
                          <p className="rounded-2xl bg-white/78 p-3 text-xs leading-5 text-slate-600">{recommendation.carefulUseNote}</p>
                        </div>
                        <div className="mt-4 flex items-center justify-between gap-3">
                          <span className="text-xs leading-5 text-amber-800">{recommendation.safetyNotice}</span>
                          <Button disabled={!item || isMutating} onClick={() => item && addToCart.mutate({ itemId: item.id, quantity: 1 })} className="shrink-0 rounded-full bg-[#0F1B33] text-white hover:bg-[#162240] disabled:opacity-50">
                            Adicionar
                          </Button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
              {safeRecommendations.data?.audit ? (
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Auditoria: {safeRecommendations.data.audit.status}. {safeRecommendations.data.safetyNotice}
                </p>
              ) : null}
            </section>

            <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,23rem)]">
              <div className="space-y-4">
                {selectedItem ? (
                  <Card className="border-[#6EC1B4]/20 bg-white/94 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
                    <CardHeader className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="rounded-full bg-white px-3 py-1 text-[#0F1B33] hover:bg-white">Detalhe</Badge>
                        <StockBadge item={selectedItem} />
                      </div>
                      <CardTitle className="text-2xl sm:text-3xl">{selectedItem.name}</CardTitle>
                      <CardDescription className="text-base leading-7">{selectedItem.description ?? selectedItem.subtitle ?? "Item de apoio ao cuidado cotidiano."}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                      <p className="rounded-3xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">{selectedItem.commercialNotice ?? catalog.data.safetyNotice}</p>
                      <Button onClick={() => addToCart.mutate({ itemId: selectedItem.id, quantity: 1 })} disabled={isMutating} className="min-h-[3.15rem] rounded-full bg-[#0F1B33] text-white hover:bg-[#162240]">
                        Adicionar por {formatMoney(selectedItem.priceCents, selectedItem.currency ?? "BRL")}
                      </Button>
                    </CardContent>
                  </Card>
                ) : null}

                {items.length === 0 ? (
                  <Card className="border-dashed border-[#6EC1B4]/20 bg-white/86">
                    <CardHeader>
                      <CardTitle>Nenhum item encontrado</CardTitle>
                      <CardDescription>Altere a busca ou a categoria para ver outros produtos e serviços.</CardDescription>
                    </CardHeader>
                  </Card>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        cartQuantity={cartQuantityByItem.get(item.id) ?? 0}
                        isPending={isMutating}
                        onOpen={() => setSelectedItem(item)}
                        onAdd={() => addToCart.mutate({ itemId: item.id, quantity: 1 })}
                      />
                    ))}
                  </div>
                )}
              </div>

              <aside className="space-y-4">
                <CartPanel
                  rows={cartRows}
                  subtotalCents={subtotalCents}
                  notice={cart.data?.notice}
                  isPending={isMutating}
                  onChange={(itemId, quantity) => updateCart.mutate({ itemId, quantity })}
                  onCheckout={() => checkout.mutate({ patientContextNote: "Pedido simulado criado pelo fluxo DEV do marketplace app-first." })}
                />
                <Card className="border-white/80 bg-white/90 shadow-xl shadow-[0_18px_64px_rgba(13,27,45,0.08)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl"><CheckCircle2 className="h-5 w-5 text-[#0F1B33]" /> Pedidos DEV</CardTitle>
                    <CardDescription>Histórico recente do checkout simulado.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {patientOrders.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-slate-200 p-4 text-sm text-slate-600">Pedidos simulados aparecerão aqui.</div>
                    ) : patientOrders.slice(0, 4).map((order) => (
                      <div key={order.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold text-slate-950">Pedido #{order.id}</span>
                          <Badge variant="outline" className="rounded-full border-[#6EC1B4]/20 bg-white text-[#0F1B33]">DEV</Badge>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-slate-600"><span>{formatDate(order.createdAt)}</span><span>{formatMoney(order.subtotalCents ?? 0)}</span></div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </aside>
            </section>

            <div className="fixed inset-x-3 bottom-[calc(7.5rem+env(safe-area-inset-bottom))] z-40 sm:hidden">
              <Button disabled={cartRows.length === 0 || isMutating} onClick={() => checkout.mutate({ patientContextNote: "Pedido simulado criado pelo fluxo mobile DEV." })} className="min-h-[3.35rem] w-full rounded-full bg-[#0F1B33] text-white shadow-2xl shadow-[0_18px_64px_rgba(13,27,45,0.08)] hover:bg-[#162240] disabled:opacity-50">
                <Sparkles className="mr-2 h-4 w-4" /> Simular pedido: {formatMoney(subtotalCents)}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  );
}

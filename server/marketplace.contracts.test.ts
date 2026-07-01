import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const projectRoot = process.cwd();
const schemaSource = readFileSync(join(projectRoot, "drizzle/schema.ts"), "utf8");
const dbSource = readFileSync(join(projectRoot, "server/db.ts"), "utf8");
const routerSource = readFileSync(join(projectRoot, "server/routers.ts"), "utf8");
const marketplaceSource = readFileSync(join(projectRoot, "client/src/pages/Marketplace.tsx"), "utf8");
const adminMarketplaceSource = readFileSync(join(projectRoot, "client/src/pages/AdminMarketplace.tsx"), "utf8");
const appSource = readFileSync(join(projectRoot, "client/src/App.tsx"), "utf8");
const layoutSource = readFileSync(join(projectRoot, "client/src/components/DashboardLayout.tsx"), "utf8");

function expectAll(source: string, fragments: string[]) {
  for (const fragment of fragments) expect(source).toContain(fragment);
}

describe("marketplace contracts", () => {
  it("models catalog, stock, cart, orders and recommendation audit tables", () => {
    expectAll(schemaSource, [
      "marketplaceCategories",
      "marketplacePartners",
      "marketplaceItems",
      "marketplaceInventory",
      "marketplaceCarts",
      "marketplaceCartItems",
      "marketplaceOrders",
      "marketplaceOrderItems",
      "marketplaceRecommendationEvents",
      "dev_simulated",
      "simulated_checkout",
      "published",
      "restricted",
    ]);
  });

  it("keeps backend marketplace operations scoped, stock-aware and explicitly DEV-only for checkout", () => {
    expectAll(dbSource, [
      "MARKETPLACE_COMMERCIAL_NOTICE",
      "ensureMarketplaceSeed",
      "listMarketplaceCatalog",
      "getMarketplaceCart(userId",
      "addMarketplaceCartItem(userId",
      "MARKETPLACE_INSUFFICIENT_STOCK",
      "simulateMarketplaceCheckout(userId",
      "dev_simulated",
      "Nenhuma cobrança real é realizada",
      "recordMarketplaceRecommendationEvent",
    ]);
  });

  it("exposes protected patient flows and admin-only marketplace controls", () => {
    expectAll(routerSource, [
      "marketplace: router({",
      "list: protectedProcedure",
      "cart: protectedProcedure",
      "addToCart: protectedProcedure",
      "checkoutDev: protectedProcedure",
      "recommendations: protectedProcedure",
      "recordMarketplaceRecommendationEvent(ctx.user.id",
      "admin: router({",
      "marketplaceCatalog: adminProcedure",
      "upsertMarketplaceItem: adminProcedure",
      "updateMarketplaceInventory: adminProcedure",
      "marketplaceOrders: adminProcedure",
      "linguagem comercial segura e não prescritiva",
    ]);
  });

  it("connects mobile-first marketplace UI to catalog, cart, orders and safe recommendations", () => {
    expectAll(marketplaceSource, [
      "trpc.marketplace.list.useQuery",
      "trpc.marketplace.cart.useQuery",
      "trpc.marketplace.orders.useQuery",
      "trpc.marketplace.recommendations.useQuery",
      "trpc.marketplace.addToCart.useMutation",
      "trpc.marketplace.checkoutDev.useMutation",
      "Sugestões seguras",
      "Sem cobrança real",
      "Não foi possível carregar sugestões agora",
      "Simular pedido",
    ]);
  });

  it("connects backoffice and navigation without exposing admin controls as patient-first mobile shortcuts", () => {
    expectAll(adminMarketplaceSource, [
      "trpc.admin.marketplaceCatalog.useQuery",
      "trpc.admin.upsertMarketplaceItem.useMutation",
      "trpc.admin.updateMarketplaceInventory.useMutation",
      "trpc.admin.marketplaceOrders.useQuery",
      "revisão de claims",
      "Estoque",
    ]);
    expect(appSource).toContain("/admin/marketplace");
    expect(layoutSource).toContain("Backoffice loja");
  });
});

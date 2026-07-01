import { afterAll, describe, expect, it } from "vitest";
import { and, eq, like, sql } from "drizzle-orm";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  marketplaceCartItems,
  marketplaceCarts,
  marketplaceCategories,
  marketplaceInventory,
  marketplaceItems,
  marketplaceOrderItems,
  marketplaceOrders,
  marketplacePartners,
  users,
} from "../drizzle/schema";
import {
  addMarketplaceCartItem,
  closeDbPool,
  getDb,
  simulateMarketplaceCheckout,
} from "./db";

function extractInsertId(result: unknown): number {
  const rows = Array.isArray(result) ? result : [result];
  const first = rows[0] as { insertId?: number | string } | undefined;
  const id = Number(first?.insertId ?? 0);
  if (!Number.isInteger(id) || id <= 0) throw new Error(`Unable to extract insertId from ${JSON.stringify(result)}`);
  return id;
}

type MarketplaceFixture = {
  marker: string;
  userId: number;
  secondUserId?: number;
  categoryId: number;
  partnerId: number;
  itemId: number;
};

async function createMarketplaceFixture(stockOnHand: number, secondUser = false): Promise<MarketplaceFixture> {
  const db = await getDb();
  if (!db) throw new Error("DATABASE_URL is required for marketplace hardening tests.");

  const marker = `phase1-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const categoryId = extractInsertId(await db.insert(marketplaceCategories).values({
    slug: `${marker}-category`,
    name: `Phase 1 Category ${marker}`,
    active: 1,
  }));
  const partnerId = extractInsertId(await db.insert(marketplacePartners).values({
    slug: `${marker}-partner`,
    name: `Phase 1 Partner ${marker}`,
    active: 1,
  }));
  const userId = extractInsertId(await db.insert(users).values({
    openId: `${marker}-user-1`,
    name: "Phase 1 User 1",
    email: `${marker}-1@example.test`,
    loginMethod: "vitest",
  }));
  const secondUserId = secondUser
    ? extractInsertId(await db.insert(users).values({
        openId: `${marker}-user-2`,
        name: "Phase 1 User 2",
        email: `${marker}-2@example.test`,
        loginMethod: "vitest",
      }))
    : undefined;
  const itemId = extractInsertId(await db.insert(marketplaceItems).values({
    slug: `${marker}-item`,
    kind: "product",
    categoryId,
    partnerId,
    name: `Phase 1 Item ${marker}`,
    subtitle: "Fixture de teste concorrencial",
    description: "Item criado por Vitest para validar hardening transacional.",
    claimReviewNotes: "Sem alegações clínicas; fixture isolada.",
    commercialNotice: "Teste automatizado sem cobrança real.",
    priceCents: 1990,
    currency: "BRL",
    publicationStatus: "published",
    eligibility: "general",
    inventoryPolicy: "track_stock",
    requiresConsent: 0,
    featured: 0,
  }));
  await db.insert(marketplaceInventory).values({ itemId, stockOnHand, reservedStock: 0, lowStockThreshold: 0 });

  return { marker, userId, secondUserId, categoryId, partnerId, itemId };
}

async function cleanupMarketplaceFixture(fixture: MarketplaceFixture): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const userIds = [fixture.userId, fixture.secondUserId].filter((id): id is number => typeof id === "number");

  for (const userId of userIds) {
    const orderRows = await db.select({ id: marketplaceOrders.id }).from(marketplaceOrders).where(eq(marketplaceOrders.userId, userId));
    for (const order of orderRows) {
      await db.delete(marketplaceOrderItems).where(eq(marketplaceOrderItems.orderId, order.id));
    }
    await db.delete(marketplaceOrders).where(eq(marketplaceOrders.userId, userId));

    const cartRows = await db.select({ id: marketplaceCarts.id }).from(marketplaceCarts).where(eq(marketplaceCarts.userId, userId));
    for (const cart of cartRows) {
      await db.delete(marketplaceCartItems).where(eq(marketplaceCartItems.cartId, cart.id));
    }
    await db.delete(marketplaceCarts).where(eq(marketplaceCarts.userId, userId));
    await db.execute(sql`DELETE FROM clinicalMemoryEvents WHERE userId = ${userId}`);
    await db.delete(users).where(eq(users.id, userId));
  }

  await db.delete(marketplaceInventory).where(eq(marketplaceInventory.itemId, fixture.itemId));
  await db.delete(marketplaceItems).where(eq(marketplaceItems.id, fixture.itemId));
  await db.delete(marketplacePartners).where(eq(marketplacePartners.id, fixture.partnerId));
  await db.delete(marketplaceCategories).where(eq(marketplaceCategories.id, fixture.categoryId));
}

describe.runIf(Boolean(process.env.DATABASE_URL))("marketplace hardening runtime", () => {
  afterAll(async () => {
    const db = await getDb();
    if (db) {
      const leakedUsers = await db.select({ id: users.id }).from(users).where(like(users.openId, "phase1-%"));
      for (const leaked of leakedUsers) {
        await db.execute(sql`DELETE FROM clinicalMemoryEvents WHERE userId = ${leaked.id}`);
      }
    }
    await closeDbPool();
  });

  it("mantém apenas um carrinho ativo sob múltiplos adds concorrentes", async () => {
    const fixture = await createMarketplaceFixture(10);
    try {
      await Promise.all(
        Array.from({ length: 8 }, () => addMarketplaceCartItem(fixture.userId, { itemId: fixture.itemId, quantity: 1 })),
      );

      const db = await getDb();
      if (!db) throw new Error("Database unavailable after fixture creation.");
      const activeCarts = await db
        .select()
        .from(marketplaceCarts)
        .where(and(eq(marketplaceCarts.userId, fixture.userId), eq(marketplaceCarts.status, "active")));
      expect(activeCarts).toHaveLength(1);
      expect(activeCarts[0]?.activeCartKey).toBe(`user:${fixture.userId}:active`);
    } finally {
      await cleanupMarketplaceFixture(fixture);
    }
  }, 60_000);

  it("retorna o mesmo pedido para checkouts paralelos com a mesma chave de idempotência", async () => {
    const fixture = await createMarketplaceFixture(1);
    try {
      await addMarketplaceCartItem(fixture.userId, { itemId: fixture.itemId, quantity: 1 });
      const idempotencyKey = `same-key-${fixture.marker}`;
      const results = await Promise.allSettled([
        simulateMarketplaceCheckout(fixture.userId, { idempotencyKey }),
        simulateMarketplaceCheckout(fixture.userId, { idempotencyKey }),
      ]);

      expect(results.every((result) => result.status === "fulfilled")).toBe(true);
      const fulfilled = results.filter((result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof simulateMarketplaceCheckout>>> => result.status === "fulfilled");
      expect(fulfilled[0]?.value.order.id).toBe(fulfilled[1]?.value.order.id);

      const db = await getDb();
      if (!db) throw new Error("Database unavailable after checkout.");
      const orders = await db.select().from(marketplaceOrders).where(eq(marketplaceOrders.userId, fixture.userId));
      const inventory = await db.select().from(marketplaceInventory).where(eq(marketplaceInventory.itemId, fixture.itemId)).limit(1);
      expect(orders).toHaveLength(1);
      expect(orders[0]?.idempotencyKey).toBe(idempotencyKey);
      expect(inventory[0]?.stockOnHand).toBe(0);
    } finally {
      await cleanupMarketplaceFixture(fixture);
    }
  }, 60_000);

  it("impede overselling quando dois usuários disputam a última unidade", async () => {
    const fixture = await createMarketplaceFixture(1, true);
    if (!fixture.secondUserId) throw new Error("Second user fixture was not created.");

    try {
      await Promise.all([
        addMarketplaceCartItem(fixture.userId, { itemId: fixture.itemId, quantity: 1 }),
        addMarketplaceCartItem(fixture.secondUserId, { itemId: fixture.itemId, quantity: 1 }),
      ]);

      const results = await Promise.allSettled([
        simulateMarketplaceCheckout(fixture.userId, { idempotencyKey: `race-a-${fixture.marker}` }),
        simulateMarketplaceCheckout(fixture.secondUserId, { idempotencyKey: `race-b-${fixture.marker}` }),
      ]);

      const fulfilled = results.filter((result) => result.status === "fulfilled");
      const rejected = results.filter((result) => result.status === "rejected") as PromiseRejectedResult[];
      expect(fulfilled).toHaveLength(1);
      expect(rejected).toHaveLength(1);
      expect(String(rejected[0]?.reason?.message ?? rejected[0]?.reason)).toContain("MARKETPLACE_ITEM_OUT_OF_STOCK");

      const db = await getDb();
      if (!db) throw new Error("Database unavailable after checkout race.");
      const inventory = await db.select().from(marketplaceInventory).where(eq(marketplaceInventory.itemId, fixture.itemId)).limit(1);
      const orderCountRows = await db.execute(sql`SELECT COUNT(*) AS count FROM marketplaceOrders WHERE userId IN (${fixture.userId}, ${fixture.secondUserId})`);
      const orderCount = Number((Array.isArray(orderCountRows[0]) ? orderCountRows[0][0] : undefined as { count?: number | string } | undefined)?.count ?? 0);
      expect(inventory[0]?.stockOnHand).toBe(0);
      expect(orderCount).toBe(1);
    } finally {
      await cleanupMarketplaceFixture(fixture);
    }
  }, 60_000);
});

describe("phase 1 hardening source contracts", () => {
  const dbSource = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
  const schemaSource = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
  const llmSource = readFileSync(resolve(process.cwd(), "server/_core/llm.ts"), "utf8");
  const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");

  it("declara chaves únicas de carrinho ativo e checkout idempotente", () => {
    expect(schemaSource).toContain("activeCartKey");
    expect(schemaSource).toContain("marketplaceCarts_activeCartKey_unique");
    expect(schemaSource).toContain("idempotencyKey");
    expect(schemaSource).toContain("marketplaceOrders_userId_idempotencyKey_unique");
  });

  it("protege checkout com transação, FOR UPDATE, decremento atômico e reconsulta idempotente", () => {
    expect(dbSource).toContain("db.transaction");
    expect(dbSource).toContain("FOR UPDATE");
    expect(dbSource).toContain("stockOnHand = stockOnHand -");
    expect(dbSource).toContain("affectedRows");
    expect(dbSource).toContain("MARKETPLACE_ITEM_OUT_OF_STOCK");
    expect(dbSource).toContain("idempotencyKey: checkoutResult.idempotencyKey");
  });

  it("inclui pool explícito, fallback DEV/PROD e encerramento gracioso", () => {
    expect(dbSource).toContain("mysql.createPool");
    expect(dbSource).toContain("connectionLimit");
    expect(dbSource).toContain("closeDbPool");
    expect(dbSource).toContain("DAYAN_PROFESSIONAL_FALLBACK_MODE");
    expect(dbSource).toContain("production");
  });

  it("aplica timeout uniforme nas integrações LLM centrais e diretas", () => {
    expect(llmSource).toContain("AbortController");
    expect(llmSource).toContain("LLM_REQUEST_TIMEOUT_MS");
    expect(llmSource).toContain("LLM_REQUEST_TIMEOUT");
    // routers.ts now delegates to invokeLLM which handles timeout internally
    expect(routerSource).toContain("invokeLLM");
  });
});

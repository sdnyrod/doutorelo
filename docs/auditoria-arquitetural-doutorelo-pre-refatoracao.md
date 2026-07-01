# Auditoria Arquitetural Pré-Refatoração — DoutorElo / Saúde Integrativa IA

**Autor:** Manus AI  
**Responsável de negócio:** Sidney  
**Data:** 05/05/2026  
**Modo de trabalho:** análise documental primeiro; nenhuma nova recodificação ou refatoração deve ser iniciada sem aprovação explícita do Sidney.

> **Decisão operacional:** este documento é uma auditoria técnica e uma proposta de intervenção. Os blocos de código em “Código refatorado pronto” são propostas revisáveis, não alterações aplicadas. A recodificação deve começar somente depois de aceite formal do escopo, da prioridade e da estratégia de migração.

## Sumário executivo

A base atual do DoutorElo tem sinais positivos importantes: o projeto compila, o TypeScript passa em `tsc --noEmit`, o build de produção passa, há uso de Drizzle ORM, tRPC, procedimentos protegidos, schema estruturado para marketplace, jornada de cuidado, memória clínica, corpus e aprendizagem de IA. Também existe uma camada de gateway para a jornada clínica com **schema JSON estrito, guardrails pós-resposta e fallback determinístico** em parte do fluxo de IA.

O risco central não é “o sistema não funciona hoje”; o risco é que alguns caminhos críticos ainda foram desenhados como **produto em desenvolvimento**, não como infraestrutura de hiper-escala. Os pontos de maior severidade são concorrência transacional no marketplace, política inconsistente de timeout em chamadas de IA, fallback silencioso para seeds locais quando o banco falha, pool/conexão de banco pouco explícito no código de aplicação, testes de marketplace ainda majoritariamente contratuais por string e ausência de uma estratégia clara de idempotência para checkout, carrinho ativo e escrita concorrente.

| Área auditada | Estado atual | Severidade | Decisão recomendada |
|---|---:|---:|---|
| Build e TypeScript | `pnpm check` e `pnpm build` passaram | Baixa | Manter como baseline antes de qualquer refatoração |
| Banco/Drizzle | Schema amplo, porém conexão/pool e transações críticas precisam endurecimento | Alta | Refatorar com pool explícito, transações ACID e índices adicionais |
| Marketplace | Estoque e checkout não estão protegidos contra corrida de concorrência | Crítica | Bloquear recodificação funcional até desenhar migração transacional |
| Profissionais/localização | Houve evolução para resolução dinâmica, mas fallback DB→seed ainda mascara falhas | Alta | Separar fallback DEV de comportamento PROD e auditar indisponibilidade |
| IA/LLM | Gateway clínico é forte; cliente LLM built-in não possui timeout/circuit breaker | Alta | Unificar política de timeout/fallback/telemetria |
| Testes | Há bons testes de localização e jornada clínica; marketplace é frágil contra runtime | Média/Alta | Criar testes comportamentais e concorrenciais antes da refatoração |

## Evidências analisadas

A análise foi baseada em inspeção estática e validação local, sem executar migração de banco nem aplicar novas alterações de código após a mudança de orientação do Sidney. O working tree já continha alterações pendentes anteriores relacionadas a localização de profissionais, testes e documentos; elas foram tratadas como estado existente e não como autorização para novas refatorações.

| Evidência | Resultado |
|---|---|
| `pnpm check` | Passou com `tsc --noEmit` |
| `pnpm build` | Passou com Vite e bundle server via esbuild |
| Working tree | Há arquivos modificados e não rastreados: `Home.tsx`, `dayanNetworkProfessionalsSeed.ts`, `db.ts`, `homeChat.test.ts`, `routers.ts`, `todo.md`, documentos e `professionalLocation.test.ts` |
| Banco/queries | `server/db.ts` concentra conexão, seed, marketplace, perfil, memória e recomendações |
| Router | `server/routers.ts` concentra grande volume de lógica e múltiplas responsabilidades |
| Testes | `professionalLocation.test.ts` é comportamental; `marketplace.contracts.test.ts` valida presença de strings, não concorrência/runtime |

## 🚫 ALERTA VERMELHO

### 1. Checkout e estoque têm condição de corrida crítica

O fluxo `simulateMarketplaceCheckout()` valida estoque antes de gravar o pedido e depois decrementa `stockOnHand` com base no snapshot carregado anteriormente. Em ambiente com múltiplas requisições simultâneas, duas sessões podem observar o mesmo estoque disponível, ambas passar na validação e ambas gravar pedidos. O uso de `Math.max(0, stockOnHand - quantity)` evita número negativo, mas não evita **overselling lógico** nem garante integridade econômica.

O Drizzle oferece suporte nativo a transações com `db.transaction(async (tx) => { ... })`, inclusive com rollback por exceção, o que deve ser usado para agrupar leitura do carrinho, criação de pedido, criação de itens, decremento de estoque e conversão do carrinho numa única unidade ACID.[1]

> A documentação do Drizzle apresenta transações como o mecanismo para executar múltiplas operações em uma unidade atômica e permite rollback explícito dentro do callback transacional.[1]

| Evidência local | Problema |
|---|---|
| `server/db.ts`, `simulateMarketplaceCheckout()` | Validação de estoque antes da escrita, fora de transação |
| `server/db.ts`, update de `marketplaceInventory` | Decremento baseado em snapshot, sem `WHERE stockOnHand >= quantity` |
| `marketplace.contracts.test.ts` | Teste confirma presença de strings, mas não prova atomicidade |

**Impacto:** em escala, a loja pode confirmar pedidos simulados ou futuros pedidos reais com estoque inexistente. Mesmo em modo DEV, o padrão arquitetural se tornará perigoso quando pagamentos reais entrarem no fluxo.

### 2. Carrinho ativo não tem garantia forte de unicidade sob concorrência

`getOrCreateActiveMarketplaceCart()` procura um carrinho ativo e, se não encontrar, insere um novo. O schema tem índice `marketplaceCarts_userId_status_idx`, mas ele não é único. Duas requisições paralelas podem criar dois carrinhos ativos para o mesmo usuário. Esse é um clássico problema de **check-then-insert race condition**.

| Evidência local | Problema |
|---|---|
| `marketplaceCarts` | Índice composto por `userId,status`, mas não único |
| `getOrCreateActiveMarketplaceCart()` | Leitura e criação separadas, sem lock, sem transação e sem chave idempotente |

**Impacto:** inconsistência no carrinho, pedidos duplicados, bugs intermitentes difíceis de reproduzir e risco de cobrança duplicada quando pagamento real for ativado.

### 3. Fallback silencioso do banco para seed local pode mascarar indisponibilidade em produção

`listDayanNetworkProfessionals()` retorna seeds locais quando `getDb()` falha ou quando a query falha. Esse comportamento é útil em desenvolvimento, mas perigoso em produção porque transforma indisponibilidade do banco em resposta aparentemente válida. Em uma aplicação de saúde, isso pode exibir uma base desatualizada, omitir profissionais reais, sugerir cobertura inexistente ou esconder falha operacional que deveria acionar alerta.

| Evidência local | Problema |
|---|---|
| `server/db.ts`, `getDb()` | Retorna `null` quando não há `DATABASE_URL` ou erro de conexão |
| `listDayanNetworkProfessionals()` | `if (!db) return fallback` e `catch (...) return fallback` |
| `resolveDayanNetworkProfessionalLocationFromMessage()` | Usa base de profissionais para resolver cidade e pode herdar fallback |

**Impacto:** o sistema pode degradar silenciosamente em vez de falhar de forma observável. Para hiper-escala, fallback precisa ser deliberado, auditável e separado por ambiente.

### 4. Política de timeout e circuit breaker de IA é inconsistente

O gateway clínico em `server/ai/modelGateway.ts` tem arquitetura defensiva: schema estrito, fallback por provedor, guardrail pós-resposta e auditoria. Porém o cliente compartilhado `server/_core/llm.ts` usa `fetch` para o provedor built-in sem timeout explícito, sem retry controlado e sem circuit breaker. Isso cria assimetria: parte do sistema degrada com segurança, parte pode manter requisições penduradas até esgotar workers/conexões.

| Evidência local | Ponto positivo | Lacuna |
|---|---|---|
| `modelGateway.ts` | Fallback determinístico e validação de JSON/schema | Depende de provedores com políticas diferentes |
| `llm.ts` | Abstrai mensagens, tools e response format | Sem `AbortController`, deadline, retry budget ou breaker |
| `ENV.externalProviderTimeoutMs` | Existe configuração de timeout para provedores externos | Não está aplicada uniformemente ao cliente built-in |

**Impacto:** sob instabilidade do provedor LLM ou rede, a aplicação pode acumular requisições longas, degradar latência global e amplificar custos.

### 5. Pool de conexão e lifecycle do banco não estão suficientemente explícitos para hiper-escala

O código usa uma instância global `_db` criada a partir de `drizzle(process.env.DATABASE_URL)`. Esse padrão é simples, mas para escala alta falta explicitar limites de pool, timeout de conexão, timeout de fila, encerramento gracioso e métricas de saturação. A documentação do `mysql2` recomenda uso de pool para reutilização de conexões, evitando criação contínua e permitindo controle de limites operacionais.[2]

> O `mysql2` fornece `createPool()` e API Promise para reuso de conexões e controle explícito de parâmetros como `connectionLimit`.[2]

| Evidência local | Risco |
|---|---|
| `server/db.ts`, `_db` global | Sem parâmetros operacionais visíveis de pool |
| `requireDb()` | Lança indisponibilidade, mas nem todos os fluxos usam require estrito |
| Ausência de shutdown explícito | Risco de conexões pendentes em restart/deploy |

**Impacto:** em Cloud Run ou ambientes elásticos, instâncias podem escalar horizontalmente e multiplicar conexões. Sem limite explícito e observabilidade, o banco pode virar SPOF por saturação.

## ⚠️ DÉBITO TÉCNICO

### 1. `server/db.ts` concentra responsabilidades demais

O arquivo `server/db.ts` mistura conexão, normalização de usuário, seed, resolução de profissionais, memória clínica, marketplace, pedidos, eventos, dashboard e operações administrativas. Isso aumenta complexidade ciclomática, dificulta testes isolados e torna mudanças pequenas arriscadas.

| Módulo proposto | Responsabilidade |
|---|---|
| `server/db/connection.ts` | Pool, Drizzle, health, shutdown e helpers transacionais |
| `server/repositories/professionals.ts` | Consultas de profissionais sem fallback implícito |
| `server/repositories/marketplace.ts` | Catálogo, carrinho, estoque, pedidos e transações |
| `server/services/marketplaceCheckout.ts` | Orquestração idempotente de checkout |
| `server/services/professionalRecommendation.ts` | Ranking e regras de localização |
| `server/services/aiGateway.ts` | Política única de timeout/fallback/telemetria para LLM |

### 2. Router principal tende a virar monólito de procedures

`server/routers.ts` concentra schemas Zod, helpers de localização, chamadas de IA, composição de resposta, marketplace, admin e rotas públicas/protegidas. Essa estrutura é aceitável em protótipo, mas não escala bem para times, revisões ou ownership por domínio.

A proposta é separar routers por domínio, por exemplo `routers/homeChat.ts`, `routers/marketplace.ts`, `routers/adminMarketplace.ts`, `routers/careJourney.ts` e `routers/patientMemory.ts`, mantendo `server/routers.ts` apenas como composição.

### 3. Testes de marketplace são insuficientes para risco financeiro/estoque

`server/marketplace.contracts.test.ts` valida que determinadas strings existem no código. Isso é útil como teste de contrato textual, mas não valida comportamento transacional, concorrência, rollback, idempotência ou autorização. Antes de qualquer integração de pagamento real, devem existir testes que simulem duas chamadas concorrentes tentando consumir o último item de estoque.

| Teste necessário | O que deve provar |
|---|---|
| Checkout concorrente com estoque 1 | Apenas uma requisição confirma pedido; a outra falha com estoque insuficiente |
| Carrinho ativo concorrente | Apenas um carrinho ativo por usuário é criado |
| Rollback no meio do checkout | Pedido, itens e estoque voltam ao estado anterior |
| Idempotency key | Repetição da mesma tentativa não duplica pedido |
| Falha de DB em profissionais | Produção retorna erro observável; DEV pode usar seed com aviso explícito |

### 4. Tipagem estrita ainda tem pontos de coerção perigosa

A base compila, mas existem coerções como `(data as any)` em `server/_core/sdk.ts` para normalizar dados do provedor OAuth. O TypeScript recomenda o modo `strict` para ativar uma família de verificações mais rigorosas e capturar classes de erro antes do runtime.[3]

| Evidência local | Risco |
|---|---|
| `server/_core/sdk.ts`, coerções `as any` | Contratos externos podem mudar e passar despercebidos |
| Payloads JSON em `text` | Ausência de schema DB-level e parsing validado em alguns campos |
| Resultados Drizzle/driver | Extração de insertId/affectedRows precisa tipagem defensiva |

### 5. RAG/corpus usa `text` para embeddings, sem estratégia vetorial clara

`dayanCorpusChunks.embedding` está como `text`. Isso pode ser suficiente para armazenamento inicial, mas não para recuperação semântica em escala. Para hiper-crescimento, embeddings devem ter governança de versão, dimensão, normalização, estratégia de índice vetorial ou serviço dedicado, além de métricas de recall/latência.

| Tabela | Risco de escala |
|---|---|
| `dayanCorpusChunks` | Busca textual/vetorial pode virar gargalo se feita fora de índice especializado |
| `mlLearningEvents` | Crescimento rápido exige particionamento lógico por data e política LGPD |
| `aiModelExecutions` | Auditoria por usuário/sessão existe, mas retenção e arquivamento precisam política clara |

### 6. Payload HTTP grande pode ampliar custo e superfície de abuso

O servidor Express aceita JSON/urlencoded com limite de `50mb`. Para fluxos de saúde, documentos e áudio devem ir por storage controlado, não pelo corpo JSON principal. Payload grande aumenta risco de consumo de memória, latência e abuso de endpoint.

## 📐 PROPOSTA DE REFATORAÇÃO DE ESQUEMA

### Estratégia geral

A refatoração deve ser feita em fases pequenas, com migrações reversíveis, testes antes do código de produção e checkpoint apenas após validação. A prioridade não deve ser “limpar tudo”; deve ser eliminar as classes de falha que podem corromper dados, mascarar indisponibilidade ou travar requisições em escala.

| Fase | Mudança | Risco reduzido |
|---:|---|---|
| 1 | Criar camada de conexão/pool e health DB | Saturação e falha silenciosa |
| 2 | Criar constraints de carrinho ativo e idempotência | Duplicidade e corrida |
| 3 | Refatorar checkout em transação ACID | Overselling e pedido parcial |
| 4 | Separar fallback DEV/PROD para profissionais | Resposta stale mascarando falha |
| 5 | Unificar timeout/circuit breaker LLM | Worker preso e latência extrema |
| 6 | Modularizar routers/repositories | Manutenibilidade e testabilidade |

### Alterações recomendadas em schema Drizzle

Abaixo estão mudanças propostas para revisão. Elas não foram aplicadas.

| Tabela | Mudança proposta | Justificativa |
|---|---|---|
| `marketplaceCarts` | Adicionar `activeCartKey varchar(191)` com unique index; valor `user:${userId}` apenas em carrinho ativo e `NULL` ao converter | Garante um único carrinho ativo sem impedir histórico de carrinhos convertidos |
| `marketplaceOrders` | Adicionar `idempotencyKey varchar(191)` e unique `(userId, idempotencyKey)` | Evita pedido duplicado em retry, duplo clique ou timeout de cliente |
| `marketplaceOrders` | Adicionar índice `(userId, createdAt)` | Listagem de histórico por usuário em ordem temporal |
| `marketplaceInventory` | Manter unique `itemId`, adicionar índice `(stockOnHand, lowStockThreshold)` se houver backoffice de reposição | Permite alertas de baixo estoque sem scan total |
| `dayanNetworkProfessionals` | Índice composto `(active, state, city)` e índice por especialidade normalizada | Reduz custo de recomendação por localização |
| `aiModelExecutions` | Índice `(status, createdAt)` | Observabilidade operacional de falhas recentes |
| `mlLearningEvents` | Índice `(isTrainingCandidate, createdAt)` e política de retenção por data | Curadoria e arquivamento em escala |
| `dayanCorpusChunks` | Separar embedding para tabela dedicada ou serviço vetorial | Evita tabela quente com texto grande e busca sem índice |

### Política de conexão e pool

A camada de banco deve construir um pool explícito com `mysql2/promise`, limites por instância, timeout de conexão, timeout de fila e `graceful shutdown`. O `mysql2` documenta `createPool()` como forma de criar um pool de conexões reutilizáveis, com API Promise via `.promise()` ou import promise.[2]

| Parâmetro | Recomendação inicial | Observação |
|---|---:|---|
| `connectionLimit` | 5 a 10 por instância | Ajustar conforme limite real do banco e número de instâncias |
| `waitForConnections` | `true` | Evita falha imediata em micro-picos |
| `queueLimit` | Finito, por exemplo 100 | Evita fila infinita e latência explosiva |
| `connectTimeout` | 3s a 5s | Falha rápida e observável |
| Health DB | Query leve com timeout | Separar readiness de liveness |

### Política de transações

O Drizzle deve ser usado com `db.transaction()` para operações multi-step. As transações devem conter apenas o trecho crítico, sem chamada LLM, sem network externo e sem renderização de resposta dentro da transação.[1]

| Operação | Transação? | Observação |
|---|---:|---|
| Criar carrinho ativo | Sim | Usar chave única/idempotente |
| Adicionar item ao carrinho | Sim se depender de regra de estoque reservável | Pode ser otimista enquanto checkout for simulado |
| Checkout | Sim, obrigatório | Pedido, itens, estoque e carrinho juntos |
| Evento de memória pós-checkout | Preferencialmente fora ou em outbox | Evita acoplar pedido a evento não crítico |
| Chamada LLM | Não | Nunca segurar transação enquanto espera rede |

## 💻 CÓDIGO REFATORADO PRONTO

Os blocos abaixo são a **proposta de código para aprovação**, não código aplicado. Eles estão escritos de forma concreta para reduzir ambiguidade na próxima fase.

### 1. Camada de conexão com pool explícito

```ts
// server/db/connection.ts
import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import mysql, { type Pool } from "mysql2/promise";
import * as schema from "../../drizzle/schema";

type AppDatabase = MySql2Database<typeof schema>;

let pool: Pool | null = null;
let db: AppDatabase | null = null;

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) throw new Error("DATABASE_URL_NOT_CONFIGURED");
  return databaseUrl;
}

export function getPool(): Pool {
  if (pool) return pool;

  pool = mysql.createPool({
    uri: getDatabaseUrl(),
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_CONNECTION_LIMIT ?? 8),
    queueLimit: Number(process.env.DB_POOL_QUEUE_LIMIT ?? 100),
    connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT_MS ?? 5000),
    enableKeepAlive: true,
    keepAliveInitialDelay: 10_000,
  });

  return pool;
}

export function getDb(): AppDatabase {
  if (db) return db;
  db = drizzle(getPool(), { schema, mode: "default" });
  return db;
}

export async function closeDbPool(): Promise<void> {
  if (!pool) return;
  const currentPool = pool;
  pool = null;
  db = null;
  await currentPool.end();
}

export async function assertDbReady(): Promise<{ ok: true; latencyMs: number }> {
  const startedAt = Date.now();
  await getPool().query("select 1 as ok");
  return { ok: true, latencyMs: Date.now() - startedAt };
}
```

### 2. Schema proposto para carrinho ativo e idempotência

```ts
// drizzle/schema.ts — proposta, não aplicada
export const marketplaceCarts = mysqlTable(
  "marketplaceCarts",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    status: mysqlEnum("status", marketplaceCartStatusValues).default("active").notNull(),
    activeCartKey: varchar("activeCartKey", { length: 191 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userStatusIdx: index("marketplaceCarts_userId_status_idx").on(table.userId, table.status),
    activeCartKeyUnique: uniqueIndex("marketplaceCarts_activeCartKey_unique").on(table.activeCartKey),
  }),
);

export const marketplaceOrders = mysqlTable(
  "marketplaceOrders",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    cartId: int("cartId").references(() => marketplaceCarts.id),
    idempotencyKey: varchar("idempotencyKey", { length: 191 }).notNull(),
    status: mysqlEnum("status", marketplaceOrderStatusValues).default("draft").notNull(),
    subtotalCents: int("subtotalCents").default(0).notNull(),
    currency: varchar("currency", { length: 3 }).default("BRL").notNull(),
    checkoutMode: varchar("checkoutMode", { length: 80 }).default("dev_simulated").notNull(),
    patientContextNote: text("patientContextNote"),
    safetyNotice: text("safetyNotice"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userStatusIdx: index("marketplaceOrders_userId_status_idx").on(table.userId, table.status),
    userCreatedIdx: index("marketplaceOrders_userId_createdAt_idx").on(table.userId, table.createdAt),
    cartIdx: index("marketplaceOrders_cartId_idx").on(table.cartId),
    userIdempotencyUnique: uniqueIndex("marketplaceOrders_userId_idempotencyKey_unique").on(table.userId, table.idempotencyKey),
  }),
);
```

### 3. Carrinho ativo idempotente

```ts
import { and, eq } from "drizzle-orm";
import { marketplaceCarts } from "../../drizzle/schema";
import { getDb } from "../db/connection";

function activeCartKeyForUser(userId: number): string {
  return `user:${userId}`;
}

export async function getOrCreateActiveMarketplaceCart(userId: number) {
  const db = getDb();
  const activeCartKey = activeCartKeyForUser(userId);

  return db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(marketplaceCarts)
      .where(eq(marketplaceCarts.activeCartKey, activeCartKey))
      .limit(1);

    if (existing[0]) return existing[0];

    await tx
      .insert(marketplaceCarts)
      .values({ userId, status: "active", activeCartKey })
      .onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });

    const created = await tx
      .select()
      .from(marketplaceCarts)
      .where(eq(marketplaceCarts.activeCartKey, activeCartKey))
      .limit(1);

    if (!created[0]) throw new Error("MARKETPLACE_ACTIVE_CART_CREATE_FAILED");
    return created[0];
  });
}
```

### 4. Checkout transacional com decremento atômico de estoque

```ts
import { and, eq, gte, sql } from "drizzle-orm";
import {
  marketplaceCartItems,
  marketplaceCarts,
  marketplaceInventory,
  marketplaceItems,
  marketplaceOrderItems,
  marketplaceOrders,
} from "../../drizzle/schema";
import { getDb } from "../db/connection";

function affectedRowsOf(result: unknown): number {
  const first = Array.isArray(result) ? result[0] : result;
  if (first && typeof first === "object" && "affectedRows" in first) {
    const affectedRows = (first as { affectedRows?: unknown }).affectedRows;
    return typeof affectedRows === "number" ? affectedRows : 0;
  }
  return 0;
}

export async function checkoutMarketplaceCart(input: {
  userId: number;
  cartId: number;
  idempotencyKey: string;
  patientContextNote?: string | null;
}) {
  const db = getDb();

  return db.transaction(async (tx) => {
    const existingOrder = await tx
      .select()
      .from(marketplaceOrders)
      .where(and(
        eq(marketplaceOrders.userId, input.userId),
        eq(marketplaceOrders.idempotencyKey, input.idempotencyKey),
      ))
      .limit(1);

    if (existingOrder[0]) return existingOrder[0];

    const cartRows = await tx
      .select()
      .from(marketplaceCarts)
      .where(and(
        eq(marketplaceCarts.id, input.cartId),
        eq(marketplaceCarts.userId, input.userId),
        eq(marketplaceCarts.status, "active"),
      ))
      .limit(1);

    const cart = cartRows[0];
    if (!cart) throw new Error("MARKETPLACE_CART_NOT_ACTIVE");

    const rows = await tx
      .select({
        cartItemId: marketplaceCartItems.id,
        itemId: marketplaceCartItems.itemId,
        quantity: marketplaceCartItems.quantity,
        unitPriceCents: marketplaceCartItems.unitPriceCents,
        name: marketplaceItems.name,
        inventoryPolicy: marketplaceItems.inventoryPolicy,
        inventoryId: marketplaceInventory.id,
      })
      .from(marketplaceCartItems)
      .innerJoin(marketplaceItems, eq(marketplaceItems.id, marketplaceCartItems.itemId))
      .leftJoin(marketplaceInventory, eq(marketplaceInventory.itemId, marketplaceItems.id))
      .where(eq(marketplaceCartItems.cartId, cart.id));

    if (rows.length === 0) throw new Error("MARKETPLACE_CART_EMPTY");

    const subtotalCents = rows.reduce(
      (total, row) => total + row.quantity * row.unitPriceCents,
      0,
    );

    const orderInsert = await tx.insert(marketplaceOrders).values({
      userId: input.userId,
      cartId: cart.id,
      idempotencyKey: input.idempotencyKey,
      status: "simulated_checkout",
      subtotalCents,
      currency: "BRL",
      checkoutMode: "dev_simulated",
      patientContextNote: input.patientContextNote ?? null,
      safetyNotice: "Pedido simulado em ambiente DEV; nenhuma cobrança real é realizada.",
    });

    const orderId = Number((Array.isArray(orderInsert) ? orderInsert[0] : orderInsert as { insertId?: unknown }).insertId);
    if (!Number.isInteger(orderId) || orderId <= 0) throw new Error("MARKETPLACE_ORDER_ID_NOT_RETURNED");

    for (const row of rows) {
      if (row.inventoryPolicy !== "unlimited") {
        if (!row.inventoryId) throw new Error("MARKETPLACE_INVENTORY_NOT_FOUND");

        const stockUpdate = await tx
          .update(marketplaceInventory)
          .set({
            stockOnHand: sql`${marketplaceInventory.stockOnHand} - ${row.quantity}`,
            updatedAt: new Date(),
          })
          .where(and(
            eq(marketplaceInventory.id, row.inventoryId),
            gte(marketplaceInventory.stockOnHand, row.quantity),
          ));

        if (affectedRowsOf(stockUpdate) !== 1) {
          throw new Error("MARKETPLACE_INSUFFICIENT_STOCK");
        }
      }

      await tx.insert(marketplaceOrderItems).values({
        orderId,
        itemId: row.itemId,
        quantity: row.quantity,
        unitPriceCents: row.unitPriceCents,
        nameSnapshot: row.name,
        commercialNoticeSnapshot: "Conteúdo comercial seguro, não prescritivo e sem promessa terapêutica.",
      });
    }

    await tx
      .update(marketplaceCarts)
      .set({ status: "converted", activeCartKey: null, updatedAt: new Date() })
      .where(eq(marketplaceCarts.id, cart.id));

    const orderRows = await tx
      .select()
      .from(marketplaceOrders)
      .where(eq(marketplaceOrders.id, orderId))
      .limit(1);

    if (!orderRows[0]) throw new Error("MARKETPLACE_ORDER_NOT_FOUND_AFTER_CHECKOUT");
    return orderRows[0];
  });
}
```

### 5. Cliente LLM com timeout uniforme

```ts
// server/_core/llmTransport.ts
import { ENV } from "./env";

export async function fetchJsonWithDeadline<T>(input: {
  url: string;
  apiKey: string;
  body: unknown;
  timeoutMs?: number;
}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(new Error("LLM_REQUEST_TIMEOUT")),
    input.timeoutMs ?? ENV.externalProviderTimeoutMs ?? 1500,
  );

  try {
    const response = await fetch(input.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input.body),
      signal: controller.signal,
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(`LLM_HTTP_${response.status}: ${text.slice(0, 500)}`);
    }

    return JSON.parse(text) as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("LLM_REQUEST_TIMEOUT");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
```

### 6. Fallback de profissionais separado por ambiente

```ts
// server/repositories/professionals.ts
export async function listProfessionalsStrict(input: ProfessionalSearchInput) {
  const db = getDb();
  const rows = await db
    .select()
    .from(dayanNetworkProfessionals)
    .where(buildProfessionalWhere(input))
    .limit(Math.min(input.limit ?? 80, 200));

  return rows.map(normalizeDayanNetworkProfessionalRow);
}

export async function listProfessionalsForDevPreview(input: ProfessionalSearchInput) {
  try {
    return await listProfessionalsStrict(input);
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    console.warn("[Professionals] DEV seed fallback activated", error);
    return filterProfessionalSeeds(input);
  }
}
```

## Prioridade de execução após aprovação

A sequência abaixo evita mexer em muitas partes ao mesmo tempo e cria provas objetivas antes da recodificação.

| Ordem | Trabalho | Critério de aceite |
|---:|---|---|
| 1 | Escrever testes concorrenciais de carrinho/checkout | Testes falham contra implementação atual e documentam o bug |
| 2 | Criar migração para `activeCartKey` e `idempotencyKey` | Schema e banco sincronizados, sem perda de histórico |
| 3 | Refatorar checkout em transação | Testes concorrenciais passam |
| 4 | Introduzir pool explícito e health DB | `pnpm check`, `pnpm test`, `pnpm build` passam; health reporta latência |
| 5 | Separar fallback DEV/PROD de profissionais | Produção não mascara falha de DB |
| 6 | Unificar timeout LLM | Chamadas built-in e externas respeitam deadline |
| 7 | Modularizar routers e repositories | Arquivos menores, testes por domínio, sem mudança funcional |

## Itens que não recomendo alterar agora

Não recomendo iniciar mudanças visuais, reescrever toda a aplicação, trocar ORM, trocar tRPC, trocar banco ou criar arquitetura de microsserviços neste momento. A prioridade real é fortalecer os pontos de integridade e resiliência com menor superfície de mudança. Microsserviços prematuros aumentariam latência, custo operacional e complexidade sem resolver o problema de checkout transacional, timeout LLM ou fallback silencioso.

## Decisão solicitada ao Sidney

Antes de qualquer recodificação, preciso de uma decisão clara sobre o escopo autorizado. Minha recomendação é aprovar a **Fase 1 de hardening**, composta por testes concorrenciais, migração de idempotência/carrinho ativo, checkout transacional, pool explícito, fallback DEV/PROD e timeout uniforme de LLM.

| Opção | O que acontece |
|---|---|
| Aprovar Fase 1 completa | Inicio testes e refatoração crítica conforme a ordem acima |
| Aprovar apenas marketplace | Ataco somente carrinho, checkout, estoque e testes de concorrência |
| Aprovar apenas auditoria adicional | Continuo documentando sem modificar código |
| Rejeitar refatoração agora | Mantenho o sistema como está e não aplico mudanças técnicas |

## Referências

[1]: https://orm.drizzle.team/docs/transactions "Drizzle ORM — Transactions"  
[2]: https://sidorares.github.io/node-mysql2/docs "mysql2 — Documentation"  
[3]: https://www.typescriptlang.org/tsconfig/strict.html "TypeScript TSConfig — strict"

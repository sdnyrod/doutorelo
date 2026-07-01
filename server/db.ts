import { and, desc, eq, inArray, like, or, sql, type SQL } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql, { type Pool } from "mysql2";
import {
  aiModelExecutions,
  appointmentCalendarSyncs,
  careAppointments,
  careJourneyFeedback,
  careJourneySessions,
  dayanNetworkProfessionals,
  dayanRagRetrievalEvents,
  dataIngestionJobs,
  healthDirectoryCoverage,
  healthProviderEvidences,
  healthProviderSources,
  healthProviderSpecialties,
  healthProviders,
  clinicalMemoryEvents,
  clarityMaps,
  externalCalendarConnections,
  healthConsents,
  healthConversations,
  healthDocuments,
  healthDataConnections,
  healthIndicators,
  healthMetricSamples,
  InsertAiModelExecution,
  InsertAppointmentCalendarSync,
  InsertCareJourneyFeedback,
  InsertCareJourneySession,
  InsertDayanNetworkProfessional,
  InsertDayanRagRetrievalEvent,
  InsertDataIngestionJob,
  InsertHealthDirectoryCoverage,
  InsertHealthProvider,
  InsertHealthProviderEvidence,
  InsertHealthProviderSource,
  InsertHealthProviderSpecialty,
  InsertClarityMap,
  InsertClinicalMemoryEvent,
  InsertExternalCalendarConnection,
  InsertHealthConversation,
  InsertHealthDataConnection,
  InsertHealthMetricSample,
  InsertMarketplaceCategory,
  InsertMarketplaceItem,
  InsertLongitudinalCarePlanItem,
  InsertMarketplacePartner,
  InsertMlImprovementCycle,
  InsertMlLearningEvent,
  InsertMlTrainingExample,
  InsertPatientHealthProfile,
  InsertUser,
  appointmentStatusValues,
  marketplaceCartItems,
  marketplaceCarts,
  marketplaceCategories,
  marketplaceInventory,
  marketplaceItems,
  marketplaceOrderItems,
  marketplaceOrders,
  marketplacePartners,
  marketplaceRecommendationEvents,
  mlImprovementCycles,
  mlLearningEvents,
  mlTrainingExamples,
  marketplaceOrderStatusValues,
  longitudinalCarePlanItems,
  patientHealthProfiles,
  users,
} from "../drizzle/schema";
import {
  dayanNetworkProfessionalSeeds,
  rankDayanNetworkProfessionals,
  resolveDayanNetworkProfessionalLocationFromMessage as resolveLocationFromProfessionalBase,
  type DayanNetworkProfessionalSeed,
} from "./dayanNetworkProfessionalsSeed";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: Pool | null = null;

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

function createDatabasePool(): Pool | null {
  const uri = ENV.databaseUrl || process.env.DATABASE_URL;
  if (!uri) return null;

  return mysql.createPool({
    uri,
    waitForConnections: true,
    connectionLimit: parsePositiveInt(process.env.DATABASE_POOL_CONNECTION_LIMIT, 10),
    maxIdle: parsePositiveInt(process.env.DATABASE_POOL_MAX_IDLE, 10),
    idleTimeout: parsePositiveInt(process.env.DATABASE_POOL_IDLE_TIMEOUT_MS, 60_000),
    queueLimit: parsePositiveInt(process.env.DATABASE_POOL_QUEUE_LIMIT, 200),
    connectTimeout: parsePositiveInt(process.env.DATABASE_POOL_CONNECT_TIMEOUT_MS, 10_000),
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
}

// Lazily create a bounded mysql2 pool so local tooling can run without a DB while runtime requests share controlled connections.
export async function getDb() {
  if (!_db) {
    try {
      _pool = createDatabasePool();
      if (_pool) _db = drizzle(_pool);
    } catch (error) {
      console.warn("[Database] Failed to initialize pool:", error);
      _db = null;
      _pool = null;
    }
  }
  return _db;
}

export async function closeDbPool(): Promise<void> {
  const pool = _pool;
  _db = null;
  _pool = null;
  if (!pool) return;
  await new Promise<void>((resolve, reject) => {
    pool.end((error) => (error ? reject(error) : resolve()));
  });
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUserWithPassword(input: { email: string; name: string; passwordHash: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const openId = `local_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  await db.insert(users).values({
    openId,
    email: input.email,
    name: input.name,
    passwordHash: input.passwordHash,
    loginMethod: "email_password",
    lastSignedIn: new Date(),
  });
  const created = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return created[0];
}

export type HealthProfileInput = Pick<
  InsertPatientHealthProfile,
  | "preferredName"
  | "birthYear"
  | "biologicalSex"
  | "mainGoal"
  | "knownConditions"
  | "medications"
  | "allergies"
  | "lifestyleNotes"
  | "emotionalContext"
  | "emergencyNotes"
>;

export type CreateConversationInput = Pick<
  InsertHealthConversation,
  "channel" | "initialConcern" | "latestSummary" | "safetySnapshot"
>;

export type CreateMemoryEventInput = Omit<
  Pick<InsertClinicalMemoryEvent, "conversationId" | "eventType" | "source" | "severity" | "title" | "summary" | "occurredAt">,
  never
> & {
  metadata?: unknown;
};

export type CreateClarityMapInput = Pick<
  InsertClarityMap,
  | "conversationId"
  | "status"
  | "mainConcern"
  | "symptoms"
  | "patterns"
  | "questionsForDoctor"
  | "suggestedSpecialty"
  | "nextStep"
  | "safetyFlags"
  | "confidence"
>;

export function calculateHealthProfileCompleteness(input: Partial<HealthProfileInput>): number {
  const weightedFields: Array<keyof HealthProfileInput> = [
    "preferredName",
    "birthYear",
    "biologicalSex",
    "mainGoal",
    "knownConditions",
    "medications",
    "allergies",
    "lifestyleNotes",
    "emotionalContext",
    "emergencyNotes",
  ];
  const completed = weightedFields.filter((field) => {
    const value = input[field];
    if (value === undefined || value === null) return false;
    if (typeof value === "string") return value.trim().length > 0 && value !== "not_informed";
    return true;
  }).length;

  return Math.round((completed / weightedFields.length) * 100);
}

export function serializeClinicalMetadata(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

function extractInsertId(result: unknown): number {
  const rows = Array.isArray(result) ? result : [result];
  const first = rows[0] as { insertId?: number | string } | undefined;
  return Number(first?.insertId ?? 0);
}

async function requireDb() {
  const db = await getDb();
  if (!db) {
    throw new Error("DATABASE_UNAVAILABLE");
  }
  return db;
}

const DAYAN_PROFESSIONAL_FALLBACK_MODE = process.env.DAYAN_PROFESSIONAL_FALLBACK_MODE ?? (ENV.isProduction ? "production" : "development");

function isDayanDevSeedFallbackAllowed(): boolean {
  return DAYAN_PROFESSIONAL_FALLBACK_MODE !== "production" && process.env.DAYAN_NETWORK_ALLOW_DEV_SEED_FALLBACK !== "false";
}

function hasExplicitDayanFilter(input?: { city?: string; state?: string; specialty?: string }): boolean {
  return Boolean(input?.city?.trim() || input?.state?.trim() || input?.specialty?.trim());
}

function normalizeDayanNetworkProfessionalRow(row: typeof dayanNetworkProfessionals.$inferSelect): DayanNetworkProfessionalSeed {
  return {
    name: row.name,
    specialty: row.specialty,
    professionalType: row.professionalType as DayanNetworkProfessionalSeed["professionalType"],
    bio: row.bio ?? "Profissional associado à base fictícia da Rede Dayan para testes DEV.",
    city: row.city,
    state: row.state,
    addressLine: row.addressLine,
    lat: String(row.lat),
    lng: String(row.lng),
    phone: row.phone ?? "",
    email: row.email ?? "",
    whatsapp: row.whatsapp ?? "",
    modality: row.modality,
    active: row.active,
    photoUrl: row.photoUrl ?? null,
    crm: row.crm ?? null,
    crn: row.crn ?? null,
    crf: row.crf ?? null,
  };
}

function toInsertDayanNetworkProfessional(seed: DayanNetworkProfessionalSeed): InsertDayanNetworkProfessional {
  return {
    name: seed.name,
    specialty: seed.specialty,
    professionalType: seed.professionalType,
    bio: seed.bio,
    city: seed.city,
    state: seed.state,
    addressLine: seed.addressLine,
    lat: seed.lat,
    lng: seed.lng,
    phone: seed.phone,
    email: seed.email,
    whatsapp: seed.whatsapp,
    modality: seed.modality,
    active: seed.active,
    photoUrl: seed.photoUrl,
    crm: seed.crm,
    crn: seed.crn,
    crf: seed.crf,
  };
}

export async function listDayanNetworkProfessionals(input?: { city?: string; state?: string; specialty?: string; activeOnly?: boolean; limit?: number }) {
  const requestedLimit = Math.max(1, Math.min(input?.limit ?? 80, 500));
  const fallback = dayanNetworkProfessionalSeeds.slice(0, requestedLimit);
  const db = await getDb();
  const allowFallback = isDayanDevSeedFallbackAllowed();
  if (!db) {
    if (allowFallback) return hasExplicitDayanFilter(input) ? rankDayanNetworkProfessionals({ city: input?.city, state: input?.state, specialty: input?.specialty, professionals: fallback, limit: requestedLimit }) : fallback;
    throw new Error("DAYAN_NETWORK_DATABASE_UNAVAILABLE");
  }

  try {
    const predicates: SQL[] = [];
    if (input?.activeOnly ?? true) predicates.push(eq(dayanNetworkProfessionals.active, 1));
    if (input?.city?.trim()) predicates.push(eq(dayanNetworkProfessionals.city, input.city.trim()));
    if (input?.state?.trim()) predicates.push(eq(dayanNetworkProfessionals.state, input.state.trim()));
    if (input?.specialty?.trim()) predicates.push(like(dayanNetworkProfessionals.specialty, `%${input.specialty.trim()}%`));
    const rows = await db
      .select()
      .from(dayanNetworkProfessionals)
      .where(predicates.length > 0 ? and(...predicates) : undefined)
      .limit(requestedLimit);
    if (rows.length > 0) return rows.map(normalizeDayanNetworkProfessionalRow);
    return allowFallback && !hasExplicitDayanFilter(input) ? fallback : [];
  } catch (error) {
    if (!allowFallback) throw error;
    console.warn("[Database] Falling back to local Dayan network seed in DEV only:", error);
    return hasExplicitDayanFilter(input) ? rankDayanNetworkProfessionals({ city: input?.city, state: input?.state, specialty: input?.specialty, professionals: fallback, limit: requestedLimit }) : fallback;
  }
}

export async function resolveDayanNetworkProfessionalLocationFromMessage(message: string | null | undefined) {
  const professionals = await listDayanNetworkProfessionals({ activeOnly: true, limit: 10000 });
  return resolveLocationFromProfessionalBase(message, professionals);
}

export async function recommendDayanNetworkProfessionals(input: {
  city?: string | null;
  state?: string | null;
  specialty?: string | null;
  need?: string | null;
  lat?: number | null;
  lng?: number | null;
  limit?: number;
}) {
  const requestedLimit = Math.max(1, Math.min(input.limit ?? 5, 20));
  const professionals = await listDayanNetworkProfessionals({
    activeOnly: true,
    city: input.city ?? undefined,
    state: input.state ?? undefined,
    specialty: input.specialty ?? undefined,
    limit: Math.max(requestedLimit * 8, 40),
  });
  return rankDayanNetworkProfessionals({ ...input, professionals, limit: requestedLimit });
}

export type NationalHealthProviderListInput = {
  city?: string;
  state?: string;
  specialty?: string;
  query?: string;
  entityType?: typeof healthProviders.$inferSelect.entityType | "all";
  status?: typeof healthProviders.$inferSelect.status | "all";
  verificationStatus?: typeof healthProviders.$inferSelect.verificationStatus | "all";
  activeOnly?: boolean;
  limit?: number;
};

export type HealthDirectoryPilotProviderInput = Pick<
  InsertHealthProvider,
  | "displayName"
  | "legalName"
  | "entityType"
  | "professionalType"
  | "primarySpecialty"
  | "documentType"
  | "documentMasked"
  | "councilType"
  | "councilNumber"
  | "councilState"
  | "licenseStatus"
  | "cnesCode"
  | "establishmentType"
  | "bio"
  | "publicSummary"
  | "city"
  | "state"
  | "municipalityCode"
  | "neighborhood"
  | "addressLine"
  | "postalCode"
  | "lat"
  | "lng"
  | "phone"
  | "email"
  | "whatsapp"
  | "website"
  | "modality"
  | "sourceConfidenceScore"
  | "qualityScore"
  | "verificationStatus"
  | "status"
  | "active"
  | "verified"
> & {
  specialties?: Array<Pick<InsertHealthProviderSpecialty, "specialtyName" | "specialtyCode" | "taxonomySystem" | "isPrimary" | "sourceName" | "confidenceScore">>;
  sources?: Array<Pick<InsertHealthProviderSource, "sourceKey" | "sourceName" | "sourceKind" | "externalId" | "sourceUrl" | "reliability" | "fieldCoverage" | "confidenceScore">>;
  evidences?: Array<Pick<InsertHealthProviderEvidence, "evidenceKind" | "fieldName" | "fieldValueSnapshot" | "rawPayloadSnapshot" | "sourceUrl" | "confidenceScore">>;
};

function normalizeHealthDirectoryName(value: string): string {
  return value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/\s+/g, " ").slice(0, 220);
}

function clampScore(value: number | undefined, fallback = 0): number {
  const numeric = Number.isFinite(value) ? Number(value) : fallback;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

export async function listNationalHealthProviders(input: NationalHealthProviderListInput = {}) {
  const db = await requireDb();
  const requestedLimit = Math.max(1, Math.min(input.limit ?? 80, 300));
  const predicates: SQL[] = [];
  if (input.activeOnly ?? true) predicates.push(eq(healthProviders.active, 1));
  if (input.city?.trim()) predicates.push(eq(healthProviders.city, input.city.trim()));
  if (input.state?.trim()) predicates.push(eq(healthProviders.state, input.state.trim().toUpperCase().slice(0, 2)));
  if (input.specialty?.trim()) predicates.push(like(healthProviders.primarySpecialty, `%${input.specialty.trim()}%`));
  if (input.entityType && input.entityType !== "all") predicates.push(eq(healthProviders.entityType, input.entityType));
  if (input.status && input.status !== "all") predicates.push(eq(healthProviders.status, input.status));
  if (input.verificationStatus && input.verificationStatus !== "all") predicates.push(eq(healthProviders.verificationStatus, input.verificationStatus));
  if (input.query?.trim()) {
    const query = `%${input.query.trim()}%`;
    predicates.push(or(like(healthProviders.displayName, query), like(healthProviders.legalName, query), like(healthProviders.cnesCode, query), like(healthProviders.councilNumber, query))!);
  }

  const providers = await db
    .select()
    .from(healthProviders)
    .where(predicates.length > 0 ? and(...predicates) : undefined)
    .orderBy(desc(healthProviders.qualityScore), desc(healthProviders.sourceConfidenceScore), desc(healthProviders.updatedAt))
    .limit(requestedLimit);

  if (providers.length === 0) return [];
  const providerIds = providers.map((provider) => provider.id);
  const [specialties, sources] = await Promise.all([
    db.select().from(healthProviderSpecialties).where(inArray(healthProviderSpecialties.providerId, providerIds)),
    db.select().from(healthProviderSources).where(inArray(healthProviderSources.providerId, providerIds)),
  ]);

  return providers.map((provider) => ({
    ...provider,
    specialties: specialties.filter((specialty) => specialty.providerId === provider.id),
    sources: sources.filter((source) => source.providerId === provider.id),
  }));
}

export async function getNationalHealthDirectorySummary() {
  const db = await requireDb();
  const [providerRows, coverageRows, ingestionRows] = await Promise.all([
    db.select().from(healthProviders).limit(5000),
    db.select().from(healthDirectoryCoverage).orderBy(desc(healthDirectoryCoverage.updatedAt)).limit(200),
    db.select().from(dataIngestionJobs).orderBy(desc(dataIngestionJobs.createdAt)).limit(20),
  ]);
  const activeProviders = providerRows.filter((provider) => provider.active === 1);
  const stateCounts = activeProviders.reduce<Record<string, number>>((acc, provider) => {
    acc[provider.state] = (acc[provider.state] ?? 0) + 1;
    return acc;
  }, {});
  const entityTypeCounts = activeProviders.reduce<Record<string, number>>((acc, provider) => {
    acc[provider.entityType] = (acc[provider.entityType] ?? 0) + 1;
    return acc;
  }, {});
  return {
    totals: {
      providers: providerRows.length,
      activeProviders: activeProviders.length,
      verifiedProviders: activeProviders.filter((provider) => provider.verified === 1).length,
      cities: new Set(activeProviders.map((provider) => `${provider.city}|${provider.state}`)).size,
      coverageRows: coverageRows.length,
      ingestionJobs: ingestionRows.length,
    },
    stateCounts,
    entityTypeCounts,
    recentCoverage: coverageRows.slice(0, 20),
    recentIngestionJobs: ingestionRows,
  };
}

export async function createHealthDirectoryIngestionJob(input: Partial<InsertDataIngestionJob> & Pick<InsertDataIngestionJob, "sourceKey" | "sourceName">) {
  const db = await requireDb();
  const values: InsertDataIngestionJob = {
    sourceKey: input.sourceKey.trim().slice(0, 120),
    sourceName: input.sourceName.trim().slice(0, 180),
    sourceKind: input.sourceKind ?? "manual",
    status: input.status ?? "queued",
    requestedByUserId: input.requestedByUserId ?? null,
    scopeCountry: input.scopeCountry ?? "BR",
    scopeState: input.scopeState?.trim() ? input.scopeState.trim().toUpperCase().slice(0, 2) : null,
    scopeCity: input.scopeCity?.trim() ? input.scopeCity.trim().slice(0, 120) : null,
    inputStorageKey: input.inputStorageKey ?? null,
    outputStorageKey: input.outputStorageKey ?? null,
    recordsSeen: input.recordsSeen ?? 0,
    recordsProcessed: input.recordsProcessed ?? 0,
    recordsCreated: input.recordsCreated ?? 0,
    recordsUpdated: input.recordsUpdated ?? 0,
    recordsSkipped: input.recordsSkipped ?? 0,
    errorCount: input.errorCount ?? 0,
    errorSummary: input.errorSummary ?? null,
    metricsSnapshot: serializeClinicalMetadata(input.metricsSnapshot),
    startedAt: input.startedAt ?? null,
    completedAt: input.completedAt ?? null,
  };
  const result = await db.insert(dataIngestionJobs).values(values);
  return { id: extractInsertId(result), ...values };
}

export async function upsertNationalHealthDirectoryPilotProvider(input: HealthDirectoryPilotProviderInput, requestedByUserId?: number) {
  const db = await requireDb();
  const displayName = input.displayName.trim().slice(0, 220);
  const state = input.state.trim().toUpperCase().slice(0, 2);
  const city = input.city.trim().slice(0, 120);
  const values: InsertHealthProvider = {
    ...input,
    displayName,
    legalName: input.legalName?.trim() ? input.legalName.trim().slice(0, 220) : null,
    normalizedName: normalizeHealthDirectoryName(displayName),
    city,
    state,
    primarySpecialty: input.primarySpecialty?.trim() ? input.primarySpecialty.trim().slice(0, 180) : null,
    sourceConfidenceScore: clampScore(input.sourceConfidenceScore, 40),
    qualityScore: clampScore(input.qualityScore, 40),
    active: input.active ?? 1,
    verified: input.verified ?? 0,
    status: input.status ?? "pending_review",
    verificationStatus: input.verificationStatus ?? "unverified",
    lastSeenAt: new Date(),
  };

  const existing = await db
    .select()
    .from(healthProviders)
    .where(and(eq(healthProviders.normalizedName, values.normalizedName), eq(healthProviders.city, city), eq(healthProviders.state, state)))
    .limit(1);

  let providerId = existing[0]?.id;
  if (providerId) {
    await db.update(healthProviders).set(values).where(eq(healthProviders.id, providerId));
  } else {
    const result = await db.insert(healthProviders).values(values);
    providerId = extractInsertId(result);
  }

  const ingestionJob = await createHealthDirectoryIngestionJob({
    sourceKey: "manual_pilot",
    sourceName: "Piloto manual DoutorElo",
    sourceKind: "manual",
    status: "completed",
    requestedByUserId: requestedByUserId ?? null,
    scopeState: state,
    scopeCity: city,
    recordsSeen: 1,
    recordsProcessed: 1,
    recordsCreated: existing[0]?.id ? 0 : 1,
    recordsUpdated: existing[0]?.id ? 1 : 0,
    completedAt: new Date(),
    metricsSnapshot: JSON.stringify({ mode: "manual_pilot", providerId }),
  });

  if (input.specialties?.length) {
    await db.insert(healthProviderSpecialties).values(input.specialties.map((specialty) => ({
      providerId,
      specialtyName: specialty.specialtyName.trim().slice(0, 180),
      specialtyCode: specialty.specialtyCode?.trim() ? specialty.specialtyCode.trim().slice(0, 80) : null,
      taxonomySystem: specialty.taxonomySystem ?? "manual",
      isPrimary: specialty.isPrimary ?? 0,
      sourceName: specialty.sourceName ?? "Piloto manual DoutorElo",
      confidenceScore: clampScore(specialty.confidenceScore, 40),
    }))).onDuplicateKeyUpdate({ set: { confidenceScore: sql`values(confidenceScore)`, sourceName: sql`values(sourceName)` } });
  }

  const sourceRows = input.sources?.length ? input.sources : [{ sourceKey: "manual_pilot", sourceName: "Piloto manual DoutorElo", sourceKind: "manual" as const, reliability: "unverified" as const, confidenceScore: 40 }];
  await db.insert(healthProviderSources).values(sourceRows.map((source) => ({
    providerId,
    sourceKey: source.sourceKey.trim().slice(0, 120),
    sourceName: source.sourceName.trim().slice(0, 180),
    sourceKind: source.sourceKind ?? "manual",
    externalId: source.externalId ?? null,
    sourceUrl: source.sourceUrl ?? null,
    reliability: source.reliability ?? "unverified",
    fieldCoverage: source.fieldCoverage ?? null,
    confidenceScore: clampScore(source.confidenceScore, 40),
    lastSeenAt: new Date(),
  })));

  if (input.evidences?.length) {
    await db.insert(healthProviderEvidences).values(input.evidences.map((evidence) => ({
      providerId,
      ingestionJobId: ingestionJob.id,
      evidenceKind: evidence.evidenceKind ?? "other",
      fieldName: evidence.fieldName.trim().slice(0, 120),
      fieldValueSnapshot: evidence.fieldValueSnapshot ?? null,
      rawPayloadSnapshot: evidence.rawPayloadSnapshot ?? null,
      sourceUrl: evidence.sourceUrl ?? null,
      confidenceScore: clampScore(evidence.confidenceScore, 40),
      isCurrent: 1,
      observedAt: new Date(),
    })));
  }

  const providers = await listNationalHealthProviders({ city, state, query: displayName, activeOnly: false, limit: 1 });
  return { provider: providers[0] ?? null, ingestionJob };
}

export async function upsertNationalHealthDirectoryCoverage(input: InsertHealthDirectoryCoverage) {
  const db = await requireDb();
  const values: InsertHealthDirectoryCoverage = {
    ...input,
    state: input.state.trim().toUpperCase().slice(0, 2),
    city: input.city.trim().slice(0, 120),
    providerCount: Math.max(0, input.providerCount ?? 0),
    professionalCount: Math.max(0, input.professionalCount ?? 0),
    facilityCount: Math.max(0, input.facilityCount ?? 0),
    coverageScore: clampScore(input.coverageScore, 0),
    dataFreshnessDays: Math.max(0, input.dataFreshnessDays ?? 0),
    status: input.status ?? "completed",
  };
  await db.insert(healthDirectoryCoverage).values(values).onDuplicateKeyUpdate({
    set: {
      providerCount: values.providerCount,
      professionalCount: values.professionalCount,
      facilityCount: values.facilityCount,
      coverageScore: values.coverageScore,
      dataFreshnessDays: values.dataFreshnessDays,
      lastIngestionJobId: values.lastIngestionJobId ?? null,
      status: values.status,
    },
  });
  const rows = await db.select().from(healthDirectoryCoverage).where(and(eq(healthDirectoryCoverage.sourceKey, values.sourceKey), eq(healthDirectoryCoverage.state, values.state), eq(healthDirectoryCoverage.city, values.city))).limit(1);
  return rows[0] ?? null;
}

export async function seedDayanNetworkProfessionalsIfEmpty() {
  const db = await getDb();
  if (!db) return { inserted: 0, available: dayanNetworkProfessionalSeeds.length, source: "local_seed" as const };

  try {
    const existing = await db.select({ id: dayanNetworkProfessionals.id }).from(dayanNetworkProfessionals).limit(1);
    if (existing.length > 0) {
      return { inserted: 0, available: existing.length, source: "database" as const };
    }
    await db.insert(dayanNetworkProfessionals).values(dayanNetworkProfessionalSeeds.map(toInsertDayanNetworkProfessional));
    return { inserted: dayanNetworkProfessionalSeeds.length, available: dayanNetworkProfessionalSeeds.length, source: "database" as const };
  } catch (error) {
    console.warn("[Database] Could not seed Dayan network professionals:", error);
    return { inserted: 0, available: dayanNetworkProfessionalSeeds.length, source: "local_seed" as const };
  }
}

export async function getPatientMemorySummary(userId: number) {
  const db = await requireDb();
  const [profile, recentEvents, recentClarityMaps, documents, appointments, indicators, consents] = await Promise.all([
    db.select().from(patientHealthProfiles).where(eq(patientHealthProfiles.userId, userId)).limit(1),
    db.select().from(clinicalMemoryEvents).where(eq(clinicalMemoryEvents.userId, userId)).orderBy(desc(clinicalMemoryEvents.occurredAt)).limit(8),
    db.select().from(clarityMaps).where(eq(clarityMaps.userId, userId)).orderBy(desc(clarityMaps.createdAt)).limit(4),
    db.select().from(healthDocuments).where(eq(healthDocuments.userId, userId)).orderBy(desc(healthDocuments.createdAt)).limit(4),
    db.select().from(careAppointments).where(eq(careAppointments.userId, userId)).orderBy(desc(careAppointments.createdAt)).limit(4),
    db.select().from(healthIndicators).where(eq(healthIndicators.userId, userId)).orderBy(desc(healthIndicators.measuredAt)).limit(6),
    db.select().from(healthConsents).where(eq(healthConsents.userId, userId)).orderBy(desc(healthConsents.createdAt)).limit(6),
  ]);

  return {
    profile: profile[0] ?? null,
    recentEvents,
    recentClarityMaps,
    documents,
    appointments,
    indicators,
    consents,
  };
}

export async function savePatientHealthProfile(userId: number, input: Partial<HealthProfileInput>) {
  const db = await requireDb();
  const completenessScore = calculateHealthProfileCompleteness(input);
  const values: InsertPatientHealthProfile = {
    userId,
    preferredName: input.preferredName ?? null,
    birthYear: input.birthYear ?? null,
    biologicalSex: input.biologicalSex ?? "not_informed",
    mainGoal: input.mainGoal ?? null,
    knownConditions: input.knownConditions ?? null,
    medications: input.medications ?? null,
    allergies: input.allergies ?? null,
    lifestyleNotes: input.lifestyleNotes ?? null,
    emotionalContext: input.emotionalContext ?? null,
    emergencyNotes: input.emergencyNotes ?? null,
    completenessScore,
  };

  await db.insert(patientHealthProfiles).values(values).onDuplicateKeyUpdate({
    set: {
      preferredName: values.preferredName,
      birthYear: values.birthYear,
      biologicalSex: values.biologicalSex,
      mainGoal: values.mainGoal,
      knownConditions: values.knownConditions,
      medications: values.medications,
      allergies: values.allergies,
      lifestyleNotes: values.lifestyleNotes,
      emotionalContext: values.emotionalContext,
      emergencyNotes: values.emergencyNotes,
      completenessScore: values.completenessScore,
      updatedAt: new Date(),
    },
  });

  const rows = await db.select().from(patientHealthProfiles).where(eq(patientHealthProfiles.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function createHealthConversation(userId: number, input: Partial<CreateConversationInput>) {
  const db = await requireDb();
  const values: InsertHealthConversation = {
    userId,
    channel: input.channel ?? "onboarding_memory",
    initialConcern: input.initialConcern ?? null,
    latestSummary: input.latestSummary ?? null,
    safetySnapshot: input.safetySnapshot ?? null,
  };
  const result = await db.insert(healthConversations).values(values);
  return {
    id: extractInsertId(result),
    ...values,
  };
}

export async function addClinicalMemoryEvent(userId: number, input: Partial<CreateMemoryEventInput> & { title: string }) {
  const db = await requireDb();
  const values: InsertClinicalMemoryEvent = {
    userId,
    conversationId: input.conversationId ?? null,
    eventType: input.eventType ?? "note",
    source: input.source ?? "patient",
    severity: input.severity ?? "low",
    title: input.title,
    summary: input.summary ?? null,
    metadata: serializeClinicalMetadata(input.metadata),
    occurredAt: input.occurredAt ?? new Date(),
  };
  const result = await db.insert(clinicalMemoryEvents).values(values);
  return {
    id: extractInsertId(result),
    ...values,
  };
}

export async function saveClarityMap(userId: number, input: Partial<CreateClarityMapInput> & { mainConcern: string }) {
  const db = await requireDb();
  const values: InsertClarityMap = {
    userId,
    conversationId: input.conversationId ?? null,
    status: input.status ?? "ready_for_review",
    mainConcern: input.mainConcern,
    symptoms: input.symptoms ?? null,
    patterns: input.patterns ?? null,
    questionsForDoctor: input.questionsForDoctor ?? null,
    suggestedSpecialty: input.suggestedSpecialty ?? null,
    nextStep: input.nextStep ?? null,
    safetyFlags: input.safetyFlags ?? null,
    confidence: input.confidence ?? "medium",
  };
  const result = await db.insert(clarityMaps).values(values);
  const clarityMap = {
    id: extractInsertId(result),
    ...values,
  };

  await addClinicalMemoryEvent(userId, {
    conversationId: values.conversationId ?? undefined,
    eventType: "ai_clarity_map",
    source: "ai",
    severity: values.safetyFlags ? "attention" : "low",
    title: `Mapa de clareza: ${values.mainConcern}`,
    summary: values.nextStep ?? "Mapa de clareza salvo para continuidade do cuidado.",
    metadata: {
      clarityMapId: clarityMap.id,
      suggestedSpecialty: values.suggestedSpecialty,
      confidence: values.confidence,
    },
  });

  return clarityMap;
}

export type CreateCareJourneySessionInput = {
  conversationId?: number | null;
  status?: InsertCareJourneySession["status"];
  severityLevel?: string;
  confidenceScore?: number;
  policyVersion: string;
  consentSnapshot?: unknown;
  escalationFlag?: boolean;
  escalationReason?: string | null;
  intakeData?: unknown;
  sessionSummary?: string | null;
  redFlagsDetected?: unknown;
};

export type UpdateCareJourneySessionInput = Partial<{
  status: InsertCareJourneySession["status"];
  severityLevel: string;
  confidenceScore: number;
  escalationFlag: boolean;
  escalationReason: string | null;
  intakeData: unknown;
  sessionSummary: string | null;
  redFlagsDetected: unknown;
  totalTurns: number;
  lastActivityAt: Date;
}>;

export type RecordCareJourneyFeedbackInput = {
  sessionId: number;
  aiExecutionId?: number | null;
  rating: InsertCareJourneyFeedback["rating"];
  comment?: string | null;
};

export type LogAiModelExecutionInput = {
  sessionId: number;
  logicalProvider?: InsertAiModelExecution["logicalProvider"];
  modelCapability?: InsertAiModelExecution["modelCapability"];
  promptId: string;
  schemaName?: string | null;
  inputTokensEst?: number;
  outputTokensEst?: number;
  latencyMs?: number;
  status?: InsertAiModelExecution["status"];
  violationsDetected?: unknown;
  fallbackReason?: string | null;
  responseSnapshot?: unknown;
};

export async function createCareJourneySession(userId: number, input: CreateCareJourneySessionInput) {
  const db = await requireDb();
  const values: InsertCareJourneySession = {
    userId,
    conversationId: input.conversationId ?? null,
    status: input.status ?? "intake",
    severityLevel: input.severityLevel ?? "uncertain",
    confidenceScore: input.confidenceScore ?? 40,
    policyVersion: input.policyVersion,
    consentSnapshot: serializeClinicalMetadata(input.consentSnapshot),
    escalationFlag: input.escalationFlag ? 1 : 0,
    escalationReason: input.escalationReason ?? null,
    intakeData: serializeClinicalMetadata(input.intakeData),
    sessionSummary: input.sessionSummary ?? null,
    redFlagsDetected: serializeClinicalMetadata(input.redFlagsDetected),
    totalTurns: 0,
    lastActivityAt: new Date(),
  };
  const result = await db.insert(careJourneySessions).values(values);
  const created = await getCareJourneySession(userId, extractInsertId(result));
  if (!created) {
    throw new Error("Unable to reload created care journey session.");
  }
  return created;
}

export async function getCareJourneySession(userId: number, sessionId: number) {
  const db = await requireDb();
  const rows = await db
    .select()
    .from(careJourneySessions)
    .where(and(eq(careJourneySessions.id, sessionId), eq(careJourneySessions.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function updateCareJourneySession(userId: number, sessionId: number, input: UpdateCareJourneySessionInput) {
  const db = await requireDb();
  const set: Partial<InsertCareJourneySession> = {
    updatedAt: new Date(),
    lastActivityAt: input.lastActivityAt ?? new Date(),
  };
  if (input.status !== undefined) set.status = input.status;
  if (input.severityLevel !== undefined) set.severityLevel = input.severityLevel;
  if (input.confidenceScore !== undefined) set.confidenceScore = input.confidenceScore;
  if (input.escalationFlag !== undefined) set.escalationFlag = input.escalationFlag ? 1 : 0;
  if (input.escalationReason !== undefined) set.escalationReason = input.escalationReason;
  if (input.intakeData !== undefined) set.intakeData = serializeClinicalMetadata(input.intakeData);
  if (input.sessionSummary !== undefined) set.sessionSummary = input.sessionSummary;
  if (input.redFlagsDetected !== undefined) set.redFlagsDetected = serializeClinicalMetadata(input.redFlagsDetected);
  if (input.totalTurns !== undefined) set.totalTurns = input.totalTurns;

  await db
    .update(careJourneySessions)
    .set(set)
    .where(and(eq(careJourneySessions.id, sessionId), eq(careJourneySessions.userId, userId)));

  return getCareJourneySession(userId, sessionId);
}

export async function recordCareJourneyFeedback(userId: number, input: RecordCareJourneyFeedbackInput) {
  const db = await requireDb();
  const values: InsertCareJourneyFeedback = {
    userId,
    sessionId: input.sessionId,
    aiExecutionId: input.aiExecutionId ?? null,
    rating: input.rating,
    comment: input.comment?.trim() ? input.comment.trim().slice(0, 800) : null,
  };
  const result = await db.insert(careJourneyFeedback).values(values);
  return { id: extractInsertId(result), ...values };
}

export async function logAiModelExecution(userId: number, input: LogAiModelExecutionInput) {
  const db = await requireDb();
  const values: InsertAiModelExecution = {
    userId,
    sessionId: input.sessionId,
    logicalProvider: input.logicalProvider ?? "built_in_llm",
    modelCapability: input.modelCapability ?? "care_journey_response",
    promptId: input.promptId,
    schemaName: input.schemaName ?? null,
    inputTokensEst: input.inputTokensEst ?? 0,
    outputTokensEst: input.outputTokensEst ?? 0,
    latencyMs: input.latencyMs ?? 0,
    status: input.status ?? "success",
    violationsDetected: serializeClinicalMetadata(input.violationsDetected),
    fallbackReason: input.fallbackReason ?? null,
    responseSnapshot: serializeClinicalMetadata(input.responseSnapshot),
  };
  const result = await db.insert(aiModelExecutions).values(values);
  return { id: extractInsertId(result), ...values };
}

export async function listPatientTimeline(userId: number) {
  const db = await requireDb();
  const [events, maps, appointments] = await Promise.all([
    db.select().from(clinicalMemoryEvents).where(eq(clinicalMemoryEvents.userId, userId)).orderBy(desc(clinicalMemoryEvents.occurredAt)).limit(20),
    db.select().from(clarityMaps).where(eq(clarityMaps.userId, userId)).orderBy(desc(clarityMaps.createdAt)).limit(10),
    db.select().from(careAppointments).where(eq(careAppointments.userId, userId)).orderBy(desc(careAppointments.createdAt)).limit(10),
  ]);

  return [
    ...events.map((event) => ({
      id: `event-${event.id}`,
      kind: "event" as const,
      title: event.title,
      summary: event.summary,
      date: event.occurredAt,
      severity: event.severity,
      source: event.source,
    })),
    ...maps.map((map) => ({
      id: `clarity-${map.id}`,
      kind: "clarity_map" as const,
      title: map.mainConcern,
      summary: map.nextStep,
      date: map.createdAt,
      severity: map.safetyFlags ? "attention" : "low",
      source: "ai" as const,
    })),
    ...appointments.map((appointment) => ({
      id: `appointment-${appointment.id}`,
      kind: "appointment" as const,
      title: appointment.specialty ?? "Consulta planejada",
      summary: appointment.reason ?? appointment.notes,
      date: appointment.scheduledAt ?? appointment.createdAt,
      severity: "low" as const,
      source: "doctor" as const,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}


export type RegisterHealthDataConnectionInput = {
  provider: InsertHealthDataConnection["provider"];
  displayName: string;
  status?: InsertHealthDataConnection["status"];
  deviceModel?: string | null;
  externalAccountRef?: string | null;
  permissions?: unknown;
  consentSnapshot?: unknown;
  metadata?: unknown;
};

export type RecordHealthMetricSampleInput = {
  connectionId?: number | null;
  kind: InsertHealthMetricSample["kind"];
  value: string;
  unit?: string | null;
  source?: InsertHealthMetricSample["source"];
  confidence?: string;
  startedAt?: Date;
  endedAt?: Date | null;
  note?: string | null;
  metadata?: unknown;
};

export type UpsertCarePlanItemInput = {
  id?: number;
  clarityMapId?: number | null;
  appointmentId?: number | null;
  domain?: InsertLongitudinalCarePlanItem["domain"];
  status?: InsertLongitudinalCarePlanItem["status"];
  title: string;
  description?: string | null;
  rationale?: string | null;
  ownerRole?: string;
  recurrenceRule?: string | null;
  targetMetricKind?: InsertLongitudinalCarePlanItem["targetMetricKind"] | null;
  targetValue?: string | null;
  safetyBoundary?: string | null;
  startsAt?: Date | null;
  dueAt?: Date | null;
  completedAt?: Date | null;
  metadata?: unknown;
};

export type RegisterCalendarConnectionInput = {
  provider: InsertExternalCalendarConnection["provider"];
  displayName: string;
  status?: InsertExternalCalendarConnection["status"];
  externalAccountRef?: string | null;
  defaultCalendarExternalId?: string | null;
  permissions?: unknown;
  consentSnapshot?: unknown;
  metadata?: unknown;
};

export type UpsertAppointmentCalendarSyncInput = {
  appointmentId: number;
  connectionId?: number | null;
  provider: InsertAppointmentCalendarSync["provider"];
  status?: InsertAppointmentCalendarSync["status"];
  externalEventId?: string | null;
  externalEventUrl?: string | null;
  conflictSnapshot?: unknown;
  metadata?: unknown;
};

export async function getLongitudinalClinicalCore(userId: number) {
  const db = await requireDb();
  const [summary, timeline, carePlan, healthConnections, metricSamples, calendarConnections, calendarSyncs] = await Promise.all([
    getPatientMemorySummary(userId),
    listPatientTimeline(userId),
    db.select().from(longitudinalCarePlanItems).where(eq(longitudinalCarePlanItems.userId, userId)).orderBy(desc(longitudinalCarePlanItems.createdAt)).limit(30),
    db.select().from(healthDataConnections).where(eq(healthDataConnections.userId, userId)).orderBy(desc(healthDataConnections.updatedAt)).limit(20),
    db.select().from(healthMetricSamples).where(eq(healthMetricSamples.userId, userId)).orderBy(desc(healthMetricSamples.startedAt)).limit(80),
    db.select().from(externalCalendarConnections).where(eq(externalCalendarConnections.userId, userId)).orderBy(desc(externalCalendarConnections.updatedAt)).limit(20),
    db.select().from(appointmentCalendarSyncs).where(eq(appointmentCalendarSyncs.userId, userId)).orderBy(desc(appointmentCalendarSyncs.updatedAt)).limit(40),
  ]);

  const activeCarePlan = carePlan.filter((item) => item.status === "planned" || item.status === "active" || item.status === "needs_review");
  const deviceReadiness = {
    apple: healthConnections.some((item) => item.provider === "apple_health" || item.provider === "apple_watch"),
    android: healthConnections.some((item) => item.provider === "health_connect" || item.provider === "android_wearable" || item.provider === "google_fit"),
    manual: healthConnections.some((item) => item.provider === "manual_entry"),
    connectedCount: healthConnections.filter((item) => item.status === "connected").length,
  };
  const calendarReadiness = {
    google: calendarConnections.some((item) => item.provider === "google_calendar"),
    apple: calendarConnections.some((item) => item.provider === "apple_calendar"),
    outlook: calendarConnections.some((item) => item.provider === "outlook_calendar"),
    connectedCount: calendarConnections.filter((item) => item.status === "connected").length,
  };

  return {
    summary,
    timeline,
    carePlan,
    activeCarePlan,
    healthConnections,
    metricSamples,
    calendarConnections,
    calendarSyncs,
    readiness: { deviceReadiness, calendarReadiness },
    safetyNotice: "O núcleo longitudinal organiza dados, sinais e perguntas para continuidade do cuidado. Ele não substitui diagnóstico, prescrição, urgência médica ou interpretação individualizada de exames.",
    architectureVersion: "longitudinal-core-universal-connectors-v1",
  };
}

export async function registerHealthDataConnection(userId: number, input: RegisterHealthDataConnectionInput) {
  const db = await requireDb();
  const values: InsertHealthDataConnection = {
    userId,
    provider: input.provider,
    status: input.status ?? "pending_consent",
    displayName: input.displayName,
    deviceModel: input.deviceModel ?? null,
    externalAccountRef: input.externalAccountRef ?? null,
    permissions: serializeClinicalMetadata(input.permissions),
    consentSnapshot: serializeClinicalMetadata(input.consentSnapshot),
    metadata: serializeClinicalMetadata(input.metadata),
  };
  const result = await db.insert(healthDataConnections).values(values);
  return { id: extractInsertId(result), ...values };
}

export async function recordHealthMetricSample(userId: number, input: RecordHealthMetricSampleInput) {
  const db = await requireDb();
  const values: InsertHealthMetricSample = {
    userId,
    connectionId: input.connectionId ?? null,
    kind: input.kind,
    value: input.value,
    unit: input.unit ?? null,
    source: input.source ?? "patient",
    confidence: input.confidence ?? "observed",
    startedAt: input.startedAt ?? new Date(),
    endedAt: input.endedAt ?? null,
    note: input.note ?? null,
    metadata: serializeClinicalMetadata(input.metadata),
  };
  const result = await db.insert(healthMetricSamples).values(values);
  await addClinicalMemoryEvent(userId, {
    eventType: "habit",
    source: values.source,
    severity: "low",
    title: `Métrica longitudinal registrada: ${values.kind}`,
    summary: `${values.value}${values.unit ? ` ${values.unit}` : ""}`,
    occurredAt: values.startedAt,
    metadata: { metricKind: values.kind, connectionId: values.connectionId, flow: "universal_health_metric_sample" },
  });
  return { id: extractInsertId(result), ...values };
}

export async function upsertLongitudinalCarePlanItem(userId: number, input: UpsertCarePlanItemInput) {
  const db = await requireDb();
  const values: InsertLongitudinalCarePlanItem = {
    userId,
    clarityMapId: input.clarityMapId ?? null,
    appointmentId: input.appointmentId ?? null,
    domain: input.domain ?? "other",
    status: input.status ?? "planned",
    title: input.title,
    description: input.description ?? null,
    rationale: input.rationale ?? null,
    ownerRole: input.ownerRole ?? "patient",
    recurrenceRule: input.recurrenceRule ?? null,
    targetMetricKind: input.targetMetricKind ?? null,
    targetValue: input.targetValue ?? null,
    safetyBoundary: input.safetyBoundary ?? "Revisar com profissional habilitado antes de tomar decisões clínicas.",
    startsAt: input.startsAt ?? null,
    dueAt: input.dueAt ?? null,
    completedAt: input.completedAt ?? null,
    metadata: serializeClinicalMetadata(input.metadata),
  };

  if (input.id) {
    await db.update(longitudinalCarePlanItems).set({ ...values, updatedAt: new Date() }).where(and(eq(longitudinalCarePlanItems.id, input.id), eq(longitudinalCarePlanItems.userId, userId)));
    const rows = await db.select().from(longitudinalCarePlanItems).where(and(eq(longitudinalCarePlanItems.id, input.id), eq(longitudinalCarePlanItems.userId, userId))).limit(1);
    return rows[0] ?? { id: input.id, ...values };
  }

  const result = await db.insert(longitudinalCarePlanItems).values(values);
  const carePlanItem = { id: extractInsertId(result), ...values };
  await addClinicalMemoryEvent(userId, {
    eventType: "note",
    source: "system",
    severity: values.status === "needs_review" ? "attention" : "low",
    title: `Plano longitudinal: ${values.title}`,
    summary: values.description ?? "Item de plano de cuidado registrado para acompanhamento longitudinal.",
    metadata: { carePlanItemId: carePlanItem.id, domain: values.domain, flow: "longitudinal_care_plan" },
  });
  return carePlanItem;
}

export async function registerCalendarConnection(userId: number, input: RegisterCalendarConnectionInput) {
  const db = await requireDb();
  const values: InsertExternalCalendarConnection = {
    userId,
    provider: input.provider,
    status: input.status ?? "pending_consent",
    displayName: input.displayName,
    externalAccountRef: input.externalAccountRef ?? null,
    defaultCalendarExternalId: input.defaultCalendarExternalId ?? null,
    permissions: serializeClinicalMetadata(input.permissions),
    consentSnapshot: serializeClinicalMetadata(input.consentSnapshot),
    metadata: serializeClinicalMetadata(input.metadata),
  };
  const result = await db.insert(externalCalendarConnections).values(values);
  return { id: extractInsertId(result), ...values };
}

export async function upsertAppointmentCalendarSync(userId: number, input: UpsertAppointmentCalendarSyncInput) {
  const db = await requireDb();
  const values: InsertAppointmentCalendarSync = {
    userId,
    appointmentId: input.appointmentId,
    connectionId: input.connectionId ?? null,
    provider: input.provider,
    status: input.status ?? "queued",
    externalEventId: input.externalEventId ?? null,
    externalEventUrl: input.externalEventUrl ?? null,
    conflictSnapshot: serializeClinicalMetadata(input.conflictSnapshot),
    metadata: serializeClinicalMetadata(input.metadata),
  };
  const result = await db.insert(appointmentCalendarSyncs).values(values);
  return { id: extractInsertId(result), ...values };
}

export type CreateCareAppointmentInput = {
  clarityMapId?: number | null;
  doctorName?: string | null;
  specialty?: string | null;
  reason?: string | null;
  notes?: string | null;
  scheduledAt?: Date | null;
};

export async function requestCareAppointment(userId: number, input: CreateCareAppointmentInput) {
  const db = await requireDb();
  const values = {
    userId,
    clarityMapId: input.clarityMapId ?? null,
    doctorName: input.doctorName ?? null,
    specialty: input.specialty ?? null,
    status: "requested" as const,
    reason: input.reason ?? null,
    scheduledAt: input.scheduledAt ?? null,
    notes: input.notes ?? "Solicitação criada pelo catálogo DOUTORELO.",
  };
  const result = await db.insert(careAppointments).values(values);
  const appointment = {
    id: extractInsertId(result),
    ...values,
  };

  await addClinicalMemoryEvent(userId, {
    eventType: "appointment",
    source: "patient",
    severity: "low",
    title: `Solicitação de consulta: ${values.specialty ?? "profissional DOUTORELO"}`,
    summary: values.reason ?? "Solicitação inicial de agendamento registrada para continuidade do cuidado.",
    metadata: {
      doctorName: values.doctorName,
      specialty: values.specialty,
      appointmentId: appointment.id,
      flow: "professional_catalog_request",
    },
  });

  return appointment;
}

export async function listPatientAppointments(userId: number) {
  const db = await requireDb();
  return db
    .select()
    .from(careAppointments)
    .where(eq(careAppointments.userId, userId))
    .orderBy(desc(careAppointments.createdAt))
    .limit(30);
}

export type CareAppointmentStatus = (typeof appointmentStatusValues)[number];

export async function listAllCareAppointments(limit = 80) {
  const db = await requireDb();
  return db
    .select()
    .from(careAppointments)
    .orderBy(desc(careAppointments.createdAt))
    .limit(limit);
}

export async function updateCareAppointmentStatus(input: { id: number; status: CareAppointmentStatus; notes?: string | null }) {
  const db = await requireDb();
  await db
    .update(careAppointments)
    .set({
      status: input.status,
      notes: input.notes ?? null,
      updatedAt: new Date(),
    })
    .where(eq(careAppointments.id, input.id));
  const rows = await db.select().from(careAppointments).where(eq(careAppointments.id, input.id)).limit(1);
  return rows[0] ?? null;
}

export async function listBookedAppointmentsForProfessional(doctorName: string) {
  const db = await requireDb();
  return db
    .select()
    .from(careAppointments)
    .where(eq(careAppointments.doctorName, doctorName))
    .orderBy(desc(careAppointments.createdAt))
    .limit(100);
}

export async function requestCareAppointmentSlot(userId: number, input: CreateCareAppointmentInput & { slotIso: string; professionalId: string }) {
  const db = await requireDb();
  const scheduledAt = new Date(input.slotIso);
  const doctorName = input.doctorName ?? "Profissional DOUTORELO";
  const existing = await db
    .select()
    .from(careAppointments)
    .where(
      and(
        eq(careAppointments.doctorName, doctorName),
        eq(careAppointments.scheduledAt, scheduledAt),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    throw new Error("DOUBLE_BOOKING_SLOT_UNAVAILABLE");
  }

  return requestCareAppointment(userId, {
    ...input,
    doctorName,
    scheduledAt,
    notes: `${input.notes ?? "Agendamento solicitado pelo usuário."}\nprofessionalId=${input.professionalId}\nslotIso=${input.slotIso}`,
  });
}

export type MarketplaceOrderStatus = (typeof marketplaceOrderStatusValues)[number];

export const MARKETPLACE_COMMERCIAL_NOTICE =
  "Produto ou serviço comercial do DOUTORELO. Não substitui avaliação médica, diagnóstico, prescrição, orientação de urgência ou acompanhamento profissional.";

export const MARKETPLACE_DEV_CHECKOUT_NOTICE =
  "Checkout simulado no ambiente DEV. Nenhuma cobrança real é realizada nesta etapa.";

const marketplaceSeedCategories: InsertMarketplaceCategory[] = [
  {
    slug: "rotina-e-bem-estar",
    name: "Rotina e bem-estar",
    description: "Produtos e serviços de apoio à rotina, conforto e organização do cuidado.",
    displayOrder: 1,
    active: 1,
  },
  {
    slug: "preparo-para-consulta",
    name: "Preparo para consulta",
    description: "Serviços e materiais para chegar à consulta com informações mais claras.",
    displayOrder: 2,
    active: 1,
  },
  {
    slug: "monitoramento-em-casa",
    name: "Monitoramento em casa",
    description: "Itens de acompanhamento cotidiano, sempre sem promessa diagnóstica.",
    displayOrder: 3,
    active: 1,
  },
];

const marketplaceSeedPartners: InsertMarketplacePartner[] = [
  {
    slug: "doutorelo-curadoria",
    name: "Curadoria DOUTORELO",
    partnerType: "curadoria_propria",
    verificationStatus: "reviewed_dev",
    description: "Seleção editorial e comercial validada para linguagem segura no ambiente DEV.",
    active: 1,
  },
  {
    slug: "parceiro-integrativo-dev",
    name: "Parceiro Integrativo DEV",
    partnerType: "curated_partner",
    verificationStatus: "reviewed_dev",
    description: "Parceiro demonstrativo usado para testar catálogo, estoque e pedidos.",
    active: 1,
  },
];

type MarketplaceSeedItem = InsertMarketplaceItem & { stockOnHand: number; lowStockThreshold?: number };

const marketplaceSeedItems: MarketplaceSeedItem[] = [
  {
    slug: "kit-organizacao-consulta",
    kind: "product",
    name: "Kit de organização para consulta",
    subtitle: "Caderno guiado, checklist e lembretes para levar suas informações com mais clareza.",
    description: "Material de apoio para organizar sintomas, exames, dúvidas e histórico antes de falar com um profissional de saúde.",
    claimReviewNotes: "Sem promessa clínica. Produto de organização pessoal e preparo de conversa.",
    commercialNotice: MARKETPLACE_COMMERCIAL_NOTICE,
    priceCents: 8900,
    currency: "BRL",
    publicationStatus: "published",
    eligibility: "general",
    inventoryPolicy: "track_stock",
    tags: "consulta, organização, histórico, preparo",
    featured: 1,
    requiresConsent: 1,
    stockOnHand: 36,
    lowStockThreshold: 5,
  },
  {
    slug: "sessao-preparo-consulta-integrativa",
    kind: "service",
    name: "Sessão de preparo para consulta",
    subtitle: "Atendimento de apoio para organizar perguntas, documentos e prioridades antes da consulta.",
    description: "Serviço de apoio não diagnóstico para ajudar o usuário a estruturar o que deseja conversar com seu profissional.",
    claimReviewNotes: "Serviço administrativo/educativo. Não realiza diagnóstico, conduta ou prescrição.",
    commercialNotice: MARKETPLACE_COMMERCIAL_NOTICE,
    priceCents: 14900,
    currency: "BRL",
    publicationStatus: "published",
    eligibility: "requires_profile",
    inventoryPolicy: "service_capacity",
    tags: "consulta, preparo, organização, perguntas",
    featured: 1,
    requiresConsent: 1,
    stockOnHand: 12,
    lowStockThreshold: 2,
  },
  {
    slug: "organizador-exames-documentos",
    kind: "product",
    name: "Organizador de exames e documentos",
    subtitle: "Pasta e etiquetas para manter exames, receitas e relatórios em ordem.",
    description: "Item físico de apoio para guardar documentos de saúde e facilitar a continuidade do cuidado.",
    claimReviewNotes: "Produto físico de organização. Sem reivindicação terapêutica.",
    commercialNotice: MARKETPLACE_COMMERCIAL_NOTICE,
    priceCents: 6900,
    currency: "BRL",
    publicationStatus: "published",
    eligibility: "general",
    inventoryPolicy: "track_stock",
    tags: "exames, documentos, pasta, organização",
    featured: 0,
    requiresConsent: 0,
    stockOnHand: 48,
    lowStockThreshold: 8,
  },
  {
    slug: "acompanhamento-rotina-sinais",
    kind: "service",
    name: "Acompanhamento de rotina e sinais",
    subtitle: "Serviço educativo para revisar hábitos registrados e preparar pontos de atenção para profissionais.",
    description: "Apoio estruturado para transformar registros do dia a dia em um resumo simples para consulta, sem orientar tratamento.",
    claimReviewNotes: "Não interpreta exame, não diagnostica e não recomenda conduta clínica.",
    commercialNotice: MARKETPLACE_COMMERCIAL_NOTICE,
    priceCents: 19900,
    currency: "BRL",
    publicationStatus: "published",
    eligibility: "requires_professional_context",
    inventoryPolicy: "service_capacity",
    tags: "rotina, sinais, hábitos, consulta",
    featured: 0,
    requiresConsent: 1,
    stockOnHand: 6,
    lowStockThreshold: 2,
  },
];

function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
}

function mapMarketplaceRow(
  item: typeof marketplaceItems.$inferSelect,
  categories: Array<typeof marketplaceCategories.$inferSelect>,
  partners: Array<typeof marketplacePartners.$inferSelect>,
  inventoryRows: Array<typeof marketplaceInventory.$inferSelect>,
) {
  const category = categories.find((candidate) => candidate.id === item.categoryId) ?? null;
  const partner = partners.find((candidate) => candidate.id === item.partnerId) ?? null;
  const inventory = inventoryRows.find((candidate) => candidate.itemId === item.id) ?? null;
  const availableStock = item.inventoryPolicy === "unlimited"
    ? 9999
    : Math.max(0, (inventory?.stockOnHand ?? 0) - (inventory?.reservedStock ?? 0));

  return {
    ...item,
    tags: parseTags(item.tags),
    category,
    partner,
    inventory,
    availableStock,
    isAvailable: item.inventoryPolicy === "unlimited" || availableStock > 0,
  };
}

export async function ensureMarketplaceSeed() {
  const db = await requireDb();
  const existing = await db.select().from(marketplaceCategories).limit(1);
  if (existing.length > 0) return;

  for (const category of marketplaceSeedCategories) {
    await db.insert(marketplaceCategories).values(category).onDuplicateKeyUpdate({
      set: {
        name: category.name,
        description: category.description ?? null,
        displayOrder: category.displayOrder ?? 0,
        active: category.active ?? 1,
        updatedAt: new Date(),
      },
    });
  }

  for (const partner of marketplaceSeedPartners) {
    await db.insert(marketplacePartners).values(partner).onDuplicateKeyUpdate({
      set: {
        name: partner.name,
        partnerType: partner.partnerType ?? "curated_partner",
        verificationStatus: partner.verificationStatus ?? "reviewed_dev",
        description: partner.description ?? null,
        active: partner.active ?? 1,
        updatedAt: new Date(),
      },
    });
  }

  const categories = await db.select().from(marketplaceCategories);
  const partners = await db.select().from(marketplacePartners);
  const defaultCategory = categories.find((category) => category.slug === "rotina-e-bem-estar") ?? categories[0];
  const consultCategory = categories.find((category) => category.slug === "preparo-para-consulta") ?? defaultCategory;
  const monitoringCategory = categories.find((category) => category.slug === "monitoramento-em-casa") ?? defaultCategory;
  const curator = partners.find((partner) => partner.slug === "doutorelo-curadoria") ?? partners[0];
  const devPartner = partners.find((partner) => partner.slug === "parceiro-integrativo-dev") ?? curator;

  for (const seedItem of marketplaceSeedItems) {
    const { stockOnHand, lowStockThreshold, ...item } = seedItem;
    const categoryId = item.slug.includes("consulta")
      ? consultCategory.id
      : item.slug.includes("rotina")
        ? monitoringCategory.id
        : defaultCategory.id;
    const partnerId = item.slug.includes("organizador") ? devPartner.id : curator.id;
    await db.insert(marketplaceItems).values({ ...item, categoryId, partnerId }).onDuplicateKeyUpdate({
      set: {
        name: item.name,
        subtitle: item.subtitle ?? null,
        description: item.description ?? null,
        claimReviewNotes: item.claimReviewNotes ?? null,
        commercialNotice: item.commercialNotice ?? MARKETPLACE_COMMERCIAL_NOTICE,
        priceCents: item.priceCents ?? 0,
        publicationStatus: item.publicationStatus ?? "published",
        eligibility: item.eligibility ?? "general",
        inventoryPolicy: item.inventoryPolicy ?? "track_stock",
        tags: item.tags ?? null,
        featured: item.featured ?? 0,
        requiresConsent: item.requiresConsent ?? 1,
        updatedAt: new Date(),
      },
    });

    const rows = await db.select().from(marketplaceItems).where(eq(marketplaceItems.slug, item.slug)).limit(1);
    const storedItem = rows[0];
    if (storedItem) {
      await db.insert(marketplaceInventory).values({
        itemId: storedItem.id,
        stockOnHand,
        reservedStock: 0,
        lowStockThreshold: lowStockThreshold ?? 3,
      }).onDuplicateKeyUpdate({
        set: {
          stockOnHand,
          lowStockThreshold: lowStockThreshold ?? 3,
          updatedAt: new Date(),
        },
      });
    }
  }
}

export async function listMarketplaceCatalog(input: { categorySlug?: string; kind?: "product" | "service"; query?: string; includeInactive?: boolean } = {}) {
  await ensureMarketplaceSeed();
  const db = await requireDb();
  const conditions = [];
  if (!input.includeInactive) conditions.push(eq(marketplaceItems.publicationStatus, "published"));
  if (input.kind) conditions.push(eq(marketplaceItems.kind, input.kind));
  if (input.query?.trim()) {
    const term = `%${input.query.trim()}%`;
    conditions.push(or(like(marketplaceItems.name, term), like(marketplaceItems.subtitle, term), like(marketplaceItems.tags, term))!);
  }

  const [items, categories, partners, inventoryRows] = await Promise.all([
    db.select().from(marketplaceItems).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(marketplaceItems.featured), desc(marketplaceItems.createdAt)).limit(input.includeInactive ? 250 : 80),
    db.select().from(marketplaceCategories).orderBy(marketplaceCategories.displayOrder),
    db.select().from(marketplacePartners),
    db.select().from(marketplaceInventory),
  ]);

  const mapped = items.map((item) => mapMarketplaceRow(item, categories, partners, inventoryRows));
  return input.categorySlug ? mapped.filter((item) => item.category?.slug === input.categorySlug) : mapped;
}

export async function getMarketplaceItemDetail(input: { id?: number; slug?: string }) {
  const db = await requireDb();
  await ensureMarketplaceSeed();
  const rows = await db
    .select()
    .from(marketplaceItems)
    .where(input.id ? eq(marketplaceItems.id, input.id) : eq(marketplaceItems.slug, input.slug ?? ""))
    .limit(1);
  const item = rows[0];
  if (!item) return null;
  const [categories, partners, inventoryRows] = await Promise.all([
    db.select().from(marketplaceCategories),
    db.select().from(marketplacePartners),
    db.select().from(marketplaceInventory),
  ]);
  return mapMarketplaceRow(item, categories, partners, inventoryRows);
}

function buildActiveMarketplaceCartKey(userId: number): string {
  return `user:${userId}:active`;
}

function normalizeExplicitMarketplaceIdempotencyKey(idempotencyKey?: string | null): string | null {
  const raw = idempotencyKey?.trim();
  if (!raw) return null;
  return raw.slice(0, 128);
}

async function getOrCreateActiveMarketplaceCart(userId: number) {
  const db = await requireDb();
  const activeCartKey = buildActiveMarketplaceCartKey(userId);
  const existing = await db
    .select()
    .from(marketplaceCarts)
    .where(and(eq(marketplaceCarts.userId, userId), eq(marketplaceCarts.status, "active")))
    .limit(1);
  if (existing[0]) {
    if (existing[0].activeCartKey !== activeCartKey) {
      await db
        .update(marketplaceCarts)
        .set({ activeCartKey, updatedAt: new Date() })
        .where(eq(marketplaceCarts.id, existing[0].id));
      return { ...existing[0], activeCartKey };
    }
    return existing[0];
  }

  await db
    .insert(marketplaceCarts)
    .values({ userId, status: "active", activeCartKey })
    .onDuplicateKeyUpdate({ set: { updatedAt: sql`updatedAt` } });

  const active = await db.select().from(marketplaceCarts).where(eq(marketplaceCarts.activeCartKey, activeCartKey)).limit(1);
  if (active[0]) return active[0];
  throw new Error("MARKETPLACE_ACTIVE_CART_UNAVAILABLE");
}

export async function getMarketplaceCart(userId: number) {
  const db = await requireDb();
  await ensureMarketplaceSeed();
  const cart = await getOrCreateActiveMarketplaceCart(userId);
  const rows = await db.select().from(marketplaceCartItems).where(eq(marketplaceCartItems.cartId, cart.id));
  const catalog = await listMarketplaceCatalog({ includeInactive: true });
  const items = rows.map((row) => {
    const item = catalog.find((candidate) => candidate.id === row.itemId) ?? null;
    return {
      ...row,
      item,
      lineTotalCents: row.quantity * row.unitPriceCents,
    };
  }).filter((row) => row.item);
  return {
    cart,
    items,
    subtotalCents: items.reduce((total, row) => total + row.lineTotalCents, 0),
    notice: MARKETPLACE_DEV_CHECKOUT_NOTICE,
  };
}

export async function addMarketplaceCartItem(userId: number, input: { itemId: number; quantity?: number }) {
  const db = await requireDb();
  const item = await getMarketplaceItemDetail({ id: input.itemId });
  if (!item || item.publicationStatus !== "published") throw new Error("MARKETPLACE_ITEM_NOT_AVAILABLE");
  const quantity = Math.max(1, Math.min(12, input.quantity ?? 1));
  if (item.inventoryPolicy !== "unlimited" && item.availableStock < quantity) throw new Error("MARKETPLACE_INSUFFICIENT_STOCK");
  const cart = await getOrCreateActiveMarketplaceCart(userId);
  await db.insert(marketplaceCartItems).values({
    cartId: cart.id,
    itemId: item.id,
    quantity,
    unitPriceCents: item.priceCents,
  }).onDuplicateKeyUpdate({
    set: {
      quantity,
      unitPriceCents: item.priceCents,
      updatedAt: new Date(),
    },
  });
  return getMarketplaceCart(userId);
}

export async function updateMarketplaceCartItem(userId: number, input: { itemId: number; quantity: number }) {
  const db = await requireDb();
  const cart = await getOrCreateActiveMarketplaceCart(userId);
  if (input.quantity <= 0) {
    await db.delete(marketplaceCartItems).where(and(eq(marketplaceCartItems.cartId, cart.id), eq(marketplaceCartItems.itemId, input.itemId)));
    return getMarketplaceCart(userId);
  }
  const item = await getMarketplaceItemDetail({ id: input.itemId });
  if (!item || item.availableStock < input.quantity) throw new Error("MARKETPLACE_ITEM_NOT_AVAILABLE");
  await db.update(marketplaceCartItems).set({ quantity: Math.min(input.quantity, 12), updatedAt: new Date() }).where(and(eq(marketplaceCartItems.cartId, cart.id), eq(marketplaceCartItems.itemId, input.itemId)));
  return getMarketplaceCart(userId);
}

export async function simulateMarketplaceCheckout(userId: number, input: { patientContextNote?: string | null; idempotencyKey?: string | null } = {}) {
  const db = await requireDb();
  await ensureMarketplaceSeed();
  const explicitIdempotencyKey = normalizeExplicitMarketplaceIdempotencyKey(input.idempotencyKey);
  const safetyNotice = `${MARKETPLACE_COMMERCIAL_NOTICE} ${MARKETPLACE_DEV_CHECKOUT_NOTICE}`;

  const checkoutResult = await db.transaction(async (tx) => {
    if (explicitIdempotencyKey) {
      const existingRows = await tx.execute(sql`SELECT * FROM marketplaceOrders WHERE userId = ${userId} AND idempotencyKey = ${explicitIdempotencyKey} LIMIT 1 FOR UPDATE`);
      const existingOrder = Array.isArray(existingRows[0]) ? (existingRows[0][0] as typeof marketplaceOrders.$inferSelect | undefined) : undefined;
      if (existingOrder) return { orderId: existingOrder.id, idempotencyKey: explicitIdempotencyKey };
    }

    const cartRows = await tx.execute(sql`SELECT * FROM marketplaceCarts WHERE userId = ${userId} AND status = 'active' ORDER BY id ASC LIMIT 1 FOR UPDATE`);
    const lockedCart = Array.isArray(cartRows[0]) ? (cartRows[0][0] as typeof marketplaceCarts.$inferSelect | undefined) : undefined;
    if (!lockedCart) {
      if (explicitIdempotencyKey) {
        const existingRows = await tx.execute(sql`SELECT * FROM marketplaceOrders WHERE userId = ${userId} AND idempotencyKey = ${explicitIdempotencyKey} LIMIT 1 FOR UPDATE`);
        const existingOrder = Array.isArray(existingRows[0]) ? (existingRows[0][0] as typeof marketplaceOrders.$inferSelect | undefined) : undefined;
        if (existingOrder) return { orderId: existingOrder.id, idempotencyKey: explicitIdempotencyKey };
      }
      throw new Error("MARKETPLACE_CART_EMPTY");
    }

    const idempotencyKey = explicitIdempotencyKey ?? `user:${userId}:cart:${lockedCart.id}:checkout`;
    if (!explicitIdempotencyKey) {
      const existingOrder = await tx
        .select()
        .from(marketplaceOrders)
        .where(and(eq(marketplaceOrders.userId, userId), eq(marketplaceOrders.idempotencyKey, idempotencyKey)))
        .limit(1);
      if (existingOrder[0]) return { orderId: existingOrder[0].id, idempotencyKey };
    }

    const cartItemsRows = await tx
      .select()
      .from(marketplaceCartItems)
      .where(eq(marketplaceCartItems.cartId, lockedCart.id));
    if (cartItemsRows.length === 0) throw new Error("MARKETPLACE_CART_EMPTY");

    const orderLines: Array<{
      itemId: number;
      quantity: number;
      unitPriceCents: number;
      nameSnapshot: string;
      commercialNoticeSnapshot: string;
      lineTotalCents: number;
    }> = [];

    for (const cartItem of cartItemsRows) {
      const itemRows = await tx.execute(sql`SELECT * FROM marketplaceItems WHERE id = ${cartItem.itemId} AND publicationStatus = 'published' LIMIT 1 FOR UPDATE`);
      const item = Array.isArray(itemRows[0]) ? (itemRows[0][0] as typeof marketplaceItems.$inferSelect | undefined) : undefined;
      if (!item) throw new Error("MARKETPLACE_ITEM_NOT_AVAILABLE");

      if (item.inventoryPolicy !== "unlimited") {
        const inventoryRows = await tx.execute(sql`SELECT * FROM marketplaceInventory WHERE itemId = ${item.id} LIMIT 1 FOR UPDATE`);
        const inventory = Array.isArray(inventoryRows[0]) ? (inventoryRows[0][0] as typeof marketplaceInventory.$inferSelect | undefined) : undefined;
        if (!inventory || inventory.stockOnHand < cartItem.quantity) throw new Error("MARKETPLACE_ITEM_OUT_OF_STOCK");

        const updateResult = await tx.execute(sql`
          UPDATE marketplaceInventory
          SET stockOnHand = stockOnHand - ${cartItem.quantity}, updatedAt = NOW()
          WHERE id = ${inventory.id} AND stockOnHand >= ${cartItem.quantity}
        `);
        const packet = Array.isArray(updateResult) ? (updateResult[0] as { affectedRows?: number }) : undefined;
        if ((packet?.affectedRows ?? 0) !== 1) throw new Error("MARKETPLACE_ITEM_OUT_OF_STOCK");
      }

      orderLines.push({
        itemId: item.id,
        quantity: cartItem.quantity,
        unitPriceCents: cartItem.unitPriceCents,
        nameSnapshot: item.name,
        commercialNoticeSnapshot: item.commercialNotice ?? MARKETPLACE_COMMERCIAL_NOTICE,
        lineTotalCents: cartItem.quantity * cartItem.unitPriceCents,
      });
    }

    const subtotalCents = orderLines.reduce((total, row) => total + row.lineTotalCents, 0);
    const orderResult = await tx.insert(marketplaceOrders).values({
      userId,
      cartId: lockedCart.id,
      status: "simulated_checkout",
      subtotalCents,
      currency: "BRL",
      checkoutMode: "dev_simulated",
      idempotencyKey,
      patientContextNote: input.patientContextNote ?? null,
      safetyNotice,
    });
    const createdOrderId = extractInsertId(orderResult);

    for (const row of orderLines) {
      await tx.insert(marketplaceOrderItems).values({
        orderId: createdOrderId,
        itemId: row.itemId,
        quantity: row.quantity,
        unitPriceCents: row.unitPriceCents,
        nameSnapshot: row.nameSnapshot,
        commercialNoticeSnapshot: row.commercialNoticeSnapshot,
      });
    }

    await tx
      .update(marketplaceCarts)
      .set({ status: "converted", activeCartKey: null, updatedAt: new Date() })
      .where(and(eq(marketplaceCarts.id, lockedCart.id), eq(marketplaceCarts.userId, userId)));

    return { orderId: createdOrderId, idempotencyKey };
  });

  const order = await getMarketplaceOrder(userId, checkoutResult.orderId);
  if (!order) throw new Error("MARKETPLACE_ORDER_RELOAD_FAILED");

  await addClinicalMemoryEvent(userId, {
    eventType: "note",
    source: "system",
    severity: "low",
    title: "Pedido simulado no marketplace",
    summary: "Pedido DEV registrado sem cobrança real e sem recomendação clínica prescritiva.",
    metadata: { orderId: checkoutResult.orderId, subtotalCents: order.order.subtotalCents, checkoutMode: "dev_simulated", idempotencyKey: checkoutResult.idempotencyKey },
  });
  return order;
}

export async function getMarketplaceOrder(userId: number, orderId: number) {
  const db = await requireDb();
  const orders = await db.select().from(marketplaceOrders).where(and(eq(marketplaceOrders.id, orderId), eq(marketplaceOrders.userId, userId))).limit(1);
  const order = orders[0] ?? null;
  if (!order) return null;
  const items = await db.select().from(marketplaceOrderItems).where(eq(marketplaceOrderItems.orderId, order.id));
  return { order, items };
}

export async function listPatientMarketplaceOrders(userId: number) {
  const db = await requireDb();
  return db.select().from(marketplaceOrders).where(eq(marketplaceOrders.userId, userId)).orderBy(desc(marketplaceOrders.createdAt)).limit(30);
}

export async function listAllMarketplaceOrders(limit = 100) {
  const db = await requireDb();
  return db.select().from(marketplaceOrders).orderBy(desc(marketplaceOrders.createdAt)).limit(limit);
}

export async function upsertMarketplaceItemAdmin(input: Partial<InsertMarketplaceItem> & { id?: number; name: string; slug: string }) {
  const db = await requireDb();
  if (input.id) {
    await db.update(marketplaceItems).set({
      ...input,
      commercialNotice: input.commercialNotice ?? MARKETPLACE_COMMERCIAL_NOTICE,
      updatedAt: new Date(),
    }).where(eq(marketplaceItems.id, input.id));
    return getMarketplaceItemDetail({ id: input.id });
  }
  const result = await db.insert(marketplaceItems).values({
    ...input,
    kind: input.kind ?? "product",
    publicationStatus: input.publicationStatus ?? "draft",
    eligibility: input.eligibility ?? "general",
    inventoryPolicy: input.inventoryPolicy ?? "track_stock",
    commercialNotice: input.commercialNotice ?? MARKETPLACE_COMMERCIAL_NOTICE,
  });
  return getMarketplaceItemDetail({ id: extractInsertId(result) });
}

export async function updateMarketplaceInventoryAdmin(input: { itemId: number; stockOnHand: number; lowStockThreshold?: number; restockNote?: string | null }) {
  const db = await requireDb();
  await db.insert(marketplaceInventory).values({
    itemId: input.itemId,
    stockOnHand: Math.max(0, input.stockOnHand),
    reservedStock: 0,
    lowStockThreshold: Math.max(0, input.lowStockThreshold ?? 3),
    restockNote: input.restockNote ?? null,
  }).onDuplicateKeyUpdate({
    set: {
      stockOnHand: Math.max(0, input.stockOnHand),
      lowStockThreshold: Math.max(0, input.lowStockThreshold ?? 3),
      restockNote: input.restockNote ?? null,
      updatedAt: new Date(),
    },
  });
  return getMarketplaceItemDetail({ id: input.itemId });
}

export async function recordMarketplaceRecommendationEvent(userId: number, input: { itemId?: number | null; source?: "profile" | "memory" | "appointment" | "manual" | "ai"; rationale?: string | null; consentSnapshot?: string | null }) {
  const db = await requireDb();
  const result = await db.insert(marketplaceRecommendationEvents).values({
    userId,
    itemId: input.itemId ?? null,
    source: input.source ?? "manual",
    rationale: input.rationale ?? null,
    safetyNotice: MARKETPLACE_COMMERCIAL_NOTICE,
    consentSnapshot: input.consentSnapshot ?? null,
  });
  return { id: extractInsertId(result), safetyNotice: MARKETPLACE_COMMERCIAL_NOTICE };
}

export async function getPatientDashboard(userId: number) {
  const [summary, timeline] = await Promise.all([
    getPatientMemorySummary(userId),
    listPatientTimeline(userId),
  ]);
  const latestMap = summary.recentClarityMaps[0] ?? null;
  const latestAppointment = summary.appointments[0] ?? null;
  const profileCompleteness = summary.profile?.completenessScore ?? 0;
  const openAttentionEvents = summary.recentEvents.filter((event) => event.severity === "attention" || event.severity === "urgent");
  const documentsCount = summary.documents.length;
  const indicatorsCount = summary.indicators.length;
  const recommendations = [
    profileCompleteness < 70
      ? "Complete seu perfil clínico para melhorar a organização da sua memória longitudinal."
      : "Revise sua memória longitudinal antes da próxima conversa com um profissional.",
    latestMap?.questionsForDoctor
      ? "Use as perguntas do último Mapa de Clareza para preparar sua próxima consulta."
      : "Crie um Mapa de Clareza quando houver uma nova dúvida de saúde.",
    documentsCount === 0
      ? "Inclua exames ou documentos importantes quando estiverem disponíveis."
      : "Mantenha exames recentes associados à sua linha do tempo.",
  ];

  return {
    profile: summary.profile,
    latestMap,
    latestAppointment,
    timeline: timeline.slice(0, 8),
    documents: summary.documents,
    indicators: summary.indicators,
    consents: summary.consents,
    recommendations,
    evolution: {
      profileCompleteness,
      eventsTracked: summary.recentEvents.length,
      mapsCreated: summary.recentClarityMaps.length,
      documentsCount,
      indicatorsCount,
      openAttentionCount: openAttentionEvents.length,
    },
  };
}

export type RecordMlLearningEventInput = {
  userId?: number | null;
  sessionId?: number | null;
  aiExecutionId?: number | null;
  source?: InsertMlLearningEvent["source"];
  turnIndex?: number;
  userInput?: string | null;
  aiResponse?: string | null;
  normalizedIntent?: string | null;
  redFlagSnapshot?: unknown;
  ragContextSnapshot?: unknown;
  autoQualityScore?: number;
  autoQualityLabel?: InsertMlLearningEvent["autoQualityLabel"];
  qualitySignals?: unknown;
  promptVersion?: string | null;
  modelVersion?: string | null;
  isTrainingCandidate?: boolean;
  privacyScope?: string;
  consentSnapshot?: unknown;
};

export function evaluateLearningEventQuality(input: { aiResponse?: string | null; safetySnapshot?: unknown; feedbackRating?: string | null; ragSourceCount?: number | null }) {
  const response = input.aiResponse?.trim() ?? "";
  const signals: string[] = [];
  let score = 72;
  let label: InsertMlLearningEvent["autoQualityLabel"] = "good";

  if (response.length < 80) {
    score -= 22;
    signals.push("resposta_curta_demais");
  }
  if (response.length > 1800) {
    score -= 16;
    signals.push("resposta_longa_demais");
  }
  if (/\b(cura garantida|diagn[oó]stico definitivo|prescri[cç][aã]o|dose exata|substitui consulta)\b/i.test(response)) {
    score -= 55;
    signals.push("linguagem_clinica_insegura");
    label = "unsafe";
  }
  if (/\b(n[aã]o sei|procure um m[eé]dico|recomendo atendimento)\b/i.test(response)) {
    signals.push("encaminhamento_profissional_presente");
  }
  if ((input.ragSourceCount ?? 0) > 0) {
    score += Math.min((input.ragSourceCount ?? 0) * 4, 12);
    signals.push("rag_com_fontes");
  }
  if (input.feedbackRating === "needs_human") {
    score -= 30;
    signals.push("feedback_pede_humano");
    label = label === "unsafe" ? label : "needs_human_review";
  }
  if (input.feedbackRating === "unclear") {
    score -= 20;
    signals.push("feedback_pouco_claro");
    label = label === "unsafe" ? label : "not_useful";
  }
  if (input.feedbackRating === "helpful") {
    score += 10;
    signals.push("feedback_util");
  }

  score = Math.max(0, Math.min(100, score));
  if (label !== "unsafe" && label !== "needs_human_review" && label !== "not_useful") {
    label = score >= 88 ? "excellent" : score >= 68 ? "good" : score >= 48 ? "generic" : "not_useful";
  }

  return {
    score,
    label,
    signals,
    trainingCandidate: label === "unsafe" || label === "not_useful" || label === "needs_human_review" || score >= 88,
  };
}

export async function recordMlLearningEvent(input: RecordMlLearningEventInput) {
  const db = await requireDb();
  const quality = evaluateLearningEventQuality({ aiResponse: input.aiResponse, feedbackRating: null });
  const values: InsertMlLearningEvent = {
    userId: input.userId ?? null,
    sessionId: input.sessionId ?? null,
    aiExecutionId: input.aiExecutionId ?? null,
    source: input.source ?? "care_journey",
    turnIndex: input.turnIndex ?? 0,
    userInput: input.userInput?.trim() ? input.userInput.trim().slice(0, 6000) : null,
    aiResponse: input.aiResponse?.trim() ? input.aiResponse.trim().slice(0, 6000) : null,
    normalizedIntent: input.normalizedIntent ?? null,
    redFlagSnapshot: serializeClinicalMetadata(input.redFlagSnapshot),
    ragContextSnapshot: serializeClinicalMetadata(input.ragContextSnapshot),
    autoQualityScore: input.autoQualityScore ?? quality.score,
    autoQualityLabel: input.autoQualityLabel ?? quality.label,
    qualitySignals: serializeClinicalMetadata(input.qualitySignals ?? quality.signals),
    promptVersion: input.promptVersion ?? null,
    modelVersion: input.modelVersion ?? null,
    isTrainingCandidate: input.isTrainingCandidate ?? quality.trainingCandidate ? 1 : 0,
    privacyScope: input.privacyScope ?? "lgpd_minimized",
    consentSnapshot: serializeClinicalMetadata(input.consentSnapshot),
  };
  const result = await db.insert(mlLearningEvents).values(values);
  return { id: extractInsertId(result), ...values };
}

export async function recordDayanRagRetrievalEvent(input: InsertDayanRagRetrievalEvent) {
  const db = await requireDb();
  const result = await db.insert(dayanRagRetrievalEvents).values(input);
  return { id: extractInsertId(result), ...input };
}

export async function listMlLearningEventsForReview(input: { limit?: number; onlyCandidates?: boolean; label?: InsertMlLearningEvent["autoQualityLabel"] | "all" } = {}) {
  const db = await requireDb();
  const conditions = [];
  if (input.onlyCandidates ?? true) conditions.push(eq(mlLearningEvents.isTrainingCandidate, 1));
  if (input.label && input.label !== "all") conditions.push(eq(mlLearningEvents.autoQualityLabel, input.label));
  return db
    .select()
    .from(mlLearningEvents)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(mlLearningEvents.createdAt))
    .limit(Math.min(Math.max(input.limit ?? 40, 1), 120));
}

export async function reviewMlLearningEvent(input: { id: number; reviewerUserId: number; humanLabel: InsertMlLearningEvent["humanLabel"]; reviewerNotes?: string | null; isTrainingCandidate?: boolean }) {
  const db = await requireDb();
  await db
    .update(mlLearningEvents)
    .set({
      humanLabel: input.humanLabel,
      reviewerUserId: input.reviewerUserId,
      reviewerNotes: input.reviewerNotes?.trim() ? input.reviewerNotes.trim().slice(0, 1400) : null,
      isTrainingCandidate: input.isTrainingCandidate ?? input.humanLabel === "training_candidate" ? 1 : 0,
      reviewedAt: new Date(),
    })
    .where(eq(mlLearningEvents.id, input.id));
  const rows = await db.select().from(mlLearningEvents).where(eq(mlLearningEvents.id, input.id)).limit(1);
  return rows[0] ?? null;
}

export async function createMlTrainingExample(input: Omit<InsertMlTrainingExample, "createdAt">) {
  const db = await requireDb();
  const result = await db.insert(mlTrainingExamples).values(input);
  return { id: extractInsertId(result), ...input };
}

export async function listMlTrainingExamples(input: { limit?: number; status?: InsertMlTrainingExample["status"] | "all" } = {}) {
  const db = await requireDb();
  return db
    .select()
    .from(mlTrainingExamples)
    .where(input.status && input.status !== "all" ? eq(mlTrainingExamples.status, input.status) : undefined)
    .orderBy(desc(mlTrainingExamples.createdAt))
    .limit(Math.min(Math.max(input.limit ?? 40, 1), 120));
}

export async function createMlImprovementCycle(input: Partial<InsertMlImprovementCycle> = {}) {
  const db = await requireDb();
  const values: InsertMlImprovementCycle = {
    triggeredBy: input.triggeredBy ?? "daily_quality_review",
    status: input.status ?? "open",
    reviewedCount: input.reviewedCount ?? 0,
    promotedCount: input.promotedCount ?? 0,
    rejectedCount: input.rejectedCount ?? 0,
    notes: input.notes ?? null,
    metricsSnapshot: input.metricsSnapshot ?? null,
    startedAt: input.startedAt ?? new Date(),
    completedAt: input.completedAt ?? null,
  };
  const result = await db.insert(mlImprovementCycles).values(values);
  return { id: extractInsertId(result), ...values };
}

export async function getMlDailyReviewSummary() {
  const db = await requireDb();
  const [events, trainingExamples, cycles, ragEvents] = await Promise.all([
    db.select().from(mlLearningEvents).orderBy(desc(mlLearningEvents.createdAt)).limit(250),
    db.select().from(mlTrainingExamples).orderBy(desc(mlTrainingExamples.createdAt)).limit(100),
    db.select().from(mlImprovementCycles).orderBy(desc(mlImprovementCycles.createdAt)).limit(20),
    db.select().from(dayanRagRetrievalEvents).orderBy(desc(dayanRagRetrievalEvents.createdAt)).limit(100),
  ]);
  const candidates = events.filter((event) => event.isTrainingCandidate === 1);
  const reviewed = events.filter((event) => Boolean(event.reviewedAt));
  const labelCounts = events.reduce<Record<string, number>>((acc, event) => {
    acc[event.autoQualityLabel] = (acc[event.autoQualityLabel] ?? 0) + 1;
    return acc;
  }, {});
  const averageQualityScore = events.length ? Math.round(events.reduce((sum, event) => sum + Number(event.autoQualityScore ?? 0), 0) / events.length) : 0;
  return {
    metrics: {
      totalLearningEvents: events.length,
      reviewCandidates: candidates.length,
      reviewedEvents: reviewed.length,
      trainingExamples: trainingExamples.length,
      openImprovementCycles: cycles.filter((cycle) => cycle.status !== "completed" && cycle.status !== "cancelled").length,
      ragRetrievals: ragEvents.length,
      groundedRetrievals: ragEvents.filter((event) => event.antiHallucinationStatus === "grounded").length,
      averageQualityScore,
      labelCounts,
    },
    recentCandidates: candidates.slice(0, 20),
    recentTrainingExamples: trainingExamples.slice(0, 20),
    recentImprovementCycles: cycles,
    recentRagEvents: ragEvents.slice(0, 20),
  };
}

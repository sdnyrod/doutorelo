import { and, eq, sql } from "drizzle-orm";
import {
  dataIngestionJobs,
  healthDirectoryCoverage,
  healthProviderEvidences,
  healthProviderSources,
  healthProviderSpecialties,
  healthProviders,
  type InsertHealthProvider,
  type InsertHealthProviderEvidence,
  type InsertHealthProviderSource,
  type InsertHealthProviderSpecialty,
} from "../drizzle/schema";
import { createHealthDirectoryIngestionJob, getDb, listNationalHealthProviders } from "./db";

export const CNES_OFFICIAL_SOURCE_KEY = "cnes_datasus_pf";
export const CNES_OFFICIAL_SOURCE_NAME = "CNES/DATASUS — Profissionais PF";

export type CnesOfficialProfessionalRecord = {
  displayName: string;
  state: string;
  city: string;
  municipalityCode?: string | null;
  cnesCode: string;
  cboCode?: string | null;
  primarySpecialty?: string | null;
  councilType?: "crm" | "other" | "not_applicable" | null;
  councilNumber?: string | null;
  councilState?: string | null;
  licenseStatus?: string | null;
  competence: string;
  sourcePath?: string | null;
  sourceUrl?: string | null;
  externalId: string;
  rawEvidence?: Record<string, unknown> | null;
};

export type IngestCnesOfficialProfessionalsInput = {
  records: CnesOfficialProfessionalRecord[];
  requestedByUserId?: number | null;
  state?: string | null;
  city?: string | null;
  competence?: string | null;
  dryRun?: boolean;
  limit?: number;
};

type IngestionCounters = {
  recordsSeen: number;
  recordsProcessed: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  errorCount: number;
};

type NormalizedCnesRecord = CnesOfficialProfessionalRecord & {
  displayName: string;
  normalizedName: string;
  state: string;
  city: string;
  cnesCode: string;
  primarySpecialty: string;
  externalId: string;
};

function requireDatabase() {
  return getDb().then((db) => {
    if (!db) throw new Error("Banco de dados indisponível para ingestão CNES.");
    return db;
  });
}

function extractInsertId(result: unknown): number {
  if (Array.isArray(result)) {
    const first = result[0] as { insertId?: number | bigint } | undefined;
    return Number(first?.insertId ?? 0);
  }
  const maybe = result as { insertId?: number | bigint; rows?: Array<{ insertId?: number | bigint }> };
  const raw = maybe.insertId ?? maybe.rows?.[0]?.insertId ?? 0;
  return Number(raw);
}

function normalizeDirectoryName(value: string): string {
  return value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/\s+/g, " ").slice(0, 220);
}

function clampScore(value: number, fallback = 0): number {
  const numeric = Number.isFinite(value) ? Number(value) : fallback;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function compactText(value: string | null | undefined, maxLength: number): string | null {
  const compacted = String(value ?? "").trim().replace(/\s+/g, " ");
  return compacted ? compacted.slice(0, maxLength) : null;
}

function normalizeRecord(record: CnesOfficialProfessionalRecord): NormalizedCnesRecord | null {
  const displayName = compactText(record.displayName, 220);
  const state = compactText(record.state, 2)?.toUpperCase();
  const city = compactText(record.city, 120);
  const cnesCode = compactText(record.cnesCode, 32);
  const externalId = compactText(record.externalId, 160);
  if (!displayName || !state || !city || !cnesCode || !externalId) return null;
  const cboCode = compactText(record.cboCode, 80);
  const primarySpecialty = compactText(record.primarySpecialty, 180) ?? (cboCode ? `Médico(a) — CBO ${cboCode}` : "Médico(a) cadastrado(a) no CNES");
  return {
    ...record,
    displayName,
    normalizedName: normalizeDirectoryName(displayName),
    state,
    city,
    cnesCode,
    externalId,
    cboCode,
    primarySpecialty,
    municipalityCode: compactText(record.municipalityCode, 7),
    councilType: record.councilType === "crm" || record.councilType === "other" ? record.councilType : "not_applicable",
    councilNumber: compactText(record.councilNumber, 80),
    councilState: compactText(record.councilState, 2)?.toUpperCase() ?? state,
    licenseStatus: compactText(record.licenseStatus, 120),
    sourcePath: compactText(record.sourcePath, 512),
    sourceUrl: compactText(record.sourceUrl, 1024),
  };
}

function buildProviderValues(record: NormalizedCnesRecord): InsertHealthProvider {
  const hasRegistry = Boolean(record.councilNumber);
  return {
    entityType: "professional",
    displayName: record.displayName,
    legalName: null,
    normalizedName: record.normalizedName,
    professionalType: "physician",
    primarySpecialty: record.primarySpecialty,
    documentType: "not_collected",
    documentMasked: null,
    councilType: hasRegistry ? record.councilType ?? "crm" : "not_applicable",
    councilNumber: record.councilNumber ?? null,
    councilState: hasRegistry ? record.councilState ?? record.state : null,
    licenseStatus: record.licenseStatus ?? "CNES ativo na competência informada",
    cnesCode: record.cnesCode,
    establishmentType: null,
    bio: null,
    publicSummary: `Profissional médico(a) identificado(a) em base pública CNES/DATASUS na competência ${record.competence}. Dados exibidos para descoberta informativa e sujeitos à confirmação na fonte oficial.`,
    city: record.city,
    state: record.state,
    municipalityCode: record.municipalityCode ?? null,
    neighborhood: null,
    addressLine: null,
    postalCode: null,
    lat: null,
    lng: null,
    phone: null,
    email: null,
    whatsapp: null,
    website: null,
    modality: "presential",
    sourceConfidenceScore: 82,
    qualityScore: clampScore(60 + (hasRegistry ? 10 : 0) + (record.cboCode ? 10 : 0), 70),
    verificationStatus: "source_verified",
    status: "pending_review",
    active: 1,
    verified: 0,
    lastSeenAt: new Date(),
  };
}

async function findExistingProvider(db: Awaited<ReturnType<typeof requireDatabase>>, record: NormalizedCnesRecord) {
  const bySource = await db
    .select({ providerId: healthProviderSources.providerId })
    .from(healthProviderSources)
    .where(and(eq(healthProviderSources.sourceKey, CNES_OFFICIAL_SOURCE_KEY), eq(healthProviderSources.externalId, record.externalId)))
    .limit(1);

  if (bySource[0]?.providerId) {
    const rows = await db.select().from(healthProviders).where(eq(healthProviders.id, bySource[0].providerId)).limit(1);
    if (rows[0]) return rows[0];
  }

  const rows = await db
    .select()
    .from(healthProviders)
    .where(
      and(
        eq(healthProviders.normalizedName, record.normalizedName),
        eq(healthProviders.state, record.state),
        eq(healthProviders.city, record.city),
        eq(healthProviders.cnesCode, record.cnesCode),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

async function upsertSource(db: Awaited<ReturnType<typeof requireDatabase>>, providerId: number, record: NormalizedCnesRecord, fieldCoverage: string) {
  const values: InsertHealthProviderSource = {
    providerId,
    sourceKey: CNES_OFFICIAL_SOURCE_KEY,
    sourceName: CNES_OFFICIAL_SOURCE_NAME,
    sourceKind: "official_public",
    externalId: record.externalId,
    sourceUrl: record.sourceUrl ?? null,
    reliability: "primary",
    fieldCoverage,
    confidenceScore: 82,
    lastSeenAt: new Date(),
  };
  const existing = await db
    .select()
    .from(healthProviderSources)
    .where(and(eq(healthProviderSources.sourceKey, CNES_OFFICIAL_SOURCE_KEY), eq(healthProviderSources.externalId, record.externalId)))
    .limit(1);
  if (existing[0]) {
    await db.update(healthProviderSources).set(values).where(eq(healthProviderSources.id, existing[0].id));
    return existing[0].id;
  }
  const inserted = await db.insert(healthProviderSources).values(values);
  return extractInsertId(inserted);
}

async function upsertSpecialty(db: Awaited<ReturnType<typeof requireDatabase>>, providerId: number, record: NormalizedCnesRecord) {
  const values: InsertHealthProviderSpecialty = {
    providerId,
    specialtyName: record.primarySpecialty,
    specialtyCode: record.cboCode ?? null,
    taxonomySystem: "CBO/CNES",
    isPrimary: 1,
    sourceName: CNES_OFFICIAL_SOURCE_NAME,
    confidenceScore: record.cboCode ? 80 : 65,
  };
  await db.insert(healthProviderSpecialties).values(values).onDuplicateKeyUpdate({
    set: {
      specialtyCode: sql`values(specialtyCode)`,
      isPrimary: 1,
      sourceName: CNES_OFFICIAL_SOURCE_NAME,
      confidenceScore: sql`values(confidenceScore)`,
    },
  });
}

async function insertEvidence(db: Awaited<ReturnType<typeof requireDatabase>>, providerId: number, providerSourceId: number, ingestionJobId: number, record: NormalizedCnesRecord) {
  const redactedRawPayload = {
    displayName: record.displayName,
    state: record.state,
    city: record.city,
    municipalityCode: record.municipalityCode ?? null,
    cnesCode: record.cnesCode,
    cboCode: record.cboCode ?? null,
    councilType: record.councilType ?? null,
    councilNumber: record.councilNumber ? "present" : null,
    competence: record.competence,
    sourcePath: record.sourcePath ?? null,
  };
  const evidences: InsertHealthProviderEvidence[] = [
    {
      providerId,
      providerSourceId,
      ingestionJobId,
      evidenceKind: "identity",
      fieldName: "displayName",
      fieldValueSnapshot: record.displayName,
      rawPayloadSnapshot: JSON.stringify(redactedRawPayload),
      sourceUrl: record.sourceUrl ?? null,
      confidenceScore: 82,
      isCurrent: 1,
      observedAt: new Date(),
    },
    {
      providerId,
      providerSourceId,
      ingestionJobId,
      evidenceKind: "facility",
      fieldName: "cnesCode",
      fieldValueSnapshot: record.cnesCode,
      rawPayloadSnapshot: JSON.stringify({ competence: record.competence, sourcePath: record.sourcePath ?? null }),
      sourceUrl: record.sourceUrl ?? null,
      confidenceScore: 82,
      isCurrent: 1,
      observedAt: new Date(),
    },
  ];
  if (record.cboCode) {
    evidences.push({
      providerId,
      providerSourceId,
      ingestionJobId,
      evidenceKind: "specialty",
      fieldName: "cboCode",
      fieldValueSnapshot: record.cboCode,
      rawPayloadSnapshot: JSON.stringify({ specialty: record.primarySpecialty, competence: record.competence }),
      sourceUrl: record.sourceUrl ?? null,
      confidenceScore: 80,
      isCurrent: 1,
      observedAt: new Date(),
    });
  }
  await db.insert(healthProviderEvidences).values(evidences);
}

async function updateCoverageRows(db: Awaited<ReturnType<typeof requireDatabase>>, jobId: number, records: NormalizedCnesRecord[]) {
  const grouped = records.reduce<Record<string, { state: string; city: string; municipalityCode: string | null; count: number }>>((acc, record) => {
    const key = `${record.state}|${record.city}`;
    acc[key] ??= { state: record.state, city: record.city, municipalityCode: record.municipalityCode ?? null, count: 0 };
    acc[key].count += 1;
    return acc;
  }, {});

  for (const row of Object.values(grouped)) {
    await db.insert(healthDirectoryCoverage).values({
      sourceKey: CNES_OFFICIAL_SOURCE_KEY,
      sourceName: CNES_OFFICIAL_SOURCE_NAME,
      state: row.state,
      city: row.city,
      municipalityCode: row.municipalityCode,
      providerCount: row.count,
      professionalCount: row.count,
      facilityCount: 0,
      coverageScore: Math.min(100, Math.max(30, Math.round(row.count / 2))),
      dataFreshnessDays: 0,
      lastIngestionJobId: jobId,
      status: "completed",
    }).onDuplicateKeyUpdate({
      set: {
        providerCount: sql`values(providerCount)`,
        professionalCount: sql`values(professionalCount)`,
        facilityCount: 0,
        coverageScore: sql`values(coverageScore)`,
        dataFreshnessDays: 0,
        lastIngestionJobId: jobId,
        status: "completed",
      },
    });
  }
}

export async function ingestCnesOfficialProfessionals(input: IngestCnesOfficialProfessionalsInput) {
  const requestedLimit = Math.max(1, Math.min(input.limit ?? input.records.length, 2_000));
  const normalized = input.records.slice(0, requestedLimit).map(normalizeRecord).filter((record): record is NormalizedCnesRecord => Boolean(record));
  const counters: IngestionCounters = {
    recordsSeen: input.records.length,
    recordsProcessed: 0,
    recordsCreated: 0,
    recordsUpdated: 0,
    recordsSkipped: input.records.length - normalized.length,
    errorCount: 0,
  };

  const uniqueByExternalId = new Map<string, NormalizedCnesRecord>();
  for (const record of normalized) {
    if (!uniqueByExternalId.has(record.externalId)) uniqueByExternalId.set(record.externalId, record);
  }
  const records = Array.from(uniqueByExternalId.values());
  counters.recordsSkipped += normalized.length - records.length;

  if (input.dryRun ?? true) {
    return {
      dryRun: true,
      job: null,
      counters: { ...counters, recordsProcessed: records.length },
      sample: records.slice(0, 10),
      source: { sourceKey: CNES_OFFICIAL_SOURCE_KEY, sourceName: CNES_OFFICIAL_SOURCE_NAME },
    };
  }

  const db = await requireDatabase();
  const job = await createHealthDirectoryIngestionJob({
    sourceKey: CNES_OFFICIAL_SOURCE_KEY,
    sourceName: CNES_OFFICIAL_SOURCE_NAME,
    sourceKind: "official_public",
    status: "running",
    requestedByUserId: input.requestedByUserId ?? null,
    scopeState: input.state ?? records[0]?.state ?? null,
    scopeCity: input.city ?? null,
    recordsSeen: input.records.length,
    startedAt: new Date(),
    metricsSnapshot: JSON.stringify({ mode: "cnes_official_pf", dryRun: false, competence: input.competence ?? records[0]?.competence ?? null }),
  });

  const errors: string[] = [];
  for (const record of records) {
    try {
      const existing = await findExistingProvider(db, record);
      const providerValues = buildProviderValues(record);
      let providerId = existing?.id;
      if (providerId) {
        await db.update(healthProviders).set(providerValues).where(eq(healthProviders.id, providerId));
        counters.recordsUpdated += 1;
      } else {
        const result = await db.insert(healthProviders).values(providerValues);
        providerId = extractInsertId(result);
        counters.recordsCreated += 1;
      }
      const fieldCoverage = JSON.stringify(["displayName", "state", "city", "municipalityCode", "cnesCode", "cboCode", "councilRegistry", "competence"]);
      const sourceId = await upsertSource(db, providerId, record, fieldCoverage);
      await upsertSpecialty(db, providerId, record);
      await insertEvidence(db, providerId, sourceId, job.id, record);
      counters.recordsProcessed += 1;
    } catch (error) {
      counters.errorCount += 1;
      errors.push(`${record.externalId}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  await updateCoverageRows(db, job.id, records);
  const finalStatus = counters.errorCount > 0 ? "completed_with_errors" : "completed";
  const completedAt = new Date();
  const finalMetricsSnapshot = JSON.stringify({
    mode: "cnes_official_pf",
    competence: input.competence ?? records[0]?.competence ?? null,
    uniqueRecords: records.length,
    skippedBeforeDb: counters.recordsSkipped,
    errors: errors.slice(0, 12),
  });
  await db.update(dataIngestionJobs).set({
    status: finalStatus,
    recordsSeen: counters.recordsSeen,
    recordsProcessed: counters.recordsProcessed,
    recordsCreated: counters.recordsCreated,
    recordsUpdated: counters.recordsUpdated,
    recordsSkipped: counters.recordsSkipped,
    errorCount: counters.errorCount,
    errorSummary: errors.slice(0, 12).join("\n") || null,
    completedAt,
    metricsSnapshot: finalMetricsSnapshot,
  }).where(eq(dataIngestionJobs.id, job.id));

  return {
    dryRun: false,
    job: {
      ...job,
      status: finalStatus,
      recordsSeen: counters.recordsSeen,
      recordsProcessed: counters.recordsProcessed,
      recordsCreated: counters.recordsCreated,
      recordsUpdated: counters.recordsUpdated,
      recordsSkipped: counters.recordsSkipped,
      errorCount: counters.errorCount,
      errorSummary: errors.slice(0, 12).join("\n") || null,
      completedAt,
      metricsSnapshot: finalMetricsSnapshot,
    },
    counters,
    sample: await listNationalHealthProviders({ state: input.state ?? records[0]?.state, activeOnly: false, limit: 10 }),
    source: { sourceKey: CNES_OFFICIAL_SOURCE_KEY, sourceName: CNES_OFFICIAL_SOURCE_NAME },
  };
}

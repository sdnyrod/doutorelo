import { decimal, index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const patientSexValues = ["female", "male", "intersex", "not_informed"] as const;
export const memoryEventTypeValues = ["symptom", "exam", "appointment", "medication", "habit", "note", "ai_clarity_map"] as const;
export const memoryEventSeverityValues = ["low", "medium", "attention", "urgent"] as const;
export const memorySourceValues = ["patient", "ai", "doctor", "document", "system", "apple_health", "apple_watch", "health_connect", "android_device", "wearable", "calendar", "partner_api"] as const;
export const clarityStatusValues = ["draft", "ready_for_review", "shared_with_doctor", "archived"] as const;
export const appointmentStatusValues = ["planned", "requested", "confirmed", "completed", "cancelled"] as const;
export const consentPurposeValues = ["privacy", "health_data", "ai_guidance", "notifications", "medical_sharing", "device_sync", "calendar_sync", "professional_share", "research_opt_in"] as const;
export const consentStatusValues = ["accepted", "revoked"] as const;
export const marketplaceItemKindValues = ["product", "service"] as const;
export const marketplacePublicationStatusValues = ["draft", "published", "inactive"] as const;
export const marketplaceEligibilityValues = ["general", "requires_profile", "requires_professional_context", "restricted"] as const;
export const marketplaceInventoryPolicyValues = ["track_stock", "unlimited", "service_capacity"] as const;
export const marketplaceCartStatusValues = ["active", "converted", "abandoned"] as const;
export const marketplaceOrderStatusValues = ["draft", "pending_review", "simulated_checkout", "confirmed", "cancelled"] as const;
export const marketplaceRecommendationSourceValues = ["profile", "memory", "appointment", "manual", "ai"] as const;
export const integrationProviderValues = ["apple_health", "apple_watch", "health_connect", "android_wearable", "google_fit", "manual_entry", "document_upload", "google_calendar", "apple_calendar", "outlook_calendar", "partner_api"] as const;
export const integrationConnectionStatusValues = ["not_connected", "pending_consent", "connected", "paused", "revoked", "error"] as const;
export const healthMetricKindValues = ["steps", "heart_rate", "resting_heart_rate", "heart_rate_variability", "sleep_duration", "sleep_quality", "blood_oxygen", "respiratory_rate", "body_temperature", "weight", "blood_pressure_systolic", "blood_pressure_diastolic", "glucose", "menstrual_cycle", "mindfulness_minutes", "workout_minutes", "symptom_score", "energy_score", "mood_score", "custom"] as const;
export const carePlanDomainValues = ["prevention", "symptoms", "medication", "supplement", "nutrition", "movement", "sleep", "mental_health", "exam_follow_up", "appointment_preparation", "device_monitoring", "education", "other"] as const;
export const carePlanItemStatusValues = ["planned", "active", "paused", "completed", "cancelled", "needs_review"] as const;
export const calendarProviderValues = ["google_calendar", "apple_calendar", "outlook_calendar", "manual"] as const;
export const calendarSyncStatusValues = ["not_synced", "queued", "synced", "conflict", "failed", "revoked"] as const;
export const careJourneyStatusValues = ["intake", "active", "waiting_human", "closed", "archived"] as const;
export const aiModelProviderValues = ["built_in_llm", "openai", "anthropic", "deterministic_fallback"] as const;
export const aiModelCapabilityValues = ["clinical_triage", "care_journey_response", "safety_guardrail", "memory_summary"] as const;
export const aiExecutionStatusValues = ["success", "guardrail_blocked", "fallback", "error"] as const;
export const careJourneyFeedbackRatingValues = ["helpful", "unclear", "needs_human"] as const;
export const mlLearningEventSourceValues = ["care_journey", "home_chat", "clinical", "admin_review", "scheduled_evaluation", "system"] as const;
export const mlQualityLabelValues = ["excellent", "good", "generic", "unsafe", "too_long", "not_useful", "needs_human_review", "unknown"] as const;
export const mlHumanLabelValues = ["excellent", "good", "bad", "generic", "unsafe", "too_long", "not_useful", "training_candidate", "rejected"] as const;
export const mlTrainingExampleStatusValues = ["draft", "review_ready", "approved", "promoted", "rejected", "archived"] as const;
export const mlImprovementCycleStatusValues = ["open", "reviewing", "promoting", "completed", "cancelled"] as const;
export const mlPromptVersionStatusValues = ["draft", "active", "deprecated", "archived"] as const;
export const dayanTranscriptionStatusValues = ["pending", "processing", "completed", "failed", "excluded"] as const;
export const dayanAntiHallucinationStatusValues = ["grounded", "low_evidence", "blocked", "fallback"] as const;
export const dayanNetworkProfessionalModalityValues = ["presential", "online", "both"] as const;
export const healthProviderEntityTypeValues = ["professional", "clinic", "hospital", "laboratory", "pharmacy", "health_facility", "other"] as const;
export const healthProviderCouncilValues = ["crm", "cro", "crn", "crefito", "crp", "coren", "crf", "crfa", "cress", "other", "not_applicable"] as const;
export const healthProviderDocumentTypeValues = ["cpf_masked", "cnpj_masked", "public_registry", "not_collected"] as const;
export const healthProviderStatusValues = ["active", "inactive", "pending_review", "archived"] as const;
export const healthProviderVerificationStatusValues = ["unverified", "source_verified", "manually_verified", "conflict", "rejected"] as const;
export const healthDirectorySourceKindValues = ["official_public", "public_registry", "commercial", "manual", "partner", "social_opt_in", "other"] as const;
export const healthDirectoryReliabilityValues = ["primary", "secondary", "enrichment", "unverified"] as const;
export const healthProviderEvidenceKindValues = ["identity", "license", "address", "contact", "specialty", "facility", "geolocation", "coverage", "other"] as const;
export const dataIngestionJobStatusValues = ["queued", "running", "completed", "completed_with_errors", "failed", "cancelled"] as const;

export const patientHealthProfiles = mysqlTable(
  "patientHealthProfiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    preferredName: varchar("preferredName", { length: 120 }),
    birthYear: int("birthYear"),
    biologicalSex: mysqlEnum("biologicalSex", patientSexValues).default("not_informed"),
    mainGoal: varchar("mainGoal", { length: 180 }),
    knownConditions: text("knownConditions"),
    medications: text("medications"),
    allergies: text("allergies"),
    lifestyleNotes: text("lifestyleNotes"),
    emotionalContext: text("emotionalContext"),
    emergencyNotes: text("emergencyNotes"),
    completenessScore: int("completenessScore").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdx: uniqueIndex("patientHealthProfiles_userId_unique").on(table.userId),
  }),
);

export const healthConversations = mysqlTable(
  "healthConversations",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    channel: varchar("channel", { length: 80 }).default("onboarding_memory").notNull(),
    initialConcern: text("initialConcern"),
    latestSummary: text("latestSummary"),
    safetySnapshot: text("safetySnapshot"),
    lastMessageAt: timestamp("lastMessageAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdx: index("healthConversations_userId_idx").on(table.userId),
  }),
);

export const clinicalMemoryEvents = mysqlTable(
  "clinicalMemoryEvents",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    conversationId: int("conversationId").references(() => healthConversations.id),
    eventType: mysqlEnum("eventType", memoryEventTypeValues).default("note").notNull(),
    source: mysqlEnum("source", memorySourceValues).default("patient").notNull(),
    severity: mysqlEnum("severity", memoryEventSeverityValues).default("low").notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    summary: text("summary"),
    metadata: text("metadata"),
    occurredAt: timestamp("occurredAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userOccurredIdx: index("clinicalMemoryEvents_userId_occurredAt_idx").on(table.userId, table.occurredAt),
  }),
);

export const clarityMaps = mysqlTable(
  "clarityMaps",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    conversationId: int("conversationId").references(() => healthConversations.id),
    status: mysqlEnum("status", clarityStatusValues).default("ready_for_review").notNull(),
    mainConcern: varchar("mainConcern", { length: 240 }).notNull(),
    symptoms: text("symptoms"),
    patterns: text("patterns"),
    questionsForDoctor: text("questionsForDoctor"),
    suggestedSpecialty: varchar("suggestedSpecialty", { length: 140 }),
    nextStep: text("nextStep"),
    safetyFlags: text("safetyFlags"),
    confidence: varchar("confidence", { length: 40 }).default("medium").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdx: index("clarityMaps_userId_idx").on(table.userId),
  }),
);

export const healthDocuments = mysqlTable(
  "healthDocuments",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    documentType: varchar("documentType", { length: 80 }).default("exam").notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    fileKey: varchar("fileKey", { length: 512 }),
    fileUrl: varchar("fileUrl", { length: 1024 }),
    notes: text("notes"),
    documentDate: timestamp("documentDate"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdx: index("healthDocuments_userId_idx").on(table.userId),
  }),
);

export const careAppointments = mysqlTable(
  "careAppointments",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    clarityMapId: int("clarityMapId").references(() => clarityMaps.id),
    doctorName: varchar("doctorName", { length: 180 }),
    specialty: varchar("specialty", { length: 140 }),
    status: mysqlEnum("status", appointmentStatusValues).default("planned").notNull(),
    reason: text("reason"),
    scheduledAt: timestamp("scheduledAt"),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdx: index("careAppointments_userId_idx").on(table.userId),
  }),
);

export const dayanNetworkProfessionals = mysqlTable(
  "dayanNetworkProfessionals",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 180 }).notNull(),
    specialty: varchar("specialty", { length: 160 }).notNull(),
    professionalType: varchar("professionalType", { length: 80 }).default("doctor").notNull(),
    bio: text("bio"),
    city: varchar("city", { length: 120 }).notNull(),
    state: varchar("state", { length: 2 }).notNull(),
    addressLine: varchar("addressLine", { length: 240 }).notNull(),
    lat: decimal("lat", { precision: 10, scale: 7 }).notNull(),
    lng: decimal("lng", { precision: 10, scale: 7 }).notNull(),
    phone: varchar("phone", { length: 40 }),
    email: varchar("email", { length: 320 }),
    whatsapp: varchar("whatsapp", { length: 40 }),
    modality: mysqlEnum("modality", dayanNetworkProfessionalModalityValues).default("both").notNull(),
    active: int("active").default(1).notNull(),
    photoUrl: varchar("photoUrl", { length: 1024 }),
    crm: varchar("crm", { length: 40 }),
    crn: varchar("crn", { length: 40 }),
    crf: varchar("crf", { length: 40 }),
    associatedSince: timestamp("associatedSince").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    cityStateIdx: index("dayanNetworkProfessionals_city_state_idx").on(table.city, table.state),
    specialtyIdx: index("dayanNetworkProfessionals_specialty_idx").on(table.specialty),
    activeIdx: index("dayanNetworkProfessionals_active_idx").on(table.active),
  }),
);

export const healthProviders = mysqlTable(
  "healthProviders",
  {
    id: int("id").autoincrement().primaryKey(),
    entityType: mysqlEnum("entityType", healthProviderEntityTypeValues).default("professional").notNull(),
    displayName: varchar("displayName", { length: 220 }).notNull(),
    legalName: varchar("legalName", { length: 220 }),
    normalizedName: varchar("normalizedName", { length: 220 }).notNull(),
    professionalType: varchar("professionalType", { length: 120 }).default("health_professional").notNull(),
    primarySpecialty: varchar("primarySpecialty", { length: 180 }),
    documentType: mysqlEnum("documentType", healthProviderDocumentTypeValues).default("not_collected").notNull(),
    documentMasked: varchar("documentMasked", { length: 80 }),
    councilType: mysqlEnum("councilType", healthProviderCouncilValues).default("not_applicable").notNull(),
    councilNumber: varchar("councilNumber", { length: 80 }),
    councilState: varchar("councilState", { length: 2 }),
    licenseStatus: varchar("licenseStatus", { length: 120 }),
    cnesCode: varchar("cnesCode", { length: 32 }),
    establishmentType: varchar("establishmentType", { length: 160 }),
    bio: text("bio"),
    publicSummary: text("publicSummary"),
    city: varchar("city", { length: 120 }).notNull(),
    state: varchar("state", { length: 2 }).notNull(),
    municipalityCode: varchar("municipalityCode", { length: 7 }),
    neighborhood: varchar("neighborhood", { length: 160 }),
    addressLine: varchar("addressLine", { length: 260 }),
    postalCode: varchar("postalCode", { length: 16 }),
    lat: decimal("lat", { precision: 10, scale: 7 }),
    lng: decimal("lng", { precision: 10, scale: 7 }),
    phone: varchar("phone", { length: 40 }),
    email: varchar("email", { length: 320 }),
    whatsapp: varchar("whatsapp", { length: 40 }),
    website: varchar("website", { length: 1024 }),
    modality: mysqlEnum("modality", dayanNetworkProfessionalModalityValues).default("both").notNull(),
    sourceConfidenceScore: int("sourceConfidenceScore").default(0).notNull(),
    qualityScore: int("qualityScore").default(0).notNull(),
    verificationStatus: mysqlEnum("verificationStatus", healthProviderVerificationStatusValues).default("unverified").notNull(),
    status: mysqlEnum("status", healthProviderStatusValues).default("pending_review").notNull(),
    active: int("active").default(1).notNull(),
    verified: int("verified").default(0).notNull(),
    lastSeenAt: timestamp("lastSeenAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    cityStateIdx: index("hp_city_state_idx").on(table.city, table.state),
    stateSpecialtyIdx: index("hp_state_specialty_idx").on(table.state, table.primarySpecialty),
    entityStatusIdx: index("hp_entity_status_idx").on(table.entityType, table.status),
    verificationIdx: index("hp_verification_idx").on(table.verificationStatus),
    councilIdx: index("hp_council_idx").on(table.councilType, table.councilNumber, table.councilState),
    cnesIdx: index("hp_cnes_idx").on(table.cnesCode),
  }),
);

export const healthProviderSpecialties = mysqlTable(
  "healthProviderSpecialties",
  {
    id: int("id").autoincrement().primaryKey(),
    providerId: int("providerId").notNull().references(() => healthProviders.id),
    specialtyName: varchar("specialtyName", { length: 180 }).notNull(),
    specialtyCode: varchar("specialtyCode", { length: 80 }),
    taxonomySystem: varchar("taxonomySystem", { length: 80 }).default("manual").notNull(),
    isPrimary: int("isPrimary").default(0).notNull(),
    sourceName: varchar("sourceName", { length: 160 }),
    confidenceScore: int("confidenceScore").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    providerIdx: index("hps_provider_idx").on(table.providerId),
    specialtyIdx: index("hps_specialty_idx").on(table.specialtyName),
    providerSpecialtyUnique: uniqueIndex("hps_provider_specialty_unique").on(table.providerId, table.specialtyName, table.taxonomySystem),
  }),
);

export const healthProviderSources = mysqlTable(
  "healthProviderSources",
  {
    id: int("id").autoincrement().primaryKey(),
    providerId: int("providerId").notNull().references(() => healthProviders.id),
    sourceKey: varchar("sourceKey", { length: 120 }).notNull(),
    sourceName: varchar("sourceName", { length: 180 }).notNull(),
    sourceKind: mysqlEnum("sourceKind", healthDirectorySourceKindValues).default("official_public").notNull(),
    externalId: varchar("externalId", { length: 160 }),
    sourceUrl: varchar("sourceUrl", { length: 1024 }),
    reliability: mysqlEnum("reliability", healthDirectoryReliabilityValues).default("secondary").notNull(),
    fieldCoverage: text("fieldCoverage"),
    confidenceScore: int("confidenceScore").default(0).notNull(),
    firstSeenAt: timestamp("firstSeenAt").defaultNow().notNull(),
    lastSeenAt: timestamp("lastSeenAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    providerIdx: index("hpsrc_provider_idx").on(table.providerId),
    sourceExternalIdx: index("hpsrc_source_external_idx").on(table.sourceKey, table.externalId),
    kindReliabilityIdx: index("hpsrc_kind_reliability_idx").on(table.sourceKind, table.reliability),
  }),
);

export const dataIngestionJobs = mysqlTable(
  "dataIngestionJobs",
  {
    id: int("id").autoincrement().primaryKey(),
    sourceKey: varchar("sourceKey", { length: 120 }).notNull(),
    sourceName: varchar("sourceName", { length: 180 }).notNull(),
    sourceKind: mysqlEnum("sourceKind", healthDirectorySourceKindValues).default("official_public").notNull(),
    status: mysqlEnum("status", dataIngestionJobStatusValues).default("queued").notNull(),
    requestedByUserId: int("requestedByUserId").references(() => users.id),
    scopeCountry: varchar("scopeCountry", { length: 2 }).default("BR").notNull(),
    scopeState: varchar("scopeState", { length: 2 }),
    scopeCity: varchar("scopeCity", { length: 120 }),
    inputStorageKey: varchar("inputStorageKey", { length: 512 }),
    outputStorageKey: varchar("outputStorageKey", { length: 512 }),
    recordsSeen: int("recordsSeen").default(0).notNull(),
    recordsProcessed: int("recordsProcessed").default(0).notNull(),
    recordsCreated: int("recordsCreated").default(0).notNull(),
    recordsUpdated: int("recordsUpdated").default(0).notNull(),
    recordsSkipped: int("recordsSkipped").default(0).notNull(),
    errorCount: int("errorCount").default(0).notNull(),
    errorSummary: text("errorSummary"),
    metricsSnapshot: text("metricsSnapshot"),
    startedAt: timestamp("startedAt"),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    sourceStatusIdx: index("dij_source_status_idx").on(table.sourceKey, table.status),
    scopeIdx: index("dij_scope_idx").on(table.scopeCountry, table.scopeState, table.scopeCity),
    createdIdx: index("dij_created_idx").on(table.createdAt),
  }),
);

export const healthProviderEvidences = mysqlTable(
  "healthProviderEvidences",
  {
    id: int("id").autoincrement().primaryKey(),
    providerId: int("providerId").notNull().references(() => healthProviders.id),
    providerSourceId: int("providerSourceId").references(() => healthProviderSources.id),
    ingestionJobId: int("ingestionJobId").references(() => dataIngestionJobs.id),
    evidenceKind: mysqlEnum("evidenceKind", healthProviderEvidenceKindValues).default("other").notNull(),
    fieldName: varchar("fieldName", { length: 120 }).notNull(),
    fieldValueSnapshot: text("fieldValueSnapshot"),
    rawPayloadSnapshot: text("rawPayloadSnapshot"),
    sourceUrl: varchar("sourceUrl", { length: 1024 }),
    confidenceScore: int("confidenceScore").default(0).notNull(),
    isCurrent: int("isCurrent").default(1).notNull(),
    observedAt: timestamp("observedAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    providerFieldIdx: index("hpe_provider_field_idx").on(table.providerId, table.fieldName),
    sourceIdx: index("hpe_source_idx").on(table.providerSourceId),
    jobIdx: index("hpe_job_idx").on(table.ingestionJobId),
    evidenceKindIdx: index("hpe_kind_idx").on(table.evidenceKind),
  }),
);

export const healthProviderAffiliations = mysqlTable(
  "healthProviderAffiliations",
  {
    id: int("id").autoincrement().primaryKey(),
    professionalProviderId: int("professionalProviderId").notNull().references(() => healthProviders.id),
    facilityProviderId: int("facilityProviderId").notNull().references(() => healthProviders.id),
    relationshipType: varchar("relationshipType", { length: 120 }).default("attends_at").notNull(),
    sourceName: varchar("sourceName", { length: 180 }),
    sourceExternalId: varchar("sourceExternalId", { length: 160 }),
    active: int("active").default(1).notNull(),
    startedAt: timestamp("startedAt"),
    endedAt: timestamp("endedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    professionalIdx: index("hpa_professional_idx").on(table.professionalProviderId),
    facilityIdx: index("hpa_facility_idx").on(table.facilityProviderId),
    linkUnique: uniqueIndex("hpa_link_unique").on(table.professionalProviderId, table.facilityProviderId, table.relationshipType),
  }),
);

export const healthDirectoryCoverage = mysqlTable(
  "healthDirectoryCoverage",
  {
    id: int("id").autoincrement().primaryKey(),
    sourceKey: varchar("sourceKey", { length: 120 }).notNull(),
    sourceName: varchar("sourceName", { length: 180 }).notNull(),
    state: varchar("state", { length: 2 }).notNull(),
    city: varchar("city", { length: 120 }).notNull(),
    municipalityCode: varchar("municipalityCode", { length: 7 }),
    providerCount: int("providerCount").default(0).notNull(),
    professionalCount: int("professionalCount").default(0).notNull(),
    facilityCount: int("facilityCount").default(0).notNull(),
    coverageScore: int("coverageScore").default(0).notNull(),
    dataFreshnessDays: int("dataFreshnessDays").default(0).notNull(),
    lastIngestionJobId: int("lastIngestionJobId").references(() => dataIngestionJobs.id),
    status: mysqlEnum("status", dataIngestionJobStatusValues).default("queued").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    sourceMunicipalityUnique: uniqueIndex("hdc_source_municipality_unique").on(table.sourceKey, table.state, table.city),
    stateCityIdx: index("hdc_state_city_idx").on(table.state, table.city),
    jobIdx: index("hdc_job_idx").on(table.lastIngestionJobId),
  }),
);

export const healthIndicators = mysqlTable(
  "healthIndicators",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    kind: varchar("kind", { length: 80 }).notNull(),
    label: varchar("label", { length: 160 }).notNull(),
    value: varchar("value", { length: 80 }).notNull(),
    unit: varchar("unit", { length: 40 }),
    source: mysqlEnum("source", memorySourceValues).default("patient").notNull(),
    note: text("note"),
    measuredAt: timestamp("measuredAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userMeasuredIdx: index("healthIndicators_userId_measuredAt_idx").on(table.userId, table.measuredAt),
  }),
);

export const healthConsents = mysqlTable(
  "healthConsents",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    purpose: mysqlEnum("purpose", consentPurposeValues).notNull(),
    status: mysqlEnum("status", consentStatusValues).default("accepted").notNull(),
    policyVersion: varchar("policyVersion", { length: 80 }).default("doutorelo-lgpd-v1").notNull(),
    metadata: text("metadata"),
    acceptedAt: timestamp("acceptedAt").defaultNow().notNull(),
    revokedAt: timestamp("revokedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userPurposeIdx: index("healthConsents_userId_purpose_idx").on(table.userId, table.purpose),
  }),
);

export const healthDataConnections = mysqlTable(
  "healthDataConnections",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    provider: mysqlEnum("provider", integrationProviderValues).notNull(),
    status: mysqlEnum("status", integrationConnectionStatusValues).default("pending_consent").notNull(),
    displayName: varchar("displayName", { length: 180 }).notNull(),
    deviceModel: varchar("deviceModel", { length: 180 }),
    externalAccountRef: varchar("externalAccountRef", { length: 256 }),
    permissions: text("permissions"),
    consentSnapshot: text("consentSnapshot"),
    syncCursor: text("syncCursor"),
    lastSyncedAt: timestamp("lastSyncedAt"),
    metadata: text("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userProviderIdx: index("healthDataConnections_userId_provider_idx").on(table.userId, table.provider),
  }),
);

export const healthMetricSamples = mysqlTable(
  "healthMetricSamples",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    connectionId: int("connectionId").references(() => healthDataConnections.id),
    kind: mysqlEnum("kind", healthMetricKindValues).notNull(),
    value: varchar("value", { length: 120 }).notNull(),
    unit: varchar("unit", { length: 40 }),
    source: mysqlEnum("source", memorySourceValues).default("patient").notNull(),
    confidence: varchar("confidence", { length: 40 }).default("observed").notNull(),
    startedAt: timestamp("startedAt").notNull(),
    endedAt: timestamp("endedAt"),
    note: text("note"),
    metadata: text("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userKindStartedIdx: index("healthMetricSamples_userId_kind_startedAt_idx").on(table.userId, table.kind, table.startedAt),
  }),
);

export const longitudinalCarePlanItems = mysqlTable(
  "longitudinalCarePlanItems",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    clarityMapId: int("clarityMapId").references(() => clarityMaps.id),
    appointmentId: int("appointmentId").references(() => careAppointments.id),
    domain: mysqlEnum("domain", carePlanDomainValues).default("other").notNull(),
    status: mysqlEnum("status", carePlanItemStatusValues).default("planned").notNull(),
    title: varchar("title", { length: 220 }).notNull(),
    description: text("description"),
    rationale: text("rationale"),
    ownerRole: varchar("ownerRole", { length: 80 }).default("patient").notNull(),
    recurrenceRule: varchar("recurrenceRule", { length: 240 }),
    targetMetricKind: mysqlEnum("targetMetricKind", healthMetricKindValues),
    targetValue: varchar("targetValue", { length: 120 }),
    safetyBoundary: text("safetyBoundary"),
    startsAt: timestamp("startsAt"),
    dueAt: timestamp("dueAt"),
    completedAt: timestamp("completedAt"),
    metadata: text("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userStatusIdx: index("longitudinalCarePlanItems_userId_status_idx").on(table.userId, table.status),
  }),
);

export const externalCalendarConnections = mysqlTable(
  "externalCalendarConnections",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    provider: mysqlEnum("provider", calendarProviderValues).notNull(),
    status: mysqlEnum("status", integrationConnectionStatusValues).default("pending_consent").notNull(),
    displayName: varchar("displayName", { length: 180 }).notNull(),
    externalAccountRef: varchar("externalAccountRef", { length: 256 }),
    defaultCalendarExternalId: varchar("defaultCalendarExternalId", { length: 256 }),
    permissions: text("permissions"),
    consentSnapshot: text("consentSnapshot"),
    lastSyncedAt: timestamp("lastSyncedAt"),
    syncCursor: text("syncCursor"),
    metadata: text("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userProviderIdx: index("externalCalendarConnections_userId_provider_idx").on(table.userId, table.provider),
  }),
);

export const appointmentCalendarSyncs = mysqlTable(
  "appointmentCalendarSyncs",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    appointmentId: int("appointmentId").notNull().references(() => careAppointments.id),
    connectionId: int("connectionId").references(() => externalCalendarConnections.id),
    provider: mysqlEnum("provider", calendarProviderValues).notNull(),
    status: mysqlEnum("status", calendarSyncStatusValues).default("queued").notNull(),
    externalEventId: varchar("externalEventId", { length: 256 }),
    externalEventUrl: varchar("externalEventUrl", { length: 1024 }),
    conflictSnapshot: text("conflictSnapshot"),
    lastSyncedAt: timestamp("lastSyncedAt"),
    metadata: text("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userAppointmentIdx: index("appointmentCalendarSyncs_userId_appointmentId_idx").on(table.userId, table.appointmentId),
  }),
);

export const marketplaceCategories = mysqlTable(
  "marketplaceCategories",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    description: text("description"),
    displayOrder: int("displayOrder").default(0).notNull(),
    active: int("active").default(1).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("marketplaceCategories_slug_unique").on(table.slug),
  }),
);

export const marketplacePartners = mysqlTable(
  "marketplacePartners",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 120 }).notNull(),
    name: varchar("name", { length: 180 }).notNull(),
    partnerType: varchar("partnerType", { length: 80 }).default("curated_partner").notNull(),
    verificationStatus: varchar("verificationStatus", { length: 80 }).default("reviewed_dev").notNull(),
    description: text("description"),
    contactEmail: varchar("contactEmail", { length: 320 }),
    active: int("active").default(1).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("marketplacePartners_slug_unique").on(table.slug),
  }),
);

export const marketplaceItems = mysqlTable(
  "marketplaceItems",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 160 }).notNull(),
    kind: mysqlEnum("kind", marketplaceItemKindValues).default("product").notNull(),
    categoryId: int("categoryId").references(() => marketplaceCategories.id),
    partnerId: int("partnerId").references(() => marketplacePartners.id),
    name: varchar("name", { length: 220 }).notNull(),
    subtitle: varchar("subtitle", { length: 260 }),
    description: text("description"),
    claimReviewNotes: text("claimReviewNotes"),
    commercialNotice: text("commercialNotice"),
    priceCents: int("priceCents").default(0).notNull(),
    currency: varchar("currency", { length: 3 }).default("BRL").notNull(),
    publicationStatus: mysqlEnum("publicationStatus", marketplacePublicationStatusValues).default("draft").notNull(),
    eligibility: mysqlEnum("eligibility", marketplaceEligibilityValues).default("general").notNull(),
    inventoryPolicy: mysqlEnum("inventoryPolicy", marketplaceInventoryPolicyValues).default("track_stock").notNull(),
    tags: text("tags"),
    imageUrl: varchar("imageUrl", { length: 1024 }),
    requiresConsent: int("requiresConsent").default(1).notNull(),
    featured: int("featured").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("marketplaceItems_slug_unique").on(table.slug),
    categoryStatusIdx: index("marketplaceItems_category_status_idx").on(table.categoryId, table.publicationStatus),
    partnerIdx: index("marketplaceItems_partner_idx").on(table.partnerId),
  }),
);

export const marketplaceInventory = mysqlTable(
  "marketplaceInventory",
  {
    id: int("id").autoincrement().primaryKey(),
    itemId: int("itemId").notNull().references(() => marketplaceItems.id),
    stockOnHand: int("stockOnHand").default(0).notNull(),
    reservedStock: int("reservedStock").default(0).notNull(),
    lowStockThreshold: int("lowStockThreshold").default(3).notNull(),
    restockNote: text("restockNote"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    itemIdx: uniqueIndex("marketplaceInventory_itemId_unique").on(table.itemId),
  }),
);

export const marketplaceCarts = mysqlTable(
  "marketplaceCarts",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    status: mysqlEnum("status", marketplaceCartStatusValues).default("active").notNull(),
    activeCartKey: varchar("activeCartKey", { length: 80 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userStatusIdx: index("marketplaceCarts_userId_status_idx").on(table.userId, table.status),
    activeCartKeyIdx: uniqueIndex("marketplaceCarts_activeCartKey_unique").on(table.activeCartKey),
  }),
);

export const marketplaceCartItems = mysqlTable(
  "marketplaceCartItems",
  {
    id: int("id").autoincrement().primaryKey(),
    cartId: int("cartId").notNull().references(() => marketplaceCarts.id),
    itemId: int("itemId").notNull().references(() => marketplaceItems.id),
    quantity: int("quantity").default(1).notNull(),
    unitPriceCents: int("unitPriceCents").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    cartItemIdx: uniqueIndex("marketplaceCartItems_cartId_itemId_unique").on(table.cartId, table.itemId),
    itemIdx: index("marketplaceCartItems_itemId_idx").on(table.itemId),
  }),
);

export const marketplaceOrders = mysqlTable(
  "marketplaceOrders",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    cartId: int("cartId").references(() => marketplaceCarts.id),
    status: mysqlEnum("status", marketplaceOrderStatusValues).default("draft").notNull(),
    subtotalCents: int("subtotalCents").default(0).notNull(),
    currency: varchar("currency", { length: 3 }).default("BRL").notNull(),
    checkoutMode: varchar("checkoutMode", { length: 80 }).default("dev_simulated").notNull(),
    idempotencyKey: varchar("idempotencyKey", { length: 128 }),
    patientContextNote: text("patientContextNote"),
    safetyNotice: text("safetyNotice"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userStatusIdx: index("marketplaceOrders_userId_status_idx").on(table.userId, table.status),
    cartIdx: index("marketplaceOrders_cartId_idx").on(table.cartId),
    userIdempotencyIdx: uniqueIndex("marketplaceOrders_userId_idempotencyKey_unique").on(table.userId, table.idempotencyKey),
  }),
);

export const marketplaceOrderItems = mysqlTable(
  "marketplaceOrderItems",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull().references(() => marketplaceOrders.id),
    itemId: int("itemId").references(() => marketplaceItems.id),
    quantity: int("quantity").default(1).notNull(),
    unitPriceCents: int("unitPriceCents").default(0).notNull(),
    nameSnapshot: varchar("nameSnapshot", { length: 220 }).notNull(),
    commercialNoticeSnapshot: text("commercialNoticeSnapshot"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    orderIdx: index("marketplaceOrderItems_orderId_idx").on(table.orderId),
    itemIdx: index("marketplaceOrderItems_itemId_idx").on(table.itemId),
  }),
);

export const marketplaceRecommendationEvents = mysqlTable(
  "marketplaceRecommendationEvents",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    itemId: int("itemId").references(() => marketplaceItems.id),
    source: mysqlEnum("source", marketplaceRecommendationSourceValues).default("manual").notNull(),
    rationale: text("rationale"),
    safetyNotice: text("safetyNotice"),
    consentSnapshot: text("consentSnapshot"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userCreatedIdx: index("marketplaceRecommendationEvents_userId_createdAt_idx").on(table.userId, table.createdAt),
    itemIdx: index("marketplaceRecommendationEvents_itemId_idx").on(table.itemId),
  }),
);

export const careJourneySessions = mysqlTable(
  "careJourneySessions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    conversationId: int("conversationId").references(() => healthConversations.id),
    status: mysqlEnum("status", careJourneyStatusValues).default("intake").notNull(),
    severityLevel: varchar("severityLevel", { length: 40 }).default("uncertain").notNull(),
    confidenceScore: int("confidenceScore").default(40).notNull(),
    policyVersion: varchar("policyVersion", { length: 80 }).notNull(),
    consentSnapshot: text("consentSnapshot"),
    escalationFlag: int("escalationFlag").default(0).notNull(),
    escalationReason: text("escalationReason"),
    intakeData: text("intakeData"),
    sessionSummary: text("sessionSummary"),
    redFlagsDetected: text("redFlagsDetected"),
    totalTurns: int("totalTurns").default(0).notNull(),
    lastActivityAt: timestamp("lastActivityAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userStatusIdx: index("careJourneySessions_userId_status_idx").on(table.userId, table.status),
    userLastActivityIdx: index("careJourneySessions_userId_lastActivityAt_idx").on(table.userId, table.lastActivityAt),
    conversationIdx: index("careJourneySessions_conversationId_idx").on(table.conversationId),
  }),
);

export const careJourneyFeedback = mysqlTable(
  "careJourneyFeedback",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    sessionId: int("sessionId").notNull().references(() => careJourneySessions.id),
    aiExecutionId: int("aiExecutionId").references(() => aiModelExecutions.id),
    rating: mysqlEnum("rating", careJourneyFeedbackRatingValues).notNull(),
    comment: text("comment"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userCreatedIdx: index("careJourneyFeedback_userId_createdAt_idx").on(table.userId, table.createdAt),
    sessionCreatedIdx: index("careJourneyFeedback_sessionId_createdAt_idx").on(table.sessionId, table.createdAt),
  }),
);

export const aiModelExecutions = mysqlTable(
  "aiModelExecutions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().references(() => users.id),
    sessionId: int("sessionId").notNull().references(() => careJourneySessions.id),
    logicalProvider: mysqlEnum("logicalProvider", aiModelProviderValues).default("built_in_llm").notNull(),
    modelCapability: mysqlEnum("modelCapability", aiModelCapabilityValues).default("care_journey_response").notNull(),
    promptId: varchar("promptId", { length: 160 }).notNull(),
    schemaName: varchar("schemaName", { length: 160 }),
    inputTokensEst: int("inputTokensEst").default(0).notNull(),
    outputTokensEst: int("outputTokensEst").default(0).notNull(),
    latencyMs: int("latencyMs").default(0).notNull(),
    status: mysqlEnum("status", aiExecutionStatusValues).default("success").notNull(),
    violationsDetected: text("violationsDetected"),
    fallbackReason: text("fallbackReason"),
    responseSnapshot: text("responseSnapshot"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userCreatedIdx: index("aiModelExecutions_userId_createdAt_idx").on(table.userId, table.createdAt),
    sessionCreatedIdx: index("aiModelExecutions_sessionId_createdAt_idx").on(table.sessionId, table.createdAt),
    providerCapabilityIdx: index("aiModelExecutions_provider_capability_idx").on(table.logicalProvider, table.modelCapability),
  }),
);

export const mlPromptVersions = mysqlTable(
  "mlPromptVersions",
  {
    id: int("id").autoincrement().primaryKey(),
    promptKey: varchar("promptKey", { length: 160 }).notNull(),
    version: varchar("version", { length: 80 }).notNull(),
    status: mysqlEnum("status", mlPromptVersionStatusValues).default("draft").notNull(),
    schemaName: varchar("schemaName", { length: 160 }),
    modelProvider: mysqlEnum("modelProvider", aiModelProviderValues).default("built_in_llm").notNull(),
    modelName: varchar("modelName", { length: 160 }),
    description: text("description"),
    systemPromptHash: varchar("systemPromptHash", { length: 160 }),
    guardrailPolicyVersion: varchar("guardrailPolicyVersion", { length: 120 }),
    rolloutPercent: int("rolloutPercent").default(0).notNull(),
    createdByUserId: int("createdByUserId").references(() => users.id),
    activatedAt: timestamp("activatedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    promptVersionIdx: uniqueIndex("mlPromptVersions_promptKey_version_unique").on(table.promptKey, table.version),
    statusIdx: index("mlPromptVersions_status_idx").on(table.status),
  }),
);

export const mlModelVersions = mysqlTable(
  "mlModelVersions",
  {
    id: int("id").autoincrement().primaryKey(),
    provider: mysqlEnum("provider", aiModelProviderValues).default("built_in_llm").notNull(),
    modelName: varchar("modelName", { length: 160 }).notNull(),
    modelVersion: varchar("modelVersion", { length: 120 }).notNull(),
    capability: mysqlEnum("capability", aiModelCapabilityValues).default("care_journey_response").notNull(),
    status: mysqlEnum("status", mlPromptVersionStatusValues).default("draft").notNull(),
    configurationSnapshot: text("configurationSnapshot"),
    evaluationSnapshot: text("evaluationSnapshot"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    modelVersionIdx: uniqueIndex("mlModelVersions_provider_name_version_unique").on(table.provider, table.modelName, table.modelVersion),
    capabilityStatusIdx: index("mlModelVersions_capability_status_idx").on(table.capability, table.status),
  }),
);

export const mlLearningEvents = mysqlTable(
  "mlLearningEvents",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").references(() => users.id),
    sessionId: int("sessionId").references(() => careJourneySessions.id),
    aiExecutionId: int("aiExecutionId").references(() => aiModelExecutions.id),
    source: mysqlEnum("source", mlLearningEventSourceValues).default("care_journey").notNull(),
    turnIndex: int("turnIndex").default(0).notNull(),
    userInput: text("userInput"),
    aiResponse: text("aiResponse"),
    normalizedIntent: varchar("normalizedIntent", { length: 160 }),
    redFlagSnapshot: text("redFlagSnapshot"),
    ragContextSnapshot: text("ragContextSnapshot"),
    autoQualityScore: int("autoQualityScore").default(0).notNull(),
    autoQualityLabel: mysqlEnum("autoQualityLabel", mlQualityLabelValues).default("unknown").notNull(),
    qualitySignals: text("qualitySignals"),
    humanLabel: mysqlEnum("humanLabel", mlHumanLabelValues),
    reviewerUserId: int("reviewerUserId").references(() => users.id),
    reviewerNotes: text("reviewerNotes"),
    promptVersion: varchar("promptVersion", { length: 120 }),
    modelVersion: varchar("modelVersion", { length: 120 }),
    isTrainingCandidate: int("isTrainingCandidate").default(0).notNull(),
    privacyScope: varchar("privacyScope", { length: 80 }).default("lgpd_minimized").notNull(),
    consentSnapshot: text("consentSnapshot"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    reviewedAt: timestamp("reviewedAt"),
  },
  (table) => ({
    createdIdx: index("mlLearningEvents_createdAt_idx").on(table.createdAt),
    userCreatedIdx: index("mlLearningEvents_userId_createdAt_idx").on(table.userId, table.createdAt),
    sessionTurnIdx: index("mlLearningEvents_sessionId_turnIndex_idx").on(table.sessionId, table.turnIndex),
    qualityIdx: index("mlLearningEvents_quality_candidate_idx").on(table.autoQualityLabel, table.isTrainingCandidate),
  }),
);

export const mlTrainingExamples = mysqlTable(
  "mlTrainingExamples",
  {
    id: int("id").autoincrement().primaryKey(),
    learningEventId: int("learningEventId").references(() => mlLearningEvents.id),
    promptVersionId: int("promptVersionId").references(() => mlPromptVersions.id),
    modelVersionId: int("modelVersionId").references(() => mlModelVersions.id),
    exampleType: varchar("exampleType", { length: 80 }).default("response_quality").notNull(),
    inputSnapshot: text("inputSnapshot").notNull(),
    expectedOutput: text("expectedOutput"),
    critique: text("critique"),
    status: mysqlEnum("status", mlTrainingExampleStatusValues).default("draft").notNull(),
    createdByUserId: int("createdByUserId").references(() => users.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    promotedAt: timestamp("promotedAt"),
  },
  (table) => ({
    statusCreatedIdx: index("mlTrainingExamples_status_createdAt_idx").on(table.status, table.createdAt),
    learningEventIdx: index("mlTrainingExamples_learningEventId_idx").on(table.learningEventId),
  }),
);

export const mlImprovementCycles = mysqlTable(
  "mlImprovementCycles",
  {
    id: int("id").autoincrement().primaryKey(),
    triggeredBy: varchar("triggeredBy", { length: 160 }).default("daily_quality_review").notNull(),
    status: mysqlEnum("status", mlImprovementCycleStatusValues).default("open").notNull(),
    reviewedCount: int("reviewedCount").default(0).notNull(),
    promotedCount: int("promotedCount").default(0).notNull(),
    rejectedCount: int("rejectedCount").default(0).notNull(),
    notes: text("notes"),
    metricsSnapshot: text("metricsSnapshot"),
    startedAt: timestamp("startedAt").defaultNow().notNull(),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    statusCreatedIdx: index("mlImprovementCycles_status_createdAt_idx").on(table.status, table.createdAt),
  }),
);

export const dayanCorpusVideos = mysqlTable(
  "dayanCorpusVideos",
  {
    id: int("id").autoincrement().primaryKey(),
    youtubeId: varchar("youtubeId", { length: 80 }).notNull(),
    title: varchar("title", { length: 320 }).notNull(),
    url: varchar("url", { length: 1024 }),
    durationSec: int("durationSec").default(0).notNull(),
    durationString: varchar("durationString", { length: 80 }),
    publishedAt: timestamp("publishedAt"),
    transcriptionStatus: mysqlEnum("transcriptionStatus", dayanTranscriptionStatusValues).default("pending").notNull(),
    themes: text("themes"),
    corpusVersion: varchar("corpusVersion", { length: 160 }).notNull(),
    metadata: text("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    youtubeIdx: uniqueIndex("dayanCorpusVideos_youtubeId_unique").on(table.youtubeId),
    statusIdx: index("dayanCorpusVideos_status_idx").on(table.transcriptionStatus),
  }),
);

export const dayanCorpusTranscripts = mysqlTable(
  "dayanCorpusTranscripts",
  {
    id: int("id").autoincrement().primaryKey(),
    videoId: int("videoId").notNull().references(() => dayanCorpusVideos.id),
    language: varchar("language", { length: 20 }).default("pt-BR").notNull(),
    rawText: text("rawText").notNull(),
    source: varchar("source", { length: 120 }).default("transcript_pipeline").notNull(),
    wordCount: int("wordCount").default(0).notNull(),
    status: mysqlEnum("status", dayanTranscriptionStatusValues).default("completed").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    videoIdx: index("dayanCorpusTranscripts_videoId_idx").on(table.videoId),
    statusIdx: index("dayanCorpusTranscripts_status_idx").on(table.status),
  }),
);

export const dayanCorpusSegments = mysqlTable(
  "dayanCorpusSegments",
  {
    id: int("id").autoincrement().primaryKey(),
    videoId: int("videoId").notNull().references(() => dayanCorpusVideos.id),
    transcriptId: int("transcriptId").references(() => dayanCorpusTranscripts.id),
    segmentIndex: int("segmentIndex").default(0).notNull(),
    text: text("text").notNull(),
    startSec: int("startSec").default(0).notNull(),
    endSec: int("endSec").default(0).notNull(),
    speakerLabel: varchar("speakerLabel", { length: 120 }),
    themes: text("themes"),
    evidenceTags: text("evidenceTags"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    videoSegmentIdx: uniqueIndex("dayanCorpusSegments_videoId_segmentIndex_unique").on(table.videoId, table.segmentIndex),
    transcriptIdx: index("dayanCorpusSegments_transcriptId_idx").on(table.transcriptId),
  }),
);

export const dayanCorpusChunks = mysqlTable(
  "dayanCorpusChunks",
  {
    id: int("id").autoincrement().primaryKey(),
    videoId: int("videoId").notNull().references(() => dayanCorpusVideos.id),
    segmentId: int("segmentId").references(() => dayanCorpusSegments.id),
    chunkIndex: int("chunkIndex").default(0).notNull(),
    text: text("text").notNull(),
    startSec: int("startSec").default(0).notNull(),
    endSec: int("endSec").default(0).notNull(),
    embedding: text("embedding"),
    embeddingModel: varchar("embeddingModel", { length: 160 }),
    themes: text("themes"),
    evidenceTags: text("evidenceTags"),
    relevanceScore: int("relevanceScore").default(0).notNull(),
    safetyRelevant: int("safetyRelevant").default(0).notNull(),
    usageCount: int("usageCount").default(0).notNull(),
    corpusVersion: varchar("corpusVersion", { length: 160 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    videoChunkIdx: uniqueIndex("dayanCorpusChunks_videoId_chunkIndex_unique").on(table.videoId, table.chunkIndex),
    relevanceIdx: index("dayanCorpusChunks_relevance_idx").on(table.relevanceScore, table.safetyRelevant),
    segmentIdx: index("dayanCorpusChunks_segmentId_idx").on(table.segmentId),
  }),
);

export const dayanRagRetrievalEvents = mysqlTable(
  "dayanRagRetrievalEvents",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").references(() => users.id),
    sessionId: int("sessionId").references(() => careJourneySessions.id),
    aiExecutionId: int("aiExecutionId").references(() => aiModelExecutions.id),
    learningEventId: int("learningEventId").references(() => mlLearningEvents.id),
    query: text("query").notNull(),
    retrievedChunkIds: text("retrievedChunkIds"),
    topScore: int("topScore").default(0).notNull(),
    sourceCount: int("sourceCount").default(0).notNull(),
    antiHallucinationStatus: mysqlEnum("antiHallucinationStatus", dayanAntiHallucinationStatusValues).default("low_evidence").notNull(),
    citationsSnapshot: text("citationsSnapshot"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    createdIdx: index("dayanRagRetrievalEvents_createdAt_idx").on(table.createdAt),
    learningEventIdx: index("dayanRagRetrievalEvents_learningEventId_idx").on(table.learningEventId),
    sessionIdx: index("dayanRagRetrievalEvents_sessionId_idx").on(table.sessionId),
  }),
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type PatientHealthProfile = typeof patientHealthProfiles.$inferSelect;
export type InsertPatientHealthProfile = typeof patientHealthProfiles.$inferInsert;
export type HealthConversation = typeof healthConversations.$inferSelect;
export type InsertHealthConversation = typeof healthConversations.$inferInsert;
export type ClinicalMemoryEvent = typeof clinicalMemoryEvents.$inferSelect;
export type InsertClinicalMemoryEvent = typeof clinicalMemoryEvents.$inferInsert;
export type ClarityMap = typeof clarityMaps.$inferSelect;
export type InsertClarityMap = typeof clarityMaps.$inferInsert;
export type HealthDocument = typeof healthDocuments.$inferSelect;
export type CareAppointment = typeof careAppointments.$inferSelect;
export type DayanNetworkProfessional = typeof dayanNetworkProfessionals.$inferSelect;
export type InsertDayanNetworkProfessional = typeof dayanNetworkProfessionals.$inferInsert;
export type HealthProvider = typeof healthProviders.$inferSelect;
export type InsertHealthProvider = typeof healthProviders.$inferInsert;
export type HealthProviderSpecialty = typeof healthProviderSpecialties.$inferSelect;
export type InsertHealthProviderSpecialty = typeof healthProviderSpecialties.$inferInsert;
export type HealthProviderSource = typeof healthProviderSources.$inferSelect;
export type InsertHealthProviderSource = typeof healthProviderSources.$inferInsert;
export type DataIngestionJob = typeof dataIngestionJobs.$inferSelect;
export type InsertDataIngestionJob = typeof dataIngestionJobs.$inferInsert;
export type HealthProviderEvidence = typeof healthProviderEvidences.$inferSelect;
export type InsertHealthProviderEvidence = typeof healthProviderEvidences.$inferInsert;
export type HealthProviderAffiliation = typeof healthProviderAffiliations.$inferSelect;
export type InsertHealthProviderAffiliation = typeof healthProviderAffiliations.$inferInsert;
export type HealthDirectoryCoverage = typeof healthDirectoryCoverage.$inferSelect;
export type InsertHealthDirectoryCoverage = typeof healthDirectoryCoverage.$inferInsert;
export type HealthIndicator = typeof healthIndicators.$inferSelect;
export type HealthConsent = typeof healthConsents.$inferSelect;
export type HealthDataConnection = typeof healthDataConnections.$inferSelect;
export type InsertHealthDataConnection = typeof healthDataConnections.$inferInsert;
export type HealthMetricSample = typeof healthMetricSamples.$inferSelect;
export type InsertHealthMetricSample = typeof healthMetricSamples.$inferInsert;
export type LongitudinalCarePlanItem = typeof longitudinalCarePlanItems.$inferSelect;
export type InsertLongitudinalCarePlanItem = typeof longitudinalCarePlanItems.$inferInsert;
export type ExternalCalendarConnection = typeof externalCalendarConnections.$inferSelect;
export type InsertExternalCalendarConnection = typeof externalCalendarConnections.$inferInsert;
export type AppointmentCalendarSync = typeof appointmentCalendarSyncs.$inferSelect;
export type InsertAppointmentCalendarSync = typeof appointmentCalendarSyncs.$inferInsert;
export type MarketplaceCategory = typeof marketplaceCategories.$inferSelect;
export type InsertMarketplaceCategory = typeof marketplaceCategories.$inferInsert;
export type MarketplacePartner = typeof marketplacePartners.$inferSelect;
export type InsertMarketplacePartner = typeof marketplacePartners.$inferInsert;
export type MarketplaceItem = typeof marketplaceItems.$inferSelect;
export type InsertMarketplaceItem = typeof marketplaceItems.$inferInsert;
export type MarketplaceInventory = typeof marketplaceInventory.$inferSelect;
export type InsertMarketplaceInventory = typeof marketplaceInventory.$inferInsert;
export type MarketplaceCart = typeof marketplaceCarts.$inferSelect;
export type InsertMarketplaceCart = typeof marketplaceCarts.$inferInsert;
export type MarketplaceCartItem = typeof marketplaceCartItems.$inferSelect;
export type InsertMarketplaceCartItem = typeof marketplaceCartItems.$inferInsert;
export type MarketplaceOrder = typeof marketplaceOrders.$inferSelect;
export type InsertMarketplaceOrder = typeof marketplaceOrders.$inferInsert;
export type MarketplaceOrderItem = typeof marketplaceOrderItems.$inferSelect;
export type InsertMarketplaceOrderItem = typeof marketplaceOrderItems.$inferInsert;
export type MarketplaceRecommendationEvent = typeof marketplaceRecommendationEvents.$inferSelect;
export type InsertMarketplaceRecommendationEvent = typeof marketplaceRecommendationEvents.$inferInsert;
export type CareJourneySession = typeof careJourneySessions.$inferSelect;
export type InsertCareJourneySession = typeof careJourneySessions.$inferInsert;
export type AiModelExecution = typeof aiModelExecutions.$inferSelect;
export type InsertAiModelExecution = typeof aiModelExecutions.$inferInsert;
export type CareJourneyFeedback = typeof careJourneyFeedback.$inferSelect;
export type InsertCareJourneyFeedback = typeof careJourneyFeedback.$inferInsert;
export type MlPromptVersion = typeof mlPromptVersions.$inferSelect;
export type InsertMlPromptVersion = typeof mlPromptVersions.$inferInsert;
export type MlModelVersion = typeof mlModelVersions.$inferSelect;
export type InsertMlModelVersion = typeof mlModelVersions.$inferInsert;
export type MlLearningEvent = typeof mlLearningEvents.$inferSelect;
export type InsertMlLearningEvent = typeof mlLearningEvents.$inferInsert;
export type MlTrainingExample = typeof mlTrainingExamples.$inferSelect;
export type InsertMlTrainingExample = typeof mlTrainingExamples.$inferInsert;
export type MlImprovementCycle = typeof mlImprovementCycles.$inferSelect;
export type InsertMlImprovementCycle = typeof mlImprovementCycles.$inferInsert;
export type DayanCorpusVideo = typeof dayanCorpusVideos.$inferSelect;
export type InsertDayanCorpusVideo = typeof dayanCorpusVideos.$inferInsert;
export type DayanCorpusTranscript = typeof dayanCorpusTranscripts.$inferSelect;
export type InsertDayanCorpusTranscript = typeof dayanCorpusTranscripts.$inferInsert;
export type DayanCorpusSegment = typeof dayanCorpusSegments.$inferSelect;
export type InsertDayanCorpusSegment = typeof dayanCorpusSegments.$inferInsert;
export type DayanCorpusChunk = typeof dayanCorpusChunks.$inferSelect;
export type InsertDayanCorpusChunk = typeof dayanCorpusChunks.$inferInsert;
export type DayanRagRetrievalEvent = typeof dayanRagRetrievalEvents.$inferSelect;
export type InsertDayanRagRetrievalEvent = typeof dayanRagRetrievalEvents.$inferInsert;

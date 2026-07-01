import { readFileSync, writeFileSync } from "node:fs";

const schemaPath = "/home/ubuntu/saude-integrativa-ia-dev/drizzle/schema.ts";
let source = readFileSync(schemaPath, "utf8");

source = source.replace(
  'export const careJourneyFeedbackRatingValues = ["helpful", "unclear", "needs_human"] as const;\n',
  `export const careJourneyFeedbackRatingValues = ["helpful", "unclear", "needs_human"] as const;
export const mlLearningEventSourceValues = ["care_journey", "home_chat", "clinical", "admin_review", "scheduled_evaluation", "system"] as const;
export const mlQualityLabelValues = ["excellent", "good", "generic", "unsafe", "too_long", "not_useful", "needs_human_review", "unknown"] as const;
export const mlHumanLabelValues = ["excellent", "good", "bad", "generic", "unsafe", "too_long", "not_useful", "training_candidate", "rejected"] as const;
export const mlTrainingExampleStatusValues = ["draft", "review_ready", "approved", "promoted", "rejected", "archived"] as const;
export const mlImprovementCycleStatusValues = ["open", "reviewing", "promoting", "completed", "cancelled"] as const;
export const mlPromptVersionStatusValues = ["draft", "active", "deprecated", "archived"] as const;
export const dayanTranscriptionStatusValues = ["pending", "processing", "completed", "failed", "excluded"] as const;
export const dayanAntiHallucinationStatusValues = ["grounded", "low_evidence", "blocked", "fallback"] as const;
`
);

const tablesBlock = `
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
`;

source = source.replace(
  '\nexport type User = typeof users.$inferSelect;',
  `${tablesBlock}\nexport type User = typeof users.$inferSelect;`
);

source = source.replace(
  'export type InsertCareJourneyFeedback = typeof careJourneyFeedback.$inferInsert;\n',
  `export type InsertCareJourneyFeedback = typeof careJourneyFeedback.$inferInsert;
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
`
);

writeFileSync(schemaPath, source);

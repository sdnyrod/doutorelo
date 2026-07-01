CREATE TABLE `dayanCorpusChunks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`videoId` int NOT NULL,
	`segmentId` int,
	`chunkIndex` int NOT NULL DEFAULT 0,
	`text` text NOT NULL,
	`startSec` int NOT NULL DEFAULT 0,
	`endSec` int NOT NULL DEFAULT 0,
	`embedding` text,
	`embeddingModel` varchar(160),
	`themes` text,
	`evidenceTags` text,
	`relevanceScore` int NOT NULL DEFAULT 0,
	`safetyRelevant` int NOT NULL DEFAULT 0,
	`usageCount` int NOT NULL DEFAULT 0,
	`corpusVersion` varchar(160) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dayanCorpusChunks_id` PRIMARY KEY(`id`),
	CONSTRAINT `dayanCorpusChunks_videoId_chunkIndex_unique` UNIQUE(`videoId`,`chunkIndex`)
);
--> statement-breakpoint
CREATE TABLE `dayanCorpusSegments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`videoId` int NOT NULL,
	`transcriptId` int,
	`segmentIndex` int NOT NULL DEFAULT 0,
	`text` text NOT NULL,
	`startSec` int NOT NULL DEFAULT 0,
	`endSec` int NOT NULL DEFAULT 0,
	`speakerLabel` varchar(120),
	`themes` text,
	`evidenceTags` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dayanCorpusSegments_id` PRIMARY KEY(`id`),
	CONSTRAINT `dayanCorpusSegments_videoId_segmentIndex_unique` UNIQUE(`videoId`,`segmentIndex`)
);
--> statement-breakpoint
CREATE TABLE `dayanCorpusTranscripts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`videoId` int NOT NULL,
	`language` varchar(20) NOT NULL DEFAULT 'pt-BR',
	`rawText` text NOT NULL,
	`source` varchar(120) NOT NULL DEFAULT 'transcript_pipeline',
	`wordCount` int NOT NULL DEFAULT 0,
	`status` enum('pending','processing','completed','failed','excluded') NOT NULL DEFAULT 'completed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dayanCorpusTranscripts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dayanCorpusVideos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`youtubeId` varchar(80) NOT NULL,
	`title` varchar(320) NOT NULL,
	`url` varchar(1024),
	`durationSec` int NOT NULL DEFAULT 0,
	`durationString` varchar(80),
	`publishedAt` timestamp,
	`transcriptionStatus` enum('pending','processing','completed','failed','excluded') NOT NULL DEFAULT 'pending',
	`themes` text,
	`corpusVersion` varchar(160) NOT NULL,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dayanCorpusVideos_id` PRIMARY KEY(`id`),
	CONSTRAINT `dayanCorpusVideos_youtubeId_unique` UNIQUE(`youtubeId`)
);
--> statement-breakpoint
CREATE TABLE `dayanRagRetrievalEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`sessionId` int,
	`aiExecutionId` int,
	`learningEventId` int,
	`query` text NOT NULL,
	`retrievedChunkIds` text,
	`topScore` int NOT NULL DEFAULT 0,
	`sourceCount` int NOT NULL DEFAULT 0,
	`antiHallucinationStatus` enum('grounded','low_evidence','blocked','fallback') NOT NULL DEFAULT 'low_evidence',
	`citationsSnapshot` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dayanRagRetrievalEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mlImprovementCycles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`triggeredBy` varchar(160) NOT NULL DEFAULT 'daily_quality_review',
	`status` enum('open','reviewing','promoting','completed','cancelled') NOT NULL DEFAULT 'open',
	`reviewedCount` int NOT NULL DEFAULT 0,
	`promotedCount` int NOT NULL DEFAULT 0,
	`rejectedCount` int NOT NULL DEFAULT 0,
	`notes` text,
	`metricsSnapshot` text,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mlImprovementCycles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mlLearningEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`sessionId` int,
	`aiExecutionId` int,
	`source` enum('care_journey','home_chat','clinical','admin_review','scheduled_evaluation','system') NOT NULL DEFAULT 'care_journey',
	`turnIndex` int NOT NULL DEFAULT 0,
	`userInput` text,
	`aiResponse` text,
	`normalizedIntent` varchar(160),
	`redFlagSnapshot` text,
	`ragContextSnapshot` text,
	`autoQualityScore` int NOT NULL DEFAULT 0,
	`autoQualityLabel` enum('excellent','good','generic','unsafe','too_long','not_useful','needs_human_review','unknown') NOT NULL DEFAULT 'unknown',
	`qualitySignals` text,
	`humanLabel` enum('excellent','good','bad','generic','unsafe','too_long','not_useful','training_candidate','rejected'),
	`reviewerUserId` int,
	`reviewerNotes` text,
	`promptVersion` varchar(120),
	`modelVersion` varchar(120),
	`isTrainingCandidate` int NOT NULL DEFAULT 0,
	`privacyScope` varchar(80) NOT NULL DEFAULT 'lgpd_minimized',
	`consentSnapshot` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	CONSTRAINT `mlLearningEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mlModelVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` enum('built_in_llm','openai','anthropic','deterministic_fallback') NOT NULL DEFAULT 'built_in_llm',
	`modelName` varchar(160) NOT NULL,
	`modelVersion` varchar(120) NOT NULL,
	`capability` enum('clinical_triage','care_journey_response','safety_guardrail','memory_summary') NOT NULL DEFAULT 'care_journey_response',
	`status` enum('draft','active','deprecated','archived') NOT NULL DEFAULT 'draft',
	`configurationSnapshot` text,
	`evaluationSnapshot` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mlModelVersions_id` PRIMARY KEY(`id`),
	CONSTRAINT `mlModelVersions_provider_name_version_unique` UNIQUE(`provider`,`modelName`,`modelVersion`)
);
--> statement-breakpoint
CREATE TABLE `mlPromptVersions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`promptKey` varchar(160) NOT NULL,
	`version` varchar(80) NOT NULL,
	`status` enum('draft','active','deprecated','archived') NOT NULL DEFAULT 'draft',
	`schemaName` varchar(160),
	`modelProvider` enum('built_in_llm','openai','anthropic','deterministic_fallback') NOT NULL DEFAULT 'built_in_llm',
	`modelName` varchar(160),
	`description` text,
	`systemPromptHash` varchar(160),
	`guardrailPolicyVersion` varchar(120),
	`rolloutPercent` int NOT NULL DEFAULT 0,
	`createdByUserId` int,
	`activatedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mlPromptVersions_id` PRIMARY KEY(`id`),
	CONSTRAINT `mlPromptVersions_promptKey_version_unique` UNIQUE(`promptKey`,`version`)
);
--> statement-breakpoint
CREATE TABLE `mlTrainingExamples` (
	`id` int AUTO_INCREMENT NOT NULL,
	`learningEventId` int,
	`promptVersionId` int,
	`modelVersionId` int,
	`exampleType` varchar(80) NOT NULL DEFAULT 'response_quality',
	`inputSnapshot` text NOT NULL,
	`expectedOutput` text,
	`critique` text,
	`status` enum('draft','review_ready','approved','promoted','rejected','archived') NOT NULL DEFAULT 'draft',
	`createdByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`promotedAt` timestamp,
	CONSTRAINT `mlTrainingExamples_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `dayanCorpusChunks` ADD CONSTRAINT `dayanCorpusChunks_videoId_dayanCorpusVideos_id_fk` FOREIGN KEY (`videoId`) REFERENCES `dayanCorpusVideos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dayanCorpusChunks` ADD CONSTRAINT `dayanCorpusChunks_segmentId_dayanCorpusSegments_id_fk` FOREIGN KEY (`segmentId`) REFERENCES `dayanCorpusSegments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dayanCorpusSegments` ADD CONSTRAINT `dayanCorpusSegments_videoId_dayanCorpusVideos_id_fk` FOREIGN KEY (`videoId`) REFERENCES `dayanCorpusVideos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dayanCorpusSegments` ADD CONSTRAINT `dayanCorpusSegments_transcriptId_dayanCorpusTranscripts_id_fk` FOREIGN KEY (`transcriptId`) REFERENCES `dayanCorpusTranscripts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dayanCorpusTranscripts` ADD CONSTRAINT `dayanCorpusTranscripts_videoId_dayanCorpusVideos_id_fk` FOREIGN KEY (`videoId`) REFERENCES `dayanCorpusVideos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dayanRagRetrievalEvents` ADD CONSTRAINT `dayanRagRetrievalEvents_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dayanRagRetrievalEvents` ADD CONSTRAINT `dayanRagRetrievalEvents_sessionId_careJourneySessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `careJourneySessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dayanRagRetrievalEvents` ADD CONSTRAINT `dayanRagRetrievalEvents_aiExecutionId_aiModelExecutions_id_fk` FOREIGN KEY (`aiExecutionId`) REFERENCES `aiModelExecutions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `dayanRagRetrievalEvents` ADD CONSTRAINT `dayanRagRetrievalEvents_learningEventId_mlLearningEvents_id_fk` FOREIGN KEY (`learningEventId`) REFERENCES `mlLearningEvents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mlLearningEvents` ADD CONSTRAINT `mlLearningEvents_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mlLearningEvents` ADD CONSTRAINT `mlLearningEvents_sessionId_careJourneySessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `careJourneySessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mlLearningEvents` ADD CONSTRAINT `mlLearningEvents_aiExecutionId_aiModelExecutions_id_fk` FOREIGN KEY (`aiExecutionId`) REFERENCES `aiModelExecutions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mlLearningEvents` ADD CONSTRAINT `mlLearningEvents_reviewerUserId_users_id_fk` FOREIGN KEY (`reviewerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mlPromptVersions` ADD CONSTRAINT `mlPromptVersions_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mlTrainingExamples` ADD CONSTRAINT `mlTrainingExamples_learningEventId_mlLearningEvents_id_fk` FOREIGN KEY (`learningEventId`) REFERENCES `mlLearningEvents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mlTrainingExamples` ADD CONSTRAINT `mlTrainingExamples_promptVersionId_mlPromptVersions_id_fk` FOREIGN KEY (`promptVersionId`) REFERENCES `mlPromptVersions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mlTrainingExamples` ADD CONSTRAINT `mlTrainingExamples_modelVersionId_mlModelVersions_id_fk` FOREIGN KEY (`modelVersionId`) REFERENCES `mlModelVersions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `mlTrainingExamples` ADD CONSTRAINT `mlTrainingExamples_createdByUserId_users_id_fk` FOREIGN KEY (`createdByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `dayanCorpusChunks_relevance_idx` ON `dayanCorpusChunks` (`relevanceScore`,`safetyRelevant`);--> statement-breakpoint
CREATE INDEX `dayanCorpusChunks_segmentId_idx` ON `dayanCorpusChunks` (`segmentId`);--> statement-breakpoint
CREATE INDEX `dayanCorpusSegments_transcriptId_idx` ON `dayanCorpusSegments` (`transcriptId`);--> statement-breakpoint
CREATE INDEX `dayanCorpusTranscripts_videoId_idx` ON `dayanCorpusTranscripts` (`videoId`);--> statement-breakpoint
CREATE INDEX `dayanCorpusTranscripts_status_idx` ON `dayanCorpusTranscripts` (`status`);--> statement-breakpoint
CREATE INDEX `dayanCorpusVideos_status_idx` ON `dayanCorpusVideos` (`transcriptionStatus`);--> statement-breakpoint
CREATE INDEX `dayanRagRetrievalEvents_createdAt_idx` ON `dayanRagRetrievalEvents` (`createdAt`);--> statement-breakpoint
CREATE INDEX `dayanRagRetrievalEvents_learningEventId_idx` ON `dayanRagRetrievalEvents` (`learningEventId`);--> statement-breakpoint
CREATE INDEX `dayanRagRetrievalEvents_sessionId_idx` ON `dayanRagRetrievalEvents` (`sessionId`);--> statement-breakpoint
CREATE INDEX `mlImprovementCycles_status_createdAt_idx` ON `mlImprovementCycles` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `mlLearningEvents_createdAt_idx` ON `mlLearningEvents` (`createdAt`);--> statement-breakpoint
CREATE INDEX `mlLearningEvents_userId_createdAt_idx` ON `mlLearningEvents` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `mlLearningEvents_sessionId_turnIndex_idx` ON `mlLearningEvents` (`sessionId`,`turnIndex`);--> statement-breakpoint
CREATE INDEX `mlLearningEvents_quality_candidate_idx` ON `mlLearningEvents` (`autoQualityLabel`,`isTrainingCandidate`);--> statement-breakpoint
CREATE INDEX `mlModelVersions_capability_status_idx` ON `mlModelVersions` (`capability`,`status`);--> statement-breakpoint
CREATE INDEX `mlPromptVersions_status_idx` ON `mlPromptVersions` (`status`);--> statement-breakpoint
CREATE INDEX `mlTrainingExamples_status_createdAt_idx` ON `mlTrainingExamples` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `mlTrainingExamples_learningEventId_idx` ON `mlTrainingExamples` (`learningEventId`);
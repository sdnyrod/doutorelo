CREATE TABLE `aiModelExecutions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int NOT NULL,
	`logicalProvider` enum('built_in_llm','openai','anthropic','deterministic_fallback') NOT NULL DEFAULT 'built_in_llm',
	`modelCapability` enum('clinical_triage','care_journey_response','safety_guardrail','memory_summary') NOT NULL DEFAULT 'care_journey_response',
	`promptId` varchar(160) NOT NULL,
	`schemaName` varchar(160),
	`inputTokensEst` int NOT NULL DEFAULT 0,
	`outputTokensEst` int NOT NULL DEFAULT 0,
	`latencyMs` int NOT NULL DEFAULT 0,
	`status` enum('success','guardrail_blocked','fallback','error') NOT NULL DEFAULT 'success',
	`violationsDetected` text,
	`fallbackReason` text,
	`responseSnapshot` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `aiModelExecutions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `careJourneySessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`conversationId` int,
	`status` enum('intake','active','waiting_human','closed','archived') NOT NULL DEFAULT 'intake',
	`severityLevel` varchar(40) NOT NULL DEFAULT 'uncertain',
	`confidenceScore` int NOT NULL DEFAULT 40,
	`policyVersion` varchar(80) NOT NULL,
	`consentSnapshot` text,
	`escalationFlag` int NOT NULL DEFAULT 0,
	`escalationReason` text,
	`intakeData` text,
	`sessionSummary` text,
	`redFlagsDetected` text,
	`totalTurns` int NOT NULL DEFAULT 0,
	`lastActivityAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `careJourneySessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `aiModelExecutions` ADD CONSTRAINT `aiModelExecutions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `aiModelExecutions` ADD CONSTRAINT `aiModelExecutions_sessionId_careJourneySessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `careJourneySessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `careJourneySessions` ADD CONSTRAINT `careJourneySessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `careJourneySessions` ADD CONSTRAINT `careJourneySessions_conversationId_healthConversations_id_fk` FOREIGN KEY (`conversationId`) REFERENCES `healthConversations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `aiModelExecutions_userId_createdAt_idx` ON `aiModelExecutions` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `aiModelExecutions_sessionId_createdAt_idx` ON `aiModelExecutions` (`sessionId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `aiModelExecutions_provider_capability_idx` ON `aiModelExecutions` (`logicalProvider`,`modelCapability`);--> statement-breakpoint
CREATE INDEX `careJourneySessions_userId_status_idx` ON `careJourneySessions` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `careJourneySessions_userId_lastActivityAt_idx` ON `careJourneySessions` (`userId`,`lastActivityAt`);--> statement-breakpoint
CREATE INDEX `careJourneySessions_conversationId_idx` ON `careJourneySessions` (`conversationId`);
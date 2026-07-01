CREATE TABLE `careJourneyFeedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionId` int NOT NULL,
	`aiExecutionId` int,
	`rating` enum('helpful','unclear','needs_human') NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `careJourneyFeedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `careJourneyFeedback` ADD CONSTRAINT `careJourneyFeedback_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `careJourneyFeedback` ADD CONSTRAINT `careJourneyFeedback_sessionId_careJourneySessions_id_fk` FOREIGN KEY (`sessionId`) REFERENCES `careJourneySessions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `careJourneyFeedback` ADD CONSTRAINT `careJourneyFeedback_aiExecutionId_aiModelExecutions_id_fk` FOREIGN KEY (`aiExecutionId`) REFERENCES `aiModelExecutions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `careJourneyFeedback_userId_createdAt_idx` ON `careJourneyFeedback` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `careJourneyFeedback_sessionId_createdAt_idx` ON `careJourneyFeedback` (`sessionId`,`createdAt`);
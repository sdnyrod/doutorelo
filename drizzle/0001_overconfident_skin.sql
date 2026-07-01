CREATE TABLE `careAppointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clarityMapId` int,
	`doctorName` varchar(180),
	`specialty` varchar(140),
	`status` enum('planned','requested','confirmed','completed','cancelled') NOT NULL DEFAULT 'planned',
	`reason` text,
	`scheduledAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `careAppointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clarityMaps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`conversationId` int,
	`status` enum('draft','ready_for_review','shared_with_doctor','archived') NOT NULL DEFAULT 'ready_for_review',
	`mainConcern` varchar(240) NOT NULL,
	`symptoms` text,
	`patterns` text,
	`questionsForDoctor` text,
	`suggestedSpecialty` varchar(140),
	`nextStep` text,
	`safetyFlags` text,
	`confidence` varchar(40) NOT NULL DEFAULT 'medium',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clarityMaps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `clinicalMemoryEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`conversationId` int,
	`eventType` enum('symptom','exam','appointment','medication','habit','note','ai_clarity_map') NOT NULL DEFAULT 'note',
	`source` enum('patient','ai','doctor','document','system') NOT NULL DEFAULT 'patient',
	`severity` enum('low','medium','attention','urgent') NOT NULL DEFAULT 'low',
	`title` varchar(180) NOT NULL,
	`summary` text,
	`metadata` text,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `clinicalMemoryEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `healthConsents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`purpose` enum('privacy','health_data','ai_guidance','notifications','medical_sharing') NOT NULL,
	`status` enum('accepted','revoked') NOT NULL DEFAULT 'accepted',
	`policyVersion` varchar(80) NOT NULL DEFAULT 'doutorelo-lgpd-v1',
	`metadata` text,
	`acceptedAt` timestamp NOT NULL DEFAULT (now()),
	`revokedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `healthConsents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `healthConversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`channel` varchar(80) NOT NULL DEFAULT 'onboarding_memory',
	`initialConcern` text,
	`latestSummary` text,
	`safetySnapshot` text,
	`lastMessageAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `healthConversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `healthDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`documentType` varchar(80) NOT NULL DEFAULT 'exam',
	`title` varchar(180) NOT NULL,
	`fileKey` varchar(512),
	`fileUrl` varchar(1024),
	`notes` text,
	`documentDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `healthDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `healthIndicators` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`kind` varchar(80) NOT NULL,
	`label` varchar(160) NOT NULL,
	`value` varchar(80) NOT NULL,
	`unit` varchar(40),
	`source` enum('patient','ai','doctor','document','system') NOT NULL DEFAULT 'patient',
	`note` text,
	`measuredAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `healthIndicators_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patientHealthProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`preferredName` varchar(120),
	`birthYear` int,
	`biologicalSex` enum('female','male','intersex','not_informed') DEFAULT 'not_informed',
	`mainGoal` varchar(180),
	`knownConditions` text,
	`medications` text,
	`allergies` text,
	`lifestyleNotes` text,
	`emotionalContext` text,
	`emergencyNotes` text,
	`completenessScore` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patientHealthProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `patientHealthProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `careAppointments` ADD CONSTRAINT `careAppointments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `careAppointments` ADD CONSTRAINT `careAppointments_clarityMapId_clarityMaps_id_fk` FOREIGN KEY (`clarityMapId`) REFERENCES `clarityMaps`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clarityMaps` ADD CONSTRAINT `clarityMaps_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clarityMaps` ADD CONSTRAINT `clarityMaps_conversationId_healthConversations_id_fk` FOREIGN KEY (`conversationId`) REFERENCES `healthConversations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clinicalMemoryEvents` ADD CONSTRAINT `clinicalMemoryEvents_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `clinicalMemoryEvents` ADD CONSTRAINT `clinicalMemoryEvents_conversationId_healthConversations_id_fk` FOREIGN KEY (`conversationId`) REFERENCES `healthConversations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `healthConsents` ADD CONSTRAINT `healthConsents_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `healthConversations` ADD CONSTRAINT `healthConversations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `healthDocuments` ADD CONSTRAINT `healthDocuments_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `healthIndicators` ADD CONSTRAINT `healthIndicators_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `patientHealthProfiles` ADD CONSTRAINT `patientHealthProfiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `careAppointments_userId_idx` ON `careAppointments` (`userId`);--> statement-breakpoint
CREATE INDEX `clarityMaps_userId_idx` ON `clarityMaps` (`userId`);--> statement-breakpoint
CREATE INDEX `clinicalMemoryEvents_userId_occurredAt_idx` ON `clinicalMemoryEvents` (`userId`,`occurredAt`);--> statement-breakpoint
CREATE INDEX `healthConsents_userId_purpose_idx` ON `healthConsents` (`userId`,`purpose`);--> statement-breakpoint
CREATE INDEX `healthConversations_userId_idx` ON `healthConversations` (`userId`);--> statement-breakpoint
CREATE INDEX `healthDocuments_userId_idx` ON `healthDocuments` (`userId`);--> statement-breakpoint
CREATE INDEX `healthIndicators_userId_measuredAt_idx` ON `healthIndicators` (`userId`,`measuredAt`);
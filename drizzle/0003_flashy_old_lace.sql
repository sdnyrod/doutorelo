CREATE TABLE `appointmentCalendarSyncs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`appointmentId` int NOT NULL,
	`connectionId` int,
	`provider` enum('google_calendar','apple_calendar','outlook_calendar','manual') NOT NULL,
	`status` enum('not_synced','queued','synced','conflict','failed','revoked') NOT NULL DEFAULT 'queued',
	`externalEventId` varchar(256),
	`externalEventUrl` varchar(1024),
	`conflictSnapshot` text,
	`lastSyncedAt` timestamp,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `appointmentCalendarSyncs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `externalCalendarConnections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` enum('google_calendar','apple_calendar','outlook_calendar','manual') NOT NULL,
	`status` enum('not_connected','pending_consent','connected','paused','revoked','error') NOT NULL DEFAULT 'pending_consent',
	`displayName` varchar(180) NOT NULL,
	`externalAccountRef` varchar(256),
	`defaultCalendarExternalId` varchar(256),
	`permissions` text,
	`consentSnapshot` text,
	`lastSyncedAt` timestamp,
	`syncCursor` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `externalCalendarConnections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `healthDataConnections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` enum('apple_health','apple_watch','health_connect','android_wearable','google_fit','manual_entry','document_upload','google_calendar','apple_calendar','outlook_calendar','partner_api') NOT NULL,
	`status` enum('not_connected','pending_consent','connected','paused','revoked','error') NOT NULL DEFAULT 'pending_consent',
	`displayName` varchar(180) NOT NULL,
	`deviceModel` varchar(180),
	`externalAccountRef` varchar(256),
	`permissions` text,
	`consentSnapshot` text,
	`syncCursor` text,
	`lastSyncedAt` timestamp,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `healthDataConnections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `healthMetricSamples` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`connectionId` int,
	`kind` enum('steps','heart_rate','resting_heart_rate','heart_rate_variability','sleep_duration','sleep_quality','blood_oxygen','respiratory_rate','body_temperature','weight','blood_pressure_systolic','blood_pressure_diastolic','glucose','menstrual_cycle','mindfulness_minutes','workout_minutes','symptom_score','energy_score','mood_score','custom') NOT NULL,
	`value` varchar(120) NOT NULL,
	`unit` varchar(40),
	`source` enum('patient','ai','doctor','document','system','apple_health','apple_watch','health_connect','android_device','wearable','calendar','partner_api') NOT NULL DEFAULT 'patient',
	`confidence` varchar(40) NOT NULL DEFAULT 'observed',
	`startedAt` timestamp NOT NULL,
	`endedAt` timestamp,
	`note` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `healthMetricSamples_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `longitudinalCarePlanItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`clarityMapId` int,
	`appointmentId` int,
	`domain` enum('prevention','symptoms','medication','supplement','nutrition','movement','sleep','mental_health','exam_follow_up','appointment_preparation','device_monitoring','education','other') NOT NULL DEFAULT 'other',
	`status` enum('planned','active','paused','completed','cancelled','needs_review') NOT NULL DEFAULT 'planned',
	`title` varchar(220) NOT NULL,
	`description` text,
	`rationale` text,
	`ownerRole` varchar(80) NOT NULL DEFAULT 'patient',
	`recurrenceRule` varchar(240),
	`targetMetricKind` enum('steps','heart_rate','resting_heart_rate','heart_rate_variability','sleep_duration','sleep_quality','blood_oxygen','respiratory_rate','body_temperature','weight','blood_pressure_systolic','blood_pressure_diastolic','glucose','menstrual_cycle','mindfulness_minutes','workout_minutes','symptom_score','energy_score','mood_score','custom'),
	`targetValue` varchar(120),
	`safetyBoundary` text,
	`startsAt` timestamp,
	`dueAt` timestamp,
	`completedAt` timestamp,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `longitudinalCarePlanItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `clinicalMemoryEvents` MODIFY COLUMN `source` enum('patient','ai','doctor','document','system','apple_health','apple_watch','health_connect','android_device','wearable','calendar','partner_api') NOT NULL DEFAULT 'patient';--> statement-breakpoint
ALTER TABLE `healthConsents` MODIFY COLUMN `purpose` enum('privacy','health_data','ai_guidance','notifications','medical_sharing','device_sync','calendar_sync','professional_share','research_opt_in') NOT NULL;--> statement-breakpoint
ALTER TABLE `healthIndicators` MODIFY COLUMN `source` enum('patient','ai','doctor','document','system','apple_health','apple_watch','health_connect','android_device','wearable','calendar','partner_api') NOT NULL DEFAULT 'patient';--> statement-breakpoint
ALTER TABLE `appointmentCalendarSyncs` ADD CONSTRAINT `appointmentCalendarSyncs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appointmentCalendarSyncs` ADD CONSTRAINT `appointmentCalendarSyncs_appointmentId_careAppointments_id_fk` FOREIGN KEY (`appointmentId`) REFERENCES `careAppointments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `appointmentCalendarSyncs` ADD CONSTRAINT `acs_connection_fk` FOREIGN KEY (`connectionId`) REFERENCES `externalCalendarConnections`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `externalCalendarConnections` ADD CONSTRAINT `ecc_user_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `healthDataConnections` ADD CONSTRAINT `hdc_user_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `healthMetricSamples` ADD CONSTRAINT `hms_user_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `healthMetricSamples` ADD CONSTRAINT `hms_connection_fk` FOREIGN KEY (`connectionId`) REFERENCES `healthDataConnections`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `longitudinalCarePlanItems` ADD CONSTRAINT `lcpi_user_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `longitudinalCarePlanItems` ADD CONSTRAINT `lcpi_clarity_map_fk` FOREIGN KEY (`clarityMapId`) REFERENCES `clarityMaps`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `longitudinalCarePlanItems` ADD CONSTRAINT `lcpi_appointment_fk` FOREIGN KEY (`appointmentId`) REFERENCES `careAppointments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `appointmentCalendarSyncs_userId_appointmentId_idx` ON `appointmentCalendarSyncs` (`userId`,`appointmentId`);--> statement-breakpoint
CREATE INDEX `externalCalendarConnections_userId_provider_idx` ON `externalCalendarConnections` (`userId`,`provider`);--> statement-breakpoint
CREATE INDEX `healthDataConnections_userId_provider_idx` ON `healthDataConnections` (`userId`,`provider`);--> statement-breakpoint
CREATE INDEX `healthMetricSamples_userId_kind_startedAt_idx` ON `healthMetricSamples` (`userId`,`kind`,`startedAt`);--> statement-breakpoint
CREATE INDEX `longitudinalCarePlanItems_userId_status_idx` ON `longitudinalCarePlanItems` (`userId`,`status`);
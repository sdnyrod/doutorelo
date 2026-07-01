CREATE TABLE `dataIngestionJobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceKey` varchar(120) NOT NULL,
	`sourceName` varchar(180) NOT NULL,
	`sourceKind` enum('official_public','public_registry','commercial','manual','partner','social_opt_in','other') NOT NULL DEFAULT 'official_public',
	`status` enum('queued','running','completed','completed_with_errors','failed','cancelled') NOT NULL DEFAULT 'queued',
	`requestedByUserId` int,
	`scopeCountry` varchar(2) NOT NULL DEFAULT 'BR',
	`scopeState` varchar(2),
	`scopeCity` varchar(120),
	`inputStorageKey` varchar(512),
	`outputStorageKey` varchar(512),
	`recordsSeen` int NOT NULL DEFAULT 0,
	`recordsProcessed` int NOT NULL DEFAULT 0,
	`recordsCreated` int NOT NULL DEFAULT 0,
	`recordsUpdated` int NOT NULL DEFAULT 0,
	`recordsSkipped` int NOT NULL DEFAULT 0,
	`errorCount` int NOT NULL DEFAULT 0,
	`errorSummary` text,
	`metricsSnapshot` text,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dataIngestionJobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `healthDirectoryCoverage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sourceKey` varchar(120) NOT NULL,
	`sourceName` varchar(180) NOT NULL,
	`state` varchar(2) NOT NULL,
	`city` varchar(120) NOT NULL,
	`municipalityCode` varchar(7),
	`providerCount` int NOT NULL DEFAULT 0,
	`professionalCount` int NOT NULL DEFAULT 0,
	`facilityCount` int NOT NULL DEFAULT 0,
	`coverageScore` int NOT NULL DEFAULT 0,
	`dataFreshnessDays` int NOT NULL DEFAULT 0,
	`lastIngestionJobId` int,
	`status` enum('queued','running','completed','completed_with_errors','failed','cancelled') NOT NULL DEFAULT 'queued',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `healthDirectoryCoverage_id` PRIMARY KEY(`id`),
	CONSTRAINT `hdc_source_municipality_unique` UNIQUE(`sourceKey`,`state`,`city`)
);
--> statement-breakpoint
CREATE TABLE `healthProviderAffiliations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`professionalProviderId` int NOT NULL,
	`facilityProviderId` int NOT NULL,
	`relationshipType` varchar(120) NOT NULL DEFAULT 'attends_at',
	`sourceName` varchar(180),
	`sourceExternalId` varchar(160),
	`active` int NOT NULL DEFAULT 1,
	`startedAt` timestamp,
	`endedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `healthProviderAffiliations_id` PRIMARY KEY(`id`),
	CONSTRAINT `hpa_link_unique` UNIQUE(`professionalProviderId`,`facilityProviderId`,`relationshipType`)
);
--> statement-breakpoint
CREATE TABLE `healthProviderEvidences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`providerId` int NOT NULL,
	`providerSourceId` int,
	`ingestionJobId` int,
	`evidenceKind` enum('identity','license','address','contact','specialty','facility','geolocation','coverage','other') NOT NULL DEFAULT 'other',
	`fieldName` varchar(120) NOT NULL,
	`fieldValueSnapshot` text,
	`rawPayloadSnapshot` text,
	`sourceUrl` varchar(1024),
	`confidenceScore` int NOT NULL DEFAULT 0,
	`isCurrent` int NOT NULL DEFAULT 1,
	`observedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `healthProviderEvidences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `healthProviderSources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`providerId` int NOT NULL,
	`sourceKey` varchar(120) NOT NULL,
	`sourceName` varchar(180) NOT NULL,
	`sourceKind` enum('official_public','public_registry','commercial','manual','partner','social_opt_in','other') NOT NULL DEFAULT 'official_public',
	`externalId` varchar(160),
	`sourceUrl` varchar(1024),
	`reliability` enum('primary','secondary','enrichment','unverified') NOT NULL DEFAULT 'secondary',
	`fieldCoverage` text,
	`confidenceScore` int NOT NULL DEFAULT 0,
	`firstSeenAt` timestamp NOT NULL DEFAULT (now()),
	`lastSeenAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `healthProviderSources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `healthProviderSpecialties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`providerId` int NOT NULL,
	`specialtyName` varchar(180) NOT NULL,
	`specialtyCode` varchar(80),
	`taxonomySystem` varchar(80) NOT NULL DEFAULT 'manual',
	`isPrimary` int NOT NULL DEFAULT 0,
	`sourceName` varchar(160),
	`confidenceScore` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `healthProviderSpecialties_id` PRIMARY KEY(`id`),
	CONSTRAINT `hps_provider_specialty_unique` UNIQUE(`providerId`,`specialtyName`,`taxonomySystem`)
);
--> statement-breakpoint
CREATE TABLE `healthProviders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`entityType` enum('professional','clinic','hospital','laboratory','pharmacy','health_facility','other') NOT NULL DEFAULT 'professional',
	`displayName` varchar(220) NOT NULL,
	`legalName` varchar(220),
	`normalizedName` varchar(220) NOT NULL,
	`professionalType` varchar(120) NOT NULL DEFAULT 'health_professional',
	`primarySpecialty` varchar(180),
	`documentType` enum('cpf_masked','cnpj_masked','public_registry','not_collected') NOT NULL DEFAULT 'not_collected',
	`documentMasked` varchar(80),
	`councilType` enum('crm','cro','crn','crefito','crp','coren','crf','crfa','cress','other','not_applicable') NOT NULL DEFAULT 'not_applicable',
	`councilNumber` varchar(80),
	`councilState` varchar(2),
	`licenseStatus` varchar(120),
	`cnesCode` varchar(32),
	`establishmentType` varchar(160),
	`bio` text,
	`publicSummary` text,
	`city` varchar(120) NOT NULL,
	`state` varchar(2) NOT NULL,
	`municipalityCode` varchar(7),
	`neighborhood` varchar(160),
	`addressLine` varchar(260),
	`postalCode` varchar(16),
	`lat` decimal(10,7),
	`lng` decimal(10,7),
	`phone` varchar(40),
	`email` varchar(320),
	`whatsapp` varchar(40),
	`website` varchar(1024),
	`modality` enum('presential','online','both') NOT NULL DEFAULT 'both',
	`sourceConfidenceScore` int NOT NULL DEFAULT 0,
	`qualityScore` int NOT NULL DEFAULT 0,
	`verificationStatus` enum('unverified','source_verified','manually_verified','conflict','rejected') NOT NULL DEFAULT 'unverified',
	`status` enum('active','inactive','pending_review','archived') NOT NULL DEFAULT 'pending_review',
	`active` int NOT NULL DEFAULT 1,
	`verified` int NOT NULL DEFAULT 0,
	`lastSeenAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `healthProviders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `dataIngestionJobs` ADD CONSTRAINT `dataIngestionJobs_requestedByUserId_users_id_fk` FOREIGN KEY (`requestedByUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `healthDirectoryCoverage` ADD CONSTRAINT `hdc_last_job_fk` FOREIGN KEY (`lastIngestionJobId`) REFERENCES `dataIngestionJobs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `healthProviderAffiliations` ADD CONSTRAINT `hpa_professional_fk` FOREIGN KEY (`professionalProviderId`) REFERENCES `healthProviders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `healthProviderAffiliations` ADD CONSTRAINT `hpa_facility_fk` FOREIGN KEY (`facilityProviderId`) REFERENCES `healthProviders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `healthProviderEvidences` ADD CONSTRAINT `hpe_provider_fk` FOREIGN KEY (`providerId`) REFERENCES `healthProviders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `healthProviderEvidences` ADD CONSTRAINT `hpe_source_fk` FOREIGN KEY (`providerSourceId`) REFERENCES `healthProviderSources`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `healthProviderEvidences` ADD CONSTRAINT `hpe_job_fk` FOREIGN KEY (`ingestionJobId`) REFERENCES `dataIngestionJobs`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `healthProviderSources` ADD CONSTRAINT `hpsrc_provider_fk` FOREIGN KEY (`providerId`) REFERENCES `healthProviders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `healthProviderSpecialties` ADD CONSTRAINT `hps_provider_fk` FOREIGN KEY (`providerId`) REFERENCES `healthProviders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `dij_source_status_idx` ON `dataIngestionJobs` (`sourceKey`,`status`);--> statement-breakpoint
CREATE INDEX `dij_scope_idx` ON `dataIngestionJobs` (`scopeCountry`,`scopeState`,`scopeCity`);--> statement-breakpoint
CREATE INDEX `dij_created_idx` ON `dataIngestionJobs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `hdc_state_city_idx` ON `healthDirectoryCoverage` (`state`,`city`);--> statement-breakpoint
CREATE INDEX `hdc_job_idx` ON `healthDirectoryCoverage` (`lastIngestionJobId`);--> statement-breakpoint
CREATE INDEX `hpa_professional_idx` ON `healthProviderAffiliations` (`professionalProviderId`);--> statement-breakpoint
CREATE INDEX `hpa_facility_idx` ON `healthProviderAffiliations` (`facilityProviderId`);--> statement-breakpoint
CREATE INDEX `hpe_provider_field_idx` ON `healthProviderEvidences` (`providerId`,`fieldName`);--> statement-breakpoint
CREATE INDEX `hpe_source_idx` ON `healthProviderEvidences` (`providerSourceId`);--> statement-breakpoint
CREATE INDEX `hpe_job_idx` ON `healthProviderEvidences` (`ingestionJobId`);--> statement-breakpoint
CREATE INDEX `hpe_kind_idx` ON `healthProviderEvidences` (`evidenceKind`);--> statement-breakpoint
CREATE INDEX `hpsrc_provider_idx` ON `healthProviderSources` (`providerId`);--> statement-breakpoint
CREATE INDEX `hpsrc_source_external_idx` ON `healthProviderSources` (`sourceKey`,`externalId`);--> statement-breakpoint
CREATE INDEX `hpsrc_kind_reliability_idx` ON `healthProviderSources` (`sourceKind`,`reliability`);--> statement-breakpoint
CREATE INDEX `hps_provider_idx` ON `healthProviderSpecialties` (`providerId`);--> statement-breakpoint
CREATE INDEX `hps_specialty_idx` ON `healthProviderSpecialties` (`specialtyName`);--> statement-breakpoint
CREATE INDEX `hp_city_state_idx` ON `healthProviders` (`city`,`state`);--> statement-breakpoint
CREATE INDEX `hp_state_specialty_idx` ON `healthProviders` (`state`,`primarySpecialty`);--> statement-breakpoint
CREATE INDEX `hp_entity_status_idx` ON `healthProviders` (`entityType`,`status`);--> statement-breakpoint
CREATE INDEX `hp_verification_idx` ON `healthProviders` (`verificationStatus`);--> statement-breakpoint
CREATE INDEX `hp_council_idx` ON `healthProviders` (`councilType`,`councilNumber`,`councilState`);--> statement-breakpoint
CREATE INDEX `hp_cnes_idx` ON `healthProviders` (`cnesCode`);
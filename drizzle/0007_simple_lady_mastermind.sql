CREATE TABLE `dayanNetworkProfessionals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(180) NOT NULL,
	`specialty` varchar(160) NOT NULL,
	`professionalType` varchar(80) NOT NULL DEFAULT 'doctor',
	`bio` text,
	`city` varchar(120) NOT NULL,
	`state` varchar(2) NOT NULL,
	`addressLine` varchar(240) NOT NULL,
	`lat` decimal(10,7) NOT NULL,
	`lng` decimal(10,7) NOT NULL,
	`phone` varchar(40),
	`email` varchar(320),
	`whatsapp` varchar(40),
	`modality` enum('presential','online','both') NOT NULL DEFAULT 'both',
	`active` int NOT NULL DEFAULT 1,
	`photoUrl` varchar(1024),
	`crm` varchar(40),
	`crn` varchar(40),
	`crf` varchar(40),
	`associatedSince` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dayanNetworkProfessionals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `dayanNetworkProfessionals_city_state_idx` ON `dayanNetworkProfessionals` (`city`,`state`);--> statement-breakpoint
CREATE INDEX `dayanNetworkProfessionals_specialty_idx` ON `dayanNetworkProfessionals` (`specialty`);--> statement-breakpoint
CREATE INDEX `dayanNetworkProfessionals_active_idx` ON `dayanNetworkProfessionals` (`active`);
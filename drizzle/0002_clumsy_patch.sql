CREATE TABLE `marketplaceCartItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cartId` int NOT NULL,
	`itemId` int NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPriceCents` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplaceCartItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `marketplaceCartItems_cartId_itemId_unique` UNIQUE(`cartId`,`itemId`)
);
--> statement-breakpoint
CREATE TABLE `marketplaceCarts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`status` enum('active','converted','abandoned') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplaceCarts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplaceCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(120) NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text,
	`displayOrder` int NOT NULL DEFAULT 0,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplaceCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `marketplaceCategories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `marketplaceInventory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itemId` int NOT NULL,
	`stockOnHand` int NOT NULL DEFAULT 0,
	`reservedStock` int NOT NULL DEFAULT 0,
	`lowStockThreshold` int NOT NULL DEFAULT 3,
	`restockNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplaceInventory_id` PRIMARY KEY(`id`),
	CONSTRAINT `marketplaceInventory_itemId_unique` UNIQUE(`itemId`)
);
--> statement-breakpoint
CREATE TABLE `marketplaceItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(160) NOT NULL,
	`kind` enum('product','service') NOT NULL DEFAULT 'product',
	`categoryId` int,
	`partnerId` int,
	`name` varchar(220) NOT NULL,
	`subtitle` varchar(260),
	`description` text,
	`claimReviewNotes` text,
	`commercialNotice` text,
	`priceCents` int NOT NULL DEFAULT 0,
	`currency` varchar(3) NOT NULL DEFAULT 'BRL',
	`publicationStatus` enum('draft','published','inactive') NOT NULL DEFAULT 'draft',
	`eligibility` enum('general','requires_profile','requires_professional_context','restricted') NOT NULL DEFAULT 'general',
	`inventoryPolicy` enum('track_stock','unlimited','service_capacity') NOT NULL DEFAULT 'track_stock',
	`tags` text,
	`imageUrl` varchar(1024),
	`requiresConsent` int NOT NULL DEFAULT 1,
	`featured` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplaceItems_id` PRIMARY KEY(`id`),
	CONSTRAINT `marketplaceItems_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `marketplaceOrderItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`itemId` int,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPriceCents` int NOT NULL DEFAULT 0,
	`nameSnapshot` varchar(220) NOT NULL,
	`commercialNoticeSnapshot` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `marketplaceOrderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplaceOrders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cartId` int,
	`status` enum('draft','pending_review','simulated_checkout','confirmed','cancelled') NOT NULL DEFAULT 'draft',
	`subtotalCents` int NOT NULL DEFAULT 0,
	`currency` varchar(3) NOT NULL DEFAULT 'BRL',
	`checkoutMode` varchar(80) NOT NULL DEFAULT 'dev_simulated',
	`patientContextNote` text,
	`safetyNotice` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplaceOrders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplacePartners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(120) NOT NULL,
	`name` varchar(180) NOT NULL,
	`partnerType` varchar(80) NOT NULL DEFAULT 'curated_partner',
	`verificationStatus` varchar(80) NOT NULL DEFAULT 'reviewed_dev',
	`description` text,
	`contactEmail` varchar(320),
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `marketplacePartners_id` PRIMARY KEY(`id`),
	CONSTRAINT `marketplacePartners_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `marketplaceRecommendationEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`itemId` int,
	`source` enum('profile','memory','appointment','manual','ai') NOT NULL DEFAULT 'manual',
	`rationale` text,
	`safetyNotice` text,
	`consentSnapshot` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `marketplaceRecommendationEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `marketplaceCartItems` ADD CONSTRAINT `marketplaceCartItems_cartId_marketplaceCarts_id_fk` FOREIGN KEY (`cartId`) REFERENCES `marketplaceCarts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marketplaceCartItems` ADD CONSTRAINT `marketplaceCartItems_itemId_marketplaceItems_id_fk` FOREIGN KEY (`itemId`) REFERENCES `marketplaceItems`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marketplaceCarts` ADD CONSTRAINT `marketplaceCarts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marketplaceInventory` ADD CONSTRAINT `marketplaceInventory_itemId_marketplaceItems_id_fk` FOREIGN KEY (`itemId`) REFERENCES `marketplaceItems`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marketplaceItems` ADD CONSTRAINT `marketplaceItems_categoryId_marketplaceCategories_id_fk` FOREIGN KEY (`categoryId`) REFERENCES `marketplaceCategories`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marketplaceItems` ADD CONSTRAINT `marketplaceItems_partnerId_marketplacePartners_id_fk` FOREIGN KEY (`partnerId`) REFERENCES `marketplacePartners`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marketplaceOrderItems` ADD CONSTRAINT `marketplaceOrderItems_orderId_marketplaceOrders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `marketplaceOrders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marketplaceOrderItems` ADD CONSTRAINT `marketplaceOrderItems_itemId_marketplaceItems_id_fk` FOREIGN KEY (`itemId`) REFERENCES `marketplaceItems`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marketplaceOrders` ADD CONSTRAINT `marketplaceOrders_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marketplaceOrders` ADD CONSTRAINT `marketplaceOrders_cartId_marketplaceCarts_id_fk` FOREIGN KEY (`cartId`) REFERENCES `marketplaceCarts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marketplaceRecommendationEvents` ADD CONSTRAINT `marketplaceRecommendationEvents_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marketplaceRecommendationEvents` ADD CONSTRAINT `marketplaceRecommendationEvents_itemId_marketplaceItems_id_fk` FOREIGN KEY (`itemId`) REFERENCES `marketplaceItems`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `marketplaceCartItems_itemId_idx` ON `marketplaceCartItems` (`itemId`);--> statement-breakpoint
CREATE INDEX `marketplaceCarts_userId_status_idx` ON `marketplaceCarts` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `marketplaceItems_category_status_idx` ON `marketplaceItems` (`categoryId`,`publicationStatus`);--> statement-breakpoint
CREATE INDEX `marketplaceItems_partner_idx` ON `marketplaceItems` (`partnerId`);--> statement-breakpoint
CREATE INDEX `marketplaceOrderItems_orderId_idx` ON `marketplaceOrderItems` (`orderId`);--> statement-breakpoint
CREATE INDEX `marketplaceOrderItems_itemId_idx` ON `marketplaceOrderItems` (`itemId`);--> statement-breakpoint
CREATE INDEX `marketplaceOrders_userId_status_idx` ON `marketplaceOrders` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `marketplaceOrders_cartId_idx` ON `marketplaceOrders` (`cartId`);--> statement-breakpoint
CREATE INDEX `marketplaceRecommendationEvents_userId_createdAt_idx` ON `marketplaceRecommendationEvents` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `marketplaceRecommendationEvents_itemId_idx` ON `marketplaceRecommendationEvents` (`itemId`);
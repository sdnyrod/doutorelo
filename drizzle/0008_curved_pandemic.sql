ALTER TABLE `marketplaceCarts` ADD `activeCartKey` varchar(80);--> statement-breakpoint
ALTER TABLE `marketplaceOrders` ADD `idempotencyKey` varchar(128);--> statement-breakpoint
UPDATE `marketplaceCarts` c
JOIN (
  SELECT `userId`, MIN(`id`) AS `keepId`
  FROM `marketplaceCarts`
  WHERE `status` = 'active'
  GROUP BY `userId`
) k ON k.`userId` = c.`userId` AND c.`status` = 'active'
SET
  c.`activeCartKey` = CASE WHEN c.`id` = k.`keepId` THEN CONCAT('user:', c.`userId`, ':active') ELSE NULL END,
  c.`status` = CASE WHEN c.`id` = k.`keepId` THEN 'active' ELSE 'abandoned' END,
  c.`updatedAt` = NOW();--> statement-breakpoint
ALTER TABLE `marketplaceCarts` ADD CONSTRAINT `marketplaceCarts_activeCartKey_unique` UNIQUE(`activeCartKey`);--> statement-breakpoint
ALTER TABLE `marketplaceOrders` ADD CONSTRAINT `marketplaceOrders_userId_idempotencyKey_unique` UNIQUE(`userId`,`idempotencyKey`);

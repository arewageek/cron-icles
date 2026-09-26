CREATE TABLE `registered_workers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`endpoint_url` text NOT NULL,
	`auth_secret` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `scheduled_tasks` (
	`idempotency_key` text PRIMARY KEY NOT NULL,
	`target_worker_id` text NOT NULL,
	`execute_at` text NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`target_worker_id`) REFERENCES `registered_workers`(`id`) ON UPDATE no action ON DELETE cascade
);

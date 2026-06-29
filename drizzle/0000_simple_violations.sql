CREATE TABLE `audit_logs` (
	`id` varchar(50) NOT NULL,
	`actor_id` varchar(255) NOT NULL,
	`action` varchar(255) NOT NULL,
	`target_id` varchar(255),
	`metadata` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `case_messages` (
	`id` varchar(50) NOT NULL,
	`case_id` varchar(50) NOT NULL,
	`sender_id` varchar(255) NOT NULL,
	`sender_role` enum('contributor','moderator','admin','system') NOT NULL,
	`body` text NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `case_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cases` (
	`id` varchar(50) NOT NULL,
	`contributor_user_id` varchar(255) NOT NULL,
	`subject` varchar(255) NOT NULL,
	`status` enum('open','in_progress','resolved','closed') DEFAULT 'open',
	`priority` enum('low','normal','high','urgent') DEFAULT 'normal',
	`related_pub_id` varchar(50),
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `cases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `downloads_log` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`pub_id` int NOT NULL,
	`user_id` varchar(255),
	`ip_address_hash` varchar(255) NOT NULL,
	`timestamp` timestamp DEFAULT (now()),
	CONSTRAINT `downloads_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `publications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pub_id` varchar(50) NOT NULL,
	`author_id` varchar(255),
	`title` varchar(255) NOT NULL,
	`subtitle` varchar(512),
	`abstract` text,
	`type` enum('book','research_paper','magazine','poster','other','3d_artifact','code_gist','3d_model','software_code','image') NOT NULL,
	`license` enum('ORP_BEAVER','ORP_EAGLE','ORP_KANGAROO') NOT NULL,
	`status` enum('pending_review','published','rejected') DEFAULT 'pending_review',
	`division` enum('artifacts','3d','code') NOT NULL DEFAULT 'artifacts',
	`publisher_id` varchar(255),
	`file_storage_key` varchar(512),
	`extra_files` text,
	`cover_storage_key` varchar(512),
	`custom_thumbnail_storage_key` varchar(512),
	`github_repo_url` varchar(255),
	`threejs_model_key` varchar(512),
	`tags` text,
	`communities` text,
	`links` text,
	`view_count` int DEFAULT 0,
	`download_count` int DEFAULT 0,
	`submitted_at` timestamp DEFAULT (now()),
	`published_at` timestamp,
	CONSTRAINT `publications_id` PRIMARY KEY(`id`),
	CONSTRAINT `publications_pub_id_unique` UNIQUE(`pub_id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` varchar(50) NOT NULL,
	`pub_id` int NOT NULL,
	`reviewer_id` varchar(255) NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(255) NOT NULL,
	`display_name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`role` enum('contributor','moderator','admin') DEFAULT 'contributor',
	`is_suspended` boolean DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_actor_id_users_id_fk` FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `case_messages` ADD CONSTRAINT `case_messages_case_id_cases_id_fk` FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `case_messages` ADD CONSTRAINT `case_messages_sender_id_users_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `cases` ADD CONSTRAINT `cases_contributor_user_id_users_id_fk` FOREIGN KEY (`contributor_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `downloads_log` ADD CONSTRAINT `downloads_log_pub_id_publications_id_fk` FOREIGN KEY (`pub_id`) REFERENCES `publications`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `downloads_log` ADD CONSTRAINT `downloads_log_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publications` ADD CONSTRAINT `publications_author_id_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_pub_id_publications_id_fk` FOREIGN KEY (`pub_id`) REFERENCES `publications`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_reviewer_id_users_id_fk` FOREIGN KEY (`reviewer_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `title_idx` ON `publications` (`title`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `publications` (`status`);--> statement-breakpoint
CREATE INDEX `division_idx` ON `publications` (`division`);--> statement-breakpoint
CREATE INDEX `author_idx` ON `publications` (`author_id`);
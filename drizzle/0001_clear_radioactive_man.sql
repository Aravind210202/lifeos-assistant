CREATE TABLE `budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`category` enum('Rent','Groceries','Transport','Food','Subscriptions','Shopping','Entertainment','Study','Travel','Health','Bills','Other') NOT NULL,
	`monthYear` varchar(7) NOT NULL,
	`budgetAmount` decimal(10,2) NOT NULL,
	`alertThreshold` int NOT NULL DEFAULT 80,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`category` enum('University','Career','Fitness','Finance','Personal') NOT NULL,
	`whyItMatters` text,
	`progress` int NOT NULL DEFAULT 0,
	`nextAction` text,
	`deadline` timestamp,
	`status` enum('active','paused','completed','abandoned') NOT NULL DEFAULT 'active',
	`milestones` json NOT NULL DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobApplications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`company` varchar(255) NOT NULL,
	`role` varchar(255) NOT NULL,
	`location` varchar(255),
	`jobLink` text,
	`dateApplied` timestamp,
	`status` enum('Saved','Applying','Applied','Interview','Offer','Rejected') NOT NULL DEFAULT 'Saved',
	`followUpDate` timestamp,
	`resumeVersion` varchar(100),
	`coverLetterVersion` varchar(100),
	`interviewStages` json NOT NULL DEFAULT ('[]'),
	`notes` text,
	`outcome` text,
	`salary` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobApplications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `llmInteractions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('cover_letter','resume','job_scoring','question_answer','job_search') NOT NULL,
	`prompt` text NOT NULL,
	`response` text NOT NULL,
	`isApproved` boolean NOT NULL DEFAULT false,
	`approvedAt` timestamp,
	`relatedJobApplicationId` int,
	`metadata` json NOT NULL DEFAULT ('{}'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `llmInteractions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`category` enum('quick','study','ideas','life_admin') NOT NULL DEFAULT 'quick',
	`tags` json NOT NULL DEFAULT ('[]'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificationPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`reminderOverdue` boolean NOT NULL DEFAULT true,
	`deadlineUpcoming` boolean NOT NULL DEFAULT true,
	`jobFollowup` boolean NOT NULL DEFAULT true,
	`budgetWarning` boolean NOT NULL DEFAULT true,
	`goalMilestone` boolean NOT NULL DEFAULT true,
	`pushNotifications` boolean NOT NULL DEFAULT true,
	`emailNotifications` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notificationPreferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('reminder_overdue','deadline_upcoming','job_followup','budget_warning','goal_milestone') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`relatedId` int,
	`relatedType` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `personalMemory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('resume_detail','education','work_history','achievement','preferred_answer','salary_preference','work_rights','skill','writing_tone','recurring_info') NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`metadata` json NOT NULL DEFAULT ('{}'),
	`isEnabled` boolean NOT NULL DEFAULT true,
	`usageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `personalMemory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`dueDate` timestamp,
	`category` enum('University','Career','Finance','Health','Personal','Life Admin') NOT NULL,
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`isCompleted` boolean NOT NULL DEFAULT false,
	`isOverdue` boolean NOT NULL DEFAULT false,
	`progress` int NOT NULL DEFAULT 0,
	`isRecurring` boolean NOT NULL DEFAULT false,
	`recurringPattern` enum('daily','weekly','biweekly','monthly','yearly'),
	`recurringEndDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('income','expense') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`category` enum('Rent','Groceries','Transport','Food','Subscriptions','Shopping','Entertainment','Study','Travel','Health','Bills','Other','Salary','Investment') NOT NULL,
	`description` varchar(255),
	`date` timestamp NOT NULL,
	`isRecurring` boolean NOT NULL DEFAULT false,
	`recurringPattern` enum('daily','weekly','biweekly','monthly','yearly'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);

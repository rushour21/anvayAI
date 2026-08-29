CREATE TYPE "public"."model_mode" AS ENUM('auto', 'openai', 'gemma', 'nemotron', 'minimax');--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "model_mode" "model_mode" DEFAULT 'auto' NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "model_used" text;
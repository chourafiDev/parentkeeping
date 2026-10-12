ALTER TYPE "public"."order_event_type" ADD VALUE 'downloads_reset' BEFORE 'flagged_non_us';--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "downloads_reset_at" timestamp with time zone;
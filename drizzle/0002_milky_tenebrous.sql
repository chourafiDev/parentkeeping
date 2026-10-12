CREATE TYPE "public"."product_status" AS ENUM('active', 'draft', 'archived');--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "content_type" text;--> statement-breakpoint
ALTER TABLE "files" ADD COLUMN "uploaded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "status" "product_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "image_key" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "image_url" text;--> statement-breakpoint
UPDATE "products" SET "status" = CASE WHEN "active" THEN 'active'::"product_status" ELSE 'archived'::"product_status" END;
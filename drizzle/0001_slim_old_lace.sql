CREATE TYPE "public"."file_kind" AS ENUM('pdf', 'sheet_link');--> statement-breakpoint
CREATE TYPE "public"."product_kind" AS ENUM('bundle', 'single', 'bump');--> statement-breakpoint
CREATE TYPE "public"."order_event_type" AS ENUM('paid', 'confirmation_sent', 'file_ready_sent', 'link_reissued', 'email_resent', 'flagged_non_us', 'refunded', 'note');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('paid', 'refunded', 'flagged_non_us');--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text NOT NULL,
	"kind" "file_kind" NOT NULL,
	"storage_key" text,
	"file_name" text,
	"size_bytes" integer,
	"url" text,
	"available_at" timestamp with time zone,
	"ready_notified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_files" (
	"product_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "product_files_product_id_file_id_pk" PRIMARY KEY("product_id","file_id")
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"kind" "product_kind" NOT NULL,
	"stripe_product_id" text,
	"stripe_price_id" text,
	"founding_price_id" text,
	"price" integer NOT NULL,
	"founding_price" integer,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_stripeProductId_unique" UNIQUE("stripe_product_id"),
	CONSTRAINT "products_price_positive" CHECK ("products"."price" >= 0),
	CONSTRAINT "products_founding_price_positive" CHECK ("products"."founding_price" IS NULL OR "products"."founding_price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "download_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "download_tokens_tokenHash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "downloads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_id" uuid NOT NULL,
	"file_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"type" "order_event_type" NOT NULL,
	"message" text,
	"data" jsonb,
	"actor_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"title" text NOT NULL,
	"stripe_price_id" text NOT NULL,
	"amount" integer NOT NULL,
	"is_bump" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_items_amount_positive" CHECK ("order_items"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" integer GENERATED ALWAYS AS IDENTITY (sequence name "orders_order_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1001 CACHE 1),
	"stripe_session_id" text NOT NULL,
	"stripe_payment_intent_id" text,
	"stripe_customer_id" text,
	"email" text NOT NULL,
	"name" text,
	"billing_country" text,
	"currency" text DEFAULT 'usd' NOT NULL,
	"amount_subtotal" integer NOT NULL,
	"amount_tax" integer DEFAULT 0 NOT NULL,
	"amount_total" integer NOT NULL,
	"amount_refunded" integer DEFAULT 0 NOT NULL,
	"founding" boolean DEFAULT false NOT NULL,
	"tos_consent" text,
	"consent_at" timestamp with time zone,
	"test_variant" text,
	"status" "order_status" DEFAULT 'paid' NOT NULL,
	"confirmation_sent_at" timestamp with time zone,
	"refunded_at" timestamp with time zone,
	"paid_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "orders_orderNumber_unique" UNIQUE("order_number"),
	CONSTRAINT "orders_stripeSessionId_unique" UNIQUE("stripe_session_id"),
	CONSTRAINT "orders_stripePaymentIntentId_unique" UNIQUE("stripe_payment_intent_id"),
	CONSTRAINT "orders_amounts_positive" CHECK ("orders"."amount_subtotal" >= 0 AND "orders"."amount_tax" >= 0 AND "orders"."amount_total" >= 0 AND "orders"."amount_refunded" >= 0)
);
--> statement-breakpoint
CREATE TABLE "stripe_events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"source" text NOT NULL,
	"country" text,
	"marketing_consent" boolean NOT NULL,
	"consent_text" text NOT NULL,
	"consent_at" timestamp with time zone NOT NULL,
	"test_variant" text,
	"email_tool_synced_at" timestamp with time zone,
	"unsubscribed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "product_files" ADD CONSTRAINT "product_files_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_files" ADD CONSTRAINT "product_files_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "download_tokens" ADD CONSTRAINT "download_tokens_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_token_id_download_tokens_id_fk" FOREIGN KEY ("token_id") REFERENCES "public"."download_tokens"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "product_files_file_id_index" ON "product_files" USING btree ("file_id");--> statement-breakpoint
CREATE INDEX "download_tokens_order_id_index" ON "download_tokens" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "downloads_token_id_file_id_index" ON "downloads" USING btree ("token_id","file_id");--> statement-breakpoint
CREATE INDEX "order_events_order_id_created_at_index" ON "order_events" USING btree ("order_id","created_at");--> statement-breakpoint
CREATE INDEX "order_items_order_id_index" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "order_items_product_id_index" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "orders_email_index" ON "orders" USING btree ("email");--> statement-breakpoint
CREATE INDEX "orders_status_index" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_paid_at_index" ON "orders" USING btree ("paid_at");--> statement-breakpoint
CREATE INDEX "subscribers_created_at_index" ON "subscribers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "subscribers_source_index" ON "subscribers" USING btree ("source");--> statement-breakpoint
CREATE INDEX "subscribers_test_variant_index" ON "subscribers" USING btree ("test_variant");
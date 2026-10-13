CREATE TYPE "public"."analytics_event_type" AS ENUM('page_view', 'checkout', 'purchase');--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"type" "analytics_event_type" NOT NULL,
	"path" text NOT NULL,
	"product_slug" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"landing_path" text NOT NULL,
	"last_path" text NOT NULL,
	"referrer_host" text,
	"device" text,
	"country" text,
	"region" text,
	"city" text,
	"latitude" double precision,
	"longitude" double precision,
	"page_views" integer DEFAULT 0 NOT NULL,
	"checkout_at" timestamp with time zone,
	"purchased_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_session_id_analytics_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."analytics_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analytics_events_created_at_index" ON "analytics_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "analytics_events_session_id_index" ON "analytics_events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "analytics_events_type_created_at_index" ON "analytics_events" USING btree ("type","created_at");--> statement-breakpoint
CREATE INDEX "analytics_sessions_started_at_index" ON "analytics_sessions" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "analytics_sessions_last_seen_at_index" ON "analytics_sessions" USING btree ("last_seen_at");--> statement-breakpoint
CREATE INDEX "analytics_sessions_purchased_at_index" ON "analytics_sessions" USING btree ("purchased_at");
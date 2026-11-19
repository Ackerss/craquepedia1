CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"athlete_id" uuid,
	"user_id" uuid,
	"type" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "athletes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"status" text DEFAULT 'ativo' NOT NULL,
	"full_name" text NOT NULL,
	"nickname" text,
	"sport" text NOT NULL,
	"position" text,
	"birth_date" date,
	"gender" text,
	"nationality" text DEFAULT 'Brasileira',
	"second_nationality" text,
	"city" text,
	"state" text,
	"phone" text,
	"email" text,
	"instagram" text,
	"other_socials" text,
	"guardian_name" text,
	"guardian_phone" text,
	"height_cm" integer,
	"weight_kg" integer,
	"dominant_side" text,
	"current_club" text,
	"agent" text,
	"bio" text,
	"bio_short" text,
	"bio_en" text,
	"playing_style" text,
	"playing_style_en" text,
	"achievements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"career" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"stats" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sport_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"education" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"languages" text,
	"videos" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"photo_id" uuid,
	"cover_id" uuid,
	"accent" text DEFAULT '#10b981',
	"responsible_id" uuid,
	"source" text,
	"notes" text,
	"ai_score" integer,
	"ai_missing" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ai_tips" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"consent_at" timestamp with time zone,
	"public_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "athletes_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "deliverables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"athlete_id" uuid NOT NULL,
	"order_id" uuid,
	"service_key" text NOT NULL,
	"title" text NOT NULL,
	"stage" text DEFAULT 'a_fazer' NOT NULL,
	"assignee_id" uuid,
	"due_date" date,
	"delivered_at" timestamp with time zone,
	"link" text,
	"notes" text,
	"checklist" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"athlete_id" uuid,
	"kind" text DEFAULT 'gallery' NOT NULL,
	"name" text NOT NULL,
	"mime" text NOT NULL,
	"size" integer NOT NULL,
	"width" integer,
	"height" integer,
	"data" "bytea" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "intakes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"athlete_id" uuid,
	"client_name" text,
	"client_phone" text,
	"sport" text,
	"package_id" uuid,
	"status" text DEFAULT 'aberto' NOT NULL,
	"payload" jsonb,
	"photo_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone,
	CONSTRAINT "intakes_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"athlete_id" uuid NOT NULL,
	"package_id" uuid,
	"title" text NOT NULL,
	"total_cents" integer DEFAULT 0 NOT NULL,
	"paid_cents" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'aberto' NOT NULL,
	"payment_method" text,
	"due_date" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "packages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price_cents" integer DEFAULT 0 NOT NULL,
	"service_keys" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"highlight" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"amount_cents" integer NOT NULL,
	"method" text,
	"paid_at" date NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price_cents" integer DEFAULT 0 NOT NULL,
	"default_days" integer DEFAULT 7 NOT NULL,
	"icon" text DEFAULT 'FileText' NOT NULL,
	"automatic" boolean DEFAULT false NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "services_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"name" text NOT NULL,
	"password_hash" text NOT NULL,
	"color" text DEFAULT '#10b981' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_athlete_id_athletes_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_athlete_id_athletes_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deliverables" ADD CONSTRAINT "deliverables_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "files" ADD CONSTRAINT "files_athlete_id_athletes_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "intakes" ADD CONSTRAINT "intakes_athlete_id_athletes_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_athlete_id_athletes_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_created_idx" ON "activities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "athletes_status_idx" ON "athletes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "athletes_sport_idx" ON "athletes" USING btree ("sport");--> statement-breakpoint
CREATE INDEX "deliverables_athlete_idx" ON "deliverables" USING btree ("athlete_id");--> statement-breakpoint
CREATE INDEX "deliverables_stage_idx" ON "deliverables" USING btree ("stage");--> statement-breakpoint
CREATE INDEX "files_athlete_idx" ON "files" USING btree ("athlete_id");--> statement-breakpoint
CREATE INDEX "orders_athlete_idx" ON "orders" USING btree ("athlete_id");
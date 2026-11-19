CREATE TABLE "contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"organization" text,
	"kind" text DEFAULT 'clube' NOT NULL,
	"sports" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"country" text DEFAULT 'Brasil',
	"city" text,
	"email" text,
	"phone" text,
	"instagram" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outreach" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"athlete_id" uuid NOT NULL,
	"contact_id" uuid NOT NULL,
	"status" text DEFAULT 'enviado' NOT NULL,
	"channel" text DEFAULT 'whatsapp',
	"sent_at" date NOT NULL,
	"follow_up_at" date,
	"notes" text,
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "athletes" ADD COLUMN "portfolio_theme" text DEFAULT 'arena' NOT NULL;--> statement-breakpoint
ALTER TABLE "outreach" ADD CONSTRAINT "outreach_athlete_id_athletes_id_fk" FOREIGN KEY ("athlete_id") REFERENCES "public"."athletes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outreach" ADD CONSTRAINT "outreach_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contacts_kind_idx" ON "contacts" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "outreach_athlete_idx" ON "outreach" USING btree ("athlete_id");--> statement-breakpoint
CREATE INDEX "outreach_contact_idx" ON "outreach" USING btree ("contact_id");
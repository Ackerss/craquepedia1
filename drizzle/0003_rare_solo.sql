ALTER TABLE "athletes" ADD COLUMN "resume_template" text;--> statement-breakpoint
ALTER TABLE "intakes" ADD COLUMN "seen_at" timestamp with time zone;--> statement-breakpoint
UPDATE "intakes" SET "seen_at" = "submitted_at" WHERE "submitted_at" IS NOT NULL;--> statement-breakpoint
UPDATE "intakes" SET "status" = 'processado' WHERE "status" = 'recebido' AND "submitted_at" < now() - interval '1 hour';
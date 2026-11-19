ALTER TABLE "athletes" ADD COLUMN "ai_review" jsonb;--> statement-breakpoint
ALTER TABLE "athletes" ADD COLUMN "ai_reviewed_at" timestamp with time zone;
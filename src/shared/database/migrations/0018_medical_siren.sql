CREATE TYPE "public"."achievement_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TABLE "college_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"college_id" uuid NOT NULL,
	"student_name" varchar(255) NOT NULL,
	"exam" varchar(255) NOT NULL,
	"achievement" varchar(255) NOT NULL,
	"year" integer NOT NULL,
	"description" text,
	"image_storage_key" varchar(1024),
	"display_order" integer DEFAULT 0 NOT NULL,
	"status" "achievement_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "college_achievements" ADD CONSTRAINT "college_achievements_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_college_achievements_college_id" ON "college_achievements" USING btree ("college_id");
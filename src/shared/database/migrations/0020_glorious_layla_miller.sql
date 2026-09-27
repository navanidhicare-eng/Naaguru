CREATE TYPE "public"."accreditation_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TABLE "college_accreditations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"college_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"issuing_body" varchar(255) NOT NULL,
	"year" integer,
	"valid_until_year" integer,
	"description" text,
	"certificate_storage_key" varchar(1024),
	"verification_url" varchar(2048),
	"display_order" integer DEFAULT 0 NOT NULL,
	"status" "accreditation_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "college_accreditations" ADD CONSTRAINT "college_accreditations_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_college_accreditations_college_id" ON "college_accreditations" USING btree ("college_id");
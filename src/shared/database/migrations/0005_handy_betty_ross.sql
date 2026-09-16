CREATE TYPE "public"."branch_type" AS ENUM('MAIN_CAMPUS', 'OFF_CAMPUS');--> statement-breakpoint
CREATE TABLE "branches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"college_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"location_id" uuid,
	"address" text,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"contact_phone" varchar(50),
	"contact_email" varchar(255),
	"type" "branch_type" DEFAULT 'MAIN_CAMPUS' NOT NULL,
	"facilities" text,
	"routine" text,
	"is_publicly_eligible" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branches_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_branches_college_id" ON "branches" USING btree ("college_id");
--> statement-breakpoint
INSERT INTO "branches" (
  "college_id", "name", "address", "lat", "lng", 
  "contact_phone", "contact_email", "type", "is_publicly_eligible"
)
SELECT 
  "id", 'Main Campus', "address", "lat", "lng", 
  "contact_phone", "contact_email", 'MAIN_CAMPUS', false
FROM "colleges" c
WHERE NOT EXISTS (
  SELECT 1 FROM "branches" b WHERE b."college_id" = c."id" AND b."type" = 'MAIN_CAMPUS'
);
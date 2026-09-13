CREATE TYPE "public"."location_type" AS ENUM('STATE', 'DISTRICT', 'MANDAL', 'LOCALITY');--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_id" uuid,
	"type" "location_type" NOT NULL,
	"name_en" varchar(150) NOT NULL,
	"name_te" varchar(150) NOT NULL,
	"code" varchar(50),
	"status" "catalog_status" DEFAULT 'ACTIVE' NOT NULL,
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "schools" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location_id" uuid NOT NULL,
	"name_en" varchar(150) NOT NULL,
	"name_te" varchar(150) NOT NULL,
	"partnership_status" varchar(50),
	"status" "catalog_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "student_college_intents" ADD COLUMN "preferred_location_id" uuid;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "residence_location_id" uuid;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "school_id" uuid;--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "pincode" varchar(10);--> statement-breakpoint
ALTER TABLE "students" ADD COLUMN "landmark" varchar(255);--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_parent_id_locations_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "schools" ADD CONSTRAINT "schools_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_locations_parent_name_en" ON "locations" USING btree ("parent_id","name_en");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_locations_parent_name_te" ON "locations" USING btree ("parent_id","name_te");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_schools_location_name" ON "schools" USING btree ("location_id","name_en");--> statement-breakpoint
ALTER TABLE "student_college_intents" ADD CONSTRAINT "student_college_intents_preferred_location_id_locations_id_fk" FOREIGN KEY ("preferred_location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_residence_location_id_locations_id_fk" FOREIGN KEY ("residence_location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_school_id_schools_id_fk" FOREIGN KEY ("school_id") REFERENCES "public"."schools"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint

-- CUSTOM DATA MIGRATION --

-- 1. Insert STATES
INSERT INTO "locations" ("id", "type", "name_en", "name_te", "status")
SELECT gen_random_uuid(), 'STATE', state, state, 'ACTIVE'
FROM (SELECT DISTINCT "state" FROM "service_areas") AS states;
--> statement-breakpoint

-- 2. Insert DISTRICTS
INSERT INTO "locations" ("id", "parent_id", "type", "name_en", "name_te", "status")
SELECT gen_random_uuid(), l.id, 'DISTRICT', sa.district, sa.display_name_te, sa.status
FROM "service_areas" sa
JOIN "locations" l ON l.name_en = sa.state AND l.type = 'STATE';
--> statement-breakpoint

-- 3. Map intents
UPDATE "student_college_intents" sci
SET "preferred_location_id" = l.id
FROM "service_areas" sa
JOIN "locations" l ON l.name_en = sa.district AND l.type = 'DISTRICT'
WHERE sci.area_id = sa.id;
--> statement-breakpoint

-- 4. Map student profiles (best effort)
UPDATE "students" s
SET "residence_location_id" = l.id
FROM "locations" l
WHERE s.district = l.name_en AND l.type = 'DISTRICT';
--> statement-breakpoint

-- 5. Drop old columns and service_areas
ALTER TABLE "student_college_intents" DROP CONSTRAINT "student_college_intents_area_id_service_areas_id_fk";--> statement-breakpoint
ALTER TABLE "student_college_intents" DROP COLUMN "area_id";--> statement-breakpoint

ALTER TABLE "students" DROP COLUMN "state";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "district";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "city";--> statement-breakpoint

DROP TABLE "service_areas";
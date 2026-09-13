CREATE TYPE "public"."catalog_status" AS ENUM('ACTIVE', 'COMING_SOON', 'INACTIVE');--> statement-breakpoint
CREATE TABLE "student_college_intents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"version_number" integer NOT NULL,
	"pathway_code" varchar(30) NOT NULL,
	"program_code" varchar(30),
	"area_id" uuid,
	"requires_hostel" boolean DEFAULT false NOT NULL,
	"hostel_gender" varchar(10),
	"max_annual_fee" integer,
	"status" varchar(20) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "version_check" CHECK ("student_college_intents"."version_number" IN (1, 2)),
	CONSTRAINT "status_check" CHECK ("student_college_intents"."status" IN ('ACTIVE', 'SUPERSEDED')),
	CONSTRAINT "hostel_gender_check" CHECK ("student_college_intents"."hostel_gender" IS NULL OR "student_college_intents"."hostel_gender" IN ('BOYS', 'GIRLS')),
	CONSTRAINT "fee_check" CHECK ("student_college_intents"."max_annual_fee" IS NULL OR "student_college_intents"."max_annual_fee" >= 0)
);
--> statement-breakpoint
CREATE TABLE "education_pathways" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(30) NOT NULL,
	"name_en" varchar(100) NOT NULL,
	"name_te" varchar(100) NOT NULL,
	"icon" varchar(10),
	"display_order" integer DEFAULT 0 NOT NULL,
	"status" "catalog_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "education_pathways_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "education_programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pathway_id" uuid NOT NULL,
	"code" varchar(30) NOT NULL,
	"name_en" varchar(100) NOT NULL,
	"name_te" varchar(100) NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"status" "catalog_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_areas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"state" varchar(100) NOT NULL,
	"district" varchar(100) NOT NULL,
	"display_name_en" varchar(150) NOT NULL,
	"display_name_te" varchar(150) NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"status" "catalog_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "student_college_intents" ADD CONSTRAINT "student_college_intents_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_college_intents" ADD CONSTRAINT "student_college_intents_area_id_service_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "public"."service_areas"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "education_programs" ADD CONSTRAINT "education_programs_pathway_id_education_pathways_id_fk" FOREIGN KEY ("pathway_id") REFERENCES "public"."education_pathways"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_student_college_intents_student_version" ON "student_college_intents" USING btree ("student_id","version_number");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_student_college_intents_student_active" ON "student_college_intents" USING btree ("student_id") WHERE "student_college_intents"."status" = 'ACTIVE';--> statement-breakpoint
CREATE UNIQUE INDEX "idx_education_programs_pathway_code" ON "education_programs" USING btree ("pathway_id","code");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_service_areas_state_district" ON "service_areas" USING btree ("state","district");
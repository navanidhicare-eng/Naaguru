CREATE TYPE "public"."person_type" AS ENUM('STUDENT', 'PARENT', 'ALUMNI', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."testimonial_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TABLE "college_testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"college_id" uuid NOT NULL,
	"person_name" varchar(255) NOT NULL,
	"person_type" "person_type" NOT NULL,
	"testimonial_text" text NOT NULL,
	"image_storage_key" varchar(1024),
	"display_order" integer DEFAULT 0 NOT NULL,
	"status" "testimonial_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "college_testimonials" ADD CONSTRAINT "college_testimonials_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_college_testimonials_college_id" ON "college_testimonials" USING btree ("college_id");
CREATE TYPE "public"."media_status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('IMAGE', 'VIDEO', 'VIRTUAL_TOUR');--> statement-breakpoint
CREATE TABLE "college_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"college_id" uuid NOT NULL,
	"media_type" "media_type" NOT NULL,
	"storage_key" varchar(1024),
	"thumbnail_storage_key" varchar(1024),
	"external_url" varchar(1024),
	"caption" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_cover" boolean DEFAULT false NOT NULL,
	"status" "media_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "college_media" ADD CONSTRAINT "college_media_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_college_media_college_id" ON "college_media" USING btree ("college_id");
CREATE TYPE "public"."staff_role" AS ENUM('COLLEGE_ADMIN', 'COLLEGE_STAFF');--> statement-breakpoint
CREATE TYPE "public"."staff_status" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED');--> statement-breakpoint
CREATE TABLE "staff_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"college_id" uuid NOT NULL,
	"role" "staff_role" DEFAULT 'COLLEGE_ADMIN' NOT NULL,
	"status" "staff_status" DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "staff_memberships" ADD CONSTRAINT "staff_memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "staff_memberships" ADD CONSTRAINT "staff_memberships_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_staff_memberships_user_college" ON "staff_memberships" USING btree ("user_id","college_id");--> statement-breakpoint
CREATE INDEX "idx_staff_memberships_user_id" ON "staff_memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_staff_memberships_college_id" ON "staff_memberships" USING btree ("college_id");
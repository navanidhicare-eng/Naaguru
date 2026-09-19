CREATE TYPE "public"."admission_verification_status" AS ENUM('PENDING', 'VERIFIED', 'DISPUTED');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('NEW', 'CONTACTED', 'APPLICATION_STARTED', 'ADMITTED_REPORTED', 'LOST');--> statement-breakpoint
CREATE TABLE "admissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid,
	"student_id" uuid NOT NULL,
	"college_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"stream_code" varchar(50) NOT NULL,
	"academic_year" varchar(20) NOT NULL,
	"verification_status" "admission_verification_status" DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lead_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"old_status" "lead_status",
	"new_status" "lead_status" NOT NULL,
	"changed_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"college_id" uuid NOT NULL,
	"branch_id" uuid NOT NULL,
	"stream_code" varchar(50),
	"intent_id" uuid,
	"source" varchar(100) NOT NULL,
	"status" "lead_status" DEFAULT 'NEW' NOT NULL,
	"last_college_contacted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "colleges" ALTER COLUMN "state" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "colleges" ALTER COLUMN "district" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "colleges" ALTER COLUMN "city" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "colleges" ALTER COLUMN "address" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admissions" ADD CONSTRAINT "admissions_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_history" ADD CONSTRAINT "lead_history_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_history" ADD CONSTRAINT "lead_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_intent_id_student_college_intents_id_fk" FOREIGN KEY ("intent_id") REFERENCES "public"."student_college_intents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_admissions_student" ON "admissions" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_admissions_college" ON "admissions" USING btree ("college_id");--> statement-breakpoint
CREATE INDEX "idx_lead_history_lead" ON "lead_history" USING btree ("lead_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_leads_active_student_branch" ON "leads" USING btree ("student_id","branch_id") WHERE "leads"."status" != 'LOST';--> statement-breakpoint
CREATE INDEX "idx_leads_student" ON "leads" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "idx_leads_college" ON "leads" USING btree ("college_id");
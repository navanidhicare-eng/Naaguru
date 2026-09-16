ALTER TABLE "branches" ADD COLUMN "has_boys_hostel" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "has_girls_hostel" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "branches" ADD COLUMN "annual_hostel_fee" integer;--> statement-breakpoint
ALTER TABLE "branches" ADD CONSTRAINT "branch_hostel_fee_check" CHECK ("branches"."annual_hostel_fee" >= 0);
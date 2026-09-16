ALTER TABLE "colleges" DROP CONSTRAINT "hostel_fee_check";--> statement-breakpoint
ALTER TABLE "student_college_intents" DROP COLUMN "hostel_gender";--> statement-breakpoint
ALTER TABLE "colleges" DROP COLUMN "has_boys_hostel";--> statement-breakpoint
ALTER TABLE "colleges" DROP COLUMN "has_girls_hostel";--> statement-breakpoint
ALTER TABLE "colleges" DROP COLUMN "annual_hostel_fee";
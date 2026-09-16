ALTER TABLE "college_stream_offerings" DROP CONSTRAINT "tuition_fee_check";--> statement-breakpoint
ALTER TABLE "college_stream_offerings" DROP CONSTRAINT "college_stream_offerings_college_id_colleges_id_fk";
--> statement-breakpoint
DROP INDEX "idx_college_stream_unique";--> statement-breakpoint
ALTER TABLE "college_stream_offerings" ALTER COLUMN "branch_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "college_stream_offerings" ALTER COLUMN "min_fee" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "college_stream_offerings" ALTER COLUMN "max_fee" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_branch_stream_unique" ON "college_stream_offerings" USING btree ("branch_id","stream_code");--> statement-breakpoint
ALTER TABLE "college_stream_offerings" DROP COLUMN "college_id";--> statement-breakpoint
ALTER TABLE "college_stream_offerings" DROP COLUMN "tuition_fee";--> statement-breakpoint
ALTER TABLE "college_stream_offerings" ADD CONSTRAINT "min_fee_check" CHECK ("college_stream_offerings"."min_fee" >= 0);--> statement-breakpoint
ALTER TABLE "college_stream_offerings" ADD CONSTRAINT "max_fee_check" CHECK ("college_stream_offerings"."max_fee" >= "college_stream_offerings"."min_fee");
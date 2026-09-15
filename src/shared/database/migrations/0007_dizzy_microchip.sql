ALTER TABLE "college_stream_offerings" ADD COLUMN "branch_id" uuid;--> statement-breakpoint
ALTER TABLE "college_stream_offerings" ADD COLUMN "min_fee" integer;--> statement-breakpoint
ALTER TABLE "college_stream_offerings" ADD COLUMN "max_fee" integer;--> statement-breakpoint
ALTER TABLE "college_stream_offerings" ADD CONSTRAINT "college_stream_offerings_branch_id_branches_id_fk" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_offerings_branch_id" ON "college_stream_offerings" USING btree ("branch_id");
ALTER TABLE "college_leadership" DROP CONSTRAINT "college_leadership_college_id_colleges_id_fk";
--> statement-breakpoint
ALTER TABLE "college_leadership" ADD CONSTRAINT "college_leadership_college_id_colleges_id_fk" FOREIGN KEY ("college_id") REFERENCES "public"."colleges"("id") ON DELETE restrict ON UPDATE no action;
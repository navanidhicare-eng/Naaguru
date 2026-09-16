import 'dotenv/config';
import { db } from '../src/shared/database/db';
import { sql } from 'drizzle-orm';
async function run() {
  const [colleges] = await db.execute(sql`SELECT COUNT(*) FROM colleges`);
  const [branches] = await db.execute(sql`SELECT COUNT(*) FROM branches WHERE type = 'MAIN_CAMPUS'`);
  const [orphans] = await db.execute(sql`SELECT COUNT(*) FROM colleges c LEFT JOIN branches b ON c.id = b.college_id AND b.type = 'MAIN_CAMPUS' WHERE b.id IS NULL`);
  const [dupes] = await db.execute(sql`SELECT COUNT(*) FROM (SELECT college_id FROM branches WHERE type = 'MAIN_CAMPUS' GROUP BY college_id HAVING COUNT(*) > 1) d`);
  const [invalid] = await db.execute(sql`SELECT COUNT(*) FROM branches b LEFT JOIN colleges c ON b.college_id = c.id WHERE c.id IS NULL`);
  const [eligible] = await db.execute(sql`SELECT COUNT(*) FROM branches WHERE is_publicly_eligible = true`);
  console.log('Number of Colleges:', colleges.count);
  console.log('Number of Main Campus Branches:', branches.count);
  console.log('Colleges without Main Campus:', orphans.count);
  console.log('Duplicate Main Campus Branches:', dupes.count);
  console.log('Branches with Invalid College:', invalid.count);
  console.log('Branches isPubliclyEligible=true:', eligible.count);
  process.exit(0);
}
run();

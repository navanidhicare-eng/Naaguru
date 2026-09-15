import 'dotenv/config';
import { db } from '../src/shared/database/db';
import { sql } from 'drizzle-orm';

async function backfillHostels() {
  console.log('--- STARTING HOSTEL BACKFILL (C4) ---');
  
  const result = await db.execute(sql`
    UPDATE branches
    SET 
      has_boys_hostel = c.has_boys_hostel,
      has_girls_hostel = c.has_girls_hostel,
      annual_hostel_fee = c.annual_hostel_fee
    FROM colleges c
    WHERE branches.college_id = c.id
  `);
  
  console.log(`Backfill complete. Rows affected: ${(result as any).rowCount}`);
  process.exit(0);
}

backfillHostels().catch(err => {
  console.error('Failed to backfill hostels:', err);
  process.exit(1);
});

import 'dotenv/config';
import { db } from '../src/shared/database/db';
import { sql } from 'drizzle-orm';

async function auditC3() {
  console.log('=== DATA AUDIT: college_stream_offerings ===');

  // Count colleges and offerings
  const [counts] = await db.execute<{ numColleges: string, numOfferings: string }>(sql`
    SELECT 
      COUNT(DISTINCT college_id) as "numColleges",
      COUNT(*) as "numOfferings"
    FROM college_stream_offerings
  `);
  console.log(`Colleges with offerings: ${counts.numColleges}`);
  console.log(`Total offerings: ${counts.numOfferings}`);

  // Group by stream
  console.log('\n--- Grouped by Stream ---');
  const byStream = await db.execute<{ streamCode: string, count: string, minFee: number, maxFee: number }>(sql`
    SELECT 
      stream_code as "streamCode", 
      COUNT(*) as "count",
      MIN(tuition_fee) as "minFee",
      MAX(tuition_fee) as "maxFee"
    FROM college_stream_offerings
    GROUP BY stream_code
    ORDER BY count DESC
  `);
  for (const row of byStream) {
    console.log(`${row.streamCode}: ${row.count} offerings (Fee range: ₹${row.minFee} - ₹${row.maxFee})`);
  }

  // Null or invalid values
  console.log('\n--- Data Quality Issues ---');
  const [nullCheck] = await db.execute<{ badTuition: string, orphanOfferings: string }>(sql`
    SELECT
      COUNT(CASE WHEN tuition_fee IS NULL OR tuition_fee < 0 THEN 1 END) as "badTuition",
      COUNT(CASE WHEN NOT EXISTS (SELECT 1 FROM colleges c WHERE c.id = college_stream_offerings.college_id) THEN 1 END) as "orphanOfferings"
    FROM college_stream_offerings
  `);
  console.log(`Invalid tuition fees (null/<0): ${nullCheck.badTuition}`);
  console.log(`Orphan offerings (no valid college): ${nullCheck.orphanOfferings}`);

  // Check how offerings map to branches
  console.log('\n--- Branch Mapping Readiness ---');
  const branchMap = await db.execute<{ collegeName: string, numOfferings: string, numBranches: string, hasMainCampus: boolean }>(sql`
    SELECT
      c.name as "collegeName",
      COUNT(DISTINCT o.id) as "numOfferings",
      COUNT(DISTINCT b.id) as "numBranches",
      BOOL_OR(b.type = 'MAIN_CAMPUS') as "hasMainCampus"
    FROM colleges c
    LEFT JOIN college_stream_offerings o ON o.college_id = c.id
    LEFT JOIN branches b ON b.college_id = c.id
    WHERE o.id IS NOT NULL
    GROUP BY c.id, c.name
    ORDER BY c.name
  `);
  
  for (const row of branchMap) {
    console.log(`College: ${row.collegeName} | Offerings: ${row.numOfferings} | Branches: ${row.numBranches} (Has Main: ${row.hasMainCampus})`);
  }

  process.exit(0);
}

auditC3().catch(console.error);

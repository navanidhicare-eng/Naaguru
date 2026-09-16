import 'dotenv/config';
import { db } from '../src/shared/database/db';
import { eq, and, or, lte } from 'drizzle-orm';
import { collegesTable, branchesTable, collegeStreamOfferingsTable } from '../src/modules/college/infrastructure/schema';
import { CollegeModule } from '../src/modules/college';

async function audit() {
  console.log('--- C5 AUDIT SCRIPT ---');

  // Test 1: Cross-branch false positive test
  // Insert a dummy college with Branch A (Hostel, no MPC) and Branch B (No Hostel, MPC)
  console.log('\n[1] Current query evaluation...');
  const results = await CollegeModule.searchActiveColleges({
    streamCode: 'MPC',
    requiresBoysHostel: true
  });
  console.log('Results count:', results.length);
  results.forEach(r => {
    console.log(`- ${r.name} (BoysHostel: ${r.hostelSummary.hasBoysHostel}, Offerings: ${r.offerings.map(o => o.streamCode).join(', ')})`);
  });

  // Test 2: Examine SQL generated for searchActiveColleges
  // We can see that the where condition is applied to the main query which limits the joined rows.

  console.log('\n[2] Current Location Filtering...');
  // Notice that searchActiveVerified still accepts state, district, city and applies them to collegesTable.
  
  process.exit(0);
}

audit().catch(console.error);

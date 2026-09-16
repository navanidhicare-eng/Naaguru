import 'dotenv/config';
import { db } from '../src/shared/database/db';
import { sql } from 'drizzle-orm';

async function run() {
  // Get all colleges with their legacy location data
  const colleges = await db.execute(sql`
    SELECT c.id, c.name, c.state, c.district, c.city, c.address, c.lat, c.lng,
           b.id as branch_id, b.location_id, b.address as branch_address
    FROM colleges c
    LEFT JOIN branches b ON c.id = b.college_id AND b.type = 'MAIN_CAMPUS'
    ORDER BY c.name
  `);

  console.log('\n=== COLLEGE DATA ===');
  for (const c of colleges) {
    console.log(`\n${c.name}`);
    console.log(`  State: ${c.state}, District: ${c.district}, City: ${c.city}`);
    console.log(`  Address: ${c.address}`);
    console.log(`  Lat/Lng: ${c.lat}, ${c.lng}`);
    console.log(`  Branch ID: ${c.branch_id}`);
    console.log(`  Branch locationId: ${c.location_id}`);
  }

  // Get all canonical locations
  const locations = await db.execute(sql`
    SELECT id, type, name_en, name_te, parent_id, status
    FROM locations
    ORDER BY type, name_en
  `);

  console.log('\n=== CANONICAL LOCATIONS ===');
  for (const l of locations) {
    console.log(`[${l.type}] ${l.name_en} (${l.name_te}) — id: ${l.id}, parent: ${l.parent_id}, status: ${l.status}`);
  }

  process.exit(0);
}
run();

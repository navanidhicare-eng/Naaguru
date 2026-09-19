import { db } from '@/shared/database/db';
import { locationsTable } from '@/shared/catalog/infrastructure/schema';
import { eq, inArray } from 'drizzle-orm';

async function run() {
  const locs = await db.select().from(locationsTable).where(inArray(locationsTable.nameEn, ['Andhra Pradesh', 'Visakhapatnam', 'Anandapuram', 'Demo Locality A']));
  console.log(JSON.stringify(locs, null, 2));
  process.exit(0);
}
run();

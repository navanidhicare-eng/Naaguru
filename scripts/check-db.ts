import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { locationsTable } from '../src/shared/catalog/infrastructure/schema';
import { eq, and } from 'drizzle-orm';

async function check() {
  const sql = postgres(process.env.DATABASE_URL!, { max: 1 });
  const db = drizzle(sql);

  const districts = await db.select().from(locationsTable).where(eq(locationsTable.type, 'DISTRICT'));
  console.log('DISTRICTS:', districts.map(d => ({ id: d.id, name: d.nameEn })));

  const vizag = districts.find(d => d.nameEn === 'Visakhapatnam');
  if (vizag) {
    const mandals = await db.select().from(locationsTable).where(
      and(
        eq(locationsTable.type, 'MANDAL'),
        eq(locationsTable.parentId, vizag.id)
      )
    );
    console.log('MANDALS IN VIZAG:', mandals.map(m => ({ id: m.id, name: m.nameEn, parentId: m.parentId })));
  }

  await sql.end();
}

check();

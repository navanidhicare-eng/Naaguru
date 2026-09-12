import 'dotenv/config';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);

async function resetDb() {
  console.log('Dropping schema public...');
  await sql`DROP SCHEMA public CASCADE;`;
  console.log('Dropping schema drizzle...');
  await sql`DROP SCHEMA IF EXISTS drizzle CASCADE;`;
  console.log('Recreating schema public...');
  await sql`CREATE SCHEMA public;`;
  console.log('Done!');
  process.exit(0);
}

resetDb().catch((err) => {
  console.error(err);
  process.exit(1);
});

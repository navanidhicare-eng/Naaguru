import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

export async function setup() {
  const connectionString = process.env.TEST_DATABASE_URL;
  
  if (!connectionString) {
    throw new Error('TEST_DATABASE_URL is missing. The integration test setup must fail clearly without it. Do not fall back to DATABASE_URL.');
  }

  console.log('Running test database migrations against TEST_DATABASE_URL...');
  
  // Disable prepared statements to allow DDL over PgBouncer (transaction mode)
  const migrationClient = postgres(connectionString, { max: 1, prepare: false });
  const db = drizzle(migrationClient);

  try {
    await migrate(db, { migrationsFolder: 'src/shared/database/migrations' });
    console.log('Test database migrations completed successfully.');
  } catch (error) {
    console.error('Failed to run test database migrations:', error);
    throw error;
  } finally {
    await migrationClient.end();
  }
}


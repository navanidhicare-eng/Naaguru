import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || '';

if (!connectionString && process.env.npm_lifecycle_event !== 'build') {
  throw new Error('DATABASE_URL is not set in the environment variables.');
}

// In Next.js development, hot-reloading can exhaust database connections.
// We use a global singleton to preserve the connection across reloads.
const globalForPostgres = globalThis as unknown as {
  postgresClient: ReturnType<typeof postgres> | undefined;
};

const client = globalForPostgres.postgresClient ?? postgres(connectionString, { max: 10 });

if (process.env.NODE_ENV !== 'production') {
  globalForPostgres.postgresClient = client;
}

export const db = drizzle(client, { schema });

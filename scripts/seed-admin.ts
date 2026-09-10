import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { usersTable } from '../src/shared/auth/schema';
import { createHash } from 'crypto';

const hashValue = (val: string) => createHash('sha256').update(val).digest('hex');

async function seedAdmin() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set in the environment variables.');
    process.exit(1);
  }

  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  try {
    console.log('Seeding dummy admin user...');
    
    await db.insert(usersTable).values({
      email: 'psdgandepalli@gmail.com',
      passwordHash: hashValue('Psd@1986'),
      role: 'COLLEGE',
    }).onConflictDoNothing({ target: usersTable.email });

    console.log('✅ Dummy admin user created!');
    console.log('Email: psdgandepalli@gmail.com');
    console.log('Password: Psd@1986');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await sql.end();
  }
}

seedAdmin();

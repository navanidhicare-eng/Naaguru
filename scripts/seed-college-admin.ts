import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { usersTable } from '../src/shared/auth/schema';
import { collegesTable, staffMembershipsTable } from '../src/modules/college/infrastructure/schema';
import { createHash } from 'crypto';
import { eq } from 'drizzle-orm';

const hashValue = (val: string) => createHash('sha256').update(val).digest('hex');

async function seedCollegeAdmin() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set in the environment variables.');
    process.exit(1);
  }

  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  try {
    console.log('Seeding College Admin User...');
    
    const email = 'admin@srichaitanya.dev';
    const password = 'Password@123';

    const [user] = await db.insert(usersTable).values({
      email,
      passwordHash: hashValue(password),
      role: 'COLLEGE',
    }).onConflictDoUpdate({
      target: usersTable.email,
      set: { role: 'COLLEGE' }
    }).returning();

    console.log(`✅ College admin user created: ${user.id}`);

    // Fetch Sri Chaitanya College
    const collegeList = await db.select().from(collegesTable).where(eq(collegesTable.shortName, 'Sri Chaitanya'));
    const college = collegeList[0];

    if (!college) {
      console.error('❌ Sri Chaitanya college not found. Please run seed-colleges-dev.ts first.');
      process.exit(1);
    }

    console.log(`Found college: ${college.name} (${college.id})`);

    // Assign staff membership
    await db.insert(staffMembershipsTable).values({
      userId: user.id,
      collegeId: college.id,
      role: 'COLLEGE_ADMIN',
      status: 'ACTIVE',
    }).onConflictDoNothing();

    console.log(`✅ Staff membership assigned to college!`);
    console.log('--------------------------------------------------');
    console.log('Login Details:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('--------------------------------------------------');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await sql.end();
  }
}

seedCollegeAdmin();

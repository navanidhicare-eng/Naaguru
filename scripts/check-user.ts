import { db } from '@/shared/database/db';
import { usersTable } from '@/shared/auth/schema';
import { eq } from 'drizzle-orm';
import { createHash } from 'crypto';

const hashValue = (val: string) => createHash('sha256').update(val).digest('hex');

async function check() {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, 'admin@srichaitanya.net'));
  if (!user) {
    console.log("User not found!");
  } else {
    console.log("User found:", user);
    console.log("Expected Hash for 'password123':", hashValue('password123'));
    console.log("Actual Hash:", user.passwordHash);
  }
  process.exit(0);
}
check();

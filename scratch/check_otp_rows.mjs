import { createHash } from 'crypto';
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.nndvljgupxoclyqayuxy:Naaguru%40123@aws-0-ap-south-1.pooler.supabase.com:6543/postgres';

function crackHash(targetHash) {
  for (let i = 100000; i <= 999999; i++) {
    const s = i.toString();
    if (createHash('sha256').update(s).digest('hex') === targetHash) return s;
  }
  return null;
}

async function run() {
  const sql = postgres(DATABASE_URL);
  const rows = await sql`SELECT * FROM otp_requests ORDER BY created_at DESC`;
  for (const r of rows) {
    console.log({
      id: r.id,
      phone: r.phone_number,
      attempts: r.attempts,
      code: crackHash(r.code_hash),
      createdAt: r.created_at,
      expiresAt: r.expires_at
    });
  }
  await sql.end();
}

run().catch(console.error);

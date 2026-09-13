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
  const phone = '9848006622';
  console.log('--- Step 1: Request OTP ---');
  const reqRes = await fetch('http://localhost:3000/api/v1/auth/request-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber: phone })
  });
  const reqData = await reqRes.json();
  console.log('request-otp status:', reqRes.status, reqData);

  const sql = postgres(DATABASE_URL);
  const rows = await sql`SELECT * FROM otp_requests WHERE phone_number = ${'+91' + phone}`;
  console.log('DB row found count:', rows.length);
  if (rows.length === 0) {
    await sql.end();
    return;
  }
  const row = rows[0];
  console.log('Row info:', { id: row.id, phone: row.phone_number, attempts: row.attempts, expires_at: row.expires_at, created_at: row.created_at });
  const code = crackHash(row.code_hash);
  console.log('Cracked code from code_hash:', code);

  console.log('--- Step 2: Verify OTP ---');
  const verRes = await fetch('http://localhost:3000/api/v1/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phoneNumber: phone,
      code: code,
      clientType: 'mobile'
    })
  });
  console.log('verify-otp status:', verRes.status);
  const verData = await verRes.json();
  console.log('verify-otp response body:', {
    hasAccessToken: !!verData.accessToken,
    hasRefreshToken: !!verData.refreshToken,
    error: verData.error
  });

  await sql.end();
}

run().catch(console.error);

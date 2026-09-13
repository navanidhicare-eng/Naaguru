import 'dotenv/config';
import * as jose from 'jose';

async function runTest() {
  const phone = '+919999999999';
  const baseUrl = 'http://localhost:3000/api/v1';
  
  const { db } = await import('../src/shared/database/db');
  const { usersTable } = await import('../src/shared/auth/schema');
  const { eq } = await import('drizzle-orm');

  let [user] = await db.select().from(usersTable).where(eq(usersTable.phoneNumber, phone));
  if (!user) {
    [user] = await db.insert(usersTable).values({ phoneNumber: phone, role: 'STUDENT' }).returning();
  }

  // Generate JWT manually to bypass server-only
  const secretStr = process.env.JWT_SECRET || 'naaguru_local_development_secret_key_12345';
  const secretKey = new TextEncoder().encode(secretStr);
  const accessToken = await new jose.SignJWT({ userId: user.id, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(secretKey);

  console.log('2. GET Catalog Pathways...');
  const pathwaysRes = await fetch(`${baseUrl}/catalog/pathways`);
  const pathwaysData = await pathwaysRes.json();
  console.log(`Pathways (${pathwaysRes.status}):`, JSON.stringify(pathwaysData, null, 2));

  console.log('3. GET Catalog Areas...');
  const areasRes = await fetch(`${baseUrl}/catalog/areas`);
  const areasData = await areasRes.json();
  console.log(`Areas (${areasRes.status}):`, JSON.stringify(areasData, null, 2));

  console.log('4. Submit Initial Intent...');
  const submitRes = await fetch(`${baseUrl}/students/me/college-intent`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}` 
    },
    body: JSON.stringify({
      pathwayCode: 'INTERMEDIATE',
      programCode: 'MPC',
      areaId: null,
      requiresHostel: false,
      hostelGender: null,
      maxAnnualFee: null,
    })
  });
  const submitData = await submitRes.json();
  console.log(`Submit Intent (${submitRes.status}):`, JSON.stringify(submitData, null, 2));

  console.log('5. Revise Intent...');
  const reviseRes = await fetch(`${baseUrl}/students/me/college-intent`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}` 
    },
    body: JSON.stringify({
      pathwayCode: 'INTERMEDIATE',
      programCode: 'BIPC',
      areaId: null,
      requiresHostel: true,
      hostelGender: 'BOYS',
      maxAnnualFee: 50000,
    })
  });
  const reviseData = await reviseRes.json();
  console.log(`Revise Intent (${reviseRes.status}):`, JSON.stringify(reviseData, null, 2));

  console.log('6. GET Current Intent...');
  const currentRes = await fetch(`${baseUrl}/students/me/college-intent`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  const currentData = await currentRes.json();
  console.log(`Current Intent (${currentRes.status}):`, JSON.stringify(currentData, null, 2));

  console.log('7. Try 3rd Revision (Should Fail)...');
  const failRes = await fetch(`${baseUrl}/students/me/college-intent`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}` 
    },
    body: JSON.stringify({
      pathwayCode: 'INTERMEDIATE',
      programCode: 'CEC',
      areaId: null,
      requiresHostel: false,
      hostelGender: null,
      maxAnnualFee: null,
    })
  });
  const failData = await failRes.json();
  console.log(`Third Revision (${failRes.status}):`, JSON.stringify(failData, null, 2));
}

runTest().catch(console.error);

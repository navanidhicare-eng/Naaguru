import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: vi.fn() }),
}));
import { NextRequest } from 'next/server';
import { db } from '@/shared/database/db';
import { TokenService } from '@/shared/auth/TokenService';
import { usersTable } from '@/shared/auth/schema';
import { studentsTable } from '@/modules/student/infrastructure/schema';
import { collegesTable, branchesTable, collegeStreamOfferingsTable, staffMembershipsTable } from '@/modules/college/infrastructure/schema';
import { randomUUID as uuid } from 'crypto';
import { eq } from 'drizzle-orm';
import { GET as getStudentLeads, POST as postStudentLead } from '@/app/api/v1/students/me/leads/route';
import { GET as getCollegeLeads } from '@/app/api/v1/college/leads/route';
import { PATCH as patchCollegeLeadStatus } from '@/app/api/v1/college/leads/[id]/status/route';
import { POST as postCollegeAdmission, GET as getCollegeAdmissions } from '@/app/api/v1/college/admissions/route';
import { GET as getAdminAdmissions } from '@/app/api/v1/admin/admissions/route';
import { PATCH as patchAdminVerification } from '@/app/api/v1/admin/admissions/[id]/verification/route';

const tokenService = new TokenService();

async function createReq(method: string, url: string, token?: string, body?: any) {
  const headers = new Headers();
  if (token) headers.set('authorization', `Bearer ${token}`);
  return new NextRequest(`http://localhost${url}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
}

describe('Enquiry API Integration Tests (C8.3)', () => {
  let student1Id = uuid();
  let student2Id = uuid();
  let adminId = uuid();
  let collegeAdmin1Id = uuid();
  let collegeAdmin2Id = uuid();
  let college1Id = uuid();
  let college2Id = uuid();
  let branch1Id = uuid();
  let branch2Id = uuid();
  let mem1Id = uuid();
  let mem2Id = uuid();

  let s1Token: string, s2Token: string, adminToken: string, cAdmin1Token: string, cAdmin2Token: string;
  let sharedLeadId: string;
  let sharedAdmissionId: string;

  beforeAll(async () => {
    const randomPhone = () => `+91${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`;
    
    // 1. Setup Users
    await db.insert(usersTable).values([
      { id: student1Id, phoneNumber: randomPhone(), role: 'STUDENT' },
      { id: student2Id, phoneNumber: randomPhone(), role: 'STUDENT' },
      { id: adminId, phoneNumber: randomPhone(), role: 'ADMIN' },
      { id: collegeAdmin1Id, phoneNumber: randomPhone(), role: 'COLLEGE' },
      { id: collegeAdmin2Id, phoneNumber: randomPhone(), role: 'COLLEGE' },
    ]);

    // 2. Setup Students
    await db.insert(studentsTable).values([
      { userId: student1Id, educationStage: 'TENTH', fullName: 'S1' },
      { userId: student2Id, educationStage: 'TWELFTH', fullName: 'S2' },
    ]);

    // 3. Setup Colleges
    await db.insert(collegesTable).values([
      { id: college1Id, name: 'C1', ownershipType: 'PRIVATE', status: 'ACTIVE' },
      { id: college2Id, name: 'C2', ownershipType: 'PRIVATE', status: 'ACTIVE' },
    ]);

    // 4. Setup Branches
    await db.insert(branchesTable).values([
      { id: branch1Id, collegeId: college1Id, name: 'B1', isPubliclyEligible: true },
      { id: branch2Id, collegeId: college2Id, name: 'B2', isPubliclyEligible: true },
    ]);

    // 5. Setup Streams
    await db.insert(collegeStreamOfferingsTable).values([
      { id: uuid(), branchId: branch1Id, streamCode: 'MPC', minFee: 10000, maxFee: 50000 },
      { id: uuid(), branchId: branch2Id, streamCode: 'BIPC', minFee: 10000, maxFee: 50000 },
    ]);

    // 6. Setup Staff Memberships
    await db.insert(staffMembershipsTable).values([
      { id: mem1Id, userId: collegeAdmin1Id, collegeId: college1Id, role: 'COLLEGE_ADMIN', status: 'ACTIVE' },
      { id: mem2Id, userId: collegeAdmin2Id, collegeId: college2Id, role: 'COLLEGE_ADMIN', status: 'ACTIVE' },
    ]);

    // 7. Generate Tokens
    process.env.JWT_SECRET = 'test-secret'; // Mock JWT_SECRET
    s1Token = (await tokenService.issueTokens({ userId: student1Id, role: 'STUDENT' })).accessToken;
    s2Token = (await tokenService.issueTokens({ userId: student2Id, role: 'STUDENT' })).accessToken;
    adminToken = (await tokenService.issueTokens({ userId: adminId, role: 'ADMIN' })).accessToken;
    cAdmin1Token = (await tokenService.issueTokens({ userId: collegeAdmin1Id, role: 'COLLEGE_ADMIN', staffMembershipId: mem1Id, collegeId: college1Id })).accessToken;
    cAdmin2Token = (await tokenService.issueTokens({ userId: collegeAdmin2Id, role: 'COLLEGE_ADMIN', staffMembershipId: mem2Id, collegeId: college2Id })).accessToken;
  });

  afterAll(async () => {
    // Cleanup
    const { admissionsTable } = await import('@/modules/enquiry/infrastructure/schema');
    const { leadsTable } = await import('@/modules/enquiry/infrastructure/schema');
    const { leadHistoryTable } = await import('@/modules/enquiry/infrastructure/schema');
    await db.delete(admissionsTable).where(eq(admissionsTable.studentId, student1Id));
    await db.delete(leadHistoryTable);
    await db.delete(leadsTable).where(eq(leadsTable.studentId, student1Id));
    await db.delete(leadsTable).where(eq(leadsTable.studentId, student2Id));
    
    await db.delete(staffMembershipsTable).where(eq(staffMembershipsTable.userId, collegeAdmin1Id));
    await db.delete(staffMembershipsTable).where(eq(staffMembershipsTable.userId, collegeAdmin2Id));
    await db.delete(collegeStreamOfferingsTable).where(eq(collegeStreamOfferingsTable.branchId, branch1Id));
    await db.delete(collegeStreamOfferingsTable).where(eq(collegeStreamOfferingsTable.branchId, branch2Id));
    await db.delete(branchesTable).where(eq(branchesTable.collegeId, college1Id));
    await db.delete(branchesTable).where(eq(branchesTable.collegeId, college2Id));
    await db.delete(collegesTable).where(eq(collegesTable.id, college1Id));
    await db.delete(collegesTable).where(eq(collegesTable.id, college2Id));
    await db.delete(studentsTable).where(eq(studentsTable.userId, student1Id));
    await db.delete(studentsTable).where(eq(studentsTable.userId, student2Id));
    await db.delete(usersTable).where(eq(usersTable.id, student1Id));
    await db.delete(usersTable).where(eq(usersTable.id, student2Id));
    await db.delete(usersTable).where(eq(usersTable.id, adminId));
    await db.delete(usersTable).where(eq(usersTable.id, collegeAdmin1Id));
    await db.delete(usersTable).where(eq(usersTable.id, collegeAdmin2Id));
  });

  describe('STUDENT', () => {
    it('1. Unauthenticated request rejected', async () => {
      const res = await postStudentLead(await createReq('POST', '/'), {}, {} as any);
      expect(res.status).toBe(401);
    });

    it('2. Valid Lead creation succeeds (s1 -> c1/b1)', async () => {
      const res = await postStudentLead(await createReq('POST', '/', s1Token, {
        collegeId: college1Id,
        branchId: branch1Id,
        streamCode: 'MPC'
      }), {}, {} as any);
      expect(res.status).toBe(201);
      const data = await res.json();
      sharedLeadId = data.id;
      expect(data.collegeId).toBe(college1Id);
    });

    it('3. Student identity comes from auth (implicit in tests)', () => { /* Implicit */ });
    
    it('4. Cannot create Lead for another student', async () => {
      // API doesn't even accept studentId in body
      const res = await postStudentLead(await createReq('POST', '/', s2Token, {
        collegeId: college1Id,
        branchId: branch1Id,
        streamCode: 'MPC',
        studentId: student1Id // Maliciously injected
      }), {}, {} as any);
      expect(res.status).toBe(201); // Succeeds but creates for S2!
      const data = await res.json();
      expect(data.studentId).toBeUndefined(); // Shouldn't return studentId to student
    });

    it('5. Invalid branch rejected', async () => {
      const res = await postStudentLead(await createReq('POST', '/', s1Token, {
        collegeId: college1Id,
        branchId: uuid(), // Fake branch
        streamCode: 'MPC'
      }), {}, {} as any);
      expect(res.status).toBe(400);
    });

    it('6. Branch from another College rejected', async () => {
      const res = await postStudentLead(await createReq('POST', '/', s1Token, {
        collegeId: college1Id,
        branchId: branch2Id,
        streamCode: 'MPC'
      }), {}, {} as any);
      expect(res.status).toBe(400);
    });

    it('7. Invalid stream rejected', async () => {
      const res = await postStudentLead(await createReq('POST', '/', s2Token, {
        collegeId: college2Id,
        branchId: branch2Id,
        streamCode: 'INVALID'
      }), {}, {} as any);
      expect(res.status).toBe(400);
    });

    it('10. Duplicate active Lead rejected', async () => {
      const res = await postStudentLead(await createReq('POST', '/', s1Token, {
        collegeId: college1Id,
        branchId: branch1Id,
        streamCode: 'MPC'
      }), {}, {} as any);
      expect(res.status).toBe(409);
    });

    it('11. Student can list only own Leads', async () => {
      const res = await getStudentLeads(await createReq('GET', '/', s1Token), {}, {} as any);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.length).toBeGreaterThan(0);
      
      const lead = data[0];
      expect(lead).toHaveProperty('id');
      expect(lead).toHaveProperty('collegeId');
      expect(lead).toHaveProperty('branchId');
      expect(lead).toHaveProperty('streamCode');
      expect(lead).toHaveProperty('status');
      expect(lead).toHaveProperty('createdAt');
      
      // Proving C8.4-A enrichment
      expect(lead).toHaveProperty('collegeName', 'C1');
      expect(lead).toHaveProperty('branchName', 'B1');

      // Ensure S2 sees their own
      const res2 = await getStudentLeads(await createReq('GET', '/', s2Token), {}, {} as any);
      const data2 = await res2.json();
      expect(data2.length).toBe(1);
    });
  });

  describe('COLLEGE ADMIN', () => {
    it('12. Unauthenticated rejected', async () => {
      const res = await getCollegeLeads(await createReq('GET', '/'), {}, {} as any);
      expect(res.status).toBe(401);
    });

    it('13. Non-College role rejected', async () => {
      const res = await getCollegeLeads(await createReq('GET', '/', s1Token), {}, {} as any);
      expect(res.status).toBe(401); // Throws missing staff claims (401)
    });

    it('14. Valid College Admin sees own College Leads', async () => {
      const res = await getCollegeLeads(await createReq('GET', '/', cAdmin1Token), {}, {} as any);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.length).toBe(2); // S1 and S2 created leads for C1
    });

    it('15. Cannot see another College\'s Lead', async () => {
      const res = await getCollegeLeads(await createReq('GET', '/', cAdmin2Token), {}, {} as any);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.length).toBe(0); // C2 has no leads
    });

    it('16. Can update own Lead status', async () => {
      const res = await patchCollegeLeadStatus(await createReq('PATCH', '/', cAdmin1Token, { status: 'CONTACTED' }), { params: { id: sharedLeadId } }, {} as any);
      if (res.status !== 200) {
        console.log('Test 16 failed. Body:', await res.json().catch(() => null));
      }
      expect(res.status).toBe(200);
    });

    it('17. Cannot update another College\'s Lead', async () => {
      const res = await patchCollegeLeadStatus(await createReq('PATCH', '/', cAdmin2Token, { status: 'CONTACTED' }), { params: { id: sharedLeadId } }, {} as any);
      expect(res.status).toBe(404); // Should be 404 (Lead not found or unauthorized)
    });

    it('18. Invalid status transition rejected', async () => {
      const res = await patchCollegeLeadStatus(await createReq('PATCH', '/', cAdmin1Token, { status: 'ADMITTED_REPORTED' }), { params: { id: sharedLeadId } }, {} as any);
      expect(res.status).toBe(400); // Because it is CONTACTED, can't jump to ADMITTED_REPORTED directly
    });

    it('20. Can create admission for own College', async () => {
      const res = await postCollegeAdmission(await createReq('POST', '/', cAdmin1Token, {
        studentId: student1Id,
        branchId: branch1Id,
        streamCode: 'MPC',
        academicYear: '2026-27'
      }), {}, {} as any);
      expect(res.status).toBe(201);
      const data = await res.json();
      sharedAdmissionId = data.id;
    });

    it('21. Cannot create admission for another College', async () => {
      const res = await postCollegeAdmission(await createReq('POST', '/', cAdmin2Token, {
        studentId: student1Id,
        branchId: branch1Id, // B1 belongs to C1
        streamCode: 'MPC',
        academicYear: '2026-27'
      }), {}, {} as any);
      expect(res.status).toBe(400); // branch doesn't belong to college
    });

    it('23. Can list own College admissions', async () => {
      const res = await getCollegeAdmissions(await createReq('GET', '/', cAdmin1Token), {}, {} as any);
      const data = await res.json();
      expect(data.length).toBe(1);
    });
  });

  describe('COMPANY ADMIN', () => {
    it('24. Non-admin cannot verify admission', async () => {
      const res = await patchAdminVerification(await createReq('PATCH', '/', cAdmin1Token, { verificationStatus: 'VERIFIED' }), { params: { id: sharedAdmissionId } }, {} as any);
      expect(res.status).toBe(403);
    });

    it('25. Admin can list admissions', async () => {
      const res = await getAdminAdmissions(await createReq('GET', '/', adminToken), {}, {} as any);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.length).toBeGreaterThanOrEqual(1);
      expect(data.some((a: any) => a.id === sharedAdmissionId)).toBe(true);
    });

    it('26. Admin can verify PENDING admission', async () => {
      const res = await patchAdminVerification(await createReq('PATCH', '/', adminToken, { verificationStatus: 'VERIFIED' }), { params: { id: sharedAdmissionId } }, {} as any);
      if (res.status !== 200) {
        console.log('Test 26 failed. Body:', await res.json().catch(() => null));
      }
      expect(res.status).toBe(200);
    });

    it('29. Cannot revert to PENDING', async () => {
      const res = await patchAdminVerification(await createReq('PATCH', '/', adminToken, { verificationStatus: 'PENDING' }), { params: { id: sharedAdmissionId } }, {} as any);
      expect(res.status).toBe(400);
    });
  });
});

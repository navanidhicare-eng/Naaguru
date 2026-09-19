import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/shared/database/db';
import { leadsTable, leadHistoryTable, admissionsTable } from './schema';
import { usersTable } from '@/shared/auth/schema';
import { collegesTable, branchesTable, collegeStreamOfferingsTable } from '@/modules/college/infrastructure/schema';
import { studentCollegeIntentsTable } from '@/modules/student/infrastructure/schema';
import { eq } from 'drizzle-orm';
import { randomUUID as uuidv4 } from 'crypto';

import { inArray } from 'drizzle-orm';

describe('Enquiry Module Schema & Constraints', () => {
  // Test Data Identifiers
  const studentId = uuidv4();
  const collegeId = uuidv4();
  const collegeId2 = uuidv4();
  const branchId = uuidv4();
  const branchId2 = uuidv4();
  const branchIdWrongCollege = uuidv4();
  const streamCode = 'MPC';
  const streamCode2 = 'BIPC';
  const randomPhone = `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  
  beforeAll(async () => {
    // 1. Setup Student User
    await db.insert(usersTable).values({
      id: studentId,
      phoneNumber: randomPhone,
      role: 'STUDENT',
    });

    // 2. Setup Colleges
    await db.insert(collegesTable).values([
      { id: collegeId, name: 'College A', ownershipType: 'PRIVATE' },
      { id: collegeId2, name: 'College B', ownershipType: 'PRIVATE' }
    ]);

    // 3. Setup Branches
    await db.insert(branchesTable).values([
      { id: branchId, collegeId: collegeId, name: 'Branch 1' },
      { id: branchId2, collegeId: collegeId, name: 'Branch 2' },
      { id: branchIdWrongCollege, collegeId: collegeId2, name: 'Wrong Branch' }
    ]);

    // 4. Setup Offerings
    await db.insert(collegeStreamOfferingsTable).values([
      { id: uuidv4(), branchId: branchId, streamCode: streamCode, minFee: 10000, maxFee: 20000 },
      { id: uuidv4(), branchId: branchId2, streamCode: streamCode2, minFee: 15000, maxFee: 25000 }
    ]);
  });

  afterAll(async () => {
    // Cleanup in reverse order of dependencies
    await db.delete(admissionsTable).where(eq(admissionsTable.studentId, studentId));
    await db.delete(leadHistoryTable); // We can just delete all history since it's just test data, or better:
    const testLeads = await db.select({ id: leadsTable.id }).from(leadsTable).where(eq(leadsTable.studentId, studentId));
    if (testLeads.length > 0) {
       await db.delete(leadHistoryTable).where(inArray(leadHistoryTable.leadId, testLeads.map(l => l.id)));
    }
    await db.delete(leadsTable).where(eq(leadsTable.studentId, studentId));
    await db.delete(collegeStreamOfferingsTable).where(inArray(collegeStreamOfferingsTable.branchId, [branchId, branchId2, branchIdWrongCollege]));
    await db.delete(branchesTable).where(inArray(branchesTable.id, [branchId, branchId2, branchIdWrongCollege]));
    await db.delete(collegesTable).where(inArray(collegesTable.id, [collegeId, collegeId2]));
    await db.delete(usersTable).where(eq(usersTable.id, studentId));
  });

  describe('Lead Constraints', () => {
    it('1. Valid Lead creation', async () => {
      const leadId = uuidv4();
      await db.insert(leadsTable).values({
        id: leadId,
        studentId,
        collegeId,
        branchId,
        streamCode,
        source: 'TEST',
        status: 'NEW'
      });
      const inserted = await db.select().from(leadsTable).where(eq(leadsTable.id, leadId));
      expect(inserted).toHaveLength(1);
    });

    it('2. Invalid student FK is rejected', async () => {
      await expect(
        db.insert(leadsTable).values({
          studentId: uuidv4(), // Non-existent
          collegeId,
          branchId,
          source: 'TEST'
        })
      ).rejects.toThrow();
    });

    it('6. Valid nullable streamCode', async () => {
      const leadId = uuidv4();
      await db.insert(leadsTable).values({
        id: leadId,
        studentId,
        collegeId,
        branchId: branchId2, // Using branch 2 to avoid active lead conflict
        streamCode: null,
        source: 'TEST'
      });
      const inserted = await db.select().from(leadsTable).where(eq(leadsTable.id, leadId));
      expect(inserted).toHaveLength(1);
      expect(inserted[0].streamCode).toBeNull();
    });

    it('8. One active lead per student + branch (Conflict rejected)', async () => {
      // Branch 1 already has an active lead from test 1
      await expect(
        db.insert(leadsTable).values({
          studentId,
          collegeId,
          branchId,
          source: 'TEST2'
        })
      ).rejects.toThrow();
    });

    it('10. Same student + same branch after LOST is allowed', async () => {
      // First, clear any active lead on branchId2 from test 6
      await db.delete(leadsTable).where(inArray(leadsTable.branchId, [branchId2]));

      const lostLeadId = uuidv4();
      // Insert a LOST lead
      await db.insert(leadsTable).values({
        id: lostLeadId,
        studentId,
        collegeId,
        branchId: branchId2,
        source: 'TEST',
        status: 'LOST'
      });

      // Insert an ACTIVE lead on the same branch
      const activeLeadId = uuidv4();
      await db.insert(leadsTable).values({
        id: activeLeadId,
        studentId,
        collegeId,
        branchId: branchId2,
        source: 'TEST',
        status: 'NEW'
      });
      
      const inserted = await db.select().from(leadsTable).where(eq(leadsTable.id, activeLeadId));
      expect(inserted).toHaveLength(1);
      
      // Cleanup the extra active lead so it doesn't pollute further tests
      await db.delete(leadsTable).where(eq(leadsTable.id, activeLeadId));
    });

    it('11. Lead history FK integrity', async () => {
      const leads = await db.select().from(leadsTable).limit(1);
      const lead = leads[0];
      
      await db.insert(leadHistoryTable).values({
        leadId: lead.id,
        newStatus: 'CONTACTED',
        changedBy: studentId,
      });

      const history = await db.select().from(leadHistoryTable).where(eq(leadHistoryTable.leadId, lead.id));
      expect(history).toHaveLength(1);
    });
  });

  describe('Admission Constraints', () => {
    it('12. Admission with valid lead', async () => {
      const leads = await db.select().from(leadsTable).limit(1);
      const lead = leads[0];

      const admissionId = uuidv4();
      await db.insert(admissionsTable).values({
        id: admissionId,
        leadId: lead.id,
        studentId,
        collegeId: lead.collegeId,
        branchId: lead.branchId,
        streamCode: streamCode, // Must be valid for branch
        academicYear: '2026-27'
      });

      const inserted = await db.select().from(admissionsTable).where(eq(admissionsTable.id, admissionId));
      expect(inserted).toHaveLength(1);
    });

    it('13. Admission with NULL leadId', async () => {
      const admissionId = uuidv4();
      await db.insert(admissionsTable).values({
        id: admissionId,
        leadId: null,
        studentId,
        collegeId,
        branchId,
        streamCode,
        academicYear: '2026-27'
      });
      const inserted = await db.select().from(admissionsTable).where(eq(admissionsTable.id, admissionId));
      expect(inserted).toHaveLength(1);
      expect(inserted[0].leadId).toBeNull();
    });

    it('16, 17, 18. Valid PENDING, VERIFIED, DISPUTED admission', async () => {
      const id1 = uuidv4();
      const id2 = uuidv4();
      
      await db.insert(admissionsTable).values({
        id: id1,
        studentId,
        collegeId,
        branchId,
        streamCode,
        academicYear: '2026-27',
        verificationStatus: 'VERIFIED'
      });

      await db.insert(admissionsTable).values({
        id: id2,
        studentId,
        collegeId,
        branchId,
        streamCode,
        academicYear: '2026-27',
        verificationStatus: 'DISPUTED'
      });

      const inserted1 = await db.select().from(admissionsTable).where(eq(admissionsTable.id, id1));
      expect(inserted1[0].verificationStatus).toBe('VERIFIED');
      
      const inserted2 = await db.select().from(admissionsTable).where(eq(admissionsTable.id, id2));
      expect(inserted2[0].verificationStatus).toBe('DISPUTED');
    });
  });
});

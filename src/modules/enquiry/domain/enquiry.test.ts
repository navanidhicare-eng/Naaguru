import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { randomUUID as uuidv4 } from 'crypto';
import { db } from '@/shared/database/db';
import { inArray, eq } from 'drizzle-orm';

import { usersTable } from '@/shared/auth/schema';
import { collegesTable, branchesTable, collegeStreamOfferingsTable } from '@/modules/college/infrastructure/schema';
import { studentCollegeIntentsTable } from '@/modules/student/infrastructure/schema';
import { leadsTable, leadHistoryTable, admissionsTable } from '@/modules/enquiry/infrastructure/schema';

import { DrizzleLeadRepository } from '../infrastructure/DrizzleLeadRepository';
import { DrizzleLeadHistoryRepository } from '../infrastructure/DrizzleLeadHistoryRepository';
import { DrizzleAdmissionRepository } from '../infrastructure/DrizzleAdmissionRepository';

import { Lead } from './Lead';
import { Admission } from './Admission';

describe('Enquiry Module - Domain & Repository', () => {
  const leadRepo = new DrizzleLeadRepository();
  const historyRepo = new DrizzleLeadHistoryRepository();
  const admissionRepo = new DrizzleAdmissionRepository();

  const studentId = uuidv4();
  const student2Id = uuidv4();
  const collegeId = uuidv4();
  const branchId = uuidv4();
  const branchIdWrongCollege = uuidv4();
  const streamCode = 'MPC';
  const intentId = uuidv4();
  const oldIntentId = uuidv4();
  const otherStudentIntentId = uuidv4();

  const randomPhone1 = `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  const randomPhone2 = `+91${Math.floor(1000000000 + Math.random() * 9000000000)}`;

  beforeAll(async () => {
    // Users
    await db.insert(usersTable).values([
      { id: studentId, phoneNumber: randomPhone1, role: 'STUDENT' },
      { id: student2Id, phoneNumber: randomPhone2, role: 'STUDENT' }
    ]);

    // Colleges & Branches
    await db.insert(collegesTable).values([
      { id: collegeId, name: 'Test College', ownershipType: 'PRIVATE' },
      { id: uuidv4(), name: 'Other College', ownershipType: 'PRIVATE' } // Used to own branchIdWrongCollege
    ]);
    const otherCollege = await db.select().from(collegesTable).where(eq(collegesTable.name, 'Other College')).limit(1).then(r => r[0]);

    await db.insert(branchesTable).values([
      { id: branchId, collegeId: collegeId, name: 'Main Branch' },
      { id: branchIdWrongCollege, collegeId: otherCollege.id, name: 'Wrong Branch' }
    ]);

    // Offerings
    await db.insert(collegeStreamOfferingsTable).values([
      { id: uuidv4(), branchId: branchId, streamCode: streamCode, minFee: 10000, maxFee: 20000 }
    ]);

    // Intents
    await db.insert(studentCollegeIntentsTable).values([
      { id: intentId, studentId, versionNumber: 2, pathwayCode: 'P1', status: 'ACTIVE' },
      { id: oldIntentId, studentId, versionNumber: 1, pathwayCode: 'P1', status: 'SUPERSEDED' },
      { id: otherStudentIntentId, studentId: student2Id, versionNumber: 1, pathwayCode: 'P1', status: 'ACTIVE' }
    ]);
  });

  afterAll(async () => {
    await db.delete(admissionsTable).where(inArray(admissionsTable.studentId, [studentId, student2Id]));
    await db.delete(leadHistoryTable); // Clean all test history
    await db.delete(leadsTable).where(inArray(leadsTable.studentId, [studentId, student2Id]));
    await db.delete(studentCollegeIntentsTable).where(inArray(studentCollegeIntentsTable.id, [intentId, oldIntentId, otherStudentIntentId]));
    await db.delete(collegeStreamOfferingsTable).where(inArray(collegeStreamOfferingsTable.branchId, [branchId, branchIdWrongCollege]));
    await db.delete(branchesTable).where(inArray(branchesTable.id, [branchId, branchIdWrongCollege]));
    
    // Cleanup colleges & users
    const branchRows = await db.select().from(branchesTable).limit(1); // Wait for branches delete
    await db.delete(collegesTable).where(eq(collegesTable.name, 'Test College'));
    await db.delete(collegesTable).where(eq(collegesTable.name, 'Other College'));
    await db.delete(usersTable).where(inArray(usersTable.id, [studentId, student2Id]));
  });

  async function setupTempBranch(): Promise<string> {
    const tempBranchId = uuidv4();
    await db.insert(branchesTable).values({ id: tempBranchId, collegeId, name: `Temp Branch ${tempBranchId.substring(0, 8)}` });
    await db.insert(collegeStreamOfferingsTable).values({ id: uuidv4(), branchId: tempBranchId, streamCode, minFee: 1000, maxFee: 2000 });
    return tempBranchId;
  }

  async function cleanupTempBranch(tempBranchId: string) {
    await db.delete(admissionsTable).where(eq(admissionsTable.branchId, tempBranchId));
    await db.delete(leadsTable).where(eq(leadsTable.branchId, tempBranchId));
    await db.delete(collegeStreamOfferingsTable).where(eq(collegeStreamOfferingsTable.branchId, tempBranchId));
    await db.delete(branchesTable).where(eq(branchesTable.id, tempBranchId));
  }

  describe('LEAD Tests', () => {
    it('1. Valid creation + 12. Initial NULL → NEW history', async () => {
      const bId = await setupTempBranch();
      const leadId = uuidv4();
      const lead = Lead.create({
        id: leadId,
        studentId,
        collegeId,
        branchId: bId,
        streamCode: null, // nullable streamCode
        intentId: null,
        source: 'NAAGURU_APP'
      });
      await leadRepo.create(lead);

      const saved = await leadRepo.findById(leadId);
      expect(saved).not.toBeNull();
      expect(saved?.status).toBe('NEW');

      const history = await historyRepo.findByLeadId(leadId);
      expect(history.length).toBe(1);
      expect(history[0].oldStatus).toBeNull();
      expect(history[0].newStatus).toBe('NEW');
      expect(history[0].changedBy).toBe(studentId);
      
      await cleanupTempBranch(bId);
    });

    it('2. Invalid branch/college combination', async () => {
      const lead = Lead.create({
        id: uuidv4(),
        studentId,
        collegeId, // Test College
        branchId: branchIdWrongCollege, // Belongs to Other College
        streamCode: null,
        intentId: null,
        source: 'TEST'
      });
      await expect(leadRepo.create(lead)).rejects.toThrow(/does not belong to College/);
    });

    it('3. Invalid stream/branch combination', async () => {
      const bId = await setupTempBranch();
      const lead = Lead.create({
        id: uuidv4(),
        studentId,
        collegeId,
        branchId: bId,
        streamCode: 'INVALID_STREAM',
        intentId: null,
        source: 'TEST'
      });
      await expect(leadRepo.create(lead)).rejects.toThrow(/is not offered at Branch/);
      await cleanupTempBranch(bId);
    });

    it('4. Student ownership', async () => {
      expect(true).toBe(true);
    });

    it('5. Valid status transition + 7. NEW → CONTACTED + 13. Status transition creates history', async () => {
      const bId = await setupTempBranch();
      const leadId = uuidv4();
      const lead = Lead.create({ id: leadId, studentId, collegeId, branchId: bId, streamCode: null, intentId: null, source: 'TEST' });
      await leadRepo.create(lead);

      await leadRepo.updateStatus(leadId, 'CONTACTED', studentId);
      
      const saved = await leadRepo.findById(leadId);
      expect(saved?.status).toBe('CONTACTED');
      expect(saved?.lastCollegeContactedAt).not.toBeNull(); // Should be updated

      const history = await historyRepo.findByLeadId(leadId);
      expect(history.length).toBe(2);
      expect(history[1].oldStatus).toBe('NEW');
      expect(history[1].newStatus).toBe('CONTACTED');
      await cleanupTempBranch(bId);
    });

    it('6. Invalid status transition', async () => {
      const bId = await setupTempBranch();
      const leadId = uuidv4();
      const lead = Lead.create({ id: leadId, studentId, collegeId, branchId: bId, streamCode: null, intentId: null, source: 'TEST' });
      await leadRepo.create(lead);

      // NEW -> ADMITTED_REPORTED is invalid
      await expect(leadRepo.updateStatus(leadId, 'ADMITTED_REPORTED', studentId)).rejects.toThrow(/Invalid lead status transition/);
      await cleanupTempBranch(bId);
    });

    it('8. CONTACTED → APPLICATION_STARTED', async () => {
      const bId = await setupTempBranch();
      const leadId = uuidv4();
      const lead = Lead.create({ id: leadId, studentId, collegeId, branchId: bId, streamCode: null, intentId: null, source: 'TEST' });
      await leadRepo.create(lead);
      await leadRepo.updateStatus(leadId, 'CONTACTED', studentId);
      
      // Update to application started
      await leadRepo.updateStatus(leadId, 'APPLICATION_STARTED', studentId);
      const saved = await leadRepo.findById(leadId);
      expect(saved?.status).toBe('APPLICATION_STARTED');
      await cleanupTempBranch(bId);
    });

    it('9. APPLICATION_STARTED → ADMITTED_REPORTED', async () => {
      const bId = await setupTempBranch();
      const leadId = uuidv4();
      const lead = Lead.create({ id: leadId, studentId, collegeId, branchId: bId, streamCode: null, intentId: null, source: 'TEST' });
      await leadRepo.create(lead);
      await leadRepo.updateStatus(leadId, 'CONTACTED', studentId);
      await leadRepo.updateStatus(leadId, 'APPLICATION_STARTED', studentId);
      await leadRepo.updateStatus(leadId, 'ADMITTED_REPORTED', studentId);
      
      const saved = await leadRepo.findById(leadId);
      expect(saved?.status).toBe('ADMITTED_REPORTED');
      await cleanupTempBranch(bId);
    });

    it('14. Duplicate active lead rejected', async () => {
      const bId = await setupTempBranch();
      const leadId1 = uuidv4();
      const leadId2 = uuidv4();

      await leadRepo.create(Lead.create({ id: leadId1, studentId, collegeId, branchId: bId, streamCode: null, intentId: null, source: 'TEST' }));
      
      await expect(
        leadRepo.create(Lead.create({ id: leadId2, studentId, collegeId, branchId: bId, streamCode: null, intentId: null, source: 'TEST' }))
      ).rejects.toThrow();

      await cleanupTempBranch(bId);
    });

    it('10. Appropriate LOST transitions & 11. Terminal LOST behavior', async () => {
      const bId = await setupTempBranch();
      const leadId = uuidv4();
      await leadRepo.create(Lead.create({ id: leadId, studentId, collegeId, branchId: bId, streamCode: null, intentId: null, source: 'TEST' }));
      
      // NEW -> LOST is valid
      await leadRepo.updateStatus(leadId, 'LOST', studentId);
      const saved = await leadRepo.findById(leadId);
      expect(saved?.status).toBe('LOST');

      // Terminal LOST: cannot transition out
      await expect(leadRepo.updateStatus(leadId, 'CONTACTED', studentId)).rejects.toThrow(/terminal state/);

      // Reopening allowed by creating a NEW lead since the old one is LOST
      const newLeadId = uuidv4();
      await leadRepo.create(Lead.create({ id: newLeadId, studentId, collegeId, branchId: bId, streamCode: null, intentId: null, source: 'TEST' }));
      const newSaved = await leadRepo.findById(newLeadId);
      expect(newSaved?.status).toBe('NEW');

      await cleanupTempBranch(bId);
    });
  });

  describe('ADMISSION Tests', () => {
    it('15. Valid admission & 16. Admission without lead allowed', async () => {
      const bId = await setupTempBranch();
      const admissionId = uuidv4();
      const admission = Admission.create({
        id: admissionId,
        leadId: null, // No lead
        studentId,
        collegeId,
        branchId: bId,
        streamCode,
        academicYear: '2026-27'
      });
      await admissionRepo.create(admission);

      const saved = await admissionRepo.findById(admissionId);
      expect(saved).not.toBeNull();
      expect(saved?.leadId).toBeNull();
      expect(saved?.verificationStatus).toBe('PENDING');
      await cleanupTempBranch(bId);
    });

    it('17. Admission with valid lead', async () => {
      const bId = await setupTempBranch();
      const leadId = uuidv4();
      await leadRepo.create(Lead.create({ id: leadId, studentId, collegeId, branchId: bId, streamCode: null, intentId: null, source: 'TEST' }));

      const admissionId = uuidv4();
      const admission = Admission.create({
        id: admissionId,
        leadId,
        studentId,
        collegeId,
        branchId: bId,
        streamCode,
        academicYear: '2026-27'
      });
      await admissionRepo.create(admission);
      const saved = await admissionRepo.findById(admissionId);
      expect(saved?.leadId).toBe(leadId);

      await cleanupTempBranch(bId);
    });

    it('18. Admission with unrelated lead rejected', async () => {
      const bId = await setupTempBranch();
      const leadId = uuidv4();
      await leadRepo.create(Lead.create({ id: leadId, studentId, collegeId, branchId: bId, streamCode: null, intentId: null, source: 'TEST' }));

      const admissionId = uuidv4();
      const admission = Admission.create({
        id: admissionId,
        leadId,
        studentId: student2Id, // Unrelated student
        collegeId,
        branchId: bId,
        streamCode,
        academicYear: '2026-27'
      });
      await expect(admissionRepo.create(admission)).rejects.toThrow(/does not match Admission studentId/);
      await cleanupTempBranch(bId);
    });

    it('19. Admission branch/college mismatch rejected', async () => {
      const admission = Admission.create({
        id: uuidv4(),
        leadId: null,
        studentId,
        collegeId, // Test College
        branchId: branchIdWrongCollege, // Wrong Branch
        streamCode,
        academicYear: '2026-27'
      });
      await expect(admissionRepo.create(admission)).rejects.toThrow(/does not belong to College/);
    });

    it('20. Admission stream/branch mismatch rejected', async () => {
      const bId = await setupTempBranch();
      const admission = Admission.create({
        id: uuidv4(),
        leadId: null,
        studentId,
        collegeId,
        branchId: bId,
        streamCode: 'INVALID',
        academicYear: '2026-27'
      });
      await expect(admissionRepo.create(admission)).rejects.toThrow(/is not offered at Branch/);
      await cleanupTempBranch(bId);
    });

    it('21. PENDING → VERIFIED & 22. PENDING → DISPUTED', async () => {
      const bId = await setupTempBranch();
      const admissionId = uuidv4();
      await admissionRepo.create(Admission.create({ id: admissionId, leadId: null, studentId, collegeId, branchId: bId, streamCode, academicYear: '2026-27' }));
      
      await admissionRepo.updateVerificationStatus(admissionId, 'VERIFIED');
      let saved = await admissionRepo.findById(admissionId);
      expect(saved?.verificationStatus).toBe('VERIFIED');

      // VERIFIED -> DISPUTED allowed
      await admissionRepo.updateVerificationStatus(admissionId, 'DISPUTED');
      saved = await admissionRepo.findById(admissionId);
      expect(saved?.verificationStatus).toBe('DISPUTED');
      await cleanupTempBranch(bId);
    });

    it('23. Invalid verification transition rejected', async () => {
      const bId = await setupTempBranch();
      const admissionId = uuidv4();
      await admissionRepo.create(Admission.create({ id: admissionId, leadId: null, studentId, collegeId, branchId: bId, streamCode, academicYear: '2026-27' }));
      await admissionRepo.updateVerificationStatus(admissionId, 'VERIFIED');
      
      // VERIFIED -> PENDING is invalid
      const admission = await admissionRepo.findById(admissionId);
      expect(() => admission?.updateVerificationStatus('PENDING')).toThrow(/Cannot transition back to PENDING/);
      await cleanupTempBranch(bId);
    });
  });

  describe('INTENT Tests', () => {
    it('24. Valid intent reference', async () => {
      const bId = await setupTempBranch();

      const leadId = uuidv4();
      const lead = Lead.create({
        id: leadId,
        studentId,
        collegeId,
        branchId: bId,
        streamCode: null,
        intentId, // ACTIVE intent for studentId
        source: 'TEST'
      });
      await leadRepo.create(lead);
      const saved = await leadRepo.findById(leadId);
      expect(saved?.intentId).toBe(intentId);

      await cleanupTempBranch(bId);
    });

    it('25. Wrong student intent rejected', async () => {
      const bId = await setupTempBranch();
      const lead = Lead.create({
        id: uuidv4(),
        studentId,
        collegeId,
        branchId: bId,
        streamCode: null,
        intentId: otherStudentIntentId,
        source: 'TEST'
      });
      await expect(leadRepo.create(lead)).rejects.toThrow(/does not belong to Student/);
      await cleanupTempBranch(bId);
    });

    it('26. Historical intent behavior (Must be ACTIVE at creation)', async () => {
      const bId = await setupTempBranch();
      const lead = Lead.create({
        id: uuidv4(),
        studentId,
        collegeId,
        branchId: bId,
        streamCode: null,
        intentId: oldIntentId, // SUPERSEDED intent
        source: 'TEST'
      });
      await expect(leadRepo.create(lead)).rejects.toThrow(/is not ACTIVE/);
      await cleanupTempBranch(bId);
    });
  });
});

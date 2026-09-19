import { eq, and } from 'drizzle-orm';
import { db } from '@/shared/database/db';
import { admissionsTable, leadsTable } from './schema';
import { branchesTable, collegeStreamOfferingsTable } from '@/modules/college/infrastructure/schema';
import { usersTable } from '@/shared/auth/schema';
import { Admission } from '../domain/Admission';
import { IAdmissionRepository } from '../domain/IAdmissionRepository';
import { AdmissionVerificationStatus } from '../domain/types';

export class DrizzleAdmissionRepository implements IAdmissionRepository {
  async create(admission: Admission): Promise<void> {
    const props = admission.toJSON();

    await db.transaction(async (tx) => {
      // 1. Enforce Student Integrity
      const student = await tx.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.id, props.studentId)).limit(1).then(res => res[0]);
      if (!student) throw new Error(`Student ${props.studentId} does not exist`);

      // 2. Enforce Branch-College Integrity
      const branch = await tx.select({ id: branchesTable.id, collegeId: branchesTable.collegeId })
        .from(branchesTable)
        .where(eq(branchesTable.id, props.branchId))
        .limit(1)
        .then(res => res[0]);

      if (!branch) {
        throw new Error(`Branch ${props.branchId} does not exist`);
      }
      if (branch.collegeId !== props.collegeId) {
        throw new Error(`Branch ${props.branchId} does not belong to College ${props.collegeId}`);
      }

      // 3. Enforce Stream-Branch Integrity
      const offering = await tx.select({ id: collegeStreamOfferingsTable.id })
        .from(collegeStreamOfferingsTable)
        .where(and(
          eq(collegeStreamOfferingsTable.branchId, props.branchId),
          eq(collegeStreamOfferingsTable.streamCode, props.streamCode)
        ))
        .limit(1)
        .then(res => res[0]);

      if (!offering) {
        throw new Error(`Stream ${props.streamCode} is not offered at Branch ${props.branchId}`);
      }

      // 4. Enforce Lead Integrity if leadId is provided
      if (props.leadId) {
        const lead = await tx.select({
          studentId: leadsTable.studentId,
          collegeId: leadsTable.collegeId,
          branchId: leadsTable.branchId,
          streamCode: leadsTable.streamCode
        })
          .from(leadsTable)
          .where(eq(leadsTable.id, props.leadId))
          .limit(1)
          .then(res => res[0]);

        if (!lead) {
          throw new Error(`Lead ${props.leadId} does not exist`);
        }
        if (lead.studentId !== props.studentId) {
          throw new Error(`Lead studentId ${lead.studentId} does not match Admission studentId ${props.studentId}`);
        }
        if (lead.collegeId !== props.collegeId) {
          throw new Error(`Lead collegeId ${lead.collegeId} does not match Admission collegeId ${props.collegeId}`);
        }
        if (lead.branchId !== props.branchId) {
          throw new Error(`Lead branchId ${lead.branchId} does not match Admission branchId ${props.branchId}`);
        }
        // If lead has a streamCode, admission streamCode must match it (or logically extend it, but here we enforce strict match)
        if (lead.streamCode && lead.streamCode !== props.streamCode) {
          throw new Error(`Lead streamCode ${lead.streamCode} does not match Admission streamCode ${props.streamCode}`);
        }
      }

      // 5. Create Admission
      await tx.insert(admissionsTable).values({
        id: props.id,
        leadId: props.leadId,
        studentId: props.studentId,
        collegeId: props.collegeId,
        branchId: props.branchId,
        streamCode: props.streamCode,
        academicYear: props.academicYear,
        verificationStatus: props.verificationStatus,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt
      });
    });
  }

  async findById(id: string): Promise<Admission | null> {
    const rows = await db.select()
      .from(admissionsTable)
      .where(eq(admissionsTable.id, id))
      .limit(1);

    if (rows.length === 0) return null;
    const row = rows[0];
    
    return Admission.restore({
      id: row.id,
      leadId: row.leadId,
      studentId: row.studentId,
      collegeId: row.collegeId,
      branchId: row.branchId,
      streamCode: row.streamCode,
      academicYear: row.academicYear,
      verificationStatus: row.verificationStatus as AdmissionVerificationStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    });
  }

  async findByLeadId(leadId: string): Promise<Admission[]> {
    const rows = await db.select()
      .from(admissionsTable)
      .where(eq(admissionsTable.leadId, leadId));
      
    return rows.map(row => Admission.restore({
      id: row.id,
      leadId: row.leadId,
      studentId: row.studentId,
      collegeId: row.collegeId,
      branchId: row.branchId,
      streamCode: row.streamCode,
      academicYear: row.academicYear,
      verificationStatus: row.verificationStatus as AdmissionVerificationStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
  }

  async updateVerificationStatus(admissionId: string, status: AdmissionVerificationStatus): Promise<void> {
    const rows = await db.select().from(admissionsTable).where(eq(admissionsTable.id, admissionId)).limit(1);
    if (rows.length === 0) {
      throw new Error(`Admission ${admissionId} not found`);
    }
    const row = rows[0];
    
    const admission = Admission.restore({
      id: row.id,
      leadId: row.leadId,
      studentId: row.studentId,
      collegeId: row.collegeId,
      branchId: row.branchId,
      streamCode: row.streamCode,
      academicYear: row.academicYear,
      verificationStatus: row.verificationStatus as AdmissionVerificationStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    });
    
    admission.updateVerificationStatus(status);
    const updatedProps = admission.toJSON();

    await db.update(admissionsTable)
      .set({
        verificationStatus: updatedProps.verificationStatus,
        updatedAt: updatedProps.updatedAt
      })
      .where(eq(admissionsTable.id, admissionId));
  }

  async listByStudent(studentId: string): Promise<Admission[]> {
    const rows = await db.select()
      .from(admissionsTable)
      .where(eq(admissionsTable.studentId, studentId));
      
    return rows.map(row => Admission.restore({
      id: row.id,
      leadId: row.leadId,
      studentId: row.studentId,
      collegeId: row.collegeId,
      branchId: row.branchId,
      streamCode: row.streamCode,
      academicYear: row.academicYear,
      verificationStatus: row.verificationStatus as AdmissionVerificationStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
  }

  async listByCollege(collegeId: string): Promise<Admission[]> {
    const rows = await db.select()
      .from(admissionsTable)
      .where(eq(admissionsTable.collegeId, collegeId));
      
    return rows.map(row => Admission.restore({
      id: row.id,
      leadId: row.leadId,
      studentId: row.studentId,
      collegeId: row.collegeId,
      branchId: row.branchId,
      streamCode: row.streamCode,
      academicYear: row.academicYear,
      verificationStatus: row.verificationStatus as AdmissionVerificationStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
  }

  async listAll(): Promise<Admission[]> {
    const rows = await db.select().from(admissionsTable);
      
    return rows.map(row => Admission.restore({
      id: row.id,
      leadId: row.leadId,
      studentId: row.studentId,
      collegeId: row.collegeId,
      branchId: row.branchId,
      streamCode: row.streamCode,
      academicYear: row.academicYear,
      verificationStatus: row.verificationStatus as AdmissionVerificationStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
  }
}

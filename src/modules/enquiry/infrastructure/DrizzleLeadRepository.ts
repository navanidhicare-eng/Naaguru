import { eq, and, ne } from 'drizzle-orm';
import { db } from '@/shared/database/db';
import { leadsTable, leadHistoryTable } from './schema';
import { branchesTable, collegeStreamOfferingsTable } from '@/modules/college/infrastructure/schema';
import { studentCollegeIntentsTable } from '@/modules/student/infrastructure/schema';
import { Lead } from '../domain/Lead';
import { ILeadRepository } from '../domain/ILeadRepository';
import { LeadStatus } from '../domain/types';

export class DrizzleLeadRepository implements ILeadRepository {
  async create(lead: Lead): Promise<void> {
    const props = lead.toJSON();

    await db.transaction(async (tx) => {
      // 1. Enforce Branch-College Integrity (C7 constraint)
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

      // 2. Enforce Stream-Branch Integrity if stream is provided
      if (props.streamCode) {
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
      }

      // 3. Enforce Intent Integrity if provided
      if (props.intentId) {
        const intent = await tx.select({ studentId: studentCollegeIntentsTable.studentId, status: studentCollegeIntentsTable.status })
          .from(studentCollegeIntentsTable)
          .where(eq(studentCollegeIntentsTable.id, props.intentId))
          .limit(1)
          .then(res => res[0]);

        if (!intent) {
          throw new Error(`Intent ${props.intentId} does not exist`);
        }
        if (intent.studentId !== props.studentId) {
          throw new Error(`Intent ${props.intentId} does not belong to Student ${props.studentId}`);
        }
        if (intent.status !== 'ACTIVE') {
          throw new Error(`Intent ${props.intentId} is not ACTIVE`);
        }
      }

      // 4. Create Lead
      await tx.insert(leadsTable).values({
        id: props.id,
        studentId: props.studentId,
        collegeId: props.collegeId,
        branchId: props.branchId,
        streamCode: props.streamCode,
        intentId: props.intentId,
        source: props.source,
        status: props.status,
        lastCollegeContactedAt: props.lastCollegeContactedAt,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt
      });

      // 5. Create initial history record (changedBy defaults to studentId on creation)
      await tx.insert(leadHistoryTable).values({
        leadId: props.id,
        oldStatus: null,
        newStatus: props.status,
        changedBy: props.studentId,
        createdAt: props.createdAt
      });
    });
  }

  async findById(id: string): Promise<Lead | null> {
    const rows = await db.select()
      .from(leadsTable)
      .where(eq(leadsTable.id, id))
      .limit(1);

    if (rows.length === 0) return null;
    const row = rows[0];
    
    return Lead.restore({
      id: row.id,
      studentId: row.studentId,
      collegeId: row.collegeId,
      branchId: row.branchId,
      streamCode: row.streamCode,
      intentId: row.intentId,
      source: row.source,
      status: row.status as LeadStatus,
      lastCollegeContactedAt: row.lastCollegeContactedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    });
  }

  async findActiveByStudentAndBranch(studentId: string, branchId: string): Promise<Lead | null> {
    const rows = await db.select()
      .from(leadsTable)
      .where(and(
        eq(leadsTable.studentId, studentId),
        eq(leadsTable.branchId, branchId),
        ne(leadsTable.status, 'LOST')
      ))
      .limit(1);

    if (rows.length === 0) return null;
    const row = rows[0];
    
    return Lead.restore({
      id: row.id,
      studentId: row.studentId,
      collegeId: row.collegeId,
      branchId: row.branchId,
      streamCode: row.streamCode,
      intentId: row.intentId,
      source: row.source,
      status: row.status as LeadStatus,
      lastCollegeContactedAt: row.lastCollegeContactedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    });
  }

  async updateStatus(leadId: string, newStatus: LeadStatus, changedBy: string): Promise<void> {
    await db.transaction(async (tx) => {
      const rows = await tx.select().from(leadsTable).where(eq(leadsTable.id, leadId)).limit(1);
      if (rows.length === 0) {
        throw new Error(`Lead ${leadId} not found`);
      }
      const row = rows[0];
      
      const lead = Lead.restore({
        id: row.id,
        studentId: row.studentId,
        collegeId: row.collegeId,
        branchId: row.branchId,
        streamCode: row.streamCode,
        intentId: row.intentId,
        source: row.source,
        status: row.status as LeadStatus,
        lastCollegeContactedAt: row.lastCollegeContactedAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      });
      
      const oldStatus = lead.status;
      lead.updateStatus(newStatus); // Validates transitions
      const updatedProps = lead.toJSON();

      await tx.update(leadsTable)
        .set({
          status: updatedProps.status,
          lastCollegeContactedAt: updatedProps.lastCollegeContactedAt,
          updatedAt: updatedProps.updatedAt
        })
        .where(eq(leadsTable.id, leadId));

      await tx.insert(leadHistoryTable).values({
        leadId: leadId,
        oldStatus: oldStatus,
        newStatus: newStatus,
        changedBy: changedBy,
        createdAt: updatedProps.updatedAt
      });
    });
  }

  async listByStudent(studentId: string): Promise<Lead[]> {
    const rows = await db.select()
      .from(leadsTable)
      .where(eq(leadsTable.studentId, studentId));
      
    return rows.map(row => Lead.restore({
      id: row.id,
      studentId: row.studentId,
      collegeId: row.collegeId,
      branchId: row.branchId,
      streamCode: row.streamCode,
      intentId: row.intentId,
      source: row.source,
      status: row.status as LeadStatus,
      lastCollegeContactedAt: row.lastCollegeContactedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
  }

  async listByCollege(collegeId: string): Promise<Lead[]> {
    const rows = await db.select()
      .from(leadsTable)
      .where(eq(leadsTable.collegeId, collegeId));
      
    return rows.map(row => Lead.restore({
      id: row.id,
      studentId: row.studentId,
      collegeId: row.collegeId,
      branchId: row.branchId,
      streamCode: row.streamCode,
      intentId: row.intentId,
      source: row.source,
      status: row.status as LeadStatus,
      lastCollegeContactedAt: row.lastCollegeContactedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
  }
}

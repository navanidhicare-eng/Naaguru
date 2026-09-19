import { eq } from 'drizzle-orm';
import { db } from '@/shared/database/db';
import { leadHistoryTable } from './schema';
import { LeadHistory } from '../domain/LeadHistory';
import { ILeadHistoryRepository } from '../domain/ILeadHistoryRepository';
import { LeadStatus } from '../domain/types';

export class DrizzleLeadHistoryRepository implements ILeadHistoryRepository {
  async findByLeadId(leadId: string): Promise<LeadHistory[]> {
    const rows = await db.select()
      .from(leadHistoryTable)
      .where(eq(leadHistoryTable.leadId, leadId))
      .orderBy(leadHistoryTable.createdAt);
      
    return rows.map(row => LeadHistory.restore({
      id: row.id,
      leadId: row.leadId,
      oldStatus: row.oldStatus as LeadStatus | null,
      newStatus: row.newStatus as LeadStatus,
      changedBy: row.changedBy,
      createdAt: row.createdAt
    }));
  }
}

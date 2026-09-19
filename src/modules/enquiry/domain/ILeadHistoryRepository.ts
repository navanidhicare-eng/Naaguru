import { LeadHistory } from './LeadHistory';

export interface ILeadHistoryRepository {
  /**
   * Retrieves the full history for a given lead.
   */
  findByLeadId(leadId: string): Promise<LeadHistory[]>;
}

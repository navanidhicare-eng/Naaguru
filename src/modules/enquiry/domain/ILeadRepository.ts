import { Lead } from './Lead';
import { LeadStatus } from './types';

export interface ILeadRepository {
  /**
   * Creates a new Lead and its initial LeadHistory atomically.
   */
  create(lead: Lead): Promise<void>;

  /**
   * Retrieves a Lead by its ID.
   */
  findById(id: string): Promise<Lead | null>;

  /**
   * Retrieves the currently active lead for a student at a specific branch, if any.
   */
  findActiveByStudentAndBranch(studentId: string, branchId: string): Promise<Lead | null>;

  /**
   * Updates a Lead's status and atomically creates a LeadHistory record.
   */
  updateStatus(leadId: string, newStatus: LeadStatus, changedBy: string): Promise<void>;

  /**
   * Retrieves all leads for a given student.
   */
  listByStudent(studentId: string): Promise<Lead[]>;

  /**
   * Retrieves all leads for a given college.
   */
  listByCollege(collegeId: string): Promise<Lead[]>;
}

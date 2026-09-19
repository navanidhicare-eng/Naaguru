import { Admission } from './Admission';
import { AdmissionVerificationStatus } from './types';

export interface IAdmissionRepository {
  /**
   * Creates a new Admission record.
   */
  create(admission: Admission): Promise<void>;

  /**
   * Retrieves an Admission by its ID.
   */
  findById(id: string): Promise<Admission | null>;

  /**
   * Retrieves admissions associated with a specific lead.
   */
  findByLeadId(leadId: string): Promise<Admission[]>;

  /**
   * Updates an admission's verification status.
   */
  updateVerificationStatus(admissionId: string, status: AdmissionVerificationStatus): Promise<void>;

  /**
   * Retrieves all admissions for a given student.
   */
  listByStudent(studentId: string): Promise<Admission[]>;

  /**
   * Retrieves all admissions for a given college.
   */
  listByCollege(collegeId: string): Promise<Admission[]>;

  /**
   * Retrieves all admissions across the platform.
   */
  listAll(): Promise<Admission[]>;
}

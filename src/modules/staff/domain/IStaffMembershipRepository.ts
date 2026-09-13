import { StaffMembership, StaffRole, StaffStatus } from '../domain/models';

export interface IStaffMembershipRepository {
  /**
   * Finds all ACTIVE memberships for a given user.
   * INACTIVE and SUSPENDED memberships are excluded.
   */
  findActiveByUserId(userId: string): Promise<StaffMembership[]>;

  /**
   * Finds the single membership for a user + college pair.
   * Returns null regardless of status. Callers must check status explicitly.
   */
  findByUserAndCollege(userId: string, collegeId: string): Promise<StaffMembership | null>;

  /**
   * Finds a single membership by its primary key.
   */
  findById(id: string): Promise<StaffMembership | null>;

  /**
   * Persists a new staff membership. Throws AppError on duplicate (user + college).
   */
  create(membership: StaffMembership): Promise<StaffMembership>;
}

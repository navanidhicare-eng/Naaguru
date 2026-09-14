import 'server-only';
import { IStaffMembershipRepository } from '../domain/IStaffMembershipRepository';
import { AppError } from '../../../shared/errors';
import { StaffAuthContext } from '../../../shared/auth/middleware';

/**
 * Narrowly scoped service responsible exclusively for authenticating and validating
 * that a StaffAuthContext corresponds to an existing, ACTIVE staff membership
 * in the database.
 *
 * This enforces zero-trust tenancy: we do not trust the JWT alone. We verify
 * the current authoritative state from the database.
 */
export class StaffAuthorizationService {
  constructor(private readonly membershipRepository: IStaffMembershipRepository) {}

  /**
   * Verifies that the claimed staff context perfectly matches an active database membership.
   * Throws an AppError (403 FORBIDDEN) if any validation fails.
   */
  async verifyContext(context: StaffAuthContext): Promise<void> {
    const membership = await this.membershipRepository.findById(context.staffMembershipId);

    if (!membership) {
      throw new AppError('Membership not found', 403, 'FORBIDDEN');
    }

    if (membership.userId !== context.userId) {
      throw new AppError('Membership belongs to another user', 403, 'FORBIDDEN');
    }

    if (membership.collegeId !== context.collegeId) {
      throw new AppError('Membership belongs to another college', 403, 'FORBIDDEN');
    }

    if (membership.role !== context.role) {
      throw new AppError('Token role differs from database membership role', 403, 'FORBIDDEN');
    }

    if (membership.status === 'INACTIVE') {
      throw new AppError('Membership is INACTIVE', 403, 'FORBIDDEN');
    }

    if (membership.status === 'SUSPENDED') {
      throw new AppError('Membership is SUSPENDED', 403, 'FORBIDDEN');
    }

    if (membership.status !== 'ACTIVE') {
      throw new AppError('Membership is not active', 403, 'FORBIDDEN');
    }
  }
}

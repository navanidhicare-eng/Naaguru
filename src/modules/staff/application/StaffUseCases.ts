import 'server-only';
import { randomUUID } from 'crypto';
import { IStaffMembershipRepository } from '../domain/IStaffMembershipRepository';
import { StaffMembership, StaffRole } from '../domain/models';
import { AppError } from '../../../shared/errors';
import { db } from '../../../shared/database/db';
import { usersTable } from '../../../shared/auth/schema';
import { collegesTable } from '../../college/infrastructure/schema';
import { eq } from 'drizzle-orm';

export interface LinkStaffToCollegeInput {
  userId: string;
  collegeId: string;
  role: StaffRole;
}

export interface StaffMembershipDto {
  id: string;
  userId: string;
  collegeId: string;
  role: StaffRole;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

export class StaffUseCases {
  constructor(private readonly membershipRepository: IStaffMembershipRepository) {}

  /**
   * Explicitly links an existing user (role=COLLEGE) to an existing college with a
   * specified institutional role (COLLEGE_ADMIN or COLLEGE_STAFF).
   *
   * Invariants:
   * - User must exist in the users table.
   * - User must have role=COLLEGE (institutional identity).
   * - College must exist in the colleges table.
   * - Role must be COLLEGE_ADMIN or COLLEGE_STAFF.
   * - The same user+college pair may not be linked twice.
   * - New memberships are created with status=ACTIVE.
   */
  async linkStaffToCollege(input: LinkStaffToCollegeInput): Promise<StaffMembershipDto> {
    const { userId, collegeId, role } = input;

    // 1. Validate role is a known staff role
    if (role !== 'COLLEGE_ADMIN' && role !== 'COLLEGE_STAFF') {
      throw new AppError(
        `Invalid staff role: "${role}". Must be COLLEGE_ADMIN or COLLEGE_STAFF.`,
        400,
        'INVALID_ROLE'
      );
    }

    // 2. Verify user exists and has the COLLEGE role
    const userRows = await db
      .select({ id: usersTable.id, role: usersTable.role })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (userRows.length === 0) {
      throw new AppError(`User not found: ${userId}`, 404, 'NOT_FOUND');
    }

    const user = userRows[0];
    if (user.role !== 'COLLEGE') {
      throw new AppError(
        `User "${userId}" has role="${user.role}" and cannot be linked as college staff. ` +
        `Only users with role=COLLEGE may be institutional staff members.`,
        422,
        'INVALID_USER_ROLE'
      );
    }

    // 3. Verify college exists
    const collegeRows = await db
      .select({ id: collegesTable.id })
      .from(collegesTable)
      .where(eq(collegesTable.id, collegeId))
      .limit(1);

    if (collegeRows.length === 0) {
      throw new AppError(`College not found: ${collegeId}`, 404, 'NOT_FOUND');
    }

    // 4. Create the membership (ACTIVE by default; repository handles duplicate rejection)
    const membership = StaffMembership.create({
      id: randomUUID(),
      userId,
      collegeId,
      role,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const saved = await this.membershipRepository.create(membership);
    return this.mapToDto(saved);
  }

  /**
   * Returns all ACTIVE staff memberships for a given user.
   * INACTIVE and SUSPENDED memberships are excluded.
   */
  async getActiveMembershipsForUser(userId: string): Promise<StaffMembershipDto[]> {
    const memberships = await this.membershipRepository.findActiveByUserId(userId);
    return memberships.map(this.mapToDto);
  }

  private mapToDto(membership: StaffMembership): StaffMembershipDto {
    return {
      id: membership.id,
      userId: membership.userId,
      collegeId: membership.collegeId,
      role: membership.role,
      status: membership.status,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };
  }
}

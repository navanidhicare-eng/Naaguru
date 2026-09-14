import 'server-only';
import { eq, and } from 'drizzle-orm';
import { db } from '../../../shared/database/db';
import { staffMembershipsTable } from '../../college/infrastructure/schema';
import { IStaffMembershipRepository } from '../domain/IStaffMembershipRepository';
import { StaffMembership } from '../domain/models';
import { AppError } from '../../../shared/errors';

export class DrizzleStaffMembershipRepository implements IStaffMembershipRepository {

  async findActiveByUserId(userId: string): Promise<StaffMembership[]> {
    const rows = await db
      .select()
      .from(staffMembershipsTable)
      .where(
        and(
          eq(staffMembershipsTable.userId, userId),
          eq(staffMembershipsTable.status, 'ACTIVE')
        )
      );

    return rows.map(this.mapToDomain);
  }

  async findByUserAndCollege(userId: string, collegeId: string): Promise<StaffMembership | null> {
    const rows = await db
      .select()
      .from(staffMembershipsTable)
      .where(
        and(
          eq(staffMembershipsTable.userId, userId),
          eq(staffMembershipsTable.collegeId, collegeId)
        )
      )
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapToDomain(rows[0]);
  }

  async findById(id: string): Promise<StaffMembership | null> {
    const rows = await db
      .select()
      .from(staffMembershipsTable)
      .where(eq(staffMembershipsTable.id, id))
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapToDomain(rows[0]);
  }

  async create(membership: StaffMembership): Promise<StaffMembership> {
    try {
      const [inserted] = await db
        .insert(staffMembershipsTable)
        .values({
          id: membership.id,
          userId: membership.userId,
          collegeId: membership.collegeId,
          role: membership.role,
          status: membership.status,
        })
        .returning();

      return this.mapToDomain(inserted);
    } catch (err: unknown) {
      // The unique index on (user_id, college_id) enforces no duplicate memberships.
      // We translate the DB constraint error into a domain-level AppError.
      if (
        err instanceof Error &&
        err.message.includes('idx_staff_memberships_user_college')
      ) {
        throw new AppError(
          'Staff membership already exists for this user and college',
          409,
          'DUPLICATE_MEMBERSHIP'
        );
      }
      throw err;
    }
  }

  private mapToDomain(row: typeof staffMembershipsTable.$inferSelect): StaffMembership {
    return StaffMembership.create({
      id: row.id,
      userId: row.userId,
      collegeId: row.collegeId,
      role: row.role,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}

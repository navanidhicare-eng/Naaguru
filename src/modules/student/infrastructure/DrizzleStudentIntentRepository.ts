import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../../shared/database/db';
import { studentCollegeIntentsTable } from './schema';
import { usersTable } from '../../../shared/auth/schema';
import { IStudentIntentRepository } from '../domain/IStudentIntentRepository';
import { StudentCollegeIntent } from '../domain/StudentCollegeIntent';
import { AppError } from '../../../shared/errors';

export class DrizzleStudentIntentRepository implements IStudentIntentRepository {
  
  async getCurrentIntent(studentId: string): Promise<StudentCollegeIntent | null> {
    const rows = await db
      .select()
      .from(studentCollegeIntentsTable)
      .where(
        and(
          eq(studentCollegeIntentsTable.studentId, studentId),
          eq(studentCollegeIntentsTable.status, 'ACTIVE')
        )
      )
      .limit(1);

    if (rows.length === 0) return null;
    return this.mapToDomain(rows[0]);
  }

  async submitInitialIntent(
    studentId: string, 
    intentData: Omit<StudentCollegeIntent['props'], 'id' | 'versionNumber' | 'status' | 'studentId'>
  ): Promise<StudentCollegeIntent> {
    return await db.transaction(async (tx) => {
      // 1. Lock the user row to serialize initial submissions for this student
      const userRows = await tx
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(eq(usersTable.id, studentId))
        .for('update');
        
      if (userRows.length === 0) {
        throw new AppError('Student not found', 404, 'NOT_FOUND');
      }

      // 2. Check if an intent already exists
      const existing = await tx
        .select()
        .from(studentCollegeIntentsTable)
        .where(eq(studentCollegeIntentsTable.studentId, studentId))
        .limit(1);

      if (existing.length > 0) {
        throw new AppError('Intent already exists. Use revise endpoint.', 400, 'BAD_REQUEST');
      }

      // 3. Insert version 1
      const [inserted] = await tx.insert(studentCollegeIntentsTable)
        .values({
          studentId,
          versionNumber: 1,
          status: 'ACTIVE',
          pathwayCode: intentData.pathwayCode,
          programCode: intentData.programCode,
          preferredLocationId: intentData.preferredLocationId,
          requiresHostel: intentData.requiresHostel,
          hostelGender: intentData.hostelGender,
          maxAnnualFee: intentData.maxAnnualFee,
        })
        .returning();

      return this.mapToDomain(inserted);
    });
  }

  async reviseIntent(
    studentId: string, 
    intentData: Omit<StudentCollegeIntent['props'], 'id' | 'versionNumber' | 'status' | 'studentId'>
  ): Promise<StudentCollegeIntent> {
    return await db.transaction(async (tx) => {
      // 1. Lock existing intent rows to serialize revisions
      const existingIntents = await tx
        .select()
        .from(studentCollegeIntentsTable)
        .where(eq(studentCollegeIntentsTable.studentId, studentId))
        .orderBy(desc(studentCollegeIntentsTable.versionNumber))
        .for('update'); // Row-level lock

      if (existingIntents.length === 0) {
        throw new AppError('No active intent to revise. Submit initial intent first.', 400, 'BAD_REQUEST');
      }

      const latestIntent = existingIntents[0];

      if (latestIntent.versionNumber >= 2) {
        throw new AppError('Maximum self-service revisions reached (limit: 2).', 403, 'FORBIDDEN');
      }

      // 2. Supersede the active version
      await tx.update(studentCollegeIntentsTable)
        .set({ status: 'SUPERSEDED' })
        .where(eq(studentCollegeIntentsTable.id, latestIntent.id));

      // 3. Insert version 2
      const [inserted] = await tx.insert(studentCollegeIntentsTable)
        .values({
          studentId,
          versionNumber: latestIntent.versionNumber + 1,
          status: 'ACTIVE',
          pathwayCode: intentData.pathwayCode,
          programCode: intentData.programCode,
          preferredLocationId: intentData.preferredLocationId,
          requiresHostel: intentData.requiresHostel,
          hostelGender: intentData.hostelGender,
          maxAnnualFee: intentData.maxAnnualFee,
        })
        .returning();

      return this.mapToDomain(inserted);
    });
  }

  private mapToDomain(row: any): StudentCollegeIntent {
    return StudentCollegeIntent.create({
      id: row.id,
      studentId: row.studentId,
      versionNumber: row.versionNumber,
      pathwayCode: row.pathwayCode,
      programCode: row.programCode,
      preferredLocationId: row.preferredLocationId,
      requiresHostel: row.requiresHostel,
      hostelGender: row.hostelGender as 'BOYS' | 'GIRLS' | null,
      maxAnnualFee: row.maxAnnualFee,
      status: row.status as 'ACTIVE' | 'SUPERSEDED',
    });
  }
}

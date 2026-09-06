import { db } from '@/shared/database/db';
import { eq } from 'drizzle-orm';
import { IStudentRepository } from '../domain/IStudentRepository';
import { Student } from '../domain/Student';
import { studentsTable } from './schema';

export class DrizzleStudentRepository implements IStudentRepository {
  async findByUserId(userId: string): Promise<Student | null> {
    const [record] = await db.select().from(studentsTable).where(eq(studentsTable.userId, userId));
    
    if (!record) {
      return null;
    }

    return Student.create({
      userId: record.userId,
      fullName: record.fullName,
      educationStage: record.educationStage,
      board: record.board,
      state: record.state,
      district: record.district,
      city: record.city,
      latitude: record.latitude ? Number(record.latitude) : null,
      longitude: record.longitude ? Number(record.longitude) : null,
      guardianName: record.guardianName,
      guardianPhone: record.guardianPhone,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  async create(student: Student): Promise<void> {
    await db.insert(studentsTable).values({
      userId: student.userId,
      fullName: student.fullName,
      educationStage: student.educationStage,
      board: student.board,
      state: student.state,
      district: student.district,
      city: student.city,
      latitude: student.latitude ? student.latitude.toString() : null,
      longitude: student.longitude ? student.longitude.toString() : null,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    });
  }

  async update(student: Student): Promise<void> {
    await db.update(studentsTable).set({
      fullName: student.fullName,
      educationStage: student.educationStage,
      board: student.board,
      state: student.state,
      district: student.district,
      city: student.city,
      latitude: student.latitude ? student.latitude.toString() : null,
      longitude: student.longitude ? student.longitude.toString() : null,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      updatedAt: student.updatedAt,
    }).where(eq(studentsTable.userId, student.userId));
  }
}

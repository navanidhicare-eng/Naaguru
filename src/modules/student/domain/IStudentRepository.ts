import { Student } from './Student';

export interface IStudentRepository {
  findByUserId(userId: string): Promise<Student | null>;
  create(student: Student): Promise<void>;
  update(student: Student): Promise<void>;
}

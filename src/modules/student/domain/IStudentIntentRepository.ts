import { StudentCollegeIntent } from './StudentCollegeIntent';

export interface IStudentIntentRepository {
  getCurrentIntent(studentId: string): Promise<StudentCollegeIntent | null>;
  submitInitialIntent(studentId: string, intent: Omit<StudentCollegeIntent['props'], 'id' | 'versionNumber' | 'status' | 'studentId'>): Promise<StudentCollegeIntent>;
  reviseIntent(studentId: string, intent: Omit<StudentCollegeIntent['props'], 'id' | 'versionNumber' | 'status' | 'studentId'>): Promise<StudentCollegeIntent>;
}

import { DrizzleStudentRepository } from '../infrastructure/DrizzleStudentRepository';
import { StudentUseCases } from '../application/useCases/StudentUseCases';
import { DrizzleStudentIntentRepository } from '../infrastructure/DrizzleStudentIntentRepository';
import { StudentIntentUseCases } from '../application/useCases/StudentIntentUseCases';
import { CreateStudentProfileDto, StudentProfileDto, UpdateStudentProfileDto } from '../application/dtos';

// Initialize the student module internal dependencies
const studentRepository = new DrizzleStudentRepository();
const internalUseCases = new StudentUseCases(studentRepository);
const intentRepository = new DrizzleStudentIntentRepository();
const intentUseCases = new StudentIntentUseCases(intentRepository);

/**
 * PUBLIC MODULE CONTRACT
 * Other modules (and API controllers) should only interact with the Student module
 * through this narrowly scoped public interface.
 */
export const StudentModule = {
  getStudentProfile: (userId: string): Promise<StudentProfileDto> => {
    return internalUseCases.getMyProfile(userId);
  },
  
  createStudentProfile: (dto: CreateStudentProfileDto): Promise<StudentProfileDto> => {
    return internalUseCases.createMyProfile(dto);
  },

  updateStudentProfile: (userId: string, dto: UpdateStudentProfileDto): Promise<StudentProfileDto> => {
    return internalUseCases.updateMyProfile(userId, dto);
  },

  // Intent operations
  getCurrentIntent: (studentId: string) =>
    intentUseCases.getCurrentIntent(studentId),
  submitInitialIntent: (studentId: string, data: any) =>
    intentUseCases.submitInitialIntent(studentId, data),
  reviseIntent: (studentId: string, data: any) =>
    intentUseCases.reviseIntent(studentId, data)
};

// Export types/DTOs for cross-module usage
export * from '../application/dtos';

import { DrizzleAssessmentRepository } from '../infrastructure/DrizzleAssessmentRepository';
import { AssessmentUseCases } from '../application/useCases/AssessmentUseCases';
import { AssessmentVersionDto, AssessmentAttemptDto, AssessmentResultDto } from '../application/dtos';

const assessmentRepository = new DrizzleAssessmentRepository();
const internalUseCases = new AssessmentUseCases(assessmentRepository);

export const AssessmentModule = {
  getActiveAssessment: (): Promise<AssessmentVersionDto> => {
    return internalUseCases.getActiveAssessment();
  },

  startOrResumeAttempt: (studentId: string): Promise<AssessmentAttemptDto> => {
    return internalUseCases.startOrResumeAttempt(studentId);
  },

  saveAnswer: (studentId: string, questionId: string, optionId: string): Promise<AssessmentAttemptDto> => {
    return internalUseCases.saveAnswer(studentId, questionId, optionId);
  },

  submitAttempt: (studentId: string): Promise<AssessmentResultDto> => {
    return internalUseCases.submitAttempt(studentId);
  },

  getMyLatestResult: (studentId: string): Promise<AssessmentResultDto> => {
    return internalUseCases.getMyLatestResult(studentId);
  },
};

export * from '../application/dtos';

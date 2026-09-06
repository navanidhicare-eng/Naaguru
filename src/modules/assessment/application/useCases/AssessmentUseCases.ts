import { AppError } from '../../../../shared/errors';
import { IAssessmentRepository } from '../../domain/IAssessmentRepository';
import { AssessmentAttempt } from '../../domain/AssessmentAttempt';
import { ScoringEngine } from '../../domain/ScoringEngine';
import { AssessmentVersionDto, AssessmentAttemptDto, AssessmentResultDto } from '../dtos';

export class AssessmentUseCases {
  constructor(private readonly assessmentRepository: IAssessmentRepository) {}

  async getActiveAssessment(): Promise<AssessmentVersionDto> {
    const version = await this.assessmentRepository.getActiveVersion();
    if (!version) {
      throw new AppError('No active assessment version available', 404);
    }
    return {
      id: version.id,
      questions: version.questions.map(q => ({
        id: q.id,
        sequence: q.sequence,
        textEn: q.textEn,
        textTe: q.textTe,
        options: q.options.map(o => ({
          id: o.id,
          textEn: o.textEn,
          textTe: o.textTe,
        })),
      })),
    };
  }

  async startOrResumeAttempt(studentId: string): Promise<AssessmentAttemptDto> {
    let attempt = await this.assessmentRepository.getActiveAttempt(studentId);
    
    if (!attempt) {
      const activeVersion = await this.assessmentRepository.getActiveVersion();
      if (!activeVersion) {
        throw new AppError('No active assessment version available', 404);
      }
      
      attempt = AssessmentAttempt.create({
        id: crypto.randomUUID(),
        versionId: activeVersion.id,
        studentId,
        state: 'IN_PROGRESS',
        createdAt: new Date().toISOString(),
        completedAt: null,
        answers: [],
        dimensionScores: null,
      });

      await this.assessmentRepository.saveAttempt(attempt);
    }

    return this.toAttemptDto(attempt);
  }

  async saveAnswer(studentId: string, questionId: string, optionId: string): Promise<AssessmentAttemptDto> {
    const attempt = await this.assessmentRepository.getActiveAttempt(studentId);
    if (!attempt) {
      throw new AppError('No active attempt found', 404);
    }

    // Validate against version
    const version = await this.assessmentRepository.getVersionById(attempt.versionId);
    if (!version) {
      throw new AppError('Attempt version not found', 404);
    }

    const question = version.questions.find(q => q.id === questionId);
    if (!question) {
      throw new AppError('Question not found in assessment', 400);
    }

    const option = question.options.find(o => o.id === optionId);
    if (!option) {
      throw new AppError('Option not found in question', 400);
    }

    attempt.saveAnswer(questionId, optionId);
    await this.assessmentRepository.saveAttempt(attempt);

    return this.toAttemptDto(attempt);
  }

  async submitAttempt(studentId: string): Promise<AssessmentResultDto> {
    const attempt = await this.assessmentRepository.getActiveAttempt(studentId);
    if (!attempt) {
      throw new AppError('No active attempt found', 404);
    }

    const version = await this.assessmentRepository.getVersionById(attempt.versionId);
    if (!version) {
      throw new AppError('Attempt version not found', 404);
    }

    const scores = ScoringEngine.calculateScores(attempt, version);
    attempt.markCompleted(scores);

    await this.assessmentRepository.saveAttempt(attempt);

    return {
      attemptId: attempt.id,
      dimensionScores: attempt.dimensionScores!,
    };
  }

  async getMyLatestResult(studentId: string): Promise<AssessmentResultDto> {
    const attempt = await this.assessmentRepository.getLatestCompletedAttempt(studentId);
    if (!attempt) {
      throw new AppError('No completed assessment found', 404);
    }
    return {
      attemptId: attempt.id,
      dimensionScores: attempt.dimensionScores!,
    };
  }

  private toAttemptDto(attempt: AssessmentAttempt): AssessmentAttemptDto {
    return {
      id: attempt.id,
      versionId: attempt.versionId,
      state: attempt.state,
      answers: attempt.answers.map(a => ({
        questionId: a.questionId,
        selectedOptionId: a.selectedOptionId,
      })),
    };
  }
}

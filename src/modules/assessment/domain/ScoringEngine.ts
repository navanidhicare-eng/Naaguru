import { AppError } from '../../../shared/errors';
import { AssessmentAttempt } from './AssessmentAttempt';
import { AssessmentVersion } from './AssessmentVersion';

export class ScoringEngine {
  static calculateScores(attempt: AssessmentAttempt, version: AssessmentVersion): Record<string, number> {
    if (attempt.versionId !== version.id) {
      throw new AppError('Attempt version mismatch', 400);
    }

    // Verify all required questions are answered
    if (attempt.answers.length !== version.questions.length) {
      throw new AppError('All questions must be answered to submit', 422);
    }

    const dimensionScores: Record<string, number> = {};

    for (const answer of attempt.answers) {
      const question = version.questions.find(q => q.id === answer.questionId);
      if (!question) {
        throw new AppError(`Question ${answer.questionId} not found in version`, 400);
      }

      const option = question.options.find(o => o.id === answer.selectedOptionId);
      if (!option) {
        throw new AppError(`Option ${answer.selectedOptionId} not found for question ${answer.questionId}`, 400);
      }

      // Sum the weights for this option
      for (const [dimensionId, weight] of Object.entries(option.weights)) {
        dimensionScores[dimensionId] = (dimensionScores[dimensionId] || 0) + weight;
      }
    }

    return dimensionScores;
  }
}

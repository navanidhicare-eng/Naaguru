import { AppError } from '../../../shared/errors';
import { AssessmentAttempt } from './AssessmentAttempt';
import { AssessmentVersion } from './AssessmentVersion';

export interface ScoringResult {
  rawResponses: Array<{ questionId: string; selectedOptionId: string; value: number }>;
  rawScores: Record<string, number>;
  pompScores: Record<string, number>;
}

export class ScoringEngine {
  static calculateScores(attempt: AssessmentAttempt, version: AssessmentVersion): ScoringResult {
    if (attempt.versionId !== version.id) {
      throw new AppError('Attempt version mismatch', 400);
    }

    // Verify all required questions are answered
    if (attempt.answers.length !== version.questions.length) {
      throw new AppError('All questions must be answered to submit', 422);
    }

    const rawResponses: ScoringResult['rawResponses'] = [];
    
    const rawScores: Record<string, number> = {};
    const minScores: Record<string, number> = {};
    const maxScores: Record<string, number> = {};
    
    // Initialize standard constructs
    for (const construct of ['ISI', 'QCR', 'TMD', 'CEE', 'SHC', 'CEA']) {
      rawScores[construct] = 0;
      minScores[construct] = 0;
      maxScores[construct] = 0;
    }

    for (const question of version.questions) {
      if (question.type === 'SCORED') {
        const construct = question.construct;
        if (rawScores[construct] === undefined) {
          rawScores[construct] = 0;
          minScores[construct] = 0;
          maxScores[construct] = 0;
        }

        const values = question.options.map(o => o.value);
        minScores[construct] += Math.min(...values);
        maxScores[construct] += Math.max(...values);
      }
    }

    for (const answer of attempt.answers) {
      const question = version.questions.find(q => q.id === answer.questionId);
      if (!question) {
        throw new AppError(`Question ${answer.questionId} not found in version`, 400);
      }

      const option = question.options.find(o => o.id === answer.selectedOptionId);
      if (!option) {
        throw new AppError(`Option ${answer.selectedOptionId} not found for question ${answer.questionId}`, 400);
      }

      // Record snapshot
      rawResponses.push({
        questionId: question.id,
        selectedOptionId: option.id,
        value: option.value,
      });

      // Sum values for scored constructs
      if (question.type === 'SCORED') {
        rawScores[question.construct] += option.value;
      }
    }

    const pompScores: Record<string, number> = {};

    // Calculate POMP
    // POMP_k = ((R_k - Min) / (Max - Min)) * 100
    for (const [construct, score] of Object.entries(rawScores)) {
      const min = minScores[construct] || 0;
      const max = maxScores[construct] || 0;
      const range = max - min;
      
      if (range > 0) {
        pompScores[construct] = ((score - min) / range) * 100;
      } else {
        pompScores[construct] = 0; // Fallback if no questions for this construct
      }
    }

    return { rawResponses, rawScores, pompScores };
  }
}

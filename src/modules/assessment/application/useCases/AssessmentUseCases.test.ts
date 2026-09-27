import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssessmentUseCases, IRulesetProvider } from './AssessmentUseCases';
import { IAssessmentRepository } from '../../domain/IAssessmentRepository';
import { AssessmentVersion, Question, QuestionOption } from '../../domain/AssessmentVersion';
import { AssessmentAttempt } from '../../domain/AssessmentAttempt';
import { AppError } from '../../../../shared/errors';

describe('AssessmentUseCases', () => {
  let repository: IAssessmentRepository;
  let rulesetProvider: IRulesetProvider;
  let useCases: AssessmentUseCases;

  const createMockQuestion = (seq: number): Question => {
    const qId = `q-${seq}`;
    return Question.create({
      id: qId,
      construct: 'ISI',
      type: 'SCORED',
      sequence: seq,
      textEn: `Question ${seq}`,
      textTe: `ప్రశ్న ${seq}`,
      options: [
        QuestionOption.create({
          id: `opt-${seq}-1`,
          questionId: qId,
          textEn: 'Like',
          textTe: 'ఇష్టం',
          value: 5,
        }),
        QuestionOption.create({
          id: `opt-${seq}-2`,
          questionId: qId,
          textEn: 'Dislike',
          textTe: 'ఇష్టం లేదు',
          value: 1,
        }),
      ],
    });
  };

  // Build a standard 40-question version
  const mock40Questions: Question[] = Array.from({ length: 40 }, (_, i) => createMockQuestion(i + 1));

  const mockVersion = AssessmentVersion.create({
    id: 'ver-40',
    status: 'PUBLISHED',
    createdAt: new Date().toISOString(),
    questions: mock40Questions,
  });

  beforeEach(() => {
    repository = {
      getActiveVersion: vi.fn().mockResolvedValue(mockVersion),
      getVersionById: vi.fn().mockResolvedValue(mockVersion),
      getActiveAttempt: vi.fn().mockResolvedValue(null),
      getAttemptById: vi.fn().mockResolvedValue(null),
      getLatestCompletedAttempt: vi.fn().mockResolvedValue(null),
      saveAttempt: vi.fn().mockResolvedValue(undefined),
    };

    rulesetProvider = {
      getActiveRulesetId: vi.fn().mockResolvedValue('ruleset-v1'),
    };

    useCases = new AssessmentUseCases(repository, rulesetProvider);
  });

  describe('saveAnswer', () => {
    it('throws 404 and does NOT create an attempt if no active attempt exists', async () => {
      vi.mocked(repository.getActiveAttempt).mockResolvedValue(null);

      await expect(
        useCases.saveAnswer('student-1', 'q-1', 'opt-1-1')
      ).rejects.toThrow(new AppError('No active attempt found', 404));

      expect(repository.saveAttempt).not.toHaveBeenCalled();
    });

    it('saves the answer to the active attempt and persists it', async () => {
      const activeAttempt = AssessmentAttempt.create({
        id: 'attempt-1',
        versionId: 'ver-40',
        studentId: 'student-1',
        state: 'IN_PROGRESS',
        createdAt: new Date().toISOString(),
        completedAt: null,
        answers: [],
        scoringVersionId: null,
        rawResponsesJsonb: null,
        constructRawScoresJsonb: null,
        dimensionScores: null,
      });

      vi.mocked(repository.getActiveAttempt).mockResolvedValue(activeAttempt);

      const result = await useCases.saveAnswer('student-1', 'q-1', 'opt-1-1');

      expect(result.answers).toHaveLength(1);
      expect(result.answers[0]).toEqual({
        questionId: 'q-1',
        selectedOptionId: 'opt-1-1',
      });
      expect(repository.saveAttempt).toHaveBeenCalledWith(activeAttempt);
    });
  });

  describe('submitAttempt', () => {
    it('rejects with 422 when 39 of 40 questions are answered, without performing completion scoring', async () => {
      // 39 answers out of 40 (missing question 40)
      const answers39 = Array.from({ length: 39 }, (_, i) => ({
        questionId: `q-${i + 1}`,
        selectedOptionId: `opt-${i + 1}-1`,
      }));

      const incompleteAttempt = AssessmentAttempt.create({
        id: 'attempt-incomplete',
        versionId: 'ver-40',
        studentId: 'student-1',
        state: 'IN_PROGRESS',
        createdAt: new Date().toISOString(),
        completedAt: null,
        answers: answers39,
        scoringVersionId: null,
        rawResponsesJsonb: null,
        constructRawScoresJsonb: null,
        dimensionScores: null,
      });

      vi.mocked(repository.getActiveAttempt).mockResolvedValue(incompleteAttempt);

      await expect(useCases.submitAttempt('student-1')).rejects.toThrow(
        new AppError('All questions must be answered to submit', 422)
      );

      expect(incompleteAttempt.state).toBe('IN_PROGRESS');
      expect(incompleteAttempt.isCompleted).toBe(false);
      expect(repository.saveAttempt).not.toHaveBeenCalled();
    });

    it('succeeds and calculates dimension scores when all 40 questions are answered', async () => {
      // Complete 40 answers
      const answers40 = Array.from({ length: 40 }, (_, i) => ({
        questionId: `q-${i + 1}`,
        selectedOptionId: `opt-${i + 1}-1`,
      }));

      const completeAttempt = AssessmentAttempt.create({
        id: 'attempt-complete',
        versionId: 'ver-40',
        studentId: 'student-1',
        state: 'IN_PROGRESS',
        createdAt: new Date().toISOString(),
        completedAt: null,
        answers: answers40,
        scoringVersionId: null,
        rawResponsesJsonb: null,
        constructRawScoresJsonb: null,
        dimensionScores: null,
      });

      vi.mocked(repository.getActiveAttempt).mockResolvedValue(completeAttempt);

      const result = await useCases.submitAttempt('student-1');

      expect(result.attemptId).toBe('attempt-complete');
      expect(result.dimensionScores).toBeDefined();
      expect(completeAttempt.state).toBe('COMPLETED');
      expect(completeAttempt.isCompleted).toBe(true);
      expect(completeAttempt.props.completedAt).not.toBeNull();
      expect(repository.saveAttempt).toHaveBeenCalledWith(completeAttempt);
    });
  });
});

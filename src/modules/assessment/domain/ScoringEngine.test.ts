import { describe, it, expect } from 'vitest';
import { ScoringEngine } from './ScoringEngine';
import { AssessmentAttempt } from './AssessmentAttempt';
import { AssessmentVersion, Question, QuestionOption } from './AssessmentVersion';

describe('ScoringEngine', () => {
  const mockOption1 = QuestionOption.create({
    id: 'opt1',
    questionId: 'q1',
    textEn: 'Yes',
    textTe: 'అవును',
    value: 5,
  });

  const mockOption2 = QuestionOption.create({
    id: 'opt2',
    questionId: 'q1',
    textEn: 'No',
    textTe: 'కాదు',
    value: 1,
  });

  const mockQuestion = Question.create({
    id: 'q1',
    construct: 'ISI',
    type: 'SCORED',
    sequence: 1,
    textEn: 'Do you like math?',
    textTe: 'మీకు గణితం ఇష్టమా?',
    options: [mockOption1, mockOption2],
  });

  const mockVersion = AssessmentVersion.create({
    id: 'v1',
    status: 'PUBLISHED',
    createdAt: new Date().toISOString(),
    questions: [mockQuestion],
  });

  it('calculates dimension scores correctly with POMP standardization', () => {
    const attempt = AssessmentAttempt.create({
      id: 'a1',
      versionId: 'v1',
      studentId: 's1',
      state: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      completedAt: null,
      answers: [{ questionId: 'q1', selectedOptionId: 'opt1' }],
      scoringVersionId: null,
      rawResponsesJsonb: null,
      constructRawScoresJsonb: null,
      dimensionScores: null,
    });

    const scores = ScoringEngine.calculateScores(attempt, mockVersion);

    // Q1 has max 5, min 1. Selected is 5. So POMP should be 100
    expect(scores.pompScores['ISI']).toBe(100);
    expect(scores.rawScores['ISI']).toBe(5);
  });

  it('throws an error if not all questions are answered', () => {
    const attempt = AssessmentAttempt.create({
      id: 'a1',
      versionId: 'v1',
      studentId: 's1',
      state: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      completedAt: null,
      answers: [],
      scoringVersionId: null,
      rawResponsesJsonb: null,
      constructRawScoresJsonb: null,
      dimensionScores: null,
    });

    expect(() => ScoringEngine.calculateScores(attempt, mockVersion)).toThrow('All questions must be answered to submit');
  });

  it('throws an error if version mismatch', () => {
    const attempt = AssessmentAttempt.create({
      id: 'a1',
      versionId: 'v2',
      studentId: 's1',
      state: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      completedAt: null,
      answers: [{ questionId: 'q1', selectedOptionId: 'opt1' }],
      scoringVersionId: null,
      rawResponsesJsonb: null,
      constructRawScoresJsonb: null,
      dimensionScores: null,
    });

    expect(() => ScoringEngine.calculateScores(attempt, mockVersion)).toThrow('Attempt version mismatch');
  });
});


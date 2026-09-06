export interface QuestionOptionDto {
  id: string;
  textEn: string;
  textTe: string;
}

export interface QuestionDto {
  id: string;
  sequence: number;
  textEn: string;
  textTe: string;
  options: QuestionOptionDto[];
}

export interface AssessmentVersionDto {
  id: string;
  questions: QuestionDto[];
}

export interface AttemptAnswerDto {
  questionId: string;
  selectedOptionId: string;
}

export interface AssessmentAttemptDto {
  id: string;
  versionId: string;
  state: 'IN_PROGRESS' | 'COMPLETED';
  answers: AttemptAnswerDto[];
}

export interface AssessmentResultDto {
  attemptId: string;
  dimensionScores: Record<string, number>;
}

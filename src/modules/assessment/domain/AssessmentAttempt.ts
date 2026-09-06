import { AppError } from '../../../shared/errors';
import { AssessmentVersion } from './AssessmentVersion';

export interface AttemptAnswerProps {
  questionId: string;
  selectedOptionId: string;
}

export interface AssessmentAttemptProps {
  id: string;
  versionId: string;
  studentId: string;
  state: 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  completedAt: string | null;
  answers: AttemptAnswerProps[];
  dimensionScores: Record<string, number> | null;
}

export class AssessmentAttempt {
  private constructor(public readonly props: AssessmentAttemptProps) {}

  static create(props: AssessmentAttemptProps): AssessmentAttempt {
    return new AssessmentAttempt(props);
  }

  get id() { return this.props.id; }
  get versionId() { return this.props.versionId; }
  get studentId() { return this.props.studentId; }
  get state() { return this.props.state; }
  get answers() { return this.props.answers; }
  get dimensionScores() { return this.props.dimensionScores; }
  get isCompleted() { return this.props.state === 'COMPLETED'; }

  saveAnswer(questionId: string, optionId: string) {
    if (this.isCompleted) {
      throw new AppError('Cannot modify answers of a completed attempt', 409);
    }
    const existing = this.props.answers.find(a => a.questionId === questionId);
    if (existing) {
      existing.selectedOptionId = optionId;
    } else {
      this.props.answers.push({ questionId, selectedOptionId: optionId });
    }
  }

  markCompleted(scores: Record<string, number>) {
    if (this.isCompleted) {
      throw new AppError('Attempt is already completed', 409);
    }
    this.props.state = 'COMPLETED';
    this.props.dimensionScores = scores;
    this.props.completedAt = new Date().toISOString();
  }
}

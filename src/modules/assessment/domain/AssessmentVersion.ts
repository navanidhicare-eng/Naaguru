import { AppError } from '../../../shared/errors';

export interface QuestionOptionProps {
  id: string;
  questionId: string;
  textEn: string;
  textTe: string;
  weights: Record<string, number>; // Maps dimensionId -> weight
}

export class QuestionOption {
  private constructor(public readonly props: QuestionOptionProps) {}

  static create(props: QuestionOptionProps): QuestionOption {
    return new QuestionOption(props);
  }

  get id() { return this.props.id; }
  get textEn() { return this.props.textEn; }
  get textTe() { return this.props.textTe; }
  get weights() { return this.props.weights; }
}

export interface QuestionProps {
  id: string;
  versionId: string;
  sequence: number;
  textEn: string;
  textTe: string;
  options: QuestionOption[];
}

export class Question {
  private constructor(public readonly props: QuestionProps) {}

  static create(props: QuestionProps): Question {
    if (props.options.length < 2) {
      throw new AppError('Question must have at least 2 options', 422);
    }
    return new Question(props);
  }

  get id() { return this.props.id; }
  get sequence() { return this.props.sequence; }
  get textEn() { return this.props.textEn; }
  get textTe() { return this.props.textTe; }
  get options() { return this.props.options; }
}

export interface AssessmentVersionProps {
  id: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  questions: Question[];
}

export class AssessmentVersion {
  private constructor(public readonly props: AssessmentVersionProps) {}

  static create(props: AssessmentVersionProps): AssessmentVersion {
    return new AssessmentVersion(props);
  }

  get id() { return this.props.id; }
  get status() { return this.props.status; }
  get questions() { return this.props.questions; }
  get isPublished() { return this.props.status === 'PUBLISHED'; }
}

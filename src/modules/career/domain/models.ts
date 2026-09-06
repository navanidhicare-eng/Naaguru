export interface StreamProps {
  id: string;
  name: string;
  description: string | null;
}

export class Stream {
  private constructor(public readonly props: StreamProps) {}

  static create(props: StreamProps): Stream {
    return new Stream(props);
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get description() { return this.props.description; }
}

export interface CareerRuleProps {
  id: string;
  streamId: string;
  dimensionName: string;
  minScore: number;
  weight: number;
}

export class CareerRule {
  private constructor(public readonly props: CareerRuleProps) {}

  static create(props: CareerRuleProps): CareerRule {
    return new CareerRule(props);
  }

  get id() { return this.props.id; }
  get streamId() { return this.props.streamId; }
  get dimensionName() { return this.props.dimensionName; }
  get minScore() { return this.props.minScore; }
  get weight() { return this.props.weight; }
}

export interface RankedResult {
  streamId: string;
  streamName: string;
  matchScore: number;
  explanation: string;
}

export interface RecommendationProps {
  id: string;
  studentId: string;
  attemptId: string;
  rankedResults: RankedResult[];
  createdAt: string;
}

export class Recommendation {
  private constructor(public readonly props: RecommendationProps) {}

  static create(props: RecommendationProps): Recommendation {
    return new Recommendation(props);
  }

  get id() { return this.props.id; }
  get studentId() { return this.props.studentId; }
  get attemptId() { return this.props.attemptId; }
  get rankedResults() { return this.props.rankedResults; }
  get createdAt() { return this.props.createdAt; }
}

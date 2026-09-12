import { StreamCode } from '@/shared/domain/StreamCode';

export interface StreamProps {
  id: string;
  streamCode: StreamCode;
  description: string | null;
}

export class Stream {
  private constructor(public readonly props: StreamProps) {}

  static create(props: StreamProps): Stream {
    return new Stream(props);
  }

  get id() { return this.props.id; }
  get streamCode() { return this.props.streamCode; }
  get description() { return this.props.description; }
}

export interface CareerRuleProps {
  id: string;
  rulesetId: string;
  streamId: string;
  dimensionName: string;
  weight: number;
}

export class CareerRule {
  private constructor(public readonly props: CareerRuleProps) {}

  static create(props: CareerRuleProps): CareerRule {
    return new CareerRule(props);
  }

  get id() { return this.props.id; }
  get rulesetId() { return this.props.rulesetId; }
  get streamId() { return this.props.streamId; }
  get dimensionName() { return this.props.dimensionName; }
  get weight() { return this.props.weight; }
}

export interface RankedResult {
  streamId: string;
  streamCode: StreamCode;
  matchScore: number;
  fitCategory: string; // "REQUIRES VALIDATION / CONFIGURATION"
}

export interface RecommendationProps {
  id: string;
  studentId: string;
  attemptId: string;
  rulesetId: string;
  rankedResults: RankedResult[];
  appliedRules: Record<string, unknown>; // Snapshot of rules
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
  get rulesetId() { return this.props.rulesetId; }
  get rankedResults() { return this.props.rankedResults; }
  get appliedRules() { return this.props.appliedRules; }
  get createdAt() { return this.props.createdAt; }
}

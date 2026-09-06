import { RankedResult } from '../domain/models';

export interface RecommendationDto {
  attemptId: string;
  rankedResults: RankedResult[];
  appliedRules: Record<string, unknown>;
  createdAt: string;
}

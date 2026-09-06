import { RankedResult } from '../domain/models';

export interface RecommendationDto {
  attemptId: string;
  rankedResults: RankedResult[];
  createdAt: string;
}

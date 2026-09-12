import { Stream, CareerRule, Recommendation } from './models';

export interface ICareerRepository {
  /**
   * Retrieves all available streams.
   */
  getAllStreams(): Promise<Stream[]>;

  /**
   * Retrieves the currently active career ruleset and its rules.
   */
  getActiveRuleset(): Promise<{ rulesetId: string, rules: CareerRule[] } | null>;

  /**
   * Saves a recommendation snapshot to the database.
   */
  saveRecommendation(recommendation: Recommendation): Promise<void>;

  /**
   * Retrieves the recommendation tied to the specific attempt ID.
   */
  getRecommendationByAttemptId(attemptId: string): Promise<Recommendation | null>;
}

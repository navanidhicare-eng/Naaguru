import { Stream, CareerRule, RankedResult } from './models';

export class RecommendationEngine {
  static generate(
    pompScores: Record<string, number>,
    streams: Stream[],
    rules: CareerRule[]
  ): RankedResult[] {
    const results: RankedResult[] = [];

    for (const stream of streams) {
      const streamRules = rules.filter(r => r.streamId === stream.id);
      
      // If a stream has no rules, it can't be recommended.
      if (streamRules.length === 0) continue;

      let matchScore = 0;

      for (const rule of streamRules) {
        const studentScore = pompScores[rule.dimensionName] || 0;
        matchScore += (studentScore * rule.weight);
      }

      // We do not invent arbitrary classification categories (Strong Affinity, etc).
      // Awaiting clinical classification threshold definitions.
      const fitCategory = "REQUIRES VALIDATION / CONFIGURATION";

      results.push({
        streamId: stream.id,
        streamCode: stream.streamCode,
        matchScore,
        fitCategory,
      });
    }

    // Sort descending by matchScore. For ties, sort alphabetically by streamCode to ensure determinism.
    return results.sort((a, b) => {
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return a.streamCode.localeCompare(b.streamCode);
    });
  }
}

import { Stream, CareerRule, RankedResult } from './models';

export class RecommendationEngine {
  static generate(
    dimensionScores: Record<string, number>,
    streams: Stream[],
    rules: CareerRule[]
  ): RankedResult[] {
    const results: RankedResult[] = [];

    for (const stream of streams) {
      const streamRules = rules.filter(r => r.streamId === stream.id);
      
      // If a stream has no rules, it can't be recommended.
      if (streamRules.length === 0) continue;

      let matchScore = 0;
      let qualifies = true;
      const matchedDimensions: string[] = [];

      for (const rule of streamRules) {
        const studentScore = dimensionScores[rule.dimensionName] || 0;
        
        if (studentScore < rule.minScore) {
          qualifies = false;
          break; // Fails minimum threshold, disqualify this stream
        }

        matchScore += (studentScore * rule.weight);
        if (studentScore > 0) {
          matchedDimensions.push(rule.dimensionName);
        }
      }

      if (qualifies) {
        const explanation = `Your scores in ${matchedDimensions.join(', ')} align with the ${stream.name} pathway.`;
        results.push({
          streamId: stream.id,
          streamName: stream.name,
          matchScore,
          explanation,
        });
      }
    }

    // Sort descending by matchScore
    return results.sort((a, b) => b.matchScore - a.matchScore);
  }
}

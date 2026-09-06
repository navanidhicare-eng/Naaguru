import { describe, it, expect } from 'vitest';
import { RecommendationEngine } from './RecommendationEngine';
import { Stream, CareerRule } from './models';

describe('RecommendationEngine', () => {
  const mpcStream = Stream.create({ id: 'stream-1', streamCode: 'MPC', description: 'Math, Physics, Chemistry' });
  const bipcStream = Stream.create({ id: 'stream-2', streamCode: 'BIPC', description: 'Biology, Physics, Chemistry' });
  const cecStream = Stream.create({ id: 'stream-3', streamCode: 'CEC', description: 'Civics, Economics, Commerce' });

  const streams = [mpcStream, bipcStream, cecStream];

  const rules = [
    // MPC requires Analytical >= 3, Scientific >= 3
    CareerRule.create({ id: 'r1', streamId: 'stream-1', dimensionName: 'Analytical', minScore: 3, weight: 1.5 }),
    CareerRule.create({ id: 'r2', streamId: 'stream-1', dimensionName: 'Scientific', minScore: 3, weight: 1.0 }),

    // BiPC requires Biological >= 4, Scientific >= 3
    CareerRule.create({ id: 'r3', streamId: 'stream-2', dimensionName: 'Biological', minScore: 4, weight: 1.5 }),
    CareerRule.create({ id: 'r4', streamId: 'stream-2', dimensionName: 'Scientific', minScore: 3, weight: 1.0 }),
    
    // CEC requires Commercial >= 3
    CareerRule.create({ id: 'r5', streamId: 'stream-3', dimensionName: 'Commercial', minScore: 3, weight: 1.2 }),
  ];

  it('should recommend streams that meet the minimum thresholds and rank by match score', () => {
    const scores = {
      Analytical: 5,
      Scientific: 4,
      Biological: 5,
      Commercial: 0,
    };

    const results = RecommendationEngine.generate(scores, streams, rules);
    
    expect(results).toHaveLength(2); // Should match MPC and BiPC

    // MPC match score: (5 * 1.5) + (4 * 1.0) = 7.5 + 4 = 11.5
    // BiPC match score: (5 * 1.5) + (4 * 1.0) = 7.5 + 4 = 11.5
    
    const mpcResult = results.find(r => r.streamCode === 'MPC');
    const bipcResult = results.find(r => r.streamCode === 'BIPC');
    
    expect(mpcResult).toBeDefined();
    expect(bipcResult).toBeDefined();
    
    expect(mpcResult?.matchScore).toBe(11.5);
    expect(bipcResult?.matchScore).toBe(11.5);
  });

  it('should disqualify a stream if a minimum threshold is not met', () => {
    const scores = {
      Analytical: 5,
      Scientific: 2, // Fails the minScore of 3 for MPC and BiPC
      Biological: 5,
    };

    const results = RecommendationEngine.generate(scores, streams, rules);
    
    expect(results).toHaveLength(0); // Fails both MPC and BiPC
  });

  it('should ignore streams with no rules', () => {
    const emptyStream = Stream.create({ id: 'stream-empty', streamCode: 'HEC', description: null });
    const results = RecommendationEngine.generate({ Analytical: 5 }, [emptyStream], []);
    
    expect(results).toHaveLength(0);
  });

  it('should deterministically tie-break streams with equal match scores by stream name (alphabetical)', () => {
    const streamZ = Stream.create({ id: 's-z', streamCode: 'MEC', description: 'Z' });
    const streamA = Stream.create({ id: 's-a', streamCode: 'BIPC', description: 'A' });
    
    // Both streams have the exact same rule, so they will score exactly the same
    const ruleZ = CareerRule.create({ id: 'r-z', streamId: 's-z', dimensionName: 'Analytical', minScore: 1, weight: 1.0 });
    const ruleA = CareerRule.create({ id: 'r-a', streamId: 's-a', dimensionName: 'Analytical', minScore: 1, weight: 1.0 });

    const testScores = { Analytical: 5 };

    // Pass them in Z then A order
    const resultsZA = RecommendationEngine.generate(testScores, [streamZ, streamA], [ruleZ, ruleA]);
    expect(resultsZA[0].streamCode).toBe('BIPC');
    expect(resultsZA[1].streamCode).toBe('MEC');

    // Pass them in A then Z order
    const resultsAZ = RecommendationEngine.generate(testScores, [streamA, streamZ], [ruleA, ruleZ]);
    expect(resultsAZ[0].streamCode).toBe('BIPC');
    expect(resultsAZ[1].streamCode).toBe('MEC');
  });
});

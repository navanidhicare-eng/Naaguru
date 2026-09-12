import { describe, it, expect } from 'vitest';
import { RecommendationEngine } from './RecommendationEngine';
import { Stream, CareerRule } from './models';

describe('RecommendationEngine', () => {
  const mpcStream = Stream.create({ id: 'stream-1', streamCode: 'MPC', description: 'Math, Physics, Chemistry' });
  const bipcStream = Stream.create({ id: 'stream-2', streamCode: 'BIPC', description: 'Biology, Physics, Chemistry' });
  const cecStream = Stream.create({ id: 'stream-3', streamCode: 'CEC', description: 'Civics, Economics, Commerce' });

  const streams = [mpcStream, bipcStream, cecStream];

  const rules = [
    // MPC
    CareerRule.create({ id: 'r1', rulesetId: 'rs1', streamId: 'stream-1', dimensionName: 'Analytical', weight: 1.5 }),
    CareerRule.create({ id: 'r2', rulesetId: 'rs1', streamId: 'stream-1', dimensionName: 'Scientific', weight: 1.0 }),

    // BiPC
    CareerRule.create({ id: 'r3', rulesetId: 'rs1', streamId: 'stream-2', dimensionName: 'Biological', weight: 1.5 }),
    CareerRule.create({ id: 'r4', rulesetId: 'rs1', streamId: 'stream-2', dimensionName: 'Scientific', weight: 1.0 }),
    
    // CEC
    CareerRule.create({ id: 'r5', rulesetId: 'rs1', streamId: 'stream-3', dimensionName: 'Commercial', weight: 1.2 }),
  ];

  it('should recommend streams and rank by match score (linear combination)', () => {
    const pompScores = {
      Analytical: 50,
      Scientific: 40,
      Biological: 50,
      Commercial: 0,
    };

    const results = RecommendationEngine.generate(pompScores, streams, rules);
    
    expect(results).toHaveLength(3); // Evaluates all streams with rules

    // MPC match score: (50 * 1.5) + (40 * 1.0) = 75 + 40 = 115
    // BiPC match score: (50 * 1.5) + (40 * 1.0) = 75 + 40 = 115
    // CEC match score: 0
    
    const mpcResult = results.find(r => r.streamCode === 'MPC');
    const bipcResult = results.find(r => r.streamCode === 'BIPC');
    const cecResult = results.find(r => r.streamCode === 'CEC');
    
    expect(mpcResult).toBeDefined();
    expect(bipcResult).toBeDefined();
    
    expect(mpcResult?.matchScore).toBe(115);
    expect(bipcResult?.matchScore).toBe(115);
    expect(cecResult?.matchScore).toBe(0);
    expect(mpcResult?.fitCategory).toBe("REQUIRES VALIDATION / CONFIGURATION");
  });

  it('should ignore streams with no rules', () => {
    const emptyStream = Stream.create({ id: 'stream-empty', streamCode: 'HEC', description: null });
    const results = RecommendationEngine.generate({ Analytical: 50 }, [emptyStream], []);
    
    expect(results).toHaveLength(0);
  });

  it('should deterministically tie-break streams with equal match scores by stream name (alphabetical)', () => {
    const streamZ = Stream.create({ id: 's-z', streamCode: 'MEC', description: 'Z' });
    const streamA = Stream.create({ id: 's-a', streamCode: 'BIPC', description: 'A' });
    
    // Both streams have the exact same rule, so they will score exactly the same
    const ruleZ = CareerRule.create({ id: 'r-z', rulesetId: 'rs1', streamId: 's-z', dimensionName: 'Analytical', weight: 1.0 });
    const ruleA = CareerRule.create({ id: 'r-a', rulesetId: 'rs1', streamId: 's-a', dimensionName: 'Analytical', weight: 1.0 });

    const testScores = { Analytical: 50 };

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

import { describe, it, expect } from 'vitest';
import { RecommendationEngine } from './RecommendationEngine';
import { Stream, CareerRule } from './models';

describe('RecommendationEngine', () => {
  const mpcStream = Stream.create({ id: 'stream-1', name: 'MPC', description: 'Math, Physics, Chemistry' });
  const bipcStream = Stream.create({ id: 'stream-2', name: 'BiPC', description: 'Biology, Physics, Chemistry' });
  const cecStream = Stream.create({ id: 'stream-3', name: 'CEC', description: 'Civics, Economics, Commerce' });

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
    
    const mpcResult = results.find(r => r.streamName === 'MPC');
    const bipcResult = results.find(r => r.streamName === 'BiPC');
    
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
    const emptyStream = Stream.create({ id: 'stream-empty', name: 'Empty', description: null });
    const results = RecommendationEngine.generate({ Analytical: 5 }, [emptyStream], []);
    
    expect(results).toHaveLength(0);
  });
});

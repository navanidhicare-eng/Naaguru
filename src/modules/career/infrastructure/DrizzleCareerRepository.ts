import { ICareerRepository } from '../domain/ICareerRepository';
import { Stream, CareerRule, Recommendation, RankedResult } from '../domain/models';
import { db } from '@/shared/database/db';
import { streamsTable, careerRulesetsTable, careerRulesTable, recommendationsTable } from './schema';
import { eq, desc } from 'drizzle-orm';
import 'server-only';

import { StreamCode } from '@/shared/domain/StreamCode';

export class DrizzleCareerRepository implements ICareerRepository {

  async getAllStreams(): Promise<Stream[]> {
    const rows = await db.select().from(streamsTable);
    return rows.map(r => Stream.create({
      id: r.id,
      streamCode: r.code as StreamCode,
      description: r.description,
    }));
  }

  async getActiveRuleset(): Promise<{ rulesetId: string, rules: CareerRule[] } | null> {
    const rulesets = await db.select()
      .from(careerRulesetsTable)
      .where(eq(careerRulesetsTable.isDefault, true))
      .orderBy(desc(careerRulesetsTable.createdAt))
      .limit(1);

    if (rulesets.length === 0) return null;
    
    const activeRuleset = rulesets[0];
    const rules = await db.select()
      .from(careerRulesTable)
      .where(eq(careerRulesTable.rulesetId, activeRuleset.id));

    const domainRules = rules.map(r => CareerRule.create({
      id: r.id,
      rulesetId: r.rulesetId,
      streamId: r.streamId,
      dimensionName: r.dimensionName,
      weight: r.weight,
    }));

    return {
      rulesetId: activeRuleset.id,
      rules: domainRules,
    };
  }

  async saveRecommendation(recommendation: Recommendation): Promise<void> {
    await db.insert(recommendationsTable).values({
      id: recommendation.id,
      studentId: recommendation.studentId,
      attemptId: recommendation.attemptId,
      rulesetId: recommendation.rulesetId,
      rankedResultsJsonb: recommendation.rankedResults,
      appliedRulesJsonb: recommendation.appliedRules,
      createdAt: recommendation.createdAt,
    }).onConflictDoNothing({
      target: recommendationsTable.attemptId,
    });
  }

  async getRecommendationByAttemptId(attemptId: string): Promise<Recommendation | null> {
    const rows = await db.select().from(recommendationsTable)
      .where(eq(recommendationsTable.attemptId, attemptId))
      .limit(1);

    if (rows.length === 0) return null;
    const r = rows[0];

    return Recommendation.create({
      id: r.id,
      studentId: r.studentId,
      attemptId: r.attemptId,
      rulesetId: r.rulesetId,
      rankedResults: r.rankedResultsJsonb as RankedResult[],
      appliedRules: r.appliedRulesJsonb as Record<string, unknown>,
      createdAt: r.createdAt,
    });
  }
}

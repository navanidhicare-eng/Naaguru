import { ICareerRepository } from '../domain/ICareerRepository';
import { Stream, CareerRule, Recommendation, RankedResult } from '../domain/models';
import { db } from '@/shared/database/db';
import { streamsTable, careerRulesTable, recommendationsTable } from './schema';
import { eq } from 'drizzle-orm';
import 'server-only';

export class DrizzleCareerRepository implements ICareerRepository {

  async getAllStreams(): Promise<Stream[]> {
    const rows = await db.select().from(streamsTable);
    return rows.map(r => Stream.create({
      id: r.id,
      name: r.name,
      description: r.description,
    }));
  }

  async getAllRules(): Promise<CareerRule[]> {
    const rows = await db.select().from(careerRulesTable);
    return rows.map(r => CareerRule.create({
      id: r.id,
      streamId: r.streamId,
      dimensionName: r.dimensionName,
      minScore: r.minScore,
      weight: r.weight,
    }));
  }

  async saveRecommendation(recommendation: Recommendation): Promise<void> {
    await db.insert(recommendationsTable).values({
      id: recommendation.id,
      studentId: recommendation.studentId,
      attemptId: recommendation.attemptId,
      rankedResultsJsonb: recommendation.rankedResults,
      createdAt: recommendation.createdAt,
    }).onConflictDoUpdate({
      target: recommendationsTable.attemptId,
      set: {
        rankedResultsJsonb: recommendation.rankedResults,
      }
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
      rankedResults: r.rankedResultsJsonb as RankedResult[],
      createdAt: r.createdAt,
    });
  }
}

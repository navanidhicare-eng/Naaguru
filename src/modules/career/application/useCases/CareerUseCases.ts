import { AppError } from '@/shared/errors';
import { ICareerRepository } from '../../domain/ICareerRepository';
import { Recommendation } from '../../domain/models';
import { RecommendationEngine } from '../../domain/RecommendationEngine';
import { AssessmentModule } from '@/modules/assessment';
import { RecommendationDto } from '../dtos';

export class CareerUseCases {
  constructor(private readonly careerRepository: ICareerRepository) {}

  async generateRecommendation(studentId: string): Promise<RecommendationDto> {
    const latestResult = await AssessmentModule.getMyLatestResult(studentId);
    
    // Check if recommendation already exists for this attempt
    let existing = await this.careerRepository.getRecommendationByAttemptId(latestResult.attemptId);
    if (existing) {
      return {
        attemptId: existing.attemptId,
        rankedResults: existing.rankedResults,
        appliedRules: existing.appliedRules,
        createdAt: existing.createdAt,
      };
    }

    const streams = await this.careerRepository.getAllStreams();
    const rules = await this.careerRepository.getAllRules();

    const rankedResults = RecommendationEngine.generate(latestResult.dimensionScores, streams, rules);

    const recommendation = Recommendation.create({
      id: crypto.randomUUID(),
      studentId,
      attemptId: latestResult.attemptId,
      rankedResults,
      appliedRules: { rules, streams }, // Snapshot of configuration used
      createdAt: new Date().toISOString(),
    });

    await this.careerRepository.saveRecommendation(recommendation);

    // Fetch it back to ensure we return the DB truth (in case of concurrent insert)
    existing = await this.careerRepository.getRecommendationByAttemptId(latestResult.attemptId);
    if (!existing) {
      throw new AppError('Failed to generate recommendation', 500);
    }

    return {
      attemptId: existing.attemptId,
      rankedResults: existing.rankedResults,
      appliedRules: existing.appliedRules,
      createdAt: existing.createdAt,
    };
  }

  async getCurrentRecommendation(studentId: string): Promise<RecommendationDto> {
    const latestResult = await AssessmentModule.getMyLatestResult(studentId);
    
    const recommendation = await this.careerRepository.getRecommendationByAttemptId(latestResult.attemptId);
    if (!recommendation) {
      throw new AppError('No recommendation found for current attempt', 404);
    }

    return {
      attemptId: recommendation.attemptId,
      rankedResults: recommendation.rankedResults,
      appliedRules: recommendation.appliedRules,
      createdAt: recommendation.createdAt,
    };
  }
}

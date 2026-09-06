import { AppError } from '@/shared/errors';
import { ICareerRepository } from '../../domain/ICareerRepository';
import { Recommendation } from '../../domain/models';
import { RecommendationEngine } from '../../domain/RecommendationEngine';
import { AssessmentModule } from '@/modules/assessment';
import { RecommendationDto } from '../dtos';

export class CareerUseCases {
  constructor(private readonly careerRepository: ICareerRepository) {}

  async generateRecommendation(studentId: string): Promise<void> {
    const latestResult = await AssessmentModule.getMyLatestResult(studentId);
    
    // Check if recommendation already exists for this attempt
    const existing = await this.careerRepository.getRecommendationByAttemptId(latestResult.attemptId);
    if (existing) {
      throw new AppError('Recommendation already generated for this attempt', 409);
    }

    const streams = await this.careerRepository.getAllStreams();
    const rules = await this.careerRepository.getAllRules();

    const rankedResults = RecommendationEngine.generate(latestResult.dimensionScores, streams, rules);

    const recommendation = Recommendation.create({
      id: crypto.randomUUID(),
      studentId,
      attemptId: latestResult.attemptId,
      rankedResults,
      createdAt: new Date().toISOString(),
    });

    await this.careerRepository.saveRecommendation(recommendation);
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
      createdAt: recommendation.createdAt,
    };
  }
}

import { DrizzleCareerRepository } from './infrastructure/DrizzleCareerRepository';
import { CareerUseCases } from './application/useCases/CareerUseCases';
import { RecommendationDto } from './application/dtos';

const careerRepository = new DrizzleCareerRepository();
const internalUseCases = new CareerUseCases(careerRepository);

export const CareerModule = {
  generateRecommendation: (studentId: string): Promise<RecommendationDto> => {
    return internalUseCases.generateRecommendation(studentId);
  },

  getCurrentRecommendation: (studentId: string): Promise<RecommendationDto> => {
    return internalUseCases.getCurrentRecommendation(studentId);
  },
};

export * from './application/dtos';

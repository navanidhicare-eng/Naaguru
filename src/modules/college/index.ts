import { DrizzleCollegeRepository } from './infrastructure/DrizzleCollegeRepository';
import { CollegeUseCases } from './application/useCases/CollegeUseCases';
import { PublicCollegeDto } from './application/dtos';
import { CollegeSearchCriteria } from './domain/ICollegeRepository';

const collegeRepository = new DrizzleCollegeRepository();
const internalUseCases = new CollegeUseCases(collegeRepository);

export const CollegeModule = {
  getPublicProfile: (id: string): Promise<PublicCollegeDto> => {
    return internalUseCases.getPublicProfile(id);
  },

  searchActiveColleges: (criteria: CollegeSearchCriteria): Promise<PublicCollegeDto[]> => {
    return internalUseCases.searchActiveColleges(criteria);
  },
};

export * from './application/dtos';
export * from './domain/ICollegeRepository';

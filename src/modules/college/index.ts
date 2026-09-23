import { DrizzleCollegeRepository } from './infrastructure/DrizzleCollegeRepository';
import { CollegeUseCases } from './application/useCases/CollegeUseCases';
import { PublicCollegeDto } from './application/dtos';
import { CollegeSearchCriteria } from './domain/ICollegeRepository';
import { SupabaseStorageService } from '../../shared/storage/SupabaseStorageService';

// Keep module boundary tight: only export what other modules need.
const collegeRepository = new DrizzleCollegeRepository();
const storageService = new SupabaseStorageService();
const internalUseCases = new CollegeUseCases(collegeRepository, storageService);

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

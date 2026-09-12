import { College } from './models';
import { StreamCode } from '@/shared/domain/StreamCode';

export interface CollegeSearchCriteria {
  streamCode?: StreamCode;
  state?: string;
  district?: string;
  city?: string;
  requiresHostel?: boolean;
  requiresBoysHostel?: boolean;
  requiresGirlsHostel?: boolean;
  maxFee?: number;
}

export interface ICollegeRepository {
  findById(id: string): Promise<College | null>;
  searchActiveVerified(criteria: CollegeSearchCriteria): Promise<College[]>;
  save(college: College): Promise<void>;
}

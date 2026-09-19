import { OwnershipType, CollegeStatus, VerificationStatus } from '@/modules/college/domain/models';
import { StreamCode } from '@/shared/domain/StreamCode';

export interface CollegeStreamOfferingDto {
  streamCode: string;
  tuitionFee: number;
}

export interface PublicBranchDto {
  id: string;
  name: string;
  type: string;
  locationName: string | null;
  hostel: {
    hasBoysHostel: boolean;
    hasGirlsHostel: boolean;
    annualHostelFee: number | null;
  };
  offerings: CollegeStreamOfferingDto[];
}

export interface PublicCollegeDto {
  matchedBranchId?: string;
  id: string;
  name: string;
  shortName: string | null;
  description: string | null;
  website: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  ownershipType: OwnershipType;

  branches: PublicBranchDto[];
}

export interface StaffCollegeProfileDto extends PublicCollegeDto {
  status: CollegeStatus;
  verificationStatus: VerificationStatus;
}

export interface UpdateCollegeProfileDto {
  shortName?: string | null;
  description?: string | null;
  website?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
}

import { OwnershipType, CollegeStatus, VerificationStatus } from '@/modules/college/domain/models';
import { StreamCode } from '@/shared/domain/StreamCode';

export interface CollegeStreamOfferingDto {
  streamCode: string;
  tuitionFee: number;
}

export interface LeadershipProfileDto {
  id: string;
  name: string;
  designation: string;
  bio: string | null;
  imageUrl: string | null;
  displayOrder: number;
}

export interface CollegeMediaDto {
  id?: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'VIRTUAL_TOUR';
  url?: string;
  storageKey?: string;
  thumbnailStorageKey?: string;
  externalUrl?: string;
  caption: string | null;
  displayOrder: number;
  isCover: boolean;
  status: 'ACTIVE' | 'INACTIVE';
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
  leadership: LeadershipProfileDto[];
  media: CollegeMediaDto[];
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
  leadership?: LeadershipProfileDto[];
}

export interface SyncMediaDto {
  media: CollegeMediaDto[];
}

export interface CollegeAchievementInputDto {
  id?: string;
  studentName: string;
  exam: string;
  achievement: string;
  year: number;
  description?: string | null;
  imageStorageKey?: string | null;
  displayOrder: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface SyncAchievementsDto {
  achievements: CollegeAchievementInputDto[];
}

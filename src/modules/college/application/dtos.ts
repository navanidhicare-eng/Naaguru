import { OwnershipType, CollegeStatus, VerificationStatus } from '@/modules/college/domain/models';

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

export interface CollegeAchievementDto {
  id: string;
  studentName: string;
  exam: string;
  achievement: string;
  year: number;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
}

export interface PublicCollegeDetailDto extends PublicCollegeDto {
  achievements: CollegeAchievementDto[];
  testimonials: CollegeTestimonialDto[];
  accreditations: CollegeAccreditationDto[];
}

export interface CollegeAccreditationDto {
  id: string;
  name: string;
  issuingBody: string;
  year: number | null;
  validUntilYear: number | null;
  description: string | null;
  certificateUrl: string | null;
  verificationUrl: string | null;
  displayOrder: number;
}

export interface CollegeTestimonialDto {
  id: string;
  personName: string;
  personType: 'STUDENT' | 'PARENT' | 'ALUMNI' | 'OTHER';
  testimonialText: string;
  imageUrl: string | null;
  displayOrder: number;
}

export interface StaffCollegeAchievementDto extends CollegeAchievementDto {
  status: 'ACTIVE' | 'INACTIVE';
}

export interface StaffCollegeTestimonialDto {
  id: string;
  personName: string;
  personType: 'STUDENT' | 'PARENT' | 'ALUMNI' | 'OTHER';
  testimonialText: string;
  imageStorageKey: string | null;
  displayOrder: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface StaffCollegeAccreditationDto {
  id: string;
  name: string;
  issuingBody: string;
  year: number | null;
  validUntilYear: number | null;
  description: string | null;
  certificateStorageKey: string | null;
  verificationUrl: string | null;
  displayOrder: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface StaffCollegeProfileDto extends PublicCollegeDto {
  status: CollegeStatus;
  verificationStatus: VerificationStatus;
  achievements: StaffCollegeAchievementDto[];
  testimonials?: StaffCollegeTestimonialDto[];
  accreditations?: StaffCollegeAccreditationDto[];
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

export interface CollegeTestimonialInputDto {
  id?: string;
  personName: string;
  personType: 'STUDENT' | 'PARENT' | 'ALUMNI' | 'OTHER';
  testimonialText: string;
  imageStorageKey?: string | null;
  displayOrder: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface SyncTestimonialsDto {
  testimonials: CollegeTestimonialInputDto[];
}

export interface CollegeAccreditationInputDto {
  id?: string;
  name: string;
  issuingBody: string;
  year?: number | null;
  validUntilYear?: number | null;
  description?: string | null;
  certificateStorageKey?: string | null;
  verificationUrl?: string | null;
  displayOrder: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface SyncAccreditationsDto {
  accreditations: CollegeAccreditationInputDto[];
}

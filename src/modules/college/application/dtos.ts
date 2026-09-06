import { OwnershipType } from '@/modules/college/domain/models';
import { StreamCode } from '@/shared/domain/StreamCode';

export interface CollegeStreamOfferingDto {
  streamCode: string;
  tuitionFee: number;
}

export interface PublicCollegeDto {
  id: string;
  name: string;
  shortName: string | null;
  description: string | null;
  website: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  
  location: {
    state: string;
    district: string;
    city: string;
    address: string;
    lat: number | null;
    lng: number | null;
  };

  hostelSummary: {
    hasBoysHostel: boolean;
    hasGirlsHostel: boolean;
    annualHostelFee: number | null;
  };
  
  ownershipType: OwnershipType;

  offerings: CollegeStreamOfferingDto[];
}

import { StreamCode } from '@/shared/domain/StreamCode';

export type CollegeStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE';
export type VerificationStatus = 'UNVERIFIED' | 'VERIFIED';
export type OwnershipType = 'PRIVATE' | 'GOVERNMENT';

export interface LocationProps {
  state: string;
  district: string;
  city: string;
  address: string;
  lat: number | null;
  lng: number | null;
}

export interface HostelSummaryProps {
  hasBoysHostel: boolean;
  hasGirlsHostel: boolean;
  annualHostelFee: number | null; // INR
}

export interface CollegeStreamOfferingProps {
  id: string;
  collegeId: string;
  streamCode: StreamCode;
  tuitionFee: number; // INR
}

export class CollegeStreamOffering {
  private constructor(public readonly props: CollegeStreamOfferingProps) {}

  static create(props: CollegeStreamOfferingProps): CollegeStreamOffering {
    return new CollegeStreamOffering(props);
  }

  get id() { return this.props.id; }
  get collegeId() { return this.props.collegeId; }
  get streamCode() { return this.props.streamCode; }
  get tuitionFee() { return this.props.tuitionFee; }
}

export interface CollegeProps {
  id: string;
  name: string;
  shortName: string | null;
  description: string | null;
  website: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  
  location: LocationProps;
  hostelSummary: HostelSummaryProps;
  
  ownershipType: OwnershipType;
  status: CollegeStatus;
  verificationStatus: VerificationStatus;

  offerings: CollegeStreamOffering[];

  createdAt: string;
  updatedAt: string;
}

export class College {
  private constructor(public readonly props: CollegeProps) {}

  static create(props: CollegeProps): College {
    return new College(props);
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get shortName() { return this.props.shortName; }
  get description() { return this.props.description; }
  get website() { return this.props.website; }
  get contactPhone() { return this.props.contactPhone; }
  get contactEmail() { return this.props.contactEmail; }
  get location() { return this.props.location; }
  get hostelSummary() { return this.props.hostelSummary; }
  get ownershipType() { return this.props.ownershipType; }
  get status() { return this.props.status; }
  get verificationStatus() { return this.props.verificationStatus; }
  get offerings() { return this.props.offerings; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  isPubliclyDiscoverable(): boolean {
    return this.status === 'ACTIVE' && this.verificationStatus === 'VERIFIED';
  }
}

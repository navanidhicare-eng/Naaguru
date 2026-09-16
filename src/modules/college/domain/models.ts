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

export interface BranchHostelProps {
  branchId: string;
  hasBoysHostel: boolean;
  hasGirlsHostel: boolean;
  annualHostelFee: number | null; // INR
}

export interface CollegeStreamOfferingProps {
  id: string;
  branchId: string;
  streamCode: StreamCode;
  minFee: number; // INR
  maxFee: number; // INR
}

export class CollegeStreamOffering {
  private constructor(public readonly props: CollegeStreamOfferingProps) {}

  static create(props: CollegeStreamOfferingProps): CollegeStreamOffering {
    return new CollegeStreamOffering(props);
  }

  get id() { return this.props.id; }
  get branchId() { return this.props.branchId; }
  get streamCode() { return this.props.streamCode; }
  get minFee() { return this.props.minFee; }
  get maxFee() { return this.props.maxFee; }
}

export type BranchType = 'MAIN_CAMPUS' | 'OFF_CAMPUS';

export interface BranchProps {
  id: string;
  name: string;
  type: BranchType;
  locationId: string | null;
  locationName?: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  contactPhone: string | null;
  contactEmail: string | null;
  isPubliclyEligible: boolean;
  hostel: BranchHostelProps;
  offerings: CollegeStreamOffering[];
}

export class Branch {
  private constructor(public readonly props: BranchProps) {}

  static create(props: BranchProps): Branch {
    return new Branch(props);
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get type() { return this.props.type; }
  get locationId() { return this.props.locationId; }
  get locationName() { return this.props.locationName; }
  get address() { return this.props.address; }
  get lat() { return this.props.lat; }
  get lng() { return this.props.lng; }
  get contactPhone() { return this.props.contactPhone; }
  get contactEmail() { return this.props.contactEmail; }
  get isPubliclyEligible() { return this.props.isPubliclyEligible; }
  get hostel() { return this.props.hostel; }
  get offerings() { return this.props.offerings; }
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
  hostels: BranchHostelProps[];
  
  ownershipType: OwnershipType;
  status: CollegeStatus;
  verificationStatus: VerificationStatus;

  offerings: CollegeStreamOffering[];
  branches: Branch[];

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
  get hostels() { return this.props.hostels; }
  get ownershipType() { return this.props.ownershipType; }
  get status() { return this.props.status; }
  get verificationStatus() { return this.props.verificationStatus; }
  get offerings() { return this.props.offerings; }
  get branches() { return this.props.branches; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  isPubliclyDiscoverable(): boolean {
    return this.status === 'ACTIVE' && this.verificationStatus === 'VERIFIED';
  }

  updateProfile(data: {
    shortName?: string | null;
    description?: string | null;
    website?: string | null;
    contactPhone?: string | null;
    contactEmail?: string | null;
    location?: Partial<LocationProps>;
    hostels?: BranchHostelProps[];
  }): void {
    if (data.shortName !== undefined) this.props.shortName = data.shortName;
    if (data.description !== undefined) this.props.description = data.description;
    if (data.website !== undefined) this.props.website = data.website;
    if (data.contactPhone !== undefined) this.props.contactPhone = data.contactPhone;
    if (data.contactEmail !== undefined) this.props.contactEmail = data.contactEmail;

    if (data.location) {
      this.props.location = { ...this.props.location, ...data.location };
    }

    if (data.hostels) {
      this.props.hostels = data.hostels;
    }

    this.props.updatedAt = new Date().toISOString();
  }
}

export type StaffRole = 'COLLEGE_ADMIN' | 'COLLEGE_STAFF';
export type StaffStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface StaffMembershipProps {
  id: string;
  userId: string;
  collegeId: string;
  role: StaffRole;
  status: StaffStatus;
  createdAt: string;
  updatedAt: string;
}

export class StaffMembership {
  private constructor(public readonly props: StaffMembershipProps) {}

  static create(props: StaffMembershipProps): StaffMembership {
    return new StaffMembership(props);
  }

  get id() { return this.props.id; }
  get userId() { return this.props.userId; }
  get collegeId() { return this.props.collegeId; }
  get role() { return this.props.role; }
  get status() { return this.props.status; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  isAdmin(): boolean {
    return this.role === 'COLLEGE_ADMIN';
  }
}

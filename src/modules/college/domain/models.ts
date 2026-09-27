import { StreamCode } from '@/shared/domain/StreamCode';
import { CollegeMedia } from './CollegeMedia';
import { WeeklyMenu } from './WeeklyMenu';
import { CollegeAchievement, AchievementStatus } from './CollegeAchievement';
import { CollegeTestimonial, PersonType, TestimonialStatus } from './CollegeTestimonial';
import { CollegeAccreditation, AccreditationStatus } from './CollegeAccreditation';
export { CollegeMedia, WeeklyMenu, CollegeAchievement, type AchievementStatus, CollegeTestimonial, type PersonType, type TestimonialStatus, CollegeAccreditation, type AccreditationStatus };

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

export interface LeadershipProfileProps {
  id: string;
  collegeId: string;
  name: string;
  designation: string;
  bio: string | null;
  imageUrl: string | null;
  displayOrder: number;
}

export class LeadershipProfile {
  private constructor(public readonly props: LeadershipProfileProps) {}

  static create(props: LeadershipProfileProps): LeadershipProfile {
    return new LeadershipProfile(props);
  }

  get id() { return this.props.id; }
  get collegeId() { return this.props.collegeId; }
  get name() { return this.props.name; }
  get designation() { return this.props.designation; }
  get bio() { return this.props.bio; }
  get imageUrl() { return this.props.imageUrl; }
  get displayOrder() { return this.props.displayOrder; }
}

export interface CollegeProps {
  id: string;
  name: string;
  shortName: string | null;
  description: string | null;
  website: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  
  ownershipType: OwnershipType;
  status: CollegeStatus;
  verificationStatus: VerificationStatus;

  branches: Branch[];
  leadership: LeadershipProfile[];
  media: CollegeMedia[];
  weeklyMenu: WeeklyMenu | null;
  achievements: CollegeAchievement[];
  testimonials?: CollegeTestimonial[];
  accreditations?: CollegeAccreditation[];

  createdAt: string;
  updatedAt: string;
}

export class College {
  private constructor(public readonly props: CollegeProps & { testimonials: CollegeTestimonial[]; accreditations: CollegeAccreditation[] }) {}

  static create(props: CollegeProps): College {
    return new College({
      ...props,
      testimonials: props.testimonials || [],
      accreditations: props.accreditations || [],
    });
  }

  get id() { return this.props.id; }
  get name() { return this.props.name; }
  get shortName() { return this.props.shortName; }
  get description() { return this.props.description; }
  get website() { return this.props.website; }
  get contactPhone() { return this.props.contactPhone; }
  get contactEmail() { return this.props.contactEmail; }
  get ownershipType() { return this.props.ownershipType; }
  get status() { return this.props.status; }
  get verificationStatus() { return this.props.verificationStatus; }
  get branches() { return this.props.branches; }
  get leadership() { return this.props.leadership; }
  get media() { return this.props.media; }
  get weeklyMenu() { return this.props.weeklyMenu; }
  get achievements() { return this.props.achievements; }
  get testimonials(): CollegeTestimonial[] { return this.props.testimonials; }
  get accreditations(): CollegeAccreditation[] { return this.props.accreditations; }
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
    leadership?: LeadershipProfile[];
    media?: CollegeMedia[];
    weeklyMenu?: WeeklyMenu | null;
  }): void {
    if (data.shortName !== undefined) this.props.shortName = data.shortName;
    if (data.description !== undefined) this.props.description = data.description;
    if (data.website !== undefined) this.props.website = data.website;
    if (data.contactPhone !== undefined) this.props.contactPhone = data.contactPhone;
    if (data.contactEmail !== undefined) this.props.contactEmail = data.contactEmail;
    if (data.leadership !== undefined) this.props.leadership = data.leadership;
    
    if (data.media !== undefined) {
      const coverImagesCount = data.media.filter(m => m.isCover).length;
      if (coverImagesCount > 1) {
        throw new Error('A college can have at most one cover image.'); // Should ideally use AppError
      }
      this.props.media = data.media;
    }

    if (data.weeklyMenu !== undefined) {
      this.props.weeklyMenu = data.weeklyMenu;
    }

    this.props.updatedAt = new Date().toISOString();
  }

  /**
   * Replaces the institution's achievements.
   * Enforces the hard business invariant of maximum 20 achievements per institution.
   */
  replaceAchievements(achievements: CollegeAchievement[]): void {
    if (achievements.length > 20) {
      // Using Error as per existing patterns in updateProfile for now,
      // though AppError would be preferable if throwing from domain.
      throw new Error('A college can have a maximum of 20 achievements.');
    }
    
    // Ensure all achievements belong to this college
    const invalidCollegeId = achievements.find(a => a.collegeId !== this.id);
    if (invalidCollegeId) {
      throw new Error(`Achievement ${invalidCollegeId.id} does not belong to college ${this.id}`);
    }

    this.props.achievements = achievements;
    this.props.updatedAt = new Date().toISOString();
  }

  /**
   * Replaces the institution's testimonials.
   * Enforces the hard business invariant of maximum 10 testimonials per institution.
   */
  replaceTestimonials(testimonials: CollegeTestimonial[]): void {
    if (testimonials.length > 10) {
      throw new Error('A college can have a maximum of 10 testimonials.');
    }
    
    // Ensure all testimonials belong to this college
    const invalidCollegeId = testimonials.find(t => t.collegeId !== this.id);
    if (invalidCollegeId) {
      throw new Error(`Testimonial ${invalidCollegeId.id} does not belong to college ${this.id}`);
    }

    this.props.testimonials = testimonials;
    this.props.updatedAt = new Date().toISOString();
  }

  /**
   * Replaces the institution's accreditations.
   * Enforces the hard business invariant of maximum 15 accreditations per institution.
   */
  replaceAccreditations(accreditations: CollegeAccreditation[]): void {
    if (accreditations.length > 15) {
      throw new Error('A college can have a maximum of 15 accreditations.');
    }
    
    // Ensure all accreditations belong to this college
    const invalidCollegeId = accreditations.find(a => a.collegeId !== this.id);
    if (invalidCollegeId) {
      throw new Error(`Accreditation ${invalidCollegeId.id} does not belong to college ${this.id}`);
    }

    this.props.accreditations = accreditations;
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

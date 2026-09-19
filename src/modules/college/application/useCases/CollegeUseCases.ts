import { ICollegeRepository, CollegeSearchCriteria } from '../../domain/ICollegeRepository';
import { PublicCollegeDto, StaffCollegeProfileDto, UpdateCollegeProfileDto } from '../dtos';
import { AppError } from '../../../../shared/errors';
import { College } from '../../domain/models';

export class CollegeUseCases {
  constructor(private readonly collegeRepository: ICollegeRepository) {}

  async getPublicProfile(id: string): Promise<PublicCollegeDto> {
    const college = await this.collegeRepository.findById(id);
    
    if (!college) {
      throw new AppError('College not found', 404);
    }

    if (!college.isPubliclyDiscoverable()) {
      throw new AppError('College is not available for public discovery', 403);
    }

    return this.mapToPublicDto(college);
  }

  async getStaffCollegeProfile(id: string): Promise<StaffCollegeProfileDto> {
    const college = await this.collegeRepository.findById(id);
    
    if (!college) {
      throw new AppError('College not found', 404);
    }

    // Bypass isPubliclyDiscoverable() for staff

    return {
      ...this.mapToPublicDto(college),
      status: college.status,
      verificationStatus: college.verificationStatus,
    };
  }

  async updateStaffCollegeProfile(id: string, data: UpdateCollegeProfileDto): Promise<StaffCollegeProfileDto> {
    const college = await this.collegeRepository.findById(id);
    
    if (!college) {
      throw new AppError('College not found', 404);
    }

    college.updateProfile(data);
    await this.collegeRepository.save(college);

    return {
      ...this.mapToPublicDto(college),
      status: college.status,
      verificationStatus: college.verificationStatus,
    };
  }

  async searchActiveColleges(criteria: CollegeSearchCriteria): Promise<PublicCollegeDto[]> {
    const results = await this.collegeRepository.searchActiveVerified(criteria);
    return results.map(r => this.mapToPublicDto(r.college, r.matchedBranchId));
  }

  private mapToPublicDto(college: College, matchedBranchId?: string): PublicCollegeDto {
    return {
      matchedBranchId,
      id: college.id,
      name: college.name,
      shortName: college.shortName,
      description: college.description,
      website: college.website,
      contactPhone: college.contactPhone,
      contactEmail: college.contactEmail,
      ownershipType: college.ownershipType,
      branches: college.branches ? college.branches.map(b => ({
        id: b.id,
        name: b.name,
        type: b.type,
        locationName: b.locationName || null,
        hostel: {
          hasBoysHostel: b.hostel.hasBoysHostel,
          hasGirlsHostel: b.hostel.hasGirlsHostel,
          annualHostelFee: b.hostel.annualHostelFee,
        },
        offerings: b.offerings.map(o => ({
          streamCode: o.streamCode,
          tuitionFee: o.minFee,
        })),
      })) : [],
    };
  }
}

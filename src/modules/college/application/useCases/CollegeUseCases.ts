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
    const colleges = await this.collegeRepository.searchActiveVerified(criteria);
    return colleges.map(c => this.mapToPublicDto(c));
  }

  private mapToPublicDto(college: College): PublicCollegeDto {
    return {
      id: college.id,
      name: college.name,
      shortName: college.shortName,
      description: college.description,
      website: college.website,
      contactPhone: college.contactPhone,
      contactEmail: college.contactEmail,
      location: {
        state: college.location.state,
        district: college.location.district,
        city: college.location.city,
        address: college.location.address,
        lat: college.location.lat,
        lng: college.location.lng,
      },
      hostelSummary: {
        hasBoysHostel: college.hostels.some(h => h.hasBoysHostel),
        hasGirlsHostel: college.hostels.some(h => h.hasGirlsHostel),
        annualHostelFee: college.hostels.map(h => h.annualHostelFee).filter(f => f !== null).sort((a, b) => a! - b!)[0] ?? null,
      },
      ownershipType: college.ownershipType,
      offerings: college.offerings.map(o => ({
        streamCode: o.streamCode,
        tuitionFee: o.minFee,
      })),
    };
  }
}

import { ICollegeRepository, CollegeSearchCriteria } from '../../domain/ICollegeRepository';
import { PublicCollegeDto } from '../dtos';
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
        hasBoysHostel: college.hostelSummary.hasBoysHostel,
        hasGirlsHostel: college.hostelSummary.hasGirlsHostel,
        annualHostelFee: college.hostelSummary.annualHostelFee,
      },
      ownershipType: college.ownershipType,
      offerings: college.offerings.map(o => ({
        streamCode: o.streamCode,
        tuitionFee: o.tuitionFee,
      })),
    };
  }
}

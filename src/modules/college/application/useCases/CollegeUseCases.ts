import { ICollegeRepository, CollegeSearchCriteria } from '../../domain/ICollegeRepository';
import { PublicCollegeDto, PublicCollegeDetailDto, StaffCollegeProfileDto, UpdateCollegeProfileDto, SyncMediaDto, SyncAchievementsDto, CollegeAchievementDto, StaffCollegeAchievementDto, SyncTestimonialsDto, StaffCollegeTestimonialDto, CollegeTestimonialDto, SyncAccreditationsDto, StaffCollegeAccreditationDto, CollegeAccreditationDto } from '../dtos';
import { AppError } from '../../../../shared/errors';
import { College, LeadershipProfile, CollegeMedia, WeeklyMenu, CollegeAchievement, CollegeTestimonial, CollegeAccreditation } from '../../domain/models';
import { IStorageService } from '../../../../shared/storage/IStorageService';

export class CollegeUseCases {
  constructor(
    private readonly collegeRepository: ICollegeRepository,
    private readonly storageService: IStorageService
  ) {}

  async getPublicProfile(id: string): Promise<PublicCollegeDetailDto> {
    const college = await this.collegeRepository.findById(id);
    
    if (!college) {
      throw new AppError('College not found', 404);
    }

    if (!college.isPubliclyDiscoverable()) {
      throw new AppError('College is not available for public discovery', 403);
    }

    const baseDto = this.mapToPublicDto(college);
    baseDto.media = baseDto.media.filter(m => m.status === 'ACTIVE');

    const achievements: CollegeAchievementDto[] = (college.achievements || [])
      .filter(a => a.status === 'ACTIVE')
      .map(a => ({
        id: a.id,
        studentName: a.studentName,
        exam: a.exam,
        achievement: a.achievement,
        year: a.year,
        description: a.description,
        imageUrl: a.imageStorageKey ? this.storageService.getPublicUrl(a.imageStorageKey) : null,
        displayOrder: a.displayOrder,
      }));

    const testimonials: CollegeTestimonialDto[] = (college.testimonials || [])
      .filter(t => t.status === 'ACTIVE')
      .map(t => ({
        id: t.id,
        personName: t.personName,
        personType: t.personType,
        testimonialText: t.testimonialText,
        imageUrl: t.imageStorageKey ? this.storageService.getPublicUrl(t.imageStorageKey) : null,
        displayOrder: t.displayOrder,
      }));

    const accreditations: CollegeAccreditationDto[] = (college.accreditations || [])
      .filter(a => a.status === 'ACTIVE')
      .map(a => ({
        id: a.id,
        name: a.name,
        issuingBody: a.issuingBody,
        year: a.year,
        validUntilYear: a.validUntilYear,
        description: a.description,
        certificateUrl: a.certificateStorageKey ? this.storageService.getPublicUrl(a.certificateStorageKey) : null,
        verificationUrl: a.verificationUrl,
        displayOrder: a.displayOrder,
      }));

    return {
      ...baseDto,
      achievements,
      testimonials,
      accreditations,
    };
  }

  async getStaffCollegeProfile(id: string): Promise<StaffCollegeProfileDto> {
    const college = await this.collegeRepository.findById(id);
    
    if (!college) {
      throw new AppError('College not found', 404);
    }

    // Bypass isPubliclyDiscoverable() for staff

    const achievements: StaffCollegeAchievementDto[] = (college.achievements || []).map(a => ({
      id: a.id,
      studentName: a.studentName,
      exam: a.exam,
      achievement: a.achievement,
      year: a.year,
      description: a.description,
      imageUrl: a.imageStorageKey ? this.storageService.getPublicUrl(a.imageStorageKey) : null,
      displayOrder: a.displayOrder,
      status: a.status,
    }));

    const testimonials: StaffCollegeTestimonialDto[] = (college.testimonials || []).map(t => ({
      id: t.id,
      personName: t.personName,
      personType: t.personType,
      testimonialText: t.testimonialText,
      imageStorageKey: t.imageStorageKey,
      displayOrder: t.displayOrder,
      status: t.status,
    }));

    const accreditations: StaffCollegeAccreditationDto[] = (college.accreditations || []).map(a => ({
      id: a.id,
      name: a.name,
      issuingBody: a.issuingBody,
      year: a.year,
      validUntilYear: a.validUntilYear,
      description: a.description,
      certificateStorageKey: a.certificateStorageKey,
      verificationUrl: a.verificationUrl,
      displayOrder: a.displayOrder,
      status: a.status,
    }));

    return {
      ...this.mapToPublicDto(college),
      status: college.status,
      verificationStatus: college.verificationStatus,
      achievements,
      testimonials,
      accreditations,
    };
  }

  async updateStaffCollegeProfile(id: string, data: UpdateCollegeProfileDto): Promise<StaffCollegeProfileDto> {
    const college = await this.collegeRepository.findById(id);
    
    if (!college) {
      throw new AppError('College not found', 404);
    }

    const updateData: any = { ...data };
    if (data.leadership) {
      updateData.leadership = data.leadership.map(l => LeadershipProfile.create({
        ...l,
        collegeId: id
      }));
    }

    college.updateProfile(updateData);
    await this.collegeRepository.save(college);

    return this.getStaffCollegeProfile(id);
  }

  async generateMediaUploadUrl(id: string, contentType: string, size: number) {
    const MAX_SIZE_MB = contentType.startsWith('video/') ? 50 : 5;
    const maxSizeInBytes = MAX_SIZE_MB * 1024 * 1024;
    
    if (size > maxSizeInBytes) {
      throw new AppError(`File exceeds maximum size of ${MAX_SIZE_MB}MB`, 400);
    }

    const college = await this.collegeRepository.findById(id);
    if (!college) {
      throw new AppError('College not found', 404);
    }

    const ext = contentType.split('/')[1] || 'bin';
    const timestamp = Date.now();
    const storageKey = `colleges/${id}/media/${timestamp}.${ext}`;
    
    const { uploadUrl, method } = await this.storageService.generateUploadUrl(storageKey, contentType, maxSizeInBytes);

    return { uploadUrl, method, storageKey };
  }

  async syncMedia(id: string, data: SyncMediaDto): Promise<StaffCollegeProfileDto> {
    const college = await this.collegeRepository.findById(id);
    
    if (!college) {
      throw new AppError('College not found', 404);
    }

    const imageCount = data.media.filter(m => m.mediaType === 'IMAGE').length;
    if (imageCount > 5) {
      throw new AppError('Maximum of 5 images allowed per college', 400);
    }

    const coverCount = data.media.filter(m => m.isCover).length;
    if (coverCount > 1) {
      throw new AppError('Only one media item can be set as cover', 400);
    }

    const invalidCover = data.media.find(m => m.isCover && (m.mediaType !== 'IMAGE' || m.status === 'INACTIVE'));
    if (invalidCover) {
      throw new AppError('Only ACTIVE images can be set as cover', 400);
    }

    const newMediaList = data.media.map(m => CollegeMedia.create({
      id: m.id || crypto.randomUUID(),
      collegeId: college.id,
      mediaType: m.mediaType,
      storageKey: m.storageKey || null,
      thumbnailStorageKey: m.thumbnailStorageKey || null,
      externalUrl: m.externalUrl || null,
      caption: m.caption || null,
      displayOrder: m.displayOrder,
      isCover: m.isCover,
      status: m.status,
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString(),
    } as any));

    college.updateProfile({ media: newMediaList });

    await this.collegeRepository.save(college);

    return this.getStaffCollegeProfile(id);
  }

  async syncAchievements(id: string, data: SyncAchievementsDto): Promise<StaffCollegeProfileDto> {
    const college = await this.collegeRepository.findById(id);
    
    if (!college) {
      throw new AppError('College not found', 404);
    }

    // Explicit cross-college ID ownership validation
    const incomingIds = data.achievements.filter(a => a.id).map(a => a.id as string);
    if (incomingIds.length > 0) {
      const existingIds = new Set(college.achievements.map(a => a.id));
      const invalidIds = incomingIds.filter(incomingId => !existingIds.has(incomingId));
      if (invalidIds.length > 0) {
        throw new AppError(`Cannot modify achievements not belonging to this college: ${invalidIds.join(', ')}`, 400);
      }
    }

    const newAchievements = data.achievements.map(a => CollegeAchievement.create({
      id: a.id || crypto.randomUUID(),
      collegeId: college.id,
      studentName: a.studentName,
      exam: a.exam,
      achievement: a.achievement,
      year: a.year,
      description: a.description || null,
      imageStorageKey: a.imageStorageKey || null,
      displayOrder: a.displayOrder,
      status: a.status,
    }));

    college.replaceAchievements(newAchievements);

    await this.collegeRepository.save(college);

    return this.getStaffCollegeProfile(id);
  }

  async syncTestimonials(id: string, data: SyncTestimonialsDto): Promise<StaffCollegeProfileDto> {
    const college = await this.collegeRepository.findById(id);
    
    if (!college) {
      throw new AppError('College not found', 404);
    }

    // Explicit cross-college ID ownership validation
    const incomingIds = (data.testimonials || []).filter(t => t.id).map(t => t.id as string);
    if (incomingIds.length > 0) {
      const existingIds = new Set(college.testimonials.map(t => t.id));
      const invalidIds = incomingIds.filter(incomingId => !existingIds.has(incomingId));
      if (invalidIds.length > 0) {
        throw new AppError(`Cannot modify testimonials not belonging to this college: ${invalidIds.join(', ')}`, 400);
      }
    }

    const newTestimonials = (data.testimonials || []).map(t => CollegeTestimonial.create({
      id: t.id || crypto.randomUUID(),
      collegeId: college.id,
      personName: t.personName,
      personType: t.personType,
      testimonialText: t.testimonialText,
      imageStorageKey: t.imageStorageKey || null,
      displayOrder: t.displayOrder,
      status: t.status,
    }));

    try {
      college.replaceTestimonials(newTestimonials);
    } catch (err: any) {
      throw new AppError(err.message, 400);
    }

    await this.collegeRepository.save(college);

    return this.getStaffCollegeProfile(id);
  }

  async syncAccreditations(id: string, data: SyncAccreditationsDto): Promise<StaffCollegeProfileDto> {
    const college = await this.collegeRepository.findById(id);
    
    if (!college) {
      throw new AppError('College not found', 404);
    }

    // Duplicate IDs in submission check
    const incomingIds = (data.accreditations || []).filter(a => a.id).map(a => a.id as string);
    const uniqueIds = new Set(incomingIds);
    if (uniqueIds.size !== incomingIds.length) {
      throw new AppError('Duplicate accreditation IDs in submission', 400);
    }

    // Explicit cross-college ID ownership validation
    if (incomingIds.length > 0) {
      const existingIds = new Set(college.accreditations.map(a => a.id));
      const invalidIds = incomingIds.filter(incomingId => !existingIds.has(incomingId));
      if (invalidIds.length > 0) {
        throw new AppError(`Cannot modify accreditations not belonging to this college: ${invalidIds.join(', ')}`, 400);
      }
    }

    const newAccreditations = (data.accreditations || []).map(a => CollegeAccreditation.create({
      id: a.id || crypto.randomUUID(),
      collegeId: college.id,
      name: a.name,
      issuingBody: a.issuingBody,
      year: a.year ?? null,
      validUntilYear: a.validUntilYear ?? null,
      description: a.description ?? null,
      certificateStorageKey: a.certificateStorageKey ?? null,
      verificationUrl: a.verificationUrl ?? null,
      displayOrder: a.displayOrder,
      status: a.status,
    }));

    try {
      college.replaceAccreditations(newAccreditations);
    } catch (err: any) {
      throw new AppError(err.message, 400);
    }

    await this.collegeRepository.save(college);

    return this.getStaffCollegeProfile(id);
  }

  async updateWeeklyMenu(id: string, menuInput: unknown): Promise<StaffCollegeProfileDto> {
    const college = await this.collegeRepository.findById(id);
    
    if (!college) {
      throw new AppError('College not found', 404);
    }

    const weeklyMenu = WeeklyMenu.create(menuInput);
    college.updateProfile({ weeklyMenu });
    
    await this.collegeRepository.save(college);

    return this.getStaffCollegeProfile(id);
  }

  async clearWeeklyMenu(id: string): Promise<StaffCollegeProfileDto> {
    const college = await this.collegeRepository.findById(id);
    
    if (!college) {
      throw new AppError('College not found', 404);
    }

    college.updateProfile({ weeklyMenu: null });
    
    await this.collegeRepository.save(college);

    return this.getStaffCollegeProfile(id);
  }

  async searchActiveColleges(criteria: CollegeSearchCriteria): Promise<PublicCollegeDto[]> {
    const results = await this.collegeRepository.searchActiveVerified(criteria);
    return results.map(r => {
      const dto = this.mapToPublicDto(r.college, r.matchedBranchId);
      dto.media = dto.media.filter(m => m.status === 'ACTIVE');
      return dto;
    });
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
      leadership: college.leadership ? college.leadership.map(l => ({
        id: l.id,
        name: l.name,
        designation: l.designation,
        bio: l.bio,
        imageUrl: l.imageUrl,
        displayOrder: l.displayOrder,
      })) : [],
      media: college.media ? college.media.map(m => ({
        id: m.id,
        mediaType: m.mediaType,
        url: m.storageKey ? this.storageService.getPublicUrl(m.storageKey) : (m.externalUrl || undefined),
        caption: m.caption,
        displayOrder: m.displayOrder,
        isCover: m.isCover,
        status: m.status,
      })) : [],
    };
  }
}

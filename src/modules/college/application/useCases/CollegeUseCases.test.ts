import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CollegeUseCases } from './CollegeUseCases';
import { ICollegeRepository, CollegeSearchCriteria } from '../../domain/ICollegeRepository';
import { College, CollegeStreamOffering, CollegeAchievement, CollegeTestimonial, CollegeAccreditation } from '../../domain/models';
import { CollegeMedia } from '../../domain/CollegeMedia';
import { AppError } from '../../../../shared/errors';
import { IStorageService } from '../../../../shared/storage/IStorageService';

describe('CollegeUseCases', () => {
  let useCases: CollegeUseCases;
  let mockRepo: ICollegeRepository;
  let mockStorageService: IStorageService;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      searchActiveVerified: vi.fn(),
      save: vi.fn(),
    };
    mockStorageService = {
      generateUploadUrl: vi.fn(),
      getPublicUrl: vi.fn(),
      deleteObject: vi.fn(),
    };
    useCases = new CollegeUseCases(mockRepo, mockStorageService);
  });

  const createMockCollege = (status: 'DRAFT' | 'ACTIVE' | 'INACTIVE', verificationStatus: 'UNVERIFIED' | 'VERIFIED') => {
    return College.create({
      id: 'col-1',
      name: 'Test College',
      shortName: null,
      description: null,
      website: null,
      contactPhone: null,
      contactEmail: null,
      ownershipType: 'PRIVATE',
      status,
      verificationStatus,
      leadership: [],
      media: [],
      achievements: [],
      weeklyMenu: null,
      branches: [
        {
          id: 'branch-1',
          name: 'Main Branch',
          type: 'MAIN_CAMPUS',
          locationId: 'loc-1',
          locationName: 'Test Loc',
          address: 'Test Addr',
          lat: null,
          lng: null,
          contactPhone: null,
          contactEmail: null,
          isPubliclyEligible: true,
          hostel: {
            branchId: 'branch-1',
            hasBoysHostel: true,
            hasGirlsHostel: false,
            annualHostelFee: 50000,
          },
          offerings: [
            CollegeStreamOffering.create({
              id: 'off-1',
              branchId: 'branch-1',
              streamCode: 'MPC',
              minFee: 100000,
              maxFee: 100000,
            })
          ],
        } as any // Mock casting for simplicity in test setup
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  describe('Visibility Rules', () => {
    it('returns a college profile if it is ACTIVE and VERIFIED', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);

      const profile = await useCases.getPublicProfile('col-1');
      expect(profile).toBeDefined();
      expect(profile.id).toBe('col-1');
      
      // DTO check
      expect(profile).not.toHaveProperty('createdAt');
      expect(profile).not.toHaveProperty('status');
      expect(profile.branches[0].offerings[0].streamCode).toBe('MPC');
    });

    it('returns public profile with ACTIVE achievements only', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      activeVerified.replaceAchievements([
        CollegeAchievement.create({ id: 'a2', collegeId: 'col-1', studentName: 'Sita', exam: 'NEET', achievement: 'Rank 2', year: 2026, description: null, imageStorageKey: null, displayOrder: 1, status: 'ACTIVE', createdAt: '', updatedAt: '' }),
        CollegeAchievement.create({ id: 'a1', collegeId: 'col-1', studentName: 'Ravi', exam: 'JEE', achievement: 'Rank 1', year: 2026, description: null, imageStorageKey: 'keys/a1.jpg', displayOrder: 2, status: 'ACTIVE', createdAt: '', updatedAt: '' }),
        CollegeAchievement.create({ id: 'a3', collegeId: 'col-1', studentName: 'Ram', exam: 'JEE', achievement: 'Rank 3', year: 2026, description: null, imageStorageKey: null, displayOrder: 3, status: 'INACTIVE', createdAt: '', updatedAt: '' })
      ]);
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);
      vi.mocked(mockStorageService.getPublicUrl).mockReturnValue('https://mock-url/a1.jpg');

      const profile = await useCases.getPublicProfile('col-1');
      expect(profile.achievements).toHaveLength(2);
      
      // Sorted by display order
      expect(profile.achievements[0].id).toBe('a2');
      expect(profile.achievements[1].id).toBe('a1');
      
      // Image URL resolution
      expect(profile.achievements[1].imageUrl).toBe('https://mock-url/a1.jpg');
      expect(profile.achievements[0].imageUrl).toBeNull();
      
      // Internal fields omitted
      expect(profile.achievements[0]).not.toHaveProperty('imageStorageKey');
      expect(profile.achievements[0]).not.toHaveProperty('status');
      expect(profile.achievements[0]).not.toHaveProperty('collegeId');
      expect(profile.achievements[0]).not.toHaveProperty('createdAt');
    });

    it('returns public profile with ACTIVE testimonials only and resolves imageUrl', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      activeVerified.replaceTestimonials([
        CollegeTestimonial.create({
          id: 't-1',
          collegeId: 'col-1',
          personName: 'Ravi Kumar',
          personType: 'STUDENT',
          testimonialText: 'Best college for MPC',
          imageStorageKey: 'colleges/1/testimonials/ravi.webp',
          displayOrder: 1,
          status: 'ACTIVE',
        }),
        CollegeTestimonial.create({
          id: 't-2',
          collegeId: 'col-1',
          personName: 'Suresh Kumar',
          personType: 'PARENT',
          testimonialText: 'Great faculty and guidance',
          imageStorageKey: null,
          displayOrder: 2,
          status: 'ACTIVE',
        }),
        CollegeTestimonial.create({
          id: 't-3',
          collegeId: 'col-1',
          personName: 'Inactive Person',
          personType: 'ALUMNI',
          testimonialText: 'Should not appear',
          imageStorageKey: 'colleges/1/testimonials/inactive.webp',
          displayOrder: 3,
          status: 'INACTIVE',
        }),
      ]);
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);
      vi.mocked(mockStorageService.getPublicUrl).mockReturnValue('https://mock-url/ravi.webp');

      const profile = await useCases.getPublicProfile('col-1');
      expect(profile.testimonials).toBeDefined();
      expect(profile.testimonials).toHaveLength(2);

      // 1. ACTIVE only (t-3 is excluded)
      expect(profile.testimonials.map(t => t.id)).toEqual(['t-1', 't-2']);

      // 2. Image resolution
      expect(profile.testimonials[0].imageUrl).toBe('https://mock-url/ravi.webp');
      expect(profile.testimonials[1].imageUrl).toBeNull();

      // 3. Display order preserved
      expect(profile.testimonials[0].displayOrder).toBe(1);
      expect(profile.testimonials[1].displayOrder).toBe(2);

      // 4. Content fields correct
      expect(profile.testimonials[0].personName).toBe('Ravi Kumar');
      expect(profile.testimonials[0].personType).toBe('STUDENT');
      expect(profile.testimonials[0].testimonialText).toBe('Best college for MPC');

      // 5. Internal fields omitted from public DTO
      expect(profile.testimonials[0]).not.toHaveProperty('imageStorageKey');
      expect(profile.testimonials[0]).not.toHaveProperty('status');
      expect(profile.testimonials[0]).not.toHaveProperty('collegeId');
      expect(profile.testimonials[0]).not.toHaveProperty('createdAt');
      expect(profile.testimonials[0]).not.toHaveProperty('updatedAt');

      // 6. Existing achievements, media, leadership, branches remain intact
      expect(profile.branches).toBeDefined();
      expect(profile.leadership).toBeDefined();
      expect(profile.media).toBeDefined();
      expect(profile.achievements).toBeDefined();
    });

    it('returns empty array for testimonials when college has no testimonials', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);

      const profile = await useCases.getPublicProfile('col-1');
      expect(profile.testimonials).toEqual([]);
    });

    it('returns public detail containing ACTIVE accreditations with resolved certificateUrl and excludes INACTIVE accreditations', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      activeVerified.replaceAccreditations([
        CollegeAccreditation.create({
          id: 'acc-1',
          collegeId: 'col-1',
          name: 'NAAC A+ Grade',
          issuingBody: 'NAAC',
          year: 2024,
          validUntilYear: 2029,
          description: 'Top grade institutional accreditation',
          certificateStorageKey: 'colleges/1/accreditations/naac.pdf',
          verificationUrl: 'https://naac.gov.in/verify/123',
          displayOrder: 1,
          status: 'ACTIVE',
        }),
        CollegeAccreditation.create({
          id: 'acc-2',
          collegeId: 'col-1',
          name: 'NBA Tier 1',
          issuingBody: 'NBA',
          year: null,
          validUntilYear: null,
          description: null,
          certificateStorageKey: null,
          verificationUrl: null,
          displayOrder: 2,
          status: 'ACTIVE',
        }),
        CollegeAccreditation.create({
          id: 'acc-3',
          collegeId: 'col-1',
          name: 'Expired ISO',
          issuingBody: 'ISO',
          year: 2018,
          validUntilYear: 2021,
          description: 'Old ISO',
          certificateStorageKey: 'colleges/1/accreditations/iso.pdf',
          verificationUrl: null,
          displayOrder: 3,
          status: 'INACTIVE',
        }),
      ]);
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);
      vi.mocked(mockStorageService.getPublicUrl).mockReturnValue('https://mock-url/naac.pdf');

      const profile = await useCases.getPublicProfile('col-1');
      expect(profile.accreditations).toBeDefined();
      expect(profile.accreditations).toHaveLength(2);

      // 1. ACTIVE only (acc-3 is excluded)
      expect(profile.accreditations.map(a => a.id)).toEqual(['acc-1', 'acc-2']);

      // 2. Certificate URL resolution (key -> public url, null -> null)
      expect(profile.accreditations[0].certificateUrl).toBe('https://mock-url/naac.pdf');
      expect(mockStorageService.getPublicUrl).toHaveBeenCalledWith('colleges/1/accreditations/naac.pdf');
      expect(profile.accreditations[1].certificateUrl).toBeNull();

      // 3. Display order preserved
      expect(profile.accreditations[0].displayOrder).toBe(1);
      expect(profile.accreditations[1].displayOrder).toBe(2);

      // 4. Content fields correct
      expect(profile.accreditations[0].name).toBe('NAAC A+ Grade');
      expect(profile.accreditations[0].issuingBody).toBe('NAAC');
      expect(profile.accreditations[0].year).toBe(2024);
      expect(profile.accreditations[0].validUntilYear).toBe(2029);
      expect(profile.accreditations[0].description).toBe('Top grade institutional accreditation');
      expect(profile.accreditations[0].verificationUrl).toBe('https://naac.gov.in/verify/123');

      // 5. Internal fields omitted from public DTO
      expect(profile.accreditations[0]).not.toHaveProperty('certificateStorageKey');
      expect(profile.accreditations[0]).not.toHaveProperty('status');
      expect(profile.accreditations[0]).not.toHaveProperty('collegeId');
      expect(profile.accreditations[0]).not.toHaveProperty('createdAt');
      expect(profile.accreditations[0]).not.toHaveProperty('updatedAt');

      // 6. Existing achievements, testimonials, media, leadership, branches remain intact
      expect(profile.branches).toBeDefined();
      expect(profile.leadership).toBeDefined();
      expect(profile.media).toBeDefined();
      expect(profile.achievements).toBeDefined();
      expect(profile.testimonials).toBeDefined();
    });

    it('returns empty array for accreditations when college has no accreditations', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);

      const profile = await useCases.getPublicProfile('col-1');
      expect(profile.accreditations).toEqual([]);
    });

    it('rejects an ACTIVE but UNVERIFIED college', async () => {
      const activeUnverified = createMockCollege('ACTIVE', 'UNVERIFIED');
      vi.mocked(mockRepo.findById).mockResolvedValue(activeUnverified);

      await expect(useCases.getPublicProfile('col-1')).rejects.toThrow(AppError);
    });

    it('rejects an INACTIVE but VERIFIED college', async () => {
      const inactiveVerified = createMockCollege('INACTIVE', 'VERIFIED');
      vi.mocked(mockRepo.findById).mockResolvedValue(inactiveVerified);

      await expect(useCases.getPublicProfile('col-1')).rejects.toThrow(AppError);
    });

    it('rejects a DRAFT college', async () => {
      const draft = createMockCollege('DRAFT', 'VERIFIED');
      vi.mocked(mockRepo.findById).mockResolvedValue(draft);

      await expect(useCases.getPublicProfile('col-1')).rejects.toThrow(AppError);
    });
  });

  describe('Staff Profile Retrieval', () => {
    it('returns the profile with internal fields even if DRAFT or UNVERIFIED', async () => {
      const draftUnverified = createMockCollege('DRAFT', 'UNVERIFIED');
      vi.mocked(mockRepo.findById).mockResolvedValue(draftUnverified);

      const profile = await useCases.getStaffCollegeProfile('col-1');
      expect(profile).toBeDefined();
      expect(profile.id).toBe('col-1');
      
      // Should include staff-only fields
      expect(profile.status).toBe('DRAFT');
      expect(profile.verificationStatus).toBe('UNVERIFIED');
    });

    it('returns staff profile including INACTIVE achievements with status', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      activeVerified.replaceAchievements([
        CollegeAchievement.create({ id: 'a1', collegeId: 'col-1', studentName: 'Ravi', exam: 'JEE', achievement: 'Rank 1', year: 2026, description: null, imageStorageKey: null, displayOrder: 1, status: 'ACTIVE', createdAt: '', updatedAt: '' }),
        CollegeAchievement.create({ id: 'a3', collegeId: 'col-1', studentName: 'Ram', exam: 'JEE', achievement: 'Rank 3', year: 2026, description: null, imageStorageKey: null, displayOrder: 2, status: 'INACTIVE', createdAt: '', updatedAt: '' })
      ]);
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);

      const profile = await useCases.getStaffCollegeProfile('col-1');
      expect(profile.achievements).toHaveLength(2);
      expect(profile.achievements[1].status).toBe('INACTIVE');
    });

    it('rejects if college not found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null);
      await expect(useCases.getStaffCollegeProfile('col-1')).rejects.toThrow(AppError);
    });
  });

  describe('Staff Profile Update', () => {
    it('updates allowed fields and saves the college', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);

      const updateData = {
        shortName: 'Updated Short',
        description: 'Updated Desc',
        leadership: [
          {
            id: 'l-1',
            collegeId: 'col-1',
            name: 'John Doe',
            designation: 'Principal',
            bio: 'Bio',
            imageUrl: null,
            displayOrder: 1
          }
        ]
      };

      const updatedProfile = await useCases.updateStaffCollegeProfile('col-1', updateData as any);

      expect(updatedProfile.shortName).toBe('Updated Short');
      expect(updatedProfile.description).toBe('Updated Desc');
      expect(updatedProfile.leadership).toHaveLength(1);
      expect(updatedProfile.leadership[0].name).toBe('John Doe');
      
      expect(mockRepo.save).toHaveBeenCalledWith(activeVerified);
    });

    it('rejects update if college not found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null);
      await expect(useCases.updateStaffCollegeProfile('col-1', {})).rejects.toThrow(AppError);
    });
  });

  describe('Media Management and Visibility', () => {
    it('filters out INACTIVE media from public profile', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      activeVerified.updateProfile({
        media: [
          CollegeMedia.create({ id: 'm1', collegeId: 'col-1', mediaType: 'IMAGE', status: 'ACTIVE', displayOrder: 1, isCover: false, storageKey: 'test1.jpg', createdAt: '', updatedAt: '' } as any),
          CollegeMedia.create({ id: 'm2', collegeId: 'col-1', mediaType: 'IMAGE', status: 'INACTIVE', displayOrder: 2, isCover: false, storageKey: 'test2.jpg', createdAt: '', updatedAt: '' } as any)
        ]
      });
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);
      vi.mocked(mockStorageService.getPublicUrl).mockReturnValue('https://mock-url');

      const profile = await useCases.getPublicProfile('col-1');
      expect(profile.media).toHaveLength(1);
      expect(profile.media[0].id).toBe('m1'); // m1 is ACTIVE
    });

    it('includes INACTIVE media in staff profile', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      activeVerified.updateProfile({
        media: [
          CollegeMedia.create({ id: 'm1', collegeId: 'col-1', mediaType: 'IMAGE', status: 'ACTIVE', displayOrder: 1, isCover: false, storageKey: 'test1.jpg', createdAt: '', updatedAt: '' } as any),
          CollegeMedia.create({ id: 'm2', collegeId: 'col-1', mediaType: 'IMAGE', status: 'INACTIVE', displayOrder: 2, isCover: false, storageKey: 'test2.jpg', createdAt: '', updatedAt: '' } as any)
        ]
      });
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);
      vi.mocked(mockStorageService.getPublicUrl).mockReturnValue('https://mock-url');

      const profile = await useCases.getStaffCollegeProfile('col-1');
      expect(profile.media).toHaveLength(2);
      expect(profile.media[0].id).toBe('m1');
      expect(profile.media[1].id).toBe('m2');
    });

    it('rejects syncMedia if more than 5 images are provided', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);

      const mediaPayload = Array.from({ length: 6 }).map((_, i) => ({
        id: `m${i}`, mediaType: 'IMAGE', status: 'ACTIVE', displayOrder: i, isCover: false
      }));

      await expect(useCases.syncMedia('col-1', { media: mediaPayload as any })).rejects.toThrow(/Maximum of 5 images/);
    });

    it('rejects syncMedia if more than one cover is provided', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);

      const mediaPayload = [
        { id: 'm1', mediaType: 'IMAGE', status: 'ACTIVE', displayOrder: 1, isCover: true },
        { id: 'm2', mediaType: 'IMAGE', status: 'ACTIVE', displayOrder: 2, isCover: true }
      ];

      await expect(useCases.syncMedia('col-1', { media: mediaPayload as any })).rejects.toThrow(/Only one media item can be set as cover/);
    });

    it('rejects syncMedia if VIDEO or VIRTUAL_TOUR is set as cover', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);

      const mediaPayload = [
        { id: 'm1', mediaType: 'VIDEO', status: 'ACTIVE', displayOrder: 1, isCover: true }
      ];

      await expect(useCases.syncMedia('col-1', { media: mediaPayload as any })).rejects.toThrow(/Only ACTIVE images can be set as cover/);
    });

    it('rejects syncMedia if INACTIVE image is set as cover', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);

      const mediaPayload = [
        { id: 'm1', mediaType: 'IMAGE', status: 'INACTIVE', displayOrder: 1, isCover: true }
      ];

      await expect(useCases.syncMedia('col-1', { media: mediaPayload as any })).rejects.toThrow(/Only ACTIVE images can be set as cover/);
    });
  });

  describe('Achievements Management', () => {
    it('successfully syncs a new achievement collection', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);

      const payload = {
        achievements: [
          {
            studentName: 'Ravi',
            exam: 'JEE',
            achievement: 'AIR 1',
            year: 2026,
            description: null,
            imageStorageKey: null,
            displayOrder: 1,
            status: 'ACTIVE' as const
          }
        ]
      };

      await useCases.syncAchievements('col-1', payload);

      expect(mockRepo.save).toHaveBeenCalled();
      const savedCollege = vi.mocked(mockRepo.save).mock.calls[0][0];
      expect(savedCollege.achievements).toHaveLength(1);
      expect(savedCollege.achievements[0].studentName).toBe('Ravi');
    });

    it('rejects update if college not found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null);
      await expect(useCases.syncAchievements('col-1', { achievements: [] })).rejects.toThrow(AppError);
    });

    it('rejects if an achievement ID belongs to another college', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);

      const payload = {
        achievements: [
          {
            id: 'id-from-another-college', // Not in existing achievements
            studentName: 'Ravi',
            exam: 'JEE',
            achievement: 'AIR 1',
            year: 2026,
            description: null,
            imageStorageKey: null,
            displayOrder: 1,
            status: 'ACTIVE' as const
          }
        ]
      };

      await expect(useCases.syncAchievements('col-1', payload)).rejects.toThrow(/Cannot modify achievements not belonging to this college/);
    });
  });

  describe('Testimonials Management', () => {
    it('successfully syncs a new testimonial collection and returns staff profile with testimonials', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);

      const payload = {
        testimonials: [
          {
            personName: 'Ravi Kumar',
            personType: 'STUDENT' as const,
            testimonialText: 'Great institute experience.',
            imageStorageKey: 'colleges/col-1/testimonials/ravi.webp',
            displayOrder: 0,
            status: 'ACTIVE' as const,
          },
          {
            personName: 'Suresh Kumar',
            personType: 'PARENT' as const,
            testimonialText: 'Very supportive faculty.',
            imageStorageKey: null,
            displayOrder: 1,
            status: 'INACTIVE' as const,
          }
        ]
      };

      const result = await useCases.syncTestimonials('col-1', payload);

      expect(mockRepo.findById).toHaveBeenCalledWith('col-1');
      expect(mockRepo.save).toHaveBeenCalledTimes(1);
      const savedCollege = vi.mocked(mockRepo.save).mock.calls[0][0];
      expect(savedCollege.testimonials).toHaveLength(2);
      expect(savedCollege.testimonials[0].personName).toBe('Ravi Kumar');
      expect(savedCollege.testimonials[1].personName).toBe('Suresh Kumar');

      expect(result.testimonials).toBeDefined();
      expect(result.testimonials).toHaveLength(2);
      expect(result.testimonials![0].personName).toBe('Ravi Kumar');
      expect(result.testimonials![0].status).toBe('ACTIVE');
      expect(result.testimonials![1].personName).toBe('Suresh Kumar');
      expect(result.testimonials![1].status).toBe('INACTIVE');
    });

    it('rejects update if college not found (404)', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null);
      await expect(useCases.syncTestimonials('col-1', { testimonials: [] })).rejects.toThrow(AppError);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('rejects if a testimonial ID belongs to another college and does not save', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      // activeVerified has no existing testimonials, so any submitted ID is foreign to this aggregate
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);

      const payload = {
        testimonials: [
          {
            id: 'foreign-testi-id',
            personName: 'Foreign Person',
            personType: 'STUDENT' as const,
            testimonialText: 'Foreign text',
            imageStorageKey: null,
            displayOrder: 0,
            status: 'ACTIVE' as const,
          }
        ]
      };

      await expect(useCases.syncTestimonials('col-1', payload)).rejects.toThrow(/Cannot modify testimonials not belonging to this college/);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('allows updating an existing testimonial belonging to this college', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      const existingTesti = CollegeTestimonial.create({
        id: 'existing-id-1',
        collegeId: 'col-1',
        personName: 'Original Name',
        personType: 'STUDENT',
        testimonialText: 'Original text',
        displayOrder: 0,
        status: 'ACTIVE',
      });
      activeVerified.replaceTestimonials([existingTesti]);

      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);

      const payload = {
        testimonials: [
          {
            id: 'existing-id-1',
            personName: 'Updated Name',
            personType: 'STUDENT' as const,
            testimonialText: 'Updated text',
            imageStorageKey: null,
            displayOrder: 0,
            status: 'ACTIVE' as const,
          }
        ]
      };

      const result = await useCases.syncTestimonials('col-1', payload);

      expect(mockRepo.save).toHaveBeenCalledTimes(1);
      expect(result.testimonials).toHaveLength(1);
      expect(result.testimonials![0].id).toBe('existing-id-1');
      expect(result.testimonials![0].personName).toBe('Updated Name');
    });

    it('removes omitted testimonials (empty collection)', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      const existingTesti = CollegeTestimonial.create({
        id: 'existing-id-1',
        collegeId: 'col-1',
        personName: 'Original Name',
        personType: 'STUDENT',
        testimonialText: 'Original text',
        displayOrder: 0,
        status: 'ACTIVE',
      });
      activeVerified.replaceTestimonials([existingTesti]);

      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);

      const result = await useCases.syncTestimonials('col-1', { testimonials: [] });

      expect(mockRepo.save).toHaveBeenCalledTimes(1);
      const savedCollege = vi.mocked(mockRepo.save).mock.calls[0][0];
      expect(savedCollege.testimonials).toHaveLength(0);
      expect(result.testimonials).toEqual([]);
    });

    it('rejects if more than 10 testimonials are submitted (aggregate invariant)', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);

      const elevenTestimonials = Array.from({ length: 11 }).map((_, i) => ({
        personName: `Person ${i}`,
        personType: 'STUDENT' as const,
        testimonialText: `Text ${i}`,
        displayOrder: i,
        status: 'ACTIVE' as const,
      }));

      await expect(useCases.syncTestimonials('col-1', { testimonials: elevenTestimonials }))
        .rejects.toThrow(/maximum of 10 testimonials/);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('Accreditations Management (C9.7.2)', () => {
    it('successfully syncs a new accreditation collection', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);

      const payload = {
        accreditations: [
          {
            name: 'NAAC A+ Grade',
            issuingBody: 'NAAC',
            year: 2024,
            validUntilYear: 2029,
            description: 'Accreditation description',
            certificateStorageKey: 'keys/cert1.pdf',
            verificationUrl: 'https://naac.gov.in/verify',
            displayOrder: 1,
            status: 'ACTIVE' as const,
          }
        ]
      };

      const result = await useCases.syncAccreditations('col-1', payload);

      expect(mockRepo.findById).toHaveBeenCalledWith('col-1');
      expect(mockRepo.save).toHaveBeenCalledTimes(1);
      const savedCollege = vi.mocked(mockRepo.save).mock.calls[0][0];
      expect(savedCollege.accreditations).toHaveLength(1);
      expect(savedCollege.accreditations[0].name).toBe('NAAC A+ Grade');
      expect(savedCollege.accreditations[0].issuingBody).toBe('NAAC');
      expect(result.accreditations).toHaveLength(1);
      expect(result.accreditations![0].name).toBe('NAAC A+ Grade');
    });

    it('rejects if college not found (404)', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null);

      await expect(useCases.syncAccreditations('col-1', { accreditations: [] }))
        .rejects.toThrow('College not found');
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('rejects if foreign accreditation ID is supplied (cross-college security defense)', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);

      const payload = {
        accreditations: [
          {
            id: 'foreign-id-from-another-college',
            name: 'NAAC A+ Grade',
            issuingBody: 'NAAC',
            displayOrder: 1,
            status: 'ACTIVE' as const,
          }
        ]
      };

      await expect(useCases.syncAccreditations('col-1', payload))
        .rejects.toThrow(/Cannot modify accreditations not belonging to this college/);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('rejects duplicate IDs in the same submitted collection', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);

      const payload = {
        accreditations: [
          {
            id: 'duplicate-id',
            name: 'Accreditation 1',
            issuingBody: 'NAAC',
            displayOrder: 0,
            status: 'ACTIVE' as const,
          },
          {
            id: 'duplicate-id',
            name: 'Accreditation 2',
            issuingBody: 'NBA',
            displayOrder: 1,
            status: 'ACTIVE' as const,
          }
        ]
      };

      await expect(useCases.syncAccreditations('col-1', payload))
        .rejects.toThrow(/Duplicate accreditation IDs in submission/);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });

    it('allows updating an existing accreditation belonging to this college', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      const existingAcc = CollegeAccreditation.create({
        id: 'existing-acc-1',
        collegeId: 'col-1',
        name: 'Original Accreditation',
        issuingBody: 'NAAC',
        year: 2024,
        validUntilYear: 2029,
        displayOrder: 0,
        status: 'ACTIVE',
      });
      activeVerified.replaceAccreditations([existingAcc]);

      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);

      const payload = {
        accreditations: [
          {
            id: 'existing-acc-1',
            name: 'Updated Accreditation Name',
            issuingBody: 'NAAC Updated',
            year: 2024,
            validUntilYear: 2029,
            displayOrder: 0,
            status: 'ACTIVE' as const,
          }
        ]
      };

      const result = await useCases.syncAccreditations('col-1', payload);

      expect(mockRepo.save).toHaveBeenCalledTimes(1);
      expect(result.accreditations).toHaveLength(1);
      expect(result.accreditations![0].id).toBe('existing-acc-1');
      expect(result.accreditations![0].name).toBe('Updated Accreditation Name');
      expect(result.accreditations![0].issuingBody).toBe('NAAC Updated');
    });

    it('removes omitted accreditations (full replacement / empty collection)', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      const existingAcc = CollegeAccreditation.create({
        id: 'existing-acc-1',
        collegeId: 'col-1',
        name: 'Original Accreditation',
        issuingBody: 'NAAC',
        displayOrder: 0,
        status: 'ACTIVE',
      });
      activeVerified.replaceAccreditations([existingAcc]);

      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);

      const result = await useCases.syncAccreditations('col-1', { accreditations: [] });

      expect(mockRepo.save).toHaveBeenCalledTimes(1);
      const savedCollege = vi.mocked(mockRepo.save).mock.calls[0][0];
      expect(savedCollege.accreditations).toHaveLength(0);
      expect(result.accreditations).toEqual([]);
    });

    it('retains INACTIVE accreditations in the collection', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);

      const payload = {
        accreditations: [
          {
            name: 'Inactive Old Certificate',
            issuingBody: 'ISO',
            displayOrder: 0,
            status: 'INACTIVE' as const,
          }
        ]
      };

      const result = await useCases.syncAccreditations('col-1', payload);

      expect(mockRepo.save).toHaveBeenCalledTimes(1);
      expect(result.accreditations).toHaveLength(1);
      expect(result.accreditations![0].status).toBe('INACTIVE');
    });

    it('rejects if more than 15 accreditations are submitted (aggregate invariant)', async () => {
      const activeVerified = createMockCollege('ACTIVE', 'VERIFIED');
      vi.mocked(mockRepo.findById).mockResolvedValue(activeVerified);

      const sixteenAccreditations = Array.from({ length: 16 }).map((_, i) => ({
        name: `Accreditation ${i}`,
        issuingBody: `Body ${i}`,
        displayOrder: i,
        status: 'ACTIVE' as const,
      }));

      await expect(useCases.syncAccreditations('col-1', { accreditations: sixteenAccreditations }))
        .rejects.toThrow(/maximum of 15 accreditations/);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('Search', () => {
    it('calls repository search with correct criteria', async () => {
      vi.mocked(mockRepo.searchActiveVerified).mockResolvedValue([
        { college: createMockCollege('ACTIVE', 'VERIFIED'), matchedBranchId: 'branch-1' }
      ]);

      const criteria: CollegeSearchCriteria = {
        streamCode: 'MPC',
        maxFee: 120000,
        locationId: 'loc-1',
      };

      const results = await useCases.searchActiveColleges(criteria);
      
      expect(mockRepo.searchActiveVerified).toHaveBeenCalledWith(criteria);
      expect(results).toHaveLength(1);
      expect(results[0].branches[0].offerings[0].streamCode).toBe('MPC');
    });

    it('filters out INACTIVE media in search results if media is present', async () => {
      const mockCollege = createMockCollege('ACTIVE', 'VERIFIED');
      mockCollege.updateProfile({
        media: [
          CollegeMedia.create({ id: 'm1', collegeId: 'col-1', mediaType: 'IMAGE', status: 'ACTIVE', displayOrder: 1, isCover: false, storageKey: 'test1.jpg', createdAt: '', updatedAt: '' } as any),
          CollegeMedia.create({ id: 'm2', collegeId: 'col-1', mediaType: 'IMAGE', status: 'INACTIVE', displayOrder: 2, isCover: false, storageKey: 'test2.jpg', createdAt: '', updatedAt: '' } as any)
        ]
      });

      vi.mocked(mockRepo.searchActiveVerified).mockResolvedValue([
        { college: mockCollege, matchedBranchId: 'branch-1' }
      ]);

      const results = await useCases.searchActiveColleges({} as any);
      expect(results).toHaveLength(1);
      expect(results[0].media).toHaveLength(1);
      expect(results[0].media[0].id).toBe('m1');
    });

    it('does not include achievements in discovery results', async () => {
      const mockCollege = createMockCollege('ACTIVE', 'VERIFIED');
      mockCollege.replaceAchievements([
        CollegeAchievement.create({ id: 'a1', collegeId: 'col-1', studentName: 'Ravi', exam: 'JEE', achievement: 'Rank 1', year: 2026, description: null, imageStorageKey: null, displayOrder: 1, status: 'ACTIVE', createdAt: '', updatedAt: '' })
      ]);
      vi.mocked(mockRepo.searchActiveVerified).mockResolvedValue([
        { college: mockCollege, matchedBranchId: 'branch-1' }
      ]);

      const results = await useCases.searchActiveColleges({} as any);
      expect(results).toHaveLength(1);
      expect(results[0]).not.toHaveProperty('achievements');
    });

    it('does not include testimonials in discovery results', async () => {
      const mockCollege = createMockCollege('ACTIVE', 'VERIFIED');
      mockCollege.replaceTestimonials([
        CollegeTestimonial.create({ id: 't1', collegeId: 'col-1', personName: 'Ravi', personType: 'STUDENT', testimonialText: 'Great', imageStorageKey: null, displayOrder: 1, status: 'ACTIVE' })
      ]);
      vi.mocked(mockRepo.searchActiveVerified).mockResolvedValue([
        { college: mockCollege, matchedBranchId: 'branch-1' }
      ]);

      const results = await useCases.searchActiveColleges({} as any);
      expect(results).toHaveLength(1);
      expect(results[0]).not.toHaveProperty('testimonials');
    });

    it('does not include accreditations in discovery results', async () => {
      const mockCollege = createMockCollege('ACTIVE', 'VERIFIED');
      mockCollege.replaceAccreditations([
        CollegeAccreditation.create({ id: 'acc-1', collegeId: 'col-1', name: 'NAAC A+', issuingBody: 'NAAC', displayOrder: 1, status: 'ACTIVE' })
      ]);
      vi.mocked(mockRepo.searchActiveVerified).mockResolvedValue([
        { college: mockCollege, matchedBranchId: 'branch-1' }
      ]);

      const results = await useCases.searchActiveColleges({} as any);
      expect(results).toHaveLength(1);
      expect(results[0]).not.toHaveProperty('accreditations');
    });
  });
});

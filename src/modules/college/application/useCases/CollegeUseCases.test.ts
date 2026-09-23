import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CollegeUseCases } from './CollegeUseCases';
import { ICollegeRepository, CollegeSearchCriteria } from '../../domain/ICollegeRepository';
import { College, CollegeStreamOffering } from '../../domain/models';
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
  });
});

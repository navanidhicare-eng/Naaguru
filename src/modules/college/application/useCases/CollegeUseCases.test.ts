import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CollegeUseCases } from './CollegeUseCases';
import { ICollegeRepository, CollegeSearchCriteria } from '../../domain/ICollegeRepository';
import { College, CollegeStreamOffering } from '../../domain/models';
import { AppError } from '../../../../shared/errors';

describe('CollegeUseCases', () => {
  let useCases: CollegeUseCases;
  let mockRepo: ICollegeRepository;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      searchActiveVerified: vi.fn(),
      save: vi.fn(),
    };
    useCases = new CollegeUseCases(mockRepo);
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
      location: {
        state: 'TS',
        district: 'Hyderabad',
        city: 'Hyderabad',
        address: 'Test Addr',
        lat: null,
        lng: null,
      },
      hostels: [
        {
          branchId: 'branch-1',
          hasBoysHostel: true,
          hasGirlsHostel: false,
          annualHostelFee: 50000,
        }
      ],
      ownershipType: 'PRIVATE',
      status,
      verificationStatus,
      offerings: [
        CollegeStreamOffering.create({
          id: 'off-1',
          branchId: 'branch-1',
          streamCode: 'MPC',
          minFee: 100000,
          maxFee: 100000,
        })
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
      expect(profile.offerings[0].streamCode).toBe('MPC');
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
        location: {
          city: 'New City'
        }
      };

      const updatedProfile = await useCases.updateStaffCollegeProfile('col-1', updateData);

      expect(updatedProfile.shortName).toBe('Updated Short');
      expect(updatedProfile.description).toBe('Updated Desc');
      expect(updatedProfile.location.city).toBe('New City');
      
      // Ensure other fields are intact
      expect(updatedProfile.location.state).toBe('TS');
      
      expect(mockRepo.save).toHaveBeenCalledWith(activeVerified);
    });

    it('rejects update if college not found', async () => {
      vi.mocked(mockRepo.findById).mockResolvedValue(null);
      await expect(useCases.updateStaffCollegeProfile('col-1', {})).rejects.toThrow(AppError);
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
      expect(results[0].offerings[0].streamCode).toBe('MPC');
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DrizzleCollegeRepository } from './DrizzleCollegeRepository';
import { College, CollegeStreamOffering, CollegeTestimonial, CollegeAchievement } from '../domain/models';
import { db } from '@/shared/database/db';

// Mock DB
vi.mock('@/shared/database/db', () => ({
  db: {
    select: vi.fn(),
    transaction: vi.fn(),
  }
}));

describe('DrizzleCollegeRepository', () => {
  let repo: DrizzleCollegeRepository;

  beforeEach(() => {
    repo = new DrizzleCollegeRepository();
    vi.clearAllMocks();
  });

  describe('Hydration (findById)', () => {
    it('1. findById hydrates testimonials from dedicated separate query and sorts by displayOrder', async () => {
      const mockCollegeRow = {
        colleges: {
          id: 'col-1',
          name: 'Apex Academy',
          shortName: null,
          description: null,
          website: null,
          contactPhone: null,
          contactEmail: null,
          ownershipType: 'PRIVATE',
          status: 'ACTIVE',
          verificationStatus: 'VERIFIED',
          weeklyMenu: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        branches: null,
        locations: null,
        college_stream_offerings: null,
        college_leadership: null,
        college_media: null,
      };

      const mockAchievementRows = [
        {
          id: 'ach-1',
          collegeId: 'col-1',
          studentName: 'Ravi',
          exam: 'JEE',
          achievement: 'AIR 1',
          year: 2026,
          description: null,
          imageStorageKey: null,
          displayOrder: 1,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];

      const mockTestimonialRows = [
        {
          id: 't-2',
          collegeId: 'col-1',
          personName: 'K. Varun Reddy',
          personType: 'ALUMNI',
          testimonialText: 'Secured AIR 18 in NEET.',
          imageStorageKey: null,
          displayOrder: 2,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 't-1',
          collegeId: 'col-1',
          personName: 'K. Ramakrishna Rao',
          personType: 'PARENT',
          testimonialText: 'Exceptional mentorship by faculty.',
          imageStorageKey: 'keys/avatar.jpg',
          displayOrder: 1,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 't-3',
          collegeId: 'col-1',
          personName: 'Old Reviewer',
          personType: 'OTHER',
          testimonialText: 'Good infrastructure.',
          imageStorageKey: null,
          displayOrder: 3,
          status: 'INACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];

      const mockAccreditationRows = [
        {
          id: 'a-2',
          collegeId: 'col-1',
          name: 'NBA Tier 1',
          issuingBody: 'NBA',
          year: 2023,
          validUntilYear: 2028,
          description: 'Tier 1 accreditation',
          certificateStorageKey: null,
          verificationUrl: 'https://nba.org/cert/123',
          displayOrder: 2,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'a-1',
          collegeId: 'col-1',
          name: 'NAAC A+ Grade',
          issuingBody: 'NAAC',
          year: 2024,
          validUntilYear: 2029,
          description: 'A+ Grade',
          certificateStorageKey: 'keys/naac.pdf',
          verificationUrl: null,
          displayOrder: 1,
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];

      function createMockQueryBuilder(resolvedValue: any) {
        const builder: any = {};
        builder.from = vi.fn().mockReturnValue(builder);
        builder.leftJoin = vi.fn().mockReturnValue(builder);
        builder.innerJoin = vi.fn().mockReturnValue(builder);
        builder.where = vi.fn().mockResolvedValue(resolvedValue);
        return builder;
      }

      vi.mocked(db.select)
        .mockReturnValueOnce(createMockQueryBuilder([mockCollegeRow]))
        .mockReturnValueOnce(createMockQueryBuilder(mockAchievementRows))
        .mockReturnValueOnce(createMockQueryBuilder(mockTestimonialRows))
        .mockReturnValueOnce(createMockQueryBuilder(mockAccreditationRows));

      const college = await repo.findById('col-1');

      expect(college).not.toBeNull();
      expect(college!.id).toBe('col-1');
      expect(college!.achievements).toHaveLength(1);
      expect(college!.testimonials).toHaveLength(3);
      expect(college!.accreditations).toHaveLength(2);
      
      // Sorted by display order
      expect(college!.testimonials[0].id).toBe('t-1');
      expect(college!.testimonials[0].personName).toBe('K. Ramakrishna Rao');
      expect(college!.testimonials[0].imageStorageKey).toBe('keys/avatar.jpg');
      expect(college!.testimonials[1].id).toBe('t-2');
      expect(college!.testimonials[2].id).toBe('t-3');
      expect(college!.testimonials[2].status).toBe('INACTIVE');

      expect(college!.accreditations[0].id).toBe('a-1');
      expect(college!.accreditations[0].name).toBe('NAAC A+ Grade');
      expect(college!.accreditations[0].certificateStorageKey).toBe('keys/naac.pdf');
      expect(college!.accreditations[1].id).toBe('a-2');
      expect(college!.accreditations[1].name).toBe('NBA Tier 1');
      expect(college!.accreditations[1].verificationUrl).toBe('https://nba.org/cert/123');
    });

    it('2. findById hydrates College with zero accreditations as empty array []', async () => {
      const mockCollegeRow = {
        colleges: {
          id: 'col-1',
          name: 'Apex Academy',
          ownershipType: 'PRIVATE',
          status: 'ACTIVE',
          verificationStatus: 'VERIFIED',
          weeklyMenu: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        branches: null,
        locations: null,
        college_stream_offerings: null,
        college_leadership: null,
        college_media: null,
      };

      function createMockQueryBuilder(resolvedValue: any) {
        const builder: any = {};
        builder.from = vi.fn().mockReturnValue(builder);
        builder.leftJoin = vi.fn().mockReturnValue(builder);
        builder.innerJoin = vi.fn().mockReturnValue(builder);
        builder.where = vi.fn().mockResolvedValue(resolvedValue);
        return builder;
      }

      vi.mocked(db.select)
        .mockReturnValueOnce(createMockQueryBuilder([mockCollegeRow]))
        .mockReturnValueOnce(createMockQueryBuilder([]))
        .mockReturnValueOnce(createMockQueryBuilder([]))
        .mockReturnValueOnce(createMockQueryBuilder([]));

      const college = await repo.findById('col-1');

      expect(college).not.toBeNull();
      expect(college!.achievements).toEqual([]);
      expect(college!.testimonials).toEqual([]);
      expect(college!.accreditations).toEqual([]);
    });
  });

  describe('Offering Identity Preservation (save)', () => {
    it('syncs offerings intelligently by ID rather than deleting all', async () => {
      const college = College.create({
        id: 'col-1',
        name: 'Test',
        shortName: null,
        description: null,
        website: null,
        contactPhone: null,
        contactEmail: null,
        ownershipType: 'PRIVATE',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        branches: [
          {
            id: 'branch-1',
            name: 'Main',
            type: 'MAIN_CAMPUS',
            locationId: 'loc-1',
            locationName: 'Test Loc',
            address: 'Addr',
            lat: null,
            lng: null,
            contactPhone: null,
            contactEmail: null,
            isPubliclyEligible: true,
            hostel: {
              branchId: 'branch-1',
              hasBoysHostel: true,
              hasGirlsHostel: true,
              annualHostelFee: 10000,
            },
            offerings: [
              CollegeStreamOffering.create({ id: 'off-1', branchId: 'branch-1', streamCode: 'MPC', minFee: 10000, maxFee: 10000 }),
              CollegeStreamOffering.create({ id: 'off-new', branchId: 'branch-1', streamCode: 'BIPC', minFee: 12000, maxFee: 12000 })
            ]
          } as any
        ],
        leadership: [],
        media: [],
        achievements: [],
        testimonials: [],
        accreditations: [],
        weeklyMenu: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const mockChain = {
        values: vi.fn().mockReturnValue({ onConflictDoUpdate: vi.fn() }),
      };
      
      const mockTx = {
        insert: vi.fn().mockReturnValue(mockChain),
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn() }) }),
        delete: vi.fn().mockReturnValue({ where: vi.fn() }),
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValueOnce([
              { id: 'l-1' } // 1: select existing leadership
            ]).mockResolvedValueOnce([
              // 2: select media
            ]).mockResolvedValueOnce([
              // 3: select achievements
            ]).mockResolvedValueOnce([
              // 4: select testimonials
            ]).mockResolvedValueOnce([
              // 5: select accreditations
            ]).mockResolvedValueOnce([
              { id: 'branch-1' } // 6: select branches
            ]).mockResolvedValueOnce([
              { id: 'off-1' }, // 7: select existing offerings
              { id: 'off-deleted' }
            ])
          })
        }),
      };

      vi.mocked(db.transaction).mockImplementation(async (cb) => {
        await cb(mockTx as any);
      });

      await repo.save(college);

      expect(db.transaction).toHaveBeenCalled();
      expect(mockTx.delete).toHaveBeenCalled();
      const deleteWhereCall = mockTx.delete().where.mock.calls[0][0];
      expect(deleteWhereCall).toBeDefined();

      expect(mockTx.insert).toHaveBeenCalledTimes(2); // Once for college, once for offerings
      const valuesMock = mockChain.values;
      expect(valuesMock).toHaveBeenCalledTimes(2);
      const offeringsInsertCall = valuesMock.mock.calls[1][0];

      expect(offeringsInsertCall).toHaveLength(2);
      expect(offeringsInsertCall[0].id).toBe('off-1');
      expect(offeringsInsertCall[1].id).toBe('off-new');
    });
  });

  describe('Media Removal (save)', () => {
    it('omitted existing media becomes INACTIVE instead of being deleted physically', async () => {
      const college = College.create({
        id: 'col-1',
        name: 'Test',
        shortName: null,
        description: null,
        website: null,
        contactPhone: null,
        contactEmail: null,
        ownershipType: 'PRIVATE',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        branches: [],
        leadership: [],
        media: [],
        achievements: [],
        testimonials: [],
        accreditations: [],
        weeklyMenu: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const mockChain = {
        values: vi.fn().mockReturnValue({ onConflictDoUpdate: vi.fn() }),
      };
      
      const mockUpdateChain = {
        set: vi.fn().mockReturnValue({ where: vi.fn() })
      };
      
      const mockTx = {
        insert: vi.fn().mockReturnValue(mockChain),
        update: vi.fn().mockReturnValue(mockUpdateChain),
        delete: vi.fn().mockReturnValue({ where: vi.fn() }),
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValueOnce([
              // 1: leadership
            ]).mockResolvedValueOnce([
              { id: 'm-old' } // 2: media
            ]).mockResolvedValueOnce([
              // 3: achievements
            ]).mockResolvedValueOnce([
              // 4: testimonials
            ]).mockResolvedValueOnce([
              // 5: accreditations
            ]).mockResolvedValueOnce([
              // 6: branches
            ])
          })
        }),
      };

      vi.mocked(db.transaction).mockImplementation(async (cb) => {
        await cb(mockTx as any);
      });

      await repo.save(college);

      expect(mockTx.update).toHaveBeenCalled();
      expect(mockUpdateChain.set).toHaveBeenCalledWith(expect.objectContaining({
        status: 'INACTIVE',
        isCover: false
      }));
    });
  });

  describe('Achievement Synchronization (save)', () => {
    it('syncs achievements correctly', async () => {
      const college = College.create({
        id: 'col-1',
        name: 'Test',
        shortName: null,
        description: null,
        website: null,
        contactPhone: null,
        contactEmail: null,
        ownershipType: 'PRIVATE',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        branches: [],
        leadership: [],
        media: [],
        weeklyMenu: null,
        achievements: [],
        testimonials: [],
        accreditations: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const mockChain = {
        values: vi.fn().mockReturnValue({ onConflictDoUpdate: vi.fn() }),
      };
      
      const mockUpdateChain = {
        set: vi.fn().mockReturnValue({ where: vi.fn() })
      };
      
      const mockDeleteChain = {
        where: vi.fn()
      };
      
      const mockTx = {
        insert: vi.fn().mockReturnValue(mockChain),
        update: vi.fn().mockReturnValue(mockUpdateChain),
        delete: vi.fn().mockReturnValue(mockDeleteChain),
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValueOnce([
              // 1: leadership
            ]).mockResolvedValueOnce([
              // 2: media
            ]).mockResolvedValueOnce([
              { id: 'a-old' } // 3: achievements
            ]).mockResolvedValueOnce([
              // 4: testimonials
            ]).mockResolvedValueOnce([
              // 5: accreditations
            ]).mockResolvedValueOnce([
              // 6: branches
            ])
          })
        }),
      };

      vi.mocked(db.transaction).mockImplementation(async (cb) => {
        await cb(mockTx as any);
      });

      await repo.save(college);

      expect(mockTx.delete).toHaveBeenCalled();
      const deleteWhereCall = mockDeleteChain.where.mock.calls[0][0];
      expect(deleteWhereCall).toBeDefined();
    });
  });

  describe('Testimonial Synchronization (save)', () => {
    it('1. deletes omitted existing testimonials from database', async () => {
      const college = College.create({
        id: 'col-1',
        name: 'Test',
        shortName: null,
        description: null,
        website: null,
        contactPhone: null,
        contactEmail: null,
        ownershipType: 'PRIVATE',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        branches: [],
        leadership: [],
        media: [],
        weeklyMenu: null,
        achievements: [],
        testimonials: [], // Omitted existing testimonial t-old
        accreditations: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const mockChain = {
        values: vi.fn().mockReturnValue({ onConflictDoUpdate: vi.fn() }),
      };
      
      const mockDeleteChain = {
        where: vi.fn()
      };
      
      const mockTx = {
        insert: vi.fn().mockReturnValue(mockChain),
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn() }) }),
        delete: vi.fn().mockReturnValue(mockDeleteChain),
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValueOnce([
              // 1: leadership
            ]).mockResolvedValueOnce([
              // 2: media
            ]).mockResolvedValueOnce([
              // 3: achievements
            ]).mockResolvedValueOnce([
              { id: 't-old' } // 4: existing testimonials
            ]).mockResolvedValueOnce([
              // 5: accreditations
            ]).mockResolvedValueOnce([
              // 6: branches
            ])
          })
        }),
      };

      vi.mocked(db.transaction).mockImplementation(async (cb) => {
        await cb(mockTx as any);
      });

      await repo.save(college);

      expect(mockTx.delete).toHaveBeenCalled();
      const deleteWhereCall = mockDeleteChain.where.mock.calls[0][0];
      expect(deleteWhereCall).toBeDefined();
    });

    it('2. inserts new testimonials and updates existing testimonials', async () => {
      const tExisting = CollegeTestimonial.create({
        id: 't-1',
        collegeId: 'col-1',
        personName: 'Rao Updated',
        personType: 'PARENT',
        testimonialText: 'Updated review text.',
        displayOrder: 1,
        status: 'ACTIVE',
      });

      const tNew = CollegeTestimonial.create({
        id: 't-new',
        collegeId: 'col-1',
        personName: 'Student S',
        personType: 'STUDENT',
        testimonialText: 'Great labs.',
        displayOrder: 2,
        status: 'INACTIVE',
      });

      const college = College.create({
        id: 'col-1',
        name: 'Test',
        shortName: null,
        description: null,
        website: null,
        contactPhone: null,
        contactEmail: null,
        ownershipType: 'PRIVATE',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        branches: [],
        leadership: [],
        media: [],
        weeklyMenu: null,
        achievements: [],
        testimonials: [tExisting, tNew],
        accreditations: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const mockChain = {
        values: vi.fn().mockReturnValue({ onConflictDoUpdate: vi.fn() }),
      };
      
      const mockTx = {
        insert: vi.fn().mockReturnValue(mockChain),
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn() }) }),
        delete: vi.fn().mockReturnValue({ where: vi.fn() }),
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValueOnce([
              // 1: leadership
            ]).mockResolvedValueOnce([
              // 2: media
            ]).mockResolvedValueOnce([
              // 3: achievements
            ]).mockResolvedValueOnce([
              { id: 't-1' } // 4: existing testimonials (t-1 kept)
            ]).mockResolvedValueOnce([
              { id: 't-1', collegeId: 'col-1' } // 5: cross-college safety check
            ]).mockResolvedValueOnce([
              // 6: accreditations
            ]).mockResolvedValueOnce([
              // 7: branches
            ])
          })
        }),
      };

      vi.mocked(db.transaction).mockImplementation(async (cb) => {
        await cb(mockTx as any);
      });

      await repo.save(college);

      // Insert called for college and testimonials
      expect(mockTx.insert).toHaveBeenCalledTimes(2);
      const testimonialInsertValues = mockChain.values.mock.calls[1][0];
      expect(testimonialInsertValues).toHaveLength(2);
      expect(testimonialInsertValues[0].id).toBe('t-1');
      expect(testimonialInsertValues[0].personName).toBe('Rao Updated');
      expect(testimonialInsertValues[1].id).toBe('t-new');
      expect(testimonialInsertValues[1].status).toBe('INACTIVE');
    });
  });

  describe('Accreditation Synchronization (save)', () => {
    it('1. deletes omitted existing accreditations from database', async () => {
      const college = College.create({
        id: 'col-1',
        name: 'Test',
        shortName: null,
        description: null,
        website: null,
        contactPhone: null,
        contactEmail: null,
        ownershipType: 'PRIVATE',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        branches: [],
        leadership: [],
        media: [],
        weeklyMenu: null,
        achievements: [],
        testimonials: [],
        accreditations: [], // Omitted existing accreditation acc-old
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const mockChain = {
        values: vi.fn().mockReturnValue({ onConflictDoUpdate: vi.fn() }),
      };
      
      const mockDeleteChain = {
        where: vi.fn()
      };
      
      const mockTx = {
        insert: vi.fn().mockReturnValue(mockChain),
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn() }) }),
        delete: vi.fn().mockReturnValue(mockDeleteChain),
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValueOnce([
              // 1: leadership
            ]).mockResolvedValueOnce([
              // 2: media
            ]).mockResolvedValueOnce([
              // 3: achievements
            ]).mockResolvedValueOnce([
              // 4: testimonials
            ]).mockResolvedValueOnce([
              { id: 'acc-old' } // 5: existing accreditations
            ]).mockResolvedValueOnce([
              // 6: branches
            ])
          })
        }),
      };

      vi.mocked(db.transaction).mockImplementation(async (cb) => {
        await cb(mockTx as any);
      });

      await repo.save(college);

      expect(mockTx.delete).toHaveBeenCalled();
      const deleteWhereCall = mockDeleteChain.where.mock.calls[0][0];
      expect(deleteWhereCall).toBeDefined();
    });
  });
});

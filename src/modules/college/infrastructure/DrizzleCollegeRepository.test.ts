import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DrizzleCollegeRepository } from './DrizzleCollegeRepository';
import { College, CollegeStreamOffering } from '../domain/models';
import { AppError } from '@/shared/errors';
import { db } from '@/shared/database/db';
import { inArray } from 'drizzle-orm';

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
              // Keep this one
              CollegeStreamOffering.create({ id: 'off-1', branchId: 'branch-1', streamCode: 'MPC', minFee: 10000, maxFee: 10000 }),
              // Add this new one
              CollegeStreamOffering.create({ id: 'off-new', branchId: 'branch-1', streamCode: 'BIPC', minFee: 12000, maxFee: 12000 })
            ]
          } as any
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // We will mock the tx behavior to capture what it does
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
              { id: 'branch-1' } // First call: select branches
            ]).mockResolvedValueOnce([
              { id: 'off-1' }, // Second call: select existing offerings
              { id: 'off-deleted' }
            ])
          })
        }),
      };

      vi.mocked(db.transaction).mockImplementation(async (cb) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await cb(mockTx as any);
      });

      await repo.save(college);

      // Verify the transaction was called
      expect(db.transaction).toHaveBeenCalled();

      // Verify that off-deleted was deleted
      expect(mockTx.delete).toHaveBeenCalled();
      const deleteWhereCall = mockTx.delete().where.mock.calls[0][0];
      // deleteWhereCall should be an inArray condition for ['off-deleted']
      expect(deleteWhereCall).toBeDefined();

      // Verify that insert/upsert was called with off-1 and off-new
      expect(mockTx.insert).toHaveBeenCalledTimes(2); // Once for college, once for offerings
      // We know mockTx.insert() returns our chained mock object
      // which has a .values() spy. Since insert is called twice, values is called twice.
      // The second call corresponds to the offerings insert.
      const valuesMock = mockChain.values;
      expect(valuesMock).toHaveBeenCalledTimes(2);
      const offeringsInsertCall = valuesMock.mock.calls[1][0];

      expect(offeringsInsertCall).toHaveLength(2);
      expect(offeringsInsertCall[0].id).toBe('off-1');
      expect(offeringsInsertCall[1].id).toBe('off-new');
    });
  });
});

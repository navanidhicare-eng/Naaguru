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
        location: { state: 'TS', district: 'Hyd', city: 'Hyd', address: 'Addr', lat: null, lng: null },
        hostelSummary: { hasBoysHostel: false, hasGirlsHostel: false, annualHostelFee: null },
        ownershipType: 'PRIVATE',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
        offerings: [
          // Keep this one
          CollegeStreamOffering.create({ id: 'off-1', collegeId: 'col-1', streamCode: 'MPC', tuitionFee: 10000 }),
          // Add this new one
          CollegeStreamOffering.create({ id: 'off-new', collegeId: 'col-1', streamCode: 'BIPC', tuitionFee: 12000 })
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
        delete: vi.fn().mockReturnValue({ where: vi.fn() }),
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              { id: 'off-1' }, // Existing
              { id: 'off-deleted' } // Exists in DB but removed from domain model
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

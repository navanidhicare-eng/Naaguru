import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DrizzleStudentIntentRepository } from './DrizzleStudentIntentRepository';
import { db } from '../../../shared/database/db';
import { AppError } from '../../../shared/errors';

// Mock DB
vi.mock('../../../shared/database/db', () => ({
  db: {
    select: vi.fn(),
    transaction: vi.fn(),
  }
}));

describe('DrizzleStudentIntentRepository', () => {
  let repository: DrizzleStudentIntentRepository;
  const testUserId = 'f7b3b3b3-3b3b-3b3b-3b3b-3b3b3b3b3b3b';

  beforeEach(() => {
    repository = new DrizzleStudentIntentRepository();
    vi.clearAllMocks();
  });

  const baseIntent = {
    pathwayCode: 'INTERMEDIATE',
    programCode: 'MPC',
    preferredLocationId: null,
    requiresHostel: false,
    hostelGender: null as null,
    maxAnnualFee: null,
  };

  it('submits initial intent via transaction', async () => {
    // Mock the transaction callback
    const mockTx = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            for: vi.fn().mockResolvedValue([{ id: testUserId }]), // User exists
            limit: vi.fn().mockResolvedValue([]) // No existing intent
          })
        })
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: 'intent-1',
            studentId: testUserId,
            versionNumber: 1,
            status: 'ACTIVE',
            ...baseIntent
          }])
        })
      }),
    };

    vi.mocked(db.transaction).mockImplementation(async (cb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await cb(mockTx as any);
    });

    const intent = await repository.submitInitialIntent(testUserId, baseIntent);
    
    expect(db.transaction).toHaveBeenCalled();
    expect(intent.props.versionNumber).toBe(1);
    expect(intent.props.status).toBe('ACTIVE');
  });

  it('revises intent via transaction', async () => {
    const mockTx = {
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              for: vi.fn().mockResolvedValue([{
                id: 'intent-1',
                versionNumber: 1
              }])
            })
          })
        })
      }),
      update: vi.fn().mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(true)
        })
      }),
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: 'intent-2',
            studentId: testUserId,
            versionNumber: 2,
            status: 'ACTIVE',
            ...baseIntent,
            programCode: 'BIPC'
          }])
        })
      }),
    };

    vi.mocked(db.transaction).mockImplementation(async (cb) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await cb(mockTx as any);
    });

    const revisedIntent = await repository.reviseIntent(testUserId, {
      ...baseIntent,
      programCode: 'BIPC'
    });

    expect(db.transaction).toHaveBeenCalled();
    expect(revisedIntent.props.versionNumber).toBe(2);
  });
});

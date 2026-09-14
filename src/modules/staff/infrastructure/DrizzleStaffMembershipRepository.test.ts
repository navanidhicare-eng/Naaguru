import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DrizzleStaffMembershipRepository } from './DrizzleStaffMembershipRepository';
import { db } from '../../../shared/database/db';
import { AppError } from '../../../shared/errors';
import { StaffMembership } from '../domain/models';

vi.mock('server-only', () => ({}));

vi.mock('../../../shared/database/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  }
}));

describe('DrizzleStaffMembershipRepository', () => {
  let repository: DrizzleStaffMembershipRepository;

  beforeEach(() => {
    repository = new DrizzleStaffMembershipRepository();
    vi.clearAllMocks();
  });

  const mockMembershipRow = {
    id: 'mem-1',
    userId: 'user-1',
    collegeId: 'col-1',
    role: 'COLLEGE_ADMIN',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('findActiveByUserId returns only ACTIVE memberships', async () => {
    const mockSelect = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([mockMembershipRow])
      })
    };
    vi.mocked(db.select).mockReturnValue(mockSelect as any);

    const result = await repository.findActiveByUserId('user-1');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('mem-1');
    expect(result[0].status).toBe('ACTIVE');
  });

  it('findByUserAndCollege returns a single membership if found', async () => {
    const mockSelect = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockMembershipRow])
        })
      })
    };
    vi.mocked(db.select).mockReturnValue(mockSelect as any);

    const result = await repository.findByUserAndCollege('user-1', 'col-1');

    expect(result).toBeDefined();
    expect(result?.id).toBe('mem-1');
  });

  it('findByUserAndCollege returns null if not found', async () => {
    const mockSelect = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([])
        })
      })
    };
    vi.mocked(db.select).mockReturnValue(mockSelect as any);

    const result = await repository.findByUserAndCollege('user-1', 'col-1');

    expect(result).toBeNull();
  });

  it('findById returns a membership if found', async () => {
    const mockSelect = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockMembershipRow])
        })
      })
    };
    vi.mocked(db.select).mockReturnValue(mockSelect as any);

    const result = await repository.findById('mem-1');

    expect(result).toBeDefined();
    expect(result?.id).toBe('mem-1');
  });

  it('create persists a membership', async () => {
    const mockInsert = {
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockMembershipRow])
      })
    };
    vi.mocked(db.insert).mockReturnValue(mockInsert as any);

    const membership = StaffMembership.create(mockMembershipRow as any);
    const result = await repository.create(membership);

    expect(result.id).toBe('mem-1');
  });

  it('create translates database unique constraint to AppError', async () => {
    const mockInsert = {
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue(new Error('duplicate key value violates unique constraint "idx_staff_memberships_user_college"'))
      })
    };
    vi.mocked(db.insert).mockReturnValue(mockInsert as any);

    const membership = StaffMembership.create(mockMembershipRow as any);

    await expect(repository.create(membership)).rejects.toThrow(AppError);
    await expect(repository.create(membership)).rejects.toHaveProperty('code', 'DUPLICATE_MEMBERSHIP');
  });
});

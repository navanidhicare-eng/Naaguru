import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StaffUseCases } from './StaffUseCases';
import { IStaffMembershipRepository } from '../domain/IStaffMembershipRepository';
import { StaffMembership } from '../domain/models';
import { AppError } from '../../../shared/errors';
import { db } from '../../../shared/database/db';

vi.mock('server-only', () => ({}));

vi.mock('../../../shared/database/db', () => ({
  db: {
    select: vi.fn(),
  }
}));

describe('StaffUseCases', () => {
  let useCases: StaffUseCases;
  let mockRepo: IStaffMembershipRepository;

  beforeEach(() => {
    mockRepo = {
      findActiveByUserId: vi.fn(),
      findByUserAndCollege: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
    };
    useCases = new StaffUseCases(mockRepo);
    vi.clearAllMocks();
  });

  const validLinkInput = {
    userId: 'user-123',
    collegeId: 'col-456',
    role: 'COLLEGE_ADMIN' as const,
  };

  const setupDbMocks = (userFound: boolean, userRole: string, collegeFound: boolean) => {
    let callCount = 0;
    vi.mocked(db.select).mockImplementation(() => {
      callCount++;
      return {
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue(
              callCount === 1 
                ? (userFound ? [{ id: 'user-123', role: userRole }] : [])
                : (collegeFound ? [{ id: 'col-456' }] : [])
            )
          })
        })
      } as any;
    });
  };

  it('rejects invalid roles immediately', async () => {
    await expect(useCases.linkStaffToCollege({
      ...validLinkInput,
      role: 'INVALID_ROLE' as any
    })).rejects.toThrow(AppError);
  });

  it('rejects if user does not exist', async () => {
    setupDbMocks(false, 'COLLEGE', true);

    await expect(useCases.linkStaffToCollege(validLinkInput))
      .rejects.toThrow(/User not found/);
  });

  it('rejects if user does not have COLLEGE role', async () => {
    setupDbMocks(true, 'STUDENT', true);

    await expect(useCases.linkStaffToCollege(validLinkInput))
      .rejects.toThrow(/Only users with role=COLLEGE may be institutional staff/);
  });

  it('rejects if college does not exist', async () => {
    setupDbMocks(true, 'COLLEGE', false);

    await expect(useCases.linkStaffToCollege(validLinkInput))
      .rejects.toThrow(/College not found/);
  });

  it('creates staff membership when all conditions are met', async () => {
    setupDbMocks(true, 'COLLEGE', true);
    
    vi.mocked(mockRepo.create).mockImplementation(async (membership) => membership);

    const result = await useCases.linkStaffToCollege(validLinkInput);

    expect(result.userId).toBe(validLinkInput.userId);
    expect(result.collegeId).toBe(validLinkInput.collegeId);
    expect(result.role).toBe(validLinkInput.role);
    expect(result.status).toBe('ACTIVE');
    expect(mockRepo.create).toHaveBeenCalled();
  });

  it('getActiveMembershipsForUser returns mapped dtos', async () => {
    const mockMembership = StaffMembership.create({
      id: 'mem-1',
      userId: 'user-123',
      collegeId: 'col-456',
      role: 'COLLEGE_ADMIN',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    vi.mocked(mockRepo.findActiveByUserId).mockResolvedValue([mockMembership]);

    const result = await useCases.getActiveMembershipsForUser('user-123');
    
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('mem-1');
    expect(result[0].role).toBe('COLLEGE_ADMIN');
  });
});

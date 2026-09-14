import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StaffAuthorizationService } from './StaffAuthorizationService';
import { IStaffMembershipRepository } from '../domain/IStaffMembershipRepository';
import { StaffMembership } from '../domain/models';
import { AppError } from '../../../shared/errors';
import { StaffAuthContext } from '../../../shared/auth/middleware';

vi.mock('server-only', () => ({}));

describe('StaffAuthorizationService', () => {
  let service: StaffAuthorizationService;
  let mockRepo: IStaffMembershipRepository;

  beforeEach(() => {
    mockRepo = {
      findActiveByUserId: vi.fn(),
      findByUserAndCollege: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
    };
    service = new StaffAuthorizationService(mockRepo);
    vi.clearAllMocks();
  });

  const validContext: StaffAuthContext = {
    userId: 'user-123',
    staffMembershipId: 'mem-1',
    collegeId: 'col-456',
    role: 'COLLEGE_ADMIN',
  };

  const createMockMembership = (overrides?: Partial<Parameters<typeof StaffMembership.create>[0]>) => {
    return StaffMembership.create({
      id: 'mem-1',
      userId: 'user-123',
      collegeId: 'col-456',
      role: 'COLLEGE_ADMIN',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides
    });
  };

  it('resolves successfully for a perfectly matching active membership', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(createMockMembership());
    await expect(service.verifyContext(validContext)).resolves.toBeUndefined();
  });

  it('throws 403 if membership is not found', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null);
    await expect(service.verifyContext(validContext))
      .rejects.toThrowError(new AppError('Membership not found', 403, 'FORBIDDEN'));
  });

  it('throws 403 if membership belongs to another user', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(createMockMembership({ userId: 'different-user' }));
    await expect(service.verifyContext(validContext))
      .rejects.toThrowError(new AppError('Membership belongs to another user', 403, 'FORBIDDEN'));
  });

  it('throws 403 if membership belongs to another college', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(createMockMembership({ collegeId: 'different-college' }));
    await expect(service.verifyContext(validContext))
      .rejects.toThrowError(new AppError('Membership belongs to another college', 403, 'FORBIDDEN'));
  });

  it('throws 403 if token role differs from database role', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(createMockMembership({ role: 'COLLEGE_STAFF' }));
    await expect(service.verifyContext(validContext))
      .rejects.toThrowError(new AppError('Token role differs from database membership role', 403, 'FORBIDDEN'));
  });

  it('throws 403 if membership is INACTIVE', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(createMockMembership({ status: 'INACTIVE' }));
    await expect(service.verifyContext(validContext))
      .rejects.toThrowError(new AppError('Membership is INACTIVE', 403, 'FORBIDDEN'));
  });

  it('throws 403 if membership is SUSPENDED', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(createMockMembership({ status: 'SUSPENDED' }));
    await expect(service.verifyContext(validContext))
      .rejects.toThrowError(new AppError('Membership is SUSPENDED', 403, 'FORBIDDEN'));
  });
});

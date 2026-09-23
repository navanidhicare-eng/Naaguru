import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
import { CollegeUseCases } from '@/modules/college/application/useCases/CollegeUseCases';
import { TokenService } from '@/shared/auth/TokenService';
import { authUseCases } from '@/shared/auth';
import { AppError } from '@/shared/errors';

vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: vi.fn() }),
}));
vi.mock('@/shared/auth', () => ({
  authUseCases: { getMe: vi.fn() }
}));
vi.mock('@/modules/college/application/useCases/CollegeUseCases');

describe('Admin College Achievements API Integration Tests', () => {
  let mockVerifyAccessToken: any;
  let mockGetMe: any;
  let mockSyncAchievements: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockVerifyAccessToken = vi.spyOn(TokenService.prototype, 'verifyAccessToken');
    mockGetMe = vi.mocked(authUseCases.getMe);
    
    mockSyncAchievements = vi.fn();
    CollegeUseCases.prototype.syncAchievements = mockSyncAchievements;

    // Default auth setup (ADMIN)
    mockVerifyAccessToken.mockResolvedValue({ userId: 'admin-1', role: 'ADMIN' });
    mockGetMe.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
  });

  const createRequest = (method: string, body?: any, token = 'valid-token') => {
    const headers = new Headers();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (body) headers.set('Content-Type', 'application/json');
    return new Request('http://localhost', {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  };

  const mockContext = { params: Promise.resolve({ id: 'college-1' }) };

  describe('PUT /api/v1/admin/colleges/:id/achievements', () => {
    it('1. Syncs achievements successfully (Admin)', async () => {
      const payload = {
        achievements: [
          {
            studentName: 'Ravi',
            exam: 'JEE',
            achievement: 'AIR 152',
            year: 2026,
            displayOrder: 1,
            status: 'ACTIVE'
          }
        ]
      };
      
      mockSyncAchievements.mockResolvedValue({ id: 'college-1' });
      
      const req = createRequest('PUT', payload);
      const res = await PUT(req as any, mockContext);
      
      expect(res.status).toBe(200);
      expect(mockSyncAchievements).toHaveBeenCalledWith('college-1', payload);
    });

    it('2. Rejects unauthenticated request', async () => {
      const req = createRequest('PUT', { achievements: [] }, '');
      await expect(PUT(req as any, mockContext)).rejects.toThrowError(/No token provided/);
    });

    it('3. Rejects unauthorized role (STUDENT)', async () => {
      mockVerifyAccessToken.mockResolvedValue({ userId: 'stu-1', role: 'STUDENT' });
      
      const req = createRequest('PUT', { achievements: [] });
      await expect(PUT(req as any, mockContext)).rejects.toThrowError(/Insufficient permissions/);
    });

    it('4. Rejects unauthorized role (COLLEGE)', async () => {
      mockVerifyAccessToken.mockResolvedValue({ userId: 'col-1', role: 'COLLEGE' });
      
      const req = createRequest('PUT', { achievements: [] });
      await expect(PUT(req as any, mockContext)).rejects.toThrowError(/Insufficient permissions/);
    });

    it('5. Handles non-existent college (404)', async () => {
      mockSyncAchievements.mockRejectedValue(new AppError('College not found', 404));
      
      const req = createRequest('PUT', { achievements: [] });
      const res = await PUT(req as any, mockContext);
      
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('College not found');
    });

    it('6. Handles validation errors (e.g. invalid cross-college ID ownership) (400)', async () => {
      mockSyncAchievements.mockRejectedValue(new AppError('Cannot modify achievements not belonging to this college: id-from-another-college', 400));
      
      const payload = {
        achievements: [
          {
            id: 'id-from-another-college',
            studentName: 'Ravi',
            exam: 'JEE',
            achievement: 'AIR 1',
            year: 2026,
            displayOrder: 1,
            status: 'ACTIVE'
          }
        ]
      };
      const req = createRequest('PUT', payload);
      const res = await PUT(req as any, mockContext);
      
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Cannot modify achievements not belonging to this college');
    });

    it('7. Handles >20 achievements limit validation error (400)', async () => {
      mockSyncAchievements.mockRejectedValue(new AppError('Maximum of 20 achievements allowed', 400));
      
      const req = createRequest('PUT', { achievements: [] });
      const res = await PUT(req as any, mockContext);
      
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('Maximum of 20 achievements allowed');
    });
  });
});

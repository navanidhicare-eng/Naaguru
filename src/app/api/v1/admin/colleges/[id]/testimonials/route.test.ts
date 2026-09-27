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

describe('Admin College Testimonials API Integration Tests', () => {
  let mockVerifyAccessToken: any;
  let mockGetMe: any;
  let mockSyncTestimonials: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockVerifyAccessToken = vi.spyOn(TokenService.prototype, 'verifyAccessToken');
    mockGetMe = vi.mocked(authUseCases.getMe);
    
    mockSyncTestimonials = vi.fn();
    CollegeUseCases.prototype.syncTestimonials = mockSyncTestimonials;

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

  describe('PUT /api/v1/admin/colleges/:id/testimonials', () => {
    it('1. Company Admin can synchronize testimonials and response contains staff testimonials', async () => {
      const payload = {
        testimonials: [
          {
            personName: 'Ravi Kumar',
            personType: 'STUDENT',
            testimonialText: 'Great experience at this college!',
            imageStorageKey: 'colleges/1/testimonials/ravi.webp',
            displayOrder: 0,
            status: 'ACTIVE'
          }
        ]
      };
      
      const expectedResponse = {
        id: 'college-1',
        testimonials: [
          {
            id: 'testi-1',
            personName: 'Ravi Kumar',
            personType: 'STUDENT',
            testimonialText: 'Great experience at this college!',
            imageStorageKey: 'colleges/1/testimonials/ravi.webp',
            displayOrder: 0,
            status: 'ACTIVE'
          }
        ]
      };

      mockSyncTestimonials.mockResolvedValue(expectedResponse);
      
      const req = createRequest('PUT', payload);
      const res = await PUT(req as any, mockContext);
      
      expect(res.status).toBe(200);
      expect(mockSyncTestimonials).toHaveBeenCalledWith('college-1', payload);
      const data = await res.json();
      expect(data).toEqual(expectedResponse);
      expect(data.testimonials).toHaveLength(1);
      expect(data.testimonials[0].personName).toBe('Ravi Kumar');
    });

    it('2. Rejects unauthenticated request', async () => {
      const req = createRequest('PUT', { testimonials: [] }, '');
      await expect(PUT(req as any, mockContext)).rejects.toThrowError(/No token provided/);
    });

    it('3. Rejects non-Company-Admin role (STUDENT)', async () => {
      mockVerifyAccessToken.mockResolvedValue({ userId: 'stu-1', role: 'STUDENT' });
      
      const req = createRequest('PUT', { testimonials: [] });
      await expect(PUT(req as any, mockContext)).rejects.toThrowError(/Insufficient permissions/);
    });

    it('4. Rejects non-Company-Admin role (COLLEGE)', async () => {
      mockVerifyAccessToken.mockResolvedValue({ userId: 'col-1', role: 'COLLEGE' });
      
      const req = createRequest('PUT', { testimonials: [] });
      await expect(PUT(req as any, mockContext)).rejects.toThrowError(/Insufficient permissions/);
    });

    it('5. Rejects invalid payload (invalid personType)', async () => {
      const payload = {
        testimonials: [
          {
            personName: 'Ravi Kumar',
            personType: 'INVALID_TYPE',
            testimonialText: 'Text',
            displayOrder: 0,
            status: 'ACTIVE'
          }
        ]
      };
      const req = createRequest('PUT', payload);
      const res = await PUT(req as any, mockContext);
      expect(res.status).toBe(400);
      expect(mockSyncTestimonials).not.toHaveBeenCalled();
    });

    it('6. Rejects invalid payload (empty personName)', async () => {
      const payload = {
        testimonials: [
          {
            personName: '   ',
            personType: 'STUDENT',
            testimonialText: 'Text',
            displayOrder: 0,
            status: 'ACTIVE'
          }
        ]
      };
      const req = createRequest('PUT', payload);
      const res = await PUT(req as any, mockContext);
      expect(res.status).toBe(400);
      expect(mockSyncTestimonials).not.toHaveBeenCalled();
    });

    it('7. Rejects invalid payload (negative displayOrder)', async () => {
      const payload = {
        testimonials: [
          {
            personName: 'Ravi Kumar',
            personType: 'STUDENT',
            testimonialText: 'Text',
            displayOrder: -1,
            status: 'ACTIVE'
          }
        ]
      };
      const req = createRequest('PUT', payload);
      const res = await PUT(req as any, mockContext);
      expect(res.status).toBe(400);
      expect(mockSyncTestimonials).not.toHaveBeenCalled();
    });

    it('8. Handles non-existent college (404)', async () => {
      mockSyncTestimonials.mockRejectedValue(new AppError('College not found', 404));
      
      const req = createRequest('PUT', { testimonials: [] });
      const res = await PUT(req as any, mockContext);
      
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('College not found');
    });

    it('9. Empty collection removes all testimonials', async () => {
      mockSyncTestimonials.mockResolvedValue({ id: 'college-1', testimonials: [] });
      
      const req = createRequest('PUT', { testimonials: [] });
      const res = await PUT(req as any, mockContext);
      
      expect(res.status).toBe(200);
      expect(mockSyncTestimonials).toHaveBeenCalledWith('college-1', { testimonials: [] });
      const data = await res.json();
      expect(data.testimonials).toEqual([]);
    });

    it('10. Existing + new testimonial synchronization works', async () => {
      const existingUuid = '11111111-1111-4111-8111-111111111111';
      const payload = {
        testimonials: [
          {
            id: existingUuid,
            personName: 'Ravi Kumar Updated',
            personType: 'STUDENT',
            testimonialText: 'Updated text',
            imageStorageKey: 'colleges/1/testimonials/ravi.webp',
            displayOrder: 0,
            status: 'ACTIVE'
          },
          {
            personName: 'Suresh Kumar',
            personType: 'PARENT',
            testimonialText: 'New testimonial text',
            imageStorageKey: null,
            displayOrder: 1,
            status: 'ACTIVE'
          }
        ]
      };

      mockSyncTestimonials.mockResolvedValue({
        id: 'college-1',
        testimonials: [
          { id: existingUuid, ...payload.testimonials[0] },
          { id: '22222222-2222-4222-8222-222222222222', ...payload.testimonials[1] }
        ]
      });

      const req = createRequest('PUT', payload);
      const res = await PUT(req as any, mockContext);

      expect(res.status).toBe(200);
      expect(mockSyncTestimonials).toHaveBeenCalledWith('college-1', payload);
    });

    it('11. INACTIVE testimonial is retained and passed to use case', async () => {
      const payload = {
        testimonials: [
          {
            personName: 'Inactive Person',
            personType: 'ALUMNI',
            testimonialText: 'Inactive feedback',
            imageStorageKey: null,
            displayOrder: 0,
            status: 'INACTIVE'
          }
        ]
      };

      mockSyncTestimonials.mockResolvedValue({
        id: 'college-1',
        testimonials: [
          { id: 't-inactive', ...payload.testimonials[0] }
        ]
      });

      const req = createRequest('PUT', payload);
      const res = await PUT(req as any, mockContext);

      expect(res.status).toBe(200);
      expect(mockSyncTestimonials).toHaveBeenCalledWith('college-1', payload);
    });

    it('12. Rejects foreign testimonial ID with 400 and ensures no mutation', async () => {
      const foreignId = '99999999-9999-4999-8999-999999999999';
      mockSyncTestimonials.mockRejectedValue(
        new AppError(`Cannot modify testimonials not belonging to this college: ${foreignId}`, 400)
      );
      
      const payload = {
        testimonials: [
          {
            id: foreignId,
            personName: 'Foreign Person',
            personType: 'STUDENT',
            testimonialText: 'Should fail',
            displayOrder: 0,
            status: 'ACTIVE'
          }
        ]
      };

      const req = createRequest('PUT', payload);
      const res = await PUT(req as any, mockContext);
      
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Cannot modify testimonials not belonging to this college');
    });

    it('13. Handles >10 testimonials limit invariant rejection with 400', async () => {
      mockSyncTestimonials.mockRejectedValue(
        new AppError('A college can have a maximum of 10 testimonials.', 400)
      );
      
      const validTestimonials = Array.from({ length: 11 }).map((_, i) => ({
        personName: `Person ${i}`,
        personType: 'STUDENT',
        testimonialText: `Text ${i}`,
        displayOrder: i,
        status: 'ACTIVE'
      }));

      const req = createRequest('PUT', { testimonials: validTestimonials });
      const res = await PUT(req as any, mockContext);
      
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe('A college can have a maximum of 10 testimonials.');
    });
  });
});

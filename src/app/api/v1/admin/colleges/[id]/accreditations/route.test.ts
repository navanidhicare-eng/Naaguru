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

describe('Admin College Accreditations API Route Tests (C9.7.2)', () => {
  let mockVerifyAccessToken: any;
  let mockGetMe: any;
  let mockSyncAccreditations: any;

  const validCollegeId = 'a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d';
  const currentYear = new Date().getFullYear();

  beforeEach(() => {
    vi.clearAllMocks();

    mockVerifyAccessToken = vi.spyOn(TokenService.prototype, 'verifyAccessToken');
    mockGetMe = vi.mocked(authUseCases.getMe);
    
    mockSyncAccreditations = vi.fn();
    CollegeUseCases.prototype.syncAccreditations = mockSyncAccreditations;

    // Default auth setup (ADMIN)
    mockVerifyAccessToken.mockResolvedValue({ userId: 'admin-1', role: 'ADMIN' });
    mockGetMe.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
  });

  const createRequest = (method: string, body?: any, token = 'valid-token') => {
    const headers = new Headers();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (body !== undefined) headers.set('Content-Type', 'application/json');
    return new Request('http://localhost', {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  const mockContext = { params: Promise.resolve({ id: validCollegeId }) };

  describe('6. Authorization and Tenant Boundary Tests', () => {
    it('1. Rejects unauthenticated request', async () => {
      const req = createRequest('PUT', { accreditations: [] }, '');
      await expect(PUT(req as any, mockContext)).rejects.toThrowError(/No token provided/);
    });

    it('2. Rejects unauthorized role (STUDENT)', async () => {
      mockVerifyAccessToken.mockResolvedValue({ userId: 'stu-1', role: 'STUDENT' });
      
      const req = createRequest('PUT', { accreditations: [] });
      await expect(PUT(req as any, mockContext)).rejects.toThrowError(/Insufficient permissions/);
    });

    it('3. Rejects unauthorized role (COLLEGE / College Admin)', async () => {
      mockVerifyAccessToken.mockResolvedValue({ userId: 'col-1', role: 'COLLEGE' });
      
      const req = createRequest('PUT', { accreditations: [] });
      await expect(PUT(req as any, mockContext)).rejects.toThrowError(/Insufficient permissions/);
    });

    it('4. Company Admin can submit a valid collection', async () => {
      const payload = {
        accreditations: [
          {
            name: 'NAAC A+ Grade',
            issuingBody: 'NAAC',
            year: 2024,
            validUntilYear: 2029,
            description: 'Top grade accreditation',
            certificateStorageKey: 'keys/cert1.pdf',
            verificationUrl: 'https://naac.gov.in/verify',
            displayOrder: 1,
            status: 'ACTIVE' as const
          }
        ]
      };
      
      mockSyncAccreditations.mockResolvedValue({ id: validCollegeId, accreditations: payload.accreditations });
      
      const req = createRequest('PUT', payload);
      const res = await PUT(req as any, mockContext);
      
      expect(res.status).toBe(200);
      expect(mockSyncAccreditations).toHaveBeenCalledWith(validCollegeId, payload);
    });

    it('5. Rejects cross-college accreditation mutation attempt', async () => {
      mockSyncAccreditations.mockRejectedValue(
        new AppError('Cannot modify accreditations not belonging to this college: foreign-id', 400)
      );

      const payload = {
        accreditations: [
          {
            id: 'c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f',
            name: 'NAAC A+ Grade',
            issuingBody: 'NAAC',
            displayOrder: 0,
            status: 'ACTIVE' as const,
          }
        ]
      };

      const req = createRequest('PUT', payload);
      const res = await PUT(req as any, mockContext);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Cannot modify accreditations not belonging to this college');
    });

    it('6. Handles non-existent college with 404', async () => {
      mockSyncAccreditations.mockRejectedValue(new AppError('College not found', 404));
      
      const req = createRequest('PUT', { accreditations: [] });
      const res = await PUT(req as any, mockContext);
      
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.error).toBe('College not found');
    });

    it('7. Handles invalid UUID route parameter with 400', async () => {
      const invalidContext = { params: Promise.resolve({ id: 'invalid-not-a-uuid' }) };
      const req = createRequest('PUT', { accreditations: [] });
      const res = await PUT(req as any, invalidContext);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Invalid college ID format');
    });
  });

  describe('7. Request Validation Tests', () => {
    it('8. Accepts valid empty collection and clears collection', async () => {
      mockSyncAccreditations.mockResolvedValue({ id: validCollegeId, accreditations: [] });

      const req = createRequest('PUT', { accreditations: [] });
      const res = await PUT(req as any, mockContext);

      expect(res.status).toBe(200);
      expect(mockSyncAccreditations).toHaveBeenCalledWith(validCollegeId, { accreditations: [] });
    });

    it('9. Accepts exactly 15 records (ACTIVE + INACTIVE combined)', async () => {
      const fifteenRecords = Array.from({ length: 15 }).map((_, i) => ({
        name: `Accreditation ${i + 1}`,
        issuingBody: `Body ${i + 1}`,
        displayOrder: i,
        status: i % 2 === 0 ? 'ACTIVE' as const : 'INACTIVE' as const,
      }));

      mockSyncAccreditations.mockResolvedValue({ id: validCollegeId, accreditations: fifteenRecords });

      const req = createRequest('PUT', { accreditations: fifteenRecords });
      const res = await PUT(req as any, mockContext);

      expect(res.status).toBe(200);
      expect(mockSyncAccreditations).toHaveBeenCalledWith(validCollegeId, { accreditations: fifteenRecords });
    });

    it('10. Rejects 16 records (exceeding maximum 15 limit)', async () => {
      const sixteenRecords = Array.from({ length: 16 }).map((_, i) => ({
        name: `Accreditation ${i + 1}`,
        issuingBody: `Body ${i + 1}`,
        displayOrder: i,
        status: 'ACTIVE' as const,
      }));

      const req = createRequest('PUT', { accreditations: sixteenRecords });
      const res = await PUT(req as any, mockContext);

      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('maximum of 15 accreditations');
    });

    it('11. Rejects missing name', async () => {
      const req = createRequest('PUT', {
        accreditations: [
          {
            issuingBody: 'NAAC',
            displayOrder: 0,
            status: 'ACTIVE',
          }
        ]
      });
      const res = await PUT(req as any, mockContext);
      expect(res.status).toBe(400);
    });

    it('12. Rejects blank name', async () => {
      const req = createRequest('PUT', {
        accreditations: [
          {
            name: '   ',
            issuingBody: 'NAAC',
            displayOrder: 0,
            status: 'ACTIVE',
          }
        ]
      });
      const res = await PUT(req as any, mockContext);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Accreditation name is required');
    });

    it('13. Rejects invalid issuingBody (blank)', async () => {
      const req = createRequest('PUT', {
        accreditations: [
          {
            name: 'NAAC A+',
            issuingBody: '   ',
            displayOrder: 0,
            status: 'ACTIVE',
          }
        ]
      });
      const res = await PUT(req as any, mockContext);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Issuing body is required');
    });

    it('14. Rejects invalid year (< 2000 or > currentYear + 5)', async () => {
      const req1 = createRequest('PUT', {
        accreditations: [
          {
            name: 'NAAC A+',
            issuingBody: 'NAAC',
            year: 1999,
            displayOrder: 0,
            status: 'ACTIVE',
          }
        ]
      });
      const res1 = await PUT(req1 as any, mockContext);
      expect(res1.status).toBe(400);

      const req2 = createRequest('PUT', {
        accreditations: [
          {
            name: 'NAAC A+',
            issuingBody: 'NAAC',
            year: currentYear + 6,
            displayOrder: 0,
            status: 'ACTIVE',
          }
        ]
      });
      const res2 = await PUT(req2 as any, mockContext);
      expect(res2.status).toBe(400);
    });

    it('15. Rejects invalid validUntilYear (< 2000 or > currentYear + 5)', async () => {
      const req1 = createRequest('PUT', {
        accreditations: [
          {
            name: 'NAAC A+',
            issuingBody: 'NAAC',
            validUntilYear: 1999,
            displayOrder: 0,
            status: 'ACTIVE',
          }
        ]
      });
      const res1 = await PUT(req1 as any, mockContext);
      expect(res1.status).toBe(400);

      const req2 = createRequest('PUT', {
        accreditations: [
          {
            name: 'NAAC A+',
            issuingBody: 'NAAC',
            validUntilYear: currentYear + 6,
            displayOrder: 0,
            status: 'ACTIVE',
          }
        ]
      });
      const res2 = await PUT(req2 as any, mockContext);
      expect(res2.status).toBe(400);
    });

    it('16. Rejects validUntilYear earlier than year', async () => {
      const req = createRequest('PUT', {
        accreditations: [
          {
            name: 'NAAC A+',
            issuingBody: 'NAAC',
            year: 2025,
            validUntilYear: 2024,
            displayOrder: 0,
            status: 'ACTIVE',
          }
        ]
      });
      const res = await PUT(req as any, mockContext);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('validUntilYear cannot be earlier than year');
    });

    it('17. Rejects invalid verificationUrl', async () => {
      const req = createRequest('PUT', {
        accreditations: [
          {
            name: 'NAAC A+',
            issuingBody: 'NAAC',
            verificationUrl: 'not-a-valid-url',
            displayOrder: 0,
            status: 'ACTIVE',
          }
        ]
      });
      const res = await PUT(req as any, mockContext);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Invalid verification URL');
    });

    it('18. Rejects negative displayOrder', async () => {
      const req = createRequest('PUT', {
        accreditations: [
          {
            name: 'NAAC A+',
            issuingBody: 'NAAC',
            displayOrder: -1,
            status: 'ACTIVE',
          }
        ]
      });
      const res = await PUT(req as any, mockContext);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('non-negative integer');
    });

    it('19. Rejects invalid status', async () => {
      const req = createRequest('PUT', {
        accreditations: [
          {
            name: 'NAAC A+',
            issuingBody: 'NAAC',
            displayOrder: 0,
            status: 'UNKNOWN_STATUS',
          }
        ]
      });
      const res = await PUT(req as any, mockContext);
      expect(res.status).toBe(400);
    });

    it('20. Rejects invalid accreditation ID (not a valid UUID)', async () => {
      const req = createRequest('PUT', {
        accreditations: [
          {
            id: 'not-a-uuid',
            name: 'NAAC A+',
            issuingBody: 'NAAC',
            displayOrder: 0,
            status: 'ACTIVE',
          }
        ]
      });
      const res = await PUT(req as any, mockContext);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Invalid accreditation ID format');
    });

    it('21. Rejects duplicate accreditation IDs in the same submitted collection', async () => {
      const duplicateId = 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e';
      const req = createRequest('PUT', {
        accreditations: [
          {
            id: duplicateId,
            name: 'Accreditation 1',
            issuingBody: 'NAAC',
            displayOrder: 0,
            status: 'ACTIVE',
          },
          {
            id: duplicateId,
            name: 'Accreditation 2',
            issuingBody: 'NBA',
            displayOrder: 1,
            status: 'ACTIVE',
          }
        ]
      });
      const res = await PUT(req as any, mockContext);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Duplicate accreditation IDs in submission');
    });
  });
});

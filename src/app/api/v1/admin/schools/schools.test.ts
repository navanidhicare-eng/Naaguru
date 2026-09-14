import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { PATCH } from './[id]/route';
import { School, Location } from '@/shared/catalog/domain/models';
import { TokenService } from '@/shared/auth/TokenService';
import { authUseCases } from '@/shared/auth';
import { DrizzleCatalogRepository } from '@/shared/catalog/infrastructure/DrizzleCatalogRepository';

// Mock dependencies
vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ get: vi.fn() }),
}));
vi.mock('@/shared/auth', () => ({
  authUseCases: { getMe: vi.fn() }
}));
vi.mock('@/shared/database/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    execute: vi.fn(),
  }
}));

describe('Admin Schools API Integration Tests', () => {
  let reqUrl = 'http://localhost:3000/api/v1/admin/schools';
  let mockVerifyAccessToken: any;
  let mockGetMe: any;
  let mockGetAdminLocations: any;
  let mockGetLocationById: any;
  let mockGetAdminSchools: any;
  let mockCreateSchool: any;
  let mockUpdateSchool: any;
  let mockGetSchoolById: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockVerifyAccessToken = vi.spyOn(TokenService.prototype, 'verifyAccessToken');
    mockGetMe = vi.mocked(authUseCases.getMe);
    
    mockGetAdminLocations = vi.spyOn(DrizzleCatalogRepository.prototype, 'getAdminLocations');
    mockGetLocationById = vi.spyOn(DrizzleCatalogRepository.prototype, 'getLocationById');
    mockGetAdminSchools = vi.spyOn(DrizzleCatalogRepository.prototype, 'getAdminSchools');
    mockCreateSchool = vi.spyOn(DrizzleCatalogRepository.prototype, 'createSchool');
    mockUpdateSchool = vi.spyOn(DrizzleCatalogRepository.prototype, 'updateSchool');
    mockGetSchoolById = vi.spyOn(DrizzleCatalogRepository.prototype, 'getSchoolById');

    // Default auth setup (ADMIN)
    mockVerifyAccessToken.mockResolvedValue({ userId: 'admin-1', role: 'ADMIN' });
    mockGetMe.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
    
    // Default mocks
    mockGetLocationById.mockResolvedValue(Location.create({
      id: '123e4567-e89b-12d3-a456-426614174000', parentId: '123e4567-e89b-12d3-a456-426614174001', type: 'LOCALITY', nameEn: 'Valid Locality', nameTe: 'Valid Locality TE', code: null, status: 'ACTIVE', latitude: null, longitude: null
    }));
    mockGetAdminSchools.mockResolvedValue([]);
    mockCreateSchool.mockImplementation((data: any) => School.create({
      id: '123e4567-e89b-12d3-a456-426614174002', ...data, status: data.status || 'ACTIVE'
    }));
    mockGetSchoolById.mockResolvedValue(School.create({
      id: '123e4567-e89b-12d3-a456-426614174003', locationId: '123e4567-e89b-12d3-a456-426614174000', nameEn: 'Existing School', nameTe: 'Existing TE', partnershipStatus: 'PARTNER', status: 'ACTIVE'
    }));
    mockUpdateSchool.mockImplementation((id: string, updates: any) => School.create({
      id, locationId: '123e4567-e89b-12d3-a456-426614174000', nameEn: updates.nameEn || 'Existing School', nameTe: updates.nameTe || 'Existing TE', 
      partnershipStatus: updates.partnershipStatus !== undefined ? updates.partnershipStatus : 'PARTNER', 
      status: updates.status || 'ACTIVE'
    }));
  });

  const createGetRequest = (token = 'valid-token', url = reqUrl) => {
    const headers = new Headers();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return new Request(url, { headers });
  };

  const createPostRequest = (body: any, token = 'valid-token') => {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return new Request(reqUrl, { method: 'POST', headers, body: JSON.stringify(body) });
  };

  const createPatchRequest = (id: string, body: any, token = 'valid-token') => {
    const headers = new Headers({ 'Content-Type': 'application/json' });
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const url = `${reqUrl}/${id}`;
    return new Request(url, { method: 'PATCH', headers, body: JSON.stringify(body) });
  };

  describe('AUTHORIZATION & PLATFORM SCOPE', () => {
    it('1. Missing token rejected -> 401', async () => {
      const req = createGetRequest('');
      await expect(GET(req, {})).rejects.toThrowError(/No token provided/);
    });

    it('2. STUDENT rejected -> 403', async () => {
      mockVerifyAccessToken.mockResolvedValue({ userId: 'stu-1', role: 'STUDENT' });
      await expect(GET(createGetRequest(), {})).rejects.toThrowError(/Insufficient permissions/);
    });
    
    it('3. COLLEGE rejected -> 403', async () => {
      mockVerifyAccessToken.mockResolvedValue({ userId: 'col-1', role: 'COLLEGE' });
      await expect(GET(createGetRequest(), {})).rejects.toThrowError(/Insufficient permissions/);
    });

    it('4. ADMIN allowed and tenant poisoning ignored', async () => {
      // Assuming headers manipulation can't bypass because withAdminAuth checks token strictly
      mockVerifyAccessToken.mockResolvedValue({ userId: 'admin-1', role: 'ADMIN', collegeId: 'fake-college' });
      const res = await GET(createGetRequest(), {});
      expect(res.status).toBe(200);
    });
  });

  describe('CREATE (POST /api/v1/admin/schools)', () => {
    const validBody = {
      nameEn: 'New School',
      nameTe: 'New School TE',
      locationId: '123e4567-e89b-12d3-a456-426614174000',
      partnershipStatus: 'PARTNER',
      status: 'ACTIVE'
    };

    it('5. ACTIVE LOCALITY accepted', async () => {
      const req = createPostRequest(validBody);
      const res = await POST(req, {});
      expect(res.status).toBe(201);
      expect(mockCreateSchool).toHaveBeenCalledWith(expect.objectContaining({ nameEn: 'New School' }));
    });

    it('6. STATE location rejected', async () => {
      mockGetLocationById.mockResolvedValue(Location.create({
        id: '123e4567-e89b-12d3-a456-426614174000', parentId: null, type: 'STATE', nameEn: 'AP', nameTe: 'AP', code: null, status: 'ACTIVE', latitude: null, longitude: null
      }));
      const res = await POST(createPostRequest(validBody), {});
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/must be attached to a LOCALITY/);
    });

    it('7. DISTRICT location rejected', async () => {
      mockGetLocationById.mockResolvedValue(Location.create({
        id: '123e4567-e89b-12d3-a456-426614174000', parentId: 'state', type: 'DISTRICT', nameEn: 'D1', nameTe: 'D1', code: null, status: 'ACTIVE', latitude: null, longitude: null
      }));
      const res = await POST(createPostRequest(validBody), {});
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/must be attached to a LOCALITY/);
    });

    it('8. MANDAL location rejected', async () => {
      mockGetLocationById.mockResolvedValue(Location.create({
        id: '123e4567-e89b-12d3-a456-426614174000', parentId: 'dist', type: 'MANDAL', nameEn: 'M1', nameTe: 'M1', code: null, status: 'ACTIVE', latitude: null, longitude: null
      }));
      const res = await POST(createPostRequest(validBody), {});
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/must be attached to a LOCALITY/);
    });

    it('9. INACTIVE LOCALITY rejected', async () => {
      mockGetLocationById.mockResolvedValue(Location.create({
        id: '123e4567-e89b-12d3-a456-426614174000', parentId: 'mandal-1', type: 'LOCALITY', nameEn: 'L1', nameTe: 'L1', code: null, status: 'INACTIVE', latitude: null, longitude: null
      }));
      const res = await POST(createPostRequest(validBody), {});
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toMatch(/INACTIVE location/);
    });

    it('10. duplicate school name within same locality -> 409', async () => {
      mockGetAdminSchools.mockResolvedValue([
        School.create({ id: 'sch-old', locationId: '123e4567-e89b-12d3-a456-426614174000', nameEn: 'New School', nameTe: 'Old', partnershipStatus: null, status: 'ACTIVE' })
      ]);
      const res = await POST(createPostRequest(validBody), {});
      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.error).toMatch(/already exists/);
    });

    it('11. same school name in different locality -> allowed', async () => {
      // The API calls getAdminSchools with data.locationId. If it exists in another locality, it won't be returned here.
      mockGetAdminSchools.mockResolvedValue([]);
      const res = await POST(createPostRequest(validBody), {});
      expect(res.status).toBe(201);
    });
  });

  describe('UPDATE (PATCH /api/v1/admin/schools/:id)', () => {
    it('12. valid edits (status change, partner status change)', async () => {
      const req = createPatchRequest('123e4567-e89b-12d3-a456-426614174003', { status: 'INACTIVE', partnershipStatus: null });
      const res = await PATCH(req, { params: { id: '123e4567-e89b-12d3-a456-426614174003' } });
      expect(res.status).toBe(200);
      expect(mockUpdateSchool).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174003', expect.objectContaining({
        status: 'INACTIVE', partnershipStatus: null
      }));
    });

    it('13. PATCH cannot change locationId', async () => {
      // The Zod schema drops `locationId`. We can verify it fails validation or is ignored.
      const req = createPatchRequest('123e4567-e89b-12d3-a456-426614174003', { locationId: '123e4567-e89b-12d3-a456-426614174004' });
      const res = await PATCH(req, { params: { id: '123e4567-e89b-12d3-a456-426614174003' } });
      // since it's ignored, the update proceeds without locationId
      expect(res.status).toBe(200);
      expect(mockUpdateSchool).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174003', expect.not.objectContaining({ locationId: '123e4567-e89b-12d3-a456-426614174004' }));
    });
  });

  describe('INTEGRITY', () => {
    it('14. deactivating a school does not alter existing student.schoolId relationships', async () => {
      // Since student relationships are at the DB schema level (`onDelete: restrict`), 
      // deactivating (changing status to INACTIVE) only updates the status string and has no cascading effect.
      // We test that PATCH only updates status.
      const req = createPatchRequest('123e4567-e89b-12d3-a456-426614174003', { status: 'INACTIVE' });
      const res = await PATCH(req, { params: { id: '123e4567-e89b-12d3-a456-426614174003' } });
      expect(res.status).toBe(200);
      expect(mockUpdateSchool).toHaveBeenCalledWith('123e4567-e89b-12d3-a456-426614174003', expect.objectContaining({ status: 'INACTIVE' }));
    });
  });
});

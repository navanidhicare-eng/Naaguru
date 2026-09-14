import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from './route';
import { PATCH } from './[id]/route';
import { TokenService } from '@/shared/auth/TokenService';
import { authUseCases } from '@/shared/auth';
import { DrizzleCatalogRepository } from '@/shared/catalog/infrastructure/DrizzleCatalogRepository';
import { Location } from '@/shared/catalog/domain/models';

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

describe('Admin Locations API Integration Tests', () => {
  let mockVerifyAccessToken: any;
  let mockGetMe: any;
  let mockGetAdminLocations: any;
  let mockGetLocationById: any;
  let mockCreateLocation: any;
  let mockUpdateLocation: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockVerifyAccessToken = vi.spyOn(TokenService.prototype, 'verifyAccessToken');
    mockGetMe = vi.mocked(authUseCases.getMe);
    
    mockGetAdminLocations = vi.spyOn(DrizzleCatalogRepository.prototype, 'getAdminLocations');
    mockGetLocationById = vi.spyOn(DrizzleCatalogRepository.prototype, 'getLocationById');
    mockCreateLocation = vi.spyOn(DrizzleCatalogRepository.prototype, 'createLocation');
    mockUpdateLocation = vi.spyOn(DrizzleCatalogRepository.prototype, 'updateLocation');

    // Default auth setup (ADMIN)
    mockVerifyAccessToken.mockResolvedValue({ userId: 'admin-1', role: 'ADMIN' });
    mockGetMe.mockResolvedValue({ id: 'admin-1', role: 'ADMIN' });
  });

  const createPostRequest = (body: any, authHeader = 'Bearer valid.token', url = 'http://localhost/api/v1/admin/locations') => {
    const headers = new Headers();
    if (authHeader) headers.set('authorization', authHeader);
    return new Request(url, { method: 'POST', headers, body: JSON.stringify(body) });
  };
  
  const createGetRequest = (authHeader = 'Bearer valid.token', url = 'http://localhost/api/v1/admin/locations') => {
    const headers = new Headers();
    if (authHeader) headers.set('authorization', authHeader);
    return new Request(url, { method: 'GET', headers });
  };
  
  const createPatchRequest = (body: any, authHeader = 'Bearer valid.token', url = 'http://localhost/api/v1/admin/locations/loc-1') => {
    const headers = new Headers();
    if (authHeader) headers.set('authorization', authHeader);
    return new Request(url, { method: 'PATCH', headers, body: JSON.stringify(body) });
  };

  const fakeLocation = (id: string, type: string, nameEn: string, status = 'ACTIVE', parentId: string | null = null) => {
    return Location.create({ id, type: type as any, nameEn, nameTe: nameEn + ' TE', status: status as any, parentId, code: null, latitude: null, longitude: null });
  };

  describe('AUTHORIZATION', () => {
    it('1. Missing token rejected', async () => {
      const req = createGetRequest('');
      await expect(GET(req, {})).rejects.toThrowError(/No token provided/);
    });

    it('2. STUDENT rejected', async () => {
      mockVerifyAccessToken.mockResolvedValue({ userId: 'stu-1', role: 'STUDENT' });
      const req = createGetRequest();
      await expect(GET(req, {})).rejects.toThrowError(/Insufficient permissions/);
    });
    
    it('3. COLLEGE rejected', async () => {
      mockVerifyAccessToken.mockResolvedValue({ userId: 'col-1', role: 'COLLEGE' });
      const req = createGetRequest();
      await expect(GET(req, {})).rejects.toThrowError(/Insufficient permissions/);
    });

    it('4. No collegeId can influence authorization', async () => {
      // Simulate tenant poisoning attempt
      const req = createGetRequest('Bearer valid.token', 'http://localhost/api/v1/admin/locations?collegeId=fake-id');
      req.headers.set('X-College-Id', 'fake-id');
      mockGetAdminLocations.mockResolvedValue([]);
      
      const res = await GET(req, {});
      expect(res.status).toBe(200);
      expect(mockVerifyAccessToken).toHaveBeenCalled();
    });
  });

  describe('READ (GET /api/v1/admin/locations)', () => {
    it('5. Admin can list states', async () => {
      mockGetAdminLocations.mockResolvedValue([fakeLocation('s1', 'STATE', 'AP')]);
      const req = createGetRequest('Bearer valid.token', 'http://localhost/api/v1/admin/locations?type=STATE');
      const res = await GET(req, {});
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data).toHaveLength(1);
      expect(mockGetAdminLocations).toHaveBeenCalledWith('STATE', null);
    });
  });

  describe('CREATE (POST /api/v1/admin/locations) - VALIDATION & DUPLICATES', () => {
    it('6. Invalid UUID rejected', async () => {
      const req = createPostRequest({ type: 'DISTRICT', parentId: 'not-a-uuid', nameEn: 'VSP', nameTe: 'VSP TE' });
      const res = await POST(req, {});
      expect(res.status).toBe(400);
    });

    it('7. Empty name rejected', async () => {
      const req = createPostRequest({ type: 'STATE', nameEn: '', nameTe: 'TE' });
      const res = await POST(req, {});
      expect(res.status).toBe(400);
    });

    it('8. Malformed body rejected (missing type)', async () => {
      const req = createPostRequest({ nameEn: 'AP', nameTe: 'TE' });
      const res = await POST(req, {});
      expect(res.status).toBe(400);
    });

    it('9. Missing parent rejected for DISTRICT', async () => {
      const req = createPostRequest({ type: 'DISTRICT', nameEn: 'VSP', nameTe: 'VSP TE' });
      const res = await POST(req, {});
      expect(res.status).toBe(400);
    });
    
    it('10. Duplicate district within same state rejected', async () => {
      mockGetLocationById.mockResolvedValue(fakeLocation('s1', 'STATE', 'AP'));
      mockGetAdminLocations.mockResolvedValue([fakeLocation('d1', 'DISTRICT', 'Duplicate Name', 'ACTIVE', 's1')]);
      
      const req = createPostRequest({ type: 'DISTRICT', parentId: '550e8400-e29b-41d4-a716-446655440000', nameEn: 'Duplicate Name', nameTe: 'TE' });
      const res = await POST(req, {});
      expect(res.status).toBe(409);
    });
  });

  describe('CREATE - HIERARCHY RULES', () => {
    it('11. STATE with parentId -> reject', async () => {
      const req = createPostRequest({ type: 'STATE', parentId: '550e8400-e29b-41d4-a716-446655440000', nameEn: 'AP', nameTe: 'TE' });
      const res = await POST(req, {});
      expect(res.status).toBe(400);
    });

    it('12. DISTRICT with STATE parent -> accept', async () => {
      mockGetLocationById.mockResolvedValue(fakeLocation('s1', 'STATE', 'AP'));
      mockGetAdminLocations.mockResolvedValue([]);
      mockCreateLocation.mockResolvedValue(fakeLocation('d1', 'DISTRICT', 'VSP', 'ACTIVE', 's1'));

      const req = createPostRequest({ type: 'DISTRICT', parentId: '550e8400-e29b-41d4-a716-446655440000', nameEn: 'VSP', nameTe: 'TE' });
      const res = await POST(req, {});
      expect(res.status).toBe(201);
    });

    it('13. DISTRICT with DISTRICT parent -> reject', async () => {
      mockGetLocationById.mockResolvedValue(fakeLocation('d1', 'DISTRICT', 'VSP'));
      const req = createPostRequest({ type: 'DISTRICT', parentId: '550e8400-e29b-41d4-a716-446655440000', nameEn: 'New District', nameTe: 'TE' });
      const res = await POST(req, {});
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/Invalid hierarchy/);
    });
    
    it('14. Create under inactive parent -> reject', async () => {
      mockGetLocationById.mockResolvedValue(fakeLocation('s1', 'STATE', 'AP', 'INACTIVE'));
      const req = createPostRequest({ type: 'DISTRICT', parentId: '550e8400-e29b-41d4-a716-446655440000', nameEn: 'VSP', nameTe: 'TE' });
      const res = await POST(req, {});
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/INACTIVE parent/);
    });
  });

  describe('PATCH (UPDATE /api/v1/admin/locations/:id)', () => {
    it('15. PATCH cannot change type or parentId (ignored by validation)', async () => {
      mockGetLocationById.mockResolvedValue(fakeLocation('loc-1', 'DISTRICT', 'VSP'));
      mockUpdateLocation.mockResolvedValue(fakeLocation('loc-1', 'DISTRICT', 'VSP'));
      
      const req = createPatchRequest({ type: 'STATE', parentId: 'other-id', nameEn: 'New Name' });
      const res = await PATCH(req, { params: { id: 'loc-1' } });
      
      expect(res.status).toBe(200);
      // Ensure updateLocation was NOT called with type or parentId
      expect(mockUpdateLocation).toHaveBeenCalledWith('loc-1', { nameEn: 'New Name' });
    });
    
    it('16. Rename inactive location -> allowed', async () => {
      mockGetLocationById.mockResolvedValue(fakeLocation('loc-1', 'STATE', 'AP', 'INACTIVE'));
      mockGetAdminLocations.mockResolvedValue([]);
      mockUpdateLocation.mockResolvedValue(fakeLocation('loc-1', 'STATE', 'New Name', 'INACTIVE'));

      const req = createPatchRequest({ nameEn: 'New Name' });
      const res = await PATCH(req, { params: { id: 'loc-1' } });
      expect(res.status).toBe(200);
    });
    
    it('17. Deactivate -> allowed', async () => {
      mockGetLocationById.mockResolvedValue(fakeLocation('loc-1', 'STATE', 'AP', 'ACTIVE'));
      mockUpdateLocation.mockResolvedValue(fakeLocation('loc-1', 'STATE', 'AP', 'INACTIVE'));

      const req = createPatchRequest({ status: 'INACTIVE' });
      const res = await PATCH(req, { params: { id: 'loc-1' } });
      expect(res.status).toBe(200);
    });
  });
});

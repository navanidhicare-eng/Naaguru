import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { CollegeUseCases } from '@/modules/college/application/useCases/CollegeUseCases';
import { StaffAuthContext } from '@/shared/auth/middleware';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/database/db', () => ({ db: {} }));

// Mock withRouteContext so it just runs the handler directly for easier testing
vi.mock('@/shared/api/withRouteContext', () => ({
  withRouteContext: (handler: any) => handler,
}));

// Mock withStaffAuth to inject a controlled staff context directly
let mockStaffContext: StaffAuthContext | null = null;
vi.mock('@/shared/auth/middleware', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    withStaffAuth: (handler: any) => async (req: Request, ctx: unknown) => {
      if (!mockStaffContext) throw new Error('Unauthenticated (Mock)');
      return handler(req, ctx, mockStaffContext);
    }
  };
});

vi.mock('@/modules/college/application/useCases/CollegeUseCases', () => ({
  CollegeUseCases: vi.fn(),
}));

vi.mock('@/modules/college/infrastructure/DrizzleCollegeRepository', () => ({
  DrizzleCollegeRepository: vi.fn(),
}));

describe('GET /api/v1/college/profile', () => {
  let mockGetStaffCollegeProfile: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStaffContext = {
      userId: 'user-123',
      staffMembershipId: 'mem-123',
      collegeId: 'valid-college-id',
      role: 'COLLEGE_ADMIN'
    };

    mockGetStaffCollegeProfile = vi.fn().mockResolvedValue({
      id: 'valid-college-id',
      name: 'Test College',
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
    });

    vi.mocked(CollegeUseCases).mockImplementation(function() {
      return {
        getStaffCollegeProfile: mockGetStaffCollegeProfile,
      } as any;
    });
  });

  const createRequest = (url = 'http://localhost/api/v1/college/profile') => {
    return new Request(url, { method: 'GET' });
  };

  it('SUCCESS: authorized staff receives the expected profile', async () => {
    const req = createRequest();
    const res = await GET(req as any, {});
    const json = await res.json();
    
    expect(res.status).toBe(200);
    expect(json.id).toBe('valid-college-id');
    expect(mockGetStaffCollegeProfile).toHaveBeenCalledWith('valid-college-id');
  });

  it('TENANCY: use case receives exactly context.collegeId', async () => {
    const req = createRequest();
    await GET(req as any, {});
    expect(mockGetStaffCollegeProfile).toHaveBeenCalledTimes(1);
    expect(mockGetStaffCollegeProfile).toHaveBeenCalledWith('valid-college-id');
  });

  it('TENANCY: malicious query parameter such as ?collegeId=<other-college> has no effect', async () => {
    // Attack: trying to view another college's profile
    const req = createRequest('http://localhost/api/v1/college/profile?collegeId=other-college-id');
    await GET(req as any, {});
    
    // The use case is STILL called with the trusted context ID, ignoring the query param
    expect(mockGetStaffCollegeProfile).toHaveBeenCalledWith('valid-college-id');
    expect(mockGetStaffCollegeProfile).not.toHaveBeenCalledWith('other-college-id');
  });

  it('TENANCY: no client-controlled tenant ID is used from headers or anywhere else', async () => {
    const headers = new Headers();
    headers.set('X-College-Id', 'other-college-id');
    const req = new Request('http://localhost/api/v1/college/profile', { method: 'GET', headers });
    
    await GET(req as any, {});
    
    // The use case is STILL called with the trusted context ID
    expect(mockGetStaffCollegeProfile).toHaveBeenCalledWith('valid-college-id');
  });

  describe('PUT', () => {
    let mockUpdateStaffCollegeProfile: any;

    beforeEach(() => {
      mockUpdateStaffCollegeProfile = vi.fn().mockResolvedValue({
        id: 'valid-college-id',
        name: 'Test College',
        shortName: 'Updated',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
      });

      vi.mocked(CollegeUseCases).mockImplementation(function() {
        return {
          getStaffCollegeProfile: mockGetStaffCollegeProfile,
          updateStaffCollegeProfile: mockUpdateStaffCollegeProfile,
        } as any;
      });
    });

    const createPutRequest = (url = 'http://localhost/api/v1/college/profile', body: any = {}, headers = new Headers()) => {
      headers.set('Content-Type', 'application/json');
      return new Request(url, { method: 'PUT', body: JSON.stringify(body), headers });
    };

    it('SUCCESS: authorized staff updates profile successfully', async () => {
      const { PUT } = await import('./route');
      const req = createPutRequest('http://localhost/api/v1/college/profile', { shortName: 'Updated' });
      const res = await PUT(req as any, {});
      const json = await res.json();
      
      expect(res.status).toBe(200);
      expect(json.shortName).toBe('Updated');
      expect(mockUpdateStaffCollegeProfile).toHaveBeenCalledWith('valid-college-id', { shortName: 'Updated' });
    });

    it('TENANCY: malicious query parameter has no effect on writes', async () => {
      const { PUT } = await import('./route');
      const req = createPutRequest('http://localhost/api/v1/college/profile?collegeId=other-college-id', { shortName: 'Hacked' });
      await PUT(req as any, {});
      
      expect(mockUpdateStaffCollegeProfile).toHaveBeenCalledWith('valid-college-id', { shortName: 'Hacked' });
      expect(mockUpdateStaffCollegeProfile).not.toHaveBeenCalledWith('other-college-id', expect.anything());
    });

    it('TENANCY: spoofed headers are ignored for writes', async () => {
      const { PUT } = await import('./route');
      const headers = new Headers();
      headers.set('X-College-Id', 'other-college-id');
      const req = createPutRequest('http://localhost/api/v1/college/profile', { shortName: 'Hacked' }, headers);
      
      await PUT(req as any, {});
      
      expect(mockUpdateStaffCollegeProfile).toHaveBeenCalledWith('valid-college-id', { shortName: 'Hacked' });
    });

    it('VALIDATION: rejects invalid payload but does not leak tenancy', async () => {
      const { PUT } = await import('./route');
      const req = createPutRequest('http://localhost/api/v1/college/profile', { location: { lat: 'invalid string' } });
      
      const resPromise = PUT(req as any, {});
      
      await expect(resPromise).rejects.toThrow();
      expect(mockUpdateStaffCollegeProfile).not.toHaveBeenCalled();
    });
  });
});

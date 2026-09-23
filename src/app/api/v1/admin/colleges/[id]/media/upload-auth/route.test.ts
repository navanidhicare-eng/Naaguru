import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import { CollegeUseCases } from '@/modules/college/application/useCases/CollegeUseCases';
import { StaffAuthContext } from '@/shared/auth/middleware';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/database/db', () => ({ db: {} }));

// Mock withRouteContext
vi.mock('@/shared/api/withRouteContext', () => ({
  withRouteContext: (handler: any) => handler,
}));

let mockStaffContext: StaffAuthContext | null = null;
vi.mock('@/shared/auth/middleware', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    withStaffAuth: (handler: any) => async (req: Request, ctx: unknown) => {
      if (!mockStaffContext) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
      }
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

describe('POST /api/v1/admin/colleges/[id]/media/upload-auth', () => {
  let mockGenerateMediaUploadUrl: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStaffContext = {
      userId: 'user-123',
      staffMembershipId: 'mem-123',
      collegeId: 'col-1',
      role: 'COLLEGE_ADMIN'
    };

    mockGenerateMediaUploadUrl = vi.fn().mockResolvedValue({
      uploadUrl: 'https://example.com/upload',
      method: 'PUT',
      storageKey: 'colleges/col-1/media/image1.jpg'
    });

    vi.mocked(CollegeUseCases).mockImplementation(function() {
      return {
        generateMediaUploadUrl: mockGenerateMediaUploadUrl,
      } as any;
    });
  });

  const createRequest = (body: any) => {
    return new NextRequest('http://localhost/api', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  };

  it('unauthenticated upload-auth -> 401', async () => {
    mockStaffContext = null; // Unauthenticated
    const req = createRequest({ contentType: 'image/jpeg', size: 1024 });
    const res = await POST(req, { params: Promise.resolve({ id: 'col-1' }) } as any);
    expect(res.status).toBe(401);
  });

  it('non-College-Admin rejected -> 403', async () => {
    mockStaffContext = { ...mockStaffContext!, role: 'COLLEGE_STAFF' }; // Not admin
    const req = createRequest({ contentType: 'image/jpeg', size: 1024 });
    const res = await POST(req, { params: Promise.resolve({ id: 'col-1' }) } as any);
    expect(res.status).toBe(403);
  });

  it('College A admin accessing College B rejected -> 403', async () => {
    mockStaffContext = { ...mockStaffContext!, collegeId: 'col-2' }; // College B admin
    const req = createRequest({ contentType: 'image/jpeg', size: 1024 });
    const res = await POST(req, { params: Promise.resolve({ id: 'col-1' }) } as any);
    expect(res.status).toBe(403);
  });

  it('College A admin accessing College A succeeds', async () => {
    const req = createRequest({ contentType: 'image/jpeg', size: 1024 });
    const res = await POST(req, { params: Promise.resolve({ id: 'col-1' }) } as any);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.uploadUrl).toBe('https://example.com/upload');
    expect(data.method).toBe('PUT');
  });

  it('secrets never returned to client', async () => {
    const req = createRequest({ contentType: 'image/jpeg', size: 1024 });
    const res = await POST(req, { params: Promise.resolve({ id: 'col-1' }) } as any);
    const data = await res.json();
    
    // Ensure only safe fields are returned
    expect(Object.keys(data)).toEqual(['uploadUrl', 'method', 'storageKey']);
    expect(data).not.toHaveProperty('supabaseServiceRoleKey');
  });
});

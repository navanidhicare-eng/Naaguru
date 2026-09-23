import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PUT } from './route';
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

describe('PUT /api/v1/admin/colleges/[id]/media', () => {
  let mockSyncMedia: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockStaffContext = {
      userId: 'user-123',
      staffMembershipId: 'mem-123',
      collegeId: 'col-1',
      role: 'COLLEGE_ADMIN'
    };

    mockSyncMedia = vi.fn().mockResolvedValue({
      id: 'col-1',
      name: 'Test College',
      media: []
    });

    vi.mocked(CollegeUseCases).mockImplementation(function() {
      return {
        syncMedia: mockSyncMedia,
      } as any;
    });
  });

  const createRequest = (body: any) => {
    return new NextRequest('http://localhost/api', {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  };

  it('unauthenticated media sync -> 401', async () => {
    mockStaffContext = null; // Unauthenticated
    const req = createRequest({ media: [] });
    const res = await PUT(req, { params: Promise.resolve({ id: 'col-1' }) } as any);
    expect(res.status).toBe(401);
  });

  it('non-College-Admin rejected -> 403', async () => {
    mockStaffContext = { ...mockStaffContext!, role: 'COLLEGE_STAFF' }; // Not admin
    const req = createRequest({ media: [] });
    const res = await PUT(req, { params: Promise.resolve({ id: 'col-1' }) } as any);
    expect(res.status).toBe(403);
  });

  it('College A admin accessing College B rejected -> 403', async () => {
    mockStaffContext = { ...mockStaffContext!, collegeId: 'col-2' }; // College B admin
    const req = createRequest({ media: [] });
    const res = await PUT(req, { params: Promise.resolve({ id: 'col-1' }) } as any);
    expect(res.status).toBe(403);
  });

  it('College A admin accessing College A succeeds', async () => {
    const req = createRequest({ media: [] });
    const res = await PUT(req, { params: Promise.resolve({ id: 'col-1' }) } as any);
    expect(res.status).toBe(200);
    expect(mockSyncMedia).toHaveBeenCalledWith('col-1', { media: [] });
  });
});

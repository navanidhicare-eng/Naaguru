import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { db } from '@/shared/database/db';
import { StaffUseCases } from '@/modules/staff/application/StaffUseCases';
import { TokenService } from '@/shared/auth/TokenService';
import { createHash } from 'crypto';

vi.mock('server-only', () => ({}));

const hashValue = (val: string) => createHash('sha256').update(val).digest('hex');

// Mock dependencies
vi.mock('@/shared/database/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  }
}));

vi.mock('@/modules/staff/application/StaffUseCases', () => ({
  StaffUseCases: vi.fn(),
}));

vi.mock('@/shared/auth/TokenService', () => ({
  TokenService: vi.fn(),
}));

describe('POST /api/v1/auth/college-login', () => {
  let mockGetActiveMembershipsForUser: any;
  let mockIssueTokens: any;
  let mockDbInsert: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetActiveMembershipsForUser = vi.fn();
    vi.mocked(StaffUseCases).mockImplementation(function() {
      return {
        getActiveMembershipsForUser: mockGetActiveMembershipsForUser,
      } as any;
    });

    mockIssueTokens = vi.fn().mockResolvedValue({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    });
    vi.mocked(TokenService).mockImplementation(function() {
      return {
        issueTokens: mockIssueTokens,
        verifyAccessToken: vi.fn(),
      } as any;
    });

    mockDbInsert = {
      values: vi.fn().mockResolvedValue([{}]),
    };
    vi.mocked(db.insert).mockReturnValue(mockDbInsert as any);
  });

  const createRequest = (body: any) => {
    return new Request('http://localhost:3000/api/v1/auth/college-login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  };

  const setupDbUser = (user: any) => {
    const mockQuery = {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(user ? [user] : []),
      }),
    };
    vi.mocked(db.select).mockReturnValue(mockQuery as any);
  };

  const validPassword = 'password123';
  const validPasswordHash = hashValue(validPassword);

  it('SUCCESS: 1. Valid COLLEGE user + one ACTIVE COLLEGE_ADMIN membership', async () => {
    setupDbUser({ id: 'user-1', role: 'COLLEGE', passwordHash: validPasswordHash });
    mockGetActiveMembershipsForUser.mockResolvedValue([{
      id: 'mem-1',
      collegeId: 'col-1',
      role: 'COLLEGE_ADMIN',
    }]);

    const req = createRequest({ email: 'test@college.com', password: validPassword });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.accessToken).toBe('mock-access-token');

    // 10. Staff token contains userId, staffMembershipId, collegeId, role
    expect(mockIssueTokens).toHaveBeenCalledWith({
      userId: 'user-1',
      staffMembershipId: 'mem-1',
      collegeId: 'col-1',
      role: 'COLLEGE_ADMIN',
    });

    // 12, 13, 14. Cookie checks
    const cookies = res.headers.getSetCookie();
    const accessTokenCookie = cookies.find(c => c.startsWith('accessToken='));
    expect(accessTokenCookie).toBeDefined();
    expect(accessTokenCookie).toContain('HttpOnly');
    expect(accessTokenCookie).toContain('Path=/');

    const refreshTokenCookie = cookies.find(c => c.startsWith('refreshToken='));
    expect(refreshTokenCookie).toBeDefined();
    expect(refreshTokenCookie).toContain('HttpOnly');
    expect(refreshTokenCookie).toContain('Path=/api/v1/auth');
  });

  it('SUCCESS: 2. Valid COLLEGE user + one ACTIVE COLLEGE_STAFF membership', async () => {
    setupDbUser({ id: 'user-1', role: 'COLLEGE', passwordHash: validPasswordHash });
    mockGetActiveMembershipsForUser.mockResolvedValue([{
      id: 'mem-2',
      collegeId: 'col-1',
      role: 'COLLEGE_STAFF',
    }]);

    const req = createRequest({ email: 'test@college.com', password: validPassword });
    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(mockIssueTokens).toHaveBeenCalledWith({
      userId: 'user-1',
      staffMembershipId: 'mem-2',
      collegeId: 'col-1',
      role: 'COLLEGE_STAFF',
    });
  });

  it('FAILURE: 3. Wrong password', async () => {
    setupDbUser({ id: 'user-1', role: 'COLLEGE', passwordHash: validPasswordHash });
    
    const req = createRequest({ email: 'test@college.com', password: 'wrong' });
    const res = await POST(req);
    
    expect(res.status).toBe(401);
  });

  it('FAILURE: 4. STUDENT user attempting College login', async () => {
    setupDbUser({ id: 'user-1', role: 'STUDENT', passwordHash: validPasswordHash });
    
    const req = createRequest({ email: 'test@college.com', password: validPassword });
    const res = await POST(req);
    
    expect(res.status).toBe(401);
  });

  it('FAILURE: 5, 6, 7. COLLEGE user with no active membership', async () => {
    setupDbUser({ id: 'user-1', role: 'COLLEGE', passwordHash: validPasswordHash });
    mockGetActiveMembershipsForUser.mockResolvedValue([]);
    
    const req = createRequest({ email: 'test@college.com', password: validPassword });
    const res = await POST(req);
    
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toMatch(/No active staff membership/);
  });

  it('FAILURE: 8. COLLEGE user with multiple ACTIVE memberships', async () => {
    setupDbUser({ id: 'user-1', role: 'COLLEGE', passwordHash: validPasswordHash });
    mockGetActiveMembershipsForUser.mockResolvedValue([
      { id: 'mem-1', collegeId: 'col-1', role: 'COLLEGE_ADMIN' },
      { id: 'mem-2', collegeId: 'col-2', role: 'COLLEGE_ADMIN' }
    ]);
    
    const req = createRequest({ email: 'test@college.com', password: validPassword });
    const res = await POST(req);
    
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toMatch(/Multiple active memberships/);
  });
});

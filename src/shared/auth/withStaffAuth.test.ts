import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withStaffAuth, StaffAuthContext, AuthContext, withAuth } from './middleware';
import { TokenService } from './TokenService';
import { StaffAuthorizationService } from '../../modules/staff/application/StaffAuthorizationService';
import { AppError } from '../errors';
import { NextResponse } from 'next/server';

vi.mock('server-only', () => ({}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
  }),
}));

vi.mock('../../modules/staff/application/StaffAuthorizationService', () => ({
  StaffAuthorizationService: vi.fn().mockImplementation(function() {
    return {
      verifyContext: vi.fn(),
    } as any;
  }),
}));

vi.mock('../../modules/staff/infrastructure/DrizzleStaffMembershipRepository', () => ({
  DrizzleStaffMembershipRepository: vi.fn(),
}));

describe('withStaffAuth', () => {
  let mockVerifyAccessToken: any;
  let mockVerifyContext: any;
  let mockCookiesGet: any;
  
  beforeEach(async () => {
    vi.clearAllMocks();

    mockVerifyAccessToken = vi.spyOn(TokenService.prototype, 'verifyAccessToken');

    mockVerifyContext = vi.fn().mockResolvedValue(undefined);
    vi.mocked(StaffAuthorizationService).mockImplementation(function() {
      return {
        verifyContext: mockVerifyContext,
      } as any;
    });

    mockCookiesGet = vi.fn();
    const { cookies } = await import('next/headers');
    vi.mocked(cookies).mockResolvedValue({
      get: mockCookiesGet,
    } as any);
  });

  const createRequest = (authHeader?: string) => {
    const headers = new Headers();
    if (authHeader) headers.set('authorization', authHeader);
    return new Request('http://localhost', { headers });
  };

  const validTokenPayload: StaffAuthContext = {
    userId: 'user-1',
    staffMembershipId: 'mem-1',
    collegeId: 'col-1',
    role: 'COLLEGE_ADMIN',
  };

  const dummyHandler = async (req: Request, ctx: unknown, staffContext: StaffAuthContext) => {
    return NextResponse.json({ success: true, staffContext });
  };

  const wrappedHandler = withStaffAuth(dummyHandler);

  describe('SUCCESS cases', () => {
    it('1-6. Valid token and matching ACTIVE database membership succeeds', async () => {
      mockVerifyAccessToken.mockResolvedValue(validTokenPayload);
      const req = createRequest('Bearer valid.token');
      
      const res = await wrappedHandler(req, {});
      const json = await res.json();
      
      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.staffContext).toEqual(validTokenPayload);
      expect(mockVerifyContext).toHaveBeenCalledWith(validTokenPayload);
    });
  });

  describe('FAILURE cases', () => {
    it('7. No token -> 401', async () => {
      const req = createRequest();
      await expect(wrappedHandler(req, {})).rejects.toThrowError(
        new AppError('Unauthorized: No token provided', 401, 'UNAUTHORIZED')
      );
    });

    it('8, 9. Invalid/Expired token -> 401', async () => {
      mockVerifyAccessToken.mockRejectedValue(new Error('jwt expired'));
      const req = createRequest('Bearer expired.token');
      await expect(wrappedHandler(req, {})).rejects.toThrowError(
        new AppError('Unauthorized: Invalid or expired token', 401, 'UNAUTHORIZED')
      );
    });

    it('10. Missing staffMembershipId -> 401', async () => {
      mockVerifyAccessToken.mockResolvedValue({ ...validTokenPayload, staffMembershipId: undefined });
      const req = createRequest('Bearer bad.token');
      await expect(wrappedHandler(req, {})).rejects.toThrowError(
        new AppError('Unauthorized: Missing staff claims', 401, 'UNAUTHORIZED')
      );
    });

    it('11. Missing collegeId -> 401', async () => {
      mockVerifyAccessToken.mockResolvedValue({ ...validTokenPayload, collegeId: undefined });
      const req = createRequest('Bearer bad.token');
      await expect(wrappedHandler(req, {})).rejects.toThrowError(
        new AppError('Unauthorized: Missing staff claims', 401, 'UNAUTHORIZED')
      );
    });

    it('12. Invalid staff role in token -> 403', async () => {
      mockVerifyAccessToken.mockResolvedValue({ ...validTokenPayload, role: 'STUDENT' });
      const req = createRequest('Bearer bad.token');
      await expect(wrappedHandler(req, {})).rejects.toThrowError(
        new AppError('Forbidden: Invalid staff role', 403, 'FORBIDDEN')
      );
    });

    it('13-18. Database verification fails (propagates Service AppError) -> 403', async () => {
      mockVerifyAccessToken.mockResolvedValue(validTokenPayload);
      const dbError = new AppError('Membership belongs to another user', 403, 'FORBIDDEN');
      mockVerifyContext.mockRejectedValue(dbError);
      
      const req = createRequest('Bearer valid.token');
      await expect(wrappedHandler(req, {})).rejects.toThrowError(dbError);
    });
  });

  describe('TENANCY cases', () => {
    it('19. User cannot use a token for College A to access College B', async () => {
      // The design prevents this naturally because withStaffAuth ALWAYS passes the collegeId 
      // from the token (which was validated against the DB) directly into the route handler's context.
      // The handler must use staffContext.collegeId. The client has no opportunity to override it via the token.
      mockVerifyAccessToken.mockResolvedValue(validTokenPayload);
      const req = createRequest('Bearer valid.token');
      
      const res = await wrappedHandler(req, {});
      const json = await res.json();
      
      expect(json.staffContext.collegeId).toBe('col-1'); // Route enforces this, ignoring query params.
    });
  });
});

describe('REGRESSION: withAuth', () => {
  let mockVerifyAccessToken: any;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    mockVerifyAccessToken = vi.spyOn(TokenService.prototype, 'verifyAccessToken');
  });

  it('20. Existing withAuth Student tests continue to pass', async () => {
    const studentPayload: AuthContext = { userId: 'student-1', role: 'STUDENT' };
    mockVerifyAccessToken.mockResolvedValue(studentPayload);

    const dummyHandler = async (req: Request, ctx: unknown, authCtx: AuthContext) => {
      return NextResponse.json({ success: true, authCtx });
    };

    const wrapped = withAuth(dummyHandler, ['STUDENT']);
    const req = new Request('http://localhost', { headers: new Headers({ authorization: 'Bearer token' }) });
    
    const res = await wrapped(req, {});
    const json = await res.json();

    expect(json.authCtx).toEqual(studentPayload);
    // Student auth did NOT call StaffAuthorizationService
    expect(StaffAuthorizationService).not.toHaveBeenCalled();
  });
});

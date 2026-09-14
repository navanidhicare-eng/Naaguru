import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withAdminAuth, AdminAuthContext, AuthContext } from './middleware';
import { TokenService } from './TokenService';
import { authUseCases } from './index';
import { AppError } from '../errors';
import { NextResponse } from 'next/server';

vi.mock('server-only', () => ({}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn(),
  }),
}));

vi.mock('./index', () => ({
  authUseCases: {
    getMe: vi.fn(),
  }
}));

describe('withAdminAuth', () => {
  let mockVerifyAccessToken: any;
  let mockGetMe: any;
  let mockCookiesGet: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    mockVerifyAccessToken = vi.spyOn(TokenService.prototype, 'verifyAccessToken');
    mockGetMe = vi.mocked(authUseCases.getMe);

    mockCookiesGet = vi.fn();
    const { cookies } = await import('next/headers');
    vi.mocked(cookies).mockResolvedValue({
      get: mockCookiesGet,
    } as any);
  });

  const createRequest = (authHeader?: string, url = 'http://localhost') => {
    const headers = new Headers();
    if (authHeader) headers.set('authorization', authHeader);
    return new Request(url, { headers });
  };

  const validTokenPayload: AuthContext = {
    userId: 'admin-1',
    role: 'ADMIN',
  };

  const validDbUser = {
    id: 'admin-1',
    phoneNumber: '1234567890',
    role: 'ADMIN',
  };

  const dummyHandler = async (req: Request, ctx: unknown, adminContext: AdminAuthContext) => {
    return NextResponse.json({ success: true, adminContext });
  };

  const wrappedHandler = withAdminAuth(dummyHandler);

  describe('AUTHORIZATION SUCCESS', () => {
    it('1. Valid ADMIN token + valid ADMIN user succeeds', async () => {
      mockVerifyAccessToken.mockResolvedValue(validTokenPayload);
      mockGetMe.mockResolvedValue(validDbUser);
      const req = createRequest('Bearer valid.token');

      const res = await wrappedHandler(req, {});
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.adminContext).toEqual({ userId: 'admin-1', role: 'ADMIN' });
      expect(mockGetMe).toHaveBeenCalledWith('admin-1');
    });
  });

  describe('ROLE REJECTION', () => {
    it('2. STUDENT token -> 403', async () => {
      mockVerifyAccessToken.mockResolvedValue({ userId: 'stu-1', role: 'STUDENT' });
      const req = createRequest('Bearer valid.token');
      await expect(wrappedHandler(req, {})).rejects.toThrowError(
        new AppError('Forbidden: Insufficient permissions', 403, 'FORBIDDEN')
      );
      expect(mockGetMe).not.toHaveBeenCalled();
    });

    it('3. COLLEGE token -> 403', async () => {
      mockVerifyAccessToken.mockResolvedValue({ userId: 'col-1', role: 'COLLEGE' });
      const req = createRequest('Bearer valid.token');
      await expect(wrappedHandler(req, {})).rejects.toThrowError(
        new AppError('Forbidden: Insufficient permissions', 403, 'FORBIDDEN')
      );
      expect(mockGetMe).not.toHaveBeenCalled();
    });
  });

  describe('TOKEN FAILURE', () => {
    it('4. Missing token -> 401', async () => {
      const req = createRequest();
      await expect(wrappedHandler(req, {})).rejects.toThrowError(
        new AppError('Unauthorized: No token provided', 401, 'UNAUTHORIZED')
      );
    });

    it('5. Malformed JWT / Invalid Signature -> 401', async () => {
      mockVerifyAccessToken.mockRejectedValue(new Error('jwt malformed'));
      const req = createRequest('Bearer bad.token');
      await expect(wrappedHandler(req, {})).rejects.toThrowError(
        new AppError('Unauthorized: Invalid or expired token', 401, 'UNAUTHORIZED')
      );
    });

    it('6. Expired token -> 401', async () => {
      mockVerifyAccessToken.mockRejectedValue(new Error('jwt expired'));
      const req = createRequest('Bearer expired.token');
      await expect(wrappedHandler(req, {})).rejects.toThrowError(
        new AppError('Unauthorized: Invalid or expired token', 401, 'UNAUTHORIZED')
      );
    });
  });

  describe('DATABASE / IDENTITY VALIDATION', () => {
    it('7. Token role ADMIN, DB role changed to COLLEGE -> 403', async () => {
      mockVerifyAccessToken.mockResolvedValue(validTokenPayload);
      mockGetMe.mockResolvedValue({ ...validDbUser, role: 'COLLEGE' });
      const req = createRequest('Bearer valid.token');

      await expect(wrappedHandler(req, {})).rejects.toThrowError(
        new AppError('Forbidden: Admin role revoked', 403, 'FORBIDDEN')
      );
    });

    it('8. Token role ADMIN, DB user missing -> 403', async () => {
      mockVerifyAccessToken.mockResolvedValue(validTokenPayload);
      mockGetMe.mockRejectedValue(new Error('User not found'));
      const req = createRequest('Bearer valid.token');

      await expect(wrappedHandler(req, {})).rejects.toThrowError(
        new AppError('Forbidden: User not found', 403, 'FORBIDDEN')
      );
    });
  });

  describe('SCOPE / TENANCY SAFETY', () => {
    it('9. X-College-Id / collegeId cannot affect authorization', async () => {
      mockVerifyAccessToken.mockResolvedValue(validTokenPayload);
      mockGetMe.mockResolvedValue(validDbUser);
      
      const req = createRequest('Bearer valid.token', 'http://localhost?collegeId=fake-id');
      req.headers.set('X-College-Id', 'fake-id');

      const res = await wrappedHandler(req, {});
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.adminContext).toEqual({ userId: 'admin-1', role: 'ADMIN' });
      // adminContext does NOT include collegeId
      expect((json.adminContext as any).collegeId).toBeUndefined();
    });
  });
});

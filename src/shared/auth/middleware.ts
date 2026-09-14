import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authUseCases } from './index';
import { AppError } from '../errors';
import { StaffAuthorizationService } from '../../modules/staff/application/StaffAuthorizationService';
import { DrizzleStaffMembershipRepository } from '../../modules/staff/infrastructure/DrizzleStaffMembershipRepository';

// Assuming we expose tokenService via authUseCases or export it directly.
// Let's import TokenService to decode manually for now, or export it from index.
import { TokenService } from './TokenService';
const tokenService = new TokenService();

export interface AuthContext {
  userId: string;
  role: 'STUDENT' | 'COLLEGE' | 'ADMIN';
}

export interface StaffAuthContext {
  userId: string;
  staffMembershipId: string;
  collegeId: string;
  role: 'COLLEGE_ADMIN' | 'COLLEGE_STAFF';
}

type RouteHandler = (
  request: Request,
  context: unknown,
  authContext: AuthContext
) => Promise<NextResponse> | NextResponse;

export function withAuth(handler: RouteHandler, allowedRoles?: AuthContext['role'][]) {
  return async (request: Request, context: unknown) => {
    let authContext: AuthContext;

    try {
      let token: string | undefined;

      // 1. Check Authorization header (Flutter / API clients)
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }

      // 2. Check cookies (Next.js Web)
      if (!token) {
        const cookieStore = await cookies();
        token = cookieStore.get('accessToken')?.value;
      }

      if (!token) {
        throw new AppError('Unauthorized: No token provided', 401, 'UNAUTHORIZED');
      }

      // 3. Verify token
      const decoded = await tokenService.verifyAccessToken<AuthContext>(token);

      // 4. Role-Based Access Control (RBAC) check
      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        throw new AppError('Forbidden: Insufficient permissions', 403, 'FORBIDDEN');
      }

      authContext = decoded;
    } catch (error) {
      if (error instanceof AppError) {
        throw error; // Let withRouteContext catch it
      }
      throw new AppError('Unauthorized: Invalid or expired token', 401, 'UNAUTHORIZED');
    }

    // 5. Proceed to handler with injected context OUTSIDE the auth try-catch
    return await handler(request, context, authContext);
  };
}

type StaffRouteHandler = (
  request: Request,
  context: unknown,
  staffAuthContext: StaffAuthContext
) => Promise<NextResponse> | NextResponse;

export function withStaffAuth(handler: StaffRouteHandler) {
  return async (request: Request, context: unknown) => {
    let staffAuthContext: StaffAuthContext;

    try {
      let token: string | undefined;

      // 1. Check Authorization header
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }

      // 2. Check cookies
      if (!token) {
        const cookieStore = await cookies();
        token = cookieStore.get('accessToken')?.value;
      }

      if (!token) {
        throw new AppError('Unauthorized: No token provided', 401, 'UNAUTHORIZED');
      }

      // 3. Verify token and decode as StaffAuthContext
      const decoded = await tokenService.verifyAccessToken<StaffAuthContext>(token);

      // 4. Ensure it has staff claims
      if (!decoded.staffMembershipId || !decoded.collegeId || !decoded.userId || !decoded.role) {
         throw new AppError('Unauthorized: Missing staff claims', 401, 'UNAUTHORIZED');
      }

      if (decoded.role !== 'COLLEGE_ADMIN' && decoded.role !== 'COLLEGE_STAFF') {
         throw new AppError('Forbidden: Invalid staff role', 403, 'FORBIDDEN');
      }

      // 5. Database Verification (Zero-Trust Tenancy)
      const authService = new StaffAuthorizationService(new DrizzleStaffMembershipRepository());
      await authService.verifyContext(decoded);

      staffAuthContext = decoded;
    } catch (error) {
      if (error instanceof AppError) {
        throw error; // Let withRouteContext catch it
      }
      throw new AppError('Unauthorized: Invalid or expired token', 401, 'UNAUTHORIZED');
    }

    // 6. Proceed to handler with injected context OUTSIDE the auth try-catch
    return await handler(request, context, staffAuthContext);
  };
}

export async function getServerStaffAuthContext(): Promise<StaffAuthContext | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return null;
    }

    const decoded = await tokenService.verifyAccessToken<StaffAuthContext>(token);

    if (!decoded.staffMembershipId || !decoded.collegeId || !decoded.userId || !decoded.role) {
       return null;
    }

    if (decoded.role !== 'COLLEGE_ADMIN' && decoded.role !== 'COLLEGE_STAFF') {
       return null;
    }

    const authService = new StaffAuthorizationService(new DrizzleStaffMembershipRepository());
    await authService.verifyContext(decoded);

    return decoded;
  } catch (error) {
    return null;
  }
}

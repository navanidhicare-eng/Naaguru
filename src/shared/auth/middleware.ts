import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { authUseCases } from './index';

// Assuming we expose tokenService via authUseCases or export it directly.
// Let's import TokenService to decode manually for now, or export it from index.
import { TokenService } from './TokenService';
const tokenService = new TokenService();

export interface AuthContext {
  userId: string;
  role: 'STUDENT' | 'COLLEGE' | 'ADMIN';
}

type RouteHandler = (
  request: Request,
  context: unknown,
  authContext: AuthContext
) => Promise<NextResponse> | NextResponse;

export function withAuth(handler: RouteHandler, allowedRoles?: AuthContext['role'][]) {
  return async (request: Request, context: unknown) => {
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
        return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
      }

      // 3. Verify token
      const decoded = await tokenService.verifyAccessToken<AuthContext>(token);

      // 4. Role-Based Access Control (RBAC) check
      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
      }

      // 5. Proceed to handler with injected context
      return await handler(request, context, decoded);
    } catch (error) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
    }
  };
}

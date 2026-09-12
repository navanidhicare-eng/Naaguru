import { NextResponse } from 'next/server';
import { withAuth } from '@/shared/auth/middleware';
import { withRouteContext } from '@/shared/api/withRouteContext';
import { authUseCases } from '@/shared/auth';

export const GET = withRouteContext(
  withAuth(async (request, context, auth) => {
    const me = await authUseCases.getMe(auth.userId);
    return NextResponse.json(me);
  })
);

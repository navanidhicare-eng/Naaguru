import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { authUseCases } from '@/shared/auth';
import { withAuth } from '@/shared/auth/middleware';

const logoutSchema = z.object({
  refreshToken: z.string().optional(),
  clientType: z.enum(['web', 'mobile']).default('web'),
});

export const POST = withAuth(async (request: Request) => {
  try {
    const body = await request.json().catch(() => ({}));
    const { clientType, refreshToken: bodyToken } = logoutSchema.parse(body);

    let refreshToken = bodyToken;

    if (clientType === 'web' && !refreshToken) {
      const cookieStore = await cookies();
      refreshToken = cookieStore.get('refreshToken')?.value;
    }

    if (refreshToken) {
      await authUseCases.logout(refreshToken);
    }

    if (clientType === 'web') {
      const cookieStore = await cookies();
      cookieStore.delete('accessToken');
      cookieStore.delete('refreshToken');
    }

    return NextResponse.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

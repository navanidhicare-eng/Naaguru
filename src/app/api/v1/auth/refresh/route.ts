import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { authUseCases } from '@/shared/auth';

const refreshSchema = z.object({
  refreshToken: z.string().optional(), // For mobile, it might be in body
  clientType: z.enum(['web', 'mobile']).default('web'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { clientType, refreshToken: bodyToken } = refreshSchema.parse(body);

    let refreshToken = bodyToken;

    if (clientType === 'web' && !refreshToken) {
      const cookieStore = await cookies();
      refreshToken = cookieStore.get('refreshToken')?.value;
    }

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token required' }, { status: 400 });
    }

    const tokens = await authUseCases.refreshTokens(refreshToken);

    if (clientType === 'web') {
      const cookieStore = await cookies();
      cookieStore.set('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60, // 15 minutes
        path: '/',
      });
      cookieStore.set('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/',
      });
      
      return NextResponse.json({ message: 'Tokens refreshed' });
    } else {
      return NextResponse.json(tokens);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

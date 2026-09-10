import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/shared/database/db';
import { usersTable, sessionsTable } from '@/shared/auth/schema';
import { eq } from 'drizzle-orm';
import { createHash } from 'crypto';
import { TokenService } from '@/shared/auth/TokenService';

const hashValue = (val: string) => createHash('sha256').update(val).digest('hex');

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));

    if (!user || user.role !== 'COLLEGE') {
      return NextResponse.json({ error: 'Invalid credentials or unauthorized role' }, { status: 401 });
    }

    const passwordHash = hashValue(password);
    if (user.passwordHash !== passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Issue tokens
    const tokenService = new TokenService(); // Need proper DI or instantiation if the app uses it
    const tokens = await tokenService.issueTokens({ userId: user.id, role: user.role });

    const refreshTokenHash = hashValue(tokens.refreshToken);
    const refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await db.insert(sessionsTable).values({
      userId: user.id,
      refreshTokenHash,
      expiresAt: refreshTokenExpiresAt,
    });

    const response = NextResponse.json({
      message: 'Logged in successfully',
      accessToken: tokens.accessToken,
    });

    // Set refresh token in httpOnly cookie
    response.cookies.set({
      name: 'refreshToken',
      value: tokens.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/api/v1/auth',
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

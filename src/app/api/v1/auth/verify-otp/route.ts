import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { authUseCases } from '@/shared/auth';
import { normalizePhoneNumber } from '@/shared/auth/utils';

const verifyOtpSchema = z.object({
  phoneNumber: z.string().min(10).max(15).regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  code: z.string().length(6),
  clientType: z.enum(['web', 'mobile']).default('web'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, code, clientType } = verifyOtpSchema.parse(body);
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    const tokens = await authUseCases.verifyOtp(normalizedPhone, code);

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
      
      return NextResponse.json({ message: 'Verified successfully' });
    } else {
      // For mobile (Flutter), return tokens in response body
      return NextResponse.json(tokens);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: error instanceof Error && message.includes('OTP') ? 401 : 500 });
  }
}

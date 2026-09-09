import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authUseCases } from '@/shared/auth';
import { normalizePhoneNumber } from '@/shared/auth/utils';

const requestOtpSchema = z.object({
  phoneNumber: z.string().min(10).max(15).regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber } = requestOtpSchema.parse(body);
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    await authUseCases.requestOtp(normalizedPhone);

    return NextResponse.json({ message: 'OTP sent successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes('Please wait 60 seconds')) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    console.error('Request OTP Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

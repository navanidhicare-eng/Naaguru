import { NextResponse } from 'next/server';
import { withAuth } from '@/shared/auth/middleware';
import { AssessmentModule } from '@/modules/assessment';
import { AppError } from '@/shared/errors';

export const GET = withAuth(async (request, context, auth) => {
  try {
    const attempt = await AssessmentModule.startOrResumeAttempt(auth.userId);
    return NextResponse.json(attempt);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Get/Start Attempt Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['STUDENT']);

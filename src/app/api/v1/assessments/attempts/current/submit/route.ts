import { NextResponse } from 'next/server';
import { withAuth } from '@/shared/auth/middleware';
import { AssessmentModule } from '@/modules/assessment';
import { AppError } from '@/shared/errors';

export const POST = withAuth(async (request, context, auth) => {
  try {
    const result = await AssessmentModule.submitAttempt(auth.userId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Submit Attempt Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['STUDENT']);

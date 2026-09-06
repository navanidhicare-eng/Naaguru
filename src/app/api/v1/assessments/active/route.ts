import { NextResponse } from 'next/server';
import { withAuth } from '@/shared/auth/middleware';
import { AssessmentModule } from '@/modules/assessment/public';
import { AppError } from '@/shared/errors';

export const GET = withAuth(async (request, context, auth) => {
  try {
    const assessment = await AssessmentModule.getActiveAssessment();
    return NextResponse.json(assessment);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Get Active Assessment Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['STUDENT']);

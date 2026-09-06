import { NextResponse } from 'next/server';
import { withAuth } from '@/shared/auth/middleware';
import { CareerModule } from '@/modules/career';
import { AppError } from '@/shared/errors';

export const POST = withAuth(async (request, context, auth) => {
  try {
    const recommendation = await CareerModule.generateRecommendation(auth.userId);
    return NextResponse.json(recommendation, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Generate Recommendation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['STUDENT']);

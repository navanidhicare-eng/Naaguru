import { NextResponse } from 'next/server';
import { withAuth } from '@/shared/auth/middleware';
import { AssessmentModule } from '@/modules/assessment';
import { AppError } from '@/shared/errors';
import { z } from 'zod';

const answerSchema = z.object({
  questionId: z.string().uuid(),
  optionId: z.string().uuid(),
});

export const PATCH = withAuth(async (request, context, auth) => {
  try {
    const body = await request.json().catch(() => ({}));
    const data = answerSchema.parse(body);

    const attempt = await AssessmentModule.saveAnswer(auth.userId, data.questionId, data.optionId);
    
    return NextResponse.json(attempt);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Save Answer Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['STUDENT']);

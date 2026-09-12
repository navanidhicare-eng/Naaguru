import { NextResponse } from 'next/server';
import { withAuth } from '@/shared/auth/middleware';
import { withRouteContext } from '@/shared/api/withRouteContext';
import { AssessmentModule } from '@/modules/assessment';
import { AppError } from '@/shared/errors';
import { z } from 'zod';
const answerSchema = z.object({
  questionId: z.string().uuid(),
  optionId: z.string().uuid(),
});
export const PATCH = withRouteContext(
  withAuth(async (request, context, auth) => {
const body = await request.json().catch(() => ({}));
const data = answerSchema.parse(body);
const attempt = await AssessmentModule.saveAnswer(auth.userId, data.questionId, data.optionId);
return NextResponse.json(attempt);
}, ['STUDENT'])
);

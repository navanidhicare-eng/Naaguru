import { NextResponse } from 'next/server';
import { withAuth } from '@/shared/auth/middleware';
import { withRouteContext } from '@/shared/api/withRouteContext';
import { AssessmentModule } from '@/modules/assessment';
import { AppError } from '@/shared/errors';
export const GET = withRouteContext(
  withAuth(async (request, context, auth) => {
const attempt = await AssessmentModule.startOrResumeAttempt(auth.userId);
return NextResponse.json(attempt);
}, ['STUDENT'])
);

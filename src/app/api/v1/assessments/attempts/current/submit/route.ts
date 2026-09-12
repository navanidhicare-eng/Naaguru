import { NextResponse } from 'next/server';
import { withAuth } from '@/shared/auth/middleware';
import { withRouteContext } from '@/shared/api/withRouteContext';
import { AssessmentModule } from '@/modules/assessment';
import { AppError } from '@/shared/errors';
export const POST = withRouteContext(
  withAuth(async (request, context, auth) => {
const result = await AssessmentModule.submitAttempt(auth.userId);
return NextResponse.json(result, { status: 200 });
}, ['STUDENT'])
);

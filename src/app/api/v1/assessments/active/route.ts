import { NextResponse } from 'next/server';
import { withAuth } from '@/shared/auth/middleware';
import { withRouteContext } from '@/shared/api/withRouteContext';
import { AssessmentModule } from '@/modules/assessment';
import { AppError } from '@/shared/errors';
export const GET = withRouteContext(
  withAuth(async (request, context, auth) => {
const assessment = await AssessmentModule.getActiveAssessment();
return NextResponse.json(assessment);
}, ['STUDENT'])
);

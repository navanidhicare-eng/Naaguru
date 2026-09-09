import { NextResponse } from 'next/server';
import { withAuth } from '@/shared/auth/middleware';
import { StudentModule } from '@/modules/student/public';
import { createStudentProfileSchema, updateStudentProfileSchema } from '@/modules/student/application/validation';
import { withRouteContext } from '@/shared/api/withRouteContext';

export const GET = withRouteContext(
  withAuth(async (request, context, auth) => {
    const profile = await StudentModule.getStudentProfile(auth.userId);
    return NextResponse.json(profile);
  }, ['STUDENT'])
);

export const POST = withRouteContext(
  withAuth(async (request, context, auth) => {
    const body = await request.json().catch(() => ({}));
    const data = createStudentProfileSchema.parse(body);

    const profile = await StudentModule.createStudentProfile({
      userId: auth.userId,
      ...data,
    });
    
    return NextResponse.json(profile, { status: 201 });
  }, ['STUDENT'])
);

export const PATCH = withRouteContext(
  withAuth(async (request, context, auth) => {
    const body = await request.json().catch(() => ({}));
    const data = updateStudentProfileSchema.parse(body);

    const profile = await StudentModule.updateStudentProfile(auth.userId, data);
    
    return NextResponse.json(profile);
  }, ['STUDENT'])
);

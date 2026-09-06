import { NextResponse } from 'next/server';
import { withAuth } from '@/shared/auth/middleware';
import { StudentModule } from '@/modules/student/public';
import { createStudentProfileSchema, updateStudentProfileSchema } from '@/modules/student/application/validation';
import { z } from 'zod';
import { AppError } from '@/shared/errors';

export const GET = withAuth(async (request, context, auth) => {
  try {
    const profile = await StudentModule.getStudentProfile(auth.userId);
    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Get Profile Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['STUDENT']);

export const POST = withAuth(async (request, context, auth) => {
  try {
    const body = await request.json().catch(() => ({}));
    const data = createStudentProfileSchema.parse(body);

    const profile = await StudentModule.createStudentProfile({
      userId: auth.userId,
      ...data,
    });
    
    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Create Profile Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['STUDENT']);

export const PATCH = withAuth(async (request, context, auth) => {
  try {
    const body = await request.json().catch(() => ({}));
    const data = updateStudentProfileSchema.parse(body);

    const profile = await StudentModule.updateStudentProfile(auth.userId, data);
    
    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 422 });
    }
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Update Profile Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}, ['STUDENT']);

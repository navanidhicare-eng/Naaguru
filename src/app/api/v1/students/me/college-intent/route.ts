import { NextResponse } from 'next/server';
import { withAuth } from '@/shared/auth/middleware';
import { StudentModule } from '@/modules/student/public';
import { AppError } from '@/shared/errors';

export const GET = withAuth(async (request, context, auth) => {
  try {
    const intent = await StudentModule.getCurrentIntent(auth.userId);
    
    if (!intent) {
      return NextResponse.json({ error: 'No active intent found' }, { status: 404 });
    }

    return NextResponse.json(intent);
  } catch (error) {
    console.error('Get Intent Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const POST = withAuth(async (request, context, auth) => {
  try {
    const body = await request.json();
    
    // Check if an intent already exists to determine operation
    const existingIntent = await StudentModule.getCurrentIntent(auth.userId);

    let result;
    if (!existingIntent) {
      result = await StudentModule.submitInitialIntent(auth.userId, body);
    } else {
      result = await StudentModule.reviseIntent(auth.userId, body);
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Submit Intent Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

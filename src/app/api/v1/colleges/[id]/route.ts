import { NextResponse } from 'next/server';
import { CollegeModule } from '@/modules/college';
import { AppError } from '@/shared/errors';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const college = await CollegeModule.getPublicProfile(id);
    return NextResponse.json(college);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Get College Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

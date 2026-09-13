import { NextResponse } from 'next/server';
import { CatalogModule } from '@/shared/catalog';
import { AppError } from '@/shared/errors';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as any || undefined;
    const parentId = searchParams.get('parentId') || undefined;

    const locations = await CatalogModule.getStudentVisibleLocations(type, parentId);
    return NextResponse.json(locations);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Get Locations Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

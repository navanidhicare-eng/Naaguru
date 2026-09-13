import { NextResponse } from 'next/server';
import { CatalogModule } from '@/shared/catalog';
import { AppError } from '@/shared/errors';

export async function GET() {
  try {
    const areas = await CatalogModule.getStudentVisibleAreas();
    return NextResponse.json(areas);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Get Areas Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

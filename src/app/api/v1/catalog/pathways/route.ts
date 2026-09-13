import { NextResponse } from 'next/server';
import { CatalogModule } from '@/shared/catalog';
import { AppError } from '@/shared/errors';

export async function GET() {
  try {
    const pathways = await CatalogModule.getStudentVisiblePathways();
    return NextResponse.json(pathways);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Get Pathways Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

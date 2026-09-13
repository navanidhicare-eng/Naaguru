import { NextResponse } from 'next/server';
import { CatalogModule } from '@/shared/catalog';
import { AppError } from '@/shared/errors';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId') || undefined;

    const schools = await CatalogModule.getPartnerSchools(locationId);
    return NextResponse.json(schools);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Get Schools Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

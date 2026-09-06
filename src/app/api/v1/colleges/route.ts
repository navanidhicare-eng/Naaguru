import { NextResponse } from 'next/server';
import { CollegeModule } from '@/modules/college';
import { AppError } from '@/shared/errors';
import { isStreamCode } from '@/shared/domain/StreamCode';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const streamCodeParam = searchParams.get('streamCode');
    const state = searchParams.get('state') || undefined;
    const district = searchParams.get('district') || undefined;
    const city = searchParams.get('city') || undefined;
    const requiresBoysHostel = searchParams.get('requiresBoysHostel') === 'true';
    const requiresGirlsHostel = searchParams.get('requiresGirlsHostel') === 'true';
    
    const maxFeeParam = searchParams.get('maxFee');
    const maxFee = maxFeeParam ? parseInt(maxFeeParam, 10) : undefined;

    let streamCode = undefined;
    if (streamCodeParam) {
      if (isStreamCode(streamCodeParam)) {
        streamCode = streamCodeParam;
      } else {
        return NextResponse.json({ error: 'Invalid streamCode' }, { status: 400 });
      }
    }

    const colleges = await CollegeModule.searchActiveColleges({
      streamCode,
      state,
      district,
      city,
      requiresBoysHostel: requiresBoysHostel ? true : undefined,
      requiresGirlsHostel: requiresGirlsHostel ? true : undefined,
      maxFee: maxFee && !isNaN(maxFee) ? maxFee : undefined,
    });

    return NextResponse.json(colleges);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Search Colleges Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

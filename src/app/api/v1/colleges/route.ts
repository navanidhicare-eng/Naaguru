import { NextResponse } from 'next/server';
import { CollegeModule } from '@/modules/college';
import { StudentModule } from '@/modules/student/public';
import { getOptionalAuthContext } from '@/shared/auth/middleware';
import { AppError } from '@/shared/errors';
import { isStreamCode } from '@/shared/domain/StreamCode';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const streamCodeParam = searchParams.get('streamCode');
    const locationId = searchParams.get('locationId') || undefined;
    const requiresHostel = searchParams.get('requiresHostel') === 'true';
    let requiresBoysHostel = searchParams.get('requiresBoysHostel') === 'true';
    let requiresGirlsHostel = searchParams.get('requiresGirlsHostel') === 'true';
    
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

    let studentGender: 'MALE' | 'FEMALE' | undefined = undefined;

    // Profile-based hostel gender matching (Hostel Policy A)
    if (requiresHostel) {
      const auth = await getOptionalAuthContext(request);
      if (auth && auth.role === 'STUDENT') {
        const profile = await StudentModule.getStudentProfile(auth.userId);
        if (!profile?.gender || (profile.gender !== 'MALE' && profile.gender !== 'FEMALE')) {
          throw new AppError('Student gender is required to search for hostel availability', 400);
        }

        studentGender = profile.gender;
        if (profile.gender === 'FEMALE') {
          requiresGirlsHostel = true;
          requiresBoysHostel = false;
        } else if (profile.gender === 'MALE') {
          requiresBoysHostel = true;
          requiresGirlsHostel = false;
        }
      }
    }

    const colleges = await CollegeModule.searchActiveColleges({
      streamCode,
      locationId,
      requiresHostel: requiresHostel ? true : undefined,
      requiresBoysHostel: requiresBoysHostel ? true : undefined,
      requiresGirlsHostel: requiresGirlsHostel ? true : undefined,
      gender: studentGender,
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

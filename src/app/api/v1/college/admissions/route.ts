import { NextResponse } from 'next/server';
import { withStaffAuth } from '@/shared/auth/middleware';
import { withRouteContext } from '@/shared/api/withRouteContext';
import { EnquiryModule } from '@/modules/enquiry/public';
import { reportAdmissionSchema } from '@/modules/enquiry/application/validation';

export const GET = withRouteContext(
  withStaffAuth(async (request, context, staffAuth) => {
    const admissions = await EnquiryModule.listCollegeAdmissions(staffAuth.collegeId);
    return NextResponse.json(admissions);
  })
);

export const POST = withRouteContext(
  withStaffAuth(async (request, context, staffAuth) => {
    const body = await request.json().catch(() => ({}));
    const result = reportAdmissionSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 });
    }

    const admission = await EnquiryModule.reportAdmission(staffAuth.collegeId, result.data);
    return NextResponse.json(admission, { status: 201 });
  })
);

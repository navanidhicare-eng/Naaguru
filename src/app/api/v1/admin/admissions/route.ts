import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/shared/auth/middleware';
import { withRouteContext } from '@/shared/api/withRouteContext';
import { EnquiryModule } from '@/modules/enquiry/public';

export const GET = withRouteContext(
  withAdminAuth(async (request, context, adminAuth) => {
    // Admin receives all platform admissions
    const admissions = await EnquiryModule.listAllAdmissions();
    return NextResponse.json(admissions);
  })
);

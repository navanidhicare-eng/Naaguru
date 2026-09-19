import { NextResponse } from 'next/server';
import { withStaffAuth } from '@/shared/auth/middleware';
import { withRouteContext } from '@/shared/api/withRouteContext';
import { EnquiryModule } from '@/modules/enquiry/public';

export const GET = withRouteContext(
  withStaffAuth(async (request, context, staffAuth) => {
    // Return all leads belonging to the authorized College Admin's college.
    // The collegeId is securely obtained from staffAuth (which is DB-verified)
    const leads = await EnquiryModule.listCollegeLeads(staffAuth.collegeId);
    return NextResponse.json(leads);
  })
);

import { NextResponse } from 'next/server';
import { withStaffAuth } from '@/shared/auth/middleware';
import { withRouteContext } from '@/shared/api/withRouteContext';
import { EnquiryModule } from '@/modules/enquiry/public';
import { updateLeadStatusSchema } from '@/modules/enquiry/application/validation';

export const PATCH = withRouteContext(
  withStaffAuth(async (request, routeContext, staffAuth, nextContext) => {
    // Next.js params
    const params = await (nextContext as any)?.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const result = updateLeadStatusSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 });
    }

    await EnquiryModule.updateCollegeLeadStatus(staffAuth.collegeId, id, staffAuth.userId, result.data.status);
    return NextResponse.json({ success: true });
  })
);

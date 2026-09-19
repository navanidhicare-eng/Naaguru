import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/shared/auth/middleware';
import { withRouteContext } from '@/shared/api/withRouteContext';
import { EnquiryModule } from '@/modules/enquiry/public';
import { updateAdmissionVerificationSchema } from '@/modules/enquiry/application/validation';

export const PATCH = withRouteContext(
  withAdminAuth(async (request, routeContext, adminAuth, nextContext) => {
    // nextContext is the 4th argument, passed down from Next.js via withRouteContext and withAdminAuth
    const params = await (nextContext as any)?.params;
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "Admission ID is required" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const result = updateAdmissionVerificationSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 });
    }

    await EnquiryModule.verifyAdmission(id, result.data.verificationStatus);
    return NextResponse.json({ success: true });
  })
);

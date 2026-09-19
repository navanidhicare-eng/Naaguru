import { NextResponse } from 'next/server';
import { withAuth } from '@/shared/auth/middleware';
import { withRouteContext } from '@/shared/api/withRouteContext';
import { EnquiryModule } from '@/modules/enquiry/public';
import { createStudentLeadSchema } from '@/modules/enquiry/application/validation';

export const GET = withRouteContext(
  withAuth(async (request, context, auth) => {
    const leads = await EnquiryModule.listStudentLeads(auth.userId);
    return NextResponse.json(leads);
  }, ['STUDENT'])
);

export const POST = withRouteContext(
  withAuth(async (request, context, auth) => {
    const body = await request.json().catch(() => ({}));
    const result = createStudentLeadSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 });
    }

    const data = result.data;
    
    // We try to catch any domain/repository errors (e.g. branch doesn't exist, invalid intent)
    // withRouteContext handles AppError, but if it's a normal Error, we want 400 Bad Request if it's a domain validation issue.
    // However, our repositories currently throw standard Error strings like 'Branch ... does not exist'.
    // `withRouteContext` transforms these to 500s unless they are `AppError`.
    // Let's explicitly map domain errors to 400/409. 
    const lead = await EnquiryModule.createStudentLead(auth.userId, data);
    return NextResponse.json(lead, { status: 201 });
  }, ['STUDENT'])
);

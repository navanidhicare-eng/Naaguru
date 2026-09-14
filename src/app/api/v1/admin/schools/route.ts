import { NextResponse } from 'next/server';
import { AdminCatalogModule } from '@/shared/catalog';
import { withAdminAuth } from '@/shared/auth/middleware';
import { z } from 'zod';
import { AppError } from '@/shared/errors';

const getQuerySchema = z.object({
  locationId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'COMING_SOON']).optional(),
  search: z.string().optional(),
});

const postBodySchema = z.object({
  locationId: z.string().uuid({ message: "Invalid location ID" }),
  nameEn: z.string().min(1, "Name (English) cannot be empty").max(150),
  nameTe: z.string().min(1, "Name (Telugu) cannot be empty").max(150),
  partnershipStatus: z.enum(['PARTNER']).nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'COMING_SOON']).default('ACTIVE'),
});

export const GET = withAdminAuth(async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = {
      locationId: searchParams.get('locationId') || undefined,
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const query = getQuerySchema.parse(rawQuery);
    
    // Extract partnershipStatus manually since null is a string in searchParams
    const pStatusRaw = searchParams.get('partnershipStatus');
    const partnershipStatus = pStatusRaw === 'null' ? null : pStatusRaw === 'PARTNER' ? 'PARTNER' : undefined;

    const schools = await AdminCatalogModule.getSchools(
      query.locationId, 
      query.status, 
      partnershipStatus, 
      query.search
    );
    
    return NextResponse.json(schools);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Admin Get Schools Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const POST = withAdminAuth(async (request) => {
  try {
    const body = await request.json();
    const validated = postBodySchema.parse(body);

    const school = await AdminCatalogModule.createSchool({
      locationId: validated.locationId,
      nameEn: validated.nameEn,
      nameTe: validated.nameTe,
      partnershipStatus: validated.partnershipStatus || null,
      status: validated.status as any,
    });

    return NextResponse.json(school, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Admin Create School Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

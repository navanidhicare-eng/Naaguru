import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/shared/auth/middleware';
import { AdminCatalogModule } from '@/shared/catalog';
import { AppError } from '@/shared/errors';
import { z } from 'zod';

const locationTypeSchema = z.enum(['STATE', 'DISTRICT', 'MANDAL', 'LOCALITY']);

const createLocationSchema = z.object({
  type: locationTypeSchema,
  parentId: z.string().uuid("Parent ID must be a valid UUID").optional().nullable(),
  nameEn: z.string().min(1, "Name (English) is required").max(150),
  nameTe: z.string().min(1, "Name (Telugu) is required").max(150),
}).refine(data => {
  if (data.type === 'STATE' && data.parentId) return false;
  if (data.type !== 'STATE' && !data.parentId) return false;
  return true;
}, {
  message: "Invalid parentId requirement for the given location type.",
  path: ["parentId"],
});

export const GET = withAdminAuth(async (request, context) => {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as any || undefined;
    const parentId = searchParams.get('parentId') || undefined;

    const locations = await AdminCatalogModule.getLocations(type, parentId);
    return NextResponse.json(locations);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Admin Get Locations Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const POST = withAdminAuth(async (request, context) => {
  try {
    const body = await request.json();
    const result = createLocationSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 });
    }

    const data = result.data;
    
    // Normalize parentId from null to undefined if needed for usecase signature
    const location = await AdminCatalogModule.createLocation({
      ...data,
      parentId: data.parentId || undefined
    });
    
    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Admin Create Location Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/shared/auth/middleware';
import { AdminCatalogModule } from '@/shared/catalog';
import { AppError } from '@/shared/errors';
import { z } from 'zod';

const updateLocationSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  nameEn: z.string().min(1, "Name (English) cannot be empty").max(150).optional(),
  nameTe: z.string().min(1, "Name (Telugu) cannot be empty").max(150).optional(),
});

export const PATCH = withAdminAuth(async (request: any, context: any) => {
  try {
    const { id } = context.params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Location ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const result = updateLocationSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: "Validation failed", details: result.error.format() }, { status: 400 });
    }

    const updates = result.data;
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid updates provided" }, { status: 400 });
    }

    const location = await AdminCatalogModule.updateLocation(id, updates);
    return NextResponse.json(location, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Admin Update Location Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

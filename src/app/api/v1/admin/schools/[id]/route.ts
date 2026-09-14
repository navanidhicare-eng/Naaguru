import { NextResponse } from 'next/server';
import { AdminCatalogModule } from '@/shared/catalog';
import { withAdminAuth } from '@/shared/auth/middleware';
import { z } from 'zod';
import { AppError } from '@/shared/errors';

const patchBodySchema = z.object({
  nameEn: z.string().min(1, "Name (English) cannot be empty").max(150).optional(),
  nameTe: z.string().min(1, "Name (Telugu) cannot be empty").max(150).optional(),
  partnershipStatus: z.enum(['PARTNER']).nullable().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'COMING_SOON']).optional(),
});

export const PATCH = withAdminAuth(async (request: any, context: any) => {
  try {
    const { id } = context.params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const validated = patchBodySchema.parse(body);

    const school = await AdminCatalogModule.updateSchool(id, validated as any);

    return NextResponse.json(school);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Admin Update School Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

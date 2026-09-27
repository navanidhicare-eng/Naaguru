import { NextRequest, NextResponse } from 'next/server';
import { CollegeUseCases } from '@/modules/college/application/useCases/CollegeUseCases';
import { DrizzleCollegeRepository } from '@/modules/college/infrastructure/DrizzleCollegeRepository';
import { SupabaseStorageService } from '@/shared/storage/SupabaseStorageService';
import { AppError } from '@/shared/errors';
import { withAdminAuth } from '@/shared/auth/middleware';
import { z } from 'zod';

const testimonialInputSchema = z.object({
  id: z.string().uuid().optional(),
  personName: z.string().trim().min(1, 'Person name is required'),
  personType: z.enum(['STUDENT', 'PARENT', 'ALUMNI', 'OTHER']),
  testimonialText: z.string().trim().min(1, 'Testimonial text is required'),
  imageStorageKey: z.string().trim().nullable().optional(),
  displayOrder: z.number().int().nonnegative('Display order must be a non-negative integer'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

const syncTestimonialsSchema = z.object({
  testimonials: z.array(testimonialInputSchema),
});

export const PUT = withAdminAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = await context.params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'College ID is required' }, { status: 400 });
    }

    const body: unknown = await request.json();
    const parsedBody = syncTestimonialsSchema.parse(body);

    const repository = new DrizzleCollegeRepository();
    const storageService = new SupabaseStorageService();
    const useCases = new CollegeUseCases(repository, storageService);

    const updatedCollege = await useCases.syncTestimonials(id, parsedBody);

    return NextResponse.json(updatedCollege, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const message = error.issues?.[0]?.message || (error as any).errors?.[0]?.message || 'Validation error';
      return NextResponse.json({ error: message }, { status: 400 });
    }
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Admin Sync Testimonials Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

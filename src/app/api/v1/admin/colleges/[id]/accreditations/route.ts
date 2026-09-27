import { NextRequest, NextResponse } from 'next/server';
import { CollegeUseCases } from '@/modules/college/application/useCases/CollegeUseCases';
import { DrizzleCollegeRepository } from '@/modules/college/infrastructure/DrizzleCollegeRepository';
import { SupabaseStorageService } from '@/shared/storage/SupabaseStorageService';
import { AppError } from '@/shared/errors';
import { withAdminAuth } from '@/shared/auth/middleware';
import { z } from 'zod';

const currentYear = new Date().getFullYear();

const accreditationInputSchema = z.object({
  id: z.string().uuid('Invalid accreditation ID format').optional(),
  name: z.string().trim().min(1, 'Accreditation name is required').max(255, 'Accreditation name cannot exceed 255 characters'),
  issuingBody: z.string().trim().min(1, 'Issuing body is required').max(255, 'Issuing body cannot exceed 255 characters'),
  year: z.number().int('Year must be an integer').min(2000, 'Year cannot be earlier than 2000').max(currentYear + 5, `Year cannot exceed ${currentYear + 5}`).nullable().optional(),
  validUntilYear: z.number().int('Valid until year must be an integer').min(2000, 'Valid until year cannot be earlier than 2000').max(currentYear + 5, `Valid until year cannot exceed ${currentYear + 5}`).nullable().optional(),
  description: z.string().trim().max(1000, 'Description cannot exceed 1000 characters').nullable().optional(),
  certificateStorageKey: z.string().trim().max(1024, 'Certificate storage key cannot exceed 1024 characters').nullable().optional(),
  verificationUrl: z.string().trim().url('Invalid verification URL format').max(2048, 'Verification URL cannot exceed 2048 characters').nullable().optional(),
  displayOrder: z.number().int('Display order must be an integer').nonnegative('Display order must be a non-negative integer'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
}).refine((data) => {
  if (data.year != null && data.validUntilYear != null) {
    return data.validUntilYear >= data.year;
  }
  return true;
}, {
  message: 'validUntilYear cannot be earlier than year',
  path: ['validUntilYear'],
});

const syncAccreditationsSchema = z.object({
  accreditations: z.array(accreditationInputSchema).max(15, 'A college can have a maximum of 15 accreditations'),
}).refine((data) => {
  const ids = data.accreditations.filter(a => a.id).map(a => a.id);
  return new Set(ids).size === ids.length;
}, {
  message: 'Duplicate accreditation IDs in submission',
  path: ['accreditations'],
});

const idParamSchema = z.string().uuid('Invalid college ID format');

export const PUT = withAdminAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = await context.params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'College ID is required' }, { status: 400 });
    }

    const idParsed = idParamSchema.safeParse(id);
    if (!idParsed.success) {
      return NextResponse.json({ error: idParsed.error.issues[0].message }, { status: 400 });
    }

    const body: unknown = await request.json();
    const parsedBody = syncAccreditationsSchema.parse(body);

    const repository = new DrizzleCollegeRepository();
    const storageService = new SupabaseStorageService();
    const useCases = new CollegeUseCases(repository, storageService);

    const updatedCollege = await useCases.syncAccreditations(id, parsedBody);

    return NextResponse.json(updatedCollege, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const message = error.issues?.[0]?.message || (error as any).errors?.[0]?.message || 'Validation error';
      return NextResponse.json({ error: message }, { status: 400 });
    }
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Admin Sync Accreditations Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

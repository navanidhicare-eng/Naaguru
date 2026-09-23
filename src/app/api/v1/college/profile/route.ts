import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withStaffAuth, StaffAuthContext } from '@/shared/auth/middleware';
import { CollegeUseCases } from '@/modules/college/application/useCases/CollegeUseCases';
import { DrizzleCollegeRepository } from '@/modules/college/infrastructure/DrizzleCollegeRepository';
import { SupabaseStorageService } from '@/shared/storage/SupabaseStorageService';
import { withRouteContext } from '@/shared/api/withRouteContext';
import { AppError } from '@/shared/errors';

export const GET = withRouteContext(
  withStaffAuth(async (request: Request, context: unknown, staffContext: StaffAuthContext) => {
    // Zero-Trust Tenancy: We NEVER read collegeId from query params, body, or URL.
    // It is strictly sourced from the validated staffAuthContext.
    const collegeId = staffContext.collegeId;

    if (!collegeId) {
      // This should never happen if withStaffAuth is correct, but defensively check.
      throw new AppError('College ID missing in staff context', 403, 'FORBIDDEN');
    }

    const collegeUseCases = new CollegeUseCases(
      new DrizzleCollegeRepository(),
      new SupabaseStorageService()
    );
    
    // This bypasses the public discoverability constraint
    const profile = await collegeUseCases.getStaffCollegeProfile(collegeId);

    return NextResponse.json(profile);
  })
);

const updateProfileSchema = z.object({
  shortName: z.string().nullable().optional(),
  description: z.string().trim().min(1, 'Description cannot be empty').max(3000, 'Description is too long').nullable().optional(),
  website: z.string().nullable().optional(),
  contactPhone: z.string().nullable().optional(),
  contactEmail: z.string().nullable().optional(),
  location: z.object({
    state: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    lat: z.number().nullable().optional(),
    lng: z.number().nullable().optional(),
  }).optional(),
  hostelSummary: z.object({
    hasBoysHostel: z.boolean().optional(),
    hasGirlsHostel: z.boolean().optional(),
    annualHostelFee: z.number().nullable().optional(),
  }).optional(),
  leadership: z.array(z.object({
    id: z.string().uuid(),
    name: z.string().trim().min(1, 'Name is required').max(255),
    designation: z.string().trim().min(1, 'Designation is required').max(150),
    bio: z.string().nullable().default(null),
    imageUrl: z.string().url('Invalid image URL').nullable().default(null),
    displayOrder: z.number().int().min(0).default(0),
  })).optional(),
});

export const PUT = withRouteContext(
  withStaffAuth(async (request: Request, context: unknown, staffContext: StaffAuthContext) => {
    const collegeId = staffContext.collegeId;

    if (!collegeId) {
      throw new AppError('College ID missing in staff context', 403, 'FORBIDDEN');
    }

    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    const collegeUseCases = new CollegeUseCases(
      new DrizzleCollegeRepository(),
      new SupabaseStorageService()
    );
    const updatedProfile = await collegeUseCases.updateStaffCollegeProfile(collegeId, data);

    return NextResponse.json(updatedProfile);
  })
);

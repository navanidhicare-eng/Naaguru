import { NextResponse } from 'next/server';
import { z } from 'zod';
import { withStaffAuth, StaffAuthContext } from '@/shared/auth/middleware';
import { CollegeUseCases } from '@/modules/college/application/useCases/CollegeUseCases';
import { DrizzleCollegeRepository } from '@/modules/college/infrastructure/DrizzleCollegeRepository';
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

    const collegeUseCases = new CollegeUseCases(new DrizzleCollegeRepository());
    
    // This bypasses the public discoverability constraint
    const profile = await collegeUseCases.getStaffCollegeProfile(collegeId);

    return NextResponse.json(profile);
  })
);

const updateProfileSchema = z.object({
  shortName: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
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
});

export const PUT = withRouteContext(
  withStaffAuth(async (request: Request, context: unknown, staffContext: StaffAuthContext) => {
    const collegeId = staffContext.collegeId;

    if (!collegeId) {
      throw new AppError('College ID missing in staff context', 403, 'FORBIDDEN');
    }

    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    const collegeUseCases = new CollegeUseCases(new DrizzleCollegeRepository());
    const updatedProfile = await collegeUseCases.updateStaffCollegeProfile(collegeId, data);

    return NextResponse.json(updatedProfile);
  })
);

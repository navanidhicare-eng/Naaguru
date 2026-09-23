import { NextRequest, NextResponse } from 'next/server';
import { CollegeUseCases } from '@/modules/college/application/useCases/CollegeUseCases';
import { DrizzleCollegeRepository } from '@/modules/college/infrastructure/DrizzleCollegeRepository';
import { SupabaseStorageService } from '@/shared/storage/SupabaseStorageService';
import { AppError } from '@/shared/errors';
import { withStaffAuth } from '@/shared/auth/middleware';

export const PUT = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  return withStaffAuth(async (req, ctx, staffAuth) => {
    try {
      const { id } = await context.params;

      // Verify admin authorization
      if (staffAuth.role !== 'COLLEGE_ADMIN' || staffAuth.collegeId !== id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      const data = await req.json();

      if (!data.media || !Array.isArray(data.media)) {
        return NextResponse.json({ error: 'media array is required' }, { status: 400 });
      }

      const repository = new DrizzleCollegeRepository();
      const storageService = new SupabaseStorageService();
      const useCases = new CollegeUseCases(repository, storageService);

      const updatedCollege = await useCases.syncMedia(id, data);

      return NextResponse.json(updatedCollege, { status: 200 });
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json({ error: error.message }, { status: error.statusCode });
      }
      console.error('Error in sync media:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  })(request, context);
};

import { NextRequest, NextResponse } from 'next/server';
import { CollegeUseCases } from '@/modules/college/application/useCases/CollegeUseCases';
import { DrizzleCollegeRepository } from '@/modules/college/infrastructure/DrizzleCollegeRepository';
import { SupabaseStorageService } from '@/shared/storage/SupabaseStorageService';
import { AppError } from '@/shared/errors';
import { withStaffAuth } from '@/shared/auth/middleware';

export const POST = async (
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

      const { contentType, size } = await req.json();

      if (!contentType || !size) {
        return NextResponse.json({ error: 'contentType and size are required' }, { status: 400 });
      }

      const repository = new DrizzleCollegeRepository();
      const storageService = new SupabaseStorageService();
      const useCases = new CollegeUseCases(repository, storageService);

      const { uploadUrl, method, storageKey } = await useCases.generateMediaUploadUrl(id, contentType, size);

      return NextResponse.json({ uploadUrl, method, storageKey }, { status: 200 });
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json({ error: error.message }, { status: error.statusCode });
      }
      console.error('Error in upload-auth:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  })(request, context);
};

import { NextRequest, NextResponse } from 'next/server';
import { CollegeUseCases } from '@/modules/college/application/useCases/CollegeUseCases';
import { DrizzleCollegeRepository } from '@/modules/college/infrastructure/DrizzleCollegeRepository';
import { SupabaseStorageService } from '@/shared/storage/SupabaseStorageService';
import { AppError } from '@/shared/errors';
import { withAdminAuth } from '@/shared/auth/middleware';
import { z } from 'zod';

export const PUT = withAdminAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = await context.params;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'College ID is required' }, { status: 400 });
    }

    const body: unknown = await request.json();

    const repository = new DrizzleCollegeRepository();
    const storageService = new SupabaseStorageService();
    const useCases = new CollegeUseCases(repository, storageService);

    const updatedCollege = await useCases.syncAchievements(id, body as any);

    return NextResponse.json(updatedCollege, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('Admin Sync Achievements Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

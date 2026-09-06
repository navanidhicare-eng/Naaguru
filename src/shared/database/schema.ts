/**
 * Central schema export file.
 * 
 * In the future, this file will export the schemas defined inside the individual
 * modules (e.g., src/modules/student/infrastructure/schema.ts).
 * 
 * Currently, no business schemas are defined.
 */

// Re-export all schemas here so Drizzle handles relationships correctly.

export * from '../auth/schema';
export * from '../../modules/student/infrastructure/schema';
export * from '@/modules/assessment/infrastructure/schema';
export * from '@/modules/career/infrastructure/schema';
export * from '@/modules/college/infrastructure/schema';

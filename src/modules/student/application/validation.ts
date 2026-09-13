import { z } from 'zod';

export const createStudentProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(255),
  gender: z.enum(['MALE', 'FEMALE']),
  educationStage: z.enum(['10TH_PURSUING', '10TH_PASSED', '11TH_PURSUING', '11TH_PASSED', '12TH_PURSUING', '12TH_PASSED']),
  board: z.string().max(100).optional().nullable(),
  residenceLocationId: z.string().uuid().optional().nullable(),
  schoolId: z.string().uuid().optional().nullable(),
  pincode: z.string().max(10).optional().nullable(),
  landmark: z.string().max(255).optional().nullable(),
  guardianName: z.string().max(255).optional().nullable(),
  guardianPhone: z.string().max(20).optional().nullable(),
});

export const updateStudentProfileSchema = createStudentProfileSchema.partial();

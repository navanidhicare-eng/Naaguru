import { z } from 'zod';

const createStudentProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(255),
  educationStage: z.enum(['10TH_PURSUING', '10TH_PASSED', '11TH_PURSUING', '11TH_PASSED', '12TH_PURSUING', '12TH_PASSED']),
  board: z.string().max(100).optional().nullable(),
  residenceLocationId: z.string().uuid().optional().nullable(),
  schoolId: z.string().uuid().optional().nullable(),
  pincode: z.string().max(10).optional().nullable(),
  landmark: z.string().max(255).optional().nullable(),
  guardianName: z.string().max(255).optional().nullable(),
  guardianPhone: z.string().max(20).optional().nullable(),
});

const payload = {
  fullName: 'OPrasad',
  educationStage: 'INTERMEDIATE_1',
  residenceLocationId: 'b14c9294-7ebc-4dcc-bb2f-bddaf6e4babb',
  schoolId: '6a5a9664-9abf-418e-b8d4-0940a341df61',
  pincode: '530012',
  landmark: 'sedgdrg'
};

try {
  createStudentProfileSchema.parse(payload);
  console.log('Validation passed');
} catch (e: any) {
  console.error(JSON.stringify(e.issues, null, 2));
}

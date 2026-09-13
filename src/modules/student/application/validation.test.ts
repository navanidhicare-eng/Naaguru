import { describe, it, expect } from 'vitest';
import { createStudentProfileSchema, updateStudentProfileSchema } from './validation';

describe('Student Profile Validation Boundary', () => {
  describe('createStudentProfileSchema', () => {
    it('accepts valid MALE gender', () => {
      const payload = {
        fullName: 'John Doe',
        gender: 'MALE',
        educationStage: '10TH_PASSED',
        residenceLocationId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        schoolId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
        pincode: '530012'
      };
      const result = createStudentProfileSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('accepts valid FEMALE gender', () => {
      const payload = {
        fullName: 'Jane Doe',
        gender: 'FEMALE',
        educationStage: '10TH_PASSED'
      };
      const result = createStudentProfileSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('rejects missing gender (422 equivalent)', () => {
      const payload = {
        fullName: 'Jane Doe',
        educationStage: '10TH_PASSED'
      };
      const result = createStudentProfileSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('gender'))).toBe(true);
      }
    });

    it('rejects invalid OTHER gender (422 equivalent)', () => {
      const payload = {
        fullName: 'Jane Doe',
        gender: 'OTHER',
        educationStage: '10TH_PASSED'
      };
      const result = createStudentProfileSchema.safeParse(payload);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('gender'))).toBe(true);
      }
    });
  });

  describe('updateStudentProfileSchema', () => {
    it('accepts updating just gender', () => {
      const payload = { gender: 'FEMALE' };
      const result = updateStudentProfileSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });

    it('rejects updating with invalid gender', () => {
      const payload = { gender: 'INVALID' };
      const result = updateStudentProfileSchema.safeParse(payload);
      expect(result.success).toBe(false);
    });
    
    it('accepts updating without providing gender (partial)', () => {
      const payload = { fullName: 'Updated Name' };
      const result = updateStudentProfileSchema.safeParse(payload);
      expect(result.success).toBe(true);
    });
  });
});

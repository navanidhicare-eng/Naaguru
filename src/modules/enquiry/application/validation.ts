import { z } from 'zod';
import { LeadStatusList, AdmissionVerificationStatusList } from '../domain/types';

export const createStudentLeadSchema = z.object({
  collegeId: z.string().uuid("College ID must be a valid UUID"),
  branchId: z.string().uuid("Branch ID must be a valid UUID"),
  streamCode: z.string().min(1, "Stream code is required").nullable().optional(),
  intentId: z.string().uuid("Intent ID must be a valid UUID").nullable().optional(),
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(LeadStatusList as [string, ...string[]]),
});

export const reportAdmissionSchema = z.object({
  leadId: z.string().uuid("Lead ID must be a valid UUID").nullable().optional(),
  studentId: z.string().uuid("Student ID must be a valid UUID"),
  branchId: z.string().uuid("Branch ID must be a valid UUID"),
  streamCode: z.string().min(1, "Stream code is required"),
  academicYear: z.string().min(1, "Academic year is required"),
});

export const updateAdmissionVerificationSchema = z.object({
  verificationStatus: z.enum(AdmissionVerificationStatusList as [string, ...string[]]),
});

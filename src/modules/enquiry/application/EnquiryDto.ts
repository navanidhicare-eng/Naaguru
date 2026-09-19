import { LeadStatus, AdmissionVerificationStatus } from '../domain/types';

export interface StudentLeadDto {
  id: string;
  collegeId: string;
  branchId: string;
  streamCode: string | null;
  status: LeadStatus;
  createdAt: string;
  collegeName?: string;
  branchName?: string;
}

export interface CollegeLeadDto {
  id: string;
  studentId: string;
  studentName?: string;
  studentPhone?: string;
  studentGender?: string | null;
  educationStage?: string;
  schoolId?: string | null;
  residenceLocationId?: string | null;
  branchId: string;
  streamCode: string | null;
  status: LeadStatus;
  lastCollegeContactedAt: string | null;
  createdAt: string;
}

export interface CollegeAdmissionDto {
  id: string;
  leadId: string | null;
  studentId: string;
  studentName?: string;
  studentPhone?: string;
  branchId: string;
  streamCode: string;
  academicYear: string;
  verificationStatus: AdmissionVerificationStatus;
  createdAt: string;
}

export interface AdminAdmissionDto extends CollegeAdmissionDto {
  collegeId: string;
}

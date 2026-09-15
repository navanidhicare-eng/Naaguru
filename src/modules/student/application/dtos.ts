import { StudentGender } from '../domain/Student';

export interface CreateStudentProfileDto {
  userId: string;
  fullName: string;
  gender: StudentGender;
  educationStage: string;
  board?: string | null;
  residenceLocationId?: string | null;
  schoolId?: string | null;
  pincode?: string | null;
  landmark?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
}

export interface UpdateStudentProfileDto {
  fullName?: string;
  gender?: StudentGender;
  educationStage?: string;
  board?: string | null;
  residenceLocationId?: string | null;
  schoolId?: string | null;
  pincode?: string | null;
  landmark?: string | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
}

export interface StudentProfileDto {
  userId: string;
  fullName: string;
  gender?: StudentGender | null;
  educationStage: string;
  board?: string | null;
  residenceLocationId?: string | null;
  schoolId?: string | null;
  pincode?: string | null;
  landmark?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IntentRequestDto {
  pathwayCode: string;
  programCode: string | null;
  preferredLocationId: string | null;
  requiresHostel: boolean;
  maxAnnualFee: number | null;
}

export interface IntentResponseDto {
  id: string;
  versionNumber: number;
  pathwayCode: string;
  programCode: string | null;
  preferredLocationId: string | null;
  requiresHostel: boolean;
  maxAnnualFee: number | null;
  status: 'ACTIVE' | 'SUPERSEDED';
  remainingChanges: number;
}

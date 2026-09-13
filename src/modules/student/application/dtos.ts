export interface CreateStudentProfileDto {
  userId: string;
  fullName: string;
  educationStage: string;
  board?: string | null;
  state?: string | null;
  district?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
}

export interface UpdateStudentProfileDto {
  fullName?: string;
  educationStage?: string;
  board?: string | null;
  state?: string | null;
  district?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
}

export interface StudentProfileDto {
  userId: string;
  fullName: string;
  educationStage: string;
  board?: string | null;
  state?: string | null;
  district?: string | null;
  city?: string | null;
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
  areaId: string | null;
  requiresHostel: boolean;
  hostelGender: 'BOYS' | 'GIRLS' | null;
  maxAnnualFee: number | null;
}

export interface IntentResponseDto {
  id: string;
  versionNumber: number;
  pathwayCode: string;
  programCode: string | null;
  areaId: string | null;
  requiresHostel: boolean;
  hostelGender: 'BOYS' | 'GIRLS' | null;
  maxAnnualFee: number | null;
  status: 'ACTIVE' | 'SUPERSEDED';
  remainingChanges: number;
}

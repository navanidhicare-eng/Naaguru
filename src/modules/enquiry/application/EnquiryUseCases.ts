import { randomUUID as uuidv4 } from 'crypto';
import { db } from '@/shared/database/db';
import { inArray, eq } from 'drizzle-orm';
import { usersTable } from '@/shared/auth/schema';
import { studentsTable } from '@/modules/student/infrastructure/schema';
import { branchesTable, collegesTable } from '@/modules/college/infrastructure/schema';
import { ILeadRepository } from '../domain/ILeadRepository';
import { IAdmissionRepository } from '../domain/IAdmissionRepository';
import { Lead } from '../domain/Lead';
import { Admission } from '../domain/Admission';
import { LeadStatus, AdmissionVerificationStatus } from '../domain/types';
import { StudentLeadDto, CollegeLeadDto, CollegeAdmissionDto, AdminAdmissionDto } from './EnquiryDto';
import { AppError } from '@/shared/errors';

export class EnquiryUseCases {
  constructor(
    private readonly leadRepo: ILeadRepository,
    private readonly admissionRepo: IAdmissionRepository
  ) {}

  // ==========================================
  // STUDENT FLOW
  // ==========================================
  async createStudentLead(
    studentId: string,
    data: { collegeId: string; branchId: string; streamCode?: string | null; intentId?: string | null }
  ): Promise<StudentLeadDto> {
    const existing = await this.leadRepo.findActiveByStudentAndBranch(studentId, data.branchId);
    if (existing) {
      throw new AppError('You already have an active lead for this branch', 409, 'CONFLICT');
    }

    const lead = Lead.create({
      id: uuidv4(),
      studentId,
      collegeId: data.collegeId,
      branchId: data.branchId,
      streamCode: data.streamCode || null,
      intentId: data.intentId || null,
      source: 'NAAGURU_APP'
    });

    try {
      await this.leadRepo.create(lead);
    } catch (e: any) {
      throw new AppError(e.message, 400, 'BAD_REQUEST');
    }

    return {
      id: lead.id,
      collegeId: lead.collegeId,
      branchId: lead.branchId,
      streamCode: lead.streamCode,
      status: lead.status,
      createdAt: lead.createdAt
    };
  }

  private async getCollegeAndBranchDetails(collegeIds: string[], branchIds: string[]) {
    const cIds = Array.from(new Set(collegeIds));
    const bIds = Array.from(new Set(branchIds));

    const result = {
      colleges: new Map<string, string>(),
      branches: new Map<string, string>()
    };

    if (cIds.length > 0) {
      const colleges = await db.select({ id: collegesTable.id, name: collegesTable.name })
        .from(collegesTable)
        .where(inArray(collegesTable.id, cIds));
      colleges.forEach(c => result.colleges.set(c.id, c.name));
    }

    if (bIds.length > 0) {
      const branches = await db.select({ id: branchesTable.id, name: branchesTable.name })
        .from(branchesTable)
        .where(inArray(branchesTable.id, bIds));
      branches.forEach(b => result.branches.set(b.id, b.name));
    }

    return result;
  }

  async listStudentLeads(studentId: string): Promise<StudentLeadDto[]> {
    const leads = await this.leadRepo.listByStudent(studentId);
    
    if (leads.length === 0) return [];
    
    const details = await this.getCollegeAndBranchDetails(
      leads.map(l => l.collegeId),
      leads.map(l => l.branchId)
    );

    return leads.map(l => ({
      id: l.id,
      collegeId: l.collegeId,
      branchId: l.branchId,
      streamCode: l.streamCode,
      status: l.status,
      createdAt: l.createdAt,
      collegeName: details.colleges.get(l.collegeId),
      branchName: details.branches.get(l.branchId)
    }));
  }

  // ==========================================
  // COLLEGE ADMIN FLOW
  // ==========================================
  private async getStudentDetails(studentIds: string[]) {
    if (studentIds.length === 0) return new Map();
    const uniqueIds = Array.from(new Set(studentIds));

    // Fetch from usersTable
    const users = await db.select({ id: usersTable.id, phone: usersTable.phoneNumber })
      .from(usersTable)
      .where(inArray(usersTable.id, uniqueIds));

    // Fetch from studentsTable
    const students = await db.select({
      userId: studentsTable.userId,
      name: studentsTable.fullName,
      gender: studentsTable.gender,
      educationStage: studentsTable.educationStage,
      schoolId: studentsTable.schoolId,
      residenceLocationId: studentsTable.residenceLocationId
    })
      .from(studentsTable)
      .where(inArray(studentsTable.userId, uniqueIds));

    const userMap = new Map(users.map(u => [u.id, u]));
    const studentMap = new Map(students.map(s => [s.userId, s]));

    const result = new Map();
    for (const id of uniqueIds) {
      result.set(id, {
        ...userMap.get(id),
        ...studentMap.get(id)
      });
    }
    return result;
  }

  async listCollegeLeads(collegeId: string): Promise<CollegeLeadDto[]> {
    const leads = await this.leadRepo.listByCollege(collegeId);
    const studentDetails = await this.getStudentDetails(leads.map(l => l.studentId));

    return leads.map(l => {
      const details = studentDetails.get(l.studentId) || {};
      return {
        id: l.id,
        studentId: l.studentId,
        studentName: details.name,
        studentPhone: details.phone,
        studentGender: details.gender,
        educationStage: details.educationStage,
        schoolId: details.schoolId,
        residenceLocationId: details.residenceLocationId,
        branchId: l.branchId,
        streamCode: l.streamCode,
        status: l.status,
        lastCollegeContactedAt: l.lastCollegeContactedAt,
        createdAt: l.createdAt
      };
    });
  }

  async updateCollegeLeadStatus(collegeId: string, leadId: string, staffUserId: string, status: LeadStatus): Promise<void> {
    const lead = await this.leadRepo.findById(leadId);
    if (!lead || lead.collegeId !== collegeId) {
      throw new AppError('Lead not found or does not belong to your college', 404, 'NOT_FOUND');
    }

    try {
      await this.leadRepo.updateStatus(leadId, status, staffUserId);
    } catch (e: any) {
      throw new AppError(e.message, 400, 'BAD_REQUEST');
    }
  }

  async reportAdmission(
    collegeId: string,
    data: { leadId?: string | null; studentId: string; branchId: string; streamCode: string; academicYear: string }
  ): Promise<CollegeAdmissionDto> {
    const collegeBranches = await db.select().from(branchesTable).where(eq(branchesTable.collegeId, collegeId));
    const branchIds = collegeBranches.map(b => b.id);
    if (!branchIds.includes(data.branchId)) {
      throw new AppError('Branch does not belong to your college', 400, 'BAD_REQUEST');
    }

    const admission = Admission.create({
      id: uuidv4(),
      leadId: data.leadId || null,
      studentId: data.studentId,
      collegeId: collegeId,
      branchId: data.branchId,
      streamCode: data.streamCode,
      academicYear: data.academicYear
    });

    await this.admissionRepo.create(admission);

    return {
      id: admission.id,
      leadId: admission.leadId,
      studentId: admission.studentId,
      branchId: admission.branchId,
      streamCode: admission.streamCode,
      academicYear: admission.academicYear,
      verificationStatus: admission.verificationStatus,
      createdAt: admission.createdAt
    };
  }

  async listCollegeAdmissions(collegeId: string): Promise<CollegeAdmissionDto[]> {
    const admissions = await this.admissionRepo.listByCollege(collegeId);
    const studentDetails = await this.getStudentDetails(admissions.map(a => a.studentId));

    return admissions.map(a => {
      const details = studentDetails.get(a.studentId) || {};
      return {
        id: a.id,
        leadId: a.leadId,
        studentId: a.studentId,
        studentName: details.name,
        studentPhone: details.phone,
        branchId: a.branchId,
        streamCode: a.streamCode,
        academicYear: a.academicYear,
        verificationStatus: a.verificationStatus,
        createdAt: a.createdAt
      };
    });
  }

  // ==========================================
  // COMPANY ADMIN FLOW
  // ==========================================
  async listAllAdmissions(): Promise<AdminAdmissionDto[]> {
    const admissions = await this.admissionRepo.listAll();
    const studentDetails = await this.getStudentDetails(admissions.map(a => a.studentId));

    return admissions.map(a => {
      const details = studentDetails.get(a.studentId) || {};
      return {
        id: a.id,
        collegeId: a.collegeId,
        leadId: a.leadId,
        studentId: a.studentId,
        studentName: details.name,
        studentPhone: details.phone,
        branchId: a.branchId,
        streamCode: a.streamCode,
        academicYear: a.academicYear,
        verificationStatus: a.verificationStatus,
        createdAt: a.createdAt
      };
    });
  }

  async verifyAdmission(admissionId: string, verificationStatus: AdmissionVerificationStatus): Promise<void> {
    const admission = await this.admissionRepo.findById(admissionId);
    if (!admission) throw new AppError('Admission not found', 404, 'NOT_FOUND');
    
    try {
      admission.updateVerificationStatus(verificationStatus);
    } catch (e: any) {
      throw new AppError(e.message, 400, 'BAD_REQUEST');
    }
    
    await this.admissionRepo.updateVerificationStatus(admissionId, verificationStatus);
  }
}

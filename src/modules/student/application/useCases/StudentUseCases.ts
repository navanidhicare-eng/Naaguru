import 'server-only';
import { IStudentRepository } from '../../domain/IStudentRepository';
import { Student } from '../../domain/Student';
import { CreateStudentProfileDto, StudentProfileDto, UpdateStudentProfileDto } from '../dtos';
import { AppError } from '../../../../shared/errors';
import { CatalogModule } from '../../../../shared/catalog';

export class StudentUseCases {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async createMyProfile(dto: CreateStudentProfileDto): Promise<StudentProfileDto> {
    const existing = await this.studentRepository.findByUserId(dto.userId);
    if (existing) {
      throw new AppError('Profile already exists', 409);
    }

    await this.validateProfileFields(dto);

    const student = Student.create({
      userId: dto.userId,
      fullName: dto.fullName,
      gender: dto.gender,
      educationStage: dto.educationStage,
      board: dto.board,
      residenceLocationId: dto.residenceLocationId,
      schoolId: dto.schoolId,
      pincode: dto.pincode,
      landmark: dto.landmark,
      guardianName: dto.guardianName,
      guardianPhone: dto.guardianPhone,
    });

    await this.studentRepository.create(student);
    return student.toJSON();
  }

  async getMyProfile(userId: string): Promise<StudentProfileDto> {
    const student = await this.studentRepository.findByUserId(userId);
    if (!student) {
      throw new AppError('Profile not found', 404);
    }
    return student.toJSON();
  }

  async updateMyProfile(userId: string, dto: UpdateStudentProfileDto): Promise<StudentProfileDto> {
    const student = await this.studentRepository.findByUserId(userId);
    if (!student) {
      throw new AppError('Profile not found', 404);
    }

    await this.validateProfileFields(dto);

    student.update(dto);
    await this.studentRepository.update(student);

    return student.toJSON();
  }

  async getProfileForAdmin(userId: string): Promise<StudentProfileDto> {
    // We rely on the route's RBAC middleware to guarantee the caller is an Admin.
    const student = await this.studentRepository.findByUserId(userId);
    if (!student) {
      throw new AppError('Profile not found', 404);
    }
    return student.toJSON();
  }

  private async validateProfileFields(dto: Partial<CreateStudentProfileDto>): Promise<void> {
    if (dto.residenceLocationId) {
      const isValid = await CatalogModule.validateArea(dto.residenceLocationId);
      if (!isValid) {
        throw new AppError(`Invalid or inactive residence location ID: ${dto.residenceLocationId}`, 400);
      }
    }

    if (dto.schoolId) {
      const isValidSchool = await CatalogModule.validateSchool(dto.schoolId);
      if (!isValidSchool) {
        throw new AppError(`Invalid, inactive, or unpartnered school ID: ${dto.schoolId}`, 400);
      }
    }

    if (dto.pincode) {
      const pinRegex = /^[1-9][0-9]{5}$/;
      if (!pinRegex.test(dto.pincode)) {
        throw new AppError(`Invalid pincode format: ${dto.pincode}`, 400);
      }
    }

    if (dto.landmark && dto.landmark.length > 255) {
      throw new AppError(`Landmark too long (max 255 characters)`, 400);
    }
  }
}

import 'server-only';
import { IStudentRepository } from '../../domain/IStudentRepository';
import { Student } from '../../domain/Student';
import { CreateStudentProfileDto, StudentProfileDto, UpdateStudentProfileDto } from '../dtos';
import { AppError } from '../../../../shared/errors';

export class StudentUseCases {
  constructor(private readonly studentRepository: IStudentRepository) {}

  async createMyProfile(dto: CreateStudentProfileDto): Promise<StudentProfileDto> {
    const existing = await this.studentRepository.findByUserId(dto.userId);
    if (existing) {
      throw new AppError('Profile already exists', 409);
    }

    const student = Student.create({
      userId: dto.userId,
      fullName: dto.fullName,
      educationStage: dto.educationStage,
      board: dto.board,
      state: dto.state,
      district: dto.district,
      city: dto.city,
      latitude: dto.latitude,
      longitude: dto.longitude,
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
}

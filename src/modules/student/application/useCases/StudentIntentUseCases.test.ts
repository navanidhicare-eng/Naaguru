import { describe, it, expect, vi, beforeEach, Mocked } from 'vitest';
import { StudentIntentUseCases } from './StudentIntentUseCases';
import { IStudentIntentRepository } from '../../domain/IStudentIntentRepository';
import { StudentCollegeIntent } from '../../domain/StudentCollegeIntent';
import { CatalogModule } from '../../../../shared/catalog';
import { AppError } from '../../../../shared/errors';

vi.mock('../../../../shared/catalog', () => ({
  CatalogModule: {
    validatePathway: vi.fn(),
    validateProgram: vi.fn(),
    validateArea: vi.fn(),
  },
}));

describe('StudentIntentUseCases', () => {
  let useCases: StudentIntentUseCases;
  let mockRepository: Mocked<IStudentIntentRepository>;

  beforeEach(() => {
    mockRepository = {
      getCurrentIntent: vi.fn(),
      submitInitialIntent: vi.fn(),
      reviseIntent: vi.fn(),
    };
    useCases = new StudentIntentUseCases(mockRepository);
    vi.clearAllMocks();
  });

  const validDto = {
    pathwayCode: 'INTERMEDIATE',
    programCode: 'MPC',
    areaId: null,
    requiresHostel: false,
    hostelGender: null,
    maxAnnualFee: null,
  };

  const setupCatalogMocks = (isValid = true) => {
    (CatalogModule.validatePathway as any).mockResolvedValue(isValid);
    (CatalogModule.validateProgram as any).mockResolvedValue(isValid);
    (CatalogModule.validateArea as any).mockResolvedValue(isValid);
  };

  it('submits initial intent successfully', async () => {
    setupCatalogMocks();
    const mockIntent = StudentCollegeIntent.create({
      id: 'intent1',
      studentId: 'student1',
      versionNumber: 1,
      pathwayCode: 'INTERMEDIATE',
      programCode: 'MPC',
      areaId: null,
      requiresHostel: false,
      hostelGender: null,
      maxAnnualFee: null,
      status: 'ACTIVE',
    });

    mockRepository.submitInitialIntent.mockResolvedValue(mockIntent);

    const result = await useCases.submitInitialIntent('student1', validDto);

    expect(result.versionNumber).toBe(1);
    expect(result.remainingChanges).toBe(1);
    expect(result.status).toBe('ACTIVE');
    expect(mockRepository.submitInitialIntent).toHaveBeenCalledWith('student1', validDto);
  });

  it('rejects invalid pathway', async () => {
    setupCatalogMocks(false); // Pathway is invalid
    
    await expect(useCases.submitInitialIntent('student1', validDto))
      .rejects.toThrow(AppError);
  });

  it('revises intent successfully', async () => {
    setupCatalogMocks();
    const mockIntent = StudentCollegeIntent.create({
      id: 'intent2',
      studentId: 'student1',
      versionNumber: 2,
      pathwayCode: 'INTERMEDIATE',
      programCode: 'BIPC',
      areaId: null,
      requiresHostel: false,
      hostelGender: null,
      maxAnnualFee: null,
      status: 'ACTIVE',
    });

    mockRepository.reviseIntent.mockResolvedValue(mockIntent);

    const result = await useCases.reviseIntent('student1', { ...validDto, programCode: 'BIPC' });

    expect(result.versionNumber).toBe(2);
    expect(result.remainingChanges).toBe(0);
    expect(result.status).toBe('ACTIVE');
  });

  it('rejects invalid hostel gender combination', async () => {
    setupCatalogMocks();
    
    await expect(useCases.submitInitialIntent('student1', {
      ...validDto,
      requiresHostel: true,
      hostelGender: null, // Invalid
    })).rejects.toThrow(AppError);

    await expect(useCases.submitInitialIntent('student1', {
      ...validDto,
      requiresHostel: false,
      hostelGender: 'BOYS', // Invalid
    })).rejects.toThrow(AppError);
  });
});

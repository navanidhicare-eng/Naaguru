import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudentUseCases } from './StudentUseCases';
import { IStudentRepository } from '../../domain/IStudentRepository';
import { Student } from '../../domain/Student';

vi.mock('server-only', () => ({}));

describe('StudentUseCases', () => {
  let useCases: StudentUseCases;
  let mockRepo: IStudentRepository;

  beforeEach(() => {
    mockRepo = {
      findByUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    };
    useCases = new StudentUseCases(mockRepo);
  });

  it('creates a profile successfully', async () => {
    vi.mocked(mockRepo.findByUserId).mockResolvedValue(null);

    const result = await useCases.createMyProfile({
      userId: 'user-123',
      fullName: 'John Doe',
      educationStage: '10TH_PURSUING',
    });

    expect(result.fullName).toBe('John Doe');
    expect(mockRepo.create).toHaveBeenCalled();
  });

  it('prevents creating duplicate profiles', async () => {
    vi.mocked(mockRepo.findByUserId).mockResolvedValue(
      Student.create({ userId: 'user-123', fullName: 'Existing', educationStage: '10TH_PASSED' })
    );

    await expect(useCases.createMyProfile({
      userId: 'user-123',
      fullName: 'John Doe',
      educationStage: '10TH_PURSUING',
    })).rejects.toThrow('Profile already exists');
  });

  it('updates an existing profile', async () => {
    const student = Student.create({ userId: 'user-123', fullName: 'Old Name', educationStage: '10TH_PASSED' });
    vi.mocked(mockRepo.findByUserId).mockResolvedValue(student);

    const result = await useCases.updateMyProfile('user-123', {
      fullName: 'New Name',
    });

    expect(result.fullName).toBe('New Name');
    expect(mockRepo.update).toHaveBeenCalled();
  });
});

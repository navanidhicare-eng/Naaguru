import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getColleges } from './route';
import { CollegeModule } from '@/modules/college';
import { StudentModule } from '@/modules/student/public';
import { getOptionalAuthContext } from '@/shared/auth/middleware';
import { AppError } from '@/shared/errors';

vi.mock('server-only', () => ({}));
vi.mock('@/modules/college', () => ({
  CollegeModule: {
    searchActiveColleges: vi.fn(),
  }
}));
vi.mock('@/modules/student/public', () => ({
  StudentModule: {
    getStudentProfile: vi.fn(),
  }
}));
vi.mock('@/shared/auth/middleware', () => ({
  getOptionalAuthContext: vi.fn(),
}));

describe('Public College Discovery API (C9.5.3)', () => {
  let mockSearchActiveColleges: any;
  let mockGetOptionalAuthContext: any;
  let mockGetStudentProfile: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchActiveColleges = vi.mocked(CollegeModule.searchActiveColleges);
    mockGetOptionalAuthContext = vi.mocked(getOptionalAuthContext);
    mockGetStudentProfile = vi.mocked(StudentModule.getStudentProfile);

    mockGetOptionalAuthContext.mockResolvedValue(null);
  });

  const createRequest = (url = 'http://localhost/api/v1/colleges') => {
    return new Request(url);
  };

  it('1. Returns 200 and matches PublicCollegeDto structure (no achievements)', async () => {
    mockSearchActiveColleges.mockResolvedValue([
      {
        id: 'college-1',
        name: 'Test College',
        branches: [],
        leadership: [],
        media: [],
        // Achievements are intentionally excluded from the use case output
      }
    ]);

    const res = await getColleges(createRequest());
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveLength(1);
    
    const college = data[0];
    expect(college.id).toBe('college-1');
    expect(college.branches).toBeDefined();
    
    // Explicitly check that achievements and testimonials do not leak into discovery
    expect(college).not.toHaveProperty('achievements');
    expect(college).not.toHaveProperty('testimonials');
  });

  it('2. Handles AppError correctly', async () => {
    mockSearchActiveColleges.mockRejectedValue(new AppError('Internal DB Error', 500));

    const res = await getColleges(createRequest());
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('Internal DB Error');
  });

  it('3. Authenticated FEMALE student with requiresHostel=true triggers requiresGirlsHostel=true', async () => {
    mockGetOptionalAuthContext.mockResolvedValue({ userId: 'student-female-1', role: 'STUDENT' });
    mockGetStudentProfile.mockResolvedValue({ userId: 'student-female-1', gender: 'FEMALE' } as any);
    mockSearchActiveColleges.mockResolvedValue([]);

    const res = await getColleges(createRequest('http://localhost/api/v1/colleges?requiresHostel=true&streamCode=MPC'));
    expect(res.status).toBe(200);

    expect(mockSearchActiveColleges).toHaveBeenCalledWith(expect.objectContaining({
      streamCode: 'MPC',
      requiresHostel: true,
      requiresGirlsHostel: true,
      gender: 'FEMALE',
    }));
  });

  it('4. Authenticated MALE student with requiresHostel=true triggers requiresBoysHostel=true', async () => {
    mockGetOptionalAuthContext.mockResolvedValue({ userId: 'student-male-1', role: 'STUDENT' });
    mockGetStudentProfile.mockResolvedValue({ userId: 'student-male-1', gender: 'MALE' } as any);
    mockSearchActiveColleges.mockResolvedValue([]);

    const res = await getColleges(createRequest('http://localhost/api/v1/colleges?requiresHostel=true&streamCode=BIPC'));
    expect(res.status).toBe(200);

    expect(mockSearchActiveColleges).toHaveBeenCalledWith(expect.objectContaining({
      streamCode: 'BIPC',
      requiresHostel: true,
      requiresBoysHostel: true,
      gender: 'MALE',
    }));
  });

  it('5. Authenticated student with requiresHostel=false does not trigger gender-based hostel filter', async () => {
    mockGetOptionalAuthContext.mockResolvedValue({ userId: 'student-female-1', role: 'STUDENT' });
    mockGetStudentProfile.mockResolvedValue({ userId: 'student-female-1', gender: 'FEMALE' } as any);
    mockSearchActiveColleges.mockResolvedValue([]);

    const res = await getColleges(createRequest('http://localhost/api/v1/colleges?requiresHostel=false&streamCode=MPC'));
    expect(res.status).toBe(200);

    expect(mockSearchActiveColleges).toHaveBeenCalledWith(expect.objectContaining({
      streamCode: 'MPC',
      requiresHostel: undefined,
      requiresGirlsHostel: undefined,
      requiresBoysHostel: undefined,
    }));
  });

  it('6. Unauthenticated request falls back to query params without assuming gender', async () => {
    mockGetOptionalAuthContext.mockResolvedValue(null);
    mockSearchActiveColleges.mockResolvedValue([]);

    const res = await getColleges(createRequest('http://localhost/api/v1/colleges?requiresHostel=true&requiresBoysHostel=true'));
    expect(res.status).toBe(200);

    expect(mockSearchActiveColleges).toHaveBeenCalledWith(expect.objectContaining({
      requiresHostel: true,
      requiresBoysHostel: true,
      requiresGirlsHostel: undefined,
      gender: undefined,
    }));
  });

  it('7. Authenticated student with missing profile (404) returns 404 and does not broaden results', async () => {
    mockGetOptionalAuthContext.mockResolvedValue({ userId: 'student-no-profile', role: 'STUDENT' });
    mockGetStudentProfile.mockRejectedValue(new AppError('Profile not found', 404));

    const res = await getColleges(createRequest('http://localhost/api/v1/colleges?requiresHostel=true'));
    expect(res.status).toBe(404);

    const data = await res.json();
    expect(data.error).toBe('Profile not found');
    expect(mockSearchActiveColleges).not.toHaveBeenCalled();
  });

  it('8. Authenticated student with missing gender in profile returns 400 and does not broaden results', async () => {
    mockGetOptionalAuthContext.mockResolvedValue({ userId: 'student-no-gender', role: 'STUDENT' });
    mockGetStudentProfile.mockResolvedValue({ userId: 'student-no-gender', gender: null } as any);

    const res = await getColleges(createRequest('http://localhost/api/v1/colleges?requiresHostel=true'));
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe('Student gender is required to search for hostel availability');
    expect(mockSearchActiveColleges).not.toHaveBeenCalled();
  });

  it('9. Unexpected DB error during profile lookup returns 500 and is not swallowed', async () => {
    mockGetOptionalAuthContext.mockResolvedValue({ userId: 'student-db-err', role: 'STUDENT' });
    mockGetStudentProfile.mockRejectedValue(new Error('DB connection failed'));

    const res = await getColleges(createRequest('http://localhost/api/v1/colleges?requiresHostel=true'));
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data.error).toBe('Internal Server Error');
    expect(mockSearchActiveColleges).not.toHaveBeenCalled();
  });
});

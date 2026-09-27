import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getDetail } from './route';
import { CollegeModule } from '@/modules/college';
import { AppError } from '@/shared/errors';

vi.mock('server-only', () => ({}));
vi.mock('@/modules/college', () => ({
  CollegeModule: {
    getPublicProfile: vi.fn(),
  }
}));

describe('Public College Detail API (C9.5.3)', () => {
  let mockGetPublicProfile: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPublicProfile = vi.mocked(CollegeModule.getPublicProfile);
  });

  const createRequest = () => {
    return new Request('http://localhost');
  };

  const mockContext = { params: Promise.resolve({ id: 'college-1' }) };

  it('1. Returns 200 and matches PublicCollegeDetailDto structure', async () => {
    mockGetPublicProfile.mockResolvedValue({
      id: 'college-1',
      name: 'Test College',
      branches: [],
      leadership: [],
      media: [],
      achievements: [
        {
          id: 'a1',
          studentName: 'Ravi',
          exam: 'JEE',
          achievement: 'AIR 1',
          year: 2026,
          description: null,
          imageUrl: 'https://mock-url/a1.jpg',
          displayOrder: 1
        }
      ],
      testimonials: [
        {
          id: 't1',
          personName: 'Ravi Kumar',
          personType: 'STUDENT',
          testimonialText: 'Great institute experience.',
          imageUrl: 'https://mock-url/ravi.webp',
          displayOrder: 1
        }
      ],
      accreditations: [
        {
          id: 'acc1',
          name: 'NAAC A+ Grade',
          issuingBody: 'NAAC',
          year: 2024,
          validUntilYear: 2029,
          description: 'Institutional accreditation',
          certificateUrl: 'https://mock-url/cert.pdf',
          verificationUrl: 'https://naac.gov.in/verify',
          displayOrder: 1
        }
      ]
    });

    const res = await getDetail(createRequest(), mockContext);
    expect(res.status).toBe(200);

    const data = await res.json();
    
    // Check existing regressions
    expect(data.id).toBe('college-1');
    expect(data.branches).toBeDefined();
    expect(data.leadership).toBeDefined();
    expect(data.media).toBeDefined();

    // Check achievement structure (ACTIVE achievements are returned by the use case)
    expect(data.achievements).toBeDefined();
    expect(data.achievements).toHaveLength(1);
    
    const ach = data.achievements[0];
    expect(ach.studentName).toBe('Ravi');
    
    // imageStorageKey becomes imageUrl
    expect(ach.imageUrl).toBe('https://mock-url/a1.jpg');
    
    // Internal fields are not exposed
    expect(ach).not.toHaveProperty('imageStorageKey');
    expect(ach).not.toHaveProperty('status');
    expect(ach).not.toHaveProperty('createdAt');
    expect(ach).not.toHaveProperty('updatedAt');
    expect(ach).not.toHaveProperty('collegeId');

    // Check testimonial structure (ACTIVE testimonials are returned by the use case)
    expect(data.testimonials).toBeDefined();
    expect(data.testimonials).toHaveLength(1);

    const testi = data.testimonials[0];
    expect(testi.id).toBe('t1');
    expect(testi.personName).toBe('Ravi Kumar');
    expect(testi.personType).toBe('STUDENT');
    expect(testi.testimonialText).toBe('Great institute experience.');
    expect(testi.imageUrl).toBe('https://mock-url/ravi.webp');
    expect(testi.displayOrder).toBe(1);

    // Internal fields are not exposed for testimonials
    expect(testi).not.toHaveProperty('imageStorageKey');
    expect(testi).not.toHaveProperty('status');
    expect(testi).not.toHaveProperty('createdAt');
    expect(testi).not.toHaveProperty('updatedAt');
    expect(testi).not.toHaveProperty('collegeId');

    // Check accreditation structure (ACTIVE accreditations are returned by the use case)
    expect(data.accreditations).toBeDefined();
    expect(data.accreditations).toHaveLength(1);

    const acc = data.accreditations[0];
    expect(acc.id).toBe('acc1');
    expect(acc.name).toBe('NAAC A+ Grade');
    expect(acc.issuingBody).toBe('NAAC');
    expect(acc.year).toBe(2024);
    expect(acc.validUntilYear).toBe(2029);
    expect(acc.description).toBe('Institutional accreditation');
    expect(acc.certificateUrl).toBe('https://mock-url/cert.pdf');
    expect(acc.verificationUrl).toBe('https://naac.gov.in/verify');
    expect(acc.displayOrder).toBe(1);

    // Internal fields are not exposed for accreditations
    expect(acc).not.toHaveProperty('certificateStorageKey');
    expect(acc).not.toHaveProperty('status');
    expect(acc).not.toHaveProperty('createdAt');
    expect(acc).not.toHaveProperty('updatedAt');
    expect(acc).not.toHaveProperty('collegeId');
  });

  it('2. Handles AppError correctly (e.g., college not found or INACTIVE)', async () => {
    mockGetPublicProfile.mockRejectedValue(new AppError('College not found', 404));

    const res = await getDetail(createRequest(), mockContext);
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe('College not found');
  });
});

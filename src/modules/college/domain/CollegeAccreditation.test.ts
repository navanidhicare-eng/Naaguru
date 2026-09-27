import { describe, it, expect } from 'vitest';
import { CollegeAccreditation } from './CollegeAccreditation';
import { College } from './models';

describe('CollegeAccreditation Domain Entity', () => {
  const currentYear = new Date().getFullYear();

  const validProps = {
    collegeId: 'college-1',
    name: 'NAAC A+ Grade',
    issuingBody: 'NAAC',
  };

  it('1. valid accreditation creation with defaults', () => {
    const accreditation = CollegeAccreditation.create(validProps);
    
    expect(accreditation.id).toBeDefined();
    expect(accreditation.collegeId).toBe('college-1');
    expect(accreditation.name).toBe('NAAC A+ Grade');
    expect(accreditation.issuingBody).toBe('NAAC');
    expect(accreditation.year).toBeNull();
    expect(accreditation.validUntilYear).toBeNull();
    expect(accreditation.description).toBeNull();
    expect(accreditation.certificateStorageKey).toBeNull();
    expect(accreditation.verificationUrl).toBeNull();
    expect(accreditation.displayOrder).toBe(0);
    expect(accreditation.status).toBe('ACTIVE');
    expect(accreditation.isActive()).toBe(true);
    expect(accreditation.createdAt).toBeDefined();
    expect(accreditation.updatedAt).toBeDefined();
  });

  it('2. missing name rejected', () => {
    expect(() => CollegeAccreditation.create({ ...validProps, name: undefined as any })).toThrow();
  });

  it('3. blank name rejected', () => {
    expect(() => CollegeAccreditation.create({ ...validProps, name: '' })).toThrow();
    expect(() => CollegeAccreditation.create({ ...validProps, name: '   ' })).toThrow();
  });

  it('4. name >255 rejected', () => {
    expect(() => CollegeAccreditation.create({ ...validProps, name: 'a'.repeat(256) })).toThrow();
  });

  it('5. missing issuingBody rejected', () => {
    expect(() => CollegeAccreditation.create({ ...validProps, issuingBody: undefined as any })).toThrow();
  });

  it('6. blank issuingBody rejected', () => {
    expect(() => CollegeAccreditation.create({ ...validProps, issuingBody: '' })).toThrow();
    expect(() => CollegeAccreditation.create({ ...validProps, issuingBody: '   ' })).toThrow();
  });

  it('7. issuingBody >255 rejected', () => {
    expect(() => CollegeAccreditation.create({ ...validProps, issuingBody: 'a'.repeat(256) })).toThrow();
  });

  it('8. nullable year accepted', () => {
    const a1 = CollegeAccreditation.create({ ...validProps, year: null });
    const a2 = CollegeAccreditation.create({ ...validProps, year: undefined });
    expect(a1.year).toBeNull();
    expect(a2.year).toBeNull();
  });

  it('9. valid year accepted', () => {
    const a1 = CollegeAccreditation.create({ ...validProps, year: 2024 });
    const a2 = CollegeAccreditation.create({ ...validProps, year: 2000 });
    const a3 = CollegeAccreditation.create({ ...validProps, year: currentYear + 5 });
    expect(a1.year).toBe(2024);
    expect(a2.year).toBe(2000);
    expect(a3.year).toBe(currentYear + 5);
  });

  it('10. invalid year rejected', () => {
    expect(() => CollegeAccreditation.create({ ...validProps, year: 1999 })).toThrow();
    expect(() => CollegeAccreditation.create({ ...validProps, year: currentYear + 6 })).toThrow();
    expect(() => CollegeAccreditation.create({ ...validProps, year: 2024.5 })).toThrow();
  });

  it('11. nullable and valid validUntilYear accepted', () => {
    const a1 = CollegeAccreditation.create({ ...validProps, validUntilYear: null });
    const a2 = CollegeAccreditation.create({ ...validProps, validUntilYear: undefined });
    const a3 = CollegeAccreditation.create({ ...validProps, validUntilYear: 2000 });
    const a4 = CollegeAccreditation.create({ ...validProps, validUntilYear: currentYear + 5 });
    expect(a1.validUntilYear).toBeNull();
    expect(a2.validUntilYear).toBeNull();
    expect(a3.validUntilYear).toBe(2000);
    expect(a4.validUntilYear).toBe(currentYear + 5);
  });

  it('12. invalid validUntilYear rejected', () => {
    expect(() => CollegeAccreditation.create({ ...validProps, validUntilYear: 1999 })).toThrow();
    expect(() => CollegeAccreditation.create({ ...validProps, validUntilYear: currentYear + 6 })).toThrow();
    expect(() => CollegeAccreditation.create({ ...validProps, validUntilYear: 2028.5 })).toThrow();
  });

  it('13. validUntilYear earlier than year rejected', () => {
    expect(() => CollegeAccreditation.create({ ...validProps, year: 2025, validUntilYear: 2024 })).toThrow(/validUntilYear cannot be earlier than year/);
    
    // Equal or greater should succeed
    const sameYear = CollegeAccreditation.create({ ...validProps, year: 2025, validUntilYear: 2025 });
    const laterYear = CollegeAccreditation.create({ ...validProps, year: 2025, validUntilYear: currentYear + 5 });
    expect(sameYear.validUntilYear).toBe(2025);
    expect(laterYear.validUntilYear).toBe(currentYear + 5);
  });

  it('14. nullable description accepted', () => {
    const a1 = CollegeAccreditation.create({ ...validProps, description: null });
    const a2 = CollegeAccreditation.create({ ...validProps, description: undefined });
    const a3 = CollegeAccreditation.create({ ...validProps, description: '   ' });
    expect(a1.description).toBeNull();
    expect(a2.description).toBeNull();
    expect(a3.description).toBeNull();
  });

  it('15. description >1000 rejected', () => {
    expect(() => CollegeAccreditation.create({ ...validProps, description: 'a'.repeat(1001) })).toThrow();
  });

  it('16. certificateStorageKey null accepted', () => {
    const a1 = CollegeAccreditation.create({ ...validProps, certificateStorageKey: null });
    const a2 = CollegeAccreditation.create({ ...validProps, certificateStorageKey: undefined });
    const a3 = CollegeAccreditation.create({ ...validProps, certificateStorageKey: '   ' });
    expect(a1.certificateStorageKey).toBeNull();
    expect(a2.certificateStorageKey).toBeNull();
    expect(a3.certificateStorageKey).toBeNull();
  });

  it('17. certificateStorageKey >1024 rejected', () => {
    expect(() => CollegeAccreditation.create({ ...validProps, certificateStorageKey: 'a'.repeat(1025) })).toThrow();
  });

  it('18. valid verificationUrl accepted', () => {
    const a = CollegeAccreditation.create({ ...validProps, verificationUrl: 'https://naac.gov.in/certificate/123' });
    expect(a.verificationUrl).toBe('https://naac.gov.in/certificate/123');
  });

  it('19. invalid verificationUrl rejected', () => {
    expect(() => CollegeAccreditation.create({ ...validProps, verificationUrl: 'not-a-valid-url' })).toThrow();
  });

  it('20. verificationUrl >2048 rejected', () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2050);
    expect(() => CollegeAccreditation.create({ ...validProps, verificationUrl: longUrl })).toThrow();
  });

  it('21. invalid displayOrder rejected', () => {
    expect(() => CollegeAccreditation.create({ ...validProps, displayOrder: -1 })).toThrow();
    expect(() => CollegeAccreditation.create({ ...validProps, displayOrder: 1.5 })).toThrow();
  });

  it('22. invalid status rejected', () => {
    expect(() => CollegeAccreditation.create({ ...validProps, status: 'PENDING' as any })).toThrow();
  });
});

describe('College Aggregate Accreditations Integration', () => {
  const createTestCollege = (collegeId = 'college-1') => {
    return College.create({
      id: collegeId,
      name: 'Narayana Junior College',
      shortName: 'NJC',
      description: 'Premier coaching college',
      website: 'https://narayanagroup.com',
      contactPhone: '9876543210',
      contactEmail: 'contact@narayana.edu',
      ownershipType: 'PRIVATE',
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      branches: [],
      leadership: [],
      media: [],
      weeklyMenu: null,
      achievements: [],
      testimonials: [],
      accreditations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const createAccreditation = (id: string, collegeId: string, displayOrder = 0, status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE') => {
    return CollegeAccreditation.create({
      id,
      collegeId,
      name: `Accreditation ${id}`,
      issuingBody: 'TSBIE',
      displayOrder,
      status,
    });
  };

  it('23. College accepts accreditations', () => {
    const college = createTestCollege('college-1');
    expect(college.accreditations).toBeDefined();
    expect(college.accreditations).toEqual([]);
  });

  it('24. replaceAccreditations works', () => {
    const college = createTestCollege('college-1');
    const a1 = createAccreditation('a-1', 'college-1', 0);
    const a2 = createAccreditation('a-2', 'college-1', 1);

    college.replaceAccreditations([a1, a2]);

    expect(college.accreditations).toHaveLength(2);
    expect(college.accreditations[0].id).toBe('a-1');
    expect(college.accreditations[1].id).toBe('a-2');
  });

  it('25. 15 accreditations accepted', () => {
    const college = createTestCollege('college-1');
    const accreditations = Array.from({ length: 15 }, (_, i) => 
      createAccreditation(`a-${i + 1}`, 'college-1', i)
    );

    college.replaceAccreditations(accreditations);
    expect(college.accreditations).toHaveLength(15);
  });

  it('26. 16 accreditations rejected', () => {
    const college = createTestCollege('college-1');
    const accreditations = Array.from({ length: 16 }, (_, i) => 
      createAccreditation(`a-${i + 1}`, 'college-1', i)
    );

    expect(() => college.replaceAccreditations(accreditations)).toThrow(/maximum of 15 accreditations/);
  });

  it('27. ACTIVE + INACTIVE count toward 15', () => {
    const college = createTestCollege('college-1');
    const accreditations = [
      ...Array.from({ length: 10 }, (_, i) => createAccreditation(`a-${i + 1}`, 'college-1', i, 'ACTIVE')),
      ...Array.from({ length: 6 }, (_, i) => createAccreditation(`i-${i + 1}`, 'college-1', i + 10, 'INACTIVE')),
    ];

    expect(() => college.replaceAccreditations(accreditations)).toThrow(/maximum of 15 accreditations/);
  });

  it('28. foreign college accreditation rejected', () => {
    const college = createTestCollege('college-1');
    const foreign = createAccreditation('foreign-1', 'college-2', 0);

    expect(() => college.replaceAccreditations([foreign])).toThrow(/does not belong to college college-1/);
  });

  it('29. failed replacement does not partially mutate aggregate', () => {
    const college = createTestCollege('college-1');
    const initial = createAccreditation('a-initial', 'college-1', 0);
    college.replaceAccreditations([initial]);

    const foreign = createAccreditation('foreign-1', 'college-2', 1);

    expect(() => college.replaceAccreditations([foreign])).toThrow();
    expect(college.accreditations).toHaveLength(1);
    expect(college.accreditations[0].id).toBe('a-initial');
  });
});

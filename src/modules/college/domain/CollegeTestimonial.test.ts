import { describe, it, expect } from 'vitest';
import { CollegeTestimonial } from './CollegeTestimonial';
import { College } from './models';

describe('CollegeTestimonial Domain Entity', () => {
  const validProps = {
    collegeId: 'college-1',
    personName: 'K. Ramakrishna Rao',
    personType: 'PARENT' as const,
    testimonialText: 'Exceptional mentorship by Physics faculty. My son secured AIR 42 in JEE Advanced.',
  };

  it('1. creates a valid testimonial with default optional fields', () => {
    const testimonial = CollegeTestimonial.create(validProps);
    
    expect(testimonial.id).toBeDefined();
    expect(testimonial.collegeId).toBe('college-1');
    expect(testimonial.personName).toBe('K. Ramakrishna Rao');
    expect(testimonial.personType).toBe('PARENT');
    expect(testimonial.testimonialText).toBe('Exceptional mentorship by Physics faculty. My son secured AIR 42 in JEE Advanced.');
    expect(testimonial.imageStorageKey).toBeNull();
    expect(testimonial.displayOrder).toBe(0);
    expect(testimonial.status).toBe('ACTIVE');
    expect(testimonial.isActive()).toBe(true);
    expect(testimonial.createdAt).toBeDefined();
    expect(testimonial.updatedAt).toBeDefined();
  });

  it('2. rejects missing personName', () => {
    expect(() => CollegeTestimonial.create({ ...validProps, personName: undefined as any })).toThrow();
  });

  it('3. rejects empty or whitespace-only personName', () => {
    expect(() => CollegeTestimonial.create({ ...validProps, personName: '' })).toThrow();
    expect(() => CollegeTestimonial.create({ ...validProps, personName: '   ' })).toThrow();
  });

  it('4. rejects invalid personType', () => {
    expect(() => CollegeTestimonial.create({ ...validProps, personType: 'INVALID_TYPE' as any })).toThrow();
  });

  it('5. accepts all valid personType values', () => {
    const student = CollegeTestimonial.create({ ...validProps, personType: 'STUDENT' });
    const parent = CollegeTestimonial.create({ ...validProps, personType: 'PARENT' });
    const alumni = CollegeTestimonial.create({ ...validProps, personType: 'ALUMNI' });
    const other = CollegeTestimonial.create({ ...validProps, personType: 'OTHER' });

    expect(student.personType).toBe('STUDENT');
    expect(parent.personType).toBe('PARENT');
    expect(alumni.personType).toBe('ALUMNI');
    expect(other.personType).toBe('OTHER');
  });

  it('6. rejects missing testimonialText', () => {
    expect(() => CollegeTestimonial.create({ ...validProps, testimonialText: undefined as any })).toThrow();
  });

  it('7. rejects empty or whitespace-only testimonialText', () => {
    expect(() => CollegeTestimonial.create({ ...validProps, testimonialText: '' })).toThrow();
    expect(() => CollegeTestimonial.create({ ...validProps, testimonialText: '   ' })).toThrow();
  });

  it('8. rejects invalid displayOrder (negative or float)', () => {
    expect(() => CollegeTestimonial.create({ ...validProps, displayOrder: -1 })).toThrow();
    expect(() => CollegeTestimonial.create({ ...validProps, displayOrder: 1.5 })).toThrow();
  });

  it('9. rejects invalid status', () => {
    expect(() => CollegeTestimonial.create({ ...validProps, status: 'PENDING' as any })).toThrow();
  });

  it('10. accepts nullable and undefined imageStorageKey', () => {
    const tNull = CollegeTestimonial.create({ ...validProps, imageStorageKey: null });
    const tUndefined = CollegeTestimonial.create({ ...validProps, imageStorageKey: undefined });
    const tEmpty = CollegeTestimonial.create({ ...validProps, imageStorageKey: '   ' });

    expect(tNull.imageStorageKey).toBeNull();
    expect(tUndefined.imageStorageKey).toBeNull();
    expect(tEmpty.imageStorageKey).toBeNull();
  });

  it('11. accepts valid imageStorageKey and trims whitespace', () => {
    const t = CollegeTestimonial.create({
      ...validProps,
      imageStorageKey: '  colleges/c1/testimonials/avatar.jpg  ',
    });
    expect(t.imageStorageKey).toBe('colleges/c1/testimonials/avatar.jpg');
  });

  it('12. isActive() correctly reflects status', () => {
    const active = CollegeTestimonial.create({ ...validProps, status: 'ACTIVE' });
    const inactive = CollegeTestimonial.create({ ...validProps, status: 'INACTIVE' });

    expect(active.isActive()).toBe(true);
    expect(inactive.isActive()).toBe(false);
  });
});

describe('College Aggregate Testimonials Integration', () => {
  const createTestCollege = (collegeId = 'college-1') => {
    return College.create({
      id: collegeId,
      name: 'Test Institution',
      shortName: null,
      description: null,
      website: null,
      contactPhone: null,
      contactEmail: null,
      ownershipType: 'PRIVATE',
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      branches: [],
      leadership: [],
      media: [],
      weeklyMenu: null,
      achievements: [],
      testimonials: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  const createTestimonial = (id: string, collegeId = 'college-1', status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE', displayOrder = 0) => {
    return CollegeTestimonial.create({
      id,
      collegeId,
      personName: `Person ${id}`,
      personType: 'STUDENT',
      testimonialText: `Great institution ${id}`,
      displayOrder,
      status,
    });
  };

  it('1. College can contain testimonials upon creation', () => {
    const t1 = createTestimonial('t1');
    const college = College.create({
      id: 'college-1',
      name: 'Test Institution',
      shortName: null,
      description: null,
      website: null,
      contactPhone: null,
      contactEmail: null,
      ownershipType: 'PRIVATE',
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
      branches: [],
      leadership: [],
      media: [],
      weeklyMenu: null,
      achievements: [],
      testimonials: [t1],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(college.testimonials).toHaveLength(1);
    expect(college.testimonials[0].id).toBe('t1');
  });

  it('2. replaceTestimonials() successfully replaces the collection', () => {
    const college = createTestCollege();
    const t1 = createTestimonial('t1');
    const t2 = createTestimonial('t2');

    college.replaceTestimonials([t1, t2]);
    expect(college.testimonials).toHaveLength(2);
    expect(college.testimonials.map(t => t.id)).toEqual(['t1', 't2']);
  });

  it('3. accepts exactly 10 testimonials', () => {
    const college = createTestCollege();
    const tenTestimonials = Array.from({ length: 10 }, (_, i) => createTestimonial(`t${i + 1}`));

    expect(() => college.replaceTestimonials(tenTestimonials)).not.toThrow();
    expect(college.testimonials).toHaveLength(10);
  });

  it('4. rejects 11 testimonials with domain invariant error', () => {
    const college = createTestCollege();
    const elevenTestimonials = Array.from({ length: 11 }, (_, i) => createTestimonial(`t${i + 1}`));

    expect(() => college.replaceTestimonials(elevenTestimonials)).toThrow(/maximum of 10 testimonials/);
  });

  it('5. ACTIVE + INACTIVE both count toward the 10 item maximum limit', () => {
    const college = createTestCollege();
    const mixedTestimonials = [
      ...Array.from({ length: 6 }, (_, i) => createTestimonial(`act-${i}`, 'college-1', 'ACTIVE')),
      ...Array.from({ length: 5 }, (_, i) => createTestimonial(`inact-${i}`, 'college-1', 'INACTIVE')),
    ]; // Total = 11

    expect(() => college.replaceTestimonials(mixedTestimonials)).toThrow(/maximum of 10 testimonials/);
  });

  it('6. rejects testimonials belonging to another college', () => {
    const college = createTestCollege('college-1');
    const foreignTestimonial = createTestimonial('t-foreign', 'college-2');

    expect(() => college.replaceTestimonials([foreignTestimonial])).toThrow(/does not belong to college college-1/);
  });

  it('7. replacement is atomic and does not silently truncate or modify collection on error', () => {
    const college = createTestCollege('college-1');
    const initialTestimonial = createTestimonial('t-initial', 'college-1');
    college.replaceTestimonials([initialTestimonial]);

    const invalidCollection = Array.from({ length: 12 }, (_, i) => createTestimonial(`t${i}`));
    expect(() => college.replaceTestimonials(invalidCollection)).toThrow();

    // Still holds the original testimonial
    expect(college.testimonials).toHaveLength(1);
    expect(college.testimonials[0].id).toBe('t-initial');
  });
});

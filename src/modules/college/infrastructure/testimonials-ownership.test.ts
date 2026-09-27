import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/shared/database/db';
import { collegesTable, collegeTestimonialsTable } from './schema';
import { DrizzleCollegeRepository } from './DrizzleCollegeRepository';
import { College, CollegeTestimonial } from '../domain/models';
import { eq, inArray } from 'drizzle-orm';
import { AppError } from '@/shared/errors';

describe('C9.6.1 Repository Cross-College Ownership Safety Integration Test', () => {
  const repo = new DrizzleCollegeRepository();
  let collegeAId: string;
  let collegeBId: string;
  let t1Id: string;

  beforeAll(async () => {
    // 1. Create College A in DB
    const [collegeA] = await db.insert(collegesTable).values({
      name: 'College Alpha',
      ownershipType: 'PRIVATE',
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
    }).returning();
    collegeAId = collegeA.id;

    // 2. Create College B in DB
    const [collegeB] = await db.insert(collegesTable).values({
      name: 'College Beta',
      ownershipType: 'PRIVATE',
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
    }).returning();
    collegeBId = collegeB.id;
  });

  afterAll(async () => {
    // Cleanup
    if (collegeAId || collegeBId) {
      const ids = [collegeAId, collegeBId].filter(Boolean);
      await db.delete(collegeTestimonialsTable).where(inArray(collegeTestimonialsTable.collegeId, ids));
      await db.delete(collegesTable).where(inArray(collegesTable.id, ids));
    }
  });

  it('verifies that a testimonial belonging to College A cannot be updated, deleted, or reassigned through saving College B', async () => {
    // 3. Create Testimonial T1 belonging to College A
    const t1 = CollegeTestimonial.create({
      collegeId: collegeAId,
      personName: 'Original Student A',
      personType: 'STUDENT',
      testimonialText: 'Original endorsement text for College Alpha.',
      displayOrder: 1,
      status: 'ACTIVE',
    });
    t1Id = t1.id;

    const hydratedCollegeA = await repo.findById(collegeAId);
    expect(hydratedCollegeA).not.toBeNull();
    hydratedCollegeA!.replaceTestimonials([t1]);
    await repo.save(hydratedCollegeA!);

    // Verify T1 is saved under College A
    const collegeAAfterSave = await repo.findById(collegeAId);
    expect(collegeAAfterSave!.testimonials).toHaveLength(1);
    expect(collegeAAfterSave!.testimonials[0].id).toBe(t1Id);
    expect(collegeAAfterSave!.testimonials[0].personName).toBe('Original Student A');
    expect(collegeAAfterSave!.testimonials[0].testimonialText).toBe('Original endorsement text for College Alpha.');

    // 4. Attempt to save/update College B using T1's ID
    const hydratedCollegeB = await repo.findById(collegeBId);
    expect(hydratedCollegeB).not.toBeNull();

    // Construct a testimonial with T1's ID but targeting College B
    const maliciousTestimonial = CollegeTestimonial.create({
      id: t1Id, // Reusing College A's testimonial ID!
      collegeId: collegeBId,
      personName: 'Malicious Hijacker',
      personType: 'PARENT',
      testimonialText: 'Hijacked text trying to mutate College Alpha from College Beta.',
      displayOrder: 1,
      status: 'ACTIVE',
    });

    hydratedCollegeB!.replaceTestimonials([maliciousTestimonial]);

    // 5. Verify the save operation is rejected
    await expect(repo.save(hydratedCollegeB!)).rejects.toThrow(AppError);

    // 6. Verify T1 still belongs to College A in the database
    const rawRows = await db.select().from(collegeTestimonialsTable).where(eq(collegeTestimonialsTable.id, t1Id));
    expect(rawRows).toHaveLength(1);
    expect(rawRows[0].collegeId).toBe(collegeAId);

    // 7. Verify T1's content is completely unchanged
    expect(rawRows[0].personName).toBe('Original Student A');
    expect(rawRows[0].personType).toBe('STUDENT');
    expect(rawRows[0].testimonialText).toBe('Original endorsement text for College Alpha.');
    expect(rawRows[0].displayOrder).toBe(1);
    expect(rawRows[0].status).toBe('ACTIVE');

    // 8. Verify College B has no testimonial T1
    const collegeBAfterAttempt = await repo.findById(collegeBId);
    expect(collegeBAfterAttempt!.testimonials).toHaveLength(0);
  });
});

import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/shared/database/db';
import { collegesTable, branchesTable } from './schema';
import { eq } from 'drizzle-orm';
import { AppError } from '@/shared/errors';

describe('Phase C1: Branch Foundation Schema', () => {
  let collegeId: string;

  beforeAll(async () => {
    // Setup a dummy college
    const [college] = await db.insert(collegesTable).values({
      name: 'Test Branch College',
      ownershipType: 'PRIVATE',
      state: 'Test State',
      district: 'Test District',
      city: 'Test City',
      address: 'Test Address',
    }).returning();
    collegeId = college.id;
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(collegesTable).where(eq(collegesTable.id, collegeId));
  });

  it('1. Branch schema/model is represented correctly & 4. isPubliclyEligible defaults to false', async () => {
    const [branch] = await db.insert(branchesTable).values({
      collegeId,
      name: 'Test Branch',
    }).returning();

    expect(branch.id).toBeDefined();
    expect(branch.collegeId).toBe(collegeId);
    expect(branch.name).toBe('Test Branch');
    expect(branch.type).toBe('MAIN_CAMPUS');
    expect(branch.isPubliclyEligible).toBe(false);

    await db.delete(branchesTable).where(eq(branchesTable.id, branch.id));
  });

  it('2. collegeId relationship points to the correct College', async () => {
    const [branch] = await db.insert(branchesTable).values({
      collegeId,
      name: 'Linked Branch',
    }).returning();

    const result = await db.select().from(branchesTable).where(eq(branchesTable.id, branch.id));
    expect(result[0].collegeId).toBe(collegeId);

    await db.delete(branchesTable).where(eq(branchesTable.id, branch.id));
  });

  it('3. College deletion cannot silently cascade-delete branches', async () => {
    const [college2] = await db.insert(collegesTable).values({
      name: 'Test Cascade College',
      ownershipType: 'PRIVATE',
      state: 'TS',
      district: 'HYD',
      city: 'HYD',
      address: 'Addr',
    }).returning();

    const [branch] = await db.insert(branchesTable).values({
      collegeId: college2.id,
      name: 'Cascade Branch',
    }).returning();

    // Trying to delete the college should throw due to ON DELETE RESTRICT
    await expect(db.delete(collegesTable).where(eq(collegesTable.id, college2.id))).rejects.toThrow();

    // Cleanup properly
    await db.delete(branchesTable).where(eq(branchesTable.id, branch.id));
    await db.delete(collegesTable).where(eq(collegesTable.id, college2.id));
  });
});

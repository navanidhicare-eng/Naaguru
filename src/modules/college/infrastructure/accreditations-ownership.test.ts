import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/shared/database/db';
import { collegesTable, collegeAccreditationsTable } from './schema';
import { DrizzleCollegeRepository } from './DrizzleCollegeRepository';
import { College, CollegeAccreditation } from '../domain/models';
import { eq, inArray } from 'drizzle-orm';
import { AppError } from '@/shared/errors';

describe('C9.7.1 Repository Cross-College Ownership Safety Integration Test', () => {
  const repo = new DrizzleCollegeRepository();
  let collegeAId: string;
  let collegeBId: string;
  let a1Id: string;

  beforeAll(async () => {
    // 1. Create College A in DB
    const [collegeA] = await db.insert(collegesTable).values({
      name: 'College Alpha Accreditation',
      ownershipType: 'PRIVATE',
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED',
    }).returning();
    collegeAId = collegeA.id;

    // 2. Create College B in DB
    const [collegeB] = await db.insert(collegesTable).values({
      name: 'College Beta Accreditation',
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
      await db.delete(collegeAccreditationsTable).where(inArray(collegeAccreditationsTable.collegeId, ids));
      await db.delete(collegesTable).where(inArray(collegesTable.id, ids));
    }
  });

  it('verifies that an accreditation belonging to College A cannot be updated, deleted, or reassigned through saving College B', async () => {
    // 3. Create Accreditation A1 belonging to College A
    const a1 = CollegeAccreditation.create({
      collegeId: collegeAId,
      name: 'NAAC A+ Grade Original',
      issuingBody: 'NAAC',
      year: 2024,
      validUntilYear: 2029,
      description: 'Original accreditation for College Alpha.',
      displayOrder: 1,
      status: 'ACTIVE',
    });
    a1Id = a1.id;

    const hydratedCollegeA = await repo.findById(collegeAId);
    expect(hydratedCollegeA).not.toBeNull();
    hydratedCollegeA!.replaceAccreditations([a1]);
    await repo.save(hydratedCollegeA!);

    // Verify A1 is saved under College A
    const collegeAAfterSave = await repo.findById(collegeAId);
    expect(collegeAAfterSave!.accreditations).toHaveLength(1);
    expect(collegeAAfterSave!.accreditations[0].id).toBe(a1Id);
    expect(collegeAAfterSave!.accreditations[0].name).toBe('NAAC A+ Grade Original');
    expect(collegeAAfterSave!.accreditations[0].issuingBody).toBe('NAAC');

    // 4. Attempt to save/update College B using A1's ID
    const hydratedCollegeB = await repo.findById(collegeBId);
    expect(hydratedCollegeB).not.toBeNull();

    // Construct an accreditation with A1's ID but targeting College B
    const maliciousAccreditation = CollegeAccreditation.create({
      id: a1Id, // Reusing College A's accreditation ID!
      collegeId: collegeBId,
      name: 'Malicious Hijacked Accreditation',
      issuingBody: 'Forged Body',
      year: 2025,
      validUntilYear: 2030,
      description: 'Hijacked text trying to mutate College Alpha from College Beta.',
      displayOrder: 1,
      status: 'ACTIVE',
    });

    hydratedCollegeB!.replaceAccreditations([maliciousAccreditation]);

    // 5. Verify the save operation is rejected
    await expect(repo.save(hydratedCollegeB!)).rejects.toThrow(AppError);

    // 6. Verify A1 still belongs to College A in the database
    const rawRows = await db.select().from(collegeAccreditationsTable).where(eq(collegeAccreditationsTable.id, a1Id));
    expect(rawRows).toHaveLength(1);
    expect(rawRows[0].collegeId).toBe(collegeAId);

    // 7. Verify A1's content is completely unchanged
    expect(rawRows[0].name).toBe('NAAC A+ Grade Original');
    expect(rawRows[0].issuingBody).toBe('NAAC');
    expect(rawRows[0].year).toBe(2024);
    expect(rawRows[0].validUntilYear).toBe(2029);
    expect(rawRows[0].description).toBe('Original accreditation for College Alpha.');
    expect(rawRows[0].displayOrder).toBe(1);
    expect(rawRows[0].status).toBe('ACTIVE');

    // 8. Verify College B has no accreditation A1
    const collegeBAfterAttempt = await repo.findById(collegeBId);
    expect(collegeBAfterAttempt!.accreditations).toHaveLength(0);
  }, 20000);

  it('explicitly verifies that migration 0020_glorious_layla_miller.sql applied and table/enum exist in test DB', async () => {
    // 1. Verify accreditation_status enum exists in pg_type
    const enumQuery = await db.execute<{ typname: string; enumlabel: string }>(
      `SELECT typname, enumlabel FROM pg_type JOIN pg_enum ON pg_enum.enumtypid = pg_type.oid WHERE typname = 'accreditation_status'`
    );
    expect(enumQuery.length).toBe(2);
    const enumValues = enumQuery.map(r => r.enumlabel);
    expect(enumValues).toContain('ACTIVE');
    expect(enumValues).toContain('INACTIVE');

    // 2. Verify college_accreditations table exists in information_schema.tables
    const tableQuery = await db.execute<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables WHERE table_name = 'college_accreditations'`
    );
    expect(tableQuery.length).toBe(1);
    expect(tableQuery[0].table_name).toBe('college_accreditations');

    // 3. Verify columns exist with correct types
    const columnsQuery = await db.execute<{ column_name: string; data_type: string; is_nullable: string }>(
      `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'college_accreditations' ORDER BY ordinal_position`
    );
    const columnNames = columnsQuery.map(c => c.column_name);
    expect(columnNames).toEqual(expect.arrayContaining([
      'id',
      'college_id',
      'name',
      'issuing_body',
      'year',
      'valid_until_year',
      'description',
      'certificate_storage_key',
      'verification_url',
      'display_order',
      'status',
      'created_at',
      'updated_at'
    ]));

    // 4. Verify FK constraint with ON DELETE RESTRICT
    const fkQuery = await db.execute<{ constraint_name: string; delete_rule: string }>(
      `SELECT tc.constraint_name, rc.delete_rule
       FROM information_schema.table_constraints AS tc
       JOIN information_schema.referential_constraints AS rc ON tc.constraint_name = rc.constraint_name
       WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'college_accreditations'`
    );
    expect(fkQuery.length).toBeGreaterThan(0);
    expect(fkQuery[0].delete_rule).toBe('RESTRICT');

    // 5. Verify index on college_id
    const indexQuery = await db.execute<{ indexname: string }>(
      `SELECT indexname FROM pg_indexes WHERE tablename = 'college_accreditations' AND indexname = 'idx_college_accreditations_college_id'`
    );
    expect(indexQuery.length).toBe(1);
  });
});


/**
 * Phase C2: Branch Canonical Location — Schema & Validation Tests
 *
 * These are integration tests that run against a real DB.
 * They verify:
 *  - FK constraint between branches.locationId and locations
 *  - NULL locationId remains valid
 *  - ON DELETE RESTRICT protects referenced locations
 *  - Application-level LOCALITY validation (pure unit tests)
 */
import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/shared/database/db';
import { collegesTable, branchesTable } from './schema';
import { locationsTable } from '@/shared/catalog/infrastructure/schema';
import { eq } from 'drizzle-orm';
import {
  validateBranchLocationAssignment,
} from '../domain/branchLocationValidation';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function makeCollege(name: string): Promise<string> {
  const [c] = await db.insert(collegesTable).values({
    name,
    ownershipType: 'PRIVATE',
    state: 'Test State',
    district: 'Test District',
    city: 'Test City',
    address: 'Test Address',
  }).returning();
  return c.id;
}

async function makeLocation(
  type: 'STATE' | 'DISTRICT' | 'MANDAL' | 'LOCALITY',
  nameEn: string,
  parentId: string | null = null,
  status: 'ACTIVE' | 'INACTIVE' = 'ACTIVE',
): Promise<string> {
  const [l] = await db.insert(locationsTable).values({
    type,
    nameEn,
    nameTe: nameEn,
    parentId,
    status,
  }).returning();
  return l.id;
}

// ─── DB Integration Tests ────────────────────────────────────────────────────

describe('Phase C2: Branch Canonical Location — DB Schema', () => {
  let collegeId: string;
  // Location IDs created for this test suite
  let stateId: string;
  let districtId: string;
  let mandalId: string;
  let localityId: string;

  beforeAll(async () => {
    collegeId = await makeCollege('C2 Test College');

    // Build a minimal canonical hierarchy for testing
    stateId   = await makeLocation('STATE',    'C2 Test State');
    districtId = await makeLocation('DISTRICT', 'C2 Test District', stateId);
    mandalId   = await makeLocation('MANDAL',   'C2 Test Mandal',   districtId);
    localityId = await makeLocation('LOCALITY', 'C2 Test Locality', mandalId);
  });

  afterAll(async () => {
    // Delete in reverse FK order
    await db.delete(branchesTable).where(eq(branchesTable.collegeId, collegeId));
    await db.delete(collegesTable).where(eq(collegesTable.id, collegeId));
    // Delete locations from most-specific to least-specific
    await db.delete(locationsTable).where(eq(locationsTable.id, localityId));
    await db.delete(locationsTable).where(eq(locationsTable.id, mandalId));
    await db.delete(locationsTable).where(eq(locationsTable.id, districtId));
    await db.delete(locationsTable).where(eq(locationsTable.id, stateId));
  });

  it('1. NULL locationId is valid — branch can be created without a location', async () => {
    const [branch] = await db.insert(branchesTable).values({
      collegeId,
      name: 'Branch Without Location',
    }).returning();

    expect(branch.locationId).toBeNull();
    await db.delete(branchesTable).where(eq(branchesTable.id, branch.id));
  });

  it('2. Valid canonical LOCALITY locationId is accepted by the DB', async () => {
    const [branch] = await db.insert(branchesTable).values({
      collegeId,
      name: 'Branch With Locality',
      locationId: localityId,
    }).returning();

    expect(branch.locationId).toBe(localityId);
    await db.delete(branchesTable).where(eq(branchesTable.id, branch.id));
  });

  it('3. Invalid (non-existent) locationId is rejected by the FK constraint', async () => {
    const fakeLocationId = '00000000-0000-0000-0000-000000000000';

    await expect(
      db.insert(branchesTable).values({
        collegeId,
        name: 'Branch With Bad LocationId',
        locationId: fakeLocationId,
      })
    ).rejects.toThrow();
  });

  it('4. ON DELETE RESTRICT — cannot delete a location referenced by a branch', async () => {
    const [branch] = await db.insert(branchesTable).values({
      collegeId,
      name: 'Branch Protecting Locality',
      locationId: localityId,
    }).returning();

    await expect(
      db.delete(locationsTable).where(eq(locationsTable.id, localityId))
    ).rejects.toThrow();

    // Cleanup
    await db.delete(branchesTable).where(eq(branchesTable.id, branch.id));
  });

  it('5. Legacy college location fields are unaffected by C2 migration', async () => {
    const result = await db.select({
      state: collegesTable.state,
      district: collegesTable.district,
      city: collegesTable.city,
    }).from(collegesTable).where(eq(collegesTable.id, collegeId));

    expect(result[0].state).toBe('Test State');
    expect(result[0].district).toBe('Test District');
    expect(result[0].city).toBe('Test City');
  });

  it('6. Existing 4 main campus branches all still have locationId = NULL', async () => {
    // Verify that the C2 migration did not inadvertently populate locationId on
    // the production/dev branches from seed data.
    const seedCollegeNames = [
      'Sri Chaitanya Junior College',
      'Narayana Junior College',
      'Government Junior College for Boys',
      'Pragati Mahavidyalaya Junior College',
    ];

    for (const name of seedCollegeNames) {
      const rows = await db.select({
        branchLocationId: branchesTable.locationId,
        branchType: branchesTable.type,
      })
        .from(branchesTable)
        .innerJoin(collegesTable, eq(branchesTable.collegeId, collegesTable.id))
        .where(eq(collegesTable.name, name));

      // Only check if the college exists (it may not in CI environments)
      if (rows.length > 0) {
        const mainCampus = rows.find(r => r.branchType === 'MAIN_CAMPUS');
        if (mainCampus) {
          expect(mainCampus.branchLocationId, `${name} should still be UNRESOLVED`).toBeNull();
        }
      }
    }
  });
});

// ─── Pure Unit Tests — Branch Location Validation ───────────────────────────

describe('Phase C2: Branch Location Application Validation', () => {
  it('6. Accepts an ACTIVE LOCALITY', () => {
    const result = validateBranchLocationAssignment({
      id: 'some-id',
      type: 'LOCALITY',
      status: 'ACTIVE',
    });
    expect(result.valid).toBe(true);
  });

  it('7. Rejects a DISTRICT — must be LOCALITY', () => {
    const result = validateBranchLocationAssignment({
      id: 'some-id',
      type: 'DISTRICT',
      status: 'ACTIVE',
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain('LOCALITY');
    }
  });

  it('8. Rejects a MANDAL — must be LOCALITY', () => {
    const result = validateBranchLocationAssignment({
      id: 'some-id',
      type: 'MANDAL',
      status: 'ACTIVE',
    });
    expect(result.valid).toBe(false);
  });

  it('9. Rejects a STATE — must be LOCALITY', () => {
    const result = validateBranchLocationAssignment({
      id: 'some-id',
      type: 'STATE',
      status: 'ACTIVE',
    });
    expect(result.valid).toBe(false);
  });

  it('10. Rejects an INACTIVE LOCALITY', () => {
    const result = validateBranchLocationAssignment({
      id: 'some-id',
      type: 'LOCALITY',
      status: 'INACTIVE',
    });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toContain('ACTIVE');
    }
  });

  it('11. Rejects a COMING_SOON LOCALITY', () => {
    const result = validateBranchLocationAssignment({
      id: 'some-id',
      type: 'LOCALITY',
      status: 'COMING_SOON',
    });
    expect(result.valid).toBe(false);
  });
});

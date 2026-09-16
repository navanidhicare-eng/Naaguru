import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/shared/database/db';
import { collegesTable, branchesTable, collegeStreamOfferingsTable } from './schema';
import { locationsTable } from '@/shared/catalog/infrastructure/schema';
import { eq, inArray } from 'drizzle-orm';
import { DrizzleCollegeRepository } from './DrizzleCollegeRepository';

describe('Phase C5: Branch-Aware Discovery', () => {
  const repo = new DrizzleCollegeRepository();
  let locationId: string;
  let collegeId: string;
  let branchAId: string;
  let branchBId: string;
  let branchCId: string;
  
  beforeAll(async () => {
    const [loc] = await db.insert(locationsTable).values({
      type: 'DISTRICT',
      nameEn: 'C5 Test District',
      nameTe: 'C5 Test District',
      status: 'ACTIVE'
    }).returning();
    locationId = loc.id;

    const [college] = await db.insert(collegesTable).values({
      name: 'C5 Test College',
      ownershipType: 'PRIVATE',
      state: 'LegacyState',
      district: 'LegacyDistrict',
      city: 'LegacyCity',
      address: 'Test Address',
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED'
    }).returning();
    collegeId = college.id;

    const [branchA] = await db.insert(branchesTable).values({
      collegeId,
      name: 'Branch A',
      type: 'MAIN_CAMPUS',
      locationId,
      isPubliclyEligible: true,
      hasBoysHostel: true,
      hasGirlsHostel: false
    }).returning();
    branchAId = branchA.id;

    await db.insert(collegeStreamOfferingsTable).values({
      branchId: branchAId,
      streamCode: 'MPC',
      minFee: 50000,
      maxFee: 50000
    });

    const [branchB] = await db.insert(branchesTable).values({
      collegeId,
      name: 'Branch B',
      type: 'OFF_CAMPUS',
      locationId,
      isPubliclyEligible: true,
      hasBoysHostel: false,
      hasGirlsHostel: true
    }).returning();
    branchBId = branchB.id;

    await db.insert(collegeStreamOfferingsTable).values({
      branchId: branchBId,
      streamCode: 'BIPC',
      minFee: 60000,
      maxFee: 60000
    });

    const [branchC] = await db.insert(branchesTable).values({
      collegeId,
      name: 'Branch C',
      type: 'OFF_CAMPUS',
      locationId,
      isPubliclyEligible: false,
      hasBoysHostel: true,
      hasGirlsHostel: false
    }).returning();
    branchCId = branchC.id;

    await db.insert(collegeStreamOfferingsTable).values({
      branchId: branchCId,
      streamCode: 'CEC',
      minFee: 30000,
      maxFee: 30000
    });
  });

  afterAll(async () => {
    await db.delete(collegeStreamOfferingsTable).where(inArray(collegeStreamOfferingsTable.branchId, [branchAId, branchBId, branchCId]));
    await db.delete(branchesTable).where(eq(branchesTable.collegeId, collegeId));
    await db.delete(collegesTable).where(eq(collegesTable.id, collegeId));
    await db.delete(locationsTable).where(eq(locationsTable.id, locationId));
  });

  it('same-branch stream + hostel success', async () => {
    const results = await repo.searchActiveVerified({
      streamCode: 'MPC',
      requiresBoysHostel: true
    });
    const c5Result = results.find(r => r.college.id === collegeId);
    expect(c5Result).toBeDefined();
    expect(c5Result?.matchedBranchId).toBe(branchAId);
  });

  it('cross-branch stream/hostel false positive rejection', async () => {
    // Branch A has Boys Hostel + MPC
    // Branch B has Girls Hostel + BIPC
    // Request: BIPC + Boys Hostel -> should NOT match because no SINGLE branch has both
    const results = await repo.searchActiveVerified({
      streamCode: 'BIPC',
      requiresBoysHostel: true
    });
    const c5Result = results.find(r => r.college.id === collegeId);
    expect(c5Result).toBeUndefined();
  });

  it('canonical locality matching', async () => {
    const results = await repo.searchActiveVerified({
      locationId,
      streamCode: 'MPC'
    });
    const c5Result = results.find(r => r.college.id === collegeId);
    expect(c5Result).toBeDefined();
    expect(c5Result?.matchedBranchId).toBe(branchAId);
  });

  it('legacy college location fields ignored', async () => {
    // The query object doesn't accept state/district/city anymore!
    // We pass a bogus locationId. It should fail to match.
    const results = await repo.searchActiveVerified({
      locationId: '99999999-9999-9999-9999-999999999999',
      streamCode: 'MPC'
    });
    const c5Result = results.find(r => r.college.id === collegeId);
    expect(c5Result).toBeUndefined();
  });

  it('non-public branch rejection', async () => {
    // Branch C has CEC, but isPubliclyEligible = false
    const results = await repo.searchActiveVerified({
      streamCode: 'CEC'
    });
    const c5Result = results.find(r => r.college.id === collegeId);
    expect(c5Result).toBeUndefined();
  });

  it('multiple matching branches → one institution', async () => {
    // Both Branch A and Branch B require no hostel, both are in the location.
    const results = await repo.searchActiveVerified({
      locationId
    });
    const c5Colleges = results.filter(r => r.college.id === collegeId);
    expect(c5Colleges.length).toBe(1); // Deduplicated!
  });

  it('full aggregate returned without truncation', async () => {
    // Match only Branch A (MPC)
    const results = await repo.searchActiveVerified({
      streamCode: 'MPC'
    });
    const c5Result = results.find(r => r.college.id === collegeId);
    expect(c5Result).toBeDefined();

    const c5College = c5Result?.college;
    // Ensure the college contains BOTH offerings, not just the matched one!
    expect(c5College?.offerings.length).toBe(3); // MPC, BIPC, CEC
    expect(c5College?.offerings.map(o => o.streamCode).sort()).toEqual(['BIPC', 'CEC', 'MPC']);
    
    // Ensure all 3 branch hostels are present
    expect(c5College?.hostels.length).toBe(3);
    // Ensure branches aggregate is present
    expect(c5College?.branches.length).toBe(3);
  });

  it('fee boundary behavior', async () => {
    // MPC fee is 50000. Max fee 49000 should fail.
    let results = await repo.searchActiveVerified({
      streamCode: 'MPC',
      maxFee: 49000
    });
    expect(results.find(r => r.college.id === collegeId)).toBeUndefined();

    // Max fee 50000 should pass
    results = await repo.searchActiveVerified({
      streamCode: 'MPC',
      maxFee: 50000
    });
    expect(results.find(r => r.college.id === collegeId)).toBeDefined();
  });

  it('no-hostel-required behavior', async () => {
    // If we just want MPC but don't care about hostels, it matches Branch A
    const results = await repo.searchActiveVerified({
      streamCode: 'MPC',
      requiresHostel: false
    });
    expect(results.find(r => r.college.id === collegeId)).toBeDefined();
  });
});

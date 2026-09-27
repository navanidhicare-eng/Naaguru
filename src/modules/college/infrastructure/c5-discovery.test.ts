import 'dotenv/config';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/shared/database/db';
import { collegesTable, branchesTable, collegeStreamOfferingsTable, collegeLeadershipTable, collegeMediaTable } from './schema';
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

    await db.insert(collegeLeadershipTable).values({
      collegeId: collegeId,
      name: 'Dr. Test Principal',
      designation: 'Principal',
      displayOrder: 1
    });
  });

  afterAll(async () => {
    await db.delete(collegeLeadershipTable).where(eq(collegeLeadershipTable.collegeId, collegeId));
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
    // Ensure branches aggregate is present
    expect(c5College?.branches.length).toBe(3);
    
    // Ensure the college contains BOTH offerings, not just the matched one!
    const allOfferings = c5College?.branches.flatMap(b => b.offerings) || [];
    expect(allOfferings.length).toBe(3); // MPC, BIPC, CEC
    expect(allOfferings.map(o => o.streamCode).sort()).toEqual(['BIPC', 'CEC', 'MPC']);
    
    // Ensure all 3 branch hostels are present
    const branchesWithHostels = c5College?.branches.filter(b => b.hostel.hasBoysHostel || b.hostel.hasGirlsHostel) || [];
    expect(branchesWithHostels.length).toBe(3);
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

  it('does not hydrate leadership profiles (keeps discovery query lightweight)', async () => {
    // Discovery search ActiveVerified should NOT return leadership arrays, 
    // avoiding one-to-many Cartesian product explosion with branches/offerings.
    const results = await repo.searchActiveVerified({
      streamCode: 'MPC'
    });
    
    const c5Result = results.find(r => r.college.id === collegeId);
    expect(c5Result).toBeDefined();
    
    // Even though we inserted a leadership profile, it should NOT be hydrated in search!
    expect(c5Result?.college.leadership).toEqual([]);
  });

  it('does not hydrate media profiles (keeps discovery query lightweight)', async () => {
    const results = await repo.searchActiveVerified({
      streamCode: 'MPC'
    });
    
    const c5Result = results.find(r => r.college.id === collegeId);
    expect(c5Result).toBeDefined();
    
    expect(c5Result?.college.media).toEqual([]);
  });
});

describe('Discovery Policy Enhancements: Location Hierarchy & Gender Hostel Matching', () => {
  const repo = new DrizzleCollegeRepository();

  // Location IDs
  let hierDistrictId: string;
  let hierMandal1Id: string;
  let hierLocality1AId: string;
  let hierLocality1BId: string;
  let hierMandal2Id: string;
  let hierLocality2AId: string;
  let otherDistrictId: string;
  let otherMandalId: string;
  let otherLocalityId: string;

  // College & Branch IDs
  let multiCollegeId: string;
  let branch1AId: string;
  let branch1BId: string;
  let branch2AId: string;
  let otherCollegeId: string;
  let otherBranchId: string;
  let unverifiedCollegeId: string;
  let unverifiedBranchId: string;

  beforeAll(async () => {
    // 1. Create location hierarchy
    const [dist1] = await db.insert(locationsTable).values({
      type: 'DISTRICT',
      nameEn: 'Hier Test District 1',
      nameTe: 'హైయర్ టెస్ట్ జిల్లా 1',
      status: 'ACTIVE'
    }).returning();
    hierDistrictId = dist1.id;

    const [mand1] = await db.insert(locationsTable).values({
      type: 'MANDAL',
      parentId: hierDistrictId,
      nameEn: 'Hier Test Mandal 1',
      nameTe: 'హైయర్ టెస్ట్ మండలం 1',
      status: 'ACTIVE'
    }).returning();
    hierMandal1Id = mand1.id;

    const [loc1A] = await db.insert(locationsTable).values({
      type: 'LOCALITY',
      parentId: hierMandal1Id,
      nameEn: 'Hier Locality 1A',
      nameTe: 'హైయర్ ప్రాంతం 1A',
      status: 'ACTIVE'
    }).returning();
    hierLocality1AId = loc1A.id;

    const [loc1B] = await db.insert(locationsTable).values({
      type: 'LOCALITY',
      parentId: hierMandal1Id,
      nameEn: 'Hier Locality 1B',
      nameTe: 'హైయర్ ప్రాంతం 1B',
      status: 'ACTIVE'
    }).returning();
    hierLocality1BId = loc1B.id;

    const [mand2] = await db.insert(locationsTable).values({
      type: 'MANDAL',
      parentId: hierDistrictId,
      nameEn: 'Hier Test Mandal 2',
      nameTe: 'హైయర్ టెస్ట్ మండలం 2',
      status: 'ACTIVE'
    }).returning();
    hierMandal2Id = mand2.id;

    const [loc2A] = await db.insert(locationsTable).values({
      type: 'LOCALITY',
      parentId: hierMandal2Id,
      nameEn: 'Hier Locality 2A',
      nameTe: 'హైయర్ ప్రాంతం 2A',
      status: 'ACTIVE'
    }).returning();
    hierLocality2AId = loc2A.id;

    // External District Hierarchy
    const [dist2] = await db.insert(locationsTable).values({
      type: 'DISTRICT',
      nameEn: 'Other Test District 2',
      nameTe: 'ఇతర టెస్ట్ జిల్లా 2',
      status: 'ACTIVE'
    }).returning();
    otherDistrictId = dist2.id;

    const [otherMand] = await db.insert(locationsTable).values({
      type: 'MANDAL',
      parentId: otherDistrictId,
      nameEn: 'Other Test Mandal',
      nameTe: 'ఇతర టెస్ట్ మండలం',
      status: 'ACTIVE'
    }).returning();
    otherMandalId = otherMand.id;

    const [otherLoc] = await db.insert(locationsTable).values({
      type: 'LOCALITY',
      parentId: otherMandalId,
      nameEn: 'Other Locality',
      nameTe: 'ఇతర ప్రాంతం',
      status: 'ACTIVE'
    }).returning();
    otherLocalityId = otherLoc.id;

    // 2. Multi-branch College in Hierarchical Locations
    const [mCollege] = await db.insert(collegesTable).values({
      name: 'Multi-Branch Hier College',
      ownershipType: 'PRIVATE',
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED'
    }).returning();
    multiCollegeId = mCollege.id;

    // Branch 1A: Old Gajuwaka (Mandal 1) - MPC, Boys Only Hostel, Fee 45000
    const [b1A] = await db.insert(branchesTable).values({
      collegeId: multiCollegeId,
      name: 'Hier Campus 1A',
      type: 'MAIN_CAMPUS',
      locationId: hierLocality1AId,
      isPubliclyEligible: true,
      hasBoysHostel: true,
      hasGirlsHostel: false
    }).returning();
    branch1AId = b1A.id;

    await db.insert(collegeStreamOfferingsTable).values({
      branchId: branch1AId,
      streamCode: 'MPC',
      minFee: 45000,
      maxFee: 45000
    });

    // Branch 1B: New Gajuwaka (Mandal 1) - BIPC, Girls Only Hostel, Fee 55000
    const [b1B] = await db.insert(branchesTable).values({
      collegeId: multiCollegeId,
      name: 'Hier Campus 1B',
      type: 'OFF_CAMPUS',
      locationId: hierLocality1BId,
      isPubliclyEligible: true,
      hasBoysHostel: false,
      hasGirlsHostel: true
    }).returning();
    branch1BId = b1B.id;

    await db.insert(collegeStreamOfferingsTable).values({
      branchId: branch1BId,
      streamCode: 'BIPC',
      minFee: 55000,
      maxFee: 55000
    });

    // Branch 2A: PM Palem (Mandal 2) - CEC, Both Hostels (Coed), Fee 35000
    const [b2A] = await db.insert(branchesTable).values({
      collegeId: multiCollegeId,
      name: 'Hier Campus 2A',
      type: 'OFF_CAMPUS',
      locationId: hierLocality2AId,
      isPubliclyEligible: true,
      hasBoysHostel: true,
      hasGirlsHostel: true
    }).returning();
    branch2AId = b2A.id;

    await db.insert(collegeStreamOfferingsTable).values({
      branchId: branch2AId,
      streamCode: 'CEC',
      minFee: 35000,
      maxFee: 35000
    });

    // 3. Other District College
    const [oCollege] = await db.insert(collegesTable).values({
      name: 'Other District College',
      ownershipType: 'PRIVATE',
      status: 'ACTIVE',
      verificationStatus: 'VERIFIED'
    }).returning();
    otherCollegeId = oCollege.id;

    const [oBranch] = await db.insert(branchesTable).values({
      collegeId: otherCollegeId,
      name: 'Other Main Branch',
      type: 'MAIN_CAMPUS',
      locationId: otherLocalityId,
      isPubliclyEligible: true,
      hasBoysHostel: true,
      hasGirlsHostel: false
    }).returning();
    otherBranchId = oBranch.id;

    await db.insert(collegeStreamOfferingsTable).values({
      branchId: otherBranchId,
      streamCode: 'MPC',
      minFee: 40000,
      maxFee: 40000
    });

    // 4. Unverified College in Locality 1A
    const [uCollege] = await db.insert(collegesTable).values({
      name: 'Unverified College',
      ownershipType: 'PRIVATE',
      status: 'ACTIVE',
      verificationStatus: 'UNVERIFIED'
    }).returning();
    unverifiedCollegeId = uCollege.id;

    const [uBranch] = await db.insert(branchesTable).values({
      collegeId: unverifiedCollegeId,
      name: 'Unverified Branch',
      type: 'MAIN_CAMPUS',
      locationId: hierLocality1AId,
      isPubliclyEligible: true,
      hasBoysHostel: true,
      hasGirlsHostel: true
    }).returning();
    unverifiedBranchId = uBranch.id;

    await db.insert(collegeStreamOfferingsTable).values({
      branchId: unverifiedBranchId,
      streamCode: 'MPC',
      minFee: 30000,
      maxFee: 30000
    });
  });

  afterAll(async () => {
    const branchIds = [branch1AId, branch1BId, branch2AId, otherBranchId, unverifiedBranchId].filter(Boolean) as string[];
    const collegeIds = [multiCollegeId, otherCollegeId, unverifiedCollegeId].filter(Boolean) as string[];
    const locIds = [
      hierLocality1AId, hierLocality1BId, hierLocality2AId, otherLocalityId,
      hierMandal1Id, hierMandal2Id, otherMandalId,
      hierDistrictId, otherDistrictId
    ].filter(Boolean) as string[];

    // Delete stream offerings
    if (branchIds.length > 0) {
      await db.delete(collegeStreamOfferingsTable).where(
        inArray(collegeStreamOfferingsTable.branchId, branchIds)
      );
      // Delete branches
      await db.delete(branchesTable).where(
        inArray(branchesTable.id, branchIds)
      );
    }
    // Delete colleges
    if (collegeIds.length > 0) {
      await db.delete(collegesTable).where(
        inArray(collegesTable.id, collegeIds)
      );
    }
    // Delete locations
    if (locIds.length > 0) {
      await db.delete(locationsTable).where(
        inArray(locationsTable.id, locIds)
      );
    }
  });

  it('1. District search returns eligible branches in multiple descendant localities', async () => {
    const results = await repo.searchActiveVerified({
      locationId: hierDistrictId
    });
    const found = results.find(r => r.college.id === multiCollegeId);
    expect(found).toBeDefined();
    expect(results.some(r => r.college.id === otherCollegeId)).toBe(false);
  });

  it('2. Mandal search returns eligible branches in descendant localities and excludes other mandals', async () => {
    // Search Mandal 1 (has 1A: MPC and 1B: BIPC)
    const mpcResults = await repo.searchActiveVerified({
      locationId: hierMandal1Id,
      streamCode: 'MPC'
    });
    expect(mpcResults.find(r => r.college.id === multiCollegeId)?.matchedBranchId).toBe(branch1AId);

    const bipcResults = await repo.searchActiveVerified({
      locationId: hierMandal1Id,
      streamCode: 'BIPC'
    });
    expect(bipcResults.find(r => r.college.id === multiCollegeId)?.matchedBranchId).toBe(branch1BId);

    // Mandal 1 does NOT have CEC (CEC is in Mandal 2)
    const cecResults = await repo.searchActiveVerified({
      locationId: hierMandal1Id,
      streamCode: 'CEC'
    });
    expect(cecResults.find(r => r.college.id === multiCollegeId)).toBeUndefined();
  });

  it('3. Exact locality search does not return sibling localities', async () => {
    // Locality 1A only has branch1A (MPC)
    const bipcResults = await repo.searchActiveVerified({
      locationId: hierLocality1AId,
      streamCode: 'BIPC'
    });
    expect(bipcResults.find(r => r.college.id === multiCollegeId)).toBeUndefined();

    const mpcResults = await repo.searchActiveVerified({
      locationId: hierLocality1AId,
      streamCode: 'MPC'
    });
    expect(mpcResults.find(r => r.college.id === multiCollegeId)?.matchedBranchId).toBe(branch1AId);
  });

  it('4. District and mandal searches do not return branches outside the selected hierarchy', async () => {
    // Other district search should never find multiCollege
    const results = await repo.searchActiveVerified({
      locationId: otherDistrictId,
      streamCode: 'BIPC'
    });
    expect(results.find(r => r.college.id === multiCollegeId)).toBeUndefined();
  });

  it('5. Female hostel-required discovery excludes boys-only branches and includes girls-hostel branches', async () => {
    // Branch 1A has MPC but only Boys Hostel -> should be excluded for FEMALE
    const mpcFemaleResults = await repo.searchActiveVerified({
      streamCode: 'MPC',
      requiresHostel: true,
      gender: 'FEMALE'
    });
    expect(mpcFemaleResults.find(r => r.college.id === multiCollegeId)).toBeUndefined();

    // Branch 1B has BIPC with Girls Hostel -> should be included for FEMALE
    const bipcFemaleResults = await repo.searchActiveVerified({
      streamCode: 'BIPC',
      requiresHostel: true,
      gender: 'FEMALE'
    });
    const bipcFound = bipcFemaleResults.find(r => r.college.id === multiCollegeId);
    expect(bipcFound).toBeDefined();
    expect(bipcFound?.matchedBranchId).toBe(branch1BId);

    // Branch 2A has CEC with Coed (both) -> should be included for FEMALE
    const cecFemaleResults = await repo.searchActiveVerified({
      streamCode: 'CEC',
      requiresHostel: true,
      gender: 'FEMALE'
    });
    expect(cecFemaleResults.find(r => r.college.id === multiCollegeId)?.matchedBranchId).toBe(branch2AId);
  });

  it('6. Male hostel-required discovery excludes girls-only branches and includes boys-hostel branches', async () => {
    // Branch 1B has BIPC but only Girls Hostel -> should be excluded for MALE
    const bipcMaleResults = await repo.searchActiveVerified({
      streamCode: 'BIPC',
      requiresHostel: true,
      gender: 'MALE'
    });
    expect(bipcMaleResults.find(r => r.college.id === multiCollegeId)).toBeUndefined();

    // Branch 1A has MPC with Boys Hostel -> should be included for MALE
    const mpcMaleResults = await repo.searchActiveVerified({
      streamCode: 'MPC',
      requiresHostel: true,
      gender: 'MALE'
    });
    expect(mpcMaleResults.find(r => r.college.id === multiCollegeId)?.matchedBranchId).toBe(branch1AId);
  });

  it('7. Hostel not required preserves existing results without gender filtering', async () => {
    const results = await repo.searchActiveVerified({
      streamCode: 'MPC',
      requiresHostel: false
    });
    expect(results.some(r => r.college.id === multiCollegeId)).toBe(true);
    expect(results.some(r => r.college.id === otherCollegeId)).toBe(true);
  });

  it('8. Combined location, stream, fee, and hostel filters work together', async () => {
    // In Hier District, CEC with fee <= 35000, Hostel for FEMALE -> matches Branch 2A
    const match = await repo.searchActiveVerified({
      locationId: hierDistrictId,
      streamCode: 'CEC',
      maxFee: 35000,
      requiresHostel: true,
      gender: 'FEMALE'
    });
    expect(match.find(r => r.college.id === multiCollegeId)?.matchedBranchId).toBe(branch2AId);

    // Fee below minFee (30000 < 35000) -> returns empty
    const feeMiss = await repo.searchActiveVerified({
      locationId: hierDistrictId,
      streamCode: 'CEC',
      maxFee: 30000,
      requiresHostel: true,
      gender: 'FEMALE'
    });
    expect(feeMiss.find(r => r.college.id === multiCollegeId)).toBeUndefined();
  });

  it('9. A college with multiple branches returns the correct qualifying matched branch', async () => {
    const bipcMatch = await repo.searchActiveVerified({
      streamCode: 'BIPC'
    });
    expect(bipcMatch.find(r => r.college.id === multiCollegeId)?.matchedBranchId).toBe(branch1BId);

    const cecMatch = await repo.searchActiveVerified({
      streamCode: 'CEC'
    });
    expect(cecMatch.find(r => r.college.id === multiCollegeId)?.matchedBranchId).toBe(branch2AId);
  });

  it('10. Existing eligibility and verification filters remain enforced', async () => {
    // Unverified college in Locality 1A must NOT appear
    const results = await repo.searchActiveVerified({
      locationId: hierLocality1AId,
      streamCode: 'MPC'
    });
    expect(results.some(r => r.college.id === unverifiedCollegeId)).toBe(false);
  });
});

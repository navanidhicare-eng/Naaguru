import 'dotenv/config';
import { db } from '../src/shared/database/db';
import { collegesTable, branchesTable, collegeStreamOfferingsTable, branchTypeEnum } from '../src/modules/college/infrastructure/schema';
import { locationsTable } from '../src/shared/catalog/infrastructure/schema';
import { sql, eq } from 'drizzle-orm';

/**
 * DEVELOPMENT FIXTURE ONLY — DO NOT USE IN PRODUCTION
 * 
 * Seeds a set of sample junior colleges for local UI development and testing
 * of the Browse Colleges flow according to the C1-C7 architecture.
 */
async function seedColleges() {
  console.log('🌱 Seeding Demo Colleges...');

  try {
    // 1. Fetch Localities
    const localities = await db
      .select({ id: locationsTable.id, nameEn: locationsTable.nameEn })
      .from(locationsTable)
      .where(eq(locationsTable.type, 'LOCALITY'))
      .execute();

    if (localities.length === 0) {
      throw new Error('No LOCALITY locations found. Please run `npx tsx scripts/seed-catalog.ts` first.');
    }
    
    // Helper to get a deterministic locality
    const getLocalityId = (index: number) => localities[index % localities.length].id;

    // UUIDs for determinism
    const c1 = '11111111-1111-1111-1111-111111111111';
    const b1_1 = 'b1111111-1111-1111-1111-111111111111';

    const c2 = '22222222-2222-2222-2222-222222222222';
    const b2_1 = 'b2222222-1111-1111-1111-111111111111';
    const b2_2 = 'b2222222-2222-2222-2222-111111111111';

    const c3 = '33333333-3333-3333-3333-333333333333';
    const b3_1 = 'b3333333-1111-1111-1111-111111111111';
    const b3_2 = 'b3333333-2222-2222-2222-111111111111';

    const c4 = '44444444-4444-4444-4444-444444444444';
    const b4_1 = 'b4444444-1111-1111-1111-111111111111';

    const c5 = '55555555-5555-5555-5555-555555555555';
    const b5_1 = 'b5555555-1111-1111-1111-111111111111';

    const c6 = '66666666-6666-6666-6666-666666666666';
    const b6_1 = 'b6666666-1111-1111-1111-111111111111';

    const c7 = '77777777-7777-7777-7777-777777777777'; // Unverified
    const b7_1 = 'b7777777-1111-1111-1111-111111111111';

    const c8 = '88888888-8888-8888-8888-888888888888'; // Hidden branch
    const b8_1 = 'b8888888-1111-1111-1111-111111111111';

    // =========================================================================
    // COLLEGES
    // =========================================================================
    const collegesData = [
      {
        id: c1,
        name: 'Naaguru Demo Junior College — Chodavaram',
        shortName: 'Demo JC Chodavaram',
        description: 'A comprehensive public demonstration college offering both science and arts streams. Fully accredited for the demo system.',
        website: 'https://demo-jc.dev',
        contactPhone: '+91 800 000 0001',
        contactEmail: 'contact@demojc.dev',
        ownershipType: 'PRIVATE',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
      },
      {
        id: c2,
        name: 'Naaguru Demo Academy — Anakapalle',
        shortName: 'Demo Academy',
        description: 'Multi-branch academy focusing on competitive exam preparation alongside the regular syllabus.',
        website: 'https://demoacademy.dev',
        contactPhone: '+91 800 000 0002',
        contactEmail: 'admissions@demoacademy.dev',
        ownershipType: 'PRIVATE',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
      },
      {
        id: c3,
        name: 'Naaguru Demo Residential College — Narsipatnam',
        shortName: 'Demo Residential',
        description: 'Residential campus providing dedicated boy\'s and girl\'s branches with separate hostel facilities.',
        website: 'https://demoresidential.dev',
        contactPhone: '+91 800 000 0003',
        contactEmail: 'info@demoresidential.dev',
        ownershipType: 'PRIVATE',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
      },
      {
        id: c4,
        name: 'Naaguru Demo Science College — Visakhapatnam',
        shortName: 'Demo Science',
        description: 'Affordable science education with well-equipped modern laboratories.',
        website: 'https://demoscience.dev',
        contactPhone: '+91 800 000 0004',
        contactEmail: 'hello@demoscience.dev',
        ownershipType: 'GOVERNMENT',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
      },
      {
        id: c5,
        name: 'Naaguru Demo Commerce College — Vizianagaram',
        shortName: 'Demo Commerce',
        description: 'Premium institution exclusively focused on MEC and CEC with expert faculty.',
        website: 'https://democommerce.dev',
        contactPhone: '+91 800 000 0005',
        contactEmail: 'info@democommerce.dev',
        ownershipType: 'PRIVATE',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
      },
      {
        id: c6,
        name: 'Naaguru Demo Campus — Pendurthi',
        shortName: 'Demo Campus',
        description: 'Day-scholar campus without hostel facilities located centrally for easy access.',
        website: 'https://democampus.dev',
        contactPhone: '+91 800 000 0006',
        contactEmail: 'admissions@democampus.dev',
        ownershipType: 'PRIVATE',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
      },
      {
        id: c7,
        name: 'Demo College — Unverified',
        shortName: 'Unverified Demo',
        description: 'This college is pending verification and should NOT appear in public discovery.',
        website: 'https://unverified.dev',
        contactPhone: '+91 800 000 0007',
        contactEmail: 'test@unverified.dev',
        ownershipType: 'PRIVATE',
        status: 'ACTIVE',
        verificationStatus: 'UNVERIFIED',
      },
      {
        id: c8,
        name: 'Demo College — Hidden Branch',
        shortName: 'Hidden Branch Demo',
        description: 'Verified college but its only branch is not publicly eligible.',
        website: 'https://hidden.dev',
        contactPhone: '+91 800 000 0008',
        contactEmail: 'test@hidden.dev',
        ownershipType: 'PRIVATE',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
      }
    ];

    console.log(`Inserting ${collegesData.length} colleges...`);
    for (const c of collegesData) {
      await db.insert(collegesTable).values(c as any).onConflictDoUpdate({
        target: collegesTable.id,
        set: c as any
      });
    }

    // =========================================================================
    // BRANCHES
    // =========================================================================
    type BranchType = 'MAIN_CAMPUS' | 'OFF_CAMPUS';

    const branchesData = [
      // 1. Chodavaram (1 Branch)
      {
        id: b1_1,
        collegeId: c1,
        name: 'Main Campus',
        locationId: getLocalityId(0),
        address: '123 Main Road, Chodavaram',
        type: 'MAIN_CAMPUS' as BranchType,
        contactPhone: '+91 800 000 0001',
        facilities: 'Library, Physics Lab, Chemistry Lab, Indoor Study Hall',
        routine: 'College hours: 8:30 AM–4:00 PM. Study hour: 4:30 PM–5:30 PM.',
        hasBoysHostel: true,
        hasGirlsHostel: true,
        annualHostelFee: 75000,
        isPubliclyEligible: true,
      },
      // 2. Anakapalle (2 Branches, same location)
      {
        id: b2_1,
        collegeId: c2,
        name: 'Main Campus',
        locationId: getLocalityId(1),
        address: '456 East Block, Anakapalle',
        type: 'MAIN_CAMPUS' as BranchType,
        contactPhone: '+91 800 000 0002',
        facilities: 'Digital Classrooms, Library, AC Study Rooms',
        routine: 'College hours: 9:00 AM–5:00 PM.',
        hasBoysHostel: true,
        hasGirlsHostel: false,
        annualHostelFee: 85000,
        isPubliclyEligible: true,
      },
      {
        id: b2_2,
        collegeId: c2,
        name: 'Girls Campus',
        locationId: getLocalityId(1),
        address: '789 West Block, Anakapalle',
        type: 'OFF_CAMPUS' as BranchType,
        contactPhone: '+91 800 000 0002',
        facilities: 'Digital Classrooms, Library, AC Study Rooms',
        routine: 'College hours: 9:00 AM–5:00 PM.',
        hasBoysHostel: false,
        hasGirlsHostel: true,
        annualHostelFee: 85000,
        isPubliclyEligible: true,
      },
      // 3. Narsipatnam (2 Branches, different locations)
      {
        id: b3_1,
        collegeId: c3,
        name: 'North Campus',
        locationId: getLocalityId(2),
        address: 'North Street, Narsipatnam',
        type: 'MAIN_CAMPUS' as BranchType,
        contactPhone: '+91 800 000 0003',
        facilities: 'Library, Playground',
        routine: 'College hours: 8:00 AM–4:00 PM.',
        hasBoysHostel: true,
        hasGirlsHostel: false,
        annualHostelFee: 65000,
        isPubliclyEligible: true,
      },
      {
        id: b3_2,
        collegeId: c3,
        name: 'South Campus',
        locationId: getLocalityId(3),
        address: 'South Avenue, Vizag',
        type: 'OFF_CAMPUS' as BranchType,
        contactPhone: '+91 800 000 0003',
        facilities: 'Library, Advanced Labs',
        routine: 'College hours: 8:00 AM–4:00 PM.',
        hasBoysHostel: false,
        hasGirlsHostel: true,
        annualHostelFee: 70000,
        isPubliclyEligible: true,
      },
      // 4. Science College (1 Branch)
      {
        id: b4_1,
        collegeId: c4,
        name: 'Science Campus',
        locationId: getLocalityId(4),
        address: 'Science Park, Visakhapatnam',
        type: 'MAIN_CAMPUS' as BranchType,
        contactPhone: '+91 800 000 0004',
        facilities: 'Physics Lab, Chemistry Lab, Biology Lab, Computer Lab',
        routine: 'College hours: 9:30 AM–4:30 PM.',
        hasBoysHostel: false,
        hasGirlsHostel: false,
        annualHostelFee: null,
        isPubliclyEligible: true,
      },
      // 5. Commerce College (1 Branch)
      {
        id: b5_1,
        collegeId: c5,
        name: 'Business Campus',
        locationId: getLocalityId(0),
        address: 'Market Road, Vizianagaram',
        type: 'MAIN_CAMPUS' as BranchType,
        contactPhone: '+91 800 000 0005',
        facilities: 'Library, Seminar Hall',
        routine: 'College hours: 9:00 AM–4:00 PM.',
        hasBoysHostel: false,
        hasGirlsHostel: true,
        annualHostelFee: 90000,
        isPubliclyEligible: true,
      },
      // 6. Campus Pendurthi (1 Branch)
      {
        id: b6_1,
        collegeId: c6,
        name: 'Pendurthi Campus',
        locationId: getLocalityId(1),
        address: 'Highway Road, Pendurthi',
        type: 'MAIN_CAMPUS' as BranchType,
        contactPhone: '+91 800 000 0006',
        facilities: 'Library',
        routine: 'College hours: 8:00 AM–3:00 PM.',
        hasBoysHostel: false,
        hasGirlsHostel: false,
        annualHostelFee: null,
        isPubliclyEligible: true,
      },
      // 7. Unverified (1 Branch)
      {
        id: b7_1,
        collegeId: c7,
        name: 'Hidden Main Campus',
        locationId: getLocalityId(0),
        address: 'Secret Road',
        type: 'MAIN_CAMPUS' as BranchType,
        contactPhone: '+91 800 000 0007',
        facilities: 'None',
        routine: 'N/A',
        hasBoysHostel: false,
        hasGirlsHostel: false,
        annualHostelFee: null,
        isPubliclyEligible: true,
      },
      // 8. Hidden Branch (1 Branch)
      {
        id: b8_1,
        collegeId: c8,
        name: 'Hidden Off Campus',
        locationId: getLocalityId(0),
        address: 'Unknown Road',
        type: 'MAIN_CAMPUS' as BranchType,
        contactPhone: '+91 800 000 0008',
        facilities: 'None',
        routine: 'N/A',
        hasBoysHostel: false,
        hasGirlsHostel: false,
        annualHostelFee: null,
        isPubliclyEligible: false,
      }
    ];

    console.log(`Inserting ${branchesData.length} branches...`);
    for (const b of branchesData) {
      await db.insert(branchesTable).values(b as any).onConflictDoUpdate({
        target: branchesTable.id,
        set: b as any
      });
    }

    // =========================================================================
    // OFFERINGS
    // =========================================================================
    // Generate UUIDs on the fly, but delete old ones for these branches first
    const branchIds = branchesData.map(b => b.id);
    await db.execute(sql`DELETE FROM ${collegeStreamOfferingsTable} WHERE branch_id IN (${sql.join(branchIds, sql`, `)})`);

    const offeringsData = [
      // b1_1 (Chodavaram): MPC, BIPC. (Mid fee)
      { branchId: b1_1, streamCode: 'MPC', minFee: 35000, maxFee: 45000 },
      { branchId: b1_1, streamCode: 'BIPC', minFee: 35000, maxFee: 45000 },
      // b2_1 (Anakapalle Main): MPC, MEC, CEC. (High fee)
      { branchId: b2_1, streamCode: 'MPC', minFee: 70000, maxFee: 100000 },
      { branchId: b2_1, streamCode: 'MEC', minFee: 50000, maxFee: 70000 },
      { branchId: b2_1, streamCode: 'CEC', minFee: 40000, maxFee: 60000 },
      // b2_2 (Anakapalle Girls): MPC, BiPC. (High fee)
      { branchId: b2_2, streamCode: 'MPC', minFee: 70000, maxFee: 100000 },
      { branchId: b2_2, streamCode: 'BIPC', minFee: 72000, maxFee: 100000 },
      // b3_1 (Narsipatnam North - Boys): MEC, CEC (Low fee)
      { branchId: b3_1, streamCode: 'MEC', minFee: 25000, maxFee: 35000 },
      { branchId: b3_1, streamCode: 'CEC', minFee: 25000, maxFee: 35000 },
      // b3_2 (Narsipatnam South - Girls): MPC only (Low fee)
      { branchId: b3_2, streamCode: 'MPC', minFee: 25000, maxFee: 35000 },
      // b4_1 (Science): MPC, BiPC, MBIPC (Low fee, Gov-style)
      { branchId: b4_1, streamCode: 'MPC', minFee: 3500, maxFee: 5000 },
      { branchId: b4_1, streamCode: 'BIPC', minFee: 3500, maxFee: 5000 },
      { branchId: b4_1, streamCode: 'MBIPC', minFee: 4000, maxFee: 5500 },
      // b5_1 (Commerce): MEC, CEC (Highest fee)
      { branchId: b5_1, streamCode: 'MEC', minFee: 100000, maxFee: 150000 },
      { branchId: b5_1, streamCode: 'CEC', minFee: 100000, maxFee: 150000 },
      // b6_1 (Pendurthi): MPC, BiPC
      { branchId: b6_1, streamCode: 'MPC', minFee: 50000, maxFee: 70000 },
      { branchId: b6_1, streamCode: 'BIPC', minFee: 50000, maxFee: 70000 },
      // b7_1 (Unverified)
      { branchId: b7_1, streamCode: 'MPC', minFee: 10000, maxFee: 20000 },
      // b8_1 (Hidden Branch)
      { branchId: b8_1, streamCode: 'MPC', minFee: 10000, maxFee: 20000 },
    ];

    console.log(`Inserting ${offeringsData.length} offerings...`);
    await db.insert(collegeStreamOfferingsTable).values(offeringsData);

    console.log('✅ Demo Colleges seeded successfully.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    process.exit(0);
  }
}

seedColleges();

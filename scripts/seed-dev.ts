/**
 * Naaguru — Safe Development Seed Script (Phase D1)
 *
 * Dedicated, idempotent development seed system for hands-on V1 testing.
 * Uses deterministic fixture UUIDs and explicit synthetic demo markers.
 * 
 * USAGE:
 *   npx tsx scripts/seed-dev.ts --dry-run   # Report plan without writing
 *   npx tsx scripts/seed-dev.ts --apply     # Safely execute seed in database
 */
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql as drizzleSql, eq } from 'drizzle-orm';
import { usersTable } from '../src/shared/auth/schema';
import { locationsTable, schoolsTable, educationPathwaysTable, educationProgramsTable } from '../src/shared/catalog/infrastructure/schema';
import { assessmentVersionsTable, questionsTable, questionOptionsTable, assessmentVersionQuestionsTable } from '../src/modules/assessment/infrastructure/schema';
import { streamsTable, careerRulesetsTable, careerRulesTable } from '../src/modules/career/infrastructure/schema';
import { collegesTable, branchesTable, collegeStreamOfferingsTable, collegeLeadershipTable, collegeMediaTable, collegeAchievementsTable, collegeTestimonialsTable, collegeAccreditationsTable, staffMembershipsTable } from '../src/modules/college/infrastructure/schema';
import { studentsTable, studentCollegeIntentsTable } from '../src/modules/student/infrastructure/schema';
import { leadsTable } from '../src/modules/enquiry/infrastructure/schema';

const hashPassword = (password: string) => createHash('sha256').update(password).digest('hex');

// Load JSON helper
function loadJson(filename: string) {
  const filepath = path.join(__dirname, 'seed_data', filename);
  const content = fs.readFileSync(filepath, 'utf8').replace(/\u0000/g, '');
  return JSON.parse(content);
}

// Deterministic RFC 4122 (v4) compliant UUID definitions for all fixtures
export const FIXTURE_IDS = {
  // Locations
  stateAP: '10000000-0000-4000-8000-000000000001',
  districtVizag: '10000000-0000-4000-8000-000000000002',
  mandalChodavaram: '10000000-0000-4000-8000-000000000010',
  mandalAnakapalle: '10000000-0000-4000-8000-000000000020',
  mandalPendurthi: '10000000-0000-4000-8000-000000000030',
  mandalVizagUrban: '10000000-0000-4000-8000-000000000040',
  locChodavaramTown: '10000000-0000-4000-8000-000000000101',
  locGovada: '10000000-0000-4000-8000-000000000102',
  locAnakapalleTown: '10000000-0000-4000-8000-000000000201',
  locGavarapalem: '10000000-0000-4000-8000-000000000202',
  locPendurthiTown: '10000000-0000-4000-8000-000000000301',
  locVepagunta: '10000000-0000-4000-8000-000000000302',
  locDwarakaNagar: '10000000-0000-4000-8000-000000000401',
  locGajuwaka: '10000000-0000-4000-8000-000000000402',

  // Schools
  schoolChodavaramZP: '20000000-0000-4000-8000-000000000001',
  schoolGovadaZP: '20000000-0000-4000-8000-000000000002',
  schoolAnakapalleGHS: '20000000-0000-4000-8000-000000000003',
  schoolGavarapalemAloysius: '20000000-0000-4000-8000-000000000004',
  schoolPendurthiZP: '20000000-0000-4000-8000-000000000005',
  schoolVizagMunicipal: '20000000-0000-4000-8000-000000000006',

  // Pathways
  pathwayIntermediate: '30000000-0000-4000-8000-000000000001',
  pathwayPolytechnic: '30000000-0000-4000-8000-000000000002',
  pathwayITI: '30000000-0000-4000-8000-000000000003',
  pathwayDefence: '30000000-0000-4000-8000-000000000004',

  // Programs
  progMPC: '35000000-0000-4000-8000-000000000001',
  progBiPC: '35000000-0000-4000-8000-000000000002',
  progMEC: '35000000-0000-4000-8000-000000000003',
  progCEC: '35000000-0000-4000-8000-000000000004',

  // Colleges
  collegeChodavaramJC: '40000000-0000-4000-8000-000000000001',
  collegeGovtChodavaram: '40000000-0000-4000-8000-000000000002',
  collegeAnakapalleRes: '40000000-0000-4000-8000-000000000003',
  collegePendurthiDay: '40000000-0000-4000-8000-000000000004',
  collegeUnverified: '40000000-0000-4000-8000-000000000005',
  collegeHiddenBranch: '40000000-0000-4000-8000-000000000006',

  // Branches
  branchChodavaramMain: '50000000-0000-4000-8000-000000000001',
  branchGovtChodavaramMain: '50000000-0000-4000-8000-000000000002',
  branchAnakapalleBoys: '50000000-0000-4000-8000-000000000003',
  branchAnakapalleGirls: '50000000-0000-4000-8000-000000000004',
  branchPendurthiMain: '50000000-0000-4000-8000-000000000005',
  branchUnverifiedMain: '50000000-0000-4000-8000-000000000006',
  branchHiddenCampus: '50000000-0000-4000-8000-000000000007',

  // Users
  userAdmin: 'b0000000-0000-4000-8000-000000000001',
  userCollegeAdmin: 'b0000000-0000-4000-8000-000000000002',
  userDemoStudent: 'b0000000-0000-4000-8000-000000000003',

  // Staff Membership
  staffChodavaramAdmin: 'c0000000-0000-4000-8000-000000000001',

  // Student College Intent & Lead
  intentDemoStudent: 'd0000000-0000-4000-8000-000000000001',
  leadDemoStudent: 'e0000000-0000-4000-8000-000000000001',
};

async function main() {
  const isApply = process.argv.includes('--apply');
  const isDryRun = process.argv.includes('--dry-run') || !isApply;

  console.log('=================================================================');
  console.log(' Naaguru — Development Seed Fixtures (Phase D1)');
  console.log(` Mode: ${isDryRun ? '🔍 DRY-RUN (Read-only simulation)' : '🚀 APPLY (Writing to database)'}`);
  console.log('=================================================================\n');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ Error: DATABASE_URL is not set.');
    process.exit(1);
  }

  const sqlClient = postgres(connectionString, { max: 1 });
  const db = drizzle(sqlClient);

  try {
    // -------------------------------------------------------------------------
    // Preflight Safety Checks
    // -------------------------------------------------------------------------
    const [dbInfo] = await sqlClient`SELECT current_database() as db, version()`;
    console.log(`Connected to Database: ${dbInfo.db} (${dbInfo.version.split(' ')[0]} ${dbInfo.version.split(' ')[1]})`);

    // Verify migration readiness
    const [migCheck] = await sqlClient`SELECT count(*) as cnt FROM drizzle.__drizzle_migrations`;
    if (!migCheck || Number(migCheck.cnt) === 0) {
      throw new Error('Database migrations have not been applied. Run `npm run db:migrate` first.');
    }
    console.log(`✅ Preflight Check Passed: ${migCheck.cnt} migrations verified.\n`);

    // -------------------------------------------------------------------------
    // 1. Locations Dataset
    // -------------------------------------------------------------------------
    const locationsData = [
      // State
      { id: FIXTURE_IDS.stateAP, parentId: null, type: 'STATE' as const, nameEn: 'Andhra Pradesh', nameTe: 'ఆంధ్రప్రదేశ్', code: 'AP', status: 'ACTIVE' as const },
      // District
      { id: FIXTURE_IDS.districtVizag, parentId: FIXTURE_IDS.stateAP, type: 'DISTRICT' as const, nameEn: 'Visakhapatnam', nameTe: 'విశాఖపట్నం', code: 'VSP', status: 'ACTIVE' as const },
      // Mandals
      { id: FIXTURE_IDS.mandalChodavaram, parentId: FIXTURE_IDS.districtVizag, type: 'MANDAL' as const, nameEn: 'Chodavaram', nameTe: 'చోడవరం', code: 'CHOD', status: 'ACTIVE' as const },
      { id: FIXTURE_IDS.mandalAnakapalle, parentId: FIXTURE_IDS.districtVizag, type: 'MANDAL' as const, nameEn: 'Anakapalle', nameTe: 'అనకాపల్లి', code: 'AKP', status: 'ACTIVE' as const },
      { id: FIXTURE_IDS.mandalPendurthi, parentId: FIXTURE_IDS.districtVizag, type: 'MANDAL' as const, nameEn: 'Pendurthi', nameTe: 'పెందుర్తి', code: 'PEND', status: 'ACTIVE' as const },
      { id: FIXTURE_IDS.mandalVizagUrban, parentId: FIXTURE_IDS.districtVizag, type: 'MANDAL' as const, nameEn: 'Visakhapatnam Urban', nameTe: 'విశాఖపట్నం అర్బన్', code: 'VSPU', status: 'ACTIVE' as const },
      // Localities
      { id: FIXTURE_IDS.locChodavaramTown, parentId: FIXTURE_IDS.mandalChodavaram, type: 'LOCALITY' as const, nameEn: 'Chodavaram Town', nameTe: 'చోడవరం టౌన్', code: 'CHOD-TWN', status: 'ACTIVE' as const },
      { id: FIXTURE_IDS.locGovada, parentId: FIXTURE_IDS.mandalChodavaram, type: 'LOCALITY' as const, nameEn: 'Govada', nameTe: 'గోవాడ', code: 'CHOD-GOV', status: 'ACTIVE' as const },
      { id: FIXTURE_IDS.locAnakapalleTown, parentId: FIXTURE_IDS.mandalAnakapalle, type: 'LOCALITY' as const, nameEn: 'Anakapalle Town', nameTe: 'అనకాపల్లి టౌన్', code: 'AKP-TWN', status: 'ACTIVE' as const },
      { id: FIXTURE_IDS.locGavarapalem, parentId: FIXTURE_IDS.mandalAnakapalle, type: 'LOCALITY' as const, nameEn: 'Gavarapalem', nameTe: 'గవరపాలెం', code: 'AKP-GAV', status: 'ACTIVE' as const },
      { id: FIXTURE_IDS.locPendurthiTown, parentId: FIXTURE_IDS.mandalPendurthi, type: 'LOCALITY' as const, nameEn: 'Pendurthi Town', nameTe: 'పెందుర్తి టౌన్', code: 'PEND-TWN', status: 'ACTIVE' as const },
      { id: FIXTURE_IDS.locVepagunta, parentId: FIXTURE_IDS.mandalPendurthi, type: 'LOCALITY' as const, nameEn: 'Vepagunta', nameTe: 'వేపగుంట', code: 'PEND-VEP', status: 'ACTIVE' as const },
      { id: FIXTURE_IDS.locDwarakaNagar, parentId: FIXTURE_IDS.mandalVizagUrban, type: 'LOCALITY' as const, nameEn: 'Dwaraka Nagar', nameTe: 'ద్వారకా నగర్', code: 'VSP-DWK', status: 'ACTIVE' as const },
      { id: FIXTURE_IDS.locGajuwaka, parentId: FIXTURE_IDS.mandalVizagUrban, type: 'LOCALITY' as const, nameEn: 'Gajuwaka', nameTe: 'గాజువాక', code: 'VSP-GJW', status: 'ACTIVE' as const },
    ];
    console.log(`[Locations] ${locationsData.length} records planned.`);

    // -------------------------------------------------------------------------
    // 2. Schools Dataset
    // -------------------------------------------------------------------------
    const schoolsData = [
      { id: FIXTURE_IDS.schoolChodavaramZP, locationId: FIXTURE_IDS.locChodavaramTown, nameEn: '[Demo] ZP High School — Chodavaram', nameTe: '[డెమో] జెడ్.పి. ఉన్నత పాఠశాల — చోడవరం', partnershipStatus: 'PARTNER', status: 'ACTIVE' as const },
      { id: FIXTURE_IDS.schoolGovadaZP, locationId: FIXTURE_IDS.locGovada, nameEn: '[Demo] Govada ZP High School', nameTe: '[డెమో] గోవాడ జెడ్.పి. ఉన్నత పాఠశాల', partnershipStatus: 'PARTNER', status: 'ACTIVE' as const },
      { id: FIXTURE_IDS.schoolAnakapalleGHS, locationId: FIXTURE_IDS.locAnakapalleTown, nameEn: '[Demo] Govt High School — Anakapalle', nameTe: '[డెమో] ప్రభుత్వ ఉన్నత పాఠశాల — అనకాపల్లి', partnershipStatus: 'PARTNER', status: 'ACTIVE' as const },
      { id: FIXTURE_IDS.schoolGavarapalemAloysius, locationId: FIXTURE_IDS.locGavarapalem, nameEn: '[Demo] St. Aloysius High School — Gavarapalem', nameTe: '[డెమో] సెయింట్ అలూసియస్ ఉన్నత పాఠశాల', partnershipStatus: 'PARTNER', status: 'ACTIVE' as const },
      { id: FIXTURE_IDS.schoolPendurthiZP, locationId: FIXTURE_IDS.locPendurthiTown, nameEn: '[Demo] ZP High School — Pendurthi', nameTe: '[డెమో] జెడ్.పి. ఉన్నత పాఠశాల — పెందుర్తి', partnershipStatus: 'PARTNER', status: 'ACTIVE' as const },
      { id: FIXTURE_IDS.schoolVizagMunicipal, locationId: FIXTURE_IDS.locDwarakaNagar, nameEn: '[Demo] Municipal High School — Dwaraka Nagar', nameTe: '[డెమో] మునిసిపల్ ఉన్నత పాఠశాల — ద్వారకా నగర్', partnershipStatus: 'PARTNER', status: 'ACTIVE' as const },
    ];
    console.log(`[Schools] ${schoolsData.length} demo records planned.`);

    // -------------------------------------------------------------------------
    // 3. Education Pathways & Programs
    // -------------------------------------------------------------------------
    const pathwaysData = [
      { id: FIXTURE_IDS.pathwayIntermediate, code: 'INTERMEDIATE', nameEn: 'Intermediate', nameTe: 'ఇంటర్మీడియట్', icon: '🎓', displayOrder: 1, status: 'ACTIVE' as const },
      { id: FIXTURE_IDS.pathwayPolytechnic, code: 'POLYTECHNIC', nameEn: 'Polytechnic', nameTe: 'పాలిటెక్నిక్', icon: '🔧', displayOrder: 2, status: 'COMING_SOON' as const },
      { id: FIXTURE_IDS.pathwayITI, code: 'ITI', nameEn: 'ITI Trades', nameTe: 'ఐటిఐ ట్రేడ్స్', icon: '🛠', displayOrder: 3, status: 'COMING_SOON' as const },
      { id: FIXTURE_IDS.pathwayDefence, code: 'DEFENCE', nameEn: 'Defence & Service', nameTe: 'డిఫెన్స్ & సర్వీస్', icon: '🛡', displayOrder: 4, status: 'COMING_SOON' as const },
    ];

    const programsData = [
      { id: FIXTURE_IDS.progMPC, pathwayId: FIXTURE_IDS.pathwayIntermediate, code: 'MPC', nameEn: 'MPC (Maths, Physics, Chemistry)', nameTe: 'MPC (గణితం, భౌతిక, రసాయన)', displayOrder: 1, status: 'ACTIVE' as const },
      { id: FIXTURE_IDS.progBiPC, pathwayId: FIXTURE_IDS.pathwayIntermediate, code: 'BIPC', nameEn: 'BiPC (Biology, Physics, Chemistry)', nameTe: 'BiPC (జీవ, భౌతిక, రసాయన)', displayOrder: 2, status: 'ACTIVE' as const },
      { id: FIXTURE_IDS.progMEC, pathwayId: FIXTURE_IDS.pathwayIntermediate, code: 'MEC', nameEn: 'MEC (Maths, Economics, Commerce)', nameTe: 'MEC (గణితం, అర్థ, కామర్స్)', displayOrder: 3, status: 'ACTIVE' as const },
      { id: FIXTURE_IDS.progCEC, pathwayId: FIXTURE_IDS.pathwayIntermediate, code: 'CEC', nameEn: 'CEC (Commerce, Economics, Civics)', nameTe: 'CEC (కామర్స్, అర్థ, పౌరనీతి)', displayOrder: 4, status: 'ACTIVE' as const },
    ];
    console.log(`[Pathways & Programs] ${pathwaysData.length} pathways, ${programsData.length} programs planned.`);

    // -------------------------------------------------------------------------
    // 4. Assessment Questionnaire & Career Rules
    // -------------------------------------------------------------------------
    const streamsData = [
      { code: 'MPC', name: 'MPC', description: 'Maths, Physics, Chemistry' },
      { code: 'BiPC', name: 'BiPC', description: 'Biology, Physics, Chemistry' },
      { code: 'CEC', name: 'CEC', description: 'Commerce, Economics, Civics' },
      { code: 'HEC', name: 'HEC', description: 'History, Economics, Civics' },
      { code: 'MEC', name: 'MEC', description: 'Maths, Economics, Commerce' },
    ];
    console.log(`[Assessment & Streams] ${streamsData.length} streams, 64 questions planned.`);

    // -------------------------------------------------------------------------
    // 5. Colleges, Branches, Offerings & Detail Sections
    // -------------------------------------------------------------------------
    const demoDailyMenu = {
      breakfast: ['Idli & Sambar', 'Upma & Chutney'],
      lunch: ['Rice', 'Dal', 'Mixed Veg Curry', 'Sambar', 'Curd'],
      snacks: ['Tea/Milk', 'Biscuits & Banana'],
      dinner: ['Rice', 'Dal', 'Rasam', 'Curd', 'Veg Curry'],
    };

    const demoWeeklyMenu = {
      monday: demoDailyMenu,
      tuesday: demoDailyMenu,
      wednesday: demoDailyMenu,
      thursday: demoDailyMenu,
      friday: demoDailyMenu,
      saturday: demoDailyMenu,
      sunday: demoDailyMenu,
    };

    const collegesData = [
      // 1. Chodavaram Demo JC (Private, Verified, Co-ed, Hostels)
      {
        id: FIXTURE_IDS.collegeChodavaramJC,
        name: '[Demo] Naaguru Junior College — Chodavaram',
        shortName: 'Naaguru JC Chodavaram (Demo)',
        description: 'Synthetic demonstration college in Chodavaram featuring modern science labs, dedicated study halls, and residential facilities for hands-on development testing.',
        website: 'https://chodavaram-jc.demo.naaguru.in',
        contactPhone: '+91 800 000 0001',
        contactEmail: 'admissions@chodavaram-jc.demo.naaguru.in',
        weeklyMenu: demoWeeklyMenu,
        ownershipType: 'PRIVATE',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
      },
      // 2. Govt JC Chodavaram (Government, Verified, Day-scholar)
      {
        id: FIXTURE_IDS.collegeGovtChodavaram,
        name: '[Demo] Government Junior College — Chodavaram',
        shortName: 'Govt JC Chodavaram (Demo)',
        description: 'Synthetic demonstration government institution offering affordable state-curriculum intermediate courses with experienced faculty.',
        website: 'https://gjc-chodavaram.demo.naaguru.in',
        contactPhone: '+91 800 000 0002',
        contactEmail: 'principal@gjc-chodavaram.demo.naaguru.in',
        weeklyMenu: null,
        ownershipType: 'GOVERNMENT',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
      },
      // 3. Anakapalle Residential Academy (Private, Multi-branch)
      {
        id: FIXTURE_IDS.collegeAnakapalleRes,
        name: '[Demo] Anakapalle Residential Academy',
        shortName: 'Anakapalle Academy (Demo)',
        description: 'Demonstration multi-branch residential campus with separate dedicated boys and girls infrastructure.',
        website: 'https://anakapalle-academy.demo.naaguru.in',
        contactPhone: '+91 800 000 0003',
        contactEmail: 'admissions@anakapalle-academy.demo.naaguru.in',
        weeklyMenu: demoWeeklyMenu,
        ownershipType: 'PRIVATE',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
      },
      // 4. Pendurthi Day College (Private, Day-scholar)
      {
        id: FIXTURE_IDS.collegePendurthiDay,
        name: '[Demo] Pendurthi Day College',
        shortName: 'Pendurthi Day College (Demo)',
        description: 'Demonstration day-scholar college focused on MPC, MEC, and CEC streams with flexible timings.',
        website: 'https://pendurthi-day.demo.naaguru.in',
        contactPhone: '+91 800 000 0004',
        contactEmail: 'info@pendurthi-day.demo.naaguru.in',
        weeklyMenu: null,
        ownershipType: 'PRIVATE',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
      },
      // 5. Unverified College (For testing discovery filtering)
      {
        id: FIXTURE_IDS.collegeUnverified,
        name: '[Demo] Unverified Demonstration College',
        shortName: 'Unverified JC (Demo)',
        description: 'Demonstration fixture in unverified state to test student discovery visibility exclusion.',
        website: 'https://unverified.demo.naaguru.in',
        contactPhone: '+91 800 000 0005',
        contactEmail: 'test@unverified.demo.naaguru.in',
        weeklyMenu: null,
        ownershipType: 'PRIVATE',
        status: 'ACTIVE',
        verificationStatus: 'UNVERIFIED',
      },
      // 6. Hidden Branch College (For testing branch eligibility)
      {
        id: FIXTURE_IDS.collegeHiddenBranch,
        name: '[Demo] Ineligible Branch Demonstration College',
        shortName: 'Hidden Branch JC (Demo)',
        description: 'Demonstration fixture with a non-publicly eligible branch to test filtering.',
        website: 'https://hidden.demo.naaguru.in',
        contactPhone: '+91 800 000 0006',
        contactEmail: 'test@hidden.demo.naaguru.in',
        weeklyMenu: null,
        ownershipType: 'PRIVATE',
        status: 'ACTIVE',
        verificationStatus: 'VERIFIED',
      },
    ];

    const branchesData = [
      // Chodavaram Main Campus (Co-ed Hostel)
      {
        id: FIXTURE_IDS.branchChodavaramMain,
        collegeId: FIXTURE_IDS.collegeChodavaramJC,
        name: 'Main Campus',
        locationId: FIXTURE_IDS.locChodavaramTown,
        address: '12-4 Main Road, Opp. RTC Complex, Chodavaram',
        type: 'MAIN_CAMPUS' as const,
        contactPhone: '+91 800 000 0001',
        contactEmail: 'campus@chodavaram-jc.demo.naaguru.in',
        facilities: 'Physics Lab, Chemistry Lab, Computer Center, Indoor Study Hall, RO Purified Water',
        routine: 'College: 8:30 AM–4:30 PM. Supervised Study: 5:00 PM–7:00 PM.',
        hasBoysHostel: true,
        hasGirlsHostel: true,
        annualHostelFee: 75000,
        isPubliclyEligible: true,
      },
      // Govt Chodavaram Main Campus (No Hostel)
      {
        id: FIXTURE_IDS.branchGovtChodavaramMain,
        collegeId: FIXTURE_IDS.collegeGovtChodavaram,
        name: 'Main Campus',
        locationId: FIXTURE_IDS.locChodavaramTown,
        address: 'Station Road, Near Govt Hospital, Chodavaram',
        type: 'MAIN_CAMPUS' as const,
        contactPhone: '+91 800 000 0002',
        contactEmail: 'office@gjc-chodavaram.demo.naaguru.in',
        facilities: 'Science Laboratories, Playground, Government Scholarship Assistance Cell',
        routine: 'College hours: 9:30 AM–4:00 PM.',
        hasBoysHostel: false,
        hasGirlsHostel: false,
        annualHostelFee: null,
        isPubliclyEligible: true,
      },
      // Anakapalle Boys Campus
      {
        id: FIXTURE_IDS.branchAnakapalleBoys,
        collegeId: FIXTURE_IDS.collegeAnakapalleRes,
        name: 'Boys Residential Campus',
        locationId: FIXTURE_IDS.locAnakapalleTown,
        address: 'Plot 45, Industrial Estate Road, Anakapalle',
        type: 'MAIN_CAMPUS' as const,
        contactPhone: '+91 800 000 0003',
        contactEmail: 'boys@anakapalle-academy.demo.naaguru.in',
        facilities: 'Digital Smart Classrooms, AC Study Rooms, Sports Ground, Dedicated Infirmary',
        routine: 'College: 8:00 AM–5:00 PM. Evening Prep: 6:00 PM–8:30 PM.',
        hasBoysHostel: true,
        hasGirlsHostel: false,
        annualHostelFee: 85000,
        isPubliclyEligible: true,
      },
      // Anakapalle Girls Campus
      {
        id: FIXTURE_IDS.branchAnakapalleGirls,
        collegeId: FIXTURE_IDS.collegeAnakapalleRes,
        name: 'Girls Residential Campus',
        locationId: FIXTURE_IDS.locGavarapalem,
        address: '7-12 Gavarapalem Bypass Road, Anakapalle',
        type: 'OFF_CAMPUS' as const,
        contactPhone: '+91 800 000 0003',
        contactEmail: 'girls@anakapalle-academy.demo.naaguru.in',
        facilities: 'CCTV Monitored Security, Digital Classrooms, AC Library, Resident Lady Warden',
        routine: 'College: 8:00 AM–5:00 PM. Evening Study: 6:00 PM–8:00 PM.',
        hasBoysHostel: false,
        hasGirlsHostel: true,
        annualHostelFee: 85000,
        isPubliclyEligible: true,
      },
      // Pendurthi Main Campus
      {
        id: FIXTURE_IDS.branchPendurthiMain,
        collegeId: FIXTURE_IDS.collegePendurthiDay,
        name: 'Main Campus',
        locationId: FIXTURE_IDS.locPendurthiTown,
        address: 'Highway Junction Road, Pendurthi',
        type: 'MAIN_CAMPUS' as const,
        contactPhone: '+91 800 000 0004',
        contactEmail: 'campus@pendurthi-day.demo.naaguru.in',
        facilities: 'Library, Computer Lab, College Bus Transport',
        routine: 'College hours: 8:45 AM–3:45 PM.',
        hasBoysHostel: false,
        hasGirlsHostel: false,
        annualHostelFee: null,
        isPubliclyEligible: true,
      },
      // Unverified Campus
      {
        id: FIXTURE_IDS.branchUnverifiedMain,
        collegeId: FIXTURE_IDS.collegeUnverified,
        name: 'Main Campus',
        locationId: FIXTURE_IDS.locDwarakaNagar,
        address: 'Dwaraka Nagar 3rd Lane, Visakhapatnam',
        type: 'MAIN_CAMPUS' as const,
        contactPhone: '+91 800 000 0005',
        facilities: 'Standard Classrooms',
        routine: '9:00 AM–4:00 PM',
        hasBoysHostel: false,
        hasGirlsHostel: false,
        annualHostelFee: null,
        isPubliclyEligible: true,
      },
      // Ineligible Branch Campus
      {
        id: FIXTURE_IDS.branchHiddenCampus,
        collegeId: FIXTURE_IDS.collegeHiddenBranch,
        name: 'Hidden Off-Campus',
        locationId: FIXTURE_IDS.locGajuwaka,
        address: 'Industrial Road, Gajuwaka',
        type: 'OFF_CAMPUS' as const,
        contactPhone: '+91 800 000 0006',
        facilities: 'Administrative Office Only',
        routine: 'N/A',
        hasBoysHostel: false,
        hasGirlsHostel: false,
        annualHostelFee: null,
        isPubliclyEligible: false,
      },
    ];

    const offeringsData = [
      // Chodavaram Main
      { branchId: FIXTURE_IDS.branchChodavaramMain, streamCode: 'MPC', minFee: 35000, maxFee: 45000 },
      { branchId: FIXTURE_IDS.branchChodavaramMain, streamCode: 'BIPC', minFee: 35000, maxFee: 45000 },
      { branchId: FIXTURE_IDS.branchChodavaramMain, streamCode: 'MEC', minFee: 30000, maxFee: 40000 },
      // Govt Chodavaram Main
      { branchId: FIXTURE_IDS.branchGovtChodavaramMain, streamCode: 'MPC', minFee: 3500, maxFee: 5000 },
      { branchId: FIXTURE_IDS.branchGovtChodavaramMain, streamCode: 'BIPC', minFee: 3500, maxFee: 5000 },
      { branchId: FIXTURE_IDS.branchGovtChodavaramMain, streamCode: 'CEC', minFee: 3000, maxFee: 4500 },
      // Anakapalle Boys
      { branchId: FIXTURE_IDS.branchAnakapalleBoys, streamCode: 'MPC', minFee: 75000, maxFee: 95000 },
      { branchId: FIXTURE_IDS.branchAnakapalleBoys, streamCode: 'MEC', minFee: 60000, maxFee: 80000 },
      // Anakapalle Girls
      { branchId: FIXTURE_IDS.branchAnakapalleGirls, streamCode: 'MPC', minFee: 75000, maxFee: 95000 },
      { branchId: FIXTURE_IDS.branchAnakapalleGirls, streamCode: 'BIPC', minFee: 75000, maxFee: 95000 },
      // Pendurthi Main
      { branchId: FIXTURE_IDS.branchPendurthiMain, streamCode: 'MPC', minFee: 45000, maxFee: 60000 },
      { branchId: FIXTURE_IDS.branchPendurthiMain, streamCode: 'MEC', minFee: 40000, maxFee: 55000 },
      { branchId: FIXTURE_IDS.branchPendurthiMain, streamCode: 'CEC', minFee: 35000, maxFee: 50000 },
      // Unverified
      { branchId: FIXTURE_IDS.branchUnverifiedMain, streamCode: 'MPC', minFee: 20000, maxFee: 30000 },
      // Hidden
      { branchId: FIXTURE_IDS.branchHiddenCampus, streamCode: 'MPC', minFee: 20000, maxFee: 30000 },
    ];

    // Fictional Leadership (Synthetic Test Fixtures)
    const leadershipData = [
      {
        collegeId: FIXTURE_IDS.collegeChodavaramJC,
        name: 'Dr. K. S. Rao (Demo)',
        designation: 'Principal & Senior Mathematics Faculty',
        bio: '20+ years of teaching experience guiding intermediate students in foundational mathematics.',
        displayOrder: 1,
      },
      {
        collegeId: FIXTURE_IDS.collegeChodavaramJC,
        name: 'Smt. M. Lakshmi (Demo)',
        designation: 'Vice Principal & Physics HOD',
        bio: 'Specialist in conceptual mechanics and competitive physics problem solving.',
        displayOrder: 2,
      },
      {
        collegeId: FIXTURE_IDS.collegeGovtChodavaram,
        name: 'Sri V. Ramana (Demo)',
        designation: 'Principal (FAC)',
        bio: 'Dedicated education administrator committed to student welfare in rural mandals.',
        displayOrder: 1,
      },
      {
        collegeId: FIXTURE_IDS.collegeAnakapalleRes,
        name: 'Sri P. Suresh Kumar (Demo)',
        designation: 'Campus Dean',
        bio: 'Oversees academic administration and residential discipline.',
        displayOrder: 1,
      },
    ];

    // Placeholder Media
    const mediaData = [
      {
        collegeId: FIXTURE_IDS.collegeChodavaramJC,
        mediaType: 'IMAGE' as const,
        externalUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
        caption: '[Demo] Main Academic Block & Courtyard',
        isCover: true,
        displayOrder: 1,
        status: 'ACTIVE' as const,
      },
      {
        collegeId: FIXTURE_IDS.collegeChodavaramJC,
        mediaType: 'IMAGE' as const,
        externalUrl: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=800',
        caption: '[Demo] Modern Science Laboratory',
        isCover: false,
        displayOrder: 2,
        status: 'ACTIVE' as const,
      },
      {
        collegeId: FIXTURE_IDS.collegeAnakapalleRes,
        mediaType: 'IMAGE' as const,
        externalUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
        caption: '[Demo] Residential Campus Frontage',
        isCover: true,
        displayOrder: 1,
        status: 'ACTIVE' as const,
      },
    ];

    // Fictional Achievements (Explicit Demo Milestones)
    const achievementsData = [
      {
        collegeId: FIXTURE_IDS.collegeChodavaramJC,
        studentName: 'Demo Student A',
        exam: 'IPE 2nd Year Board Exams',
        achievement: 'Scored 984 / 1000 in MPC',
        year: 2025,
        description: 'Exemplary performance in state board examinations.',
        displayOrder: 1,
        status: 'ACTIVE' as const,
      },
      {
        collegeId: FIXTURE_IDS.collegeChodavaramJC,
        studentName: 'Demo Student B',
        exam: 'JEE Mains',
        achievement: '98.5 Percentile',
        year: 2025,
        description: 'Secured state-level top percentile from Chodavaram campus.',
        displayOrder: 2,
        status: 'ACTIVE' as const,
      },
      {
        collegeId: FIXTURE_IDS.collegeGovtChodavaram,
        studentName: 'Demo Student C',
        exam: 'IPE 1st Year Board Exams',
        achievement: 'District Top 10 Rank',
        year: 2025,
        description: 'Ranked top 10 among government junior colleges in Visakhapatnam.',
        displayOrder: 1,
        status: 'ACTIVE' as const,
      },
      {
        collegeId: FIXTURE_IDS.collegeAnakapalleRes,
        studentName: 'Demo Student D',
        exam: 'NEET UG',
        achievement: '620 / 720 Score',
        year: 2025,
        description: 'Outstanding medical entrance qualifying score.',
        displayOrder: 1,
        status: 'ACTIVE' as const,
      },
    ];

    // Fictional Testimonials (Explicit Synthetic Feedback)
    const testimonialsData = [
      {
        collegeId: FIXTURE_IDS.collegeChodavaramJC,
        personName: 'Demo Student K (2025 Batch)',
        personType: 'STUDENT' as const,
        testimonialText: 'The disciplined study schedule and doubt-clearing sessions helped me build strong fundamentals in Maths and Physics.',
        displayOrder: 1,
        status: 'ACTIVE' as const,
      },
      {
        collegeId: FIXTURE_IDS.collegeChodavaramJC,
        personName: 'Demo Parent R',
        personType: 'PARENT' as const,
        testimonialText: 'The faculty is approachable and the hostel environment is safe and structured for rural students.',
        displayOrder: 2,
        status: 'ACTIVE' as const,
      },
      {
        collegeId: FIXTURE_IDS.collegeAnakapalleRes,
        personName: 'Demo Alumni S (2024 Batch)',
        personType: 'ALUMNI' as const,
        testimonialText: 'Preparation for competitive exams alongside the intermediate syllabus gave me the confidence to crack entrance exams.',
        displayOrder: 1,
        status: 'ACTIVE' as const,
      },
    ];

    // Fictional Accreditations (Standard Board Recognition Fixtures)
    const accreditationsData = [
      {
        collegeId: FIXTURE_IDS.collegeChodavaramJC,
        name: 'BIEAP Affiliation (Demo)',
        issuingBody: 'Board of Intermediate Education, Andhra Pradesh',
        year: 2020,
        validUntilYear: 2028,
        description: 'Permanent institutional affiliation for intermediate science and commerce streams.',
        displayOrder: 1,
        status: 'ACTIVE' as const,
      },
      {
        collegeId: FIXTURE_IDS.collegeGovtChodavaram,
        name: 'Government Recognition (Demo)',
        issuingBody: 'Department of Intermediate Education, Govt of AP',
        year: 2005,
        validUntilYear: 2030,
        description: 'State government established and operated junior college.',
        displayOrder: 1,
        status: 'ACTIVE' as const,
      },
      {
        collegeId: FIXTURE_IDS.collegeAnakapalleRes,
        name: 'BIEAP Affiliation (Demo)',
        issuingBody: 'Board of Intermediate Education, Andhra Pradesh',
        year: 2018,
        validUntilYear: 2027,
        description: 'Recognized residential junior college with dual campus approval.',
        displayOrder: 1,
        status: 'ACTIVE' as const,
      },
    ];

    console.log(`[Colleges & Branches] ${collegesData.length} colleges, ${branchesData.length} branches, ${offeringsData.length} stream offerings planned.`);

    // -------------------------------------------------------------------------
    // 6. Test Users & Memberships
    // -------------------------------------------------------------------------
    const usersData = [
      // Company Admin
      {
        id: FIXTURE_IDS.userAdmin,
        email: 'admin@naaguru.in',
        passwordHash: hashPassword('Password@123'),
        role: 'ADMIN' as const,
      },
      // College Admin for Chodavaram Demo JC
      {
        id: FIXTURE_IDS.userCollegeAdmin,
        email: 'staff@chodavaramjc.dev',
        passwordHash: hashPassword('Password@123'),
        role: 'COLLEGE' as const,
      },
      // Pre-seeded Demo Student with completed profile
      {
        id: FIXTURE_IDS.userDemoStudent,
        phoneNumber: '+919999900001',
        email: 'demo_student@naaguru.dev',
        role: 'STUDENT' as const,
      },
    ];

    const staffMembershipsData = [
      {
        id: FIXTURE_IDS.staffChodavaramAdmin,
        userId: FIXTURE_IDS.userCollegeAdmin,
        collegeId: FIXTURE_IDS.collegeChodavaramJC,
        role: 'COLLEGE_ADMIN' as const,
        status: 'ACTIVE' as const,
      },
    ];

    const studentProfileData = {
      userId: FIXTURE_IDS.userDemoStudent,
      fullName: 'Demo Student (Chodavaram)',
      educationStage: '10th Class',
      board: 'BSEAP (SSC)',
      residenceLocationId: FIXTURE_IDS.locChodavaramTown,
      schoolId: FIXTURE_IDS.schoolChodavaramZP,
      pincode: '531036',
      landmark: 'Near RTC Complex',
      guardianName: 'Demo Guardian',
      guardianPhone: '+919999900099',
      gender: 'MALE',
    };

    const studentIntentData = {
      id: FIXTURE_IDS.intentDemoStudent,
      studentId: FIXTURE_IDS.userDemoStudent,
      versionNumber: 1,
      pathwayCode: 'INTERMEDIATE',
      programCode: 'MPC',
      preferredLocationId: FIXTURE_IDS.locChodavaramTown,
      requiresHostel: true,
      maxAnnualFee: 80000,
      status: 'ACTIVE',
    };

    const studentLeadData = {
      id: FIXTURE_IDS.leadDemoStudent,
      studentId: FIXTURE_IDS.userDemoStudent,
      collegeId: FIXTURE_IDS.collegeChodavaramJC,
      branchId: FIXTURE_IDS.branchChodavaramMain,
      streamCode: 'MPC',
      intentId: FIXTURE_IDS.intentDemoStudent,
      source: 'STUDENT_DISCOVERY_FLOW',
      status: 'NEW' as const,
    };

    console.log(`[Users & Leads] ${usersData.length} users, 1 staff membership, 1 student profile, 1 intent, 1 enquiry lead planned.`);

    // -------------------------------------------------------------------------
    // Dry-run vs Write Execution
    // -------------------------------------------------------------------------
    if (isDryRun) {
      console.log('\n=================================================================');
      console.log(' Dry-Run Summary — No changes written');
      console.log('=================================================================');
      console.log('Records verified and ready to insert/update:');
      console.log(`  - locations                   : ${locationsData.length}`);
      console.log(`  - schools                     : ${schoolsData.length}`);
      console.log(`  - education_pathways          : ${pathwaysData.length}`);
      console.log(`  - education_programs          : ${programsData.length}`);
      console.log(`  - streams                     : ${streamsData.length}`);
      console.log(`  - colleges                    : ${collegesData.length}`);
      console.log(`  - branches                    : ${branchesData.length}`);
      console.log(`  - college_stream_offerings    : ${offeringsData.length}`);
      console.log(`  - college_leadership          : ${leadershipData.length}`);
      console.log(`  - college_media               : ${mediaData.length}`);
      console.log(`  - college_achievements        : ${achievementsData.length}`);
      console.log(`  - college_testimonials        : ${testimonialsData.length}`);
      console.log(`  - college_accreditations      : ${accreditationsData.length}`);
      console.log(`  - users                       : ${usersData.length}`);
      console.log(`  - staff_memberships           : ${staffMembershipsData.length}`);
      console.log(`  - students                    : 1`);
      console.log(`  - student_college_intents     : 1`);
      console.log(`  - leads                       : 1`);
      console.log('\nTo apply these fixtures to the database, run:');
      console.log('  npm run db:seed:dev -- --apply\n');
      process.exit(0);
    }

    // -------------------------------------------------------------------------
    // WRITE EXECUTION (Idempotent Upsert)
    // -------------------------------------------------------------------------
    console.log('\n🚀 Applying seed fixtures to database...');

    // Clean up any legacy non-RFC demo fixtures if present
    await sqlClient`DELETE FROM leads WHERE id = 'e0000000-0000-0000-0000-000000000001'`;
    await sqlClient`DELETE FROM student_college_intents WHERE id = 'd0000000-0000-0000-0000-000000000001'`;
    await sqlClient`DELETE FROM students WHERE user_id = 'b0000000-0000-0000-0000-000000000003'`;
    await sqlClient`DELETE FROM staff_memberships WHERE id = 'c0000000-0000-0000-0000-000000000001'`;
    await sqlClient`DELETE FROM users WHERE id IN ('b0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003')`;
    await sqlClient`DELETE FROM college_leadership WHERE college_id::text LIKE '40000000-0000-0000-%'`;
    await sqlClient`DELETE FROM college_media WHERE college_id::text LIKE '40000000-0000-0000-%'`;
    await sqlClient`DELETE FROM college_achievements WHERE college_id::text LIKE '40000000-0000-0000-%'`;
    await sqlClient`DELETE FROM college_testimonials WHERE college_id::text LIKE '40000000-0000-0000-%'`;
    await sqlClient`DELETE FROM college_accreditations WHERE college_id::text LIKE '40000000-0000-0000-%'`;
    await sqlClient`DELETE FROM college_stream_offerings WHERE branch_id::text LIKE '50000000-0000-0000-%'`;
    await sqlClient`DELETE FROM branches WHERE id::text LIKE '50000000-0000-0000-%'`;
    await sqlClient`DELETE FROM colleges WHERE id::text LIKE '40000000-0000-0000-%'`;
    await sqlClient`DELETE FROM schools WHERE id::text LIKE '20000000-0000-0000-%'`;
    await sqlClient`DELETE FROM locations WHERE id::text LIKE '10000000-0000-0000-%'`;
    await sqlClient`DELETE FROM education_programs WHERE id::text LIKE '35000000-0000-0000-%'`;
    await sqlClient`DELETE FROM education_pathways WHERE id::text LIKE '30000000-0000-0000-%'`;

    // 1. Locations
    for (const loc of locationsData) {
      await db.insert(locationsTable).values(loc).onConflictDoUpdate({
        target: locationsTable.id,
        set: {
          parentId: loc.parentId,
          type: loc.type,
          nameEn: loc.nameEn,
          nameTe: loc.nameTe,
          code: loc.code,
          status: loc.status,
          updatedAt: drizzleSql`NOW()`,
        }
      });
    }
    console.log(`✅ Seeded ${locationsData.length} Locations`);

    // 2. Schools
    for (const school of schoolsData) {
      await db.insert(schoolsTable).values(school).onConflictDoUpdate({
        target: schoolsTable.id,
        set: {
          locationId: school.locationId,
          nameEn: school.nameEn,
          nameTe: school.nameTe,
          partnershipStatus: school.partnershipStatus,
          status: school.status,
          updatedAt: drizzleSql`NOW()`,
        }
      });
    }
    console.log(`✅ Seeded ${schoolsData.length} Schools`);

    // 3. Pathways & Programs
    for (const p of pathwaysData) {
      await db.insert(educationPathwaysTable).values(p).onConflictDoUpdate({
        target: educationPathwaysTable.id,
        set: {
          nameEn: p.nameEn,
          nameTe: p.nameTe,
          icon: p.icon,
          displayOrder: p.displayOrder,
          status: p.status,
          updatedAt: drizzleSql`NOW()`,
        }
      });
    }
    for (const prog of programsData) {
      await db.insert(educationProgramsTable).values(prog).onConflictDoUpdate({
        target: educationProgramsTable.id,
        set: {
          pathwayId: prog.pathwayId,
          nameEn: prog.nameEn,
          nameTe: prog.nameTe,
          displayOrder: prog.displayOrder,
          status: prog.status,
          updatedAt: drizzleSql`NOW()`,
        }
      });
    }
    console.log(`✅ Seeded ${pathwaysData.length} Pathways & ${programsData.length} Programs`);

    // 4. Assessment Questions & Career Rules
    const questionsData = loadJson('questions_final.json');
    const rulesData = loadJson('rules.json');

    // Streams
    const insertedStreams = [];
    for (const s of streamsData) {
      const [stream] = await db.insert(streamsTable).values(s).onConflictDoUpdate({
        target: streamsTable.code,
        set: { name: s.name, description: s.description }
      }).returning();
      insertedStreams.push(stream);
    }

    // Assessment Version (Published)
    let version = (await db.select().from(assessmentVersionsTable).where(eq(assessmentVersionsTable.status, 'PUBLISHED')))[0];
    if (!version) {
      [version] = await db.insert(assessmentVersionsTable).values({ status: 'PUBLISHED' }).returning();
    }

    // Assessment Questions
    const scoredOptions = [
      { value: 1, textEn: 'Strongly Dislike / Not Interested At All', textTe: 'పూర్తిగా ఇష్టం లేదు / ఆసక్తి లేదు' },
      { value: 2, textEn: 'Dislike / Slightly Uninterested', textTe: 'ఇష్టం లేదు / కొంచెం ఆసక్తి లేదు' },
      { value: 3, textEn: 'Neutral / Unsure', textTe: 'తటస్థం / కచ్చితంగా తెలియదు' },
      { value: 4, textEn: 'Like / Interested', textTe: 'ఇష్టం / ఆసక్తి ఉంది' },
      { value: 5, textEn: 'Strongly Like / Extremely Interested', textTe: 'చాలా ఇష్టం / బాగా ఆసక్తి ఉంది' },
    ];

    const ctxOptionsMap: Record<string, { value: number, textEn: string, textTe: string }[]> = {
      'CTX-01': [
        { value: 1, textEn: 'Mathematics (Algebra, Geometry, Trigonometry)', textTe: 'గణితం' },
        { value: 2, textEn: 'Physical Science (Physics, Chemistry)', textTe: 'భౌతిక శాస్త్రం' },
        { value: 3, textEn: 'Biological Science (Plants, Animals)', textTe: 'జీవ శాస్త్రం' },
        { value: 4, textEn: 'Social Studies (History, Economics, Civics)', textTe: 'సాంఘిక శాస్త్రం' },
        { value: 5, textEn: 'Languages and Literature', textTe: 'భాషలు' },
      ],
      'CTX-02': [
        { value: 1, textEn: 'Engineering / Technology', textTe: 'ఇంజనీరింగ్ / టెక్నాలజీ' },
        { value: 2, textEn: 'Medical / Healthcare', textTe: 'వైద్యం / ఆరోగ్యం' },
        { value: 3, textEn: 'Commerce / Business', textTe: 'కామర్స్ / వ్యాపారం' },
        { value: 4, textEn: 'Civil Services / Govt', textTe: 'సివిల్ సర్వీసెస్ / ప్రభుత్వ' },
        { value: 5, textEn: 'Whatever matches my interests', textTe: 'నా ఆసక్తికి తగినట్లు' },
        { value: 6, textEn: 'We have not discussed this yet', textTe: 'ఇంకా చర్చించలేదు' },
      ],
      'CTX-03': [
        { value: 1, textEn: 'Professional Bachelor’s degree (B.Tech, MBBS, etc.)', textTe: 'బ్యాచిలర్ డిగ్రీ' },
        { value: 2, textEn: 'Short 2-year or 3-year diploma to start earning', textTe: 'డిప్లొమా' },
        { value: 3, textEn: 'Advanced postgraduate study (Masters, CA, etc.)', textTe: 'పోస్ట్ గ్రాడ్యుయేట్ డిగ్రీ' },
        { value: 4, textEn: 'I am still exploring options', textTe: 'ఇంకా ఆలోచిస్తున్నాను' },
      ],
      'CTX-04': [
        { value: 1, textEn: 'Working at an indoor desk using a computer', textTe: 'కంప్యూటర్ తో పని' },
        { value: 2, textEn: 'Working actively in outdoor fields, nature', textTe: 'బయట పని' },
        { value: 3, textEn: 'Working in laboratories, hospitals', textTe: 'ల్యాబ్‌లు, ఆసుపత్రులు' },
        { value: 4, textEn: 'Moving around to interact with people', textTe: 'ప్రజలతో పరస్పర చర్య' },
      ]
    };

    for (const qData of questionsData) {
      // Find or insert question
      const existingQuestions = await db.select().from(questionsTable).where(eq(questionsTable.textEn, qData.englishStem.replace(/\0/g, '')));
      let question = existingQuestions[0];
      if (!question) {
        [question] = await db.insert(questionsTable).values({
          construct: qData.construct,
          type: qData.type,
          textEn: qData.englishStem.replace(/\0/g, ''),
          textTe: qData.teluguStem.replace(/\0/g, ''),
        }).returning();

        let options = scoredOptions;
        if (qData.type === 'CONTEXT' && ctxOptionsMap[qData.itemId]) {
          options = ctxOptionsMap[qData.itemId];
        }

        for (const opt of options) {
          await db.insert(questionOptionsTable).values({
            questionId: question.id,
            value: opt.value,
            textEn: opt.textEn,
            textTe: opt.textTe,
          });
        }
      }

      // Map to version
      await db.insert(assessmentVersionQuestionsTable).values({
        versionId: version.id,
        questionId: question.id,
        sequence: qData.pos,
      }).onConflictDoNothing();
    }

    // Career Ruleset
    let ruleset = (await db.select().from(careerRulesetsTable).where(eq(careerRulesetsTable.isDefault, true)))[0];
    if (!ruleset) {
      [ruleset] = await db.insert(careerRulesetsTable).values({
        status: 'PUBLISHED',
        isDefault: true,
      }).returning();

      for (const streamRules of rulesData) {
        const stream = insertedStreams.find(s => s.code.toUpperCase() === streamRules.streamCode.toUpperCase());
        if (!stream) continue;

        for (const rule of streamRules.rules) {
          await db.insert(careerRulesTable).values({
            rulesetId: ruleset.id,
            streamId: stream.id,
            dimensionName: rule.dimensionName,
            weight: rule.weight,
          });
        }
      }
    }
    console.log(`✅ Seeded Assessment Version & Career Rules`);

    // 5. Colleges
    for (const col of collegesData) {
      await db.insert(collegesTable).values(col as any).onConflictDoUpdate({
        target: collegesTable.id,
        set: {
          name: col.name,
          shortName: col.shortName,
          description: col.description,
          website: col.website,
          contactPhone: col.contactPhone,
          contactEmail: col.contactEmail,
          weeklyMenu: col.weeklyMenu,
          ownershipType: col.ownershipType,
          status: col.status,
          verificationStatus: col.verificationStatus,
          updatedAt: drizzleSql`NOW()`,
        }
      });
    }
    console.log(`✅ Seeded ${collegesData.length} Colleges`);

    // 6. Branches
    for (const br of branchesData) {
      await db.insert(branchesTable).values(br as any).onConflictDoUpdate({
        target: branchesTable.id,
        set: {
          collegeId: br.collegeId,
          name: br.name,
          locationId: br.locationId,
          address: br.address,
          type: br.type,
          contactPhone: br.contactPhone,
          contactEmail: br.contactEmail,
          facilities: br.facilities,
          routine: br.routine,
          hasBoysHostel: br.hasBoysHostel,
          hasGirlsHostel: br.hasGirlsHostel,
          annualHostelFee: br.annualHostelFee,
          isPubliclyEligible: br.isPubliclyEligible,
          updatedAt: drizzleSql`NOW()`,
        }
      });
    }
    console.log(`✅ Seeded ${branchesData.length} Branches`);

    // 7. Stream Offerings
    const seededBranchIds = branchesData.map(b => b.id);
    await db.execute(drizzleSql`DELETE FROM ${collegeStreamOfferingsTable} WHERE branch_id IN (${drizzleSql.join(seededBranchIds.map(id => drizzleSql`${id}`), drizzleSql`, `)})`);
    for (const off of offeringsData) {
      await db.insert(collegeStreamOfferingsTable).values(off);
    }
    console.log(`✅ Seeded ${offeringsData.length} Stream Offerings`);

    // 8. Leadership, Media, Achievements, Testimonials, Accreditations
    const seededCollegeIds = collegesData.map(c => c.id);
    await db.execute(drizzleSql`DELETE FROM ${collegeLeadershipTable} WHERE college_id IN (${drizzleSql.join(seededCollegeIds.map(id => drizzleSql`${id}`), drizzleSql`, `)})`);
    await db.execute(drizzleSql`DELETE FROM ${collegeMediaTable} WHERE college_id IN (${drizzleSql.join(seededCollegeIds.map(id => drizzleSql`${id}`), drizzleSql`, `)})`);
    await db.execute(drizzleSql`DELETE FROM ${collegeAchievementsTable} WHERE college_id IN (${drizzleSql.join(seededCollegeIds.map(id => drizzleSql`${id}`), drizzleSql`, `)})`);
    await db.execute(drizzleSql`DELETE FROM ${collegeTestimonialsTable} WHERE college_id IN (${drizzleSql.join(seededCollegeIds.map(id => drizzleSql`${id}`), drizzleSql`, `)})`);
    await db.execute(drizzleSql`DELETE FROM ${collegeAccreditationsTable} WHERE college_id IN (${drizzleSql.join(seededCollegeIds.map(id => drizzleSql`${id}`), drizzleSql`, `)})`);

    for (const l of leadershipData) await db.insert(collegeLeadershipTable).values(l);
    for (const m of mediaData) await db.insert(collegeMediaTable).values(m);
    for (const a of achievementsData) await db.insert(collegeAchievementsTable).values(a);
    for (const t of testimonialsData) await db.insert(collegeTestimonialsTable).values(t);
    for (const ac of accreditationsData) await db.insert(collegeAccreditationsTable).values(ac);
    console.log(`✅ Seeded Detail Sections: ${leadershipData.length} Leaders, ${mediaData.length} Media, ${achievementsData.length} Achievements, ${testimonialsData.length} Testimonials, ${accreditationsData.length} Accreditations`);

    // 9. Users & Staff Memberships
    for (const u of usersData) {
      await db.insert(usersTable).values(u as any).onConflictDoUpdate({
        target: usersTable.id,
        set: {
          email: u.email,
          phoneNumber: u.phoneNumber,
          role: u.role,
          passwordHash: u.passwordHash,
          updatedAt: drizzleSql`NOW()`,
        }
      });
    }
    for (const sm of staffMembershipsData) {
      await db.insert(staffMembershipsTable).values(sm).onConflictDoUpdate({
        target: staffMembershipsTable.id,
        set: {
          userId: sm.userId,
          collegeId: sm.collegeId,
          role: sm.role,
          status: sm.status,
          updatedAt: drizzleSql`NOW()`,
        }
      });
    }
    console.log(`✅ Seeded ${usersData.length} Users & ${staffMembershipsData.length} Staff Membership`);

    // 10. Student Profile, Intent & Lead
    await db.insert(studentsTable).values(studentProfileData).onConflictDoUpdate({
      target: studentsTable.userId,
      set: {
        fullName: studentProfileData.fullName,
        educationStage: studentProfileData.educationStage,
        board: studentProfileData.board,
        residenceLocationId: studentProfileData.residenceLocationId,
        schoolId: studentProfileData.schoolId,
        pincode: studentProfileData.pincode,
        landmark: studentProfileData.landmark,
        guardianName: studentProfileData.guardianName,
        guardianPhone: studentProfileData.guardianPhone,
        gender: studentProfileData.gender,
        updatedAt: drizzleSql`NOW()`,
      }
    });

    await db.insert(studentCollegeIntentsTable).values(studentIntentData).onConflictDoUpdate({
      target: studentCollegeIntentsTable.id,
      set: {
        pathwayCode: studentIntentData.pathwayCode,
        programCode: studentIntentData.programCode,
        preferredLocationId: studentIntentData.preferredLocationId,
        requiresHostel: studentIntentData.requiresHostel,
        maxAnnualFee: studentIntentData.maxAnnualFee,
        status: studentIntentData.status,
        updatedAt: drizzleSql`NOW()`,
      }
    });

    await db.insert(leadsTable).values(studentLeadData).onConflictDoUpdate({
      target: leadsTable.id,
      set: {
        studentId: studentLeadData.studentId,
        collegeId: studentLeadData.collegeId,
        branchId: studentLeadData.branchId,
        streamCode: studentLeadData.streamCode,
        intentId: studentLeadData.intentId,
        source: studentLeadData.source,
        status: studentLeadData.status,
        updatedAt: drizzleSql`NOW()`,
      }
    });

    console.log(`✅ Seeded Student Profile, Intent & Lead`);
    console.log('\n=================================================================');
    console.log('🎉 Development Seed Completed Successfully!');
    console.log('=================================================================');
    console.log('Test Credentials:');
    console.log('  - Company Admin : admin@naaguru.in / Password@123');
    console.log('  - College Admin : staff@chodavaramjc.dev / Password@123');
    console.log('  - Pre-seeded Student : Phone +919999900001 (Profile complete, MPC in Chodavaram)');
    console.log('  - Clean Test Student : Phone +919999900002 (Fresh onboarding flow)');
    console.log('=================================================================\n');

  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
    process.exit(1);
  } finally {
    await sqlClient.end();
  }
}

main();

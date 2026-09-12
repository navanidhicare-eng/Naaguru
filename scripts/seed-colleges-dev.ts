/**
 * DEVELOPMENT FIXTURE ONLY — DO NOT USE IN PRODUCTION
 * 
 * Seeds a minimal set of sample junior colleges for local UI development and testing
 * of the Browse Colleges flow.
 */
import 'dotenv/config';
import { db } from '../src/shared/database/db';
import { collegesTable, collegeStreamOfferingsTable } from '../src/modules/college/infrastructure/schema';
import { eq } from 'drizzle-orm';

const DEV_COLLEGES = [
  {
    name: 'Sri Chaitanya Junior College',
    shortName: 'Sri Chaitanya',
    description: 'Premier intermediate education institution focusing on academic streams and competitive exams.',
    website: 'https://srichaitanya.net',
    contactPhone: '+91 891 270 0001',
    contactEmail: 'admissions@srichaitanya.dev',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    city: 'Visakhapatnam',
    address: 'Dwaraka Nagar, Main Road, Visakhapatnam, Andhra Pradesh 530016',
    hasBoysHostel: true,
    hasGirlsHostel: true,
    annualHostelFee: 75000,
    ownershipType: 'PRIVATE',
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    streams: [
      { streamCode: 'MPC', tuitionFee: 65000 },
      { streamCode: 'BIPC', tuitionFee: 68000 },
      { streamCode: 'MEC', tuitionFee: 50000 },
    ],
  },
  {
    name: 'Narayana Junior College',
    shortName: 'Narayana',
    description: 'Comprehensive junior college with specialized academic preparation and hostel facilities.',
    website: 'https://narayanagroup.com',
    contactPhone: '+91 866 240 0002',
    contactEmail: 'info@narayana.dev',
    state: 'Andhra Pradesh',
    district: 'Krishna',
    city: 'Vijayawada',
    address: 'Benz Circle, MG Road, Vijayawada, Andhra Pradesh 520010',
    hasBoysHostel: true,
    hasGirlsHostel: true,
    annualHostelFee: 80000,
    ownershipType: 'PRIVATE',
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    streams: [
      { streamCode: 'MPC', tuitionFee: 70000 },
      { streamCode: 'BIPC', tuitionFee: 72000 },
      { streamCode: 'CEC', tuitionFee: 48000 },
    ],
  },
  {
    name: 'Government Junior College for Boys',
    shortName: 'GJC Visakhapatnam',
    description: 'Affordable state government junior college offering full Intermediate streams.',
    website: 'https://bie.ap.gov.in',
    contactPhone: '+91 891 255 1234',
    contactEmail: 'gjc.vsp@apgov.dev',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    city: 'Visakhapatnam',
    address: 'Near Old Bus Stand, Visakhapatnam, Andhra Pradesh 530001',
    hasBoysHostel: false,
    hasGirlsHostel: false,
    annualHostelFee: null,
    ownershipType: 'GOVERNMENT',
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    streams: [
      { streamCode: 'MPC', tuitionFee: 3500 },
      { streamCode: 'BIPC', tuitionFee: 3500 },
      { streamCode: 'CEC', tuitionFee: 3000 },
      { streamCode: 'MEC', tuitionFee: 3000 },
    ],
  },
  {
    name: 'Pragati Mahavidyalaya Junior College',
    shortName: 'Pragati College',
    description: 'Dedicated commerce and science junior college located in central Hyderabad.',
    website: 'https://pragati.dev',
    contactPhone: '+91 40 2474 1234',
    contactEmail: 'contact@pragati.dev',
    state: 'Telangana',
    district: 'Hyderabad',
    city: 'Hyderabad',
    address: 'Koti, Hyderabad, Telangana 500095',
    hasBoysHostel: false,
    hasGirlsHostel: true,
    annualHostelFee: 60000,
    ownershipType: 'PRIVATE',
    status: 'ACTIVE',
    verificationStatus: 'VERIFIED',
    streams: [
      { streamCode: 'CEC', tuitionFee: 42000 },
      { streamCode: 'MEC', tuitionFee: 45000 },
      { streamCode: 'MPC', tuitionFee: 55000 },
    ],
  },
];

async function seedDevColleges() {
  console.log('--- SEEDING DEV FIXTURE COLLEGES ---');
  for (const c of DEV_COLLEGES) {
    const { streams, ...collegeData } = c;
    const existing = await db.select().from(collegesTable).where(eq(collegesTable.name, collegeData.name));
    let collegeId = existing[0]?.id;

    if (!collegeId) {
      const [inserted] = await db.insert(collegesTable).values(collegeData).returning();
      collegeId = inserted.id;
      console.log(`Inserted College: ${collegeData.name} (${collegeId})`);
    } else {
      console.log(`College already exists: ${collegeData.name}`);
    }

    for (const stream of streams) {
      const existingOffering = await db.select()
        .from(collegeStreamOfferingsTable)
        .where(eq(collegeStreamOfferingsTable.collegeId, collegeId));
      
      const alreadyHasStream = existingOffering.some(o => o.streamCode === stream.streamCode);
      if (!alreadyHasStream) {
        await db.insert(collegeStreamOfferingsTable).values({
          collegeId,
          streamCode: stream.streamCode,
          tuitionFee: stream.tuitionFee,
        });
        console.log(`  Added stream ${stream.streamCode} (₹${stream.tuitionFee}) to ${collegeData.shortName}`);
      }
    }
  }
  console.log('Dev fixture seeding complete.');
  process.exit(0);
}

seedDevColleges().catch(err => {
  console.error('Failed to seed dev colleges:', err);
  process.exit(1);
});

import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { educationPathwaysTable, educationProgramsTable, locationsTable, schoolsTable } from '../src/shared/catalog/infrastructure/schema';
import { sql as drizzleSql } from 'drizzle-orm';

async function seedCatalog() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set in the environment variables.');
    process.exit(1);
  }

  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  try {
    console.log('Seeding Catalog Data...');

    // 1. Pathways
    const pathways = [
      { code: 'INTERMEDIATE', nameEn: 'Intermediate', nameTe: 'ఇంటర్మీడియట్', icon: '🎓', displayOrder: 1, status: 'ACTIVE' as const },
      { code: 'POLYTECHNIC', nameEn: 'Polytechnic', nameTe: 'పాలిటెక్నిక్', icon: '🔧', displayOrder: 2, status: 'COMING_SOON' as const },
      { code: 'ITI', nameEn: 'ITI Trades', nameTe: 'ఐటిఐ ట్రేడ్స్', icon: '🛠', displayOrder: 3, status: 'COMING_SOON' as const },
      { code: 'DEFENCE', nameEn: 'Defence & Service', nameTe: 'డిఫెన్స్ & సర్వీస్', icon: '🛡', displayOrder: 4, status: 'COMING_SOON' as const },
    ];

    const insertedPathways = await db.insert(educationPathwaysTable)
      .values(pathways)
      .onConflictDoUpdate({
        target: educationPathwaysTable.code,
        set: {
          nameEn: drizzleSql`EXCLUDED.name_en`,
          nameTe: drizzleSql`EXCLUDED.name_te`,
          icon: drizzleSql`EXCLUDED.icon`,
          displayOrder: drizzleSql`EXCLUDED.display_order`,
          status: drizzleSql`EXCLUDED.status`,
        }
      })
      .returning({ id: educationPathwaysTable.id, code: educationPathwaysTable.code });
      
    console.log('✅ Seeded Pathways');

    // 2. Programs (Intermediate only for V1)
    const intermediateId = insertedPathways.find(p => p.code === 'INTERMEDIATE')?.id;
    if (intermediateId) {
      const programs = [
        { pathwayId: intermediateId, code: 'MPC', nameEn: 'MPC (Maths, Physics, Chemistry)', nameTe: 'MPC (గణితం, భౌతిక, రసాయన)', displayOrder: 1, status: 'ACTIVE' as const },
        { pathwayId: intermediateId, code: 'BIPC', nameEn: 'BiPC (Biology, Physics, Chemistry)', nameTe: 'BiPC (జీవ, భౌతిక, రసాయన)', displayOrder: 2, status: 'ACTIVE' as const },
        { pathwayId: intermediateId, code: 'MEC', nameEn: 'MEC (Maths, Economics, Commerce)', nameTe: 'MEC (గణితం, అర్థ, కామర్స్)', displayOrder: 3, status: 'ACTIVE' as const },
        { pathwayId: intermediateId, code: 'CEC', nameEn: 'CEC (Commerce, Economics, Civics)', nameTe: 'CEC (కామర్స్, అర్థ, పౌరనీతి)', displayOrder: 4, status: 'ACTIVE' as const },
      ];

      await db.insert(educationProgramsTable)
        .values(programs)
        .onConflictDoUpdate({
          target: [educationProgramsTable.pathwayId, educationProgramsTable.code],
          set: {
            nameEn: drizzleSql`EXCLUDED.name_en`,
            nameTe: drizzleSql`EXCLUDED.name_te`,
            displayOrder: drizzleSql`EXCLUDED.display_order`,
            status: drizzleSql`EXCLUDED.status`,
          }
        });
        
      console.log('✅ Seeded Programs for Intermediate');
    }

    // 3. Locations (Hierarchical V1)
    console.log('Seeding Locations...');
    // STATE: Andhra Pradesh
    const [ap] = await db.insert(locationsTable).values({
      type: 'STATE', nameEn: 'Andhra Pradesh', nameTe: 'ఆంధ్రప్రదేశ్', status: 'ACTIVE'
    }).onConflictDoUpdate({
      target: [locationsTable.parentId, locationsTable.nameEn],
      set: { nameTe: 'ఆంధ్రప్రదేశ్', status: 'ACTIVE' }
    }).returning({ id: locationsTable.id });

    // DISTRICTS
    const districtsData = [
      { parentId: ap.id, type: 'DISTRICT' as const, nameEn: 'Visakhapatnam', nameTe: 'విశాఖపట్నం', status: 'ACTIVE' as const },
      { parentId: ap.id, type: 'DISTRICT' as const, nameEn: 'Guntur', nameTe: 'గుంటూరు', status: 'ACTIVE' as const },
      { parentId: ap.id, type: 'DISTRICT' as const, nameEn: 'Krishna', nameTe: 'కృష్ణా', status: 'ACTIVE' as const },
    ];
    const districts = await db.insert(locationsTable).values(districtsData).onConflictDoUpdate({
      target: [locationsTable.parentId, locationsTable.nameEn],
      set: { nameTe: drizzleSql`EXCLUDED.name_te`, status: drizzleSql`EXCLUDED.status` }
    }).returning({ id: locationsTable.id, nameEn: locationsTable.nameEn });

    const vizagId = districts.find(d => d.nameEn === 'Visakhapatnam')!.id;

    // MANDALS
    const mandalsData = [
      { parentId: vizagId, type: 'MANDAL' as const, nameEn: 'Anandapuram', nameTe: 'ఆనందపురం', status: 'ACTIVE' as const },
      { parentId: vizagId, type: 'MANDAL' as const, nameEn: 'Gajuwaka', nameTe: 'గాజువాక', status: 'ACTIVE' as const },
      { parentId: vizagId, type: 'MANDAL' as const, nameEn: 'Bheemunipatnam', nameTe: 'భీమునిపట్నం', status: 'ACTIVE' as const },
      { parentId: vizagId, type: 'MANDAL' as const, nameEn: 'Pendurthi', nameTe: 'పెందుర్తి', status: 'ACTIVE' as const },
      { parentId: vizagId, type: 'MANDAL' as const, nameEn: 'Sabbavaram', nameTe: 'సబ్బవరం', status: 'ACTIVE' as const },
      { parentId: vizagId, type: 'MANDAL' as const, nameEn: 'Anakapalle', nameTe: 'అనకాపల్లి', status: 'ACTIVE' as const },
      { parentId: vizagId, type: 'MANDAL' as const, nameEn: 'Narsipatnam', nameTe: 'నర్సీపట్నం', status: 'ACTIVE' as const },
    ];
    const mandals = await db.insert(locationsTable).values(mandalsData).onConflictDoUpdate({
      target: [locationsTable.parentId, locationsTable.nameEn],
      set: { nameTe: drizzleSql`EXCLUDED.name_te`, status: drizzleSql`EXCLUDED.status` }
    }).returning({ id: locationsTable.id, nameEn: locationsTable.nameEn });

    const anandapuramId = mandals.find(m => m.nameEn === 'Anandapuram')!.id;
    const gajuwakaId = mandals.find(m => m.nameEn === 'Gajuwaka')!.id;
    const bheemunipatnamId = mandals.find(m => m.nameEn === 'Bheemunipatnam')!.id;

    // LOCALITIES
    const localitiesData = [
      { parentId: anandapuramId, type: 'LOCALITY' as const, nameEn: 'Demo Locality A', nameTe: 'డెమో లోకాలిటీ ఏ', status: 'ACTIVE' as const },
      { parentId: anandapuramId, type: 'LOCALITY' as const, nameEn: 'Demo Locality B', nameTe: 'డెమో లోకాలిటీ బి', status: 'ACTIVE' as const },
      { parentId: anandapuramId, type: 'LOCALITY' as const, nameEn: 'Anandapuram Town', nameTe: 'ఆనందపురం టౌన్', status: 'ACTIVE' as const },
      { parentId: anandapuramId, type: 'LOCALITY' as const, nameEn: 'Gambheeram', nameTe: 'గంభీరం', status: 'ACTIVE' as const },
      { parentId: anandapuramId, type: 'LOCALITY' as const, nameEn: 'Sontyam', nameTe: 'సొంటియం', status: 'ACTIVE' as const },
      { parentId: anandapuramId, type: 'LOCALITY' as const, nameEn: 'Vellanki', nameTe: 'వెల్లంకి', status: 'ACTIVE' as const },
      { parentId: anandapuramId, type: 'LOCALITY' as const, nameEn: 'Bheemali', nameTe: 'భీమాలి', status: 'ACTIVE' as const },
      
      { parentId: gajuwakaId, type: 'LOCALITY' as const, nameEn: 'Old Gajuwaka', nameTe: 'పాత గాజువాక', status: 'ACTIVE' as const },
      { parentId: gajuwakaId, type: 'LOCALITY' as const, nameEn: 'New Gajuwaka', nameTe: 'కొత్త గాజువాక', status: 'ACTIVE' as const },
      { parentId: gajuwakaId, type: 'LOCALITY' as const, nameEn: 'Sri Nagar', nameTe: 'శ్రీ నగర్', status: 'ACTIVE' as const },
      
      { parentId: bheemunipatnamId, type: 'LOCALITY' as const, nameEn: 'Bheemili Town', nameTe: 'భీమిలి టౌన్', status: 'ACTIVE' as const },
      { parentId: bheemunipatnamId, type: 'LOCALITY' as const, nameEn: 'Thotlakonda', nameTe: 'తొట్లకొండ', status: 'ACTIVE' as const },
    ];
    const localities = await db.insert(locationsTable).values(localitiesData).onConflictDoUpdate({
      target: [locationsTable.parentId, locationsTable.nameEn],
      set: { nameTe: drizzleSql`EXCLUDED.name_te`, status: drizzleSql`EXCLUDED.status` }
    }).returning({ id: locationsTable.id, nameEn: locationsTable.nameEn });

    console.log('✅ Seeded Hierarchical Locations');

    // 4. Schools
    const localityA_Id = localities.find(l => l.nameEn === 'Demo Locality A')!.id;
    const schoolsData = [
      { locationId: localityA_Id, nameEn: 'Demo High School A', nameTe: 'డెమో హై స్కూల్ ఏ', partnershipStatus: 'PARTNER', status: 'ACTIVE' as const },
      { locationId: anandapuramId, nameEn: 'Anandapuram ZP High School', nameTe: 'ఆనందపురం జెడ్.పి. హై స్కూల్', partnershipStatus: 'NONE', status: 'ACTIVE' as const },
    ];
    
    await db.insert(schoolsTable).values(schoolsData).onConflictDoUpdate({
      target: [schoolsTable.locationId, schoolsTable.nameEn],
      set: { nameTe: drizzleSql`EXCLUDED.name_te`, partnershipStatus: drizzleSql`EXCLUDED.partnership_status`, status: drizzleSql`EXCLUDED.status` }
    });

    console.log('✅ Seeded Partner Schools');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await sql.end();
  }
}

seedCatalog();

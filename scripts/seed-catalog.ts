import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { educationPathwaysTable, educationProgramsTable, serviceAreasTable } from '../src/shared/catalog/infrastructure/schema';
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

    // 3. Service Areas (District level for V1)
    const areas = [
      { state: 'Andhra Pradesh', district: 'Visakhapatnam', displayNameEn: 'Visakhapatnam', displayNameTe: 'విశాఖపట్నం', displayOrder: 1, status: 'ACTIVE' as const },
      { state: 'Andhra Pradesh', district: 'Krishna', displayNameEn: 'Krishna', displayNameTe: 'కృష్ణా', displayOrder: 2, status: 'ACTIVE' as const },
      { state: 'Andhra Pradesh', district: 'Guntur', displayNameEn: 'Guntur', displayNameTe: 'గుంటూరు', displayOrder: 3, status: 'ACTIVE' as const },
      { state: 'Andhra Pradesh', district: 'East Godavari', displayNameEn: 'East Godavari', displayNameTe: 'తూర్పు గోదావరి', displayOrder: 4, status: 'ACTIVE' as const },
      { state: 'Andhra Pradesh', district: 'West Godavari', displayNameEn: 'West Godavari', displayNameTe: 'పశ్చిమ గోదావరి', displayOrder: 5, status: 'ACTIVE' as const },
      { state: 'Telangana', district: 'Hyderabad', displayNameEn: 'Hyderabad', displayNameTe: 'హైదరాబాద్', displayOrder: 6, status: 'ACTIVE' as const },
      { state: 'Telangana', district: 'Rangareddy', displayNameEn: 'Rangareddy', displayNameTe: 'రంగారెడ్డి', displayOrder: 7, status: 'ACTIVE' as const },
    ];

    await db.insert(serviceAreasTable)
      .values(areas)
      .onConflictDoUpdate({
        target: [serviceAreasTable.state, serviceAreasTable.district],
        set: {
          displayNameEn: drizzleSql`EXCLUDED.display_name_en`,
          displayNameTe: drizzleSql`EXCLUDED.display_name_te`,
          displayOrder: drizzleSql`EXCLUDED.display_order`,
          status: drizzleSql`EXCLUDED.status`,
        }
      });
      
    console.log('✅ Seeded Service Areas');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await sql.end();
  }
}

seedCatalog();

import { eq, inArray, and, ne } from 'drizzle-orm';
import { db } from '../../database/db';
import { educationPathwaysTable, educationProgramsTable, serviceAreasTable } from './schema';
import { Pathway, Program, ServiceArea } from '../domain/models';

export class DrizzleCatalogRepository {
  async getStudentVisiblePathways(): Promise<Pathway[]> {
    const rows = await db
      .select()
      .from(educationPathwaysTable)
      .where(ne(educationPathwaysTable.status, 'INACTIVE'))
      .orderBy(educationPathwaysTable.displayOrder);

    return rows.map(r => Pathway.create({
      id: r.id,
      code: r.code,
      nameEn: r.nameEn,
      nameTe: r.nameTe,
      icon: r.icon,
      displayOrder: r.displayOrder,
      status: r.status as 'ACTIVE' | 'COMING_SOON',
    }));
  }

  async getActiveProgramsForPathways(pathwayIds: string[]): Promise<Program[]> {
    if (pathwayIds.length === 0) return [];

    const rows = await db
      .select()
      .from(educationProgramsTable)
      .where(
        and(
          inArray(educationProgramsTable.pathwayId, pathwayIds),
          eq(educationProgramsTable.status, 'ACTIVE')
        )
      )
      .orderBy(educationProgramsTable.displayOrder);

    return rows.map(r => Program.create({
      id: r.id,
      pathwayId: r.pathwayId,
      code: r.code,
      nameEn: r.nameEn,
      nameTe: r.nameTe,
      displayOrder: r.displayOrder,
      status: r.status as 'ACTIVE',
    }));
  }

  async getActiveAreas(): Promise<ServiceArea[]> {
    const rows = await db
      .select()
      .from(serviceAreasTable)
      .where(eq(serviceAreasTable.status, 'ACTIVE'))
      .orderBy(serviceAreasTable.displayOrder);

    return rows.map(r => ServiceArea.create({
      id: r.id,
      state: r.state,
      district: r.district,
      displayNameEn: r.displayNameEn,
      displayNameTe: r.displayNameTe,
      displayOrder: r.displayOrder,
      status: r.status as 'ACTIVE',
    }));
  }

  async getPathwayByCode(code: string): Promise<Pathway | null> {
    const rows = await db
      .select()
      .from(educationPathwaysTable)
      .where(eq(educationPathwaysTable.code, code))
      .limit(1);

    if (rows.length === 0) return null;
    const r = rows[0];
    return Pathway.create({
      id: r.id,
      code: r.code,
      nameEn: r.nameEn,
      nameTe: r.nameTe,
      icon: r.icon,
      displayOrder: r.displayOrder,
      status: r.status as 'ACTIVE' | 'COMING_SOON' | 'INACTIVE',
    });
  }

  async getProgramByCode(pathwayId: string, code: string): Promise<Program | null> {
    const rows = await db
      .select()
      .from(educationProgramsTable)
      .where(
        and(
          eq(educationProgramsTable.pathwayId, pathwayId),
          eq(educationProgramsTable.code, code)
        )
      )
      .limit(1);

    if (rows.length === 0) return null;
    const r = rows[0];
    return Program.create({
      id: r.id,
      pathwayId: r.pathwayId,
      code: r.code,
      nameEn: r.nameEn,
      nameTe: r.nameTe,
      displayOrder: r.displayOrder,
      status: r.status as 'ACTIVE' | 'COMING_SOON' | 'INACTIVE',
    });
  }
  
  async getAreaById(id: string): Promise<ServiceArea | null> {
    const rows = await db
      .select()
      .from(serviceAreasTable)
      .where(eq(serviceAreasTable.id, id))
      .limit(1);

    if (rows.length === 0) return null;
    const r = rows[0];
    return ServiceArea.create({
      id: r.id,
      state: r.state,
      district: r.district,
      displayNameEn: r.displayNameEn,
      displayNameTe: r.displayNameTe,
      displayOrder: r.displayOrder,
      status: r.status as 'ACTIVE' | 'COMING_SOON' | 'INACTIVE',
    });
  }
}

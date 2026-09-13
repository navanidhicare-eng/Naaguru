import { eq, inArray, and, ne } from 'drizzle-orm';
import { db } from '../../database/db';
import { educationPathwaysTable, educationProgramsTable, locationsTable, schoolsTable } from './schema';
import { Pathway, Program, ServiceArea, Location, School } from '../domain/models';

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
    // API backward compatibility alias: maps DISTRICT locations to ServiceArea shape
    const rows = await db
      .select({
        id: locationsTable.id,
        state: locationsTable.nameEn, // Approximation (it should actually join parent, but this is an alias)
        district: locationsTable.nameEn,
        displayNameEn: locationsTable.nameEn,
        displayNameTe: locationsTable.nameTe,
        status: locationsTable.status
      })
      .from(locationsTable)
      .where(and(eq(locationsTable.status, 'ACTIVE'), eq(locationsTable.type, 'DISTRICT')))
      .orderBy(locationsTable.nameEn);

    return rows.map(r => ServiceArea.create({
      id: r.id,
      state: 'Andhra Pradesh', // Fallback for alias
      district: r.district,
      displayNameEn: r.displayNameEn,
      displayNameTe: r.displayNameTe,
      displayOrder: 0,
      status: r.status as 'ACTIVE',
    }));
  }

  async getActiveLocations(type?: 'STATE' | 'DISTRICT' | 'MANDAL' | 'LOCALITY', parentId?: string): Promise<Location[]> {
    const conditions = [eq(locationsTable.status, 'ACTIVE')];
    if (type) conditions.push(eq(locationsTable.type, type));
    if (parentId !== undefined) {
       if (parentId === null) {
          // not supported via drizzle easily but parentId isn't null typically when queried
       } else {
          conditions.push(eq(locationsTable.parentId, parentId));
       }
    }

    const rows = await db
      .select()
      .from(locationsTable)
      .where(and(...conditions))
      .orderBy(locationsTable.nameEn);

    return rows.map(r => Location.create({
      id: r.id,
      parentId: r.parentId,
      type: r.type,
      nameEn: r.nameEn,
      nameTe: r.nameTe,
      code: r.code,
      status: r.status as 'ACTIVE',
      latitude: r.latitude ? Number(r.latitude) : null,
      longitude: r.longitude ? Number(r.longitude) : null,
    }));
  }

  async getActiveSchools(locationId?: string): Promise<School[]> {
    const conditions = [eq(schoolsTable.status, 'ACTIVE')];
    if (locationId) conditions.push(eq(schoolsTable.locationId, locationId));

    const rows = await db
      .select()
      .from(schoolsTable)
      .where(and(...conditions))
      .orderBy(schoolsTable.nameEn);

    return rows.map(r => School.create({
      id: r.id,
      locationId: r.locationId,
      nameEn: r.nameEn,
      nameTe: r.nameTe,
      partnershipStatus: r.partnershipStatus,
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
    const location = await this.getLocationById(id);
    if (!location) return null;
    return ServiceArea.create({
      id: location.props.id,
      state: 'Andhra Pradesh',
      district: location.props.nameEn,
      displayNameEn: location.props.nameEn,
      displayNameTe: location.props.nameTe,
      displayOrder: 0,
      status: location.props.status,
    });
  }

  async getLocationById(id: string): Promise<Location | null> {
    const rows = await db
      .select()
      .from(locationsTable)
      .where(eq(locationsTable.id, id))
      .limit(1);

    if (rows.length === 0) return null;
    const r = rows[0];
    return Location.create({
      id: r.id,
      parentId: r.parentId,
      type: r.type,
      nameEn: r.nameEn,
      nameTe: r.nameTe,
      code: r.code,
      status: r.status as 'ACTIVE',
      latitude: r.latitude ? Number(r.latitude) : null,
      longitude: r.longitude ? Number(r.longitude) : null,
    });
  }

  async getSchoolById(id: string): Promise<School | null> {
    const rows = await db
      .select()
      .from(schoolsTable)
      .where(eq(schoolsTable.id, id))
      .limit(1);

    if (rows.length === 0) return null;
    const r = rows[0];
    return School.create({
      id: r.id,
      locationId: r.locationId,
      nameEn: r.nameEn,
      nameTe: r.nameTe,
      partnershipStatus: r.partnershipStatus,
      status: r.status as 'ACTIVE',
    });
  }
}

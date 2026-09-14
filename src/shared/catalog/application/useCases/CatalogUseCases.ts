import { DrizzleCatalogRepository } from '../../infrastructure/DrizzleCatalogRepository';
import { PathwayDto, ProgramDto, ServiceAreaDto, LocationDto, SchoolDto } from '../dtos';
import { LocationType } from '../../domain/models';
import { AppError } from '../../../errors';

export class CatalogUseCases {
  constructor(private readonly catalogRepository: DrizzleCatalogRepository) {}

  async getStudentVisiblePathways(): Promise<PathwayDto[]> {
    const pathways = await this.catalogRepository.getStudentVisiblePathways();
    const pathwayIds = pathways.map(p => p.props.id);
    const programs = await this.catalogRepository.getActiveProgramsForPathways(pathwayIds);

    return pathways.map(p => ({
      id: p.props.id,
      code: p.props.code,
      nameEn: p.props.nameEn,
      nameTe: p.props.nameTe,
      icon: p.props.icon,
      status: p.props.status,
      displayOrder: p.props.displayOrder,
      programs: programs
        .filter(prog => prog.props.pathwayId === p.props.id)
        .map(prog => ({
          id: prog.props.id,
          code: prog.props.code,
          nameEn: prog.props.nameEn,
          nameTe: prog.props.nameTe,
          displayOrder: prog.props.displayOrder,
          status: prog.props.status,
        })),
    }));
  }

  async getStudentVisibleAreas(): Promise<ServiceAreaDto[]> {
    const areas = await this.catalogRepository.getActiveAreas();
    return areas.map(a => ({
      id: a.props.id,
      state: a.props.state,
      district: a.props.district,
      displayNameEn: a.props.displayNameEn,
      displayNameTe: a.props.displayNameTe,
      displayOrder: a.props.displayOrder,
    }));
  }

  async validatePathway(code: string): Promise<boolean> {
    const pathway = await this.catalogRepository.getPathwayByCode(code);
    return pathway !== null && pathway.props.status === 'ACTIVE';
  }

  async validateProgram(pathwayCode: string, programCode: string): Promise<boolean> {
    const pathway = await this.catalogRepository.getPathwayByCode(pathwayCode);
    if (!pathway || pathway.props.status !== 'ACTIVE') return false;

    const program = await this.catalogRepository.getProgramByCode(pathway.props.id, programCode);
    return program !== null && program.props.status === 'ACTIVE';
  }

  async validateArea(id: string): Promise<boolean> {
    const area = await this.catalogRepository.getLocationById(id);
    return area !== null && area.props.status === 'ACTIVE';
  }

  async validateSchool(id: string): Promise<boolean> {
    const school = await this.catalogRepository.getSchoolById(id);
    return school !== null && school.props.status === 'ACTIVE' && school.props.partnershipStatus === 'PARTNER';
  }

  async getStudentVisibleLocations(type?: LocationType, parentId?: string): Promise<LocationDto[]> {
    if (parentId) {
      const parent = await this.catalogRepository.getLocationById(parentId);
      if (!parent) {
        throw new AppError('Parent location not found', 404);
      }
      if (parent.props.status !== 'ACTIVE') {
        throw new AppError('Parent location is inactive', 400);
      }
      
      if (type) {
        const validParentTypeMap: Record<LocationType, LocationType | null> = {
          STATE: null,
          DISTRICT: 'STATE',
          MANDAL: 'DISTRICT',
          LOCALITY: 'MANDAL'
        };
        
        if (validParentTypeMap[type] !== parent.props.type) {
          throw new AppError(`Invalid hierarchy: ${type} cannot belong directly to a ${parent.props.type}`, 400);
        }
      }
    } else if (type && type !== 'STATE') {
       // if no parent is provided, only STATE is allowed to be queried without a parent.
       // Although wait, if parentId is not provided, does it mean we fetch all districts globally?
       // The prompt says: "No parentId + type=STATE -> active states. type=DISTRICT + parentId -> active districts".
       // So we should enforce parentId for non-STATE.
       throw new AppError(`parentId is required when fetching ${type}`, 400);
    }

    const locations = await this.catalogRepository.getActiveLocations(type, parentId);
    return locations.map(l => ({
      id: l.props.id,
      parentId: l.props.parentId,
      type: l.props.type,
      nameEn: l.props.nameEn,
      nameTe: l.props.nameTe,
      code: l.props.code,
      status: l.props.status,
    }));
  }

  async getPartnerSchools(locationId?: string, search?: string): Promise<SchoolDto[]> {
    const schools = await this.catalogRepository.getActiveSchools(locationId, search);
    return schools.map(s => ({
      id: s.props.id,
      locationId: s.props.locationId,
      nameEn: s.props.nameEn,
      nameTe: s.props.nameTe,
      partnershipStatus: s.props.partnershipStatus,
    }));
  }
}

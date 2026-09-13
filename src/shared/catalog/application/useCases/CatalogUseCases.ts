import { DrizzleCatalogRepository } from '../../infrastructure/DrizzleCatalogRepository';
import { PathwayDto, ProgramDto, ServiceAreaDto, LocationDto, SchoolDto } from '../dtos';
import { LocationType } from '../../domain/models';

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

  async getStudentVisibleLocations(type?: LocationType, parentId?: string): Promise<LocationDto[]> {
    const locations = await this.catalogRepository.getActiveLocations(type, parentId);
    return locations.map(l => ({
      id: l.props.id,
      parentId: l.props.parentId,
      type: l.props.type,
      nameEn: l.props.nameEn,
      nameTe: l.props.nameTe,
      code: l.props.code,
    }));
  }

  async getPartnerSchools(locationId?: string): Promise<SchoolDto[]> {
    const schools = await this.catalogRepository.getActiveSchools(locationId);
    return schools.map(s => ({
      id: s.props.id,
      locationId: s.props.locationId,
      nameEn: s.props.nameEn,
      nameTe: s.props.nameTe,
      partnershipStatus: s.props.partnershipStatus,
    }));
  }
}

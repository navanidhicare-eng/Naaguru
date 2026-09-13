import { DrizzleCatalogRepository } from '../../infrastructure/DrizzleCatalogRepository';
import { PathwayDto, ProgramDto, ServiceAreaDto } from '../dtos';

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
    const area = await this.catalogRepository.getAreaById(id);
    return area !== null && area.props.status === 'ACTIVE';
  }
}

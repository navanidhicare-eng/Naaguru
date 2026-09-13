import { DrizzleCatalogRepository } from './infrastructure/DrizzleCatalogRepository';
import { CatalogUseCases } from './application/useCases/CatalogUseCases';

const catalogRepository = new DrizzleCatalogRepository();
const catalogUseCases = new CatalogUseCases(catalogRepository);

export const CatalogModule = {
  getStudentVisiblePathways: () => catalogUseCases.getStudentVisiblePathways(),
  getStudentVisibleAreas: () => catalogUseCases.getStudentVisibleAreas(),
  getStudentVisibleLocations: (type?: any, parentId?: string) => catalogUseCases.getStudentVisibleLocations(type, parentId),
  getPartnerSchools: (locationId?: string) => catalogUseCases.getPartnerSchools(locationId),
  
  // Validation methods used by other modules (e.g., student module)
  validatePathway: (code: string) => catalogUseCases.validatePathway(code),
  validateProgram: (pathwayCode: string, programCode: string) => catalogUseCases.validateProgram(pathwayCode, programCode),
  validateArea: (id: string) => catalogUseCases.validateArea(id),
};

export * from './application/dtos';

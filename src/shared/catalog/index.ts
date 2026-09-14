import { DrizzleCatalogRepository } from './infrastructure/DrizzleCatalogRepository';
import { CatalogUseCases } from './application/useCases/CatalogUseCases';
import { CatalogAdminUseCases } from './application/useCases/CatalogAdminUseCases';

const catalogRepository = new DrizzleCatalogRepository();
const catalogUseCases = new CatalogUseCases(catalogRepository);
const catalogAdminUseCases = new CatalogAdminUseCases(catalogRepository);

export const CatalogModule = {
  getStudentVisiblePathways: () => catalogUseCases.getStudentVisiblePathways(),
  getStudentVisibleAreas: () => catalogUseCases.getStudentVisibleAreas(),
  getStudentVisibleLocations: (type?: any, parentId?: string) => catalogUseCases.getStudentVisibleLocations(type, parentId),
  getPartnerSchools: (locationId?: string, search?: string) => catalogUseCases.getPartnerSchools(locationId, search),
  
  // Validation methods used by other modules (e.g., student module)
  validatePathway: (code: string) => catalogUseCases.validatePathway(code),
  validateProgram: (pathwayCode: string, programCode: string) => catalogUseCases.validateProgram(pathwayCode, programCode),
  validateArea: (id: string) => catalogUseCases.validateArea(id),
  validateSchool: (id: string) => catalogUseCases.validateSchool(id),
};

export const AdminCatalogModule = {
  getLocations: (type?: any, parentId?: string) => catalogAdminUseCases.getLocations(type, parentId),
  createLocation: (data: any) => catalogAdminUseCases.createLocation(data),
  updateLocation: (id: string, updates: any) => catalogAdminUseCases.updateLocation(id, updates),
  getSchools: (locationId?: string, status?: string, partnershipStatus?: string | null, search?: string) => catalogAdminUseCases.getSchools(locationId, status, partnershipStatus, search),
  createSchool: (data: any) => catalogAdminUseCases.createSchool(data),
  updateSchool: (id: string, updates: any) => catalogAdminUseCases.updateSchool(id, updates),
};

export * from './application/dtos';

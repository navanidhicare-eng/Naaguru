import { DrizzleCatalogRepository } from '../../infrastructure/DrizzleCatalogRepository';
import { LocationDto } from '../dtos';
import { LocationType } from '../../domain/models';
import { AppError } from '../../../errors';

export class CatalogAdminUseCases {
  constructor(private readonly catalogRepository: DrizzleCatalogRepository) {}

  async getLocations(type?: LocationType, parentId?: string): Promise<LocationDto[]> {
    const locations = await this.catalogRepository.getAdminLocations(type, parentId || null);
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

  async createLocation(data: { type: LocationType, parentId?: string, nameEn: string, nameTe: string }): Promise<LocationDto> {
    // 1. Validate hierarchy strictly
    if (data.type === 'STATE') {
      if (data.parentId) throw new AppError('STATE cannot have a parent location.', 400);
    } else {
      if (!data.parentId) throw new AppError(`${data.type} must have a parent location.`, 400);
      
      const parent = await this.catalogRepository.getLocationById(data.parentId);
      if (!parent) throw new AppError('Parent location not found.', 400);
      
      // 2. Cannot create a child under an inactive parent
      if (parent.props.status !== 'ACTIVE') {
        throw new AppError('Cannot create a new location under an INACTIVE parent.', 400);
      }
      
      // 3. Strict parent type checks
      const validParentTypeMap: Record<LocationType, LocationType | null> = {
        STATE: null,
        DISTRICT: 'STATE',
        MANDAL: 'DISTRICT',
        LOCALITY: 'MANDAL'
      };
      
      if (validParentTypeMap[data.type] !== parent.props.type) {
        throw new AppError(`Invalid hierarchy: ${data.type} cannot belong directly to a ${parent.props.type}.`, 400);
      }
    }
    
    // Application validation for duplicates for nicer errors
    const siblings = await this.catalogRepository.getAdminLocations(data.type, data.parentId || null);
    const isDuplicate = siblings.some(s => s.props.nameEn.toLowerCase() === data.nameEn.toLowerCase());
    if (isDuplicate) {
      throw new AppError(`That ${data.type.toLowerCase()} already exists in this ${data.type === 'STATE' ? 'catalog' : 'parent'}.`, 409);
    }
    
    try {
      const location = await this.catalogRepository.createLocation({
        type: data.type,
        parentId: data.parentId || null,
        nameEn: data.nameEn,
        nameTe: data.nameTe,
      });
      
      return {
        id: location.props.id,
        parentId: location.props.parentId,
        type: location.props.type,
        nameEn: location.props.nameEn,
        nameTe: location.props.nameTe,
        code: location.props.code,
        status: location.props.status,
      };
    } catch (error: any) {
      // Graceful fallback for DB unique constraint violation
      if (error.code === '23505' || error.message?.includes('duplicate key')) {
        throw new AppError(`That ${data.type.toLowerCase()} already exists.`, 409);
      }
      throw error;
    }
  }

  async updateLocation(id: string, updates: { status?: 'ACTIVE' | 'INACTIVE', nameEn?: string, nameTe?: string }): Promise<LocationDto> {
    const existing = await this.catalogRepository.getLocationById(id);
    if (!existing) throw new AppError('Location not found.', 404);
    
    if (updates.nameEn && updates.nameEn.toLowerCase() !== existing.props.nameEn.toLowerCase()) {
       // Check for duplicate names if renaming
       const siblings = await this.catalogRepository.getAdminLocations(existing.props.type, existing.props.parentId || null);
       const isDuplicate = siblings.some(s => s.props.id !== id && s.props.nameEn.toLowerCase() === updates.nameEn!.toLowerCase());
       if (isDuplicate) {
         throw new AppError(`That ${existing.props.type.toLowerCase()} already exists in this ${existing.props.type === 'STATE' ? 'catalog' : 'parent'}.`, 409);
       }
    }
    
    try {
      const location = await this.catalogRepository.updateLocation(id, updates);
      return {
        id: location.props.id,
        parentId: location.props.parentId,
        type: location.props.type,
        nameEn: location.props.nameEn,
        nameTe: location.props.nameTe,
        code: location.props.code,
        status: location.props.status,
      };
    } catch (error: any) {
      if (error.code === '23505' || error.message?.includes('duplicate key')) {
        throw new AppError(`That ${existing.props.type.toLowerCase()} already exists.`, 409);
      }
      throw error;
    }
  }
}

import { CatalogStatus } from '../domain/models';

export interface ProgramDto {
  id: string;
  code: string;
  nameEn: string;
  nameTe: string;
  displayOrder: number;
  status: CatalogStatus;
}

export interface PathwayDto {
  id: string;
  code: string;
  nameEn: string;
  nameTe: string;
  icon: string | null;
  status: CatalogStatus;
  displayOrder: number;
  programs: ProgramDto[];
}

export interface ServiceAreaDto {
  id: string;
  state: string;
  district: string;
  displayNameEn: string;
  displayNameTe: string;
  displayOrder: number;
}

export interface LocationDto {
  id: string;
  parentId: string | null;
  type: string;
  nameEn: string;
  nameTe: string;
  code: string | null;
  status: string;
}

export interface SchoolDto {
  id: string;
  locationId: string;
  locationName?: string;
  districtName?: string;
  mandalName?: string;
  nameEn: string;
  nameTe: string;
  partnershipStatus: string | null;
  status: string;
}

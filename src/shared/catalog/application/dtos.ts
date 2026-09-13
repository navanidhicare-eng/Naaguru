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

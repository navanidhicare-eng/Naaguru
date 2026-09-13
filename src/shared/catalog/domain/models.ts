export type CatalogStatus = 'ACTIVE' | 'COMING_SOON' | 'INACTIVE';

export interface PathwayProps {
  id: string;
  code: string;
  nameEn: string;
  nameTe: string;
  icon: string | null;
  displayOrder: number;
  status: CatalogStatus;
}

export class Pathway {
  private constructor(public readonly props: PathwayProps) {}
  static create(props: PathwayProps) { return new Pathway(props); }
}

export interface ProgramProps {
  id: string;
  pathwayId: string;
  code: string;
  nameEn: string;
  nameTe: string;
  displayOrder: number;
  status: CatalogStatus;
}

export class Program {
  private constructor(public readonly props: ProgramProps) {}
  static create(props: ProgramProps) { return new Program(props); }
}

export interface ServiceAreaProps {
  id: string;
  state: string;
  district: string;
  displayNameEn: string;
  displayNameTe: string;
  displayOrder: number;
  status: CatalogStatus;
}

export class ServiceArea {
  private constructor(public readonly props: ServiceAreaProps) {}
  static create(props: ServiceAreaProps) { return new ServiceArea(props); }
}

export type LocationType = 'STATE' | 'DISTRICT' | 'MANDAL' | 'LOCALITY';

export interface LocationProps {
  id: string;
  parentId: string | null;
  type: LocationType;
  nameEn: string;
  nameTe: string;
  code: string | null;
  status: CatalogStatus;
  latitude: number | null;
  longitude: number | null;
}

export class Location {
  private constructor(public readonly props: LocationProps) {}
  static create(props: LocationProps) { return new Location(props); }
}

export interface SchoolProps {
  id: string;
  locationId: string;
  nameEn: string;
  nameTe: string;
  partnershipStatus: string | null;
  status: CatalogStatus;
}

export class School {
  private constructor(public readonly props: SchoolProps) {}
  static create(props: SchoolProps) { return new School(props); }
}

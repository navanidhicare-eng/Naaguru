import { AppError } from '../../../shared/errors';

export type MediaType = 'IMAGE' | 'VIDEO' | 'VIRTUAL_TOUR';
export type MediaStatus = 'ACTIVE' | 'INACTIVE';

export interface CollegeMediaProps {
  id: string;
  collegeId: string;
  mediaType: MediaType;
  storageKey: string | null;
  thumbnailStorageKey: string | null;
  externalUrl: string | null;
  caption: string | null;
  displayOrder: number;
  isCover: boolean;
  status: MediaStatus;
  createdAt: string;
  updatedAt: string;
}

export class CollegeMedia {
  private constructor(private readonly props: CollegeMediaProps) {
    this.validate();
  }

  static create(props: CollegeMediaProps): CollegeMedia {
    return new CollegeMedia(props);
  }

  // Getters
  get id() { return this.props.id; }
  get collegeId() { return this.props.collegeId; }
  get mediaType() { return this.props.mediaType; }
  get storageKey() { return this.props.storageKey; }
  get thumbnailStorageKey() { return this.props.thumbnailStorageKey; }
  get externalUrl() { return this.props.externalUrl; }
  get caption() { return this.props.caption; }
  get displayOrder() { return this.props.displayOrder; }
  get isCover() { return this.props.isCover; }
  get status() { return this.props.status; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }
  
  get isActive() { return this.props.status === 'ACTIVE'; }

  // Setters / Updates
  updateMetadata(data: {
    caption?: string | null;
    displayOrder?: number;
    isCover?: boolean;
    status?: MediaStatus;
  }) {
    if (data.caption !== undefined) this.props.caption = data.caption;
    if (data.displayOrder !== undefined) this.props.displayOrder = data.displayOrder;
    if (data.isCover !== undefined) this.props.isCover = data.isCover;
    if (data.status !== undefined) this.props.status = data.status;
    this.props.updatedAt = new Date().toISOString();
    this.validate();
  }

  deactivate() {
    this.props.status = 'INACTIVE';
    this.props.isCover = false; // Inactive media cannot be cover
    this.props.updatedAt = new Date().toISOString();
  }

  activate() {
    this.props.status = 'ACTIVE';
    this.props.updatedAt = new Date().toISOString();
  }

  private validate() {
    if (!this.props.storageKey && !this.props.externalUrl) {
      throw new AppError('Media must have either a storageKey or an externalUrl', 400, 'VALIDATION_ERROR');
    }
    
    if (this.props.isCover && this.props.mediaType !== 'IMAGE') {
      throw new AppError('Only IMAGE media types can be set as cover', 400, 'VALIDATION_ERROR');
    }

    if (this.props.isCover && this.props.status === 'INACTIVE') {
      throw new AppError('Inactive media cannot be set as cover', 400, 'VALIDATION_ERROR');
    }
  }

  toJSON(): CollegeMediaProps {
    return { ...this.props };
  }
}

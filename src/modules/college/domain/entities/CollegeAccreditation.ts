import { z } from 'zod';

export type AccreditationStatus = 'ACTIVE' | 'INACTIVE';

export interface CollegeAccreditationProps {
  id: string;
  collegeId: string;
  name: string;
  issuingBody: string;
  year: number | null;
  validUntilYear: number | null;
  description: string | null;
  certificateStorageKey: string | null;
  verificationUrl: string | null;
  displayOrder: number;
  status: AccreditationStatus;
  createdAt: string;
  updatedAt: string;
}

const currentYear = new Date().getFullYear();

const accreditationSchema = z.object({
  name: z.string().trim().min(1, 'Accreditation name is required').max(255),
  issuingBody: z.string().trim().min(1, 'Issuing body is required').max(255),
  year: z.number().int().min(2000).max(currentYear + 5).nullable().optional().transform(v => v ?? null),
  validUntilYear: z.number().int().min(2000).max(currentYear + 5).nullable().optional().transform(v => v ?? null),
  description: z.string().trim().max(1000).nullable().optional().transform(v => v || null),
  certificateStorageKey: z.string().trim().max(1024).nullable().optional().transform(v => v || null),
  verificationUrl: z.string().trim().url('Invalid verification URL').max(2048).nullable().optional().transform(v => v || null),
  displayOrder: z.number().int().nonnegative().default(0),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
}).refine((data) => {
  if (data.year != null && data.validUntilYear != null) {
    return data.validUntilYear >= data.year;
  }
  return true;
}, {
  message: 'validUntilYear cannot be earlier than year',
  path: ['validUntilYear'],
});

export class CollegeAccreditation {
  private constructor(public readonly props: CollegeAccreditationProps) {}

  static create(props: Omit<CollegeAccreditationProps, 'id' | 'createdAt' | 'updatedAt' | 'year' | 'validUntilYear' | 'description' | 'certificateStorageKey' | 'verificationUrl' | 'displayOrder' | 'status'> & Partial<Pick<CollegeAccreditationProps, 'id' | 'createdAt' | 'updatedAt' | 'year' | 'validUntilYear' | 'description' | 'certificateStorageKey' | 'verificationUrl' | 'displayOrder' | 'status'>>): CollegeAccreditation {
    const parsed = accreditationSchema.parse({
      name: props.name,
      issuingBody: props.issuingBody,
      year: props.year,
      validUntilYear: props.validUntilYear,
      description: props.description,
      certificateStorageKey: props.certificateStorageKey,
      verificationUrl: props.verificationUrl,
      displayOrder: props.displayOrder,
      status: props.status,
    });

    return new CollegeAccreditation({
      ...parsed,
      id: props.id || crypto.randomUUID(),
      collegeId: props.collegeId,
      createdAt: props.createdAt || new Date().toISOString(),
      updatedAt: props.updatedAt || new Date().toISOString(),
    });
  }

  get id() { return this.props.id; }
  get collegeId() { return this.props.collegeId; }
  get name() { return this.props.name; }
  get issuingBody() { return this.props.issuingBody; }
  get year() { return this.props.year; }
  get validUntilYear() { return this.props.validUntilYear; }
  get description() { return this.props.description; }
  get certificateStorageKey() { return this.props.certificateStorageKey; }
  get verificationUrl() { return this.props.verificationUrl; }
  get displayOrder() { return this.props.displayOrder; }
  get status() { return this.props.status; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  isActive(): boolean {
    return this.status === 'ACTIVE';
  }
}

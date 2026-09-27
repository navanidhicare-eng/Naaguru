import { z } from 'zod';

export type PersonType = 'STUDENT' | 'PARENT' | 'ALUMNI' | 'OTHER';
export type TestimonialStatus = 'ACTIVE' | 'INACTIVE';

export interface CollegeTestimonialProps {
  id: string;
  collegeId: string;
  personName: string;
  personType: PersonType;
  testimonialText: string;
  imageStorageKey: string | null;
  displayOrder: number;
  status: TestimonialStatus;
  createdAt: string;
  updatedAt: string;
}

const testimonialSchema = z.object({
  personName: z.string().trim().min(1, 'Person name is required').max(255),
  personType: z.enum(['STUDENT', 'PARENT', 'ALUMNI', 'OTHER']),
  testimonialText: z.string().trim().min(1, 'Testimonial text is required'),
  imageStorageKey: z.string().trim().max(1024).nullable().optional().transform(v => v || null),
  displayOrder: z.number().int().nonnegative().default(0),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export class CollegeTestimonial {
  private constructor(public readonly props: CollegeTestimonialProps) {}

  static create(props: Omit<CollegeTestimonialProps, 'id' | 'createdAt' | 'updatedAt' | 'imageStorageKey' | 'displayOrder' | 'status'> & Partial<Pick<CollegeTestimonialProps, 'id' | 'createdAt' | 'updatedAt' | 'imageStorageKey' | 'displayOrder' | 'status'>>): CollegeTestimonial {
    const parsed = testimonialSchema.parse({
      personName: props.personName,
      personType: props.personType,
      testimonialText: props.testimonialText,
      imageStorageKey: props.imageStorageKey,
      displayOrder: props.displayOrder,
      status: props.status,
    });

    return new CollegeTestimonial({
      ...parsed,
      id: props.id || crypto.randomUUID(),
      collegeId: props.collegeId,
      createdAt: props.createdAt || new Date().toISOString(),
      updatedAt: props.updatedAt || new Date().toISOString(),
    });
  }

  get id() { return this.props.id; }
  get collegeId() { return this.props.collegeId; }
  get personName() { return this.props.personName; }
  get personType() { return this.props.personType; }
  get testimonialText() { return this.props.testimonialText; }
  get imageStorageKey() { return this.props.imageStorageKey; }
  get displayOrder() { return this.props.displayOrder; }
  get status() { return this.props.status; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  isActive(): boolean {
    return this.status === 'ACTIVE';
  }
}

import { z } from 'zod';
import { AppError } from '@/shared/errors';

export type AchievementStatus = 'ACTIVE' | 'INACTIVE';

export interface CollegeAchievementProps {
  id: string;
  collegeId: string;
  studentName: string;
  exam: string;
  achievement: string;
  year: number;
  description: string | null;
  imageStorageKey: string | null;
  displayOrder: number;
  status: AchievementStatus;
  createdAt: string;
  updatedAt: string;
}

const achievementSchema = z.object({
  studentName: z.string().trim().min(1, 'Student name is required').max(255),
  exam: z.string().trim().min(1, 'Exam is required').max(255),
  achievement: z.string().trim().min(1, 'Achievement is required').max(255),
  year: z.number().int().min(2000).max(new Date().getFullYear() + 5),
  description: z.string().trim().max(1000).nullable().optional().transform(v => v || null),
  imageStorageKey: z.string().trim().max(1024).nullable().optional().transform(v => v || null),
  displayOrder: z.number().int().nonnegative().default(0),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export class CollegeAchievement {
  private constructor(public readonly props: CollegeAchievementProps) {}

  static create(props: Omit<CollegeAchievementProps, 'id' | 'createdAt' | 'updatedAt' | 'description' | 'imageStorageKey' | 'displayOrder' | 'status'> & Partial<Pick<CollegeAchievementProps, 'id' | 'createdAt' | 'updatedAt' | 'description' | 'imageStorageKey' | 'displayOrder' | 'status'>>): CollegeAchievement {
    const parsed = achievementSchema.parse({
      studentName: props.studentName,
      exam: props.exam,
      achievement: props.achievement,
      year: props.year,
      description: props.description,
      imageStorageKey: props.imageStorageKey,
      displayOrder: props.displayOrder,
      status: props.status,
    });

    return new CollegeAchievement({
      ...parsed,
      id: props.id || crypto.randomUUID(),
      collegeId: props.collegeId,
      createdAt: props.createdAt || new Date().toISOString(),
      updatedAt: props.updatedAt || new Date().toISOString(),
    });
  }

  get id() { return this.props.id; }
  get collegeId() { return this.props.collegeId; }
  get studentName() { return this.props.studentName; }
  get exam() { return this.props.exam; }
  get achievement() { return this.props.achievement; }
  get year() { return this.props.year; }
  get description() { return this.props.description; }
  get imageStorageKey() { return this.props.imageStorageKey; }
  get displayOrder() { return this.props.displayOrder; }
  get status() { return this.props.status; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  isActive(): boolean {
    return this.status === 'ACTIVE';
  }
}

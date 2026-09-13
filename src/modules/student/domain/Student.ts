export const StudentGender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
} as const;

export type StudentGender = (typeof StudentGender)[keyof typeof StudentGender];

export interface StudentProps {
  userId: string;
  fullName: string;
  gender?: StudentGender | null;
  educationStage: string;
  board?: string | null;
  residenceLocationId?: string | null;
  schoolId?: string | null;
  pincode?: string | null;
  landmark?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  guardianName?: string | null;
  guardianPhone?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export class Student {
  private constructor(private props: StudentProps) {}

  public static create(props: StudentProps): Student {
    // Domain validation could be placed here if needed.
    return new Student({
      ...props,
      createdAt: props.createdAt || new Date().toISOString(),
      updatedAt: props.updatedAt || new Date().toISOString(),
    });
  }

  get userId(): string { return this.props.userId; }
  get fullName(): string { return this.props.fullName; }
  get gender(): StudentGender | null | undefined { return this.props.gender; }
  get educationStage(): string { return this.props.educationStage; }
  get board(): string | null | undefined { return this.props.board; }
  get residenceLocationId(): string | null | undefined { return this.props.residenceLocationId; }
  get schoolId(): string | null | undefined { return this.props.schoolId; }
  get pincode(): string | null | undefined { return this.props.pincode; }
  get landmark(): string | null | undefined { return this.props.landmark; }
  get latitude(): number | null | undefined { return this.props.latitude; }
  get longitude(): number | null | undefined { return this.props.longitude; }
  get guardianName(): string | null | undefined { return this.props.guardianName; }
  get guardianPhone(): string | null | undefined { return this.props.guardianPhone; }
  get createdAt(): string | undefined { return this.props.createdAt; }
  get updatedAt(): string | undefined { return this.props.updatedAt; }

  public update(props: Partial<Omit<StudentProps, 'userId' | 'createdAt'>>): void {
    this.props = {
      ...this.props,
      ...props,
      updatedAt: new Date().toISOString(),
    };
  }

  public toJSON(): StudentProps {
    return { ...this.props };
  }
}

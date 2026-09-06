export interface StudentProps {
  userId: string;
  fullName: string;
  educationStage: string;
  board?: string | null;
  state?: string | null;
  district?: string | null;
  city?: string | null;
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
  get educationStage(): string { return this.props.educationStage; }
  get board(): string | null | undefined { return this.props.board; }
  get state(): string | null | undefined { return this.props.state; }
  get district(): string | null | undefined { return this.props.district; }
  get city(): string | null | undefined { return this.props.city; }
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

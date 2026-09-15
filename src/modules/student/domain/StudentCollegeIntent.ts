export type IntentStatus = 'ACTIVE' | 'SUPERSEDED';

export interface StudentCollegeIntentProps {
  id: string;
  studentId: string;
  versionNumber: number;
  pathwayCode: string;
  programCode: string | null;
  preferredLocationId: string | null;
  requiresHostel: boolean;
  maxAnnualFee: number | null;
  status: IntentStatus;
}

export class StudentCollegeIntent {
  private constructor(public readonly props: StudentCollegeIntentProps) {
    this.validate();
  }

  static create(props: StudentCollegeIntentProps): StudentCollegeIntent {
    return new StudentCollegeIntent(props);
  }

  private validate() {
    if (this.props.versionNumber !== 1 && this.props.versionNumber !== 2) {
      throw new Error('Version number must be 1 or 2');
    }
    if (this.props.maxAnnualFee !== null && this.props.maxAnnualFee < 0) {
      throw new Error('Max annual fee must be non-negative');
    }
  }

  get remainingChanges(): number {
    return this.props.versionNumber === 1 ? 1 : 0;
  }
}

import { AdmissionVerificationStatus } from './types';

export interface AdmissionProps {
  id: string;
  leadId: string | null;
  studentId: string;
  collegeId: string;
  branchId: string;
  streamCode: string;
  academicYear: string;
  verificationStatus: AdmissionVerificationStatus;
  createdAt: string;
  updatedAt: string;
}

export class Admission {
  private constructor(private props: AdmissionProps) {
    this.validate();
  }

  public static create(props: Omit<AdmissionProps, 'id' | 'createdAt' | 'updatedAt' | 'verificationStatus'> & {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    verificationStatus?: AdmissionVerificationStatus;
  }): Admission {
    const now = new Date().toISOString();
    return new Admission({
      ...props,
      verificationStatus: props.verificationStatus || 'PENDING',
      createdAt: props.createdAt || now,
      updatedAt: props.updatedAt || now,
    });
  }

  public static restore(props: AdmissionProps): Admission {
    return new Admission(props);
  }

  private validate() {
    if (!this.props.studentId) throw new Error("studentId is required");
    if (!this.props.collegeId) throw new Error("collegeId is required");
    if (!this.props.branchId) throw new Error("branchId is required");
    if (!this.props.streamCode) throw new Error("streamCode is required for Admission");
    if (!this.props.academicYear) throw new Error("academicYear is required");
  }

  get id(): string { return this.props.id; }
  get leadId(): string | null { return this.props.leadId; }
  get studentId(): string { return this.props.studentId; }
  get collegeId(): string { return this.props.collegeId; }
  get branchId(): string { return this.props.branchId; }
  get streamCode(): string { return this.props.streamCode; }
  get academicYear(): string { return this.props.academicYear; }
  get verificationStatus(): AdmissionVerificationStatus { return this.props.verificationStatus; }
  get createdAt(): string { return this.props.createdAt; }
  get updatedAt(): string { return this.props.updatedAt; }

  public updateVerificationStatus(newStatus: AdmissionVerificationStatus): void {
    if (this.props.verificationStatus === newStatus) return; // No-op

    // Bidirectional verified <-> disputed is allowed, but we don't allow transitioning back to PENDING
    if (newStatus === 'PENDING') {
      throw new Error("Cannot transition back to PENDING verification status");
    }

    this.props.verificationStatus = newStatus;
    this.props.updatedAt = new Date().toISOString();
  }

  public toJSON(): AdmissionProps {
    return { ...this.props };
  }
}

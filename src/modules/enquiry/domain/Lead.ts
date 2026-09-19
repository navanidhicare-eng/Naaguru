import { LeadStatus } from './types';

export interface LeadProps {
  id: string;
  studentId: string;
  collegeId: string;
  branchId: string;
  streamCode: string | null;
  intentId: string | null;
  source: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  lastCollegeContactedAt: string | null;
}

export class Lead {
  private constructor(private props: LeadProps) {
    this.validate();
  }

  public static create(props: Omit<LeadProps, 'id' | 'createdAt' | 'updatedAt' | 'lastCollegeContactedAt' | 'status'> & {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    lastCollegeContactedAt?: string | null;
    status?: LeadStatus;
  }): Lead {
    const now = new Date().toISOString();
    return new Lead({
      ...props,
      status: props.status || 'NEW',
      createdAt: props.createdAt || now,
      updatedAt: props.updatedAt || now,
      lastCollegeContactedAt: props.lastCollegeContactedAt || null,
    });
  }
  
  public static restore(props: LeadProps): Lead {
    return new Lead(props);
  }

  private validate() {
    if (!this.props.studentId) throw new Error("studentId is required");
    if (!this.props.collegeId) throw new Error("collegeId is required");
    if (!this.props.branchId) throw new Error("branchId is required");
    if (!this.props.source) throw new Error("source is required");
  }

  get id(): string { return this.props.id; }
  get studentId(): string { return this.props.studentId; }
  get collegeId(): string { return this.props.collegeId; }
  get branchId(): string { return this.props.branchId; }
  get streamCode(): string | null { return this.props.streamCode; }
  get intentId(): string | null { return this.props.intentId; }
  get source(): string { return this.props.source; }
  get status(): LeadStatus { return this.props.status; }
  get createdAt(): string { return this.props.createdAt; }
  get updatedAt(): string { return this.props.updatedAt; }
  get lastCollegeContactedAt(): string | null { return this.props.lastCollegeContactedAt; }

  public updateStatus(newStatus: LeadStatus): void {
    if (this.props.status === newStatus) return; // No-op

    // Terminal state check
    if (this.props.status === 'LOST') {
      throw new Error(`Cannot transition from terminal state LOST to ${newStatus}`);
    }

    const allowedTransitions: Record<LeadStatus, LeadStatus[]> = {
      'NEW': ['CONTACTED', 'LOST'],
      'CONTACTED': ['APPLICATION_STARTED', 'LOST'],
      'APPLICATION_STARTED': ['ADMITTED_REPORTED', 'LOST'],
      'ADMITTED_REPORTED': ['LOST'], // Allow LOST if they cancel admission
      'LOST': []
    };

    if (!allowedTransitions[this.props.status].includes(newStatus)) {
      throw new Error(`Invalid lead status transition from ${this.props.status} to ${newStatus}`);
    }

    this.props.status = newStatus;
    this.props.updatedAt = new Date().toISOString();
    
    // If college contacted them, update the contact timestamp
    if (newStatus === 'CONTACTED') {
      this.props.lastCollegeContactedAt = this.props.updatedAt;
    }
  }

  public toJSON(): LeadProps {
    return { ...this.props };
  }
}

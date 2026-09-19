import { LeadStatus } from './types';

export interface LeadHistoryProps {
  id: string;
  leadId: string;
  oldStatus: LeadStatus | null;
  newStatus: LeadStatus;
  changedBy: string;
  createdAt: string;
}

export class LeadHistory {
  private constructor(private props: LeadHistoryProps) {
    this.validate();
  }

  public static create(props: Omit<LeadHistoryProps, 'id' | 'createdAt'> & { id: string, createdAt?: string }): LeadHistory {
    return new LeadHistory({
      ...props,
      createdAt: props.createdAt || new Date().toISOString()
    });
  }

  public static restore(props: LeadHistoryProps): LeadHistory {
    return new LeadHistory(props);
  }

  private validate() {
    if (!this.props.leadId) throw new Error("leadId is required");
    if (!this.props.newStatus) throw new Error("newStatus is required");
    if (!this.props.changedBy) throw new Error("changedBy is required");
    if (this.props.oldStatus === this.props.newStatus) {
      throw new Error("oldStatus and newStatus cannot be the same");
    }
  }

  get id(): string { return this.props.id; }
  get leadId(): string { return this.props.leadId; }
  get oldStatus(): LeadStatus | null { return this.props.oldStatus; }
  get newStatus(): LeadStatus { return this.props.newStatus; }
  get changedBy(): string { return this.props.changedBy; }
  get createdAt(): string { return this.props.createdAt; }

  public toJSON(): LeadHistoryProps {
    return { ...this.props };
  }
}

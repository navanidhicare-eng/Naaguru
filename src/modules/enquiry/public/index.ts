import { DrizzleLeadRepository } from '../infrastructure/DrizzleLeadRepository';
import { DrizzleAdmissionRepository } from '../infrastructure/DrizzleAdmissionRepository';
import { EnquiryUseCases } from '../application/EnquiryUseCases';

const leadRepo = new DrizzleLeadRepository();
const admissionRepo = new DrizzleAdmissionRepository();

export const EnquiryModule = new EnquiryUseCases(leadRepo, admissionRepo);

export * from '../application/EnquiryDto';
export * from '../domain/types';

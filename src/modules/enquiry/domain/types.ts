export type LeadStatus = 'NEW' | 'CONTACTED' | 'APPLICATION_STARTED' | 'ADMITTED_REPORTED' | 'LOST';

export type AdmissionVerificationStatus = 'PENDING' | 'VERIFIED' | 'DISPUTED';

export const LeadStatusList: LeadStatus[] = ['NEW', 'CONTACTED', 'APPLICATION_STARTED', 'ADMITTED_REPORTED', 'LOST'];
export const AdmissionVerificationStatusList: AdmissionVerificationStatus[] = ['PENDING', 'VERIFIED', 'DISPUTED'];

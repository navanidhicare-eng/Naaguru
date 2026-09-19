import { pgTable, uuid, varchar, timestamp, uniqueIndex, index, pgEnum, foreignKey } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { usersTable } from '@/shared/auth/schema';
import { collegesTable, branchesTable, collegeStreamOfferingsTable } from '@/modules/college/infrastructure/schema';
import { studentCollegeIntentsTable } from '@/modules/student/infrastructure/schema';

export const leadStatusEnum = pgEnum('lead_status', [
  'NEW',
  'CONTACTED',
  'APPLICATION_STARTED',
  'ADMITTED_REPORTED',
  'LOST'
]);

export const admissionVerificationStatusEnum = pgEnum('admission_verification_status', [
  'PENDING',
  'VERIFIED',
  'DISPUTED'
]);

export const leadsTable = pgTable('leads', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => usersTable.id, { onDelete: 'restrict' }),
  collegeId: uuid('college_id').notNull(),
  branchId: uuid('branch_id').notNull(),
  streamCode: varchar('stream_code', { length: 50 }),
  intentId: uuid('intent_id').references(() => studentCollegeIntentsTable.id, { onDelete: 'set null' }),
  source: varchar('source', { length: 100 }).notNull(),
  status: leadStatusEnum('status').default('NEW').notNull(),
  lastCollegeContactedAt: timestamp('last_college_contacted_at', { withTimezone: true, mode: 'string' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => ({
  // Duplicate Constraint: One active lead per student per branch
  activeLeadUnique: uniqueIndex('idx_leads_active_student_branch')
    .on(table.studentId, table.branchId)
    .where(sql`${table.status} != 'LOST'`),
    
  studentIdx: index('idx_leads_student').on(table.studentId),
  collegeIdx: index('idx_leads_college').on(table.collegeId),
}));

export const leadHistoryTable = pgTable('lead_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').notNull().references(() => leadsTable.id, { onDelete: 'cascade' }),
  oldStatus: leadStatusEnum('old_status'),
  newStatus: leadStatusEnum('new_status').notNull(),
  changedBy: uuid('changed_by').notNull().references(() => usersTable.id, { onDelete: 'restrict' }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => ({
  leadIdx: index('idx_lead_history_lead').on(table.leadId),
}));

export const admissionsTable = pgTable('admissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  leadId: uuid('lead_id').references(() => leadsTable.id, { onDelete: 'set null' }),
  studentId: uuid('student_id').notNull().references(() => usersTable.id, { onDelete: 'restrict' }),
  collegeId: uuid('college_id').notNull(),
  branchId: uuid('branch_id').notNull(),
  streamCode: varchar('stream_code', { length: 50 }).notNull(),
  academicYear: varchar('academic_year', { length: 20 }).notNull(),
  verificationStatus: admissionVerificationStatusEnum('verification_status').default('PENDING').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => ({
  studentIdx: index('idx_admissions_student').on(table.studentId),
  collegeIdx: index('idx_admissions_college').on(table.collegeId),
}));

import { pgTable, uuid, varchar, timestamp, numeric, integer, boolean, uniqueIndex, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { usersTable } from '../../../shared/auth/schema';
import { serviceAreasTable, locationsTable, schoolsTable } from '../../../shared/catalog/infrastructure/schema';

export const studentsTable = pgTable('students', {
  userId: uuid('user_id').primaryKey().references(() => usersTable.id, { onDelete: 'restrict' }),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  educationStage: varchar('education_stage', { length: 50 }).notNull(),
  board: varchar('board', { length: 100 }),
  residenceLocationId: uuid('residence_location_id').references(() => locationsTable.id, { onDelete: 'restrict' }),
  schoolId: uuid('school_id').references(() => schoolsTable.id, { onDelete: 'restrict' }),
  pincode: varchar('pincode', { length: 10 }),
  landmark: varchar('landmark', { length: 255 }),
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  guardianName: varchar('guardian_name', { length: 255 }),
  guardianPhone: varchar('guardian_phone', { length: 20 }),
  gender: varchar('gender', { length: 10 }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const studentCollegeIntentsTable = pgTable('student_college_intents', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => usersTable.id, { onDelete: 'restrict' }),
  versionNumber: integer('version_number').notNull(),
  pathwayCode: varchar('pathway_code', { length: 30 }).notNull(),
  programCode: varchar('program_code', { length: 30 }),
  preferredLocationId: uuid('preferred_location_id').references(() => locationsTable.id, { onDelete: 'restrict' }),
  requiresHostel: boolean('requires_hostel').notNull().default(false),
  hostelGender: varchar('hostel_gender', { length: 10 }),
  maxAnnualFee: integer('max_annual_fee'),
  status: varchar('status', { length: 20 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => {
  return {
    studentVersionIdx: uniqueIndex('idx_student_college_intents_student_version').on(table.studentId, table.versionNumber),
    studentActiveIdx: uniqueIndex('idx_student_college_intents_student_active').on(table.studentId).where(sql`${table.status} = 'ACTIVE'`),
  };
});

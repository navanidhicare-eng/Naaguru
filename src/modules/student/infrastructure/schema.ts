import { pgTable, uuid, varchar, timestamp, numeric } from 'drizzle-orm/pg-core';
import { usersTable } from '@/shared/auth/schema';

export const studentsTable = pgTable('students', {
  userId: uuid('user_id').primaryKey().references(() => usersTable.id, { onDelete: 'restrict' }),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  educationStage: varchar('education_stage', { length: 50 }).notNull(),
  board: varchar('board', { length: 100 }),
  state: varchar('state', { length: 100 }),
  district: varchar('district', { length: 100 }),
  city: varchar('city', { length: 100 }),
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  guardianName: varchar('guardian_name', { length: 255 }),
  guardianPhone: varchar('guardian_phone', { length: 20 }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

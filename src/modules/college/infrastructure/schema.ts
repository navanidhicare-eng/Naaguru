import { pgTable, uuid, varchar, text, integer, decimal, boolean, timestamp, uniqueIndex, index, check, pgEnum } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { usersTable } from '@/shared/auth/schema';
import { locationsTable } from '@/shared/catalog/infrastructure/schema';

export const staffRoleEnum = pgEnum('staff_role', ['COLLEGE_ADMIN', 'COLLEGE_STAFF']);
export const staffStatusEnum = pgEnum('staff_status', ['ACTIVE', 'INACTIVE', 'SUSPENDED']);
export const branchTypeEnum = pgEnum('branch_type', ['MAIN_CAMPUS', 'OFF_CAMPUS']);

export const collegesTable = pgTable('colleges', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  shortName: varchar('short_name', { length: 100 }),
  description: text('description'),
  website: varchar('website', { length: 255 }),
  contactPhone: varchar('contact_phone', { length: 50 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  
  // Location
  state: varchar('state', { length: 100 }).notNull(),
  district: varchar('district', { length: 100 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  address: text('address').notNull(),
  lat: decimal('lat', { precision: 10, scale: 7 }),
  lng: decimal('lng', { precision: 10, scale: 7 }),

  // Classification & Status
  ownershipType: varchar('ownership_type', { length: 50 }).notNull(), // e.g., 'PRIVATE', 'GOVERNMENT'
  status: varchar('status', { length: 50 }).default('DRAFT').notNull(), // 'DRAFT', 'ACTIVE', 'INACTIVE'
  verificationStatus: varchar('verification_status', { length: 50 }).default('UNVERIFIED').notNull(), // 'UNVERIFIED', 'VERIFIED'

  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => ({
  locationIdx: index('idx_colleges_location').on(table.state, table.district, table.city),
  visibilityIdx: index('idx_colleges_visibility').on(table.status, table.verificationStatus),
  latCheck: check('lat_check', sql`${table.lat} >= -90 AND ${table.lat} <= 90`),
  lngCheck: check('lng_check', sql`${table.lng} >= -180 AND ${table.lng} <= 180`),
  statusCheck: check('status_check', sql`${table.status} IN ('DRAFT', 'ACTIVE', 'INACTIVE')`),
  verificationStatusCheck: check('verification_status_check', sql`${table.verificationStatus} IN ('UNVERIFIED', 'VERIFIED')`),
  ownershipTypeCheck: check('ownership_type_check', sql`${table.ownershipType} IN ('PRIVATE', 'GOVERNMENT')`),
}));

export const collegeStreamOfferingsTable = pgTable('college_stream_offerings', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // New canonical ownership
  branchId: uuid('branch_id').notNull().references(() => branchesTable.id, { onDelete: 'restrict' }),
  
  streamCode: varchar('stream_code', { length: 50 }).notNull(),
  
  // New fee range semantics
  minFee: integer('min_fee').notNull(),
  maxFee: integer('max_fee').notNull(),
}, (table) => ({
  branchStreamUnique: uniqueIndex('idx_branch_stream_unique').on(table.branchId, table.streamCode),
  streamCodeIdx: index('idx_stream_code').on(table.streamCode),
  minFeeCheck: check('min_fee_check', sql`${table.minFee} >= 0`),
  maxFeeCheck: check('max_fee_check', sql`${table.maxFee} >= ${table.minFee}`),
  branchIdx: index('idx_offerings_branch_id').on(table.branchId),
}));

export const branchesTable = pgTable('branches', {
  id: uuid('id').primaryKey().defaultRandom(),
  collegeId: uuid('college_id').notNull().references(() => collegesTable.id, { onDelete: 'restrict' }),
  name: varchar('name', { length: 255 }).notNull(),
  // Nullable FK → canonical locations hierarchy. Must point to a LOCALITY-type location.
  // DB enforces referential integrity. Application must enforce type = LOCALITY on assignment.
  locationId: uuid('location_id').references(() => locationsTable.id, { onDelete: 'restrict' }),
  address: text('address'),
  lat: decimal('lat', { precision: 10, scale: 7 }),
  lng: decimal('lng', { precision: 10, scale: 7 }),
  contactPhone: varchar('contact_phone', { length: 50 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  type: branchTypeEnum('type').default('MAIN_CAMPUS').notNull(),
  facilities: text('facilities'),
  routine: text('routine'),
  
  // Hostel Summary
  hasBoysHostel: boolean('has_boys_hostel').default(false).notNull(),
  hasGirlsHostel: boolean('has_girls_hostel').default(false).notNull(),
  annualHostelFee: integer('annual_hostel_fee'),

  isPubliclyEligible: boolean('is_publicly_eligible').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => ({
  collegeIdx: index('idx_branches_college_id').on(table.collegeId),
  locationIdx: index('idx_branches_location_id').on(table.locationId),
  hostelFeeCheck: check('branch_hostel_fee_check', sql`${table.annualHostelFee} >= 0`),
}));

export const staffMembershipsTable = pgTable('staff_memberships', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  collegeId: uuid('college_id').notNull().references(() => collegesTable.id, { onDelete: 'restrict' }),
  role: staffRoleEnum('role').default('COLLEGE_ADMIN').notNull(),
  status: staffStatusEnum('status').default('ACTIVE').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => ({
  userCollegeUnique: uniqueIndex('idx_staff_memberships_user_college').on(table.userId, table.collegeId),
  userIdx: index('idx_staff_memberships_user_id').on(table.userId),
  collegeIdx: index('idx_staff_memberships_college_id').on(table.collegeId),
}));

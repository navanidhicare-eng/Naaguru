import { pgTable, uuid, varchar, text, integer, decimal, boolean, timestamp, uniqueIndex, index, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

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

  // Hostel Summary
  hasBoysHostel: boolean('has_boys_hostel').default(false).notNull(),
  hasGirlsHostel: boolean('has_girls_hostel').default(false).notNull(),
  annualHostelFee: integer('annual_hostel_fee'),

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
  hostelFeeCheck: check('hostel_fee_check', sql`${table.annualHostelFee} >= 0`),
  statusCheck: check('status_check', sql`${table.status} IN ('DRAFT', 'ACTIVE', 'INACTIVE')`),
  verificationStatusCheck: check('verification_status_check', sql`${table.verificationStatus} IN ('UNVERIFIED', 'VERIFIED')`),
  ownershipTypeCheck: check('ownership_type_check', sql`${table.ownershipType} IN ('PRIVATE', 'GOVERNMENT')`),
}));

export const collegeStreamOfferingsTable = pgTable('college_stream_offerings', {
  id: uuid('id').primaryKey().defaultRandom(),
  collegeId: uuid('college_id').notNull().references(() => collegesTable.id, { onDelete: 'cascade' }),
  streamCode: varchar('stream_code', { length: 50 }).notNull(),
  tuitionFee: integer('tuition_fee').notNull(),
}, (table) => ({
  collegeStreamUnique: uniqueIndex('idx_college_stream_unique').on(table.collegeId, table.streamCode),
  streamCodeIdx: index('idx_stream_code').on(table.streamCode),
  tuitionFeeCheck: check('tuition_fee_check', sql`${table.tuitionFee} >= 0`),
}));

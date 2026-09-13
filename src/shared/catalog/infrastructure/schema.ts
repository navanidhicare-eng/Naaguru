import { pgTable, uuid, varchar, timestamp, integer, boolean, pgEnum, uniqueIndex, AnyPgColumn, numeric } from 'drizzle-orm/pg-core';

export const catalogStatusEnum = pgEnum('catalog_status', ['ACTIVE', 'COMING_SOON', 'INACTIVE']);

export const locationTypeEnum = pgEnum('location_type', ['STATE', 'DISTRICT', 'MANDAL', 'LOCALITY']);

export const educationPathwaysTable = pgTable('education_pathways', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 30 }).unique().notNull(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  nameTe: varchar('name_te', { length: 100 }).notNull(),
  icon: varchar('icon', { length: 10 }),
  displayOrder: integer('display_order').notNull().default(0),
  status: catalogStatusEnum('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const educationProgramsTable = pgTable('education_programs', {
  id: uuid('id').primaryKey().defaultRandom(),
  pathwayId: uuid('pathway_id').notNull().references(() => educationPathwaysTable.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 30 }).notNull(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  nameTe: varchar('name_te', { length: 100 }).notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  status: catalogStatusEnum('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => {
  return {
    pathwayIdCodeIdx: uniqueIndex('idx_education_programs_pathway_code').on(table.pathwayId, table.code),
  };
});

export const locationsTable = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  parentId: uuid('parent_id').references((): AnyPgColumn => locationsTable.id, { onDelete: 'restrict' }),
  type: locationTypeEnum('type').notNull(),
  nameEn: varchar('name_en', { length: 150 }).notNull(),
  nameTe: varchar('name_te', { length: 150 }).notNull(),
  code: varchar('code', { length: 50 }),
  status: catalogStatusEnum('status').notNull().default('ACTIVE'),
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => {
  return {
    parentNameEnIdx: uniqueIndex('idx_locations_parent_name_en').on(table.parentId, table.nameEn),
    parentNameTeIdx: uniqueIndex('idx_locations_parent_name_te').on(table.parentId, table.nameTe),
  };
});

export const schoolsTable = pgTable('schools', {
  id: uuid('id').primaryKey().defaultRandom(),
  locationId: uuid('location_id').notNull().references(() => locationsTable.id, { onDelete: 'restrict' }),
  nameEn: varchar('name_en', { length: 150 }).notNull(),
  nameTe: varchar('name_te', { length: 150 }).notNull(),
  partnershipStatus: varchar('partnership_status', { length: 50 }),
  status: catalogStatusEnum('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => {
  return {
    locationSchoolNameIdx: uniqueIndex('idx_schools_location_name').on(table.locationId, table.nameEn),
  };
});

export const serviceAreasTable = pgTable('service_areas', {
  id: uuid('id').primaryKey().defaultRandom(),
  state: varchar('state', { length: 100 }).notNull(),
  district: varchar('district', { length: 100 }).notNull(),
  displayNameEn: varchar('display_name_en', { length: 150 }).notNull(),
  displayNameTe: varchar('display_name_te', { length: 150 }).notNull(),
  displayOrder: integer('display_order').notNull().default(0),
  status: catalogStatusEnum('status').notNull().default('ACTIVE'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => {
  return {
    stateDistrictIdx: uniqueIndex('idx_service_areas_state_district').on(table.state, table.district),
  };
});

import { pgTable, uuid, varchar, text, doublePrecision, jsonb, timestamp, uniqueIndex, boolean } from 'drizzle-orm/pg-core';
import { usersTable } from '@/shared/auth/schema';
import { assessmentAttemptsTable } from '@/modules/assessment/infrastructure/schema';

export const streamsTable = pgTable('streams', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: varchar('code', { length: 20 }).notNull().unique(), // MPC, BiPC, MEC, CEC
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
});

export const careerRulesetsTable = pgTable('career_rulesets', {
  id: uuid('id').primaryKey().defaultRandom(),
  status: varchar('status', { length: 20 }).notNull().default('DRAFT'), // DRAFT, PUBLISHED, ARCHIVED
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  isDefault: boolean('is_default').notNull().default(false),
});

export const careerRulesTable = pgTable('career_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  rulesetId: uuid('ruleset_id').notNull().references(() => careerRulesetsTable.id, { onDelete: 'cascade' }),
  streamId: uuid('stream_id').notNull().references(() => streamsTable.id, { onDelete: 'cascade' }),
  dimensionName: varchar('dimension_name', { length: 100 }).notNull(),
  weight: doublePrecision('weight').notNull().default(1.0),
});

export const recommendationsTable = pgTable('recommendations', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  attemptId: uuid('attempt_id').notNull().references(() => assessmentAttemptsTable.id, { onDelete: 'restrict' }).unique(),
  rulesetId: uuid('ruleset_id').notNull().references(() => careerRulesetsTable.id, { onDelete: 'restrict' }),
  rankedResultsJsonb: jsonb('ranked_results_jsonb').notNull(), // Array of { streamId, streamCode, score }
  appliedRulesJsonb: jsonb('applied_rules_jsonb').notNull(), // Snapshot of rules used
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

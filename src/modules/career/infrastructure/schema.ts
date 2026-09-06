import { pgTable, uuid, varchar, text, integer, doublePrecision, jsonb, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { usersTable } from '@/shared/auth/schema';
import { assessmentAttemptsTable } from '@/modules/assessment/infrastructure/schema';

export const streamsTable = pgTable('streams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
});

export const careerRulesTable = pgTable('career_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  streamId: uuid('stream_id').notNull().references(() => streamsTable.id, { onDelete: 'cascade' }),
  dimensionName: varchar('dimension_name', { length: 100 }).notNull(),
  minScore: integer('min_score').notNull().default(0),
  weight: doublePrecision('weight').notNull().default(1.0),
});

export const recommendationsTable = pgTable('recommendations', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  attemptId: uuid('attempt_id').notNull().references(() => assessmentAttemptsTable.id, { onDelete: 'cascade' }).unique(),
  rankedResultsJsonb: jsonb('ranked_results_jsonb').notNull(), // Array of { streamId, score, explanation }
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

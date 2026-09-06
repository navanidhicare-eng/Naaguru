import { pgTable, uuid, varchar, timestamp, integer, jsonb, primaryKey, foreignKey, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { usersTable } from '@/shared/auth/schema';

export const assessmentVersionsTable = pgTable('assessment_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  status: varchar('status', { length: 20 }).notNull().default('DRAFT'), // DRAFT, PUBLISHED, ARCHIVED
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const questionsTable = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  versionId: uuid('version_id').notNull().references(() => assessmentVersionsTable.id, { onDelete: 'cascade' }),
  sequence: integer('sequence').notNull(),
  textEn: varchar('text_en', { length: 1000 }).notNull(),
  textTe: varchar('text_te', { length: 1000 }).notNull(),
});

export const questionOptionsTable = pgTable('question_options', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionId: uuid('question_id').notNull().references(() => questionsTable.id, { onDelete: 'cascade' }),
  textEn: varchar('text_en', { length: 500 }).notNull(),
  textTe: varchar('text_te', { length: 500 }).notNull(),
});

export const dimensionsTable = pgTable('dimensions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull().unique(),
});

export const questionOptionWeightsTable = pgTable('question_option_weights', {
  optionId: uuid('option_id').notNull().references(() => questionOptionsTable.id, { onDelete: 'cascade' }),
  dimensionId: uuid('dimension_id').notNull().references(() => dimensionsTable.id, { onDelete: 'cascade' }),
  weight: integer('weight').notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.optionId, table.dimensionId] }),
  };
});

export const assessmentAttemptsTable = pgTable('assessment_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  versionId: uuid('version_id').notNull().references(() => assessmentVersionsTable.id, { onDelete: 'restrict' }),
  studentId: uuid('student_id').notNull().references(() => usersTable.id, { onDelete: 'restrict' }),
  state: varchar('state', { length: 20 }).notNull().default('IN_PROGRESS'), // IN_PROGRESS, COMPLETED
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  completedAt: timestamp('completed_at', { withTimezone: true, mode: 'string' }),
}, (table) => {
  return {
    inProgressIdx: uniqueIndex('in_progress_student_idx').on(table.studentId).where(sql`${table.state} = 'IN_PROGRESS'`),
  };
});

// Since the `where` clause in drizzle uniqueIndex requires sql`` or manual definition if simple expressions aren't supported, 
// I will use sql for safety:
// import { sql } from "drizzle-orm";
// inProgressIdx: uniqueIndex('in_progress_student_idx').on(table.studentId).where(sql`${table.state} = 'IN_PROGRESS'`)

export const attemptAnswersTable = pgTable('attempt_answers', {
  attemptId: uuid('attempt_id').notNull().references(() => assessmentAttemptsTable.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull().references(() => questionsTable.id, { onDelete: 'cascade' }),
  selectedOptionId: uuid('selected_option_id').notNull().references(() => questionOptionsTable.id, { onDelete: 'restrict' }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.attemptId, table.questionId] }),
  };
});

export const assessmentResultsTable = pgTable('assessment_results', {
  attemptId: uuid('attempt_id').primaryKey().references(() => assessmentAttemptsTable.id, { onDelete: 'cascade' }),
  dimensionScoresJsonb: jsonb('dimension_scores_jsonb').notNull(),
});

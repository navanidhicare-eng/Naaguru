import { pgTable, uuid, varchar, timestamp, integer, jsonb, primaryKey, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { usersTable } from '@/shared/auth/schema';

export const assessmentVersionsTable = pgTable('assessment_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  status: varchar('status', { length: 20 }).notNull().default('DRAFT'), // DRAFT, PUBLISHED, ARCHIVED
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const questionsTable = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  construct: varchar('construct', { length: 50 }).notNull(), // ISI, QCR, TMD, CEE, SHC, CEA, or CONTEXT
  type: varchar('type', { length: 50 }).notNull().default('SCORED'), // SCORED, UNSCORED
  textEn: varchar('text_en', { length: 1000 }).notNull(),
  textTe: varchar('text_te', { length: 1000 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const questionOptionsTable = pgTable('question_options', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionId: uuid('question_id').notNull().references(() => questionsTable.id, { onDelete: 'cascade' }),
  value: integer('value').notNull(), // 1 to 5 for Likert
  textEn: varchar('text_en', { length: 500 }).notNull(),
  textTe: varchar('text_te', { length: 500 }).notNull(),
});

export const assessmentVersionQuestionsTable = pgTable('assessment_version_questions', {
  versionId: uuid('version_id').notNull().references(() => assessmentVersionsTable.id, { onDelete: 'cascade' }),
  questionId: uuid('question_id').notNull().references(() => questionsTable.id, { onDelete: 'cascade' }),
  sequence: integer('sequence').notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.versionId, table.questionId] }),
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
  versionId: uuid('version_id').notNull().references(() => assessmentVersionsTable.id, { onDelete: 'restrict' }),
  scoringVersionId: uuid('scoring_version_id').notNull(), // Links to career_rulesets
  rawResponsesJsonb: jsonb('raw_responses_jsonb').notNull(), // Snapshot of { questionId, selectedOptionId, value }
  constructRawScoresJsonb: jsonb('construct_raw_scores_jsonb').notNull(), // Snapshot of { ISI: 25, QCR: 20 ... }
  dimensionScoresJsonb: jsonb('dimension_scores_jsonb').notNull(), // Standardized (POMP) scores
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

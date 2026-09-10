import { pgTable, uuid, varchar, timestamp, text, pgEnum, index } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['STUDENT', 'COLLEGE', 'ADMIN']);

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  phoneNumber: varchar('phone_number', { length: 20 }).unique(),
  email: varchar('email', { length: 255 }).unique(),
  passwordHash: text('password_hash'),
  role: userRoleEnum('role').default('STUDENT').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
});

export const sessionsTable = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  refreshTokenHash: text('refresh_token_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => ({
  refreshTokenHashIdx: index('idx_sessions_refresh_token_hash').on(t.refreshTokenHash),
}));

export const otpRequestsTable = pgTable('otp_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  codeHash: text('code_hash').notNull(),
  attempts: text('attempts').default('0').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (t) => ({
  phoneNumberIdx: index('idx_otp_requests_phone_number').on(t.phoneNumber),
}));

import 'dotenv/config';

if (!process.env.TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL is missing. Tests must run against a designated test database. Do not fall back to DATABASE_URL.');
}

// Override DATABASE_URL so that src/shared/database/db.ts connects to the test database
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

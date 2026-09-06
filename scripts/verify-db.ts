import 'dotenv/config';
import postgres from 'postgres';

async function verifyConnection() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set in the environment variables.');
    console.log('Ensure you have copied .env.example to .env.local and populated it.');
    process.exit(1);
  }

  console.log('Attempting to connect to PostgreSQL...');
  
  const sql = postgres(connectionString, { max: 1 });

  try {
    const result = await sql`SELECT version()`;
    console.log('✅ Connection successful!');
    console.log('Database Version:', result[0].version);
  } catch (error) {
    console.error('❌ Connection failed.');
    if (error instanceof Error) {
      console.error('Error Details:', error.message);
    }
    process.exit(1);
  } finally {
    await sql.end();
  }
}

verifyConnection();

const fs = require('fs');
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL);

async function run() {
  try {
    const q = fs.readFileSync('src/shared/database/migrations/0013_sturdy_maggott.sql', 'utf8').split('--> statement-breakpoint');
    for (const stmt of q) {
      if (stmt.trim()) {
        try {
            await sql.unsafe(stmt);
        } catch(e) {
            // Ignore type already exists
            if (e.code === '42710') {
               console.log('Type already exists, skipping:', stmt.substring(0, 50));
               continue;
            }
            // Ignore relation already exists
            if (e.code === '42P07') {
               console.log('Relation already exists, skipping:', stmt.substring(0, 50));
               continue;
            }
            throw e;
        }
      }
    }
    console.log('0013 success');
  } catch (e) {
    console.error('SQL Error:', e);
  } finally {
    await sql.end();
  }
}

run();

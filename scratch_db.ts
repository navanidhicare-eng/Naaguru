import { db } from './src/shared/database/db';
import { assessmentVersionsTable, questionsTable, questionOptionsTable } from './src/modules/assessment/infrastructure/schema';

async function main() {
  const q = await db.query.questionsTable.findFirst();
  console.log("Question ID:", q?.id);
  const opt = await db.query.questionOptionsTable.findFirst();
  console.log("Option ID:", opt?.id);
  process.exit(0);
}
main().catch(console.error);

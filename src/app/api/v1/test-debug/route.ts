import { NextResponse } from 'next/server';
import { db } from '@/shared/database/db';
import { questionsTable, questionOptionsTable } from '@/modules/assessment/infrastructure/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  const q = await db.query.questionsTable.findFirst();
  const o = await db.query.questionOptionsTable.findFirst();
  return NextResponse.json({ question: q, option: o });
}

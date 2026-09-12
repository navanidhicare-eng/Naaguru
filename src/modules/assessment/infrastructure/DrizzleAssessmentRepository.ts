import { IAssessmentRepository } from '../domain/IAssessmentRepository';
import { AssessmentVersion, Question, QuestionOption, QuestionOptionProps, QuestionProps } from '../domain/AssessmentVersion';
import { AssessmentAttempt, AttemptAnswerProps } from '../domain/AssessmentAttempt';
import { db } from '@/shared/database/db';
import { 
  assessmentVersionsTable, 
  questionsTable, 
  questionOptionsTable, 
  assessmentVersionQuestionsTable,
  assessmentAttemptsTable, 
  attemptAnswersTable, 
  assessmentResultsTable 
} from './schema';
import { eq, and, inArray, desc } from 'drizzle-orm';
import 'server-only';

export class DrizzleAssessmentRepository implements IAssessmentRepository {

  async getActiveVersion(): Promise<AssessmentVersion | null> {
    const versions = await db.select()
      .from(assessmentVersionsTable)
      .where(eq(assessmentVersionsTable.status, 'PUBLISHED'))
      .orderBy(desc(assessmentVersionsTable.createdAt))
      .limit(1);

    if (versions.length === 0) return null;
    return this.loadVersionAggregate(versions[0].id);
  }

  async getVersionById(id: string): Promise<AssessmentVersion | null> {
    return this.loadVersionAggregate(id);
  }

  private async loadVersionAggregate(versionId: string): Promise<AssessmentVersion | null> {
    const versionRows = await db.select().from(assessmentVersionsTable).where(eq(assessmentVersionsTable.id, versionId));
    if (versionRows.length === 0) return null;

    const versionRow = versionRows[0];

    // Fetch questions mapped to this version
    const qRows = await db.select({
      id: questionsTable.id,
      construct: questionsTable.construct,
      type: questionsTable.type,
      textEn: questionsTable.textEn,
      textTe: questionsTable.textTe,
      sequence: assessmentVersionQuestionsTable.sequence,
    })
    .from(questionsTable)
    .innerJoin(assessmentVersionQuestionsTable, eq(questionsTable.id, assessmentVersionQuestionsTable.questionId))
    .where(eq(assessmentVersionQuestionsTable.versionId, versionId))
    .orderBy(assessmentVersionQuestionsTable.sequence);

    if (qRows.length === 0) {
      return AssessmentVersion.create({
        id: versionRow.id,
        status: versionRow.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
        createdAt: versionRow.createdAt,
        questions: [],
      });
    }

    const questionIds = qRows.map(q => q.id);

    // Fetch options
    const oRows = await db.select().from(questionOptionsTable)
      .where(inArray(questionOptionsTable.questionId, questionIds));

    // Map options
    const optionsMap = new Map<string, QuestionOption[]>();
    for (const optionRow of oRows) {
      const qOption = QuestionOption.create({
        id: optionRow.id,
        questionId: optionRow.questionId,
        textEn: optionRow.textEn,
        textTe: optionRow.textTe,
        value: optionRow.value,
      });

      if (!optionsMap.has(optionRow.questionId)) {
        optionsMap.set(optionRow.questionId, []);
      }
      optionsMap.get(optionRow.questionId)!.push(qOption);
    }

    // Assemble questions
    const questions = qRows.map(qRow => Question.create({
      id: qRow.id,
      construct: qRow.construct,
      type: qRow.type,
      sequence: qRow.sequence,
      textEn: qRow.textEn,
      textTe: qRow.textTe,
      options: optionsMap.get(qRow.id) || [],
    }));

    return AssessmentVersion.create({
      id: versionRow.id,
      status: versionRow.status as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
      createdAt: versionRow.createdAt,
      questions,
    });
  }

  async getActiveAttempt(studentId: string): Promise<AssessmentAttempt | null> {
    const attempts = await db.select()
      .from(assessmentAttemptsTable)
      .where(
        and(
          eq(assessmentAttemptsTable.studentId, studentId),
          eq(assessmentAttemptsTable.state, 'IN_PROGRESS')
        )
      )
      .limit(1);

    if (attempts.length === 0) return null;
    return this.loadAttemptAggregate(attempts[0].id);
  }

  async getAttemptById(attemptId: string, studentId: string): Promise<AssessmentAttempt | null> {
    const attempts = await db.select()
      .from(assessmentAttemptsTable)
      .where(
        and(
          eq(assessmentAttemptsTable.id, attemptId),
          eq(assessmentAttemptsTable.studentId, studentId)
        )
      )
      .limit(1);

    if (attempts.length === 0) return null;
    return this.loadAttemptAggregate(attempts[0].id);
  }

  async getLatestCompletedAttempt(studentId: string): Promise<AssessmentAttempt | null> {
    const attempts = await db.select()
      .from(assessmentAttemptsTable)
      .where(
        and(
          eq(assessmentAttemptsTable.studentId, studentId),
          eq(assessmentAttemptsTable.state, 'COMPLETED')
        )
      )
      .orderBy(desc(assessmentAttemptsTable.completedAt))
      .limit(1);

    if (attempts.length === 0) return null;
    return this.loadAttemptAggregate(attempts[0].id);
  }

  private async loadAttemptAggregate(attemptId: string): Promise<AssessmentAttempt | null> {
    const attemptRows = await db.select().from(assessmentAttemptsTable).where(eq(assessmentAttemptsTable.id, attemptId));
    if (attemptRows.length === 0) return null;

    const attempt = attemptRows[0];

    const answerRows = await db.select().from(attemptAnswersTable)
      .where(eq(attemptAnswersTable.attemptId, attemptId));

    const answers: AttemptAnswerProps[] = answerRows.map(a => ({
      questionId: a.questionId,
      selectedOptionId: a.selectedOptionId,
    }));

    let scoringVersionId: string | null = null;
    let rawResponsesJsonb: any = null;
    let constructRawScoresJsonb: Record<string, number> | null = null;
    let dimensionScores: Record<string, number> | null = null;

    if (attempt.state === 'COMPLETED') {
      const resultRows = await db.select().from(assessmentResultsTable)
        .where(eq(assessmentResultsTable.attemptId, attemptId));
      if (resultRows.length > 0) {
        const res = resultRows[0];
        scoringVersionId = res.scoringVersionId;
        rawResponsesJsonb = res.rawResponsesJsonb;
        constructRawScoresJsonb = res.constructRawScoresJsonb as Record<string, number>;
        dimensionScores = res.dimensionScoresJsonb as Record<string, number>;
      }
    }

    return AssessmentAttempt.create({
      id: attempt.id,
      versionId: attempt.versionId,
      studentId: attempt.studentId,
      state: attempt.state as 'IN_PROGRESS' | 'COMPLETED',
      createdAt: attempt.createdAt,
      completedAt: attempt.completedAt,
      answers,
      scoringVersionId,
      rawResponsesJsonb,
      constructRawScoresJsonb,
      dimensionScores,
    });
  }

  async saveAttempt(attempt: AssessmentAttempt): Promise<void> {
    await db.transaction(async (tx) => {
      // Upsert attempt
      await tx.insert(assessmentAttemptsTable).values({
        id: attempt.id,
        versionId: attempt.versionId,
        studentId: attempt.studentId,
        state: attempt.state,
        createdAt: attempt.props.createdAt,
        completedAt: attempt.props.completedAt,
      }).onConflictDoUpdate({
        target: assessmentAttemptsTable.id,
        set: {
          state: attempt.state,
          completedAt: attempt.props.completedAt,
        }
      });

      // Upsert answers
      for (const answer of attempt.answers) {
        await tx.insert(attemptAnswersTable).values({
          attemptId: attempt.id,
          questionId: answer.questionId,
          selectedOptionId: answer.selectedOptionId,
        }).onConflictDoUpdate({
          target: [attemptAnswersTable.attemptId, attemptAnswersTable.questionId],
          set: {
            selectedOptionId: answer.selectedOptionId,
          }
        });
      }

      // If completed, upsert result
      if (attempt.isCompleted && attempt.dimensionScores) {
        await tx.insert(assessmentResultsTable).values({
          attemptId: attempt.id,
          versionId: attempt.versionId,
          scoringVersionId: attempt.scoringVersionId!,
          rawResponsesJsonb: attempt.rawResponsesJsonb,
          constructRawScoresJsonb: attempt.constructRawScoresJsonb!,
          dimensionScoresJsonb: attempt.dimensionScores,
        }).onConflictDoUpdate({
          target: assessmentResultsTable.attemptId,
          set: {
            dimensionScoresJsonb: attempt.dimensionScores,
            constructRawScoresJsonb: attempt.constructRawScoresJsonb!,
            rawResponsesJsonb: attempt.rawResponsesJsonb,
          }
        });
      }
    });
  }
}

import 'dotenv/config';
import { db } from '../src/shared/database/db';
import { 
  questionsTable, 
  questionOptionsTable, 
  assessmentVersionsTable, 
  assessmentVersionQuestionsTable 
} from '../src/modules/assessment/infrastructure/schema';
import { 
  streamsTable, 
  careerRulesetsTable, 
  careerRulesTable 
} from '../src/modules/career/infrastructure/schema';

async function seed() {
  console.log('Seeding database...');

  // 1. Create Assessment Version
  const [version] = await db.insert(assessmentVersionsTable).values({
    status: 'PUBLISHED',
  }).returning();

  console.log(`Created Assessment Version: ${version.id}`);

  // 2. Insert Constructs & Questions (Generating dummy items mapped to constructs based on research spec)
  // The research specified 6 constructs: ISI, QCR, TMD, CEE, SHC, CEA
  const constructs = ['ISI', 'QCR', 'TMD', 'CEE', 'SHC', 'CEA'];
  const questionsData = [];

  let sequence = 1;
  for (const construct of constructs) {
    for (let i = 1; i <= 6; i++) {
      questionsData.push({
        construct,
        type: 'SCORED',
        textEn: `Sample Question ${i} for ${construct}`,
        textTe: `${construct} కోసం నమూనా ప్రశ్న ${i}`,
        sequence: sequence++,
      });
    }
  }

  // Insert questions
  for (const qData of questionsData) {
    const [insertedQuestion] = await db.insert(questionsTable).values({
      construct: qData.construct,
      type: qData.type,
      textEn: qData.textEn,
      textTe: qData.textTe,
    }).returning();

    // Map to version
    await db.insert(assessmentVersionQuestionsTable).values({
      versionId: version.id,
      questionId: insertedQuestion.id,
      sequence: qData.sequence,
    });

    // Insert options (1 to 5 scale)
    const options = [
      { value: 1, textEn: 'Strongly Disagree', textTe: 'పూర్తిగా ఏకీభవించడం లేదు' },
      { value: 2, textEn: 'Disagree', textTe: 'ఏకీభవించడం లేదు' },
      { value: 3, textEn: 'Neutral', textTe: 'తటస్థం' },
      { value: 4, textEn: 'Agree', textTe: 'ఏకీభవిస్తున్నాను' },
      { value: 5, textEn: 'Strongly Agree', textTe: 'పూర్తిగా ఏకీభవిస్తున్నాను' },
    ];

    for (const opt of options) {
      await db.insert(questionOptionsTable).values({
        questionId: insertedQuestion.id,
        value: opt.value,
        textEn: opt.textEn,
        textTe: opt.textTe,
      });
    }
  }
  
  console.log('Inserted Questions and mapped to Assessment Version');

  // 3. Create Streams
  const streams = [
    { code: 'MPC', name: 'MPC', description: 'Maths, Physics, Chemistry' },
    { code: 'BiPC', name: 'BiPC', description: 'Biology, Physics, Chemistry' },
    { code: 'CEC', name: 'CEC', description: 'Commerce, Economics, Civics' },
    { code: 'HEC', name: 'HEC', description: 'History, Economics, Civics' },
    { code: 'MEC', name: 'MEC', description: 'Maths, Economics, Commerce' },
  ];

  const insertedStreams = [];
  for (const s of streams) {
    const [inserted] = await db.insert(streamsTable).values({
      code: s.code,
      name: s.name,
      description: s.description,
    }).returning();
    insertedStreams.push(inserted);
  }

  console.log('Inserted Streams');

  // 4. Create Career Ruleset
  const [ruleset] = await db.insert(careerRulesetsTable).values({
    status: 'PUBLISHED',
    isDefault: true,
  }).returning();

  console.log(`Created Career Ruleset: ${ruleset.id}`);

  // 5. Insert Career Rules
  // Just arbitrary weights for now, awaiting clinical configuration
  for (const stream of insertedStreams) {
    for (const construct of constructs) {
      // Assign weight 1.0 to a few dimensions per stream for illustration
      const weight = Math.random() > 0.5 ? 1.0 : 0.0;
      if (weight > 0) {
        await db.insert(careerRulesTable).values({
          rulesetId: ruleset.id,
          streamId: stream.id,
          dimensionName: construct,
          weight,
        });
      }
    }
  }

  console.log('Inserted Career Rules');
  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

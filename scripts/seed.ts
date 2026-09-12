import 'dotenv/config';
import fs from 'fs';
import path from 'path';
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

// Helper to load JSON
function loadJson(filename: string) {
  const filepath = path.join(__dirname, 'seed_data', filename);
  const content = fs.readFileSync(filepath, 'utf8').replace(/\u0000/g, '');
  return JSON.parse(content);
}

async function seed() {
  console.log('Seeding database...');

  // 1. Create Assessment Version
  const [version] = await db.insert(assessmentVersionsTable).values({
    status: 'PUBLISHED',
  }).returning();

  console.log(`Created Assessment Version: ${version.id}`);

  // 2. Insert Constructs & Questions
  const questionsData = loadJson('questions_final.json');

  const scoredOptions = [
    { value: 1, textEn: 'Strongly Dislike / Not Interested At All', textTe: 'పూర్తిగా ఇష్టం లేదు / ఆసక్తి లేదు' },
    { value: 2, textEn: 'Dislike / Slightly Uninterested', textTe: 'ఇష్టం లేదు / కొంచెం ఆసక్తి లేదు' },
    { value: 3, textEn: 'Neutral / Unsure', textTe: 'తటస్థం / కచ్చితంగా తెలియదు' },
    { value: 4, textEn: 'Like / Interested', textTe: 'ఇష్టం / ఆసక్తి ఉంది' },
    { value: 5, textEn: 'Strongly Like / Extremely Interested', textTe: 'చాలా ఇష్టం / బాగా ఆసక్తి ఉంది' },
  ];

  const ctxOptionsMap: Record<string, { value: number, textEn: string, textTe: string }[]> = {
    'CTX-01': [
      { value: 1, textEn: 'Mathematics (Algebra, Geometry, Trigonometry)', textTe: 'గణితం' },
      { value: 2, textEn: 'Physical Science (Physics, Chemistry)', textTe: 'భౌతిక శాస్త్రం' },
      { value: 3, textEn: 'Biological Science (Plants, Animals)', textTe: 'జీవ శాస్త్రం' },
      { value: 4, textEn: 'Social Studies (History, Economics, Civics)', textTe: 'సాంఘిక శాస్త్రం' },
      { value: 5, textEn: 'Languages and Literature', textTe: 'భాషలు' },
    ],
    'CTX-02': [
      { value: 1, textEn: 'Engineering / Technology', textTe: 'ఇంజనీరింగ్ / టెక్నాలజీ' },
      { value: 2, textEn: 'Medical / Healthcare', textTe: 'వైద్యం / ఆరోగ్యం' },
      { value: 3, textEn: 'Commerce / Business', textTe: 'కామర్స్ / వ్యాపారం' },
      { value: 4, textEn: 'Civil Services / Govt', textTe: 'సివిల్ సర్వీసెస్ / ప్రభుత్వ' },
      { value: 5, textEn: 'Whatever matches my interests', textTe: 'నా ఆసక్తికి తగినట్లు' },
      { value: 6, textEn: 'We have not discussed this yet', textTe: 'ఇంకా చర్చించలేదు' },
    ],
    'CTX-03': [
      { value: 1, textEn: 'Professional Bachelor’s degree (B.Tech, MBBS, etc.)', textTe: 'బ్యాచిలర్ డిగ్రీ' },
      { value: 2, textEn: 'Short 2-year or 3-year diploma to start earning', textTe: 'డిప్లొమా' },
      { value: 3, textEn: 'Advanced postgraduate study (Masters, CA, etc.)', textTe: 'పోస్ట్ గ్రాడ్యుయేట్ డిగ్రీ' },
      { value: 4, textEn: 'I am still exploring options', textTe: 'ఇంకా ఆలోచిస్తున్నాను' },
    ],
    'CTX-04': [
      { value: 1, textEn: 'Working at an indoor desk using a computer', textTe: 'కంప్యూటర్ తో పని' },
      { value: 2, textEn: 'Working actively in outdoor fields, nature', textTe: 'బయట పని' },
      { value: 3, textEn: 'Working in laboratories, hospitals', textTe: 'ల్యాబ్‌లు, ఆసుపత్రులు' },
      { value: 4, textEn: 'Moving around to interact with people', textTe: 'ప్రజలతో పరస్పర చర్య' },
    ]
  };

  for (const qData of questionsData) {
    const [insertedQuestion] = await db.insert(questionsTable).values({
      construct: qData.construct,
      type: qData.type,
      textEn: qData.englishStem.replace(/\0/g, ''),
      textTe: qData.teluguStem.replace(/\0/g, ''),
    }).returning();

    // Map to version
    await db.insert(assessmentVersionQuestionsTable).values({
      versionId: version.id,
      questionId: insertedQuestion.id,
      sequence: qData.pos,
    });

    // Insert options
    let options = scoredOptions;
    if (qData.type === 'CONTEXT' && ctxOptionsMap[qData.itemId]) {
      options = ctxOptionsMap[qData.itemId];
    }

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

  // 5. Insert Career Rules from rules.json
  const rulesData = loadJson('rules.json');
  for (const streamRules of rulesData) {
    const stream = insertedStreams.find(s => s.code.toUpperCase() === streamRules.streamCode.toUpperCase());
    if (!stream) continue;

    for (const rule of streamRules.rules) {
      await db.insert(careerRulesTable).values({
        rulesetId: ruleset.id,
        streamId: stream.id,
        dimensionName: rule.dimensionName,
        weight: rule.weight,
      });
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

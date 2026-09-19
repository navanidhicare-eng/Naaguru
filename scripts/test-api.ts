import 'dotenv/config';
import { CollegeModule } from '../src/modules/college';

async function testAPI() {
  console.log('Testing GET /api/v1/colleges...');
  try {
    const colleges = await CollegeModule.searchActiveColleges({});
    console.log(`Found ${colleges.length} public colleges:`);
    colleges.forEach(c => {
      console.log(`- ${c.name} (${c.id})`);
    });

    if (colleges.length !== 6) {
      console.warn(`Expected 6 colleges, but got ${colleges.length}.`);
    } else {
      console.log('✅ Correct number of colleges are publicly visible (6).');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
  process.exit(0);
}

testAPI();

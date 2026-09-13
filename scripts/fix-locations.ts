import 'dotenv/config';
import postgres from 'postgres';

async function fix() {
  const sql = postgres(process.env.DATABASE_URL!);
  
  console.log('Fixing duplicate locations...');
  
  const [latestAP] = await sql`
    SELECT id FROM locations 
    WHERE type = 'STATE' AND name_en = 'Andhra Pradesh' 
    ORDER BY created_at DESC LIMIT 1
  `;
  
  if (!latestAP) {
    console.log('No AP found.');
    process.exit(0);
  }
  
  // Find all older APs
  const oldAPs = await sql`
    SELECT id FROM locations 
    WHERE type = 'STATE' AND name_en = 'Andhra Pradesh' AND id != ${latestAP.id}
  `;
  
  for (const ap of oldAPs) {
    // For each old AP, find its districts
    const oldDistricts = await sql`SELECT id, name_en FROM locations WHERE parent_id = ${ap.id} AND type = 'DISTRICT'`;
    
    for (const dist of oldDistricts) {
      // Find the equivalent district under the newest AP
      const [newDist] = await sql`
        SELECT id FROM locations 
        WHERE parent_id = ${latestAP.id} AND name_en = ${dist.name_en} AND type = 'DISTRICT'
      `;
      
      if (newDist) {
        // Move references
        await sql`UPDATE students SET residence_location_id = ${newDist.id} WHERE residence_location_id = ${dist.id}`;
        await sql`UPDATE student_college_intents SET preferred_location_id = ${newDist.id} WHERE preferred_location_id = ${dist.id}`;
        await sql`UPDATE schools SET location_id = ${newDist.id} WHERE location_id = ${dist.id}`;
        
        // Delete old district (and its children)
        await sql`
          WITH RECURSIVE loc_tree AS (
            SELECT id FROM locations WHERE id = ${dist.id}
            UNION ALL
            SELECT l.id FROM locations l
            INNER JOIN loc_tree t ON l.parent_id = t.id
          )
          DELETE FROM locations WHERE id IN (SELECT id FROM loc_tree);
        `;
      }
    }
    
    // Delete the old AP
    await sql`DELETE FROM locations WHERE id = ${ap.id}`;
  }
  
  console.log('Done mapping and deleting!');
  await sql.end();
}

fix().catch(console.error);

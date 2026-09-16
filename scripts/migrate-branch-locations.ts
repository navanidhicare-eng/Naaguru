/**
 * migrate-branch-locations.ts
 *
 * Dry-run tool to map legacy College location strings to canonical Branch.locationId values.
 *
 * BEHAVIOR:
 *   Default: DRY-RUN — reads and reports only. No DB writes.
 *   Write mode: pass --write flag to actually update locationId values.
 *
 * RULES:
 *   - Only targets MAIN_CAMPUS branches where locationId IS NULL.
 *   - Exact name match only. No fuzzy matching.
 *   - Only assigns a LOCALITY-type location.
 *   - Never assigns DISTRICT or MANDAL as a fallback.
 *   - Never creates locations.
 *   - Never overwrites an existing locationId.
 *   - Is idempotent: branches with locationId already set are skipped.
 *
 * USAGE:
 *   npx tsx scripts/migrate-branch-locations.ts           # dry-run (default)
 *   npx tsx scripts/migrate-branch-locations.ts --write   # apply mapping
 */
import 'dotenv/config';
import { db } from '../src/shared/database/db';
import { sql } from 'drizzle-orm';

const isDryRun = !process.argv.includes('--write');

interface CollegeBranchRow {
  [key: string]: unknown;
  collegeId: string;
  collegeName: string;
  collegeState: string;
  collegeDistrict: string;
  collegeCity: string;
  branchId: string;
}

interface LocationRow {
  [key: string]: unknown;
  id: string;
  type: string;
  nameEn: string;
  parentId: string | null;
  status: string;
}

type MappingStatus =
  | { status: 'MAPPED'; locationId: string; localityName: string }
  | { status: 'UNRESOLVED'; reason: string }
  | { status: 'SKIPPED'; reason: string };

async function resolveToLocality(
  allLocations: LocationRow[],
  state: string,
  district: string,
  city: string,
): Promise<MappingStatus> {
  // Step 1: Find matching STATE
  const stateMatch = allLocations.find(
    (l) => l.type === 'STATE' && l.nameEn.toLowerCase() === state.toLowerCase(),
  );
  if (!stateMatch) {
    return { status: 'UNRESOLVED', reason: `State "${state}" not found in canonical catalog.` };
  }

  // Step 2: Find matching DISTRICT under that STATE
  const districtMatch = allLocations.find(
    (l) =>
      l.type === 'DISTRICT' &&
      l.parentId === stateMatch.id &&
      l.nameEn.toLowerCase() === district.toLowerCase(),
  );
  if (!districtMatch) {
    return {
      status: 'UNRESOLVED',
      reason: `District "${district}" not found under state "${state}" in canonical catalog.`,
    };
  }

  // Step 3: Search all MANDALs under this DISTRICT, then all LOCALITYs under those MANDALs.
  // We look for a LOCALITY whose name_en matches the city string (exact, case-insensitive).
  const mandalsUnderDistrict = allLocations.filter(
    (l) => l.type === 'MANDAL' && l.parentId === districtMatch.id,
  );

  const mandalIds = new Set(mandalsUnderDistrict.map((m) => m.id));

  // Also check LOCALITYs directly under the district (unusual but possible)
  const allEligibleParentIds = new Set([districtMatch.id, ...mandalIds]);

  const localityMatches = allLocations.filter(
    (l) =>
      l.type === 'LOCALITY' &&
      l.parentId !== null &&
      allEligibleParentIds.has(l.parentId) &&
      l.nameEn.toLowerCase() === city.toLowerCase(),
  );

  if (localityMatches.length === 0) {
    // Explain how deep we got
    if (mandalsUnderDistrict.length === 0) {
      return {
        status: 'UNRESOLVED',
        reason: `District "${district}" exists but has no mandals or localities in the catalog. Cannot match city "${city}".`,
      };
    }
    return {
      status: 'UNRESOLVED',
      reason: `No canonical LOCALITY named "${city}" found under district "${district}" (searched ${mandalsUnderDistrict.length} mandal(s)).`,
    };
  }

  if (localityMatches.length > 1) {
    // Ambiguous — more than one LOCALITY with the same name under this district
    return {
      status: 'UNRESOLVED',
      reason: `Ambiguous: ${localityMatches.length} LOCALITYs named "${city}" found under district "${district}". Cannot safely choose one.`,
    };
  }

  const locality = localityMatches[0];

  if (locality.status !== 'ACTIVE') {
    return {
      status: 'UNRESOLVED',
      reason: `Canonical LOCALITY "${city}" exists but its status is "${locality.status}", not ACTIVE.`,
    };
  }

  return { status: 'MAPPED', locationId: locality.id, localityName: locality.nameEn };
}

async function run() {
  console.log(`\n=== Branch Location Migration Tool ===`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (no writes)' : '⚠️  WRITE MODE'}\n`);

  // Fetch all MAIN_CAMPUS branches with locationId IS NULL
  const rows = await db.execute<CollegeBranchRow>(sql`
    SELECT
      c.id         AS "collegeId",
      c.name       AS "collegeName",
      c.state      AS "collegeState",
      c.district   AS "collegeDistrict",
      c.city       AS "collegeCity",
      b.id         AS "branchId"
    FROM branches b
    JOIN colleges c ON c.id = b.college_id
    WHERE b.type = 'MAIN_CAMPUS'
      AND b.location_id IS NULL
    ORDER BY c.name
  `);

  if (rows.length === 0) {
    console.log('No unresolved MAIN_CAMPUS branches found. Nothing to do.');
    process.exit(0);
  }

  // Fetch entire canonical location catalog once
  const allLocations = await db.execute<LocationRow>(sql`
    SELECT id, type, name_en AS "nameEn", parent_id AS "parentId", status
    FROM locations
    ORDER BY type, name_en
  `);

  let mapped = 0;
  let unresolved = 0;

  for (const row of rows) {
    const result = await resolveToLocality(
      allLocations,
      row.collegeState,
      row.collegeDistrict,
      row.collegeCity,
    );

    if (result.status === 'MAPPED') {
      console.log(`[MAPPED]`);
      console.log(`  College : ${row.collegeName}`);
      console.log(`  Branch  : ${row.branchId}`);
      console.log(`  Locality: ${result.localityName} (${result.locationId})`);

      if (!isDryRun) {
        await db.execute(sql`
          UPDATE branches
          SET location_id = ${result.locationId},
              updated_at = NOW()
          WHERE id = ${row.branchId}
            AND location_id IS NULL
        `);
        console.log(`  → Written to DB.`);
      } else {
        console.log(`  → (dry-run) No change written.`);
      }

      mapped++;
    } else {
      console.log(`[UNRESOLVED]`);
      console.log(`  College : ${row.collegeName}`);
      console.log(`  Branch  : ${row.branchId}`);
      console.log(`  Legacy  : ${row.collegeState} / ${row.collegeDistrict} / ${row.collegeCity}`);
      console.log(`  Reason  : ${result.reason}`);
      unresolved++;
    }

    console.log('');
  }

  console.log(`=== Summary ===`);
  console.log(`  MAPPED     : ${mapped}`);
  console.log(`  UNRESOLVED : ${unresolved}`);
  console.log(`  Mode       : ${isDryRun ? 'DRY-RUN (no writes)' : 'WRITE'}`);

  if (isDryRun && mapped > 0) {
    console.log(`\nTo apply the ${mapped} resolved mapping(s), re-run with --write flag.`);
  }

  process.exit(0);
}

run().catch((err) => {
  console.error('Migration tool failed:', err);
  process.exit(1);
});

import { eq, and, or, lte, inArray, sql } from 'drizzle-orm';
import { db } from '@/shared/database/db';
import { collegesTable, collegeStreamOfferingsTable, branchesTable } from './schema';
import { locationsTable } from '@/shared/catalog/infrastructure/schema';
import { College, CollegeStreamOffering, CollegeStatus, VerificationStatus, OwnershipType, Branch, BranchType } from '../domain/models';
import { ICollegeRepository, CollegeSearchCriteria } from '../domain/ICollegeRepository';
import { StreamCode } from '@/shared/domain/StreamCode';

export class DrizzleCollegeRepository implements ICollegeRepository {
  
  async findById(id: string): Promise<College | null> {
    const rows = await db
      .select()
      .from(collegesTable)
      .leftJoin(branchesTable, eq(branchesTable.collegeId, collegesTable.id))
      .leftJoin(locationsTable, eq(branchesTable.locationId, locationsTable.id))
      .leftJoin(collegeStreamOfferingsTable, eq(collegeStreamOfferingsTable.branchId, branchesTable.id))
      .where(eq(collegesTable.id, id));

    if (rows.length === 0) return null;

    return this.mapToDomain(rows);
  }

  async searchActiveVerified(criteria: CollegeSearchCriteria): Promise<{ college: College; matchedBranchId: string }[]> {
    const conditions = [
      eq(collegesTable.status, 'ACTIVE'),
      eq(collegesTable.verificationStatus, 'VERIFIED'),
      eq(branchesTable.isPubliclyEligible, true)
    ];

    if (criteria.locationId) {
      conditions.push(eq(branchesTable.locationId, criteria.locationId));
    }
    
    if (criteria.requiresHostel) {
      conditions.push(or(eq(branchesTable.hasBoysHostel, true), eq(branchesTable.hasGirlsHostel, true))!);
    }
    if (criteria.requiresBoysHostel) conditions.push(eq(branchesTable.hasBoysHostel, true));
    if (criteria.requiresGirlsHostel) conditions.push(eq(branchesTable.hasGirlsHostel, true));

    if (criteria.streamCode) {
      conditions.push(eq(collegeStreamOfferingsTable.streamCode, criteria.streamCode));
    }
    
    if (criteria.maxFee !== undefined) {
      conditions.push(lte(collegeStreamOfferingsTable.minFee, criteria.maxFee));
    }

    // 1. Qualifying Phase: Find college IDs where AT LEAST ONE branch satisfies ALL criteria
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let qualifyingQuery: any = db
      .select({ id: collegesTable.id, branchId: branchesTable.id })
      .from(collegesTable)
      .innerJoin(branchesTable, eq(branchesTable.collegeId, collegesTable.id));

    if (criteria.streamCode || criteria.maxFee !== undefined) {
      qualifyingQuery = qualifyingQuery.innerJoin(
        collegeStreamOfferingsTable, 
        eq(collegeStreamOfferingsTable.branchId, branchesTable.id)
      );
    }

    qualifyingQuery = qualifyingQuery.where(and(...conditions));

    const qualifyingRows = await qualifyingQuery;
    
    const matchedBranches = new Map<string, string>();
    for (const r of qualifyingRows) {
      if (!matchedBranches.has(r.id)) {
        matchedBranches.set(r.id, r.branchId);
      }
    }
    
    const collegeIds = Array.from(matchedBranches.keys());

    if (collegeIds.length === 0) return [];

    // 2. Fetch Phase: Retrieve the complete aggregate (all branches, all offerings)
    const fullRows = await db
      .select()
      .from(collegesTable)
      .leftJoin(branchesTable, eq(branchesTable.collegeId, collegesTable.id))
      .leftJoin(locationsTable, eq(branchesTable.locationId, locationsTable.id))
      .leftJoin(collegeStreamOfferingsTable, eq(collegeStreamOfferingsTable.branchId, branchesTable.id))
      .where(inArray(collegesTable.id, collegeIds));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collegesMap = new Map<string, any[]>();
    for (const row of fullRows) {
      if (!collegesMap.has(row.colleges.id)) {
        collegesMap.set(row.colleges.id, []);
      }
      collegesMap.get(row.colleges.id)!.push(row);
    }

    return Array.from(collegesMap.values()).map(groupedRows => {
      const college = this.mapToDomain(groupedRows);
      return { college, matchedBranchId: matchedBranches.get(college.id)! };
    });
  }

  async save(college: College): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.insert(collegesTable).values({
        id: college.id,
        name: college.name,
        shortName: college.shortName,
        description: college.description,
        website: college.website,
        contactPhone: college.contactPhone,
        contactEmail: college.contactEmail,
        state: null,
        district: null,
        city: null,
        address: null,
        lat: null,
        lng: null,
        ownershipType: college.ownershipType,
        status: college.status,
        verificationStatus: college.verificationStatus,
        createdAt: college.createdAt,
        updatedAt: college.updatedAt,
      }).onConflictDoUpdate({
        target: collegesTable.id,
        set: {
          name: college.name,
          shortName: college.shortName,
          description: college.description,
          website: college.website,
          contactPhone: college.contactPhone,
          contactEmail: college.contactEmail,
          state: null,
          district: null,
          city: null,
          address: null,
          lat: null,
          lng: null,
          ownershipType: college.ownershipType,
          status: college.status,
          verificationStatus: college.verificationStatus,
          updatedAt: college.updatedAt,
        }
      });

      // Fetch all branches for this college to sync their offerings.
      const branches = await tx.select({ id: branchesTable.id })
        .from(branchesTable)
        .where(eq(branchesTable.collegeId, college.id));
      
      const branchIds = branches.map(b => b.id);
      
      if (college.branches.length > 0) {
        for (const b of college.branches) {
          await tx.update(branchesTable)
            .set({
              hasBoysHostel: b.hostel.hasBoysHostel,
              hasGirlsHostel: b.hostel.hasGirlsHostel,
              annualHostelFee: b.hostel.annualHostelFee,
            })
            .where(eq(branchesTable.id, b.id));
        }
      }
      
      if (branchIds.length > 0) {
        // ID-aware synchronization of stream offerings across all branches of this college
        const existingOfferings = await tx.select({ id: collegeStreamOfferingsTable.id })
          .from(collegeStreamOfferingsTable)
          .where(inArray(collegeStreamOfferingsTable.branchId, branchIds));
        
        const existingIds = new Set(existingOfferings.map(o => o.id));
        
        const allOfferings = college.branches.flatMap(b => b.offerings);
        const incomingIds = new Set(allOfferings.map(o => o.id));

        const idsToDelete = [...existingIds].filter(id => !incomingIds.has(id));

        if (idsToDelete.length > 0) {
          await tx.delete(collegeStreamOfferingsTable)
            .where(inArray(collegeStreamOfferingsTable.id, idsToDelete));
        }

        if (allOfferings.length > 0) {
          await tx.insert(collegeStreamOfferingsTable).values(
            allOfferings.map(o => ({
              id: o.id,
              branchId: o.branchId,
              streamCode: o.streamCode,
              minFee: o.minFee,
              maxFee: o.maxFee,
            }))
          ).onConflictDoUpdate({
            target: collegeStreamOfferingsTable.id,
            set: {
              branchId: sql`EXCLUDED.branch_id`,
              streamCode: sql`EXCLUDED.stream_code`,
              minFee: sql`EXCLUDED.min_fee`,
              maxFee: sql`EXCLUDED.max_fee`,
            }
          });
        }
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapToDomain(rows: any[]): College {
    const c = rows[0].colleges;
    const offerings = rows
      .filter(r => r.college_stream_offerings != null)
      .map(r => {
        const o = r.college_stream_offerings;
        return CollegeStreamOffering.create({
          id: o.id,
          branchId: o.branchId!,
          streamCode: o.streamCode as StreamCode,
          minFee: o.minFee!,
          maxFee: o.maxFee!,
        });
      });

    // Deduplicate offerings by ID since joining with branches might duplicate the college row
    const uniqueOfferings = Array.from(new Map(offerings.map(o => [o.id, o])).values());

    const branchesMap = new Map<string, Branch>();
    
    rows.forEach(r => {
      if (r.branches) {
        if (!branchesMap.has(r.branches.id)) {
          branchesMap.set(r.branches.id, Branch.create({
            id: r.branches.id,
            name: r.branches.name,
            type: r.branches.type as BranchType,
            locationId: r.branches.locationId,
            locationName: r.locations ? r.locations.nameEn : null,
            address: r.branches.address,
            lat: r.branches.lat ? Number(r.branches.lat) : null,
            lng: r.branches.lng ? Number(r.branches.lng) : null,
            contactPhone: r.branches.contactPhone,
            contactEmail: r.branches.contactEmail,
            isPubliclyEligible: r.branches.isPubliclyEligible,
            hostel: {
              branchId: r.branches.id,
              hasBoysHostel: r.branches.hasBoysHostel,
              hasGirlsHostel: r.branches.hasGirlsHostel,
              annualHostelFee: r.branches.annualHostelFee,
            },
            offerings: uniqueOfferings.filter(o => o.branchId === r.branches.id),
          }));
        }
      }
    });

    const branches = Array.from(branchesMap.values());

    return College.create({
      id: c.id,
      name: c.name,
      shortName: c.shortName,
      description: c.description,
      website: c.website,
      contactPhone: c.contactPhone,
      contactEmail: c.contactEmail,
      ownershipType: c.ownershipType as OwnershipType,
      status: c.status as CollegeStatus,
      verificationStatus: c.verificationStatus as VerificationStatus,
      branches,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    });
  }
}

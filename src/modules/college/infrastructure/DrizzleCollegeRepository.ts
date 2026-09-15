import { eq, and, or, lte, inArray, sql } from 'drizzle-orm';
import { db } from '@/shared/database/db';
import { collegesTable, collegeStreamOfferingsTable, branchesTable } from './schema';
import { College, CollegeStreamOffering, CollegeStatus, VerificationStatus, OwnershipType } from '../domain/models';
import { ICollegeRepository, CollegeSearchCriteria } from '../domain/ICollegeRepository';
import { StreamCode } from '@/shared/domain/StreamCode';

export class DrizzleCollegeRepository implements ICollegeRepository {
  
  async findById(id: string): Promise<College | null> {
    const rows = await db
      .select()
      .from(collegesTable)
      .leftJoin(branchesTable, eq(branchesTable.collegeId, collegesTable.id))
      .leftJoin(collegeStreamOfferingsTable, eq(collegeStreamOfferingsTable.branchId, branchesTable.id))
      .where(eq(collegesTable.id, id));

    if (rows.length === 0) return null;

    return this.mapToDomain(rows);
  }

  async searchActiveVerified(criteria: CollegeSearchCriteria): Promise<College[]> {
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
      .select({ id: collegesTable.id })
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collegeIds = Array.from(new Set(qualifyingRows.map((r: any) => r.id))) as string[];

    if (collegeIds.length === 0) return [];

    // 2. Fetch Phase: Retrieve the complete aggregate (all branches, all offerings)
    const fullRows = await db
      .select()
      .from(collegesTable)
      .leftJoin(branchesTable, eq(branchesTable.collegeId, collegesTable.id))
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

    return Array.from(collegesMap.values()).map(groupedRows => this.mapToDomain(groupedRows));
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
        state: college.location.state,
        district: college.location.district,
        city: college.location.city,
        address: college.location.address,
        lat: college.location.lat ? String(college.location.lat) : null,
        lng: college.location.lng ? String(college.location.lng) : null,
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
          state: college.location.state,
          district: college.location.district,
          city: college.location.city,
          address: college.location.address,
          lat: college.location.lat ? String(college.location.lat) : null,
          lng: college.location.lng ? String(college.location.lng) : null,
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
      
      if (college.hostels.length > 0) {
        for (const h of college.hostels) {
          await tx.update(branchesTable)
            .set({
              hasBoysHostel: h.hasBoysHostel,
              hasGirlsHostel: h.hasGirlsHostel,
              annualHostelFee: h.annualHostelFee,
            })
            .where(eq(branchesTable.id, h.branchId));
        }
      }
      
      if (branchIds.length > 0) {
        // ID-aware synchronization of stream offerings across all branches of this college
        const existingOfferings = await tx.select({ id: collegeStreamOfferingsTable.id })
          .from(collegeStreamOfferingsTable)
          .where(inArray(collegeStreamOfferingsTable.branchId, branchIds));
        
        const existingIds = new Set(existingOfferings.map(o => o.id));
        const incomingIds = new Set(college.offerings.map(o => o.id));

        const idsToDelete = [...existingIds].filter(id => !incomingIds.has(id));

        if (idsToDelete.length > 0) {
          await tx.delete(collegeStreamOfferingsTable)
            .where(inArray(collegeStreamOfferingsTable.id, idsToDelete));
        }

        if (college.offerings.length > 0) {
          // For legacy saves that don't know about branchId, fallback to the MAIN_CAMPUS branch.
          // Note: The application logic should set branchId correctly.
          const mainBranchId = branchIds[0]; // Assuming at least one branch exists.
          
          await tx.insert(collegeStreamOfferingsTable).values(
            college.offerings.map(o => ({
              id: o.id,
              branchId: o.branchId || mainBranchId,
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

    const branchHostelsMap = new Map<string, any>();
    rows.forEach(r => {
      if (r.branches) {
        branchHostelsMap.set(r.branches.id, {
          branchId: r.branches.id,
          hasBoysHostel: r.branches.hasBoysHostel,
          hasGirlsHostel: r.branches.hasGirlsHostel,
          annualHostelFee: r.branches.annualHostelFee,
        });
      }
    });
    const uniqueHostels = Array.from(branchHostelsMap.values());

    return College.create({
      id: c.id,
      name: c.name,
      shortName: c.shortName,
      description: c.description,
      website: c.website,
      contactPhone: c.contactPhone,
      contactEmail: c.contactEmail,
      location: {
        state: c.state,
        district: c.district,
        city: c.city,
        address: c.address,
        lat: c.lat ? Number(c.lat) : null,
        lng: c.lng ? Number(c.lng) : null,
      },
      hostels: uniqueHostels,
      ownershipType: c.ownershipType as OwnershipType,
      status: c.status as CollegeStatus,
      verificationStatus: c.verificationStatus as VerificationStatus,
      offerings: uniqueOfferings,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    });
  }
}

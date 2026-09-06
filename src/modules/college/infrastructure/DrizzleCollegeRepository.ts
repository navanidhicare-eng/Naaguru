import { eq, and, lte, inArray, sql } from 'drizzle-orm';
import { db } from '@/shared/database/db';
import { collegesTable, collegeStreamOfferingsTable } from './schema';
import { College, CollegeStreamOffering, CollegeStatus, VerificationStatus, OwnershipType } from '../domain/models';
import { ICollegeRepository, CollegeSearchCriteria } from '../domain/ICollegeRepository';
import { StreamCode } from '@/shared/domain/StreamCode';

export class DrizzleCollegeRepository implements ICollegeRepository {
  
  async findById(id: string): Promise<College | null> {
    const rows = await db
      .select()
      .from(collegesTable)
      .leftJoin(collegeStreamOfferingsTable, eq(collegeStreamOfferingsTable.collegeId, collegesTable.id))
      .where(eq(collegesTable.id, id));

    if (rows.length === 0) return null;

    return this.mapToDomain(rows);
  }

  async searchActiveVerified(criteria: CollegeSearchCriteria): Promise<College[]> {
    const conditions = [
      eq(collegesTable.status, 'ACTIVE'),
      eq(collegesTable.verificationStatus, 'VERIFIED')
    ];

    if (criteria.state) conditions.push(eq(collegesTable.state, criteria.state));
    if (criteria.district) conditions.push(eq(collegesTable.district, criteria.district));
    if (criteria.city) conditions.push(eq(collegesTable.city, criteria.city));
    
    if (criteria.requiresBoysHostel) conditions.push(eq(collegesTable.hasBoysHostel, true));
    if (criteria.requiresGirlsHostel) conditions.push(eq(collegesTable.hasGirlsHostel, true));

    if (criteria.streamCode) {
      conditions.push(eq(collegeStreamOfferingsTable.streamCode, criteria.streamCode));
    }
    
    if (criteria.maxFee !== undefined) {
      conditions.push(lte(collegeStreamOfferingsTable.tuitionFee, criteria.maxFee));
    }

    const rows = await db
      .select()
      .from(collegesTable)
      .leftJoin(collegeStreamOfferingsTable, eq(collegeStreamOfferingsTable.collegeId, collegesTable.id))
      .where(and(...conditions));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const collegesMap = new Map<string, any[]>();
    for (const row of rows) {
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
        hasBoysHostel: college.hostelSummary.hasBoysHostel,
        hasGirlsHostel: college.hostelSummary.hasGirlsHostel,
        annualHostelFee: college.hostelSummary.annualHostelFee,
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
          hasBoysHostel: college.hostelSummary.hasBoysHostel,
          hasGirlsHostel: college.hostelSummary.hasGirlsHostel,
          annualHostelFee: college.hostelSummary.annualHostelFee,
          ownershipType: college.ownershipType,
          status: college.status,
          verificationStatus: college.verificationStatus,
          updatedAt: college.updatedAt,
        }
      });

      // ID-aware synchronization of stream offerings
      const existingOfferings = await tx.select({ id: collegeStreamOfferingsTable.id })
        .from(collegeStreamOfferingsTable)
        .where(eq(collegeStreamOfferingsTable.collegeId, college.id));
      
      const existingIds = new Set(existingOfferings.map(o => o.id));
      const incomingIds = new Set(college.offerings.map(o => o.id));

      const idsToDelete = [...existingIds].filter(id => !incomingIds.has(id));

      if (idsToDelete.length > 0) {
        await tx.delete(collegeStreamOfferingsTable)
          .where(inArray(collegeStreamOfferingsTable.id, idsToDelete));
      }

      if (college.offerings.length > 0) {
        await tx.insert(collegeStreamOfferingsTable).values(
          college.offerings.map(o => ({
            id: o.id,
            collegeId: o.collegeId,
            streamCode: o.streamCode,
            tuitionFee: o.tuitionFee,
          }))
        ).onConflictDoUpdate({
          target: collegeStreamOfferingsTable.id,
          set: {
            streamCode: sql`EXCLUDED.stream_code`,
            tuitionFee: sql`EXCLUDED.tuition_fee`,
          }
        });
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
          collegeId: o.collegeId,
          streamCode: o.streamCode as StreamCode,
          tuitionFee: o.tuitionFee,
        });
      });

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
      hostelSummary: {
        hasBoysHostel: c.hasBoysHostel,
        hasGirlsHostel: c.hasGirlsHostel,
        annualHostelFee: c.annualHostelFee,
      },
      ownershipType: c.ownershipType as OwnershipType,
      status: c.status as CollegeStatus,
      verificationStatus: c.verificationStatus as VerificationStatus,
      offerings,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    });
  }
}

import { eq, and, or, lte, inArray, sql } from 'drizzle-orm';
import { db } from '@/shared/database/db';
import { collegesTable, collegeStreamOfferingsTable, branchesTable, collegeLeadershipTable, collegeMediaTable, collegeAchievementsTable, collegeTestimonialsTable, collegeAccreditationsTable } from './schema';
import { locationsTable } from '@/shared/catalog/infrastructure/schema';
import { CatalogModule } from '@/shared/catalog';
import { College, CollegeStreamOffering, CollegeStatus, VerificationStatus, OwnershipType, Branch, BranchType, LeadershipProfile, CollegeMedia, WeeklyMenu, CollegeAchievement, AchievementStatus, CollegeTestimonial, PersonType, TestimonialStatus, CollegeAccreditation, AccreditationStatus } from '../domain/models';
import { ICollegeRepository, CollegeSearchCriteria } from '../domain/ICollegeRepository';
import { StreamCode } from '@/shared/domain/StreamCode';
import { AppError } from '@/shared/errors';

export class DrizzleCollegeRepository implements ICollegeRepository {
  
  async findById(id: string): Promise<College | null> {
    const rows = await db
      .select()
      .from(collegesTable)
      .leftJoin(branchesTable, eq(branchesTable.collegeId, collegesTable.id))
      .leftJoin(locationsTable, eq(branchesTable.locationId, locationsTable.id))
      .leftJoin(collegeStreamOfferingsTable, eq(collegeStreamOfferingsTable.branchId, branchesTable.id))
      .leftJoin(collegeLeadershipTable, eq(collegeLeadershipTable.collegeId, collegesTable.id))
      .leftJoin(collegeMediaTable, eq(collegeMediaTable.collegeId, collegesTable.id))
      .where(eq(collegesTable.id, id));

    if (rows.length === 0) return null;

    const achievementRows = await db
      .select()
      .from(collegeAchievementsTable)
      .where(eq(collegeAchievementsTable.collegeId, id));

    const testimonialRows = await db
      .select()
      .from(collegeTestimonialsTable)
      .where(eq(collegeTestimonialsTable.collegeId, id));

    const accreditationRows = await db
      .select()
      .from(collegeAccreditationsTable)
      .where(eq(collegeAccreditationsTable.collegeId, id));

    return this.mapToDomain(rows, achievementRows, testimonialRows, accreditationRows);
  }

  async searchActiveVerified(criteria: CollegeSearchCriteria): Promise<{ college: College; matchedBranchId: string }[]> {
    const conditions = [
      eq(collegesTable.status, 'ACTIVE'),
      eq(collegesTable.verificationStatus, 'VERIFIED'),
      eq(branchesTable.isPubliclyEligible, true)
    ];

    if (criteria.locationId) {
      const descendantLocationIds = await CatalogModule.getDescendantLocationIds(criteria.locationId);
      if (descendantLocationIds.length === 0) {
        return [];
      }
      conditions.push(inArray(branchesTable.locationId, descendantLocationIds));
    }
    
    if (criteria.requiresHostel) {
      if (criteria.gender === 'FEMALE' || criteria.requiresGirlsHostel) {
        conditions.push(eq(branchesTable.hasGirlsHostel, true));
      } else if (criteria.gender === 'MALE' || criteria.requiresBoysHostel) {
        conditions.push(eq(branchesTable.hasBoysHostel, true));
      } else {
        conditions.push(or(eq(branchesTable.hasBoysHostel, true), eq(branchesTable.hasGirlsHostel, true))!);
      }
    } else {
      if (criteria.requiresBoysHostel) conditions.push(eq(branchesTable.hasBoysHostel, true));
      if (criteria.requiresGirlsHostel) conditions.push(eq(branchesTable.hasGirlsHostel, true));
    }

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
        weeklyMenu: college.weeklyMenu ? college.weeklyMenu.toJSON() : null,
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
          weeklyMenu: college.weeklyMenu ? college.weeklyMenu.toJSON() : null,
          ownershipType: college.ownershipType,
          status: college.status,
          verificationStatus: college.verificationStatus,
          updatedAt: college.updatedAt,
        }
      });

      // Synchronize leadership profiles
      const existingLeadership = await tx.select({ id: collegeLeadershipTable.id })
        .from(collegeLeadershipTable)
        .where(eq(collegeLeadershipTable.collegeId, college.id));
      
      const existingLeadershipIds = new Set(existingLeadership.map(l => l.id));
      const incomingLeadership = college.leadership || [];
      const incomingLeadershipIds = new Set(incomingLeadership.map(l => l.id));

      const leadershipIdsToDelete = [...existingLeadershipIds].filter(id => !incomingLeadershipIds.has(id));

      if (leadershipIdsToDelete.length > 0) {
        await tx.delete(collegeLeadershipTable)
          .where(inArray(collegeLeadershipTable.id, leadershipIdsToDelete));
      }

      if (incomingLeadership.length > 0) {
        await tx.insert(collegeLeadershipTable).values(
          incomingLeadership.map(l => ({
            id: l.id,
            collegeId: l.collegeId,
            name: l.name,
            designation: l.designation,
            bio: l.bio,
            imageUrl: l.imageUrl,
            displayOrder: l.displayOrder,
          }))
        ).onConflictDoUpdate({
          target: collegeLeadershipTable.id,
          set: {
            name: sql`EXCLUDED.name`,
            designation: sql`EXCLUDED.designation`,
            bio: sql`EXCLUDED.bio`,
            imageUrl: sql`EXCLUDED.image_url`,
            displayOrder: sql`EXCLUDED.display_order`,
            updatedAt: sql`now()`,
          }
        });
      }

      // Synchronize media
      const existingMedia = await tx.select({ id: collegeMediaTable.id })
        .from(collegeMediaTable)
        .where(eq(collegeMediaTable.collegeId, college.id));
      
      const existingMediaIds = new Set(existingMedia.map(m => m.id));
      const incomingMedia = college.media || [];
      const incomingMediaIds = new Set(incomingMedia.map(m => m.id));

      const mediaIdsToDelete = [...existingMediaIds].filter(id => !incomingMediaIds.has(id));

      if (mediaIdsToDelete.length > 0) {
        await tx.update(collegeMediaTable)
          .set({ status: 'INACTIVE', isCover: false, updatedAt: sql`now()` })
          .where(inArray(collegeMediaTable.id, mediaIdsToDelete));
      }

      if (incomingMedia.length > 0) {
        await tx.insert(collegeMediaTable).values(
          incomingMedia.map(m => ({
            id: m.id,
            collegeId: m.collegeId,
            mediaType: m.mediaType,
            storageKey: m.storageKey,
            thumbnailStorageKey: m.thumbnailStorageKey,
            externalUrl: m.externalUrl,
            caption: m.caption,
            displayOrder: m.displayOrder,
            isCover: m.isCover,
            status: m.status,
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
          }))
        ).onConflictDoUpdate({
          target: collegeMediaTable.id,
          set: {
            caption: sql`EXCLUDED.caption`,
            displayOrder: sql`EXCLUDED.display_order`,
            isCover: sql`EXCLUDED.is_cover`,
            status: sql`EXCLUDED.status`,
            updatedAt: sql`now()`,
          }
        });
      }

      // Synchronize achievements
      const existingAchievements = await tx.select({ id: collegeAchievementsTable.id })
        .from(collegeAchievementsTable)
        .where(eq(collegeAchievementsTable.collegeId, college.id));
      
      const existingAchievementIds = new Set(existingAchievements.map(a => a.id));
      const incomingAchievements = college.achievements || [];
      const incomingAchievementIds = new Set(incomingAchievements.map(a => a.id));

      // Cross-college ID safety check for achievements
      const incomingAchIds = incomingAchievements.map(a => a.id).filter(Boolean);
      if (incomingAchIds.length > 0) {
        const foreignAchievements = await tx.select({
          id: collegeAchievementsTable.id,
          collegeId: collegeAchievementsTable.collegeId
        })
          .from(collegeAchievementsTable)
          .where(inArray(collegeAchievementsTable.id, incomingAchIds));

        const foreignAch = foreignAchievements.find(a => a.collegeId !== college.id);
        if (foreignAch) {
          throw new AppError(`Cannot modify achievement ${foreignAch.id} belonging to another college`, 400);
        }
      }

      const achievementIdsToDelete = [...existingAchievementIds].filter(id => !incomingAchievementIds.has(id));

      if (achievementIdsToDelete.length > 0) {
        await tx.delete(collegeAchievementsTable)
          .where(inArray(collegeAchievementsTable.id, achievementIdsToDelete));
      }

      if (incomingAchievements.length > 0) {
        await tx.insert(collegeAchievementsTable).values(
          incomingAchievements.map(a => ({
            id: a.id,
            collegeId: a.collegeId,
            studentName: a.studentName,
            exam: a.exam,
            achievement: a.achievement,
            year: a.year,
            description: a.description,
            imageStorageKey: a.imageStorageKey,
            displayOrder: a.displayOrder,
            status: a.status,
            createdAt: a.createdAt,
            updatedAt: a.updatedAt,
          }))
        ).onConflictDoUpdate({
          target: collegeAchievementsTable.id,
          set: {
            studentName: sql`EXCLUDED.student_name`,
            exam: sql`EXCLUDED.exam`,
            achievement: sql`EXCLUDED.achievement`,
            year: sql`EXCLUDED.year`,
            description: sql`EXCLUDED.description`,
            imageStorageKey: sql`EXCLUDED.image_storage_key`,
            displayOrder: sql`EXCLUDED.display_order`,
            status: sql`EXCLUDED.status`,
            updatedAt: sql`now()`,
          },
          where: eq(collegeAchievementsTable.collegeId, college.id),
        });
      }

      // Synchronize testimonials
      const existingTestimonials = await tx.select({ id: collegeTestimonialsTable.id })
        .from(collegeTestimonialsTable)
        .where(eq(collegeTestimonialsTable.collegeId, college.id));
      
      const existingTestimonialIds = new Set(existingTestimonials.map(t => t.id));
      const incomingTestimonials = college.testimonials || [];
      const incomingTestimonialIds = new Set(incomingTestimonials.map(t => t.id));

      // Cross-college ID safety check for testimonials
      const incomingTestimonialIdsList = incomingTestimonials.map(t => t.id).filter(Boolean);
      if (incomingTestimonialIdsList.length > 0) {
        const foreignTestimonials = await tx.select({
          id: collegeTestimonialsTable.id,
          collegeId: collegeTestimonialsTable.collegeId
        })
          .from(collegeTestimonialsTable)
          .where(inArray(collegeTestimonialsTable.id, incomingTestimonialIdsList));

        const foreignItem = foreignTestimonials.find(t => t.collegeId !== college.id);
        if (foreignItem) {
          throw new AppError(`Cannot modify testimonial ${foreignItem.id} belonging to another college`, 400);
        }
      }

      const testimonialIdsToDelete = [...existingTestimonialIds].filter(id => !incomingTestimonialIds.has(id));

      if (testimonialIdsToDelete.length > 0) {
        await tx.delete(collegeTestimonialsTable)
          .where(inArray(collegeTestimonialsTable.id, testimonialIdsToDelete));
      }

      if (incomingTestimonials.length > 0) {
        await tx.insert(collegeTestimonialsTable).values(
          incomingTestimonials.map(t => ({
            id: t.id,
            collegeId: t.collegeId,
            personName: t.personName,
            personType: t.personType,
            testimonialText: t.testimonialText,
            imageStorageKey: t.imageStorageKey,
            displayOrder: t.displayOrder,
            status: t.status,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
          }))
        ).onConflictDoUpdate({
          target: collegeTestimonialsTable.id,
          set: {
            personName: sql`EXCLUDED.person_name`,
            personType: sql`EXCLUDED.person_type`,
            testimonialText: sql`EXCLUDED.testimonial_text`,
            imageStorageKey: sql`EXCLUDED.image_storage_key`,
            displayOrder: sql`EXCLUDED.display_order`,
            status: sql`EXCLUDED.status`,
            updatedAt: sql`now()`,
          },
          where: eq(collegeTestimonialsTable.collegeId, college.id),
        });
      }

      // Synchronize accreditations
      const existingAccreditations = await tx.select({ id: collegeAccreditationsTable.id })
        .from(collegeAccreditationsTable)
        .where(eq(collegeAccreditationsTable.collegeId, college.id));
      
      const existingAccreditationIds = new Set(existingAccreditations.map(a => a.id));
      const incomingAccreditations = college.accreditations || [];
      const incomingAccreditationIds = new Set(incomingAccreditations.map(a => a.id));

      // Cross-college ID safety check for accreditations
      const incomingAccreditationIdsList = incomingAccreditations.map(a => a.id).filter(Boolean);
      if (incomingAccreditationIdsList.length > 0) {
        const foreignAccreditations = await tx.select({
          id: collegeAccreditationsTable.id,
          collegeId: collegeAccreditationsTable.collegeId
        })
          .from(collegeAccreditationsTable)
          .where(inArray(collegeAccreditationsTable.id, incomingAccreditationIdsList));

        const foreignItem = foreignAccreditations.find(a => a.collegeId !== college.id);
        if (foreignItem) {
          throw new AppError(`Cannot modify accreditation ${foreignItem.id} belonging to another college`, 400);
        }
      }

      const accreditationIdsToDelete = [...existingAccreditationIds].filter(id => !incomingAccreditationIds.has(id));

      if (accreditationIdsToDelete.length > 0) {
        await tx.delete(collegeAccreditationsTable)
          .where(inArray(collegeAccreditationsTable.id, accreditationIdsToDelete));
      }

      if (incomingAccreditations.length > 0) {
        await tx.insert(collegeAccreditationsTable).values(
          incomingAccreditations.map(a => ({
            id: a.id,
            collegeId: a.collegeId,
            name: a.name,
            issuingBody: a.issuingBody,
            year: a.year,
            validUntilYear: a.validUntilYear,
            description: a.description,
            certificateStorageKey: a.certificateStorageKey,
            verificationUrl: a.verificationUrl,
            displayOrder: a.displayOrder,
            status: a.status,
            createdAt: a.createdAt,
            updatedAt: a.updatedAt,
          }))
        ).onConflictDoUpdate({
          target: collegeAccreditationsTable.id,
          set: {
            name: sql`EXCLUDED.name`,
            issuingBody: sql`EXCLUDED.issuing_body`,
            year: sql`EXCLUDED.year`,
            validUntilYear: sql`EXCLUDED.valid_until_year`,
            description: sql`EXCLUDED.description`,
            certificateStorageKey: sql`EXCLUDED.certificate_storage_key`,
            verificationUrl: sql`EXCLUDED.verification_url`,
            displayOrder: sql`EXCLUDED.display_order`,
            status: sql`EXCLUDED.status`,
            updatedAt: sql`now()`,
          },
          where: eq(collegeAccreditationsTable.collegeId, college.id),
        });
      }

      // Fetch all branches for this college to sync their offerings.
      const branches = await tx.select({ id: branchesTable.id })
        .from(branchesTable)
        .where(eq(branchesTable.collegeId, college.id));
      
      const branchIds = branches.map(b => b.id);
      
      const incomingBranches = college.branches || [];
      if (incomingBranches.length > 0) {
        for (const b of incomingBranches) {
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
        
        const incomingBranches = college.branches || [];
        const allOfferings = incomingBranches.flatMap(b => b.offerings || []);
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
  private mapToDomain(rows: any[], achievementRows: any[] = [], testimonialRows: any[] = [], accreditationRows: any[] = []): College {
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

    const leadershipMap = new Map<string, LeadershipProfile>();
    const mediaMap = new Map<string, CollegeMedia>();

    rows.forEach(r => {
      if (r.college_leadership) {
        if (!leadershipMap.has(r.college_leadership.id)) {
          leadershipMap.set(r.college_leadership.id, LeadershipProfile.create({
            id: r.college_leadership.id,
            collegeId: r.college_leadership.collegeId,
            name: r.college_leadership.name,
            designation: r.college_leadership.designation,
            bio: r.college_leadership.bio,
            imageUrl: r.college_leadership.imageUrl,
            displayOrder: r.college_leadership.displayOrder,
          }));
        }
      }

      if (r.college_media) {
        if (!mediaMap.has(r.college_media.id)) {
          mediaMap.set(r.college_media.id, CollegeMedia.create({
            id: r.college_media.id,
            collegeId: r.college_media.collegeId,
            mediaType: r.college_media.mediaType as any,
            storageKey: r.college_media.storageKey,
            thumbnailStorageKey: r.college_media.thumbnailStorageKey,
            externalUrl: r.college_media.externalUrl,
            caption: r.college_media.caption,
            displayOrder: r.college_media.displayOrder,
            isCover: r.college_media.isCover,
            status: r.college_media.status as any,
            createdAt: r.college_media.createdAt,
            updatedAt: r.college_media.updatedAt,
          }));
        }
      }
    });

    const branches = Array.from(branchesMap.values());
    const leadership = Array.from(leadershipMap.values());
    const media = Array.from(mediaMap.values());

    const achievements = achievementRows.map(r => CollegeAchievement.create({
      id: r.id,
      collegeId: r.collegeId,
      studentName: r.studentName,
      exam: r.exam,
      achievement: r.achievement,
      year: r.year,
      description: r.description,
      imageStorageKey: r.imageStorageKey,
      displayOrder: r.displayOrder,
      status: r.status as AchievementStatus,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    const testimonials = testimonialRows.map(r => CollegeTestimonial.create({
      id: r.id,
      collegeId: r.collegeId,
      personName: r.personName,
      personType: r.personType as PersonType,
      testimonialText: r.testimonialText,
      imageStorageKey: r.imageStorageKey,
      displayOrder: r.displayOrder,
      status: r.status as TestimonialStatus,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

    const accreditations = accreditationRows.map(r => CollegeAccreditation.create({
      id: r.id,
      collegeId: r.collegeId,
      name: r.name,
      issuingBody: r.issuingBody,
      year: r.year,
      validUntilYear: r.validUntilYear,
      description: r.description,
      certificateStorageKey: r.certificateStorageKey,
      verificationUrl: r.verificationUrl,
      displayOrder: r.displayOrder,
      status: r.status as AccreditationStatus,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));

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
      weeklyMenu: c.weeklyMenu ? WeeklyMenu.create(c.weeklyMenu) : null,
      achievements: achievements.sort((a, b) => a.displayOrder - b.displayOrder),
      testimonials: testimonials.sort((a, b) => a.displayOrder - b.displayOrder),
      accreditations: accreditations.sort((a, b) => a.displayOrder - b.displayOrder),
      leadership: leadership.sort((a, b) => a.displayOrder - b.displayOrder),
      media: media.sort((a, b) => a.displayOrder - b.displayOrder),
      branches,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    });
  }
}

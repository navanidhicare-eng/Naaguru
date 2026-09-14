/**
 * Re-exports the StaffMembership domain types from the college domain.
 *
 * StaffMembership lives conceptually at the intersection of the User identity
 * and the College institutional domain. Since the college module already owns
 * the College aggregate and the Drizzle schema for staff_memberships, the
 * domain types (StaffMembership, StaffRole, StaffStatus) are defined there.
 *
 * This file ensures the staff module's own domain layer has a clean import
 * path that does not reference the college infrastructure directly.
 */
export { StaffMembership } from '../../college/domain/models';
export type { StaffMembershipProps, StaffRole, StaffStatus } from '../../college/domain/models';

/**
 * Branch location assignment validation.
 *
 * The DB FK on branches.locationId enforces referential integrity.
 * This module enforces the business rule that a Branch location must be
 * a LOCALITY-type canonical location.
 *
 * Do not call the catalog repository directly from here — pass the resolved
 * location type in to keep this pure and testable.
 */

export type LocationType = 'STATE' | 'DISTRICT' | 'MANDAL' | 'LOCALITY';

export interface ResolvedLocationInfo {
  id: string;
  type: LocationType;
  status: string;
}

export type BranchLocationValidationResult =
  | { valid: true }
  | { valid: false; reason: string };

/**
 * Validates that a resolved location is eligible to be assigned to a Branch.
 *
 * Rules:
 * 1. Location must exist (caller must resolve before calling this).
 * 2. Location type must be LOCALITY.
 * 3. Location status must be ACTIVE.
 *
 * Returns a discriminated union so callers can handle errors explicitly.
 */
export function validateBranchLocationAssignment(
  location: ResolvedLocationInfo,
): BranchLocationValidationResult {
  if (location.status !== 'ACTIVE') {
    return {
      valid: false,
      reason: `Location "${location.id}" is not ACTIVE (status: ${location.status}).`,
    };
  }

  if (location.type !== 'LOCALITY') {
    return {
      valid: false,
      reason: `Branch location must be a LOCALITY. Provided location type is "${location.type}".`,
    };
  }

  return { valid: true };
}

import { AssessmentVersion } from './AssessmentVersion';
import { AssessmentAttempt } from './AssessmentAttempt';

export interface IAssessmentRepository {
  /**
   * Returns the currently PUBLISHED assessment version.
   * There should be at most one published version active at any time.
   */
  getActiveVersion(): Promise<AssessmentVersion | null>;

  /**
   * Finds a specific version by its ID (needed for scoring old attempts).
   */
  getVersionById(id: string): Promise<AssessmentVersion | null>;

  /**
   * Retrieves an IN_PROGRESS attempt for the student, if one exists.
   */
  getActiveAttempt(studentId: string): Promise<AssessmentAttempt | null>;

  /**
   * Retrieves a specific attempt by ID, ensuring it belongs to the student.
   */
  getAttemptById(attemptId: string, studentId: string): Promise<AssessmentAttempt | null>;

  /**
   * Retrieves the latest COMPLETED attempt for a student.
   */
  getLatestCompletedAttempt(studentId: string): Promise<AssessmentAttempt | null>;

  /**
   * Saves a new or existing attempt, including its answers and results.
   */
  saveAttempt(attempt: AssessmentAttempt): Promise<void>;
}

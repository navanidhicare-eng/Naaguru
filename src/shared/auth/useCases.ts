import 'server-only';
import { db } from '../database/db';
import { usersTable, sessionsTable, otpRequestsTable } from './schema';
import { IOtpProvider, ITokenService } from './interfaces';
import { eq, and, gt } from 'drizzle-orm';
import { randomInt, createHash } from 'crypto';

const hashValue = (val: string) => createHash('sha256').update(val).digest('hex');

export class AuthUseCases {
  constructor(
    private readonly otpProvider: IOtpProvider,
    private readonly tokenService: ITokenService
  ) {}

  async requestOtp(phoneNumber: string): Promise<void> {
    const now = new Date();

    // Enforce 60-second cooldown
    const [existingRequest] = await db.select().from(otpRequestsTable).where(eq(otpRequestsTable.phoneNumber, phoneNumber));
    if (existingRequest) {
      const timeSinceRequest = now.getTime() - new Date(existingRequest.createdAt).getTime();
      if (timeSinceRequest < 60 * 1000) {
        throw new Error('Please wait 60 seconds before requesting a new OTP.');
      }
    }

    // 1. Generate 6-digit OTP
    const code = randomInt(100000, 999999).toString();
    const codeHash = hashValue(code);

    // 2. Set expiration (5 minutes)
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString();

    // 3. Delete any existing OTP for this phone number
    await db.delete(otpRequestsTable).where(eq(otpRequestsTable.phoneNumber, phoneNumber));

    // 4. Save to database
    await db.insert(otpRequestsTable).values({
      phoneNumber,
      codeHash,
      attempts: '0',
      expiresAt,
    });

    // 5. Send via provider
    await this.otpProvider.sendOtp(phoneNumber, code);
  }

  async verifyOtp(phoneNumber: string, code: string): Promise<{ accessToken: string; refreshToken: string }> {
    const codeHash = hashValue(code);
    const now = new Date().toISOString();

    // 1. Find valid OTP request
    const [otpRequest] = await db.select()
      .from(otpRequestsTable)
      .where(
        and(
          eq(otpRequestsTable.phoneNumber, phoneNumber),
          gt(otpRequestsTable.expiresAt, now)
        )
      );

    if (!otpRequest) {
      throw new Error('Invalid or expired OTP');
    }

    // 2. Check max attempts (3)
    const attempts = parseInt(otpRequest.attempts, 10);
    if (attempts >= 3) {
      await db.delete(otpRequestsTable).where(eq(otpRequestsTable.id, otpRequest.id));
      throw new Error('Maximum verification attempts exceeded. Please request a new OTP.');
    }

    // 3. Verify hash
    if (otpRequest.codeHash !== codeHash) {
      // Increment attempts
      await db.update(otpRequestsTable)
        .set({ attempts: (attempts + 1).toString() })
        .where(eq(otpRequestsTable.id, otpRequest.id));
      throw new Error('Invalid OTP');
    }

    // 4. Delete the OTP record so it can't be reused
    await db.delete(otpRequestsTable).where(eq(otpRequestsTable.id, otpRequest.id));

    // 5. Find or create user
    let [user] = await db.select().from(usersTable).where(eq(usersTable.phoneNumber, phoneNumber));
    if (!user) {
      [user] = await db.insert(usersTable).values({ phoneNumber }).returning();
    }

    // 6. Issue tokens
    const tokens = await this.tokenService.issueTokens({ userId: user.id, role: user.role });

    // 7. Save refresh token
    const refreshTokenHash = hashValue(tokens.refreshToken);
    const refreshTokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    await db.insert(sessionsTable).values({
      userId: user.id,
      refreshTokenHash,
      expiresAt: refreshTokenExpiresAt,
    });

    return tokens;
  }

  async refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const refreshTokenHash = hashValue(refreshToken);
    const now = new Date().toISOString();

    // 1. Find valid session
    const [session] = await db.select()
      .from(sessionsTable)
      .where(
        and(
          eq(sessionsTable.refreshTokenHash, refreshTokenHash),
          gt(sessionsTable.expiresAt, now)
        )
      );

    if (!session) {
      // Note: In a robust setup, if the session was recently deleted (e.g. within 10 seconds), 
      // we could implement a grace period. For strict security, we throw immediately.
      throw new Error('Invalid or expired refresh token');
    }

    // 2. Delete old session
    await db.delete(sessionsTable).where(eq(sessionsTable.id, session.id));

    // 3. Get user
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId));
    if (!user) {
      throw new Error('User not found');
    }

    // 4. Issue new tokens
    const tokens = await this.tokenService.issueTokens({ userId: user.id, role: user.role });

    // 5. Save new session
    const newRefreshTokenHash = hashValue(tokens.refreshToken);
    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await db.insert(sessionsTable).values({
      userId: user.id,
      refreshTokenHash: newRefreshTokenHash,
      expiresAt: newExpiresAt,
    });

    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    const refreshTokenHash = hashValue(refreshToken);
    await db.delete(sessionsTable).where(eq(sessionsTable.refreshTokenHash, refreshTokenHash));
  }

  async getMe(userId: string): Promise<{ id: string; phoneNumber: string; role: string }> {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      throw new Error('User not found');
    }
    return {
      id: user.id,
      phoneNumber: user.phoneNumber ?? '',
      role: user.role,
    };
  }
}

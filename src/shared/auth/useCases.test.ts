import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthUseCases } from './useCases';
import { IOtpProvider, ITokenService } from './interfaces';
import { db } from '../database/db';
import { usersTable, sessionsTable, otpRequestsTable } from './schema';
import { eq } from 'drizzle-orm';
import { createHash } from 'crypto';

// Mock DB
vi.mock('../database/db', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  }
}));

// Mock server-only to prevent it from throwing in Vitest
vi.mock('server-only', () => ({}));

const hashValue = (val: string) => createHash('sha256').update(val).digest('hex');

describe('AuthUseCases Security Audits', () => {
  let authUseCases: AuthUseCases;
  let mockOtpProvider: IOtpProvider;
  let mockTokenService: ITokenService;

  beforeEach(() => {
    mockOtpProvider = { sendOtp: vi.fn() };
    mockTokenService = { issueTokens: vi.fn(), verifyAccessToken: vi.fn() };
    authUseCases = new AuthUseCases(mockOtpProvider, mockTokenService);
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  it('rejects OTP request within 60s cooldown', async () => {
    const phoneNumber = '+919999999999';
    // Simulate an existing request 10 seconds ago
    const mockDbSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ phoneNumber, createdAt: new Date(Date.now() - 10000).toISOString() }])
      })
    });
    db.select = mockDbSelect;

    await expect(authUseCases.requestOtp(phoneNumber)).rejects.toThrow('Please wait 60 seconds before requesting a new OTP.');
  });

  it('rejects OTP verification on max attempts', async () => {
    const phoneNumber = '+919999999999';
    const code = '123456';
    // Simulate an existing request with 3 attempts
    const mockDbSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([{ 
          id: 'uuid-1',
          phoneNumber, 
          codeHash: hashValue('654321'), 
          attempts: '3', 
          expiresAt: new Date(Date.now() + 10000).toISOString() 
        }])
      })
    });
    db.select = mockDbSelect;
    
    // DB Delete mock
    const mockDbDelete = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(true)
    });
    db.delete = mockDbDelete;

    await expect(authUseCases.verifyOtp(phoneNumber, code)).rejects.toThrow('Maximum verification attempts exceeded. Please request a new OTP.');
    expect(mockDbDelete).toHaveBeenCalled();
  });

  it('rejects expired OTP', async () => {
    const phoneNumber = '+919999999999';
    const code = '123456';
    // Simulate NO valid request found (because it's expired, so the db query returns empty array)
    const mockDbSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([])
      })
    });
    db.select = mockDbSelect;

    await expect(authUseCases.verifyOtp(phoneNumber, code)).rejects.toThrow('Invalid or expired OTP');
  });

  it('logout invalidates session by deleting it', async () => {
    const refreshToken = 'dummy-token';
    const mockDbDelete = vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(true)
    });
    db.delete = mockDbDelete;

    await authUseCases.logout(refreshToken);
    expect(mockDbDelete).toHaveBeenCalled();
  });
});

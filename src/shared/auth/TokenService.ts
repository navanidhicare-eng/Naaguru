import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { randomBytes } from 'crypto';
import { ITokenService } from './interfaces';

const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set in the environment variables.');
  }
  return new TextEncoder().encode(secret);
};

export class TokenService implements ITokenService {
  async issueTokens(payload: Record<string, unknown>): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m') // Short-lived access token
      .sign(getJwtSecretKey());

    // Generate a secure random string for the refresh token
    const refreshToken = randomBytes(40).toString('hex');

    return { accessToken, refreshToken };
  }

  async verifyAccessToken<T>(token: string): Promise<T> {
    try {
      const { payload } = await jwtVerify(token, getJwtSecretKey(), {
        algorithms: ['HS256']
      });
      return payload as unknown as T;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

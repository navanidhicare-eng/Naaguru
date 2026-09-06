export interface IOtpProvider {
  /**
   * Sends an OTP to the given phone number.
   * @param phoneNumber The recipient's phone number.
   * @param code The 6-digit OTP code to send.
   */
  sendOtp(phoneNumber: string, code: string): Promise<void>;
}

export interface ITokenService {
  /**
   * Issues an access token (JWT) and an opaque refresh token.
   * @param payload The payload to include in the access token (e.g. userId, role).
   * @returns An object containing the accessToken and refreshToken.
   */
  issueTokens(payload: Record<string, unknown>): Promise<{ accessToken: string; refreshToken: string }>;

  /**
   * Verifies the access token and returns the payload.
   * @param token The JWT access token.
   * @returns The decoded payload if valid.
   * @throws Error if the token is invalid or expired.
   */
  verifyAccessToken<T>(token: string): Promise<T>;
}

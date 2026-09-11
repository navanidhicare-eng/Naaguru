import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:naaguru_student/core/api_client.dart';

/// Manages authentication state: OTP login, token storage, and session lifecycle.
///
/// Mobile Token Strategy:
/// - ACCESS TOKEN: Kept strictly in memory inside [ApiClient].
/// - REFRESH TOKEN: Stored securely in [FlutterSecureStorage].
///
/// Uses the existing backend contracts:
///   POST /auth/request-otp  { phoneNumber }
///   POST /auth/verify-otp   { phoneNumber, code, clientType: 'mobile' }
///   POST /auth/refresh      { refreshToken, clientType: 'mobile' }
///   POST /auth/logout       { refreshToken, clientType: 'mobile' }
class AuthService {
  final ApiClient _apiClient;
  final FlutterSecureStorage _storage;

  static const _accessTokenKey = 'naaguru_access_token'; // Legacy key, cleared on cleanup
  static const _refreshTokenKey = 'naaguru_refresh_token';

  /// Reactive notifier for authentication state changes (login, logout, expiry).
  final ValueNotifier<bool> authStateNotifier = ValueNotifier<bool>(false);

  AuthService({required ApiClient apiClient, FlutterSecureStorage? storage})
      : _apiClient = apiClient,
        _storage = storage ?? const FlutterSecureStorage() {
    _bindApiClientCallbacks();
  }

  void _bindApiClientCallbacks() {
    // When tokens are refreshed/rotated by ApiClient, securely persist the new refresh token.
    _apiClient.onTokensRefreshed = (accessToken, refreshToken) async {
      await _storage.write(key: _refreshTokenKey, value: refreshToken);
      authStateNotifier.value = true;
    };

    // When session refresh fails, clean up credentials.
    _apiClient.onSessionExpired = () async {
      await _storage.delete(key: _refreshTokenKey);
      await _storage.delete(key: _accessTokenKey);
      authStateNotifier.value = false;
    };
  }

  bool get isAuthenticated => _apiClient.isAuthenticated;

  /// Attempts to restore a previous session from secure storage.
  ///
  /// Steps:
  /// 1. Reads the persisted refresh token from secure storage.
  /// 2. If present, calls backend /auth/refresh to exchange it for a fresh token pair.
  /// 3. If successful, sets in-memory access token, updates refresh token in storage, and returns true.
  /// 4. If failed, clears the invalid token and returns false.
  Future<bool> tryRestoreSession() async {
    // Clean up any legacy access token from previous versions
    try {
      await _storage.delete(key: _accessTokenKey);
    } catch (_) {}

    final refreshToken = await _storage.read(key: _refreshTokenKey);
    if (refreshToken == null || refreshToken.trim().isEmpty) {
      authStateNotifier.value = false;
      return false;
    }

    final success = await _apiClient.refreshWithToken(refreshToken);
    if (success) {
      authStateNotifier.value = true;
      return true;
    } else {
      await _storage.delete(key: _refreshTokenKey);
      authStateNotifier.value = false;
      return false;
    }
  }

  /// Step 1: Request an OTP for the given phone number.
  Future<void> requestOtp(String phoneNumber) async {
    await _apiClient.post('/auth/request-otp', body: {
      'phoneNumber': phoneNumber,
    });
  }

  /// Step 2: Verify the OTP code.
  /// On success, keeps access token in memory, persists refresh token securely,
  /// and updates authentication state.
  Future<void> verifyOtp(String phoneNumber, String code) async {
    final response = await _apiClient.post('/auth/verify-otp', body: {
      'phoneNumber': phoneNumber,
      'code': code,
      'clientType': 'mobile',
    });

    final accessToken = response['accessToken'] as String;
    final refreshToken = response['refreshToken'] as String;

    _apiClient.setTokens(accessToken: accessToken, refreshToken: refreshToken);
    await _storage.write(key: _refreshTokenKey, value: refreshToken);
    authStateNotifier.value = true;
  }

  /// Clears the stored session locally and revokes it on the server.
  Future<void> logout() async {
    final refreshToken = _apiClient.refreshToken ?? await _storage.read(key: _refreshTokenKey);

    // Revoke session on backend if a refresh token is known
    if (refreshToken != null && refreshToken.isNotEmpty) {
      try {
        await _apiClient.post('/auth/logout', body: {
          'refreshToken': refreshToken,
          'clientType': 'mobile',
        });
      } catch (_) {
        // Deliberately continue: local session must be cleared even if offline or 401
      }
    }

    _apiClient.clearTokens();
    await _storage.delete(key: _refreshTokenKey);
    await _storage.delete(key: _accessTokenKey);
    authStateNotifier.value = false;
  }
}

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:naaguru_student/core/api_client.dart';

/// Manages authentication state: OTP login, token storage, logout.
///
/// Uses the existing backend contract:
///   POST /auth/request-otp  { phoneNumber }
///   POST /auth/verify-otp   { phoneNumber, code, clientType: 'mobile' }
///
/// The backend returns { accessToken, refreshToken } for mobile clients.
class AuthService {
  final ApiClient _apiClient;
  final FlutterSecureStorage _storage;

  static const _accessTokenKey = 'naaguru_access_token';
  static const _refreshTokenKey = 'naaguru_refresh_token';

  AuthService({required ApiClient apiClient, FlutterSecureStorage? storage})
      : _apiClient = apiClient,
        _storage = storage ?? const FlutterSecureStorage();

  /// Attempts to restore a previous session from secure storage.
  /// Returns true if tokens were found and loaded.
  Future<bool> tryRestoreSession() async {
    final accessToken = await _storage.read(key: _accessTokenKey);
    final refreshToken = await _storage.read(key: _refreshTokenKey);

    if (accessToken != null && refreshToken != null) {
      _apiClient.setTokens(
          accessToken: accessToken, refreshToken: refreshToken);
      return true;
    }
    return false;
  }

  /// Step 1: Request an OTP for the given phone number.
  Future<void> requestOtp(String phoneNumber) async {
    await _apiClient.post('/auth/request-otp', body: {
      'phoneNumber': phoneNumber,
    });
  }

  /// Step 2: Verify the OTP code.
  /// On success, stores tokens securely and configures the API client.
  Future<void> verifyOtp(String phoneNumber, String code) async {
    final response = await _apiClient.post('/auth/verify-otp', body: {
      'phoneNumber': phoneNumber,
      'code': code,
      'clientType': 'mobile',
    });

    final accessToken = response['accessToken'] as String;
    final refreshToken = response['refreshToken'] as String;

    _apiClient.setTokens(accessToken: accessToken, refreshToken: refreshToken);
    await _storage.write(key: _accessTokenKey, value: accessToken);
    await _storage.write(key: _refreshTokenKey, value: refreshToken);
  }

  /// Clears the stored session.
  Future<void> logout() async {
    _apiClient.clearTokens();
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
  }

  bool get isAuthenticated => _apiClient.isAuthenticated;
}

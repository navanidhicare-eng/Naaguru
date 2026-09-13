import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:naaguru_student/core/api_client.dart';

/// Represents the profile completion state of the authenticated student.
///
/// - [unknown]: Initial state — no profile check performed yet.
/// - [incomplete]: Profile record exists but lacks required fields, OR no profile
///   record exists at all (404 from GET /students/me).
/// - [complete]: All required fields are present and valid.
/// - [error]: A network/server error occurred while fetching the profile.
///   Must NOT be conflated with [incomplete].
enum ProfileState { unknown, incomplete, complete, error }

/// Manages authentication state: OTP login, token storage, and session lifecycle.
///
/// Mobile Token Strategy:
/// - ACCESS TOKEN: Kept strictly in memory inside [ApiClient].
/// - REFRESH TOKEN: Stored securely in [FlutterSecureStorage].
///
/// Profile State Strategy:
/// - After session start (OTP verify or session restore), the profile is fetched
///   exactly once and the result is stored in [profileStateNotifier].
/// - A 404 from GET /students/me → [ProfileState.incomplete] (no profile yet).
/// - A 5xx / network failure → [ProfileState.error] (do not silently become incomplete).
/// - The state is reset to [ProfileState.unknown] on logout to prevent stale state
///   surviving into a subsequent user session.
///
/// Uses the existing backend contracts:
///   POST /auth/request-otp  { phoneNumber }
///   POST /auth/verify-otp   { phoneNumber, code, clientType: 'mobile' }
///   POST /auth/refresh      { refreshToken, clientType: 'mobile' }
///   POST /auth/logout       { refreshToken, clientType: 'mobile' }
///   GET  /students/me       → StudentProfileDto or 404
class AuthService {
  final ApiClient _apiClient;
  final FlutterSecureStorage _storage;

  static const _accessTokenKey = 'naaguru_access_token'; // Legacy key, cleared on cleanup
  static const _refreshTokenKey = 'naaguru_refresh_token';

  /// Reactive notifier for authentication state changes (login, logout, expiry).
  final ValueNotifier<bool> authStateNotifier = ValueNotifier<bool>(false);

  /// Reactive notifier for profile completion state.
  ///
  /// Consumers should listen to this to render the appropriate gate.
  /// Never set this to [ProfileState.incomplete] due to a network/5xx error.
  final ValueNotifier<ProfileState> profileStateNotifier =
      ValueNotifier<ProfileState>(ProfileState.unknown);

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

    // When session refresh fails, clean up credentials and reset profile state.
    _apiClient.onSessionExpired = () async {
      await _storage.delete(key: _refreshTokenKey);
      await _storage.delete(key: _accessTokenKey);
      authStateNotifier.value = false;
      profileStateNotifier.value = ProfileState.unknown;
    };
  }

  bool get isAuthenticated => _apiClient.isAuthenticated;

  // ---------------------------------------------------------------------------
  // Profile Completion Predicate
  // ---------------------------------------------------------------------------

  /// Returns true if the given profile data satisfies the mandatory completion
  /// requirements.
  ///
  /// Completion requires ALL of:
  ///   1. [fullName]              — non-null, non-empty string
  ///   2. [residenceLocationId]   — non-null, non-empty string
  ///   3. [schoolId]              — non-null, non-empty string
  ///   4. [pincode]               — valid Indian PIN format: ^[1-9][0-9]{5}$
  ///
  /// [landmark] is explicitly OPTIONAL and does NOT affect completion.
  static bool isProfileComplete(Map<String, dynamic>? profile) {
    if (profile == null) return false;

    final fullName = profile['fullName'] as String?;
    if (fullName == null || fullName.trim().isEmpty) return false;

    final gender = profile['gender'] as String?;
    if (gender != 'MALE' && gender != 'FEMALE') return false;

    final residenceLocationId = profile['residenceLocationId'] as String?;
    if (residenceLocationId == null || residenceLocationId.trim().isEmpty) {
      return false;
    }

    final schoolId = profile['schoolId'] as String?;
    if (schoolId == null || schoolId.trim().isEmpty) return false;

    final pincode = profile['pincode'] as String?;
    if (pincode == null || !RegExp(r'^[1-9][0-9]{5}$').hasMatch(pincode)) {
      return false;
    }

    return true;
  }

  // ---------------------------------------------------------------------------
  // Internal profile fetch — called after authentication succeeds.
  // ---------------------------------------------------------------------------

  /// Fetches the student profile and updates [profileStateNotifier].
  ///
  /// Error handling:
  ///   - 404 → profile does not exist → [ProfileState.incomplete]
  ///   - Incomplete fields → [ProfileState.incomplete]
  ///   - Network / 5xx / unexpected error → [ProfileState.error]
  ///     This must NEVER be silently treated as incomplete.
  Future<void> _fetchAndUpdateProfileState() async {
    try {
      final profile = await _apiClient.get('/students/me');
      profileStateNotifier.value = isProfileComplete(profile)
          ? ProfileState.complete
          : ProfileState.incomplete;
    } on ApiException catch (e) {
      if (e.statusCode == 404) {
        // Authenticated student with no profile record yet → incomplete.
        profileStateNotifier.value = ProfileState.incomplete;
      } else {
        // 5xx, 403, unexpected server error → error, not incomplete.
        profileStateNotifier.value = ProfileState.error;
      }
    } catch (_) {
      // Network failure / parse error → error, not incomplete.
      profileStateNotifier.value = ProfileState.error;
    }
  }

  // ---------------------------------------------------------------------------
  // Session restoration
  // ---------------------------------------------------------------------------

  /// Attempts to restore a previous session from secure storage.
  ///
  /// Steps:
  /// 1. Reads the persisted refresh token from secure storage.
  /// 2. If present, calls backend /auth/refresh to exchange it for a fresh token pair.
  /// 3. If successful, fetches the student profile to resolve [profileStateNotifier].
  /// 4. Sets [authStateNotifier] to true only after profile state is resolved.
  /// 5. If failed, clears the invalid token and returns false.
  Future<bool> tryRestoreSession() async {
    // Clean up any legacy access token from previous versions
    try {
      await _storage.delete(key: _accessTokenKey);
    } catch (_) {}

    final refreshToken = await _storage.read(key: _refreshTokenKey);
    if (refreshToken == null || refreshToken.trim().isEmpty) {
      authStateNotifier.value = false;
      profileStateNotifier.value = ProfileState.unknown;
      return false;
    }

    final success = await _apiClient.refreshWithToken(refreshToken);
    if (success) {
      // Fetch profile before signalling authentication to prevent UI flash.
      await _fetchAndUpdateProfileState();
      authStateNotifier.value = true;
      return true;
    } else {
      await _storage.delete(key: _refreshTokenKey);
      authStateNotifier.value = false;
      profileStateNotifier.value = ProfileState.unknown;
      return false;
    }
  }

  // ---------------------------------------------------------------------------
  // OTP Authentication
  // ---------------------------------------------------------------------------

  /// Step 1: Request an OTP for the given phone number.
  Future<void> requestOtp(String phoneNumber) async {
    await _apiClient.post('/auth/request-otp', body: {
      'phoneNumber': phoneNumber,
    });
  }

  /// Step 2: Verify the OTP code.
  /// On success, keeps access token in memory, persists refresh token securely,
  /// fetches profile state, and then updates authentication state.
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

    // Fetch profile before signalling authentication to prevent UI flash.
    await _fetchAndUpdateProfileState();
    authStateNotifier.value = true;
  }

  // ---------------------------------------------------------------------------
  // Profile Completion Update
  // ---------------------------------------------------------------------------

  /// Called by [StudentProfileScreen] after a successful backend profile save.
  ///
  /// This must only be called AFTER the backend call succeeds — never optimistically.
  /// Sets [profileStateNotifier] to [ProfileState.complete] to unblock the gate.
  void markProfileComplete() {
    profileStateNotifier.value = ProfileState.complete;
  }

  /// Re-fetches the student profile and updates [profileStateNotifier].
  ///
  /// Called by [ProfileGate] on the error retry action.
  /// Only valid when the session is authenticated.
  Future<void> retryProfileFetch() => _fetchAndUpdateProfileState();

  // ---------------------------------------------------------------------------
  // Logout
  // ---------------------------------------------------------------------------

  /// Clears the stored session locally, resets profile state, and revokes it on server.
  Future<void> logout() async {
    final refreshToken =
        _apiClient.refreshToken ?? await _storage.read(key: _refreshTokenKey);

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

    // Reset profile state so no stale COMPLETE state survives into the next session.
    profileStateNotifier.value = ProfileState.unknown;
    authStateNotifier.value = false;
  }
}

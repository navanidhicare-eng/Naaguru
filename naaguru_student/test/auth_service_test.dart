import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/features/auth/auth_service.dart';

/// Creates a mock HTTP client that responds to verify-otp and students/me.
///
/// [profileResponse]: the body returned by GET /students/me.
/// [profileStatusCode]: HTTP status for GET /students/me (default 200).
/// [otpStatusCode]: HTTP status for POST /auth/verify-otp (default 200).
MockClient _makeClient({
  Map<String, dynamic>? profileResponse,
  int profileStatusCode = 200,
  int otpStatusCode = 200,
  int refreshStatusCode = 200,
}) {
  return MockClient((request) async {
    if (request.url.path.contains('/auth/verify-otp')) {
      if (otpStatusCode != 200) {
        return http.Response(jsonEncode({'error': 'bad otp'}), otpStatusCode);
      }
      return http.Response(
        jsonEncode({
          'accessToken': 'test-access-token',
          'refreshToken': 'test-refresh-token',
        }),
        200,
      );
    }

    if (request.url.path.contains('/auth/refresh')) {
      if (refreshStatusCode != 200) {
        return http.Response(jsonEncode({'error': 'expired'}), refreshStatusCode);
      }
      return http.Response(
        jsonEncode({
          'accessToken': 'restored-access-token',
          'refreshToken': 'rotated-refresh-token',
        }),
        200,
      );
    }

    if (request.url.path.contains('/auth/logout')) {
      return http.Response(jsonEncode({'message': 'ok'}), 200);
    }

    if (request.url.path.contains('/students/me')) {
      if (profileStatusCode == 404) {
        return http.Response(jsonEncode({'error': 'Not found'}), 404);
      }
      if (profileStatusCode >= 500) {
        return http.Response(jsonEncode({'error': 'Server error'}), profileStatusCode);
      }
      return http.Response(
        jsonEncode(profileResponse ?? {}),
        profileStatusCode,
      );
    }

    return http.Response('Not Found', 404);
  });
}

const _completeProfile = {
  'fullName': 'Ravi Kumar',
  'gender': 'MALE',
  'residenceLocationId': 'loc-uuid-001',
  'schoolId': 'school-uuid-001',
  'pincode': '530001',
};

/// A profile missing schoolId — must be treated as incomplete.
const _incompleteProfileMissingSchool = {
  'fullName': 'Ravi Kumar',
  'residenceLocationId': 'loc-uuid-001',
  'pincode': '530001',
  // schoolId absent
};

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  // ---------------------------------------------------------------------------
  // isProfileComplete predicate
  // ---------------------------------------------------------------------------
  group('AuthService.isProfileComplete', () {
    test('returns true when all required fields are present and valid', () {
      expect(AuthService.isProfileComplete(_completeProfile), isTrue);
    });

    test('returns false when fullName is empty', () {
      expect(
        AuthService.isProfileComplete({..._completeProfile, 'fullName': '  '}),
        isFalse,
      );
    });

    test('returns false when residenceLocationId is absent', () {
      final profile = Map<String, dynamic>.from(_completeProfile)
        ..remove('residenceLocationId');
      expect(AuthService.isProfileComplete(profile), isFalse);
    });

    test('returns false when schoolId is absent', () {
      expect(
        AuthService.isProfileComplete(_incompleteProfileMissingSchool),
        isFalse,
      );
    });

    test('returns false when pincode is absent', () {
      final profile = Map<String, dynamic>.from(_completeProfile)
        ..remove('pincode');
      expect(AuthService.isProfileComplete(profile), isFalse);
    });

    test('returns false when pincode has invalid format (leading zero)', () {
      expect(
        AuthService.isProfileComplete({..._completeProfile, 'pincode': '012345'}),
        isFalse,
      );
    });

    test('returns false when pincode has invalid format (too short)', () {
      expect(
        AuthService.isProfileComplete({..._completeProfile, 'pincode': '53000'}),
        isFalse,
      );
    });

    test('landmark being absent does NOT make the profile incomplete', () {
      // landmark is OPTIONAL per product rules.
      final profile = Map<String, dynamic>.from(_completeProfile)
        ..remove('landmark');
      expect(AuthService.isProfileComplete(profile), isTrue);
    });

    test('returns false for null profile', () {
      expect(AuthService.isProfileComplete(null), isFalse);
    });
  });

  // ---------------------------------------------------------------------------
  // OTP Verification → profile state
  // ---------------------------------------------------------------------------
  group('AuthService.verifyOtp', () {
    late Map<String, String> mockStorageData;
    late FlutterSecureStorage secureStorage;

    setUp(() {
      mockStorageData = {};
      FlutterSecureStorage.setMockInitialValues(mockStorageData);
      secureStorage = const FlutterSecureStorage();
    });

    test('verifyOtp stores refresh token securely and keeps access token in memory', () async {
      final client = _makeClient(profileResponse: _completeProfile);
      final authService = AuthService(
        apiClient: ApiClient(httpClient: client),
        storage: secureStorage,
      );

      await authService.verifyOtp('+919876543210', '123456');

      expect(authService.isAuthenticated, isTrue);
      expect(authService.authStateNotifier.value, isTrue);
      expect(await secureStorage.read(key: 'naaguru_refresh_token'),
          'test-refresh-token');
      // Access token must NOT be written to persistent storage.
      expect(await secureStorage.read(key: 'naaguru_access_token'), isNull);
    });

    test('sets profileState to COMPLETE when profile satisfies predicate', () async {
      final client = _makeClient(profileResponse: _completeProfile);
      final authService = AuthService(
        apiClient: ApiClient(httpClient: client),
        storage: secureStorage,
      );

      await authService.verifyOtp('+919876543210', '123456');

      expect(authService.profileStateNotifier.value, ProfileState.complete);
    });

    test('sets profileState to INCOMPLETE when profile is missing required fields', () async {
      final client = _makeClient(profileResponse: _incompleteProfileMissingSchool);
      final authService = AuthService(
        apiClient: ApiClient(httpClient: client),
        storage: secureStorage,
      );

      await authService.verifyOtp('+919876543210', '123456');

      expect(authService.profileStateNotifier.value, ProfileState.incomplete);
    });

    test('sets profileState to INCOMPLETE when GET /students/me returns 404', () async {
      // 404 = authenticated student with no profile record yet.
      final client = _makeClient(profileStatusCode: 404);
      final authService = AuthService(
        apiClient: ApiClient(httpClient: client),
        storage: secureStorage,
      );

      await authService.verifyOtp('+919876543210', '123456');

      expect(authService.profileStateNotifier.value, ProfileState.incomplete);
    });

    test('sets profileState to ERROR (not incomplete) when server returns 500', () async {
      // Network/5xx errors must NOT silently become ProfileState.incomplete.
      final client = _makeClient(profileStatusCode: 500);
      final authService = AuthService(
        apiClient: ApiClient(httpClient: client),
        storage: secureStorage,
      );

      await authService.verifyOtp('+919876543210', '123456');

      expect(authService.profileStateNotifier.value, ProfileState.error);
    });
  });

  // ---------------------------------------------------------------------------
  // Session Restoration → profile state
  // ---------------------------------------------------------------------------
  group('AuthService.tryRestoreSession', () {
    late FlutterSecureStorage secureStorage;

    setUp(() {
      FlutterSecureStorage.setMockInitialValues({
        'naaguru_refresh_token': 'persisted-refresh-token',
      });
      secureStorage = const FlutterSecureStorage();
    });

    test('restores session and sets profileState to COMPLETE for a complete profile', () async {
      final client = _makeClient(profileResponse: _completeProfile);
      final authService = AuthService(
        apiClient: ApiClient(httpClient: client),
        storage: secureStorage,
      );

      final restored = await authService.tryRestoreSession();

      expect(restored, isTrue);
      expect(authService.isAuthenticated, isTrue);
      expect(authService.profileStateNotifier.value, ProfileState.complete);
    });

    test('restores session and sets profileState to INCOMPLETE for 404 profile', () async {
      final client = _makeClient(profileStatusCode: 404);
      final authService = AuthService(
        apiClient: ApiClient(httpClient: client),
        storage: secureStorage,
      );

      final restored = await authService.tryRestoreSession();

      expect(restored, isTrue);
      expect(authService.profileStateNotifier.value, ProfileState.incomplete);
    });

    test('returns false and keeps profileState UNKNOWN when refresh token is expired', () async {
      FlutterSecureStorage.setMockInitialValues({
        'naaguru_refresh_token': 'expired-token',
      });
      final client = _makeClient(refreshStatusCode: 401);
      final authService = AuthService(
        apiClient: ApiClient(httpClient: client),
        storage: secureStorage,
      );

      final restored = await authService.tryRestoreSession();

      expect(restored, isFalse);
      expect(authService.profileStateNotifier.value, ProfileState.unknown);
    });

    test('profileState ERROR (not incomplete) when server errors during restore', () async {
      final client = _makeClient(profileStatusCode: 500);
      final authService = AuthService(
        apiClient: ApiClient(httpClient: client),
        storage: secureStorage,
      );

      final restored = await authService.tryRestoreSession();

      expect(restored, isTrue); // session restored ok, but profile fetch errored
      expect(authService.profileStateNotifier.value, ProfileState.error);
    });
  });

  // ---------------------------------------------------------------------------
  // markProfileComplete
  // ---------------------------------------------------------------------------
  group('AuthService.markProfileComplete', () {
    test('transitions profileState from INCOMPLETE to COMPLETE', () async {
      final client = _makeClient(profileStatusCode: 404); // no profile
      FlutterSecureStorage.setMockInitialValues({});
      final authService = AuthService(
        apiClient: ApiClient(httpClient: client),
        storage: const FlutterSecureStorage(),
      );

      await authService.verifyOtp('+919876543210', '123456');
      expect(authService.profileStateNotifier.value, ProfileState.incomplete);

      // Simulates the backend save succeeding and ProfileScreen calling markProfileComplete().
      authService.markProfileComplete();

      expect(authService.profileStateNotifier.value, ProfileState.complete);
    });
  });

  // ---------------------------------------------------------------------------
  // Logout resets state
  // ---------------------------------------------------------------------------
  group('AuthService.logout', () {
    test('resets profileState to UNKNOWN and authState to false', () async {
      FlutterSecureStorage.setMockInitialValues({
        'naaguru_refresh_token': 'active-refresh-token',
      });
      final client = _makeClient(profileResponse: _completeProfile);
      final apiClient = ApiClient(httpClient: client);
      apiClient.setTokens(
          accessToken: 'active-access', refreshToken: 'active-refresh-token');

      final authService = AuthService(
        apiClient: apiClient,
        storage: const FlutterSecureStorage(),
      );
      authService.authStateNotifier.value = true;
      authService.profileStateNotifier.value = ProfileState.complete;

      await authService.logout();

      expect(authService.authStateNotifier.value, isFalse);
      expect(authService.profileStateNotifier.value, ProfileState.unknown);
      expect(apiClient.isAuthenticated, isFalse);
    });

    test('no stale COMPLETE profile state survives logout for a new login', () async {
      FlutterSecureStorage.setMockInitialValues({
        'naaguru_refresh_token': 'token',
      });
      final client = _makeClient(profileResponse: _completeProfile);
      final apiClient = ApiClient(httpClient: client);
      apiClient.setTokens(accessToken: 'token', refreshToken: 'token');

      final authService = AuthService(
        apiClient: apiClient,
        storage: const FlutterSecureStorage(),
      );
      authService.profileStateNotifier.value = ProfileState.complete;

      await authService.logout();

      // After logout: state must be unknown, not complete.
      expect(authService.profileStateNotifier.value, ProfileState.unknown);
    });
  });
}

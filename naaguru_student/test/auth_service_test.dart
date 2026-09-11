import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/features/auth/auth_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('AuthService', () {
    late Map<String, String> mockStorageData;
    late FlutterSecureStorage secureStorage;

    setUp(() {
      mockStorageData = {};
      FlutterSecureStorage.setMockInitialValues(mockStorageData);
      secureStorage = const FlutterSecureStorage();
    });

    test('verifyOtp stores refresh token securely and keeps access token in memory', () async {
      final mockHttpClient = MockClient((request) async {
        if (request.url.path.contains('/auth/verify-otp')) {
          final body = jsonDecode(request.body) as Map<String, dynamic>;
          expect(body['phoneNumber'], '+919876543210');
          expect(body['code'], '123456');
          expect(body['clientType'], 'mobile');

          return http.Response(
            jsonEncode({
              'accessToken': 'mobile-jwt-access-token',
              'refreshToken': 'mobile-secure-refresh-token',
            }),
            200,
          );
        }
        return http.Response('Not Found', 404);
      });

      final apiClient = ApiClient(httpClient: mockHttpClient);
      final authService = AuthService(apiClient: apiClient, storage: secureStorage);

      expect(authService.isAuthenticated, isFalse);
      expect(authService.authStateNotifier.value, isFalse);

      await authService.verifyOtp('+919876543210', '123456');

      // Access token is held in memory in ApiClient
      expect(apiClient.accessToken, 'mobile-jwt-access-token');
      expect(authService.isAuthenticated, isTrue);
      expect(authService.authStateNotifier.value, isTrue);

      // Refresh token is securely stored
      final storedRefreshToken = await secureStorage.read(key: 'naaguru_refresh_token');
      expect(storedRefreshToken, 'mobile-secure-refresh-token');

      // Access token must NOT be written to persistent storage (Step 3 compliance)
      final storedAccessToken = await secureStorage.read(key: 'naaguru_access_token');
      expect(storedAccessToken, isNull);
    });

    test('tryRestoreSession restores session if valid refresh token exists in storage', () async {
      // Simulate existing stored refresh token from prior session
      FlutterSecureStorage.setMockInitialValues({
        'naaguru_refresh_token': 'persisted-refresh-token',
      });

      final mockHttpClient = MockClient((request) async {
        if (request.url.path.contains('/auth/refresh')) {
          final body = jsonDecode(request.body) as Map<String, dynamic>;
          expect(body['refreshToken'], 'persisted-refresh-token');
          expect(body['clientType'], 'mobile');

          return http.Response(
            jsonEncode({
              'accessToken': 'restored-access-token',
              'refreshToken': 'rotated-refresh-token',
            }),
            200,
          );
        }
        return http.Response('Not Found', 404);
      });

      final apiClient = ApiClient(httpClient: mockHttpClient);
      final authService = AuthService(apiClient: apiClient, storage: secureStorage);

      final restored = await authService.tryRestoreSession();

      expect(restored, isTrue);
      expect(authService.isAuthenticated, isTrue);
      expect(apiClient.accessToken, 'restored-access-token');
      expect(authService.authStateNotifier.value, isTrue);

      // Rotated refresh token should have replaced the old one in storage
      final storedRefresh = await secureStorage.read(key: 'naaguru_refresh_token');
      expect(storedRefresh, 'rotated-refresh-token');
    });

    test('tryRestoreSession returns false and wipes storage if session is expired or revoked', () async {
      FlutterSecureStorage.setMockInitialValues({
        'naaguru_refresh_token': 'expired-refresh-token',
      });

      final mockHttpClient = MockClient((request) async {
        if (request.url.path.contains('/auth/refresh')) {
          return http.Response(jsonEncode({'error': 'Invalid or expired refresh token'}), 401);
        }
        return http.Response('Not Found', 404);
      });

      final apiClient = ApiClient(httpClient: mockHttpClient);
      final authService = AuthService(apiClient: apiClient, storage: secureStorage);

      final restored = await authService.tryRestoreSession();

      expect(restored, isFalse);
      expect(authService.isAuthenticated, isFalse);
      expect(authService.authStateNotifier.value, isFalse);

      // Invalid token must be removed from storage
      final storedRefresh = await secureStorage.read(key: 'naaguru_refresh_token');
      expect(storedRefresh, isNull);
    });

    test('logout revokes session on server, deletes storage, and clears in-memory credentials', () async {
      FlutterSecureStorage.setMockInitialValues({
        'naaguru_refresh_token': 'active-refresh-token',
      });

      bool logoutEndpointCalled = false;

      final mockHttpClient = MockClient((request) async {
        if (request.url.path.contains('/auth/logout')) {
          logoutEndpointCalled = true;
          final body = jsonDecode(request.body) as Map<String, dynamic>;
          expect(body['refreshToken'], 'active-refresh-token');
          expect(body['clientType'], 'mobile');
          return http.Response(jsonEncode({'message': 'Logged out successfully'}), 200);
        }
        return http.Response('Not Found', 404);
      });

      final apiClient = ApiClient(httpClient: mockHttpClient);
      apiClient.setTokens(accessToken: 'active-access', refreshToken: 'active-refresh-token');

      final authService = AuthService(apiClient: apiClient, storage: secureStorage);
      authService.authStateNotifier.value = true;

      await authService.logout();

      expect(logoutEndpointCalled, isTrue);
      expect(apiClient.isAuthenticated, isFalse);
      expect(apiClient.accessToken, isNull);
      expect(apiClient.refreshToken, isNull);
      expect(authService.authStateNotifier.value, isFalse);

      final storedRefresh = await secureStorage.read(key: 'naaguru_refresh_token');
      expect(storedRefresh, isNull);
    });
  });
}

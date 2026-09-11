import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:naaguru_student/core/api_client.dart';

void main() {
  group('ApiClient', () {
    test('attaches Authorization header when accessToken is present', () async {
      String? capturedAuthHeader;

      final mockHttpClient = MockClient((request) async {
        capturedAuthHeader = request.headers['Authorization'];
        return http.Response(jsonEncode({'status': 'ok'}), 200);
      });

      final apiClient = ApiClient(httpClient: mockHttpClient);
      apiClient.setTokens(accessToken: 'initial-access-token', refreshToken: 'initial-refresh-token');

      final result = await apiClient.get('/students/me');

      expect(result['status'], 'ok');
      expect(capturedAuthHeader, 'Bearer initial-access-token');
    });

    test('omits Authorization header when no accessToken is set', () async {
      String? capturedAuthHeader;

      final mockHttpClient = MockClient((request) async {
        capturedAuthHeader = request.headers['Authorization'];
        return http.Response(jsonEncode({'status': 'ok'}), 200);
      });

      final apiClient = ApiClient(httpClient: mockHttpClient);
      expect(apiClient.isAuthenticated, isFalse);

      final result = await apiClient.get('/assessments/active');

      expect(result['status'], 'ok');
      expect(capturedAuthHeader, isNull);
    });

    test('intercepts 401, refreshes tokens, notifies onTokensRefreshed, and retries request once', () async {
      int requestCount = 0;
      bool refreshCalled = false;
      String? refreshedAccess;
      String? refreshedRefresh;

      final mockHttpClient = MockClient((request) async {
        if (request.url.path.contains('/auth/refresh')) {
          refreshCalled = true;
          final body = jsonDecode(request.body) as Map<String, dynamic>;
          expect(body['refreshToken'], 'old-refresh-token');
          return http.Response(
            jsonEncode({
              'accessToken': 'new-access-token',
              'refreshToken': 'new-refresh-token',
            }),
            200,
          );
        }

        requestCount++;
        if (requestCount == 1) {
          // First attempt: return 401 Unauthorized
          return http.Response(jsonEncode({'error': 'Token expired'}), 401);
        } else {
          // Retry attempt: verify new token is attached
          expect(request.headers['Authorization'], 'Bearer new-access-token');
          return http.Response(jsonEncode({'success': true, 'data': 'profile'}), 200);
        }
      });

      final apiClient = ApiClient(httpClient: mockHttpClient);
      apiClient.setTokens(accessToken: 'old-access-token', refreshToken: 'old-refresh-token');

      apiClient.onTokensRefreshed = (accessToken, refreshToken) {
        refreshedAccess = accessToken;
        refreshedRefresh = refreshToken;
      };

      final response = await apiClient.get('/students/me');

      expect(response['success'], isTrue);
      expect(refreshCalled, isTrue);
      expect(requestCount, 2);
      expect(refreshedAccess, 'new-access-token');
      expect(refreshedRefresh, 'new-refresh-token');
      expect(apiClient.accessToken, 'new-access-token');
      expect(apiClient.refreshToken, 'new-refresh-token');
    });

    test('deduplicates concurrent 401 refresh requests with a single in-flight call', () async {
      int refreshCalls = 0;

      final mockHttpClient = MockClient((request) async {
        if (request.url.path.contains('/auth/refresh')) {
          refreshCalls++;
          await Future.delayed(const Duration(milliseconds: 50));
          return http.Response(
            jsonEncode({
              'accessToken': 'new-access-token',
              'refreshToken': 'new-refresh-token',
            }),
            200,
          );
        }

        if (request.headers['Authorization'] != 'Bearer new-access-token') {
          return http.Response(jsonEncode({'error': 'Unauthorized'}), 401);
        }
        return http.Response(jsonEncode({'ok': true}), 200);
      });

      final apiClient = ApiClient(httpClient: mockHttpClient);
      apiClient.setTokens(accessToken: 'old-token', refreshToken: 'valid-refresh-token');

      // Fire two concurrent requests
      final results = await Future.wait([
        apiClient.get('/students/me'),
        apiClient.get('/assessments/attempts/current'),
      ]);

      expect(results[0]['ok'], isTrue);
      expect(results[1]['ok'], isTrue);
      // Even with 2 concurrent 401s, /auth/refresh was only called once
      expect(refreshCalls, 1);
    });

    test('clears tokens and invokes onSessionExpired when refresh fails', () async {
      bool sessionExpiredCalled = false;

      final mockHttpClient = MockClient((request) async {
        if (request.url.path.contains('/auth/refresh')) {
          return http.Response(jsonEncode({'error': 'Invalid refresh token'}), 401);
        }
        return http.Response(jsonEncode({'error': 'Unauthorized'}), 401);
      });

      final apiClient = ApiClient(httpClient: mockHttpClient);
      apiClient.setTokens(accessToken: 'expired-access', refreshToken: 'revoked-refresh');
      apiClient.onSessionExpired = () {
        sessionExpiredCalled = true;
      };

      await expectLater(
        apiClient.get('/students/me'),
        throwsA(isA<ApiException>()),
      );

      expect(sessionExpiredCalled, isTrue);
      expect(apiClient.isAuthenticated, isFalse);
      expect(apiClient.accessToken, isNull);
      expect(apiClient.refreshToken, isNull);
    });
  });
}

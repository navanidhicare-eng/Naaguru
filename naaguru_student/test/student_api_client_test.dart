import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';

void main() {
  group('StudentApiClient', () {
    late ApiClient apiClient;
    late StudentApiClient studentApiClient;

    ApiClient buildClientWithMock(MockClient mockHttpClient) {
      final client = ApiClient(httpClient: mockHttpClient);
      client.setTokens(
          accessToken: 'test-token', refreshToken: 'test-refresh');
      return client;
    }

    test('getProfile returns profile data on 200', () async {
      final mockHttp = MockClient((request) async {
        expect(request.url.path, contains('/students/me'));
        expect(request.headers['Authorization'], 'Bearer test-token');
        return http.Response(
          jsonEncode({
            'userId': 'user-1',
            'fullName': 'Test Student',
            'educationStage': '10TH_PURSUING',
            'state': 'Telangana',
          }),
          200,
        );
      });

      apiClient = buildClientWithMock(mockHttp);
      studentApiClient = StudentApiClient(apiClient: apiClient);

      final profile = await studentApiClient.getProfile();

      expect(profile, isNotNull);
      expect(profile!['fullName'], 'Test Student');
      expect(profile['educationStage'], '10TH_PURSUING');
    });

    test('getProfile returns null on 404', () async {
      final mockHttp = MockClient((request) async {
        return http.Response(
          jsonEncode({'error': 'Profile not found'}),
          404,
        );
      });

      apiClient = buildClientWithMock(mockHttp);
      studentApiClient = StudentApiClient(apiClient: apiClient);

      final profile = await studentApiClient.getProfile();
      expect(profile, isNull);
    });

    test('createProfile sends correct body', () async {
      Map<String, dynamic>? capturedBody;

      final mockHttp = MockClient((request) async {
        capturedBody = jsonDecode(request.body) as Map<String, dynamic>;
        return http.Response(
          jsonEncode({
            'userId': 'user-1',
            'fullName': 'New Student',
            'educationStage': '10TH_PASSED',
          }),
          201,
        );
      });

      apiClient = buildClientWithMock(mockHttp);
      studentApiClient = StudentApiClient(apiClient: apiClient);

      await studentApiClient.createProfile(
        fullName: 'New Student',
        educationStage: '10TH_PASSED',
        state: 'Andhra Pradesh',
        city: 'Vijayawada',
      );

      expect(capturedBody, isNotNull);
      expect(capturedBody!['fullName'], 'New Student');
      expect(capturedBody!['educationStage'], '10TH_PASSED');
      expect(capturedBody!['state'], 'Andhra Pradesh');
      expect(capturedBody!['city'], 'Vijayawada');
      // Empty optional fields should not be sent
      expect(capturedBody!.containsKey('board'), false);
    });

    test('updateProfile sends partial body', () async {
      Map<String, dynamic>? capturedBody;

      final mockHttp = MockClient((request) async {
        expect(request.method, 'PATCH');
        capturedBody = jsonDecode(request.body) as Map<String, dynamic>;
        return http.Response(
          jsonEncode({
            'userId': 'user-1',
            'fullName': 'Updated Name',
            'educationStage': '10TH_PASSED',
          }),
          200,
        );
      });

      apiClient = buildClientWithMock(mockHttp);
      studentApiClient = StudentApiClient(apiClient: apiClient);

      await studentApiClient.updateProfile(fullName: 'Updated Name');

      expect(capturedBody!['fullName'], 'Updated Name');
    });

    test('throws ApiException on server error', () async {
      final mockHttp = MockClient((request) async {
        return http.Response(
          jsonEncode({'error': 'Internal Server Error'}),
          500,
        );
      });

      apiClient = buildClientWithMock(mockHttp);
      studentApiClient = StudentApiClient(apiClient: apiClient);

      expect(
        () => studentApiClient.createProfile(
          fullName: 'Test',
          educationStage: '10TH_PURSUING',
        ),
        throwsA(isA<ApiException>()),
      );
    });
  });
}

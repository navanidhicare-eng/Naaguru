import 'package:naaguru_student/core/api_client.dart';

/// Communicates with the Student profile REST API.
///
/// Backend contract:
///   GET    /students/me  → StudentProfileDto
///   POST   /students/me  → create profile (201)
///   PATCH  /students/me  → update profile (200)
class StudentApiClient {
  final ApiClient _apiClient;

  StudentApiClient({required ApiClient apiClient}) : _apiClient = apiClient;

  /// Fetches the current student's profile.
  /// Returns null if the profile does not exist (404).
  Future<Map<String, dynamic>?> getProfile() async {
    try {
      return await _apiClient.get('/students/me');
    } on ApiException catch (e) {
      if (e.statusCode == 404) return null;
      rethrow;
    }
  }

  /// Fetches the authenticated user's base info (including phone number).
  Future<Map<String, dynamic>> getMe() async {
    return await _apiClient.get('/auth/me');
  }

  /// Creates a new student profile.
  Future<Map<String, dynamic>> createProfile({
    required String fullName,
    required String educationStage,
    String? board,
    String? state,
    String? district,
    String? city,
    String? guardianName,
    String? guardianPhone,
  }) async {
    final body = <String, dynamic>{
      'fullName': fullName,
      'educationStage': educationStage,
    };
    if (board != null && board.isNotEmpty) body['board'] = board;
    if (state != null && state.isNotEmpty) body['state'] = state;
    if (district != null && district.isNotEmpty) body['district'] = district;
    if (city != null && city.isNotEmpty) body['city'] = city;
    if (guardianName != null && guardianName.isNotEmpty) {
      body['guardianName'] = guardianName;
    }
    if (guardianPhone != null && guardianPhone.isNotEmpty) {
      body['guardianPhone'] = guardianPhone;
    }

    return await _apiClient.post('/students/me', body: body);
  }

  /// Updates the current student's profile.
  Future<Map<String, dynamic>> updateProfile({
    String? fullName,
    String? educationStage,
    String? board,
    String? state,
    String? district,
    String? city,
    String? guardianName,
    String? guardianPhone,
  }) async {
    final body = <String, dynamic>{};
    if (fullName != null) body['fullName'] = fullName;
    if (educationStage != null) body['educationStage'] = educationStage;
    if (board != null) body['board'] = board;
    if (state != null) body['state'] = state;
    if (district != null) body['district'] = district;
    if (city != null) body['city'] = city;
    if (guardianName != null) body['guardianName'] = guardianName;
    if (guardianPhone != null) body['guardianPhone'] = guardianPhone;

    return await _apiClient.patch('/students/me', body: body);
  }
}

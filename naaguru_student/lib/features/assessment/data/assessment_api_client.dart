import 'package:naaguru_student/core/api_client.dart';

/// Communicates with the Assessment REST API.
///
/// Backend contract:
///   GET    /assessments/active                     → AssessmentVersionDto
///   GET    /assessments/attempts/current            → AssessmentAttemptDto (start or resume)
///   PATCH  /assessments/attempts/current/answers    → AssessmentAttemptDto (save answer)
///   POST   /assessments/attempts/current/submit     → AssessmentResultDto (submit attempt)
class AssessmentApiClient {
  final ApiClient _apiClient;

  AssessmentApiClient({required ApiClient apiClient}) : _apiClient = apiClient;

  /// Fetches the currently active assessment version with all questions & options.
  Future<Map<String, dynamic>> getActiveAssessment() async {
    return await _apiClient.get('/assessments/active');
  }

  /// Starts a new attempt or resumes the currently active in-progress attempt.
  Future<Map<String, dynamic>> startOrResumeAttempt() async {
    return await _apiClient.get('/assessments/attempts/current');
  }

  /// Saves or updates the student's selected option for a given question.
  Future<Map<String, dynamic>> saveAnswer({
    required String questionId,
    required String optionId,
  }) async {
    return await _apiClient.patch(
      '/assessments/attempts/current/answers',
      body: {
        'questionId': questionId,
        'optionId': optionId,
      },
    );
  }

  /// Submits the current attempt for scoring and completion.
  Future<Map<String, dynamic>> submitAttempt() async {
    return await _apiClient.post('/assessments/attempts/current/submit');
  }

  /// Fetches the latest completed assessment result for the student.
  Future<Map<String, dynamic>> getResult() async {
    return await _apiClient.get('/assessments/results/current');
  }

  /// Generates and fetches the career recommendation based on the current result.
  Future<Map<String, dynamic>> getRecommendation() async {
    return await _apiClient.post('/career/recommendations/generate');
  }
}

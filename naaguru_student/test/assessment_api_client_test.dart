import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/features/assessment/data/assessment_api_client.dart';

class MockApiClient extends ApiClient {
  final Map<String, dynamic> Function(String path) onGet;
  final Map<String, dynamic> Function(String path, {Map<String, dynamic>? body}) onPost;
  final Map<String, dynamic> Function(String path, {Map<String, dynamic>? body}) onPatch;

  MockApiClient({
    required this.onGet,
    required this.onPost,
    required this.onPatch,
  });

  @override
  Future<Map<String, dynamic>> get(String path) async {
    return onGet(path);
  }

  @override
  Future<Map<String, dynamic>> post(String path, {Map<String, dynamic>? body}) async {
    return onPost(path, body: body);
  }

  @override
  Future<Map<String, dynamic>> patch(String path, {Map<String, dynamic>? body}) async {
    return onPatch(path, body: body);
  }
}

void main() {
  group('AssessmentApiClient', () {
    test('getActiveAssessment calls GET /assessments/active', () async {
      bool called = false;
      final mock = MockApiClient(
        onGet: (path) {
          if (path == '/assessments/active') called = true;
          return {'id': 'v1'};
        },
        onPost: (path, {body}) => {},
        onPatch: (path, {body}) => {},
      );
      final client = AssessmentApiClient(apiClient: mock);

      final result = await client.getActiveAssessment();
      expect(result['id'], 'v1');
      expect(called, isTrue);
    });

    test('startOrResumeAttempt calls GET /assessments/attempts/current', () async {
      bool called = false;
      final mock = MockApiClient(
        onGet: (path) {
          if (path == '/assessments/attempts/current') called = true;
          return {'id': 'a1'};
        },
        onPost: (path, {body}) => {},
        onPatch: (path, {body}) => {},
      );
      final client = AssessmentApiClient(apiClient: mock);

      final result = await client.startOrResumeAttempt();
      expect(result['id'], 'a1');
      expect(called, isTrue);
    });

    test('saveAnswer calls PATCH /assessments/attempts/current/answers', () async {
      bool called = false;
      final mock = MockApiClient(
        onGet: (path) => {},
        onPost: (path, {body}) => {},
        onPatch: (path, {body}) {
          if (path == '/assessments/attempts/current/answers' && 
              body?['questionId'] == 'q1' && 
              body?['optionId'] == 'o1') {
            called = true;
          }
          return {'id': 'a1'};
        },
      );
      final client = AssessmentApiClient(apiClient: mock);

      await client.saveAnswer(questionId: 'q1', optionId: 'o1');
      expect(called, isTrue);
    });

    test('submitAttempt calls POST /assessments/attempts/current/submit', () async {
      bool called = false;
      final mock = MockApiClient(
        onGet: (path) => {},
        onPost: (path, {body}) {
          if (path == '/assessments/attempts/current/submit') called = true;
          return {'id': 'a1'};
        },
        onPatch: (path, {body}) => {},
      );
      final client = AssessmentApiClient(apiClient: mock);

      await client.submitAttempt();
      expect(called, isTrue);
    });

    test('getResult calls GET /assessments/results/current', () async {
      bool called = false;
      final mock = MockApiClient(
        onGet: (path) {
          if (path == '/assessments/results/current') called = true;
          return {'dimensionScores': {'Math': 90}};
        },
        onPost: (path, {body}) => {},
        onPatch: (path, {body}) => {},
      );
      final client = AssessmentApiClient(apiClient: mock);

      final result = await client.getResult();
      expect(result['dimensionScores']?['Math'], 90);
      expect(called, isTrue);
    });
  });
}

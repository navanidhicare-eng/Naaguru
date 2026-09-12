import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/features/assessment/presentation/results_screen.dart';
import 'package:naaguru_student/features/assessment/data/assessment_api_client.dart';
import 'package:naaguru_student/core/api_client.dart';

class MockApiClient extends ApiClient {
  final Map<String, dynamic> Function(String path) onGet;
  final Map<String, dynamic> Function(String path, {Map<String, dynamic>? body})? onPost;

  MockApiClient({
    required this.onGet,
    this.onPost,
  });

  @override
  Future<Map<String, dynamic>> get(String path) async => onGet(path);

  @override
  Future<Map<String, dynamic>> post(String path, {Map<String, dynamic>? body}) async {
    if (onPost != null) return onPost!(path, body: body);
    return {};
  }
}

void main() {
  testWidgets('ResultsScreen renders primary academic stream and interest areas', (WidgetTester tester) async {
    final mockApi = MockApiClient(
      onGet: (path) {
        if (path == '/assessments/results/current') {
          return {
            'dimensionScores': {
              'Math': 92,
              'Science': 85,
              'Engineering': 78,
            }
          };
        }
        throw Exception('Not found');
      },
      onPost: (path, {body}) {
        if (path == '/career/recommendations/generate') {
          return {
            'rankedResults': [
              {'streamCode': 'MPC', 'matchScore': 92},
              {'streamCode': 'MEC', 'matchScore': 75},
            ]
          };
        }
        return {};
      },
    );

    final apiClient = AssessmentApiClient(apiClient: mockApi);

    await tester.pumpWidget(MaterialApp(
      home: ResultsScreen(assessmentApiClient: apiClient),
    ));
    await tester.pumpAndSettle();

    // Verify Primary Section
    expect(find.text("• YOUR ASSESSMENT RESULT"), findsOneWidget);
    expect(find.text("Your strongest academic-stream match"), findsOneWidget);
    expect(find.text("MPC"), findsOneWidget);
    expect(find.text("Mathematics • Physics • Chemistry"), findsOneWidget);

    // Verify Interest Areas Section
    expect(find.text("YOUR TOP INTEREST AREAS"), findsOneWidget);
    expect(find.text("Strong affinity"), findsWidgets);

    // Verify CTA
    expect(find.text("Explore MPC"), findsOneWidget);
    expect(find.byIcon(Icons.arrow_forward), findsWidgets);
  });

  testWidgets('ResultsScreen toggles to Telugu', (WidgetTester tester) async {
    final initialResult = {
      'dimensionScores': {
        'Math': 90,
      }
    };
    final initialRec = {
      'rankedResults': [
        {'streamCode': 'CEC', 'matchScore': 90}
      ]
    };

    await tester.pumpWidget(MaterialApp(
      home: ResultsScreen(
        initialResult: initialResult,
        initialRecommendation: initialRec,
      ),
    ));
    await tester.pumpAndSettle();

    expect(find.text("• YOUR ASSESSMENT RESULT"), findsOneWidget);
    expect(find.text("CEC"), findsOneWidget);

    // Toggle Telugu
    await tester.tap(find.text("తెలుగు"));
    await tester.pumpAndSettle();

    expect(find.text("• మీ అంచనా ఫలితం"), findsOneWidget);
    expect(find.text("మీ బలమైన విద్యా-విభాగ మ్యాచ్"), findsOneWidget);
    expect(find.text("మీ ప్రధాన ఆసక్తి రంగాలు"), findsOneWidget);
    expect(find.text("అన్వేషించండి CEC"), findsOneWidget);
  });
}

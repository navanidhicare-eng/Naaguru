import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/features/assessment/presentation/assessment_question_screen.dart';
import 'package:naaguru_student/features/assessment/data/assessment_api_client.dart';
import 'package:naaguru_student/core/api_client.dart';

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
  Future<Map<String, dynamic>> get(String path) async => onGet(path);

  @override
  Future<Map<String, dynamic>> post(String path, {Map<String, dynamic>? body}) async => onPost(path, body: body);

  @override
  Future<Map<String, dynamic>> patch(String path, {Map<String, dynamic>? body}) async => onPatch(path, body: body);
}

void main() {
  Widget buildTestWidget({AssessmentApiClient? apiClient}) {
    return MaterialApp(
      home: AssessmentQuestionScreen(assessmentApiClient: apiClient),
    );
  }

  testWidgets('renders Question 1 of 40 with 5 option scale', (WidgetTester tester) async {
    await tester.pumpWidget(buildTestWidget());
    await tester.pumpAndSettle();

    expect(find.text("Question 1"), findsOneWidget);
    expect(find.text(" of 40"), findsOneWidget);
    expect(find.text("Science & Discovery"), findsOneWidget);
    expect(find.text("Strongly dislike"), findsOneWidget);
    expect(find.text("Dislike"), findsOneWidget);
    expect(find.text("Not sure"), findsOneWidget);
    expect(find.text("Like"), findsOneWidget);
    expect(find.text("Strongly like"), findsOneWidget);
  });

  testWidgets('toggles language to Telugu', (WidgetTester tester) async {
    await tester.pumpWidget(buildTestWidget());
    await tester.pumpAndSettle();

    final languageToggles = find.text("తెలుగు");
    await tester.tap(languageToggles.first);
    await tester.pumpAndSettle();

    expect(find.text("ప్రశ్న 1"), findsOneWidget);
    expect(find.text("సైన్స్ మరియు అన్వేషణ"), findsOneWidget);
    expect(find.text("అసలు ఆసక్తి ఉండదు"), findsOneWidget);
    expect(find.text("చాలా ఆసక్తిగా ఉంటుంది"), findsOneWidget);
  });

  testWidgets('selecting an option advances to Question 2', (WidgetTester tester) async {
    await tester.pumpWidget(buildTestWidget());
    await tester.pumpAndSettle();

    final optionFinder = find.text("Like");
    await tester.ensureVisible(optionFinder);
    await tester.tap(optionFinder);
    await tester.pump(const Duration(milliseconds: 350));
    await tester.pumpAndSettle();

    expect(find.text("Question 2"), findsOneWidget);
  });

  testWidgets('tapping back button from Question 2 returns to Question 1', (WidgetTester tester) async {
    await tester.pumpWidget(buildTestWidget());
    await tester.pumpAndSettle();

    final optionFinder = find.text("Like");
    await tester.ensureVisible(optionFinder);
    await tester.tap(optionFinder);
    await tester.pump(const Duration(milliseconds: 350));
    await tester.pumpAndSettle();

    expect(find.text("Question 2"), findsOneWidget);

    final backFinder = find.byIcon(Icons.arrow_back);
    await tester.ensureVisible(backFinder);
    await tester.tap(backFinder);
    await tester.pumpAndSettle();

    expect(find.text("Question 1"), findsOneWidget);
  });

  testWidgets('displays results screen if attempt already completed', (WidgetTester tester) async {
    final mockApi = MockApiClient(
      onGet: (path) {
        if (path == '/assessments/results/current') {
          return {
            'dimensionScores': {'Math': 95, 'Science': 88}
          };
        }
        throw Exception('Not found');
      },
      onPost: (p, {body}) => {},
      onPatch: (p, {body}) => {},
    );

    final apiClient = AssessmentApiClient(apiClient: mockApi);

    await tester.pumpWidget(buildTestWidget(apiClient: apiClient));
    await tester.pumpAndSettle();

    expect(find.text("Assessment Completed"), findsOneWidget);
    expect(find.text("Math"), findsOneWidget);
    expect(find.text("95.0/100"), findsOneWidget);
    expect(find.text("Science"), findsOneWidget);
    expect(find.text("88.0/100"), findsOneWidget);
  });
}

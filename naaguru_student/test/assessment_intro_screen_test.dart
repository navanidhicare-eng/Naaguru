import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/features/assessment/presentation/assessment_intro_screen.dart';
import 'package:naaguru_student/features/assessment/presentation/assessment_question_screen.dart';

void main() {
  Widget buildTestWidget() {
    return MaterialApp(
      initialRoute: '/assessment-intro',
      routes: {
        '/assessment-intro': (_) => const AssessmentIntroScreen(),
        '/assessment-question': (_) => const AssessmentQuestionScreen(),
      },
    );
  }

  testWidgets('renders AssessmentIntroScreen in English by default', (WidgetTester tester) async {
    await tester.pumpWidget(buildTestWidget());
    await tester.pumpAndSettle();

    expect(find.text("Ready to explore?"), findsOneWidget);
    expect(find.text("STEP 1 OF 3 • INTEREST DISCOVERY"), findsOneWidget);
    expect(find.text("40 quick questions"), findsOneWidget);
    expect(find.text("No marks"), findsOneWidget);
    expect(find.text("Self Paced"), findsOneWidget);
    expect(find.text("Let's Begin →"), findsOneWidget);
  });

  testWidgets('toggles language to Telugu', (WidgetTester tester) async {
    await tester.pumpWidget(buildTestWidget());
    await tester.pumpAndSettle();

    await tester.tap(find.text("తెలుగు"));
    await tester.pumpAndSettle();

    expect(find.text("మీ గురించి తెలుసుకోవడానికి సిద్ధంగా ఉన్నారా?"), findsOneWidget);
    expect(find.text("స్టెప్ 1 / 3 • ఆసక్తుల అన్వేషణ"), findsOneWidget);
    expect(find.text("40 చిన్న ప్రశ్నలు"), findsOneWidget);
    expect(find.text("ప్రారంభిద్దాం →"), findsOneWidget);
  });

  testWidgets('tapping primary button navigates to /assessment-question', (WidgetTester tester) async {
    await tester.pumpWidget(buildTestWidget());
    await tester.pumpAndSettle();

    await tester.tap(find.text("Let's Begin →"));
    await tester.pumpAndSettle();

    expect(find.byType(AssessmentQuestionScreen), findsOneWidget);
  });
}

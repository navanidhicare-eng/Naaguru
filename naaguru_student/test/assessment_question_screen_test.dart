    import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/features/assessment/presentation/assessment_question_screen.dart';

void main() {
  Widget buildTestWidget() {
    return const MaterialApp(
      home: AssessmentQuestionScreen(),
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
}

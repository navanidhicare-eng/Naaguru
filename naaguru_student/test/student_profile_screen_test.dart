import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/features/assessment/presentation/assessment_intro_screen.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';
import 'package:naaguru_student/features/student/presentation/student_profile_screen.dart';

void main() {
  late ApiClient apiClient;
  late StudentApiClient studentApiClient;

  setUp(() {
    final mockHttp = MockClient((request) async {
      return http.Response('', 404);
    });
    apiClient = ApiClient(httpClient: mockHttp);
    studentApiClient = StudentApiClient(apiClient: apiClient);
  });

  Widget buildTestWidget() {
    return MaterialApp(
      routes: {
        '/': (_) => StudentProfileScreen(studentApiClient: studentApiClient),
        '/assessment-intro': (_) => const AssessmentIntroScreen(),
      },
    );
  }

  testWidgets('renders Create Your Profile without Step 1 of 2 indicator', (WidgetTester tester) async {
    await tester.pumpWidget(buildTestWidget());
    await tester.pumpAndSettle();

    expect(find.text("Create Your Profile"), findsOneWidget);
    expect(find.textContaining("Step 1 of 2"), findsNothing);
    expect(find.text("10th"), findsOneWidget);
    expect(find.text("11th (Inter 1st)"), findsNothing);
  });

  testWidgets('Continue button is disabled until all required fields are valid', (WidgetTester tester) async {
    await tester.pumpWidget(buildTestWidget());
    await tester.pumpAndSettle();

    // Verify Continue button is initially disabled (onPressed is null)
    final buttonFinder = find.widgetWithText(ElevatedButton, "Continue →");
    expect(buttonFinder, findsOneWidget);
    ElevatedButton button = tester.widget(buttonFinder);
    expect(button.onPressed, isNull);

    final textFields = find.byType(TextFormField);

    // Fill Student Name (0th field)
    await tester.enterText(textFields.at(0), "Ramu");
    await tester.pumpAndSettle();

    // Select District
    await tester.ensureVisible(find.text("Select your district"));
    await tester.tap(find.text("Select your district"), warnIfMissed: false);
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text("Visakhapatnam").last);
    await tester.tap(find.text("Visakhapatnam").last);
    await tester.pumpAndSettle();

    // Fill Guardian Name (1st field)
    await tester.enterText(textFields.at(1), "Srinivas");
    await tester.pumpAndSettle();

    // Fill Guardian Mobile (2nd field - invalid 5 digits)
    await tester.enterText(textFields.at(2), "98765");
    await tester.pumpAndSettle();

    button = tester.widget(buttonFinder);
    expect(button.onPressed, isNull);

    // Fill Guardian Mobile (2nd field - valid 10 digits)
    await tester.enterText(textFields.at(2), "9876543210");
    await tester.pumpAndSettle();

    button = tester.widget(buttonFinder);
    expect(button.onPressed, isNotNull);
  });
}

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';
import 'package:naaguru_student/features/college/presentation/college_preferences_screen.dart';

class MockApiClient extends ApiClient {
  @override
  Future<Map<String, dynamic>> get(String path) async {
    return {'data': []};
  }
}

void main() {
  testWidgets('CollegePreferencesScreen renders options and allows selecting pathway', (WidgetTester tester) async {
    final client = CollegeApiClient(apiClient: MockApiClient());

    await tester.pumpWidget(MaterialApp(
      home: CollegePreferencesScreen(collegeApiClient: client),
    ));
    await tester.pumpAndSettle();

    expect(find.text('Find a College'), findsOneWidget);
    expect(find.text('Intermediate'), findsOneWidget);
    expect(find.text('Polytechnic'), findsOneWidget);
    expect(find.text('Find Colleges →'), findsOneWidget);

    // Tapping Polytechnic reveals Coming Soon note
    await tester.tap(find.text('Polytechnic'));
    await tester.pumpAndSettle();

    expect(find.text('Coming Soon to Naaguru'), findsOneWidget);
    expect(find.text('Switch to Intermediate'), findsOneWidget);

    // Tapping back to Intermediate shows Stream selector
    await tester.tap(find.text('Switch to Intermediate'));
    await tester.pumpAndSettle();

    expect(find.text('2. Academic Stream'), findsOneWidget);
    expect(find.text('MPC (Maths, Physics, Chemistry)'), findsOneWidget);
  });

  testWidgets('CollegePreferencesScreen toggles language to Telugu', (WidgetTester tester) async {
    final client = CollegeApiClient(apiClient: MockApiClient());

    await tester.pumpWidget(MaterialApp(
      home: CollegePreferencesScreen(collegeApiClient: client),
    ));
    await tester.pumpAndSettle();

    await tester.tap(find.text('తెలుగు'));
    await tester.pumpAndSettle();

    expect(find.text('కళాశాల ప్రాధాన్యతలు'), findsOneWidget);
    expect(find.text('ఇంటర్మీడియట్'), findsOneWidget);
    expect(find.text('కళాశాలలను కనుగొనండి →'), findsOneWidget);
  });
}

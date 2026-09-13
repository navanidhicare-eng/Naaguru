import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';
import 'package:naaguru_student/features/college/presentation/college_preferences_screen.dart';

class MockApiClient extends ApiClient {
  @override
  Future<Map<String, dynamic>> get(String path) async {
    if (path.contains('/catalog/pathways')) {
      return {
        'data': [
          {"id":"1","code":"INTERMEDIATE","nameEn":"Intermediate","nameTe":"ఇంటర్మీడియట్","icon":"🎓","status":"ACTIVE","displayOrder":1,"programs":[]},
          {"id":"2","code":"POLYTECHNIC","nameEn":"Polytechnic","nameTe":"పాలిటెక్నిక్","icon":"🔧","status":"COMING_SOON","displayOrder":2,"programs":[]},
          {"id":"3","code":"ITI","nameEn":"ITI Trades","nameTe":"ఐటిఐ ట్రేడ్స్","icon":"🛠","status":"COMING_SOON","displayOrder":3,"programs":[]},
          {"id":"4","code":"DEFENCE","nameEn":"Defence & Service","nameTe":"డిఫెన్స్ & సర్వీస్","icon":"🛡","status":"COMING_SOON","displayOrder":4,"programs":[]}
        ]
      };
    }
    return {'data': []};
  }
}

void main() {
  testWidgets('CollegePreferencesScreen renders options and allows selecting pathway', (WidgetTester tester) async {
    final client = CollegeApiClient(apiClient: MockApiClient());

    await tester.pumpWidget(MaterialApp(
      home: CollegePreferencesScreen(
        collegeApiClient: client,
        isTelugu: false,
        onLanguageChanged: (val) {},
      ),
    ));
    await tester.pumpAndSettle();

    expect(find.text('What do you want to pursue?'), findsOneWidget);
    expect(find.text('Intermediate'), findsOneWidget);
    expect(find.text('Polytechnic'), findsOneWidget);
    expect(find.text('Continue →'), findsOneWidget);

    // Coming soon text is visible 3 times (for Poly, ITI, Defence)
    expect(find.text('Coming soon'), findsNWidgets(3));
  });

  testWidgets('CollegePreferencesScreen renders in Telugu', (WidgetTester tester) async {
    final client = CollegeApiClient(apiClient: MockApiClient());

    await tester.pumpWidget(MaterialApp(
      home: CollegePreferencesScreen(
        collegeApiClient: client,
        isTelugu: true,
        onLanguageChanged: (val) {},
      ),
    ));
    await tester.pumpAndSettle();

    expect(find.text('మీరు ఏమి చదవాలనుకుంటున్నారు?'), findsOneWidget);
    expect(find.text('ఇంటర్మీడియట్'), findsOneWidget);
    expect(find.text('కొనసాగించండి →'), findsOneWidget);
    expect(find.text('త్వరలో'), findsNWidgets(3));
  });
}

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/features/college/presentation/college_location_preferences_screen.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';

// Create a Fake
class FakeCollegeApiClient implements CollegeApiClient {
  @override
  Future<List<Map<String, dynamic>>> getCatalogAreas() async {
    return [
      {"id": "1", "state": "Andhra Pradesh", "district": "Visakhapatnam", "displayNameEn": "Visakhapatnam", "displayNameTe": "విశాఖపట్నం", "status": "ACTIVE"},
      {"id": "2", "state": "Andhra Pradesh", "district": "Krishna", "displayNameEn": "Krishna", "displayNameTe": "కృష్ణా", "status": "ACTIVE"},
    ];
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

void main() {
  late FakeCollegeApiClient fakeApiClient;

  setUp(() {
    fakeApiClient = FakeCollegeApiClient();
  });

  testWidgets('CollegeLocationPreferencesScreen renders options and allows selections', (WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp(
      home: CollegeLocationPreferencesScreen(
        collegeApiClient: fakeApiClient,
        pathwayCode: 'INTERMEDIATE',
        programCode: 'MPC',
        isTelugu: false,
        onLanguageChanged: (val) {},
      ),
    ));
    await tester.pumpAndSettle();

    expect(find.text('Where would you like to study?'), findsOneWidget);
    expect(find.text('Visakhapatnam'), findsOneWidget);
    expect(find.text('Krishna'), findsOneWidget);
    expect(find.text('Yes'), findsOneWidget);
    expect(find.text('No'), findsOneWidget);
    expect(find.text('Either is fine'), findsOneWidget);
    expect(find.text('< ₹50,000'), findsOneWidget);
    expect(find.text('Up to ₹1,00,000'), findsOneWidget);
    expect(find.text('₹1,00,000+'), findsOneWidget);
    expect(find.text('Not sure yet'), findsOneWidget);

    // Initial state: continue disabled? (We can't easily check disabled via findsOneWidget if the button doesn't change text, 
    // but we can tap them all to simulate the flow).
    await tester.tap(find.text('Visakhapatnam'));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Yes'));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Up to ₹1,00,000'));
    await tester.pumpAndSettle();
  });

  testWidgets('CollegeLocationPreferencesScreen renders in Telugu', (WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp(
      home: CollegeLocationPreferencesScreen(
        collegeApiClient: fakeApiClient,
        pathwayCode: 'INTERMEDIATE',
        programCode: 'MPC',
        isTelugu: true,
        onLanguageChanged: (val) {},
      ),
    ));
    await tester.pumpAndSettle();

    expect(find.text('మీరు ఎక్కడ చదవాలనుకుంటున్నారు?'), findsOneWidget);
    expect(find.text('విశాఖపట్నం'), findsOneWidget);
    expect(find.text('అవును'), findsOneWidget);
    expect(find.text('మీ వార్షిక ట్యూషన్ ఫీజు అంచనా ఎంత?'), findsOneWidget);
  });
}

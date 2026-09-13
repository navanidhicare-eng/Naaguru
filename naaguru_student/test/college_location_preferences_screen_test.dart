import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';
import 'package:naaguru_student/features/college/presentation/college_discovery_wizard_state.dart';
import 'package:naaguru_student/features/college/presentation/college_location_preferences_screen.dart';
import 'package:naaguru_student/features/student/data/catalog_api_client.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';

class FakeCollegeApiClient extends CollegeApiClient {
  FakeCollegeApiClient() : super(apiClient: ApiClient());
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class FakeCatalogApiClient extends CatalogApiClient {
  FakeCatalogApiClient() : super(apiClient: ApiClient());
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class FakeStudentApiClient extends StudentApiClient {
  FakeStudentApiClient() : super(apiClient: ApiClient());
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

void main() {
  late FakeCollegeApiClient fakeCollegeApi;
  late FakeCatalogApiClient fakeCatalogApi;
  late FakeStudentApiClient fakeStudentApi;

  setUp(() {
    fakeCollegeApi = FakeCollegeApiClient();
    fakeCatalogApi = FakeCatalogApiClient();
    fakeStudentApi = FakeStudentApiClient();
  });

  testWidgets('CollegeLocationPreferencesScreen renders hierarchical location fields, hostel, and budget', (tester) async {
    tester.view.physicalSize = const Size(800, 1600);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);

    final wizardState = CollegeDiscoveryWizardState();
    wizardState.selectPathway(code: 'INTERMEDIATE', nameEn: 'Intermediate');
    wizardState.selectProgram(code: 'MPC', nameEn: 'MPC');

    await tester.pumpWidget(MaterialApp(
      home: CollegeLocationPreferencesScreen(
        collegeApiClient: fakeCollegeApi,
        catalogApiClient: fakeCatalogApi,
        studentApiClient: fakeStudentApi,
        wizardState: wizardState,
        pathwayCode: 'INTERMEDIATE',
        programCode: 'MPC',
        isTelugu: false,
        onLanguageChanged: (val) {},
      ),
    ));
    await tester.pumpAndSettle();

    // Section 1: Hierarchical Location Dropdowns / Pickers
    expect(find.text('Preferred study location'), findsOneWidget);
    expect(find.text('PREFERRED STATE'), findsOneWidget);
    expect(find.text('PREFERRED DISTRICT'), findsOneWidget);
    expect(find.text('PREFERRED MANDAL'), findsOneWidget);
    expect(find.text('PREFERRED VILLAGE / CITY'), findsOneWidget);

    // Section 2: Hostel options
    expect(find.text('Do you need hostel accommodation?'), findsOneWidget);
    expect(find.text('Yes'), findsOneWidget);
    expect(find.text('No'), findsOneWidget);
    expect(find.text('Either is fine'), findsOneWidget);

    // Section 3: Budget options
    expect(find.text("What's your approximate yearly tuition budget?"), findsOneWidget);
    expect(find.text('< ₹50,000'), findsOneWidget);
    expect(find.text('Up to ₹1,00,000'), findsOneWidget);
    expect(find.text('₹1,00,000+'), findsOneWidget);
    expect(find.text('Not sure yet'), findsOneWidget);

    // Button: Review Preferences
    expect(find.text('Continue to Review →'), findsOneWidget);

    // Interacting with Hostel and Budget
    await tester.tap(find.text('Yes'));
    await tester.pumpAndSettle();
    expect(wizardState.hostel, 'YES');

    await tester.tap(find.text('Up to ₹1,00,000'));
    await tester.pumpAndSettle();
    expect(wizardState.budget, 'UP_TO_1L');
  });

  testWidgets('CollegeLocationPreferencesScreen renders in Telugu', (tester) async {
    final wizardState = CollegeDiscoveryWizardState();
    wizardState.selectPathway(code: 'INTERMEDIATE', nameEn: 'Intermediate');
    wizardState.selectProgram(code: 'MPC', nameEn: 'MPC');

    await tester.pumpWidget(MaterialApp(
      home: CollegeLocationPreferencesScreen(
        collegeApiClient: fakeCollegeApi,
        catalogApiClient: fakeCatalogApi,
        studentApiClient: fakeStudentApi,
        wizardState: wizardState,
        pathwayCode: 'INTERMEDIATE',
        programCode: 'MPC',
        isTelugu: true,
        onLanguageChanged: (val) {},
      ),
    ));
    await tester.pumpAndSettle();

    expect(find.text('ప్రాధాన్యతా అధ్యయన ప్రాంతం'), findsOneWidget);
    expect(find.text('రాష్ట్రం'), findsOneWidget);
    expect(find.text('జిల్లా'), findsOneWidget);
    expect(find.text('మండలం'), findsOneWidget);
    expect(find.text('గ్రామం / నగరం'), findsOneWidget);
    expect(find.text('హాస్టల్ వసతి అవసరమా?'), findsOneWidget);
    expect(find.text('అవును'), findsOneWidget);
    expect(find.text('మీ వార్షిక ట్యూషన్ ఫీజు అంచనా ఎంత?'), findsOneWidget);
    expect(find.text('సమీక్షకు కొనసాగించండి →'), findsOneWidget);
  });
}

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/features/auth/auth_service.dart';
import 'package:naaguru_student/features/student/data/catalog_api_client.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';
import 'package:naaguru_student/features/student/presentation/profile_screen1_about_you.dart';
import 'package:naaguru_student/features/student/presentation/profile_wizard_state.dart';

class MockAuthService implements AuthService {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class MockStudentApiClient implements StudentApiClient {
  @override
  Future<Map<String, dynamic>?> getProfile() async => null;

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class MockCatalogApiClient implements CatalogApiClient {
  String? lastFetchedLocationId;
  List<CatalogSchool> schoolsToReturn = [];
  List<CatalogLocation> locationsToReturn = [];

  @override
  Future<List<CatalogSchool>> getSchools({
    String? search,
    String? locationId,
  }) async {
    lastFetchedLocationId = locationId;
    return schoolsToReturn;
  }

  @override
  Future<List<CatalogLocation>> getLocations({
    String? type,
    String? parentId,
  }) async {
    return locationsToReturn;
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

void main() {
  group('ProfileWizardState - School Location Cascading', () {
    test('school location fields are decoupled from residence location fields', () {
      final wizard = ProfileWizardState();

      const state1 = CatalogLocation(id: 's1', nameEn: 'Andhra Pradesh', type: 'STATE');
      const state2 = CatalogLocation(id: 's2', nameEn: 'Telangana', type: 'STATE');

      wizard.selectSchoolState(state1);
      wizard.selectState(state2);

      expect(wizard.schoolState?.id, 's1');
      expect(wizard.selectedState?.id, 's2');
      expect(wizard.schoolStateId, 's1');
    });

    test('cascading reset clears lower school levels when an upper level changes', () {
      final wizard = ProfileWizardState();

      const state = CatalogLocation(id: 's1', nameEn: 'AP', type: 'STATE');
      const district = CatalogLocation(id: 'd1', nameEn: 'Vizag', type: 'DISTRICT');
      const mandal = CatalogLocation(id: 'm1', nameEn: 'Bheemili', type: 'MANDAL');
      const locality = CatalogLocation(id: 'l1', nameEn: 'Tagarapuvalasa', type: 'LOCALITY');
      const school = CatalogSchool(id: 'sch1', nameEn: 'Govt High School');

      wizard.selectSchoolState(state);
      wizard.selectSchoolDistrict(district);
      wizard.selectSchoolMandal(mandal);
      wizard.selectSchoolLocality(locality);
      wizard.selectSchool(school);

      expect(wizard.selectedSchoolId, 'sch1');
      expect(wizard.schoolLocalityId, 'l1');

      // Changing district resets mandal, locality, and school
      const district2 = CatalogLocation(id: 'd2', nameEn: 'Anakapalli', type: 'DISTRICT');
      wizard.selectSchoolDistrict(district2);

      expect(wizard.schoolDistrictId, 'd2');
      expect(wizard.schoolMandal, isNull);
      expect(wizard.schoolLocality, isNull);
      expect(wizard.selectedSchool, isNull);

      // Re-populate and change mandal
      wizard.selectSchoolMandal(mandal);
      wizard.selectSchoolLocality(locality);
      wizard.selectSchool(school);

      const mandal2 = CatalogLocation(id: 'm2', nameEn: 'Anandapuram', type: 'MANDAL');
      wizard.selectSchoolMandal(mandal2);

      expect(wizard.schoolMandalId, 'm2');
      expect(wizard.schoolLocality, isNull);
      expect(wizard.selectedSchool, isNull);

      // Re-populate and change state
      wizard.selectSchoolLocality(locality);
      wizard.selectSchool(school);

      const state2 = CatalogLocation(id: 's2', nameEn: 'Telangana', type: 'STATE');
      wizard.selectSchoolState(state2);

      expect(wizard.schoolStateId, 's2');
      expect(wizard.schoolDistrict, isNull);
      expect(wizard.schoolMandal, isNull);
      expect(wizard.schoolLocality, isNull);
      expect(wizard.selectedSchool, isNull);
    });

    test('screen1Valid requires full name, gender, all 4 school location levels, and school', () {
      final wizard = ProfileWizardState();

      expect(wizard.screen1Valid, isFalse);

      wizard.updateFullName('Ravi Kumar');
      expect(wizard.screen1Valid, isFalse);

      wizard.updateGender('MALE');
      expect(wizard.screen1Valid, isFalse);

      wizard.selectSchoolState(const CatalogLocation(id: 's1', nameEn: 'AP', type: 'STATE'));
      expect(wizard.screen1Valid, isFalse);

      wizard.selectSchoolDistrict(const CatalogLocation(id: 'd1', nameEn: 'Vizag', type: 'DISTRICT'));
      expect(wizard.screen1Valid, isFalse);

      wizard.selectSchoolMandal(const CatalogLocation(id: 'm1', nameEn: 'Bheemili', type: 'MANDAL'));
      expect(wizard.screen1Valid, isFalse);

      wizard.selectSchoolLocality(const CatalogLocation(id: 'l1', nameEn: 'Bheemili Ward', type: 'LOCALITY'));
      expect(wizard.screen1Valid, isFalse);

      wizard.selectSchool(const CatalogSchool(id: 'sch1', nameEn: 'Zilla Parishad High School'));
      expect(wizard.screen1Valid, isTrue);

      // Deselecting school makes it invalid again
      wizard.clearSchool();
      expect(wizard.screen1Valid, isFalse);
    });
  });

  group('ProfileScreen1AboutYou Widget Tests', () {
    late MockAuthService authService;
    late MockStudentApiClient studentApiClient;
    late MockCatalogApiClient catalogApiClient;

    setUp(() {
      authService = MockAuthService();
      studentApiClient = MockStudentApiClient();
      catalogApiClient = MockCatalogApiClient();
    });

    Widget createScreen({ProfileWizardState? wizardState}) {
      return MaterialApp(
        home: ProfileScreen1AboutYou(
          authService: authService,
          studentApiClient: studentApiClient,
          catalogApiClient: catalogApiClient,
          wizardState: wizardState,
        ),
      );
    }

    testWidgets('renders identity fields and school location hierarchy selector', (tester) async {
      await tester.pumpWidget(createScreen());
      await tester.pumpAndSettle();

      expect(find.text('Full Name'), findsOneWidget);
      expect(find.text('Gender'), findsOneWidget);
      expect(find.text('Male'), findsOneWidget);
      expect(find.text('Female'), findsOneWidget);

      expect(find.text('SCHOOL STATE'), findsOneWidget);
      expect(find.text('SCHOOL DISTRICT'), findsOneWidget);
      expect(find.text('SCHOOL MANDAL'), findsOneWidget);
      expect(find.text('SCHOOL VILLAGE / CITY / WARD'), findsOneWidget);

      // Helper message shown when locality is not yet chosen
      expect(find.text('Select your school location to see schools.'), findsOneWidget);
    });

    testWidgets('displays schools and allows selection when locality is selected', (tester) async {
      final wizard = ProfileWizardState();
      wizard.updateFullName('Sita Devi');
      wizard.updateGender('FEMALE');
      wizard.selectSchoolState(const CatalogLocation(id: 's1', nameEn: 'Andhra Pradesh', type: 'STATE'));
      wizard.selectSchoolDistrict(const CatalogLocation(id: 'd1', nameEn: 'Visakhapatnam', type: 'DISTRICT'));
      wizard.selectSchoolMandal(const CatalogLocation(id: 'm1', nameEn: 'Bheemunipatnam', type: 'MANDAL'));
      wizard.selectSchoolLocality(const CatalogLocation(id: 'loc1', nameEn: 'Bheemili Beach Road', type: 'LOCALITY'));

      catalogApiClient.schoolsToReturn = [
        const CatalogSchool(id: 'sch1', nameEn: 'Govt High School Bheemili', locationId: 'loc1'),
        const CatalogSchool(id: 'sch2', nameEn: 'Zilla Parishad High School', locationId: 'loc1'),
      ];

      await tester.pumpWidget(createScreen(wizardState: wizard));
      await tester.pumpAndSettle();

      expect(catalogApiClient.lastFetchedLocationId, 'loc1');
      expect(find.text('Schools in Bheemili Beach Road'), findsOneWidget);
      expect(find.text('Govt High School Bheemili'), findsOneWidget);
      expect(find.text('Zilla Parishad High School'), findsOneWidget);

      // Initially Continue is disabled because no school selected yet
      final continueButtonBefore = tester.widget<ElevatedButton>(
        find.widgetWithText(ElevatedButton, 'Continue'),
      );
      expect(continueButtonBefore.onPressed, isNull);

      // Tap to select school (scroll into view first)
      await tester.ensureVisible(find.text('Govt High School Bheemili'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Govt High School Bheemili'));
      await tester.pumpAndSettle();

      expect(wizard.selectedSchool?.id, 'sch1');
      expect(wizard.screen1Valid, isTrue);

      final continueButtonAfter = tester.widget<ElevatedButton>(
        find.widgetWithText(ElevatedButton, 'Continue'),
      );
      expect(continueButtonAfter.onPressed, isNotNull);
    });

    testWidgets('displays empty state when locality has no partner schools', (tester) async {
      final wizard = ProfileWizardState();
      wizard.selectSchoolState(const CatalogLocation(id: 's1', nameEn: 'Andhra Pradesh', type: 'STATE'));
      wizard.selectSchoolDistrict(const CatalogLocation(id: 'd1', nameEn: 'Visakhapatnam', type: 'DISTRICT'));
      wizard.selectSchoolMandal(const CatalogLocation(id: 'm1', nameEn: 'Bheemunipatnam', type: 'MANDAL'));
      wizard.selectSchoolLocality(const CatalogLocation(id: 'loc1', nameEn: 'Remote Locality', type: 'LOCALITY'));

      catalogApiClient.schoolsToReturn = [];

      await tester.pumpWidget(createScreen(wizardState: wizard));
      await tester.pumpAndSettle();

      expect(find.text('No schools available in this area.'), findsOneWidget);
      expect(find.text('Request your school'), findsOneWidget);
    });
  });
}

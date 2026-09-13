import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/features/auth/auth_service.dart';
import 'package:naaguru_student/features/student/data/catalog_api_client.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';
import 'package:naaguru_student/features/student/presentation/profile_screen2_where_you_live.dart';
import 'package:naaguru_student/features/student/presentation/profile_wizard_state.dart';

void main() {
  late MockClient mockHttpClient;
  late ApiClient apiClient;
  late AuthService authService;
  late StudentApiClient studentApiClient;
  late CatalogApiClient catalogApiClient;
  late ProfileWizardState wizardState;

  final defaultLocations = {
    'STATE': [
      {'id': 'state-1', 'nameEn': 'Andhra Pradesh', 'nameTe': 'ఆంధ్రప్రదేశ్', 'type': 'STATE'}
    ],
    'DISTRICT': [
      {'id': 'dist-1', 'nameEn': 'Visakhapatnam', 'nameTe': 'విశాఖపట్నం', 'type': 'DISTRICT', 'parentId': 'state-1'},
      {'id': 'dist-2', 'nameEn': 'Guntur', 'nameTe': 'గుంటూరు', 'type': 'DISTRICT', 'parentId': 'state-1'},
    ],
    'MANDAL': [
      {'id': 'mandal-1', 'nameEn': 'Anandapuram', 'nameTe': 'ఆనందపురం', 'type': 'MANDAL', 'parentId': 'dist-1'}
    ],
    'LOCALITY': [
      {'id': 'loc-1', 'nameEn': 'Anandapuram Town', 'nameTe': 'ఆనందపురం టౌన్', 'type': 'LOCALITY', 'parentId': 'mandal-1'},
      {'id': 'loc-2', 'nameEn': 'Gambheeram', 'nameTe': 'గంబీరం', 'type': 'LOCALITY', 'parentId': 'mandal-1'},
    ],
  };

  void setupMocks({bool failApi = false, bool emptyApi = false}) {
    mockHttpClient = MockClient((request) async {
      if (failApi) return http.Response('Error', 500);

      final url = request.url;
      if (url.path.contains('/catalog/locations')) {
        if (emptyApi) return http.Response(jsonEncode({'data': []}), 200, headers: {'content-type': 'application/json; charset=utf-8'});

        final type = url.queryParameters['type'];
        final parentId = url.queryParameters['parentId'];

        List<dynamic> items = [];
        if (type != null) {
          items = defaultLocations[type] ?? [];
          if (parentId != null) {
            items = items.where((item) => item['parentId'] == parentId).toList();
          }
        }
        return http.Response(jsonEncode({'data': items}), 200, headers: {'content-type': 'application/json; charset=utf-8'});
      }
      return http.Response('ok', 200);
    });

    apiClient = ApiClient(httpClient: mockHttpClient);
    authService = AuthService(apiClient: apiClient);
    studentApiClient = StudentApiClient(apiClient: apiClient);
    catalogApiClient = CatalogApiClient(apiClient: apiClient);
    wizardState = ProfileWizardState();
    // Simulate Screen 1 valid state
    wizardState.updateFullName('Test Student');
    wizardState.selectSchool(const CatalogSchool(id: 'school-1', nameEn: 'Test School'));
  }

  Widget wrapScreen() {
    return MaterialApp(
      home: ProfileScreen2WhereYouLive(
        authService: authService,
        studentApiClient: studentApiClient,
        catalogApiClient: catalogApiClient,
        wizardState: wizardState,
      ),
    );
  }

  group('ProfileScreen2WhereYouLive tests', () {
    testWidgets('1. Screen renders', (tester) async {
      setupMocks();
      await tester.pumpWidget(wrapScreen());
      expect(find.text('Where do you live?'), findsOneWidget);
      expect(find.text('Step 2 of 3: Where You Live'), findsOneWidget);
    });

    testWidgets('English shows English only, Telugu shows Telugu only', (tester) async {
      setupMocks();
      await tester.pumpWidget(wrapScreen());
      
      expect(find.text('Where do you live?'), findsOneWidget);
      expect(find.text('మీరు ఎక్కడ నివసిస్తున్నారు?'), findsNothing);

      await tester.tap(find.text('తెలుగు'));
      await tester.pumpAndSettle();

      expect(find.text('Where do you live?'), findsNothing);
      expect(find.text('మీరు ఎక్కడ నివసిస్తున్నారు?'), findsOneWidget);
    });

    testWidgets('Location cascading logic, selections, and reset behavior', (tester) async {
      setupMocks();
      await tester.pumpWidget(wrapScreen());

      // 2. Select State
      await tester.tap(find.text('Select state'));
      await tester.pumpAndSettle();
      expect(find.text('Select State'), findsOneWidget); // Bottom sheet header
      expect(find.text('Andhra Pradesh'), findsOneWidget);
      await tester.tap(find.text('Andhra Pradesh'));
      await tester.pumpAndSettle();
      expect(wizardState.selectedState?.id, 'state-1');
      expect(find.text('Andhra Pradesh'), findsOneWidget);

      // 3. Select District
      await tester.tap(find.text('Select district'));
      await tester.pumpAndSettle();
      expect(find.text('Visakhapatnam'), findsOneWidget);
      expect(find.text('Guntur'), findsOneWidget);
      await tester.tap(find.text('Visakhapatnam'));
      await tester.pumpAndSettle();
      expect(wizardState.selectedDistrict?.id, 'dist-1');

      // 4. Select Mandal
      await tester.tap(find.text('Select mandal'));
      await tester.pumpAndSettle();
      expect(find.text('Anandapuram'), findsOneWidget);
      await tester.tap(find.text('Anandapuram'));
      await tester.pumpAndSettle();
      expect(wizardState.selectedMandal?.id, 'mandal-1');

      // 5. Select Locality
      final localitySearch = find.text('Search village, ward, or locality...');
      await tester.ensureVisible(localitySearch);
      await tester.tap(localitySearch);
      await tester.pumpAndSettle();
      expect(find.text('Anandapuram Town'), findsOneWidget);
      await tester.tap(find.text('Anandapuram Town'));
      await tester.pumpAndSettle();
      expect(wizardState.selectedLocality?.id, 'loc-1');
      
      // 6/7/8. Change State clears dependents
      final stateTrigger = find.text('Andhra Pradesh').first;
      await tester.ensureVisible(stateTrigger);
      await tester.tap(stateTrigger);
      await tester.pumpAndSettle();
      
      final stateOption = find.text('Andhra Pradesh').last;
      await tester.ensureVisible(stateOption);
      await tester.tap(stateOption);
      await tester.pumpAndSettle();

      // State is still AP, but re-selecting it should clear district/mandal/locality
      expect(wizardState.selectedDistrict, isNull);
      expect(wizardState.selectedMandal, isNull);
      expect(wizardState.selectedLocality, isNull);
    });

    testWidgets('Search works within the available catalog data', (tester) async {
      setupMocks();
      await tester.pumpWidget(wrapScreen());
      
      // Select state to unblock district
      await tester.tap(find.text('Select state'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Andhra Pradesh'));
      await tester.pumpAndSettle();

      // Search district
      await tester.tap(find.text('Select district'));
      await tester.pumpAndSettle();
      expect(find.text('Visakhapatnam'), findsOneWidget);
      expect(find.text('Guntur'), findsOneWidget);

      await tester.enterText(find.byType(TextField).last, 'gunt');
      await tester.pump(const Duration(milliseconds: 300)); // wait for debounce
      
      expect(find.text('Visakhapatnam'), findsNothing);
      expect(find.text('Guntur'), findsOneWidget);
    });

    testWidgets('Invalid pincode disables Continue, valid enables (with locations)', (tester) async {
      setupMocks();
      await tester.pumpWidget(wrapScreen());

      final continueFinder = find.byType(ElevatedButton);
      final elevatedButton = tester.widget<ElevatedButton>(continueFinder);
      expect(elevatedButton.enabled, isFalse);

      // Force select all locations via wizard state for testing
      wizardState.selectState(CatalogLocation.fromJson(defaultLocations['STATE']![0]));
      wizardState.selectDistrict(CatalogLocation.fromJson(defaultLocations['DISTRICT']![0]));
      wizardState.selectMandal(CatalogLocation.fromJson(defaultLocations['MANDAL']![0]));
      wizardState.selectLocality(CatalogLocation.fromJson(defaultLocations['LOCALITY']![0]));
      await tester.pump();

      // Still disabled because Pincode is not 6 digits
      expect(tester.widget<ElevatedButton>(continueFinder).enabled, isFalse);

      // Enter valid pincode
      await tester.enterText(find.widgetWithText(TextField, 'e.g. 530052'), '530052');
      await tester.pump();

      // Now it should be enabled
      expect(tester.widget<ElevatedButton>(continueFinder).enabled, isTrue);

      // Enter invalid pincode
      await tester.enterText(find.widgetWithText(TextField, '530052'), '53005');
      await tester.pump();

      // Disabled again
      expect(tester.widget<ElevatedButton>(continueFinder).enabled, isFalse);
    });

    testWidgets('Continue navigates to Screen 3 without submitting backend', (tester) async {
      setupMocks();
      await tester.pumpWidget(wrapScreen());

      // Setup valid state
      wizardState.selectState(CatalogLocation.fromJson(defaultLocations['STATE']![0]));
      wizardState.selectDistrict(CatalogLocation.fromJson(defaultLocations['DISTRICT']![0]));
      wizardState.selectMandal(CatalogLocation.fromJson(defaultLocations['MANDAL']![0]));
      wizardState.selectLocality(CatalogLocation.fromJson(defaultLocations['LOCALITY']![0]));
      await tester.enterText(find.widgetWithText(TextField, 'e.g. 530052'), '530052');
      await tester.pumpAndSettle();

      await tester.tap(find.byType(ElevatedButton));
      await tester.pumpAndSettle();

      // We should be on Screen 3
      expect(find.text('Step 3 of 3 • Final Review'), findsOneWidget);
    });

    testWidgets('API failure shows retry state', (tester) async {
      setupMocks(failApi: true);
      await tester.pumpWidget(wrapScreen());

      await tester.tap(find.text('Select state'));
      await tester.pumpAndSettle();

      expect(find.text("Couldn't load locations"), findsOneWidget);
      expect(find.text('Try again'), findsOneWidget);
    });

    testWidgets('Empty results show appropriate state', (tester) async {
      setupMocks(emptyApi: true);
      await tester.pumpWidget(wrapScreen());

      await tester.tap(find.text('Select state'));
      await tester.pumpAndSettle();

      expect(find.text('No locations available'), findsOneWidget);
    });
  });
}

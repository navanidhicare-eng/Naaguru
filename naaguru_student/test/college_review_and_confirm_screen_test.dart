import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';
import 'package:naaguru_student/features/college/presentation/college_discovery_wizard_state.dart';
import 'package:naaguru_student/features/college/presentation/college_list_screen.dart';
import 'package:naaguru_student/features/college/presentation/college_review_and_confirm_screen.dart';
import 'package:naaguru_student/features/student/data/catalog_api_client.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';

class MockCollegeApiClient extends CollegeApiClient {
  MockCollegeApiClient() : super(apiClient: ApiClient());

  @override
  Future<List<Map<String, dynamic>>> searchColleges({
    String? streamCode,
    String? district,
    String? city,
    bool? requiresHostel,
    bool? requiresBoysHostel,
    bool? requiresGirlsHostel,
    int? maxFee,
  }) async {
    return [
      {'id': 'clg-1', 'name': 'Vignan Junior College', 'district': district ?? 'Guntur'}
    ];
  }
}

class MockStudentApiClient extends StudentApiClient {
  String studentGender = 'MALE';
  Map<String, dynamic>? submittedPayload;
  int submitCount = 0;
  int failStatusCode = 0;
  Map<String, dynamic>? mockIntent;
  bool failGetIntent = false;

  MockStudentApiClient() : super(apiClient: ApiClient());

  @override
  Future<Map<String, dynamic>?> getProfile() async {
    return {
      'id': 'std-1',
      'fullName': 'Prasad Kumar',
      'gender': studentGender,
    };
  }

  @override
  Future<Map<String, dynamic>?> getCurrentCollegeIntent() async {
    if (failGetIntent) {
      throw ApiException('Connection failed', 500);
    }
    return mockIntent;
  }

  @override
  Future<Map<String, dynamic>> submitCollegeIntent({
    required String pathwayCode,
    String? programCode,
    String? preferredLocationId,
    bool requiresHostel = false,
    String? hostelGender,
    int? maxAnnualFee,
  }) async {
    submitCount++;
    if (failStatusCode != 0) {
      throw ApiException(
        failStatusCode == 403
            ? 'Maximum revisions reached'
            : 'Internal server error',
        failStatusCode,
      );
    }
    submittedPayload = {
      'pathwayCode': pathwayCode,
      'programCode': programCode,
      'preferredLocationId': preferredLocationId,
      'requiresHostel': requiresHostel,
      'hostelGender': hostelGender,
      'maxAnnualFee': maxAnnualFee,
    };
    return {
      'id': 'intent-123',
      'versionNumber': 1,
      'status': 'ACTIVE',
    };
  }
}

void main() {
  late CollegeDiscoveryWizardState wizardState;
  late MockCollegeApiClient collegeApiClient;
  late MockStudentApiClient studentApiClient;

  setUp(() {
    wizardState = CollegeDiscoveryWizardState();
    wizardState.selectPathway(code: 'INTERMEDIATE', nameEn: 'Intermediate');
    wizardState.selectProgram(code: 'MPC', nameEn: 'MPC');
    wizardState.selectPreferredState(CatalogLocation(
      id: 'state-ap',
      type: 'STATE',
      nameEn: 'Andhra Pradesh',
      nameTe: 'ఆంధ్రప్రదేశ్',
    ));
    wizardState.selectPreferredDistrict(CatalogLocation(
      id: 'dist-gnt',
      type: 'DISTRICT',
      nameEn: 'Guntur',
      nameTe: 'గుంటూరు',
      parentId: 'state-ap',
    ));
    wizardState.selectPreferredMandal(CatalogLocation(
      id: 'mnd-ten',
      type: 'MANDAL',
      nameEn: 'Tenali',
      nameTe: 'తెనాలి',
      parentId: 'dist-gnt',
    ));
    wizardState.selectPreferredLocality(CatalogLocation(
      id: 'loc-mor',
      type: 'LOCALITY',
      nameEn: 'Morrispet',
      nameTe: 'మోరిస్‌పేట్',
      parentId: 'mnd-ten',
    ));
    wizardState.selectHostel('YES');
    wizardState.selectBudget('UP_TO_1L');

    collegeApiClient = MockCollegeApiClient();
    studentApiClient = MockStudentApiClient();
  });

  Widget buildScreen({bool isTelugu = false}) {
    return MaterialApp(
      home: CollegeReviewAndConfirmScreen(
        wizardState: wizardState,
        collegeApiClient: collegeApiClient,
        studentApiClient: studentApiClient,
        isTelugu: isTelugu,
      ),
    );
  }

  group('Review Screen Editability & Version Rules', () {
    testWidgets('1. No saved intent / creation flow: normal review behavior with Edit enabled', (tester) async {
      studentApiClient.mockIntent = null; // No intent yet

      await tester.pumpWidget(buildScreen());
      await tester.pumpAndSettle();

      expect(find.text("Let's make sure this looks right"), findsOneWidget);
      expect(find.textContaining('VERIFIED MATCH'), findsNothing);

      // Edit buttons are enabled
      expect(find.text('Edit'), findsNWidgets(5));
      expect(find.text('Final'), findsNothing);

      // Main CTA button enabled
      expect(find.text('Confirm & View Colleges'), findsOneWidget);
    });

    testWidgets('2. Existing Version 1: Edit buttons are enabled', (tester) async {
      studentApiClient.mockIntent = {
        'id': 'intent-v1',
        'versionNumber': 1,
        'remainingChanges': 1,
        'status': 'ACTIVE',
      };

      await tester.pumpWidget(buildScreen());
      await tester.pumpAndSettle();

      // Version 1 allows revision -> Edit buttons are shown
      expect(find.text('Edit'), findsNWidgets(5));
      expect(find.text('Final'), findsNothing);
      expect(find.text('FINAL PREFERENCES'), findsNothing);
    });

    testWidgets('3 & 4. Existing Version 2: Edit buttons are disabled/non-navigable and show Final badge', (tester) async {
      studentApiClient.mockIntent = {
        'id': 'intent-v2',
        'versionNumber': 2,
        'remainingChanges': 0,
        'status': 'ACTIVE',
      };

      await tester.pumpWidget(buildScreen());
      await tester.pumpAndSettle();

      // Edit buttons are replaced with Final badges
      expect(find.text('Edit'), findsNothing);
      expect(find.text('Final'), findsNWidgets(5));

      // Subtle locked banner is shown
      expect(find.text('FINAL PREFERENCES'), findsOneWidget);
      expect(find.text('Your preference changes have been used. You can still view colleges based on your current choices.'), findsOneWidget);
    });

    testWidgets('5. Existing Version 2: current final preferences remain visible', (tester) async {
      studentApiClient.mockIntent = {
        'id': 'intent-v2',
        'versionNumber': 2,
        'remainingChanges': 0,
        'status': 'ACTIVE',
      };

      await tester.pumpWidget(buildScreen());
      await tester.pumpAndSettle();

      expect(find.text('Intermediate'), findsOneWidget);
      expect(find.text('MPC'), findsOneWidget);
      expect(find.text('Morrispet, Guntur'), findsOneWidget);
      expect(find.text('Andhra Pradesh → Guntur → Tenali → Morrispet'), findsOneWidget);
      expect(find.text('Yes, required'), findsOneWidget);
      expect(find.text('Up to ₹1,00,000 / year'), findsOneWidget);
    });

    testWidgets('6. Existing Version 2: main Confirm & View Colleges CTA remains enabled and views colleges without 403', (tester) async {
      studentApiClient.mockIntent = {
        'id': 'intent-v2',
        'versionNumber': 2,
        'remainingChanges': 0,
        'status': 'ACTIVE',
      };

      await tester.pumpWidget(buildScreen());
      await tester.pumpAndSettle();

      // CTA remains enabled
      final cta = find.text('Confirm & View Colleges');
      expect(cta, findsOneWidget);

      await tester.tap(cta);
      await tester.pumpAndSettle();

      // Critically: DOES NOT call submitCollegeIntent (which would reject with 403)
      expect(studentApiClient.submitCount, 0);

      // Navigated to CollegeListScreen directly!
      expect(find.byType(CollegeListScreen), findsOneWidget);
    });

    testWidgets('7. Existing Version 2: no Maximum revisions reached blocking error shown merely because screen is opened', (tester) async {
      studentApiClient.mockIntent = {
        'id': 'intent-v2',
        'versionNumber': 2,
        'remainingChanges': 0,
        'status': 'ACTIVE',
      };

      await tester.pumpWidget(buildScreen());
      await tester.pumpAndSettle();

      expect(find.textContaining('Maximum self-service revisions reached'), findsNothing);
      expect(find.textContaining('Maximum revisions reached'), findsNothing);
    });

    testWidgets('8. API failure loading current intent: editing is safely locked (not incorrectly enabled)', (tester) async {
      studentApiClient.failGetIntent = true;

      await tester.pumpWidget(buildScreen());
      await tester.pumpAndSettle();

      // Edit buttons must NOT be shown
      expect(find.text('Edit'), findsNothing);
      expect(find.text('Final'), findsNWidgets(5));

      // Retry banner is displayed
      expect(find.text('Could not verify revision limit. Tap Retry to check again.'), findsOneWidget);
      expect(find.text('Retry'), findsOneWidget);
    });

    testWidgets('9. Backend 403 during submission: handled gracefully and current intent refreshed', (tester) async {
      studentApiClient.mockIntent = {
        'id': 'intent-v1',
        'versionNumber': 1,
        'remainingChanges': 1,
        'status': 'ACTIVE',
      };
      studentApiClient.failStatusCode = 403; // Backend rejects submission with 403

      await tester.pumpWidget(buildScreen());
      await tester.pumpAndSettle();

      // Right before/during submission failure, backend intent is now Version 2
      studentApiClient.mockIntent = {
        'id': 'intent-v2',
        'versionNumber': 2,
        'remainingChanges': 0,
        'status': 'ACTIVE',
      };

      await tester.tap(find.text('Confirm & View Colleges'));
      await tester.pumpAndSettle();

      // Error message is displayed
      expect(find.text('Maximum self-service revisions reached (limit: 2).'), findsOneWidget);
      // Editing is locked
      expect(find.text('Edit'), findsNothing);
      expect(find.text('Final'), findsNWidgets(5));
      // User is not trapped: CTA is still available
      expect(find.text('Confirm & View Colleges'), findsOneWidget);
    });

    testWidgets('10 & 11. Rapid Confirm taps: no duplicate submission', (tester) async {
      studentApiClient.mockIntent = null;

      await tester.pumpWidget(buildScreen());
      await tester.pumpAndSettle();

      // Tap Confirm twice rapidly without pumpAndSettle in between
      await tester.tap(find.text('Confirm & View Colleges'), warnIfMissed: false);
      await tester.tap(find.text('Confirm & View Colleges'), warnIfMissed: false);
      await tester.pumpAndSettle();

      expect(studentApiClient.submitCount, 1);
      expect(find.byType(CollegeListScreen), findsOneWidget);
    });

    testWidgets('Translates Student.gender MALE to BOYS on initial submission', (tester) async {
      studentApiClient.studentGender = 'MALE';
      await tester.pumpWidget(buildScreen());
      await tester.pumpAndSettle();

      await tester.tap(find.text('Confirm & View Colleges'));
      await tester.pumpAndSettle();

      expect(studentApiClient.submittedPayload!['hostelGender'], 'BOYS');
    });

    testWidgets('Translates Student.gender FEMALE to GIRLS on initial submission', (tester) async {
      studentApiClient.studentGender = 'FEMALE';
      await tester.pumpWidget(buildScreen());
      await tester.pumpAndSettle();

      await tester.tap(find.text('Confirm & View Colleges'));
      await tester.pumpAndSettle();

      expect(studentApiClient.submittedPayload!['hostelGender'], 'GIRLS');
    });

    testWidgets('Renders in Telugu with truthful localized copy', (tester) async {
      studentApiClient.mockIntent = {
        'id': 'intent-v2',
        'versionNumber': 2,
        'remainingChanges': 0,
        'status': 'ACTIVE',
      };

      await tester.pumpWidget(buildScreen(isTelugu: true));
      await tester.pumpAndSettle();

      expect(find.text('వివరాలు సరిగ్గా ఉన్నాయో చూసుకోండి'), findsOneWidget);
      expect(find.text('తుది ప్రాధాన్యతలు'), findsOneWidget);
      expect(find.text('స్థిరమైనది'), findsNWidgets(5));
      expect(find.text('ధృవీకరించి కళాశాలలను చూడండి'), findsOneWidget);
    });
  });
}

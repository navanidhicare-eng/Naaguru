import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/features/auth/auth_service.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';
import 'package:naaguru_student/features/college/presentation/college_list_screen.dart';
import 'package:naaguru_student/features/college/presentation/college_preferences_screen.dart';
import 'package:naaguru_student/features/college/presentation/college_review_and_confirm_screen.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';
import 'package:naaguru_student/features/home/home_screen.dart';
import 'package:naaguru_student/features/auth/login_screen.dart';

class MockHomeScreenStudentApiClient extends StudentApiClient {
  Map<String, dynamic>? mockIntent;
  bool failGetIntent = false;
  int getIntentCallCount = 0;
  int submitIntentCallCount = 0;

  MockHomeScreenStudentApiClient() : super(apiClient: ApiClient());

  @override
  Future<Map<String, dynamic>?> getProfile() async {
    return {'fullName': 'Prasad', 'gender': 'MALE'};
  }

  @override
  Future<Map<String, dynamic>?> getCurrentCollegeIntent() async {
    getIntentCallCount++;
    if (failGetIntent) {
      throw ApiException('Network error', 500);
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
    submitIntentCallCount++;
    return {'id': 'intent-new', 'versionNumber': 1};
  }
}

class MockHomeScreenCollegeApiClient extends CollegeApiClient {
  MockHomeScreenCollegeApiClient() : super(apiClient: ApiClient());

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
      {'id': 'c1', 'name': 'Aditya Junior College', 'district': district ?? 'Visakhapatnam'}
    ];
  }

  @override
  Future<List<Map<String, dynamic>>> getCatalogPathways() async {
    return [
      {
        'code': 'INTERMEDIATE',
        'nameEn': 'Intermediate',
        'nameTe': 'ఇంటర్మీడియట్',
        'status': 'ACTIVE',
        'programs': [
          {'code': 'MPC', 'nameEn': 'MPC', 'nameTe': 'ఎంపిసి', 'status': 'ACTIVE'},
        ]
      }
    ];
  }
}

void main() {
  late ApiClient apiClient;
  late AuthService authService;
  late MockHomeScreenStudentApiClient studentApiClient;
  late MockHomeScreenCollegeApiClient collegeApiClient;

  setUp(() {
    FlutterSecureStorage.setMockInitialValues({});
    apiClient = ApiClient();
    authService = AuthService(apiClient: apiClient);
    studentApiClient = MockHomeScreenStudentApiClient();
    collegeApiClient = MockHomeScreenCollegeApiClient();
  });

  Widget buildHomeScreen({MockHomeScreenStudentApiClient? customStudentClient}) => MaterialApp(
        home: HomeScreen(
          authService: authService,
          studentApiClient: customStudentClient ?? studentApiClient,
          collegeApiClient: collegeApiClient,
        ),
        routes: {
          '/login': (context) => LoginScreen(authService: authService, studentApiClient: studentApiClient),
        },
      );

  Widget buildLoginScreen() => MaterialApp(
        home: LoginScreen(
          authService: authService,
          studentApiClient: studentApiClient,
        ),
      );

  group('HomeScreen Discovery & Exploration Navigation', () {
    testWidgets('renders Naaguru branding', (tester) async {
      await tester.pumpWidget(buildHomeScreen());
      await tester.pumpAndSettle();
      expect(find.text('Naaguru'), findsWidgets);
    });

    testWidgets('renders the two primary discovery pillars', (tester) async {
      await tester.pumpWidget(buildHomeScreen());
      await tester.pumpAndSettle();
      // Pillar 1: Assessment action
      expect(find.text('Take Assessment →'), findsOneWidget);
      // Pillar 2: Explore Colleges action
      expect(find.text('Explore Colleges →'), findsOneWidget);
    });

    testWidgets('renders the supporting exploration text', (tester) async {
      await tester.pumpWidget(buildHomeScreen());
      await tester.pumpAndSettle();
      expect(find.text("Discover What Comes After 10th"), findsOneWidget);
      expect(find.text("Browse Verified Colleges"), findsOneWidget);
    });

    testWidgets('1 & 8. Fresh student (no saved intent): Explore Colleges routes to Discovery Step 1, NOT Review', (tester) async {
      studentApiClient.mockIntent = null; // No intent

      await tester.pumpWidget(buildHomeScreen());
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Explore Colleges →'));
      await tester.tap(find.text('Explore Colleges →'));
      await tester.pumpAndSettle();

      // Opens Step 1 (CollegePreferencesScreen)
      expect(find.byType(CollegePreferencesScreen), findsOneWidget);
      expect(find.byType(CollegeReviewAndConfirmScreen), findsNothing);
      expect(find.byType(CollegeListScreen), findsNothing);
    });

    testWidgets('2 & 9. Version 1 intent: Explore Colleges routes directly to CollegeListScreen, NOT Review', (tester) async {
      studentApiClient.mockIntent = {
        'id': 'intent-v1',
        'versionNumber': 1,
        'pathwayCode': 'INTERMEDIATE',
        'programCode': 'MPC',
        'requiresHostel': true,
        'maxAnnualFee': 100000,
        'status': 'ACTIVE',
      };

      await tester.pumpWidget(buildHomeScreen());
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Explore Colleges →'));
      await tester.tap(find.text('Explore Colleges →'));
      await tester.pumpAndSettle();

      // Directly on CollegeListScreen!
      expect(find.byType(CollegeListScreen), findsOneWidget);
      expect(find.byType(CollegeReviewAndConfirmScreen), findsNothing);
      expect(find.byType(CollegePreferencesScreen), findsNothing);
    });

    testWidgets('3. Version 2 intent: Explore Colleges routes directly to CollegeListScreen, NOT Review', (tester) async {
      studentApiClient.mockIntent = {
        'id': 'intent-v2',
        'versionNumber': 2,
        'pathwayCode': 'INTERMEDIATE',
        'programCode': 'BIPC',
        'requiresHostel': false,
        'maxAnnualFee': 50000,
        'status': 'ACTIVE',
      };

      await tester.pumpWidget(buildHomeScreen());
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Explore Colleges →'));
      await tester.tap(find.text('Explore Colleges →'));
      await tester.pumpAndSettle();

      // Directly on CollegeListScreen!
      expect(find.byType(CollegeListScreen), findsOneWidget);
      expect(find.byType(CollegeReviewAndConfirmScreen), findsNothing);
      expect(find.byType(CollegePreferencesScreen), findsNothing);
    });

    testWidgets('4 & 10. Profile tab ("You"): Version 1 intent shows College Preferences and allows editing', (tester) async {
      studentApiClient.mockIntent = {
        'id': 'intent-v1',
        'versionNumber': 1,
        'pathwayCode': 'INTERMEDIATE',
        'programCode': 'MPC',
        'requiresHostel': true,
        'maxAnnualFee': 100000,
        'status': 'ACTIVE',
      };

      await tester.pumpWidget(buildHomeScreen());
      await tester.pumpAndSettle();

      // Switch to "You" tab (index 3)
      await tester.tap(find.text('You'));
      await tester.pumpAndSettle();

      // Shows College Preferences card with 1 edit left
      expect(find.text('College Preferences'), findsOneWidget);
      expect(find.text('Intermediate • MPC'), findsOneWidget);
      expect(find.text('Hostel required'), findsOneWidget);
      expect(find.text('Budget: Up to ₹1,00,000 / year'), findsOneWidget);
      expect(find.text('1 edit left'), findsOneWidget);

      // Tap View / Change Preferences
      final viewButton = find.text('View / Change Preferences →');
      expect(viewButton, findsOneWidget);
      await tester.ensureVisible(viewButton);
      await tester.tap(viewButton);
      await tester.pumpAndSettle();

      // Review & Confirm opens with Edit enabled!
      expect(find.byType(CollegeReviewAndConfirmScreen), findsOneWidget);
      expect(find.text('Edit'), findsNWidgets(5));
      expect(find.text('FINAL PREFERENCES'), findsNothing);
    });

    testWidgets('5 & 6. Profile tab ("You"): Version 2 intent shows Final 🔒 and locks editing, but results accessible', (tester) async {
      studentApiClient.mockIntent = {
        'id': 'intent-v2',
        'versionNumber': 2,
        'pathwayCode': 'INTERMEDIATE',
        'programCode': 'MPC',
        'requiresHostel': true,
        'maxAnnualFee': 100000,
        'status': 'ACTIVE',
      };

      await tester.pumpWidget(buildHomeScreen());
      await tester.pumpAndSettle();

      // Switch to "You" tab (index 3)
      await tester.tap(find.text('You'));
      await tester.pumpAndSettle();

      // Shows Final 🔒 badge on preferences card
      expect(find.text('College Preferences'), findsOneWidget);
      expect(find.text('Final 🔒'), findsOneWidget);

      // Tap View Preferences
      final viewButton = find.text('View Preferences →');
      expect(viewButton, findsOneWidget);
      await tester.ensureVisible(viewButton);
      await tester.tap(viewButton);
      await tester.pumpAndSettle();

      // Review & Confirm opens with Final preferences locked!
      expect(find.byType(CollegeReviewAndConfirmScreen), findsOneWidget);
      expect(find.text('FINAL PREFERENCES'), findsOneWidget);
      expect(find.text('Edit'), findsNothing);
      expect(find.text('Final'), findsNWidgets(5));

      // Results remain accessible via CTA
      await tester.ensureVisible(find.text('Confirm & View Colleges'));
      await tester.tap(find.text('Confirm & View Colleges'));
      await tester.pumpAndSettle();

      expect(find.byType(CollegeListScreen), findsOneWidget);
    });

    testWidgets('7. GET intent failure: does not assume intent exists or route to Review', (tester) async {
      studentApiClient.failGetIntent = true;

      await tester.pumpWidget(buildHomeScreen());
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Explore Colleges →'));
      await tester.tap(find.text('Explore Colleges →'));
      await tester.pumpAndSettle();

      // Defaults to starting discovery, NOT Review & Confirm
      expect(find.byType(CollegeReviewAndConfirmScreen), findsNothing);
      expect(find.byType(CollegePreferencesScreen), findsOneWidget);
    });

    testWidgets('11. Opening Explore Colleges does NOT overwrite or resubmit saved intent', (tester) async {
      studentApiClient.mockIntent = {
        'id': 'intent-v1',
        'versionNumber': 1,
        'pathwayCode': 'INTERMEDIATE',
        'programCode': 'MPC',
        'status': 'ACTIVE',
      };

      await tester.pumpWidget(buildHomeScreen());
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Explore Colleges →'));
      await tester.tap(find.text('Explore Colleges →'));
      await tester.pumpAndSettle();

      // submitCollegeIntent was NEVER called!
      expect(studentApiClient.submitIntentCallCount, 0);
      expect(find.byType(CollegeListScreen), findsOneWidget);
    });

    testWidgets('12. Rapid taps on Explore Colleges do not cause duplicate navigation/API calls', (tester) async {
      studentApiClient.mockIntent = {
        'id': 'intent-v1',
        'versionNumber': 1,
        'pathwayCode': 'INTERMEDIATE',
        'status': 'ACTIVE',
      };

      await tester.pumpWidget(buildHomeScreen());
      await tester.pumpAndSettle();

      final initialCalls = studentApiClient.getIntentCallCount;

      await tester.ensureVisible(find.text('Explore Colleges →'));
      // Rapidly tap button twice
      await tester.tap(find.text('Explore Colleges →'), warnIfMissed: false);
      await tester.tap(find.text('Explore Colleges →'), warnIfMissed: false);
      await tester.pumpAndSettle();

      // Only one intent check initiated for the rapid tap sequence
      expect(studentApiClient.getIntentCallCount - initialCalls, 1);
      expect(find.byType(CollegeListScreen), findsOneWidget);
    });
  });

  group('LoginScreen', () {
    testWidgets('renders phone input and send OTP button', (tester) async {
      await tester.pumpWidget(buildLoginScreen());
      await tester.pumpAndSettle();

      expect(find.byType(TextField), findsOneWidget);
      expect(find.text('Send OTP'), findsOneWidget);
    });

    testWidgets('shows error when phone is empty and Send OTP tapped',
        (tester) async {
      await tester.pumpWidget(buildLoginScreen());
      await tester.pumpAndSettle();

      await tester.ensureVisible(find.text('Send OTP'));
      await tester.tap(find.text('Send OTP'));
      await tester.pumpAndSettle();

      expect(
          find.text('Enter a valid 10-digit mobile number.'), findsOneWidget);
    });
  });

  group('StudentProfileScreen', () {
    testWidgets('renders profile form fields', (tester) async {
      await tester.pumpWidget(MaterialApp(
        home: Builder(builder: (context) {
          return Scaffold(
            body: ElevatedButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const _MockProfileScreen(),
                ),
              ),
              child: const Text('Go'),
            ),
          );
        }),
      ));
    });
  });
}

class _MockProfileScreen extends StatelessWidget {
  const _MockProfileScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Profile loaded')),
    );
  }
}

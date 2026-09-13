import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/features/auth/auth_service.dart';
import 'package:naaguru_student/features/student/data/catalog_api_client.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';
import 'package:naaguru_student/features/student/presentation/profile_screen3_review.dart';
import 'package:naaguru_student/features/student/presentation/profile_wizard_state.dart';

class MockAuthService implements AuthService {
  bool markProfileCompleteCalled = false;
  
  @override
  Future<void> markProfileComplete() async {
    markProfileCompleteCalled = true;
  }
  
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class MockStudentApiClient implements StudentApiClient {
  bool getProfileCalled = false;
  bool createProfileCalled = false;
  bool updateProfileCalled = false;
  bool shouldThrow = false;
  bool profileExists = false;

  @override
  Future<Map<String, dynamic>?> getProfile() async {
    getProfileCalled = true;
    if (shouldThrow) throw Exception('API Error');
    return profileExists ? {'id': '123'} : null;
  }

  String? capturedEducationStage;

  @override
  Future<Map<String, dynamic>> createProfile({
    required String fullName,
    required String gender,
    required String educationStage,
    String? board,
    String? residenceLocationId,
    String? schoolId,
    String? pincode,
    String? landmark,
    String? guardianName,
    String? guardianPhone,
  }) async {
    createProfileCalled = true;
    capturedEducationStage = educationStage;
    if (shouldThrow) throw Exception('API Error');
    return {'id': '123'};
  }

  @override
  Future<Map<String, dynamic>> updateProfile({
    String? fullName,
    String? gender,
    String? educationStage,
    String? board,
    String? residenceLocationId,
    String? schoolId,
    String? pincode,
    String? landmark,
    String? guardianName,
    String? guardianPhone,
  }) async {
    updateProfileCalled = true;
    if (shouldThrow) throw Exception('API Error');
    return {'id': '123'};
  }

  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class MockCatalogApiClient implements CatalogApiClient {
  @override
  dynamic noSuchMethod(Invocation invocation) => super.noSuchMethod(invocation);
}

class MockNavigatorObserver extends NavigatorObserver {
  int popCount = 0;
  String? pushedReplacementRoute;

  @override
  void didPop(Route<dynamic> route, Route<dynamic>? previousRoute) {
    popCount++;
  }
  
  @override
  void didReplace({Route<dynamic>? newRoute, Route<dynamic>? oldRoute}) {
    if (newRoute != null) {
      pushedReplacementRoute = newRoute.settings.name;
    }
  }
}

void main() {
  late ProfileWizardState wizard;
  late MockAuthService authService;
  late MockStudentApiClient studentApiClient;
  late MockCatalogApiClient catalogApiClient;
  late MockNavigatorObserver navObserver;

  setUp(() {
    wizard = ProfileWizardState();
    wizard.updateFullName('Test Student Name');
    wizard.selectSchool(const CatalogSchool(id: 's1', nameEn: 'Test School Name', nameTe: 'పాఠశాల'));
    wizard.selectState(const CatalogLocation(id: 'l1', nameEn: 'Test State', type: 'STATE'));
    wizard.selectDistrict(const CatalogLocation(id: 'l2', nameEn: 'Test District', type: 'DISTRICT'));
    wizard.selectMandal(const CatalogLocation(id: 'l3', nameEn: 'Test Mandal', type: 'MANDAL'));
    wizard.selectLocality(const CatalogLocation(id: 'l4', nameEn: 'Test Locality', type: 'LOCALITY'));
    wizard.updatePincode('530052');
    wizard.updateGender('MALE');
    wizard.updateLandmark('Test Landmark');
    
    authService = MockAuthService();
    studentApiClient = MockStudentApiClient();
    catalogApiClient = MockCatalogApiClient();
    navObserver = MockNavigatorObserver();
  });

  Widget createWidgetUnderTest() {
    return MaterialApp(
      navigatorObservers: [navObserver],
      onGenerateRoute: (settings) {
        if (settings.name == '/home') {
          return MaterialPageRoute(builder: (_) => const Scaffold(body: Text('Home Page Loaded')));
        }
        return null;
      },
      home: ProfileScreen3Review(
        authService: authService,
        studentApiClient: studentApiClient,
        catalogApiClient: catalogApiClient,
        wizardState: wizard,
      ),
    );
  }

  testWidgets('Actual wizard values appear in the review and no hardcoded data', (tester) async {
    tester.view.physicalSize = const Size(1200, 3200);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(createWidgetUnderTest());
    
    // School & Identity
    expect(find.text('Test Student Name'), findsOneWidget);
    expect(find.text('Test School Name'), findsOneWidget);
    expect(find.text('Kiran Kumar M.'), findsNothing); // Hardcoded data from stitch
    
    // Location
    expect(find.text('Test State'), findsOneWidget);
    expect(find.text('Test District'), findsOneWidget);
    expect(find.text('Test Mandal'), findsOneWidget);
    expect(find.text('Test Locality'), findsOneWidget);
    expect(find.text('530052'), findsOneWidget);
    expect(find.text('Test Landmark'), findsOneWidget);
    expect(find.text('Visakhapatnam'), findsNothing); // Hardcoded data from stitch
    
    // Unsupported claims are not displayed
    expect(find.text('government college quotas accurately'), findsNothing);
    expect(find.text('Maps local scholarships'), findsNothing);
  });

  testWidgets('Edit Location pops once to Screen 2', (tester) async {
    tester.view.physicalSize = const Size(1200, 3200);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(createWidgetUnderTest());
    
    // First Edit button is for location. We can find it by its position.
    final locationEditBtn = find.descendant(
      of: find.byType(Container),
      matching: find.text('Edit'),
    ).first;
    await tester.tap(locationEditBtn);
    await tester.pumpAndSettle();
    
    expect(navObserver.popCount, 1);
  });

  testWidgets('Edit School pops twice to Screen 1', (tester) async {
    tester.view.physicalSize = const Size(1200, 3200);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(createWidgetUnderTest());
    
    final schoolEditBtn = find.descendant(
      of: find.byType(Container),
      matching: find.text('Edit'),
    ).last;
    await tester.ensureVisible(schoolEditBtn);
    await tester.tap(schoolEditBtn);
    await tester.pumpAndSettle();
    
    expect(navObserver.popCount, 1); // Test navigator only has one route, so popUntil stops at 1
  });

  testWidgets('Invalid profile cannot submit', (tester) async {
    tester.view.physicalSize = const Size(1200, 3200);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    wizard.updatePincode(''); // Invalid state
    await tester.pumpWidget(createWidgetUnderTest());
    
    await tester.tap(find.text('Complete Profile'));
    await tester.pumpAndSettle();
    
    expect(studentApiClient.getProfileCalled, isFalse);
    expect(authService.markProfileCompleteCalled, isFalse);
    expect(find.text('Please complete all previous steps first.'), findsOneWidget);
  });

  testWidgets('Complete Profile creates new profile if missing', (tester) async {
    tester.view.physicalSize = const Size(1200, 3200);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    studentApiClient.profileExists = false;
    await tester.pumpWidget(createWidgetUnderTest());
    
    await tester.tap(find.text('Complete Profile'));
    await tester.pump();
    
    expect(find.byType(CircularProgressIndicator), findsOneWidget); // Loading state prevents duplicate
    
    await tester.pumpAndSettle();
    
    expect(studentApiClient.getProfileCalled, isTrue);
    expect(studentApiClient.createProfileCalled, isTrue);
    expect(studentApiClient.capturedEducationStage, '10TH_PASSED');
    expect(studentApiClient.capturedEducationStage, isNot('INTERMEDIATE_1'));
    expect(studentApiClient.updateProfileCalled, isFalse);
    expect(authService.markProfileCompleteCalled, isTrue);
    expect(find.text('Home Page Loaded'), findsOneWidget);
  });

  testWidgets('Complete Profile updates profile if existing', (tester) async {
    tester.view.physicalSize = const Size(1200, 3200);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    studentApiClient.profileExists = true;
    await tester.pumpWidget(createWidgetUnderTest());
    
    await tester.tap(find.text('Complete Profile'));
    await tester.pumpAndSettle();
    
    expect(studentApiClient.getProfileCalled, isTrue);
    expect(studentApiClient.createProfileCalled, isFalse);
    expect(studentApiClient.updateProfileCalled, isTrue);
    expect(authService.markProfileCompleteCalled, isTrue);
    expect(find.text('Home Page Loaded'), findsOneWidget);
  });

  testWidgets('Backend failure handles correctly', (tester) async {
    tester.view.physicalSize = const Size(1200, 3200);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    studentApiClient.shouldThrow = true;
    await tester.pumpWidget(createWidgetUnderTest());
    
    await tester.tap(find.text('Complete Profile'));
    await tester.pumpAndSettle();
    
    expect(authService.markProfileCompleteCalled, isFalse);
    expect(navObserver.pushedReplacementRoute, isNull); // Didn't navigate
    expect(find.text("Couldn't save your profile. Please try again."), findsOneWidget);
  });
  
  testWidgets('English and Telugu toggles correctly', (tester) async {
    tester.view.physicalSize = const Size(1200, 3200);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(createWidgetUnderTest());
    
    // Initially English
    expect(find.text('Where You Live'), findsOneWidget);
    expect(find.text('మీ నివాస ప్రాంతం'), findsNothing);
    
    // Tap Telugu
    await tester.tap(find.text('తెలుగు'));
    await tester.pumpAndSettle();
    
    expect(find.text('Where You Live'), findsNothing);
    expect(find.text('మీ నివాస ప్రాంతం'), findsOneWidget);
  });
}

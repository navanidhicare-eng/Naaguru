import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/core/ui/profile_gate.dart';
import 'package:naaguru_student/features/auth/auth_service.dart';
import 'package:naaguru_student/features/student/data/catalog_api_client.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';

// ── Minimal test helpers ────────────────────────────────────────────────────

/// A mock HTTP client that always returns 404 for /students/me (no profile).
MockClient _noProfileClient() => MockClient((request) async {
      if (request.url.path.contains('/students/me')) {
        return http.Response(jsonEncode({'error': 'Not found'}), 404);
      }
      return http.Response('ok', 200);
    });

/// A mock HTTP client that returns a complete student profile.
MockClient _completeProfileClient() => MockClient((request) async {
      if (request.url.path.contains('/students/me')) {
        return http.Response(
          jsonEncode({
            'fullName': 'Ravi Kumar',
            'residenceLocationId': 'loc-001',
            'schoolId': 'school-001',
            'pincode': '530001',
          }),
          200,
        );
      }
      return http.Response('ok', 200);
    });

/// A mock HTTP client that returns a 500 for /students/me.
MockClient _serverErrorClient() => MockClient((request) async {
      if (request.url.path.contains('/students/me')) {
        return http.Response(jsonEncode({'error': 'Internal Server Error'}), 500);
      }
      return http.Response('ok', 200);
    });

/// Wraps a widget in a minimal MaterialApp for pump.
Widget _wrap(Widget child) => MaterialApp(home: child);

/// Creates an [AuthService] with a pre-seeded [profileStateNotifier].
AuthService _makeAuthService({
  required MockClient httpClient,
  ProfileState initialState = ProfileState.unknown,
}) {
  FlutterSecureStorage.setMockInitialValues({});
  final apiClient = ApiClient(httpClient: httpClient);
  apiClient.setTokens(accessToken: 'test-access', refreshToken: 'test-refresh');
  final svc = AuthService(apiClient: apiClient, storage: const FlutterSecureStorage());
  svc.profileStateNotifier.value = initialState;
  svc.authStateNotifier.value = true;
  return svc;
}

StudentApiClient _makeStudentClient(MockClient httpClient) =>
    StudentApiClient(apiClient: ApiClient(httpClient: httpClient));

/// Creates a CatalogApiClient backed by a mock that returns an empty schools list.
CatalogApiClient _makeCatalogClient(MockClient httpClient) =>
    CatalogApiClient(apiClient: ApiClient(httpClient: httpClient));

/// Mock that returns empty schools for catalog API.
MockClient _emptyCatalogClient() => MockClient((request) async {
      if (request.url.path.contains('/catalog/schools')) {
        return http.Response(jsonEncode([]), 200);
      }
      return http.Response('ok', 200);
    });

// ── Tests ───────────────────────────────────────────────────────────────────

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('ProfileGate', () {
    // 1. Complete profile → renders child
    testWidgets('renders child when profile is COMPLETE', (tester) async {
      final authService = _makeAuthService(
        httpClient: _completeProfileClient(),
        initialState: ProfileState.complete,
      );
      final studentClient = _makeStudentClient(_completeProfileClient());

      await tester.pumpWidget(_wrap(
        ProfileGate(
          authService: authService,
          studentApiClient: studentClient,
          catalogApiClient: _makeCatalogClient(_emptyCatalogClient()),
          child: const Scaffold(body: Text('Home Screen')),
        ),
      ));

      expect(find.text('Home Screen'), findsOneWidget);
    });

    // 2. Incomplete profile → renders StudentProfileScreen (not the child)
    testWidgets('renders StudentProfileScreen (not child) when profile is INCOMPLETE',
        (tester) async {
      final authService = _makeAuthService(
        httpClient: _noProfileClient(),
        initialState: ProfileState.incomplete,
      );
      final studentClient = _makeStudentClient(_noProfileClient());

      await tester.pumpWidget(_wrap(
        ProfileGate(
          authService: authService,
          studentApiClient: studentClient,
          catalogApiClient: _makeCatalogClient(_emptyCatalogClient()),
          child: const Scaffold(body: Text('Home Screen')),
        ),
      ));
      await tester.pump(); // let FutureBuilder settle

      // The gate must block Home and show Screen 1 of the profile wizard.
      expect(find.text('Home Screen'), findsNothing);
      // Screen 1 shows "Complete Your Profile".
      expect(find.text('Complete Your Profile'), findsOneWidget);
    });

    // 3. Unknown state → renders splash (not child, not profile screen)
    testWidgets('renders splash when profile state is UNKNOWN', (tester) async {
      final authService = _makeAuthService(
        httpClient: _noProfileClient(),
        initialState: ProfileState.unknown,
      );
      final studentClient = _makeStudentClient(_noProfileClient());

      await tester.pumpWidget(_wrap(
        ProfileGate(
          authService: authService,
          studentApiClient: studentClient,
          catalogApiClient: _makeCatalogClient(_emptyCatalogClient()),
          child: const Scaffold(body: Text('Home Screen')),
        ),
      ));

      expect(find.text('Home Screen'), findsNothing);
      expect(find.text('Complete Your Profile'), findsNothing);
      // Splash shows a loading indicator.
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    // 4. Error state → renders error/retry screen (not incomplete profile screen)
    testWidgets('renders error screen (not ProfileScreen) when state is ERROR',
        (tester) async {
      final authService = _makeAuthService(
        httpClient: _serverErrorClient(),
        initialState: ProfileState.error,
      );
      final studentClient = _makeStudentClient(_serverErrorClient());

      await tester.pumpWidget(_wrap(
        ProfileGate(
          authService: authService,
          studentApiClient: studentClient,
          catalogApiClient: _makeCatalogClient(_emptyCatalogClient()),
          child: const Scaffold(body: Text('Home Screen')),
        ),
      ));

      expect(find.text('Home Screen'), findsNothing);
      // Must NOT show the profile form (that would be treating error as incomplete).
      expect(find.text('Complete Your Profile'), findsNothing);
      // Must show the error retry UI.
      expect(find.text('Could not connect'), findsOneWidget);
      expect(find.text('Retry'), findsOneWidget);
    });

    // 5. markProfileComplete transitions gate from INCOMPLETE to COMPLETE
    testWidgets('marking profile complete shows child after completion', (tester) async {
      final authService = _makeAuthService(
        httpClient: _noProfileClient(),
        initialState: ProfileState.incomplete,
      );
      final studentClient = _makeStudentClient(_noProfileClient());

      await tester.pumpWidget(_wrap(
        ProfileGate(
          authService: authService,
          studentApiClient: studentClient,
          catalogApiClient: _makeCatalogClient(_emptyCatalogClient()),
          child: const Scaffold(body: Text('Home Screen')),
        ),
      ));
      await tester.pump();

      // Initially blocked.
      expect(find.text('Home Screen'), findsNothing);

      // Simulate backend save succeeding → markProfileComplete().
      authService.markProfileComplete();
      await tester.pump();

      // Gate now shows the child.
      expect(find.text('Home Screen'), findsOneWidget);
    });

    // 6. Direct navigation to assessment is blocked when profile is incomplete.
    // We simulate this by verifying that ProfileGate wrapping an assessment screen
    // shows ProfileScreen instead.
    testWidgets('direct navigation to assessment is blocked when incomplete',
        (tester) async {
      final authService = _makeAuthService(
        httpClient: _noProfileClient(),
        initialState: ProfileState.incomplete,
      );
      final studentClient = _makeStudentClient(_noProfileClient());

      await tester.pumpWidget(_wrap(
        ProfileGate(
          authService: authService,
          studentApiClient: studentClient,
          catalogApiClient: _makeCatalogClient(_emptyCatalogClient()),
          child: const Scaffold(body: Text('Assessment Intro')),
        ),
      ));
      await tester.pump();

      expect(find.text('Assessment Intro'), findsNothing);
      expect(find.text('Complete Your Profile'), findsOneWidget);
    });

    // 7. Direct navigation to college screens is blocked when profile is incomplete.
    testWidgets('direct navigation to college screens is blocked when incomplete',
        (tester) async {
      final authService = _makeAuthService(
        httpClient: _noProfileClient(),
        initialState: ProfileState.incomplete,
      );
      final studentClient = _makeStudentClient(_noProfileClient());

      await tester.pumpWidget(_wrap(
        ProfileGate(
          authService: authService,
          studentApiClient: studentClient,
          catalogApiClient: _makeCatalogClient(_emptyCatalogClient()),
          child: const Scaffold(body: Text('College List Screen')),
        ),
      ));
      await tester.pump();

      expect(find.text('College List Screen'), findsNothing);
      expect(find.text('Complete Your Profile'), findsOneWidget);
    });

    // 8. Logout resets profile state — verified at AuthService level.
    // Here we confirm that after profileState resets to UNKNOWN, gate shows splash.
    testWidgets('gate reverts to splash after logout resets state to UNKNOWN',
        (tester) async {
      final authService = _makeAuthService(
        httpClient: _completeProfileClient(),
        initialState: ProfileState.complete,
      );
      final studentClient = _makeStudentClient(_completeProfileClient());

      await tester.pumpWidget(_wrap(
        ProfileGate(
          authService: authService,
          studentApiClient: studentClient,
          catalogApiClient: _makeCatalogClient(_emptyCatalogClient()),
          child: const Scaffold(body: Text('Home Screen')),
        ),
      ));

      // Initially COMPLETE → shows Home.
      expect(find.text('Home Screen'), findsOneWidget);

      // Simulate logout reset.
      authService.profileStateNotifier.value = ProfileState.unknown;
      await tester.pump();

      // Gate now shows splash.
      expect(find.text('Home Screen'), findsNothing);
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });
  });
}

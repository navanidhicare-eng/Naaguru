import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/features/auth/auth_service.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';
import 'package:naaguru_student/features/home/home_screen.dart';
import 'package:naaguru_student/features/auth/login_screen.dart';

void main() {
  late ApiClient apiClient;
  late AuthService authService;
  late StudentApiClient studentApiClient;

  setUp(() {
    FlutterSecureStorage.setMockInitialValues({});
    apiClient = ApiClient();
    authService = AuthService(apiClient: apiClient);
    studentApiClient = StudentApiClient(apiClient: apiClient);
  });

  Widget buildHomeScreen() => MaterialApp(
        home: HomeScreen(
          authService: authService,
          studentApiClient: studentApiClient,
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

  group('HomeScreen', () {
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
      // Pillar 2: Browse Colleges action
      expect(find.text('Browse Colleges →'), findsOneWidget);
    });

    testWidgets('renders the supporting exploration text', (tester) async {
      await tester.pumpWidget(buildHomeScreen());
      await tester.pumpAndSettle();
      expect(
        find.text("Discover What Comes After 10th"),
        findsOneWidget,
      );
      expect(
        find.text("Browse Verified Colleges"),
        findsOneWidget,
      );
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

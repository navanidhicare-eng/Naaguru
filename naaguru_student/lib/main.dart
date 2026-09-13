import 'package:flutter/material.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/core/ui/profile_gate.dart';
import 'package:naaguru_student/features/assessment/data/assessment_api_client.dart';
import 'package:naaguru_student/features/assessment/presentation/assessment_intro_screen.dart';
import 'package:naaguru_student/features/assessment/presentation/assessment_question_screen.dart';
import 'package:naaguru_student/features/assessment/presentation/results_screen.dart';
import 'package:naaguru_student/features/auth/auth_service.dart';
import 'package:naaguru_student/features/auth/login_screen.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';
import 'package:naaguru_student/features/home/home_screen.dart';
import 'package:naaguru_student/features/student/data/catalog_api_client.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';
import 'package:naaguru_student/features/student/presentation/student_profile_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Create the shared API client and services once at startup.
  final apiClient = ApiClient();
  final authService = AuthService(apiClient: apiClient);
  final studentApiClient = StudentApiClient(apiClient: apiClient);
  final catalogApiClient = CatalogApiClient(apiClient: apiClient);
  final assessmentApiClient = AssessmentApiClient(apiClient: apiClient);
  final collegeApiClient = CollegeApiClient(apiClient: apiClient);

  runApp(NaaguruStudentApp(
    authService: authService,
    studentApiClient: studentApiClient,
    catalogApiClient: catalogApiClient,
    assessmentApiClient: assessmentApiClient,
    collegeApiClient: collegeApiClient,
  ));
}

/// Root widget for the Naaguru Student application.
class NaaguruStudentApp extends StatelessWidget {
  final AuthService authService;
  final StudentApiClient studentApiClient;
  final CatalogApiClient catalogApiClient;
  final AssessmentApiClient? assessmentApiClient;
  final CollegeApiClient? collegeApiClient;

  const NaaguruStudentApp({
    super.key,
    required this.authService,
    required this.studentApiClient,
    required this.catalogApiClient,
    this.assessmentApiClient,
    this.collegeApiClient,
  });

  @override
  Widget build(BuildContext context) {
    // Helper: wraps an authenticated screen with the mandatory ProfileGate.
    // Any route wrapped here cannot be bypassed by an incomplete-profile student.
    Widget gated(Widget child) => ProfileGate(
          authService: authService,
          studentApiClient: studentApiClient,
          catalogApiClient: catalogApiClient,
          child: child,
        );

    return MaterialApp(
      title: 'Naaguru',
      debugShowCheckedModeBanner: false,
      theme: NaaguruTheme.lightTheme,
      initialRoute: '/',
      routes: {
        // ── Public / Authentication routes (NOT gated) ─────────────────────
        '/': (_) => AuthGate(
              authService: authService,
              studentApiClient: studentApiClient,
              catalogApiClient: catalogApiClient,
              assessmentApiClient: assessmentApiClient,
              collegeApiClient: collegeApiClient,
            ),
        '/login': (_) => LoginScreen(
              authService: authService,
              studentApiClient: studentApiClient,
            ),
        // Profile screen itself must remain reachable when profile is incomplete.
        // ProfileGate renders it directly — this named route is kept for any
        // edge-case deep-link that specifically targets /profile.
        '/profile': (_) => StudentProfileScreen(
              studentApiClient: studentApiClient,
              authService: authService,
            ),

        // ── Authenticated routes (ALL wrapped with ProfileGate) ─────────────
        // An incomplete-profile student navigating to any of these routes will
        // be shown the new profile wizard Screen 1 regardless.
        '/home': (_) => gated(HomeScreen(
              authService: authService,
              studentApiClient: studentApiClient,
              assessmentApiClient: assessmentApiClient,
              collegeApiClient: collegeApiClient,
            )),
        '/assessment-intro': (_) => gated(const AssessmentIntroScreen()),
        '/assessment-question': (_) => gated(
              AssessmentQuestionScreen(
                  assessmentApiClient: assessmentApiClient),
            ),
        '/results': (_) =>
            gated(ResultsScreen(assessmentApiClient: assessmentApiClient)),
      },
    );
  }
}

/// A lightweight startup widget that restores the user's session
/// before displaying the app.
///
/// When authenticated, it renders [ProfileGate] wrapping [HomeScreen].
/// The gate resolves the profile state (fetched once during session restore
/// or OTP verification) and routes to Home or ProfileScreen accordingly.
class AuthGate extends StatefulWidget {
  final AuthService authService;
  final StudentApiClient studentApiClient;
  final CatalogApiClient catalogApiClient;
  final AssessmentApiClient? assessmentApiClient;
  final CollegeApiClient? collegeApiClient;

  const AuthGate({
    super.key,
    required this.authService,
    required this.studentApiClient,
    required this.catalogApiClient,
    this.assessmentApiClient,
    this.collegeApiClient,
  });

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  late Future<bool> _restoreFuture;

  @override
  void initState() {
    super.initState();
    // tryRestoreSession() fetches the profile internally before updating
    // authStateNotifier so there is no flash of wrong content.
    _restoreFuture = widget.authService.tryRestoreSession();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<bool>(
      future: _restoreFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            backgroundColor: NaaguruTheme.background,
            body: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircularProgressIndicator(color: NaaguruTheme.primary),
                  SizedBox(height: 16),
                  Text(
                    'Naaguru',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: NaaguruTheme.primaryDark,
                    ),
                  ),
                ],
              ),
            ),
          );
        }

        return ValueListenableBuilder<bool>(
          valueListenable: widget.authService.authStateNotifier,
          builder: (context, isAuthenticated, _) {
            if (isAuthenticated) {
              // ProfileGate resolves UNKNOWN/INCOMPLETE/COMPLETE/ERROR.
              // No _StudentBootstrap needed — profile state is already set.
              return ProfileGate(
                authService: widget.authService,
                studentApiClient: widget.studentApiClient,
                catalogApiClient: widget.catalogApiClient,
                child: HomeScreen(
                  authService: widget.authService,
                  studentApiClient: widget.studentApiClient,
                  assessmentApiClient: widget.assessmentApiClient,
                  collegeApiClient: widget.collegeApiClient,
                ),
              );
            } else {
              return LoginScreen(
                authService: widget.authService,
                studentApiClient: widget.studentApiClient,
              );
            }
          },
        );
      },
    );
  }
}

import 'package:flutter/material.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/features/assessment/data/assessment_api_client.dart';
import 'package:naaguru_student/features/assessment/presentation/assessment_intro_screen.dart';
import 'package:naaguru_student/features/assessment/presentation/assessment_question_screen.dart';
import 'package:naaguru_student/features/assessment/presentation/results_screen.dart';
import 'package:naaguru_student/features/auth/auth_service.dart';
import 'package:naaguru_student/features/auth/login_screen.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';
import 'package:naaguru_student/features/college/presentation/college_preferences_screen.dart';
import 'package:naaguru_student/features/home/home_screen.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';
import 'package:naaguru_student/features/student/presentation/student_profile_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Create the shared API client and services once at startup.
  final apiClient = ApiClient();
  final authService = AuthService(apiClient: apiClient);
  final studentApiClient = StudentApiClient(apiClient: apiClient);
  final assessmentApiClient = AssessmentApiClient(apiClient: apiClient);
  final collegeApiClient = CollegeApiClient(apiClient: apiClient);

  runApp(NaaguruStudentApp(
    authService: authService,
    studentApiClient: studentApiClient,
    assessmentApiClient: assessmentApiClient,
    collegeApiClient: collegeApiClient,
  ));
}

/// Root widget for the Naaguru Student application.
class NaaguruStudentApp extends StatelessWidget {
  final AuthService authService;
  final StudentApiClient studentApiClient;
  final AssessmentApiClient? assessmentApiClient;
  final CollegeApiClient? collegeApiClient;

  const NaaguruStudentApp({
    super.key,
    required this.authService,
    required this.studentApiClient,
    this.assessmentApiClient,
    this.collegeApiClient,
  });

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Naaguru',
      debugShowCheckedModeBanner: false,
      theme: NaaguruTheme.lightTheme,
      initialRoute: '/',
      routes: {
        '/': (_) => AuthGate(
              authService: authService,
              studentApiClient: studentApiClient,
              assessmentApiClient: assessmentApiClient,
              collegeApiClient: collegeApiClient,
            ),
        '/home': (_) => HomeScreen(
              authService: authService,
              studentApiClient: studentApiClient,
              assessmentApiClient: assessmentApiClient,
              collegeApiClient: collegeApiClient,
            ),
        '/login': (_) => LoginScreen(
              authService: authService,
              studentApiClient: studentApiClient,
            ),
        '/profile': (_) =>
            StudentProfileScreen(studentApiClient: studentApiClient),
        '/assessment-intro': (_) => const AssessmentIntroScreen(),
        '/assessment-question': (_) =>
            AssessmentQuestionScreen(assessmentApiClient: assessmentApiClient),
        '/results': (_) =>
            ResultsScreen(assessmentApiClient: assessmentApiClient),
        '/college-preferences': (_) => collegeApiClient != null
            ? CollegePreferencesScreen(collegeApiClient: collegeApiClient!)
            : const Scaffold(body: Center(child: Text('Service unavailable'))),
      },
    );
  }
}

/// A lightweight startup widget that restores the user's session
/// before displaying the app.
class AuthGate extends StatefulWidget {
  final AuthService authService;
  final StudentApiClient studentApiClient;
  final AssessmentApiClient? assessmentApiClient;
  final CollegeApiClient? collegeApiClient;

  const AuthGate({
    super.key,
    required this.authService,
    required this.studentApiClient,
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
              return _StudentBootstrap(
                authService: widget.authService,
                studentApiClient: widget.studentApiClient,
                assessmentApiClient: widget.assessmentApiClient,
                collegeApiClient: widget.collegeApiClient,
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

/// Lightweight bootstrap component that resolves whether an authenticated student
/// already has an existing profile, routing cleanly to Home or Profile onboarding.
class _StudentBootstrap extends StatefulWidget {
  final AuthService authService;
  final StudentApiClient studentApiClient;
  final AssessmentApiClient? assessmentApiClient;
  final CollegeApiClient? collegeApiClient;

  const _StudentBootstrap({
    required this.authService,
    required this.studentApiClient,
    this.assessmentApiClient,
    this.collegeApiClient,
  });

  @override
  State<_StudentBootstrap> createState() => _StudentBootstrapState();
}

class _StudentBootstrapState extends State<_StudentBootstrap> {
  late Future<Map<String, dynamic>?> _profileFuture;

  @override
  void initState() {
    super.initState();
    _profileFuture = widget.studentApiClient.getProfile();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, dynamic>?>(
      future: _profileFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            backgroundColor: NaaguruTheme.background,
            body: Center(
              child: CircularProgressIndicator(color: NaaguruTheme.primary),
            ),
          );
        }

        final profile = snapshot.data;
        if (profile != null) {
          return HomeScreen(
            authService: widget.authService,
            studentApiClient: widget.studentApiClient,
            assessmentApiClient: widget.assessmentApiClient,
            collegeApiClient: widget.collegeApiClient,
          );
        } else {
          return StudentProfileScreen(
            studentApiClient: widget.studentApiClient,
          );
        }
      },
    );
  }
}

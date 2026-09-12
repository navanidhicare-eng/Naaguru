import 'package:flutter/material.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/features/assessment/data/assessment_api_client.dart';
import 'package:naaguru_student/features/assessment/presentation/assessment_intro_screen.dart';
import 'package:naaguru_student/features/assessment/presentation/assessment_question_screen.dart';
import 'package:naaguru_student/features/auth/auth_service.dart';
import 'package:naaguru_student/features/auth/login_screen.dart';
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

  runApp(NaaguruStudentApp(
    authService: authService,
    studentApiClient: studentApiClient,
    assessmentApiClient: assessmentApiClient,
  ));
}

/// Root widget for the Naaguru Student application.
class NaaguruStudentApp extends StatelessWidget {
  final AuthService authService;
  final StudentApiClient studentApiClient;
  final AssessmentApiClient? assessmentApiClient;

  const NaaguruStudentApp({
    super.key,
    required this.authService,
    required this.studentApiClient,
    this.assessmentApiClient,
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
            ),
        '/home': (_) => HomeScreen(
              authService: authService,
              studentApiClient: studentApiClient,
            ),
        '/login': (_) => LoginScreen(authService: authService),
        '/profile': (_) =>
            StudentProfileScreen(studentApiClient: studentApiClient),
        '/assessment-intro': (_) => const AssessmentIntroScreen(),
        '/assessment-question': (_) =>
            AssessmentQuestionScreen(assessmentApiClient: assessmentApiClient),
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

  const AuthGate({
    super.key,
    required this.authService,
    required this.studentApiClient,
    this.assessmentApiClient,
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
              return HomeScreen(
                authService: widget.authService,
                studentApiClient: widget.studentApiClient,
              );
            } else {
              return LoginScreen(authService: widget.authService);
            }
          },
        );
      },
    );
  }
}

import 'package:flutter/material.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/features/auth/auth_service.dart';
import 'package:naaguru_student/features/auth/login_screen.dart';
import 'package:naaguru_student/features/home/home_screen.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';
import 'package:naaguru_student/features/student/presentation/student_profile_screen.dart';

void main() {
  // Create the shared API client and services once at startup.
  final apiClient = ApiClient();
  final authService = AuthService(apiClient: apiClient);
  final studentApiClient = StudentApiClient(apiClient: apiClient);

  runApp(NaaguruStudentApp(
    authService: authService,
    studentApiClient: studentApiClient,
  ));
}

/// Root widget for the Naaguru Student application.
class NaaguruStudentApp extends StatelessWidget {
  final AuthService authService;
  final StudentApiClient studentApiClient;

  const NaaguruStudentApp({
    super.key,
    required this.authService,
    required this.studentApiClient,
  });

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Naaguru',
      debugShowCheckedModeBanner: false,
      theme: NaaguruTheme.lightTheme,
      initialRoute: '/',
      routes: {
        '/': (_) => const HomeScreen(),
        '/login': (_) => LoginScreen(authService: authService),
        '/profile': (_) =>
            StudentProfileScreen(studentApiClient: studentApiClient),
      },
    );
  }
}

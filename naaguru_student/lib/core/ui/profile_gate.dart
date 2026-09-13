import 'package:flutter/material.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/features/auth/auth_service.dart';
import 'package:naaguru_student/features/student/data/catalog_api_client.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';
import 'package:naaguru_student/features/student/presentation/profile_screen1_about_you.dart';

/// Central gate widget that enforces the mandatory profile completion rule.
///
/// Rule:
///   - Profile UNKNOWN/LOADING → clean app-level splash
///   - Profile INCOMPLETE      → StudentProfileScreen (mandatory; cannot be bypassed)
///   - Profile COMPLETE        → render the requested [child] screen
///   - Profile ERROR           → show an error state with retry
///
/// Wrap every authenticated named route with this widget in MaterialApp.routes:
///
/// ```dart
/// '/home': (_) => ProfileGate(
///   authService: authService,
///   studentApiClient: studentApiClient,
///   child: HomeScreen(...),
/// ),
/// ```
///
/// This prevents bypass via Navigator.pushNamed() — regardless of how a route
/// is reached, ProfileGate always enforces the completion invariant.
class ProfileGate extends StatelessWidget {
  final AuthService authService;
  final StudentApiClient studentApiClient;
  final CatalogApiClient catalogApiClient;
  final Widget child;

  const ProfileGate({
    super.key,
    required this.authService,
    required this.studentApiClient,
    required this.catalogApiClient,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<ProfileState>(
      valueListenable: authService.profileStateNotifier,
      builder: (context, state, _) {
        switch (state) {
          case ProfileState.unknown:
            // Still resolving — show splash to avoid flash of wrong content.
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

          case ProfileState.incomplete:
            // Mandatory profile flow — Screen 1 of the profile wizard.
            // No back button; ProfileGate is bypassed only when markProfileComplete() fires.
            return ProfileScreen1AboutYou(
              authService: authService,
              studentApiClient: studentApiClient,
              catalogApiClient: catalogApiClient,
            );

          case ProfileState.complete:
            // Profile is complete — render the intended authenticated destination.
            return child;

          case ProfileState.error:
            // Network/server error — let the student retry without pretending
            // they have an incomplete profile.
            return Scaffold(
              backgroundColor: NaaguruTheme.background,
              body: Center(
                child: Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.cloud_off_outlined,
                        size: 64,
                        color: NaaguruTheme.muted,
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Could not connect',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: NaaguruTheme.text,
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Please check your connection and try again.',
                        style: TextStyle(fontSize: 14, color: NaaguruTheme.muted),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: () async {
                          // Retry by re-fetching profile state.
                          authService.profileStateNotifier.value =
                              ProfileState.unknown;
                          // Re-initialize: AuthService.tryRestoreSession would
                          // normally be called from AuthGate; here we do a direct
                          // profile re-fetch using the same internal pattern.
                          await authService.retryProfileFetch();
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: NaaguruTheme.primaryDark,
                          foregroundColor: NaaguruTheme.surface,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
              ),
            );
        }
      },
    );
  }
}

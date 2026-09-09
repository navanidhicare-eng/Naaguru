import 'package:flutter/material.dart';
import 'package:naaguru_student/core/theme.dart';

/// Placeholder screen shown after tapping "Start Your Journey".
///
/// This is a temporary destination to prove navigation works.
/// It will be replaced by the actual authentication / onboarding flow later.
class JourneyPlaceholderScreen extends StatelessWidget {
  const JourneyPlaceholderScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Naaguru'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.rocket_launch_rounded,
                size: 64,
                color: NaaguruTheme.accent,
              ),
              const SizedBox(height: 24),
              const Text(
                'Your Naaguru journey\nstarts here.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w600,
                  color: NaaguruTheme.text,
                  height: 1.3,
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Authentication and profile setup\nwill be added soon.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: NaaguruTheme.muted,
                  height: 1.5,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

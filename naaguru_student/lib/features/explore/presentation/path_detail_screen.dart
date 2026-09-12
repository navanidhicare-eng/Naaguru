import 'package:flutter/material.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/core/ui/buttons.dart';

class PathDetailScreen extends StatelessWidget {
  final String pathId;
  final String title;

  const PathDetailScreen({super.key, required this.pathId, required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NaaguruTheme.background,
      appBar: AppBar(
        title: Text(title, style: const TextStyle(color: NaaguruTheme.primaryDark, fontWeight: FontWeight.bold)),
        backgroundColor: NaaguruTheme.surface,
        elevation: 1,
        iconTheme: const IconThemeData(color: NaaguruTheme.primaryDark),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 48),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: NaaguruTheme.primaryLight.withAlpha(128),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.build_circle_outlined, size: 64, color: NaaguruTheme.primaryDark),
              ),
              const SizedBox(height: 32),
              Text(
                'Exploring $title',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: NaaguruTheme.primaryDark,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'We are currently compiling comprehensive curriculum, career maps, and eligibility details for this pathway.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  color: NaaguruTheme.muted,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 32),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                decoration: BoxDecoration(
                  color: NaaguruTheme.surface,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: NaaguruTheme.muted.withAlpha(51)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Icon(Icons.timer, color: NaaguruTheme.accent, size: 20),
                    SizedBox(width: 8),
                    Text(
                      'Full details coming soon!',
                      style: TextStyle(fontWeight: FontWeight.w600, color: NaaguruTheme.text),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 48),
              SecondaryButton(
                text: 'Go Back',
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import '../theme.dart';
import 'buttons.dart';

class NaaguruLoadingIndicator extends StatelessWidget {
  final String? message;

  const NaaguruLoadingIndicator({
    super.key,
    this.message,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const CircularProgressIndicator(
            color: NaaguruTheme.primary,
          ),
          if (message != null) ...[
            const SizedBox(height: NaaguruTheme.spacing16),
            Text(
              message!,
              style: const TextStyle(
                color: NaaguruTheme.muted,
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }
}

class NaaguruErrorView extends StatelessWidget {
  final String error;
  final VoidCallback? onRetry;

  const NaaguruErrorView({
    super.key,
    required this.error,
    this.onRetry,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(NaaguruTheme.spacing24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(
              Icons.error_outline,
              color: NaaguruTheme.error,
              size: 48,
            ),
            const SizedBox(height: NaaguruTheme.spacing16),
            Text(
              error,
              style: const TextStyle(
                color: NaaguruTheme.text,
                fontSize: 16,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
            ),
            if (onRetry != null) ...[
              const SizedBox(height: NaaguruTheme.spacing24),
              SizedBox(
                width: 200, // keep retry button from spanning entire width
                child: SecondaryButton(
                  text: 'Retry',
                  onPressed: onRetry,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

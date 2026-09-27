import 'package:flutter/material.dart';
import '../theme.dart';
import 'buttons.dart';

class NaaguruLoadingIndicator extends StatelessWidget {
  final String? message;

  const NaaguruLoadingIndicator({super.key, this.message});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const CircularProgressIndicator(color: NaaguruTheme.primary),
          if (message != null) ...[
            const SizedBox(height: NaaguruTheme.spacing16),
            Text(
              message!,
              style: const TextStyle(color: NaaguruTheme.muted, fontSize: 14),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }
}

/// Full-screen or large container error view with retry action.
class NaaguruErrorView extends StatelessWidget {
  final String error;
  final String? description;
  final VoidCallback? onRetry;
  final String retryText;

  const NaaguruErrorView({
    super.key,
    required this.error,
    this.description,
    this.onRetry,
    this.retryText = 'Retry',
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(NaaguruTheme.spacing24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: NaaguruTheme.error.withAlpha(25),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.error_outline_rounded,
                color: NaaguruTheme.error,
                size: 40,
              ),
            ),
            const SizedBox(height: NaaguruTheme.spacing16),
            Text(
              error,
              style: const TextStyle(
                color: NaaguruTheme.text,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            if (description != null) ...[
              const SizedBox(height: 8),
              Text(
                description!,
                style: const TextStyle(
                  color: NaaguruTheme.muted,
                  fontSize: 13,
                  height: 1.4,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            if (onRetry != null) ...[
              const SizedBox(height: NaaguruTheme.spacing20),
              SizedBox(
                width: 180,
                child: SecondaryButton(text: retryText, onPressed: onRetry),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Inline form-level error banner.
class NaaguruErrorBanner extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;
  final String? actionLabel;

  const NaaguruErrorBanner({
    super.key,
    required this.message,
    this.onRetry,
    this.actionLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: NaaguruTheme.error.withAlpha(20),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: NaaguruTheme.error.withAlpha(80)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          const Icon(
            Icons.error_outline,
            size: 18,
            color: NaaguruTheme.error,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(
                color: NaaguruTheme.error,
                fontSize: 12,
                fontWeight: FontWeight.w500,
                height: 1.3,
              ),
            ),
          ),
          if (onRetry != null) ...[
            const SizedBox(width: 8),
            TextButton(
              onPressed: onRetry,
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: Text(
                actionLabel ?? 'Retry',
                style: const TextStyle(
                  color: NaaguruTheme.error,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Dedicated empty-state widget distinguishing no results from failures.
class NaaguruEmptyView extends StatelessWidget {
  final String title;
  final String message;
  final IconData icon;
  final VoidCallback? onAction;
  final String? actionLabel;

  const NaaguruEmptyView({
    super.key,
    required this.title,
    required this.message,
    this.icon = Icons.search_off_rounded,
    this.onAction,
    this.actionLabel,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(NaaguruTheme.spacing24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: NaaguruTheme.primaryLight.withAlpha(50),
                shape: BoxShape.circle,
              ),
              child: Icon(
                icon,
                color: NaaguruTheme.primaryDark,
                size: 44,
              ),
            ),
            const SizedBox(height: NaaguruTheme.spacing16),
            Text(
              title,
              style: const TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: NaaguruTheme.text,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              message,
              style: const TextStyle(
                fontSize: 13,
                color: NaaguruTheme.muted,
                height: 1.4,
              ),
              textAlign: TextAlign.center,
            ),
            if (onAction != null && actionLabel != null) ...[
              const SizedBox(height: NaaguruTheme.spacing20),
              SizedBox(
                width: 180,
                child: SecondaryButton(
                  text: actionLabel!,
                  onPressed: onAction,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Visual variants for global standardized notifications.
enum NaaguruNotificationVariant {
  success,
  error,
  warning,
  info,
}

/// Global standardized notification helper.
///
/// Ensures consistent geometry, elevation, typography, icons, safe-area floating placement,
/// and accessible dismissal across every screen in the Naaguru application.
void showNaaguruSnackbar(
  BuildContext context, {
  required String message,
  NaaguruNotificationVariant variant = NaaguruNotificationVariant.info,
  bool? isError,
  Duration? duration,
  String? actionLabel,
  VoidCallback? onAction,
}) {
  // Respect legacy `isError` boolean flag for full backward compatibility
  final effectiveVariant = isError == true
      ? NaaguruNotificationVariant.error
      : (isError == false && variant == NaaguruNotificationVariant.info
          ? NaaguruNotificationVariant.success
          : variant);

  final Color backgroundColor;
  final IconData icon;
  final Color iconColor;
  final Color actionColor;

  switch (effectiveVariant) {
    case NaaguruNotificationVariant.success:
      backgroundColor = const Color(0xFF0D533C); // Rich deep emerald
      icon = Icons.check_circle_rounded;
      iconColor = const Color(0xFF34D399); // Mint emerald
      actionColor = const Color(0xFF6EE7B7);
      break;
    case NaaguruNotificationVariant.error:
      backgroundColor = const Color(0xFF991B1B); // Deep rich crimson
      icon = Icons.error_outline_rounded;
      iconColor = const Color(0xFFFCA5A5);
      actionColor = const Color(0xFFFECDD3);
      break;
    case NaaguruNotificationVariant.warning:
      backgroundColor = const Color(0xFF78350F); // Deep warm amber
      icon = Icons.warning_amber_rounded;
      iconColor = const Color(0xFFFCD34D);
      actionColor = const Color(0xFFFDE68A);
      break;
    case NaaguruNotificationVariant.info:
      backgroundColor = NaaguruTheme.primaryDark; // Brand navy-emerald
      icon = Icons.info_outline_rounded;
      iconColor = const Color(0xFF95F4DD);
      actionColor = NaaguruTheme.accent;
      break;
  }

  ScaffoldMessenger.of(context).hideCurrentSnackBar();
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Icon(icon, size: 20, color: iconColor),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: Colors.white,
                height: 1.35,
              ),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
      backgroundColor: backgroundColor,
      behavior: SnackBarBehavior.floating,
      elevation: 4,
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      duration: duration ??
          (actionLabel != null
              ? const Duration(seconds: 4)
              : const Duration(milliseconds: 3200)),
      action: (actionLabel != null && onAction != null)
          ? SnackBarAction(
              label: actionLabel,
              textColor: actionColor,
              onPressed: onAction,
            )
          : null,
    ),
  );
}

/// Alias for [showNaaguruSnackbar] aligning with naming standard.
void showNaaguruNotification(
  BuildContext context, {
  required String message,
  NaaguruNotificationVariant variant = NaaguruNotificationVariant.info,
  Duration? duration,
  String? actionLabel,
  VoidCallback? onAction,
}) => showNaaguruSnackbar(
  context,
  message: message,
  variant: variant,
  duration: duration,
  actionLabel: actionLabel,
  onAction: onAction,
);

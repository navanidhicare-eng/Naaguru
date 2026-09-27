import 'package:flutter/foundation.dart';

/// Production-safe developer diagnostics logger.
///
/// Ensures technical diagnostic context is preserved in development/logs
/// while preventing PII (phone numbers, OTPs, auth tokens) from leaking.
class AppLogger {
  AppLogger._();

  /// Masks a phone number to only show the last 4 digits (e.g. +91 ******4567).
  static String maskPhone(String? phone) {
    if (phone == null || phone.isEmpty) return '[empty]';
    final cleaned = phone.trim();
    if (cleaned.length <= 4) return '****';
    final visible = cleaned.substring(cleaned.length - 4);
    return '******$visible';
  }

  /// Sanitizes log context maps to strip or mask sensitive tokens, passwords, and OTPs.
  static Map<String, dynamic> _sanitizeContext(Map<String, dynamic>? context) {
    if (context == null) return {};
    final sanitized = <String, dynamic>{};
    for (final entry in context.entries) {
      final key = entry.key.toLowerCase();
      if (key.contains('token') ||
          key.contains('password') ||
          key.contains('secret') ||
          key.contains('authorization')) {
        sanitized[entry.key] = '[REDACTED]';
      } else if (key.contains('otp') || key.contains('code')) {
        sanitized[entry.key] = '[REDACTED_OTP]';
      } else if (key.contains('phone') || key.contains('mobile')) {
        sanitized[entry.key] = maskPhone(entry.value?.toString());
      } else {
        sanitized[entry.key] = entry.value;
      }
    }
    return sanitized;
  }

  /// Logs an informational message.
  static void info(String message, [Map<String, dynamic>? context]) {
    if (kDebugMode) {
      final ctxStr = context != null ? ' | Context: ${_sanitizeContext(context)}' : '';
      debugPrint('ℹ️ [INFO] $message$ctxStr');
    }
  }

  /// Logs a warning (e.g. recoverable retry, validation fallback).
  static void warn(String message, [Map<String, dynamic>? context]) {
    if (kDebugMode) {
      final ctxStr = context != null ? ' | Context: ${_sanitizeContext(context)}' : '';
      debugPrint('⚠️ [WARN] $message$ctxStr');
    }
  }

  /// Logs an error with safe diagnostic context.
  static void error(
    String message, {
    Object? error,
    StackTrace? stackTrace,
    int? statusCode,
    String? endpoint,
    Map<String, dynamic>? context,
  }) {
    if (kDebugMode) {
      final buffer = StringBuffer('🚨 [ERROR] $message');
      if (endpoint != null) buffer.write(' | Endpoint: $endpoint');
      if (statusCode != null) buffer.write(' | Status: $statusCode');
      if (context != null) buffer.write(' | Context: ${_sanitizeContext(context)}');
      if (error != null) buffer.write('\nDetails: $error');
      if (stackTrace != null) buffer.write('\n$stackTrace');

      debugPrint(buffer.toString());
    }
  }
}

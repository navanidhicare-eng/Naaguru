import 'package:flutter/foundation.dart';

/// Naaguru Student App — Configuration Constants
///
/// Central location for app-wide configuration values.
class AppConfig {
  AppConfig._(); // Prevent instantiation

  /// The base URL for the Naaguru REST API.
  /// Dynamically selects the right localhost address based on platform.
  static String get apiBaseUrl {
    if (kIsWeb) {
      return 'http://localhost:3000/api/v1';
    }
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:3000/api/v1';
    }
    return 'http://localhost:3000/api/v1';
  }

  /// App display name
  static const String appName = 'Naaguru';
}

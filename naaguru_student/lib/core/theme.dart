import 'package:flutter/material.dart';

class NaaguruTheme {
  NaaguruTheme._();

  // Colors
  static const Color primary = Color(0xFF087F6C);
  static const Color primaryDark = Color(0xFF056052);
  static const Color primaryLight = Color(0xFFE6F5F1);
  static const Color accent = Color(0xFFF4B942);
  static const Color background = Color(0xFFF8FAF9);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color text = Color(0xFF172321);
  static const Color muted = Color(0xFF647572);
  static const Color success = Color(0xFF2E8B57);
  static const Color error = Color(0xFFD64545);

  // Spacing
  static const double spacing4 = 4.0;
  static const double spacing8 = 8.0;
  static const double spacing12 = 12.0;
  static const double spacing16 = 16.0;
  static const double spacing20 = 20.0;
  static const double spacing24 = 24.0;
  static const double spacing32 = 32.0;
  static const double spacing40 = 40.0;
  static const double spacing48 = 48.0;
  static const double spacing64 = 64.0;

  // Radius
  static const double primaryRadius = 12.0;
  static final BorderRadius borderRadius = BorderRadius.circular(primaryRadius);

  static ThemeData get lightTheme {
    return ThemeData(
      colorScheme: ColorScheme.fromSeed(
        seedColor: primary,
        primary: primary,
        secondary: accent,
        surface: surface,
        error: error,
        brightness: Brightness.light,
      ),
      scaffoldBackgroundColor: background,
      // Use intended font family (Inter) with fallback to Noto Sans Telugu
      fontFamily: 'Inter',
      fontFamilyFallback: const ['Noto Sans Telugu'],
      textTheme: const TextTheme(
        // Mobile type scale
        displayLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.w700, color: text), // Hero
        displayMedium: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: text), // H1
        displaySmall: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: text), // H2
        headlineLarge: TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: text), // H3
        headlineMedium: TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: text), // H4
        bodyLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w400, color: text, height: 1.5), // Body Large
        bodyMedium: TextStyle(fontSize: 14, fontWeight: FontWeight.w400, color: text, height: 1.5), // Body
        bodySmall: TextStyle(fontSize: 12, fontWeight: FontWeight.w400, color: text, height: 1.5), // Small
        labelSmall: TextStyle(fontSize: 11, fontWeight: FontWeight.w400, color: text, height: 1.5), // Caption
        labelLarge: TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: text), // Button
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: surface,
        foregroundColor: text,
        elevation: 0,
        centerTitle: true,
      ),
    );
  }
}

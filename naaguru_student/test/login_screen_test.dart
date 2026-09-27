import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/features/auth/auth_service.dart';
import 'package:naaguru_student/features/auth/login_screen.dart';

void main() {
  testWidgets('Entering 9-digit mobile number shows inline error and does NOT request OTP', (
    WidgetTester tester,
  ) async {
    bool apiCalled = false;
    final mockClient = MockClient((request) async {
      apiCalled = true;
      return http.Response(jsonEncode({'message': 'OTP sent'}), 200);
    });

    final apiClient = ApiClient(httpClient: mockClient);
    final authService = AuthService(
      apiClient: apiClient,
      storage: const FlutterSecureStorage(),
    );

    await tester.pumpWidget(
      MaterialApp(
        home: LoginScreen(authService: authService),
      ),
    );
    await tester.pumpAndSettle();

    // Enter 9 digits
    await tester.enterText(find.byType(TextField).first, '987654321');
    await tester.pump();

    // Scroll to & Tap Send OTP
    final sendBtn = find.text('Send OTP');
    await tester.ensureVisible(sendBtn);
    await tester.tap(sendBtn);
    await tester.pumpAndSettle();

    // Verify error is shown and API was NOT called
    expect(find.text('Please enter all 10 digits of your mobile number.'), findsOneWidget);
    expect(apiCalled, isFalse);
  });

  testWidgets('Server 400 Zod validation error displays friendly message, never raw JSON', (
    WidgetTester tester,
  ) async {
    final zodIssues = [
      {
        'code': 'too_small',
        'minimum': 10,
        'type': 'string',
        'inclusive': true,
        'exact': false,
        'message': 'String must contain at least 10 character(s)',
        'path': ['phoneNumber'],
      }
    ];

    final mockClient = MockClient((request) async {
      return http.Response(jsonEncode({'error': zodIssues}), 400);
    });

    final apiClient = ApiClient(httpClient: mockClient);
    final authService = AuthService(
      apiClient: apiClient,
      storage: const FlutterSecureStorage(),
    );

    await tester.pumpWidget(
      MaterialApp(
        home: LoginScreen(authService: authService),
      ),
    );
    await tester.pumpAndSettle();

    // Enter 10 digits (to pass client validation and hit server)
    await tester.enterText(find.byType(TextField).first, '9876543210');
    await tester.pump();

    final sendBtn = find.text('Send OTP');
    await tester.ensureVisible(sendBtn);
    await tester.tap(sendBtn);
    await tester.pumpAndSettle();

    // Expect friendly message and no raw Zod syntax
    expect(find.text('Enter your complete 10-digit mobile number.'), findsOneWidget);
    expect(find.textContaining('too_small'), findsNothing);
    expect(find.textContaining('{origin:'), findsNothing);
  });

  testWidgets('Server 429 rate limit displays friendly cooldown message', (
    WidgetTester tester,
  ) async {
    final mockClient = MockClient((request) async {
      return http.Response(jsonEncode({'error': 'Please wait 60 seconds'}), 429);
    });

    final apiClient = ApiClient(httpClient: mockClient);
    final authService = AuthService(
      apiClient: apiClient,
      storage: const FlutterSecureStorage(),
    );

    await tester.pumpWidget(
      MaterialApp(
        home: LoginScreen(authService: authService),
      ),
    );
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextField).first, '9876543210');
    await tester.pump();

    final sendBtn = find.text('Send OTP');
    await tester.ensureVisible(sendBtn);
    await tester.tap(sendBtn);
    await tester.pumpAndSettle();

    expect(
      find.text("You've requested too many codes. Please wait before requesting another."),
      findsOneWidget,
    );
  });

  testWidgets('Network failure displays offline error message', (
    WidgetTester tester,
  ) async {
    final mockClient = MockClient((request) async {
      throw const SocketException('No route to host');
    });

    final apiClient = ApiClient(httpClient: mockClient);
    final authService = AuthService(
      apiClient: apiClient,
      storage: const FlutterSecureStorage(),
    );

    await tester.pumpWidget(
      MaterialApp(
        home: LoginScreen(authService: authService),
      ),
    );
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextField).first, '9876543210');
    await tester.pump();

    final sendBtn = find.text('Send OTP');
    await tester.ensureVisible(sendBtn);
    await tester.tap(sendBtn);
    await tester.pumpAndSettle();

    expect(
      find.text("You're offline. Check your internet connection and try again."),
      findsOneWidget,
    );
  });

  testWidgets('Successful OTP request advances to OTP verification screen and handles invalid OTP error', (
    WidgetTester tester,
  ) async {
    final mockClient = MockClient((request) async {
      if (request.url.path.contains('/auth/request-otp')) {
        return http.Response(jsonEncode({'message': 'OTP sent'}), 200);
      }
      if (request.url.path.contains('/auth/verify-otp')) {
        return http.Response(jsonEncode({'error': 'Invalid or expired OTP'}), 401);
      }
      return http.Response('Not found', 404);
    });

    final apiClient = ApiClient(httpClient: mockClient);
    final authService = AuthService(
      apiClient: apiClient,
      storage: const FlutterSecureStorage(),
    );

    await tester.pumpWidget(
      MaterialApp(
        home: LoginScreen(authService: authService),
      ),
    );
    await tester.pumpAndSettle();

    await tester.enterText(find.byType(TextField).first, '9876543210');
    await tester.pump();

    final sendBtn = find.text('Send OTP');
    await tester.ensureVisible(sendBtn);
    await tester.tap(sendBtn);
    await tester.pumpAndSettle();

    // Verify advanced to OTP screen
    expect(find.text('Check your WhatsApp'), findsOneWidget);

    // Enter 6 digit OTP
    await tester.enterText(find.byType(TextField).first, '123456');
    await tester.pumpAndSettle();

    // Expect friendly error on 401
    expect(
      find.text('This code is incorrect or has expired. Please check it and try again.'),
      findsOneWidget,
    );
  });
}

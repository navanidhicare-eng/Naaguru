import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:naaguru_student/core/errors/app_error.dart';

void main() {
  group('ErrorMapper HTTP Response Mapping', () {
    test('429 Rate Limiting maps to friendly cooldown message', () {
      final res = http.Response(jsonEncode({'error': 'Please wait 60 seconds'}), 429);
      final error = ErrorMapper.fromResponse(res);

      expect(error.type, AppErrorType.rateLimited);
      expect(error.statusCode, 429);
      expect(error.userMessage, "You've requested too many codes. Please wait before requesting another.");
      expect(error.message(true), contains('మీరు చాలా సార్లు అభ్యర్థించారు'));
    });

    test('400 with Zod phone number issue maps to friendly mobile number error and never exposes raw JSON', () {
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
      final res = http.Response(jsonEncode({'error': zodIssues}), 400);
      final error = ErrorMapper.fromResponse(res);

      expect(error.type, AppErrorType.validation);
      expect(error.statusCode, 400);
      expect(error.field, 'phoneNumber');
      expect(error.userMessage, "Enter your complete 10-digit mobile number.");
      expect(error.message(true), contains('10 అంకెల మొబైల్ నంబర్'));
      expect(error.userMessage, isNot(contains('too_small')));
      expect(error.userMessage, isNot(contains('{')));
    });

    test('400 with OTP issue maps to verification code message', () {
      final zodIssues = [
        {
          'code': 'invalid_string',
          'path': ['code'],
          'message': 'Invalid OTP',
        }
      ];
      final res = http.Response(jsonEncode({'error': zodIssues}), 400);
      final error = ErrorMapper.fromResponse(res);

      expect(error.type, AppErrorType.validation);
      expect(error.field, 'code');
      expect(error.userMessage, "Please enter a valid 6-digit verification code.");
    });

    test('401 on Auth route maps to authentication error', () {
      final req = http.Request('POST', Uri.parse('http://localhost:3000/api/v1/auth/verify-otp'));
      final res = http.Response.bytes(utf8.encode(jsonEncode({'error': 'bad otp'})), 401, request: req);
      final error = ErrorMapper.fromResponse(res);

      expect(error.type, AppErrorType.authentication);
      expect(error.userMessage, "This code is incorrect or has expired. Please check it and try again.");
    });

    test('401 on Protected route maps to session expired error', () {
      final req = http.Request('GET', Uri.parse('http://localhost:3000/api/v1/students/me'));
      final res = http.Response.bytes(utf8.encode(jsonEncode({'error': 'Unauthorized'})), 401, request: req);
      final error = ErrorMapper.fromResponse(res);

      expect(error.type, AppErrorType.sessionExpired);
      expect(error.userMessage, "Your session has expired. Please sign in again.");
    });

    test('403 with revision limit maps to revision limit error', () {
      final res = http.Response(jsonEncode({'error': {'message': 'Maximum revision limit reached'}}), 403);
      final error = ErrorMapper.fromResponse(res);

      expect(error.type, AppErrorType.forbidden);
      expect(error.userMessage, "Maximum self-service revisions reached (limit: 2).");
    });

    test('404 maps to resource not found', () {
      final res = http.Response(jsonEncode({'error': 'Not found'}), 404);
      final error = ErrorMapper.fromResponse(res);

      expect(error.type, AppErrorType.notFound);
      expect(error.userMessage, "We couldn't find the requested information.");
    });

    test('409 maps to conflict error', () {
      final res = http.Response(jsonEncode({'error': 'Already exists'}), 409);
      final error = ErrorMapper.fromResponse(res);

      expect(error.type, AppErrorType.conflict);
      expect(error.userMessage, "This record already exists. Please review your input.");
    });

    test('500 Server Error maps to friendly server issue message', () {
      final res = http.Response('Internal Server Error crash trace', 500);
      final error = ErrorMapper.fromResponse(res);

      expect(error.type, AppErrorType.server);
      expect(error.userMessage, "Something went wrong on our side. Please try again shortly.");
      expect(error.userMessage, isNot(contains('crash trace')));
    });
  });

  group('ErrorMapper Exception Mapping', () {
    test('SocketException maps to offline network error', () {
      const ex = SocketException('Failed host lookup');
      final error = ErrorMapper.fromException(ex);

      expect(error.type, AppErrorType.network);
      expect(error.userMessage, "You're offline. Check your internet connection and try again.");
      expect(error.message(true), contains('ఆఫ్‌లైన్‌లో ఉన్నారు'));
    });

    test('TimeoutException maps to timeout error', () {
      final ex = TimeoutException('Connection timed out');
      final error = ErrorMapper.fromException(ex);

      expect(error.type, AppErrorType.timeout);
      expect(error.userMessage, "This is taking longer than expected. Please try again.");
    });

    test('ClientException maps to network connection error', () {
      final ex = http.ClientException('Connection closed before full header was received');
      final error = ErrorMapper.fromException(ex);

      expect(error.type, AppErrorType.network);
      expect(error.userMessage, "Unable to connect to server. Please check your internet connection.");
    });
  });
}

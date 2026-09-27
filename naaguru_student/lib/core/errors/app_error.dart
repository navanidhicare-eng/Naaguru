import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:naaguru_student/core/api_client.dart';

/// Broad classification of all application-level errors.
enum AppErrorType {
  validation,
  authentication,
  sessionExpired,
  forbidden,
  notFound,
  conflict,
  rateLimited,
  network,
  timeout,
  server,
  unknown,
}

/// A structured, user-friendly application error model.
class AppError {
  final AppErrorType type;
  final String userMessage;
  final String userMessageTe;
  final String? field;
  final int? statusCode;
  final String? errorCode;
  final String? technicalDetails;
  final Object? originalException;
  final StackTrace? stackTrace;

  const AppError({
    required this.type,
    required this.userMessage,
    required this.userMessageTe,
    this.field,
    this.statusCode,
    this.errorCode,
    this.technicalDetails,
    this.originalException,
    this.stackTrace,
  });

  /// Returns the appropriate language message.
  String message([bool isTelugu = false]) => isTelugu ? userMessageTe : userMessage;

  /// Returns an actionable button text for this error.
  String actionText([bool isTelugu = false]) {
    switch (type) {
      case AppErrorType.validation:
        return isTelugu ? 'సవరించండి' : 'Check Input';
      case AppErrorType.authentication:
        return isTelugu ? 'మళ్లీ ప్రయత్నించండి' : 'Try Again';
      case AppErrorType.sessionExpired:
        return isTelugu ? 'లాగిన్ అవ్వండి' : 'Sign In';
      case AppErrorType.rateLimited:
        return isTelugu ? 'వేచి ఉండండి' : 'Please Wait';
      case AppErrorType.network:
      case AppErrorType.timeout:
      case AppErrorType.server:
      case AppErrorType.unknown:
      default:
        return isTelugu ? 'మళ్లీ ప్రయత్నించండి' : 'Retry';
    }
  }

  @override
  String toString() => 'AppError($type, status: $statusCode, code: $errorCode, message: $userMessage)';
}

/// Centralized mapper that converts backend responses, HTTP status codes,
/// and Dart runtime exceptions into safe, user-friendly [AppError] objects.
class ErrorMapper {
  ErrorMapper._();

  /// Converts an HTTP [response] into an [AppError].
  static AppError fromResponse(http.Response response) {
    final status = response.statusCode;
    Map<String, dynamic>? body;
    dynamic rawError;

    try {
      final decoded = jsonDecode(response.body);
      if (decoded is Map<String, dynamic>) {
        body = decoded;
        rawError = decoded['error'];
      } else if (decoded is List) {
        rawError = decoded;
      }
    } catch (_) {
      // Body is not JSON
    }

    final technicalDetails = 'HTTP $status on ${response.request?.url.path ?? 'endpoint'}: ${response.body}';

    // 1. Rate Limiting (HTTP 429)
    if (status == 429) {
      return AppError(
        type: AppErrorType.rateLimited,
        statusCode: 429,
        errorCode: 'TOO_MANY_REQUESTS',
        userMessage: "You've requested too many codes. Please wait before requesting another.",
        userMessageTe: "మీరు చాలా సార్లు అభ్యర్థించారు. దయచేసి కొద్దిసేపు వేచి ఉండి మళ్లీ ప్రయత్నించండి.",
        technicalDetails: technicalDetails,
      );
    }

    // 2. Unauthorized / Session Expired (HTTP 401)
    if (status == 401) {
      final path = response.request?.url.path ?? '';
      final rawErrorStr = rawError is String ? rawError.toLowerCase() : '';
      final isAuthRoute = path.contains('/auth/') ||
          rawErrorStr.contains('otp') ||
          rawErrorStr.contains('code') ||
          rawErrorStr.contains('invalid');

      if (isAuthRoute) {
        return AppError(
          type: AppErrorType.authentication,
          statusCode: 401,
          errorCode: 'UNAUTHORIZED',
          userMessage: "This code is incorrect or has expired. Please check it and try again.",
          userMessageTe: "ఈ వెరిఫికేషన్ కోడ్ సరైనది కాదు లేదా గడువు ముగిసింది. దయచేసి మళ్లీ ప్రయత్నించండి.",
          technicalDetails: technicalDetails,
        );
      }
      return AppError(
        type: AppErrorType.sessionExpired,
        statusCode: 401,
        errorCode: 'SESSION_EXPIRED',
        userMessage: "Your session has expired. Please sign in again.",
        userMessageTe: "మీ సెషన్ గడువు ముగిసింది. దయచేసి మళ్లీ లాగిన్ అవ్వండి.",
        technicalDetails: technicalDetails,
      );
    }

    // 3. Forbidden (HTTP 403)
    if (status == 403) {
      final msg = body?['error'] is Map ? body!['error']['message'] : (rawError is String ? rawError : null);
      if (msg != null && msg.contains('revision limit')) {
        return AppError(
          type: AppErrorType.forbidden,
          statusCode: 403,
          errorCode: 'REVISION_LIMIT_REACHED',
          userMessage: "Maximum self-service revisions reached (limit: 2).",
          userMessageTe: "గరిష్ట సవరణల పరిమితి ముగిసింది (పరిమితి: 2).",
          technicalDetails: technicalDetails,
        );
      }
      return AppError(
        type: AppErrorType.forbidden,
        statusCode: 403,
        errorCode: 'FORBIDDEN',
        userMessage: "You do not have permission to perform this action.",
        userMessageTe: "ఈ చర్య చేయడానికి మీకు అనుమతి లేదు.",
        technicalDetails: technicalDetails,
      );
    }

    // 4. Resource Not Found (HTTP 404)
    if (status == 404) {
      return AppError(
        type: AppErrorType.notFound,
        statusCode: 404,
        errorCode: 'NOT_FOUND',
        userMessage: "We couldn't find the requested information.",
        userMessageTe: "అభ్యర్థించిన సమాచారం కనుగొనబడలేదు.",
        technicalDetails: technicalDetails,
      );
    }

    // 5. Conflict (HTTP 409)
    if (status == 409) {
      return AppError(
        type: AppErrorType.conflict,
        statusCode: 409,
        errorCode: 'CONFLICT',
        userMessage: "This record already exists. Please review your input.",
        userMessageTe: "ఈ రికార్డ్ ఇప్పటికే ఉంది. దయచేసి తనిఖీ చేయండి.",
        technicalDetails: technicalDetails,
      );
    }

    // 6. Validation Error (HTTP 400 or HTTP 422)
    if (status == 400 || status == 422) {
      String? targetField;
      String userMsg = "Please check your entered details and try again.";
      String userMsgTe = "దయచేసి మీరు నమోదు చేసిన వివరాలను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.";

      // Handle Zod issue list: [ { code, path: ['phoneNumber'], message: '...' } ]
      if (rawError is List && rawError.isNotEmpty) {
        final firstIssue = rawError.first;
        if (firstIssue is Map<String, dynamic>) {
          final pathList = firstIssue['path'] as List<dynamic>?;
          if (pathList != null && pathList.isNotEmpty) {
            targetField = pathList.first.toString();
          }
          final issueCode = firstIssue['code']?.toString();

          if (targetField == 'phoneNumber' || targetField == 'phone') {
            userMsg = "Enter your complete 10-digit mobile number.";
            userMsgTe = "దయచేసి మీ 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.";
          } else if (targetField == 'otp' || targetField == 'code') {
            userMsg = "Please enter a valid 6-digit verification code.";
            userMsgTe = "దయచేసి సరైన 6 అంకెల వెరిఫికేషన్ కోడ్ నమోదు చేయండి.";
          } else if (targetField == 'pincode') {
            userMsg = "Enter a valid 6-digit pincode.";
            userMsgTe = "దయచేసి సరైన 6 అంకెల పిన్‌కోడ్ నమోదు చేయండి.";
          } else if (issueCode == 'invalid_type' || issueCode == 'too_small') {
            userMsg = "Please fill in all required fields correctly.";
            userMsgTe = "దయచేసి అవసరమైన అన్ని వివరాలను సరిగ్గా పూరించండి.";
          }
        }
      } else if (rawError is Map<String, dynamic>) {
        final code = rawError['code']?.toString();
        final message = rawError['message']?.toString();
        if (message != null && message.toLowerCase().contains('phone')) {
          targetField = 'phoneNumber';
          userMsg = "Enter your complete 10-digit mobile number.";
          userMsgTe = "దయచేసి మీ 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.";
        } else if (code == 'VALIDATION_ERROR') {
          userMsg = "Please check your entered details and try again.";
          userMsgTe = "దయచేసి మీరు నమోదు చేసిన వివరాలను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.";
        }
      } else if (rawError is String) {
        if (rawError.toLowerCase().contains('phone')) {
          targetField = 'phoneNumber';
          userMsg = "Enter your complete 10-digit mobile number.";
          userMsgTe = "దయచేసి మీ 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.";
        } else if (rawError.toLowerCase().contains('otp') || rawError.toLowerCase().contains('code')) {
          targetField = 'otp';
          userMsg = "This code is incorrect or has expired. Please check it and try again.";
          userMsgTe = "ఈ వెరిఫికేషన్ కోడ్ సరైనది కాదు లేదా గడువు ముగిసింది. దయచేసి మళ్లీ ప్రయత్నించండి.";
        }
      }

      return AppError(
        type: AppErrorType.validation,
        statusCode: status,
        errorCode: 'VALIDATION_ERROR',
        field: targetField,
        userMessage: userMsg,
        userMessageTe: userMsgTe,
        technicalDetails: technicalDetails,
      );
    }

    // 7. Server Errors (HTTP 500..599)
    if (status >= 500) {
      return AppError(
        type: AppErrorType.server,
        statusCode: status,
        errorCode: 'INTERNAL_SERVER_ERROR',
        userMessage: "Something went wrong on our side. Please try again shortly.",
        userMessageTe: "మా వైపు సాంకేతిక సమస్య ఏర్పడింది. దయచేసి కొద్దిసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.",
        technicalDetails: technicalDetails,
      );
    }

    // 8. Fallback
    return AppError(
      type: AppErrorType.unknown,
      statusCode: status,
      errorCode: 'UNKNOWN_ERROR',
      userMessage: "Something unexpected happened. Please try again.",
      userMessageTe: "అనుకోని సమస్య ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి.",
      technicalDetails: technicalDetails,
    );
  }

  /// Converts any Dart runtime exception or generic object into an [AppError].
  static AppError fromException(Object error, [StackTrace? stackTrace]) {
    if (error is AppError) return error;

    if (error is ApiException) {
      if (error.appError != null) return error.appError!;
      if (error.statusCode == 404) {
        return AppError(
          type: AppErrorType.notFound,
          statusCode: 404,
          errorCode: 'NOT_FOUND',
          userMessage: "We couldn't find the requested information.",
          userMessageTe: "అభ్యర్థించిన సమాచారం కనుగొనబడలేదు.",
          technicalDetails: error.toString(),
          originalException: error,
          stackTrace: stackTrace,
        );
      }
      if (error.statusCode == 401) {
        return AppError(
          type: AppErrorType.sessionExpired,
          statusCode: 401,
          errorCode: 'SESSION_EXPIRED',
          userMessage: "Your session has expired. Please sign in again.",
          userMessageTe: "మీ సెషన్ గడువు ముగిసింది. దయచేసి మళ్లీ లాగిన్ అవ్వండి.",
          technicalDetails: error.toString(),
          originalException: error,
          stackTrace: stackTrace,
        );
      }
      if (error.statusCode == 429) {
        return AppError(
          type: AppErrorType.rateLimited,
          statusCode: 429,
          errorCode: 'TOO_MANY_REQUESTS',
          userMessage: "You've requested too many codes. Please wait before requesting another.",
          userMessageTe: "మీరు చాలా సార్లు అభ్యర్థించారు. దయచేసి కొద్దిసేపు వేచి ఉండి మళ్లీ ప్రయత్నించండి.",
          technicalDetails: error.toString(),
          originalException: error,
          stackTrace: stackTrace,
        );
      }
      if (error.statusCode >= 500) {
        return AppError(
          type: AppErrorType.server,
          statusCode: error.statusCode,
          errorCode: 'INTERNAL_SERVER_ERROR',
          userMessage: "Something went wrong on our side. Please try again shortly.",
          userMessageTe: "మా వైపు సాంకేతిక సమస్య ఏర్పడింది. దయచేసి కొద్దిసేపటి తర్వాత మళ్లీ ప్రయత్నించండి.",
          technicalDetails: error.toString(),
          originalException: error,
          stackTrace: stackTrace,
        );
      }
      if (error.statusCode == 400 || error.statusCode == 422) {
        return AppError(
          type: AppErrorType.validation,
          statusCode: error.statusCode,
          errorCode: 'VALIDATION_ERROR',
          userMessage: "Please check your entered details and try again.",
          userMessageTe: "దయచేసి మీరు నమోదు చేసిన వివరాలను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.",
          technicalDetails: error.toString(),
          originalException: error,
          stackTrace: stackTrace,
        );
      }
      return AppError(
        type: AppErrorType.unknown,
        statusCode: error.statusCode,
        errorCode: 'API_EXCEPTION',
        userMessage: error.message.isNotEmpty ? error.message : "Something unexpected happened. Please try again.",
        userMessageTe: "అనుకోని సమస్య ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి.",
        technicalDetails: error.toString(),
        originalException: error,
        stackTrace: stackTrace,
      );
    }

    if (error is SocketException) {
      return AppError(
        type: AppErrorType.network,
        errorCode: 'OFFLINE',
        userMessage: "You're offline. Check your internet connection and try again.",
        userMessageTe: "మీరు ఆఫ్‌లైన్‌లో ఉన్నారు. మీ ఇంటర్నెట్ కనెక్షన్‌ను తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.",
        technicalDetails: error.toString(),
        originalException: error,
        stackTrace: stackTrace,
      );
    }

    if (error is TimeoutException) {
      return AppError(
        type: AppErrorType.timeout,
        errorCode: 'TIMEOUT',
        userMessage: "This is taking longer than expected. Please try again.",
        userMessageTe: "అభ్యర్థన ఎక్కువ సమయం తీసుకుంటోంది. దయచేసి మళ్లీ ప్రయత్నించండి.",
        technicalDetails: error.toString(),
        originalException: error,
        stackTrace: stackTrace,
      );
    }

    if (error is http.ClientException) {
      return AppError(
        type: AppErrorType.network,
        errorCode: 'NETWORK_ERROR',
        userMessage: "Unable to connect to server. Please check your internet connection.",
        userMessageTe: "సర్వర్‌కు కనెక్ట్ కాలేకపోయాము. దయచేసి ఇంటర్నెట్ కనెక్షన్‌ను తనిఖీ చేయండి.",
        technicalDetails: error.toString(),
        originalException: error,
        stackTrace: stackTrace,
      );
    }

    if (error is FormatException) {
      return AppError(
        type: AppErrorType.server,
        errorCode: 'MALFORMED_RESPONSE',
        userMessage: "Received an unexpected response from the server. Please try again.",
        userMessageTe: "సర్వర్ నుండి సరైన ప్రతిస్పందన రాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.",
        technicalDetails: error.toString(),
        originalException: error,
        stackTrace: stackTrace,
      );
    }

    return AppError(
      type: AppErrorType.unknown,
      errorCode: 'UNKNOWN_EXCEPTION',
      userMessage: "Something unexpected happened. Please try again.",
      userMessageTe: "అనుకోని సమస్య ఏర్పడింది. దయచేసి మళ్లీ ప్రయత్నించండి.",
      technicalDetails: error.toString(),
      originalException: error,
      stackTrace: stackTrace,
    );
  }

  /// Convenience method to get a user-facing string directly from any error.
  static String userMessage(Object? error, {bool isTelugu = false}) {
    if (error == null) return '';
    if (error is AppError) return error.message(isTelugu);
    return fromException(error).message(isTelugu);
  }
}

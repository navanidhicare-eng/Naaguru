import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:naaguru_student/core/config.dart';
import 'package:naaguru_student/core/errors/app_error.dart';
import 'package:naaguru_student/core/utils/app_logger.dart';

/// A lightweight HTTP client that attaches the JWT access token
/// to every request and handles JSON serialization and error mapping.
class ApiClient {
  final http.Client _httpClient;
  String? _accessToken;
  String? _refreshToken;

  /// In-flight refresh future to deduplicate concurrent 401 token refresh requests.
  Future<bool>? _refreshFuture;

  /// Invoked whenever tokens are refreshed/rotated so the caller (e.g. AuthService)
  /// can persist the new refresh token securely.
  void Function(String accessToken, String refreshToken)? onTokensRefreshed;

  /// Callback invoked when session refresh fails and tokens are cleared.
  void Function()? onSessionExpired;

  ApiClient({http.Client? httpClient})
    : _httpClient = httpClient ?? http.Client();

  String? get accessToken => _accessToken;
  String? get refreshToken => _refreshToken;
  bool get isAuthenticated => _accessToken != null;

  void setTokens({required String accessToken, required String refreshToken}) {
    _accessToken = accessToken;
    _refreshToken = refreshToken;
  }

  void clearTokens() {
    _accessToken = null;
    _refreshToken = null;
    _refreshFuture = null;
  }

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_accessToken != null) 'Authorization': 'Bearer $_accessToken',
  };

  /// Performs a GET request. Returns the decoded JSON body.
  Future<Map<String, dynamic>> get(String path) async {
    final response = await _request(
      () => _httpClient.get(
        Uri.parse('${AppConfig.apiBaseUrl}$path'),
        headers: _headers,
      ),
      path: path,
    );
    return _decodeResponse(response);
  }

  /// Performs a POST request with a JSON body.
  Future<Map<String, dynamic>> post(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final response = await _request(
      () => _httpClient.post(
        Uri.parse('${AppConfig.apiBaseUrl}$path'),
        headers: _headers,
        body: body != null ? jsonEncode(body) : null,
      ),
      path: path,
    );
    return _decodeResponse(response);
  }

  /// Performs a PATCH request with a JSON body.
  Future<Map<String, dynamic>> patch(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    final response = await _request(
      () => _httpClient.patch(
        Uri.parse('${AppConfig.apiBaseUrl}$path'),
        headers: _headers,
        body: body != null ? jsonEncode(body) : null,
      ),
      path: path,
    );
    return _decodeResponse(response);
  }

  /// Wraps requests with error translation and automatic token refresh on 401.
  Future<http.Response> _request(
    Future<http.Response> Function() performRequest, {
    bool isRetry = false,
    String path = '',
  }) async {
    try {
      final response = await performRequest();
      final isAuthRoute = path.contains('/auth/');

      if (response.statusCode == 401 &&
          !isRetry &&
          !isAuthRoute &&
          _refreshToken != null) {
        final refreshed = await _tryRefreshTokens();
        if (refreshed) {
          // Retry the original request once with new credentials
          return await _request(performRequest, isRetry: true, path: path);
        } else {
          onSessionExpired?.call();
        }
      }

      return response;
    } on SocketException catch (e, stack) {
      AppLogger.error('Network offline / SocketException', error: e, stackTrace: stack, endpoint: path);
      final appError = ErrorMapper.fromException(e, stack);
      throw ApiException(appError.userMessage, 0, appError: appError);
    } on TimeoutException catch (e, stack) {
      AppLogger.error('Request timed out', error: e, stackTrace: stack, endpoint: path);
      final appError = ErrorMapper.fromException(e, stack);
      throw ApiException(appError.userMessage, 408, appError: appError);
    } on http.ClientException catch (e, stack) {
      AppLogger.error('ClientException during request', error: e, stackTrace: stack, endpoint: path);
      final appError = ErrorMapper.fromException(e, stack);
      throw ApiException(appError.userMessage, 0, appError: appError);
    } catch (e, stack) {
      if (e is ApiException) rethrow;
      AppLogger.error('Unhandled request exception', error: e, stackTrace: stack, endpoint: path);
      final appError = ErrorMapper.fromException(e, stack);
      throw ApiException(appError.userMessage, 0, appError: appError);
    }
  }

  /// Attempts token refresh in a thread-safe manner (deduplicating concurrent callers).
  Future<bool> _tryRefreshTokens() async {
    if (_refreshFuture != null) {
      return await _refreshFuture!;
    }
    if (_refreshToken == null) {
      return false;
    }

    _refreshFuture = refreshWithToken(_refreshToken!);
    try {
      return await _refreshFuture!;
    } finally {
      _refreshFuture = null;
    }
  }

  /// Public method to refresh the session with a known refresh token.
  Future<bool> refreshWithToken(String token) async {
    try {
      final response = await _httpClient.post(
        Uri.parse('${AppConfig.apiBaseUrl}/auth/refresh'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refreshToken': token, 'clientType': 'mobile'}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        final newAccessToken = data['accessToken'] as String;
        final newRefreshToken = data['refreshToken'] as String;

        _accessToken = newAccessToken;
        _refreshToken = newRefreshToken;

        onTokensRefreshed?.call(newAccessToken, newRefreshToken);
        return true;
      }
    } catch (e) {
      AppLogger.warn('Token refresh failed', {'error': e.toString()});
    }

    clearTokens();
    return false;
  }

  Map<String, dynamic> _decodeResponse(http.Response response) {
    Map<String, dynamic> body = {};
    try {
      final decoded = jsonDecode(response.body);
      if (decoded is Map<String, dynamic>) {
        body = decoded;
      } else if (decoded is List) {
        body = {'data': decoded};
      }
    } catch (_) {
      body = {'error': response.body};
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }

    final appError = ErrorMapper.fromResponse(response);
    AppLogger.error(
      'API Error Response',
      statusCode: response.statusCode,
      endpoint: response.request?.url.path,
      context: {'errorType': appError.type.name, 'code': appError.errorCode},
    );

    throw ApiException(
      appError.userMessage,
      response.statusCode,
      appError: appError,
      rawBody: body,
    );
  }
}

/// Thrown when an API call fails with HTTP status code or client failure.
class ApiException implements Exception {
  final String message;
  final int statusCode;
  final AppError? appError;
  final Map<String, dynamic>? rawBody;

  ApiException(
    this.message,
    this.statusCode, {
    this.appError,
    this.rawBody,
  });

  /// User-facing message in English or Telugu.
  String userMessage([bool isTelugu = false]) {
    if (appError != null) return appError!.message(isTelugu);
    return message;
  }

  @override
  String toString() => 'ApiException($statusCode): $message';
}

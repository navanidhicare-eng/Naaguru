import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:naaguru_student/core/config.dart';

/// A lightweight HTTP client that attaches the JWT access token
/// to every request and handles JSON serialization.
///
/// This is the single point where Flutter talks to the Naaguru REST API.
class ApiClient {
  final http.Client _httpClient;
  String? _accessToken;
  String? _refreshToken;

  /// Callback invoked when both tokens are cleared (e.g. after logout).
  void Function()? onSessionExpired;

  ApiClient({http.Client? httpClient})
      : _httpClient = httpClient ?? http.Client();

  void setTokens({required String accessToken, required String refreshToken}) {
    _accessToken = accessToken;
    _refreshToken = refreshToken;
  }

  void clearTokens() {
    _accessToken = null;
    _refreshToken = null;
  }

  bool get isAuthenticated => _accessToken != null;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_accessToken != null) 'Authorization': 'Bearer $_accessToken',
      };

  /// Performs a GET request. Returns the decoded JSON body.
  Future<Map<String, dynamic>> get(String path) async {
    final response = await _request(() =>
        _httpClient.get(Uri.parse('${AppConfig.apiBaseUrl}$path'),
            headers: _headers));
    return _decodeResponse(response);
  }

  /// Performs a POST request with a JSON body.
  Future<Map<String, dynamic>> post(String path,
      {Map<String, dynamic>? body}) async {
    final response = await _request(() => _httpClient.post(
          Uri.parse('${AppConfig.apiBaseUrl}$path'),
          headers: _headers,
          body: body != null ? jsonEncode(body) : null,
        ));
    return _decodeResponse(response);
  }

  /// Performs a PATCH request with a JSON body.
  Future<Map<String, dynamic>> patch(String path,
      {Map<String, dynamic>? body}) async {
    final response = await _request(() => _httpClient.patch(
          Uri.parse('${AppConfig.apiBaseUrl}$path'),
          headers: _headers,
          body: body != null ? jsonEncode(body) : null,
        ));
    return _decodeResponse(response);
  }

  /// Wraps every request with automatic token refresh on 401.
  Future<http.Response> _request(
      Future<http.Response> Function() performRequest) async {
    final response = await performRequest();

    if (response.statusCode == 401 && _refreshToken != null) {
      final refreshed = await _tryRefreshTokens();
      if (refreshed) {
        // Retry the original request with new token
        return await performRequest();
      } else {
        onSessionExpired?.call();
      }
    }

    return response;
  }

  /// Attempts to refresh the access token using the stored refresh token.
  Future<bool> _tryRefreshTokens() async {
    try {
      final response = await _httpClient.post(
        Uri.parse('${AppConfig.apiBaseUrl}/auth/refresh'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'refreshToken': _refreshToken,
          'clientType': 'mobile',
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        _accessToken = data['accessToken'] as String;
        _refreshToken = data['refreshToken'] as String;
        return true;
      }
    } catch (_) {
      // Refresh failed — session is expired
    }
    clearTokens();
    return false;
  }

  Map<String, dynamic> _decodeResponse(http.Response response) {
    final body = jsonDecode(response.body) as Map<String, dynamic>;

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    }

    final errorMessage =
        body['error']?.toString() ?? 'Request failed (${response.statusCode})';
    throw ApiException(errorMessage, response.statusCode);
  }
}

/// Thrown when the API returns a non-2xx status code.
class ApiException implements Exception {
  final String message;
  final int statusCode;

  ApiException(this.message, this.statusCode);

  @override
  String toString() => 'ApiException($statusCode): $message';
}

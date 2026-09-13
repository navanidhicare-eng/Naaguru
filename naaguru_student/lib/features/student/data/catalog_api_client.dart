import 'package:naaguru_student/core/api_client.dart';

/// Geographic location returned by GET /catalog/locations.
///
/// Hierarchy: STATE → DISTRICT → MANDAL → LOCALITY
class CatalogLocation {
  final String id;
  final String nameEn;
  final String? nameTe;
  final String type; // STATE | DISTRICT | MANDAL | LOCALITY
  final String? parentId;
  final String? code;

  const CatalogLocation({
    required this.id,
    required this.nameEn,
    this.nameTe,
    required this.type,
    this.parentId,
    this.code,
  });

  factory CatalogLocation.fromJson(Map<String, dynamic> json) {
    return CatalogLocation(
      id: json['id'] as String,
      nameEn: json['nameEn'] as String? ?? '',
      nameTe: json['nameTe'] as String?,
      type: json['type'] as String? ?? '',
      parentId: json['parentId'] as String?,
      code: json['code'] as String?,
    );
  }

  String displayName(bool isTelugu) {
    if (isTelugu && nameTe != null && nameTe!.isNotEmpty) return nameTe!;
    return nameEn;
  }
}

/// Model for a school returned by the catalog API.
///
/// Backend contract (GET /catalog/schools):
///   id          — UUID
///   nameEn      — English school name
///   nameTe      — Telugu school name (may be null)
///   locationId  — parent locality UUID
///   partnershipStatus — always PARTNER for student-visible results
class CatalogSchool {
  final String id;
  final String nameEn;
  final String? nameTe;
  final String? locationId;

  const CatalogSchool({
    required this.id,
    required this.nameEn,
    this.nameTe,
    this.locationId,
  });

  factory CatalogSchool.fromJson(Map<String, dynamic> json) {
    return CatalogSchool(
      id: json['id'] as String,
      nameEn: json['nameEn'] as String? ?? '',
      nameTe: json['nameTe'] as String?,
      locationId: json['locationId'] as String?,
    );
  }
}

/// Communicates with the public Catalog REST API for school data.
///
/// Backend contracts used:
///   GET /catalog/schools?search=QUERY  → List of CatalogSchool
///     - No auth required.
///     - Returns only ACTIVE + PARTNER schools.
///     - search: optional ILIKE filter on school name.
class CatalogApiClient {
  final ApiClient _apiClient;

  CatalogApiClient({required ApiClient apiClient}) : _apiClient = apiClient;

  /// Fetches partner schools, optionally filtered by locationId and name search.
  ///
  /// Only returns schools that the backend considers student-visible
  /// (ACTIVE status + PARTNER partnershipStatus). The Flutter layer
  /// does NOT duplicate or weaken this rule.
  Future<List<CatalogSchool>> getSchools({
    String? search,
    String? locationId,
  }) async {
    final params = StringBuffer('/catalog/schools?');
    if (locationId != null && locationId.trim().isNotEmpty) {
      params.write('locationId=${Uri.encodeComponent(locationId.trim())}&');
    }
    if (search != null && search.trim().isNotEmpty) {
      params.write('search=${Uri.encodeComponent(search.trim())}&');
    }
    final result = await _apiClient.get(params.toString());

    // The API returns a JSON array wrapped as {'data': [...]} by ApiClient.
    final rawList = result['data'] as List<dynamic>?;
    if (rawList == null) return [];
    return rawList
        .whereType<Map<String, dynamic>>()
        .map(CatalogSchool.fromJson)
        .toList();
  }

  /// Fetches student-visible locations from GET /catalog/locations.
  ///
  /// Parameters mirror the backend query string:
  ///   type     — one of STATE, DISTRICT, MANDAL, LOCALITY (optional)
  ///   parentId — UUID of the parent location (optional)
  ///
  /// Returns only ACTIVE locations as enforced by the backend.
  /// Flutter does NOT apply additional filtering.
  Future<List<CatalogLocation>> getLocations({
    String? type,
    String? parentId,
  }) async {
    final params = StringBuffer('/catalog/locations?');
    if (type != null) params.write('type=$type&');
    if (parentId != null) params.write('parentId=${Uri.encodeComponent(parentId)}&');
    final result = await _apiClient.get(params.toString());
    final rawList = result['data'] as List<dynamic>?;
    if (rawList == null) return [];
    return rawList
        .whereType<Map<String, dynamic>>()
        .map(CatalogLocation.fromJson)
        .toList();
  }
}

import 'package:naaguru_student/core/api_client.dart';

/// Communicates with the College REST API.
///
/// Backend contract:
///   GET  /colleges?[streamCode=&district=&city=&requiresHostel=&requiresBoysHostel=&requiresGirlsHostel=&maxFee=]
///   GET  /colleges/:id
class CollegeApiClient {
  final ApiClient _apiClient;

  CollegeApiClient({required ApiClient apiClient}) : _apiClient = apiClient;

  /// Searches active verified colleges with the given criteria.
  Future<List<Map<String, dynamic>>> searchColleges({
    String? streamCode,
    String? district,
    String? city,
    bool? requiresHostel,
    bool? requiresBoysHostel,
    bool? requiresGirlsHostel,
    int? maxFee,
  }) async {
    final queryParams = <String, String>{};

    if (streamCode != null && streamCode.isNotEmpty) {
      queryParams['streamCode'] = streamCode;
    }
    if (district != null && district.isNotEmpty) {
      queryParams['district'] = district;
    }
    if (city != null && city.isNotEmpty) {
      queryParams['city'] = city;
    }
    if (requiresHostel == true) {
      queryParams['requiresHostel'] = 'true';
    }
    if (requiresBoysHostel == true) {
      queryParams['requiresBoysHostel'] = 'true';
    }
    if (requiresGirlsHostel == true) {
      queryParams['requiresGirlsHostel'] = 'true';
    }
    if (maxFee != null && maxFee > 0) {
      queryParams['maxFee'] = maxFee.toString();
    }

    String path = '/colleges';
    if (queryParams.isNotEmpty) {
      final queryString = queryParams.entries
          .map((e) => '${Uri.encodeComponent(e.key)}=${Uri.encodeComponent(e.value)}')
          .join('&');
      path += '?$queryString';
    }

    final response = await _apiClient.get(path);
    if (response['data'] is List) {
      return (response['data'] as List)
          .map((e) => Map<String, dynamic>.from(e as Map))
          .toList();
    } else if (response.containsKey('error')) {
      throw ApiException(response['error'] as String, 500);
    }
    return [];
  }

  /// Fetches a single college's public profile by its UUID.
  Future<Map<String, dynamic>> getCollegeById(String id) async {
    return await _apiClient.get('/colleges/$id');
  }
}

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/features/student/data/catalog_api_client.dart';

void main() {
  testWidgets('debug locations API', (tester) async {
    final mockHttpClient = MockClient((request) async {
      print('REQUEST URL: ${request.url}');
      print('QUERY PARAMS: ${request.url.queryParameters}');
      if (request.url.path.contains('/catalog/locations')) {
        return http.Response(jsonEncode({
          'data': [
            {'id': 'state-1', 'nameEn': 'Andhra Pradesh', 'nameTe': 'ఆంధ్రప్రదేశ్', 'type': 'STATE'}
          ]
        }), 200);
      }
      return http.Response('ok', 200);
    });
    
    final apiClient = ApiClient(httpClient: mockHttpClient);
    final catalogApiClient = CatalogApiClient(apiClient: apiClient);
    
    try {
      final locs = await catalogApiClient.getLocations(type: 'STATE');
      print('LOCS COUNT: ${locs.length}');
      if (locs.isNotEmpty) {
        print('FIRST LOC: ${locs.first.nameEn}');
      }
    } catch (e, st) {
      print('ERROR: $e\n$st');
    }
  });
}

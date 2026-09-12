import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';

class MockApiClient extends ApiClient {
  String? lastGetPath;
  Map<String, dynamic> responseToReturn = {};

  @override
  Future<Map<String, dynamic>> get(String path) async {
    lastGetPath = path;
    return responseToReturn;
  }
}

void main() {
  late MockApiClient mockApi;
  late CollegeApiClient client;

  setUp(() {
    mockApi = MockApiClient();
    client = CollegeApiClient(apiClient: mockApi);
  });

  test('searchColleges formats query parameters correctly', () async {
    mockApi.responseToReturn = {
      'data': [
        {
          'id': 'col-1',
          'name': 'Sri Chaitanya Junior College',
          'city': 'Vijayawada',
          'district': 'Krishna',
          'hasBoysHostel': true,
        }
      ]
    };

    final results = await client.searchColleges(
      streamCode: 'MPC',
      district: 'Krishna',
      city: 'Vijayawada',
      requiresHostel: true,
      maxFee: 50000,
    );

    expect(results.length, 1);
    expect(results.first['name'], 'Sri Chaitanya Junior College');
    expect(mockApi.lastGetPath, contains('/colleges?'));
    expect(mockApi.lastGetPath, contains('streamCode=MPC'));
    expect(mockApi.lastGetPath, contains('district=Krishna'));
    expect(mockApi.lastGetPath, contains('city=Vijayawada'));
    expect(mockApi.lastGetPath, contains('requiresHostel=true'));
    expect(mockApi.lastGetPath, contains('maxFee=50000'));
  });

  test('getCollegeById calls correct path', () async {
    mockApi.responseToReturn = {
      'id': 'uuid-123',
      'name': 'Narayana Junior College',
    };

    final college = await client.getCollegeById('uuid-123');
    expect(mockApi.lastGetPath, '/colleges/uuid-123');
    expect(college['name'], 'Narayana Junior College');
  });
}

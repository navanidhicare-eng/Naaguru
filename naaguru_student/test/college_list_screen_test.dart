import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';
import 'package:naaguru_student/features/college/presentation/college_list_screen.dart';

class MockCollegeApiClient extends ApiClient {
  final List<Map<String, dynamic>> colleges;

  MockCollegeApiClient({required this.colleges});

  @override
  Future<Map<String, dynamic>> get(String path) async {
    return {'data': colleges};
  }
}

void main() {
  testWidgets('CollegeListScreen displays returned colleges and badges', (WidgetTester tester) async {
    final client = CollegeApiClient(
      apiClient: MockCollegeApiClient(colleges: [
        {
          'id': 'c-1',
          'name': 'Sri Chaitanya Junior College',
          'city': 'Vijayawada',
          'district': 'Krishna',
          'ownershipType': 'PRIVATE',
          'hasBoysHostel': true,
          'hasGirlsHostel': true,
          'offerings': [
            {'streamCode': 'MPC', 'tuitionFee': 45000},
            {'streamCode': 'BIPC', 'tuitionFee': 45000},
          ],
          'minFee': 45000,
        }
      ]),
    );

    await tester.pumpWidget(MaterialApp(
      home: CollegeListScreen(
        collegeApiClient: client,
        pathway: 'Intermediate',
        streamCode: 'MPC',
      ),
    ));
    await tester.pumpAndSettle();

    expect(find.text('Sri Chaitanya Junior College'), findsOneWidget);
    expect(find.text('Vijayawada, Krishna'), findsOneWidget);
    expect(find.text('Boys & Girls Hostel'), findsOneWidget);
    expect(find.textContaining('MPC'), findsWidgets);
    expect(find.text('View Details'), findsOneWidget);
  });

  testWidgets('CollegeListScreen displays empty state when no colleges found', (WidgetTester tester) async {
    final client = CollegeApiClient(
      apiClient: MockCollegeApiClient(colleges: []),
    );

    await tester.pumpWidget(MaterialApp(
      home: CollegeListScreen(
        collegeApiClient: client,
        pathway: 'Intermediate',
      ),
    ));
    await tester.pumpAndSettle();

    expect(find.text('No Matching Colleges Found'), findsOneWidget);
    expect(find.text('Adjust Preferences'), findsOneWidget);
  });
}

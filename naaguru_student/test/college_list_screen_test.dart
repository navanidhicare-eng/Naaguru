import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';
import 'package:naaguru_student/features/college/presentation/college_list_screen.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';

class MockCollegeApiClient extends ApiClient {
  final List<Map<String, dynamic>> colleges;

  MockCollegeApiClient({required this.colleges});

  @override
  Future<Map<String, dynamic>> get(String path) async {
    return {'data': colleges};
  }
}

void main() {
  testWidgets('CollegeListScreen displays returned colleges and Stitch components', (
    WidgetTester tester,
  ) async {
    final client = CollegeApiClient(
      apiClient: MockCollegeApiClient(
        colleges: [
          {
            'id': 'c-1',
            'name': 'Sri Chaitanya Junior College',
            'matchedBranchId': 'branch-1',
            'branches': [
              {
                'id': 'branch-1',
                'name': 'MVP Colony Campus',
                'locationName': 'MVP Colony, Visakhapatnam',
                'hostel': {'hasBoysHostel': true, 'hasGirlsHostel': true},
                'offerings': [
                  {'streamCode': 'MPC', 'tuitionFee': 65000},
                  {'streamCode': 'BIPC', 'tuitionFee': 65000},
                ],
              },
            ],
          },
        ],
      ),
    );

    await tester.pumpWidget(
      MaterialApp(
        home: CollegeListScreen(
          studentApiClient: StudentApiClient(apiClient: ApiClient()),
          collegeApiClient: client,
          pathway: 'Intermediate',
          streamCode: 'MPC',
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Naaguru'), findsOneWidget);
    expect(find.text('Find the right college for you'), findsOneWidget);
    expect(find.text('Sri Chaitanya Junior College'), findsOneWidget);
    expect(find.text('MVP Colony, Visakhapatnam'), findsOneWidget);
    expect(find.text('Verified by Naaguru'), findsOneWidget);
    expect(find.text('View details'), findsOneWidget);
  });

  testWidgets('CollegeListScreen displays empty state when no colleges found', (
    WidgetTester tester,
  ) async {
    final client = CollegeApiClient(
      apiClient: MockCollegeApiClient(colleges: []),
    );

    await tester.pumpWidget(
      MaterialApp(
        home: CollegeListScreen(
          studentApiClient: StudentApiClient(apiClient: ApiClient()),
          collegeApiClient: client,
          pathway: 'Intermediate',
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('No colleges found nearby'), findsOneWidget);
    expect(find.text('Change location'), findsOneWidget);
  });

  testWidgets('CollegeListScreen filters results via search input', (
    WidgetTester tester,
  ) async {
    final client = CollegeApiClient(
      apiClient: MockCollegeApiClient(
        colleges: [
          {
            'id': 'c-1',
            'name': 'Sri Chaitanya Junior College',
            'branches': [
              {
                'id': 'b-1',
                'name': 'Main Branch',
                'locationName': 'Visakhapatnam',
              },
            ],
          },
          {
            'id': 'c-2',
            'name': 'Narayana Junior College',
            'branches': [
              {
                'id': 'b-2',
                'name': 'City Branch',
                'locationName': 'Vijayawada',
              },
            ],
          },
        ],
      ),
    );

    await tester.pumpWidget(
      MaterialApp(
        home: CollegeListScreen(
          studentApiClient: StudentApiClient(apiClient: ApiClient()),
          collegeApiClient: client,
          pathway: 'Intermediate',
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Sri Chaitanya Junior College'), findsOneWidget);
    expect(find.text('Narayana Junior College'), findsOneWidget);

    // Search for "Narayana"
    await tester.enterText(find.byType(TextField), 'Narayana');
    await tester.pumpAndSettle();

    expect(find.text('Sri Chaitanya Junior College'), findsNothing);
    expect(find.text('Narayana Junior College'), findsOneWidget);
  });
}

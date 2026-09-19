import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';
import 'package:naaguru_student/features/student/data/student_lead_dto.dart';
import 'package:naaguru_student/features/student/presentation/my_leads_screen.dart';

class MockStudentApiClient extends StudentApiClient {
  MockStudentApiClient() : super(apiClient: ApiClient());

  List<StudentLeadDto>? mockLeads;
  Object? mockError;
  int getStudentLeadsCallCount = 0;

  @override
  Future<List<StudentLeadDto>> getStudentLeads() async {
    getStudentLeadsCallCount++;
    if (mockError != null) {
      throw mockError!;
    }
    if (mockLeads != null) {
      return mockLeads!;
    }
    return [];
  }
}

void main() {
  group('MyLeadsScreen', () {
    late MockStudentApiClient mockClient;

    setUp(() {
      mockClient = MockStudentApiClient();
    });

    Widget createWidgetUnderTest() {
      return MaterialApp(
        routes: {
          '/home': (context) => const Scaffold(body: Text('Home Screen')),
        },
        home: MyLeadsScreen(studentApiClient: mockClient),
      );
    }

    testWidgets('shows loading state initially', (tester) async {
      mockClient.mockLeads = [];
      // Use a delayed future to ensure the FutureBuilder is in loading state
      mockClient.mockError = null; // Ensure we don't throw
      
      await tester.pumpWidget(createWidgetUnderTest());
      
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      await tester.pumpAndSettle();
    });

    testWidgets('shows empty state when no leads', (tester) async {
      mockClient.mockLeads = [];
      
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      expect(find.text('No requests yet'), findsOneWidget);
      expect(find.text('Discover Colleges'), findsOneWidget);
    });

    testWidgets('shows error state and retry works', (tester) async {
      mockClient.mockError = Exception('Failed');
      
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      expect(find.text('Failed to load requests.'), findsOneWidget);
      expect(find.text('Retry'), findsOneWidget);
      expect(mockClient.getStudentLeadsCallCount, 1);

      // Fix error and retry
      mockClient.mockError = null;
      mockClient.mockLeads = [];
      
      await tester.tap(find.text('Retry'));
      await tester.pumpAndSettle();

      expect(mockClient.getStudentLeadsCallCount, 2);
      expect(find.text('No requests yet'), findsOneWidget);
    });

    testWidgets('shows populated state and renders correctly', (tester) async {
      mockClient.mockLeads = [
        const StudentLeadDto(
          id: 'lead1',
          collegeId: 'c1',
          branchId: 'b1',
          streamCode: 'MPC',
          status: 'NEW',
          createdAt: '2026-09-19T10:00:00Z',
          collegeName: 'Awesome College',
          branchName: 'East Campus',
        ),
        const StudentLeadDto(
          id: 'lead2',
          collegeId: 'c2',
          branchId: 'b2',
          streamCode: null,
          status: 'CONTACTED',
          createdAt: '2026-09-19T11:00:00Z',
          collegeName: null, // Null test
          branchName: null,  // Null test
        )
      ];
      
      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      // Lead 1 asserts
      expect(find.text('Awesome College'), findsOneWidget);
      expect(find.text('East Campus'), findsOneWidget);
      expect(find.text('Stream: MPC'), findsOneWidget);
      expect(find.text('Request Sent'), findsOneWidget);

      // Lead 2 asserts (null fallback)
      expect(find.text('Unknown College'), findsOneWidget);
      expect(find.text('Unknown Branch'), findsOneWidget);
      expect(find.text('College Contacted'), findsOneWidget);
      
      // Ensure raw UUIDs are not exposed
      expect(find.text('c2'), findsNothing);
      expect(find.text('b2'), findsNothing);
    });
  });
}

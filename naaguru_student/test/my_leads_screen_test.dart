import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/features/college/presentation/college_detail_screen.dart';
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
  group('MyLeadsScreen Production State Handling', () {
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

    // 1. Initial loading displays skeleton cards
    testWidgets('1. Initial loading displays skeleton cards without layout shift', (tester) async {
      mockClient.mockLeads = [];
      mockClient.mockError = null;

      await tester.pumpWidget(createWidgetUnderTest());

      // While future is waiting, skeleton cards are rendered
      expect(find.byType(ListView), findsOneWidget);
      expect(find.text('No enquiries yet'), findsNothing);
      expect(find.text('Unable to load enquiries'), findsNothing);

      await tester.pumpAndSettle();
    });

    // 2. Non-empty API response displays actual lead data and correct counts
    testWidgets('2. Non-empty API response displays actual lead data and correct computed counts', (tester) async {
      mockClient.mockLeads = [
        const StudentLeadDto(
          id: 'lead-uuid-1',
          collegeId: 'c1',
          branchId: 'b1',
          streamCode: 'MPC',
          status: 'NEW',
          createdAt: '2025-02-24T10:00:00Z',
          collegeName: 'Sri Chaitanya Jr College',
          branchName: 'MVP Colony, Visakhapatnam',
        ),
        const StudentLeadDto(
          id: 'lead-uuid-2',
          collegeId: 'c2',
          branchId: 'b2',
          streamCode: 'BiPC',
          status: 'CONTACTED',
          createdAt: '2025-02-22T11:00:00Z',
          collegeName: 'Narayana Junior College',
          branchName: 'Benz Circle, Vijayawada',
        ),
      ];

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      // Header and dashboard title
      expect(find.text('Your college enquiries'), findsOneWidget);

      // KPI computed counts
      expect(find.text('2'), findsOneWidget); // Total count
      expect(find.text('1'), findsNWidgets(2)); // 1 Sent, 1 Contacted
      expect(find.text('Total'), findsOneWidget);
      expect(find.text('Sent'), findsOneWidget);
      expect(find.text('Contacted'), findsOneWidget); // KPI label
      expect(find.text('Started'), findsOneWidget);

      // Actual Lead Card data
      expect(find.text('Sri Chaitanya Jr College'), findsOneWidget);
      expect(find.text('MVP Colony, Visakhapatnam'), findsOneWidget);
      expect(find.text('MPC'), findsOneWidget);
      expect(find.text('Request Sent'), findsOneWidget);

      expect(find.text('Narayana Junior College'), findsOneWidget);
      expect(find.text('Benz Circle, Vijayawada'), findsOneWidget);
      expect(find.text('BiPC'), findsOneWidget);
      expect(find.text('College Contacted'), findsOneWidget);
    });

    // 3. Empty API response displays the empty state and Explore Colleges action
    testWidgets('3. Empty API response displays the empty state and Explore Colleges navigation action', (tester) async {
      mockClient.mockLeads = [];

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      expect(find.text('No enquiries yet'), findsOneWidget);
      expect(
        find.text('Explore colleges and request counselling to keep track of your admission journey here.'),
        findsOneWidget,
      );
      expect(find.text('Explore Colleges'), findsOneWidget);

      // Tap Explore Colleges
      await tester.tap(find.text('Explore Colleges'));
      await tester.pumpAndSettle();

      expect(find.text('Home Screen'), findsOneWidget);
    });

    // 4. API failure displays the error state, not the empty state
    testWidgets('4. API failure displays error state with recovery action, not empty state', (tester) async {
      mockClient.mockError = Exception('Network Connection Error');

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      expect(find.text('Unable to load enquiries'), findsOneWidget);
      expect(find.text('Retry'), findsOneWidget);
      expect(find.text('No enquiries yet'), findsNothing);
      expect(find.text('Explore Colleges'), findsNothing);
    });

    // 5. Retry performs a new API request
    testWidgets('5. Retry re-executes the API request and transitions to loaded state', (tester) async {
      mockClient.mockError = Exception('Server Timeout');

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      expect(mockClient.getStudentLeadsCallCount, 1);
      expect(find.text('Unable to load enquiries'), findsOneWidget);

      // Resolve error with successful data
      mockClient.mockError = null;
      mockClient.mockLeads = [
        const StudentLeadDto(
          id: 'lead-uuid-retry',
          collegeId: 'c1',
          branchId: 'b1',
          streamCode: 'MPC',
          status: 'NEW',
          createdAt: '2025-02-24T10:00:00Z',
          collegeName: 'Recovered College',
          branchName: 'Main Campus',
        ),
      ];

      await tester.tap(find.text('Retry'));
      await tester.pumpAndSettle();

      expect(mockClient.getStudentLeadsCallCount, 2);
      expect(find.text('Recovered College'), findsOneWidget);
      expect(find.text('Unable to load enquiries'), findsNothing);
    });

    // 6. Status filters show the correct matching leads
    testWidgets('6. Status filters update displayed list according to selected status chip', (tester) async {
      mockClient.mockLeads = [
        const StudentLeadDto(
          id: 'lead-1',
          collegeId: 'c1',
          branchId: 'b1',
          streamCode: 'MPC',
          status: 'NEW',
          createdAt: '2025-02-24T10:00:00Z',
          collegeName: 'First New College',
          branchName: 'Campus A',
        ),
        const StudentLeadDto(
          id: 'lead-2',
          collegeId: 'c2',
          branchId: 'b2',
          streamCode: 'BiPC',
          status: 'CONTACTED',
          createdAt: '2025-02-22T11:00:00Z',
          collegeName: 'Second Contacted College',
          branchName: 'Campus B',
        ),
      ];

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      // Initially both colleges are shown
      expect(find.text('First New College'), findsOneWidget);
      expect(find.text('Second Contacted College'), findsOneWidget);

      // Filter by 'Request Sent (1)'
      await tester.tap(find.text('Request Sent (1)'));
      await tester.pumpAndSettle();

      expect(find.text('First New College'), findsOneWidget);
      expect(find.text('Second Contacted College'), findsNothing);

      // Reset filter to 'All (2)'
      await tester.tap(find.text('All (2)'));
      await tester.pumpAndSettle();

      expect(find.text('First New College'), findsOneWidget);
      expect(find.text('Second Contacted College'), findsOneWidget);
    });

    // 7. View College navigates using the correct college identifier
    testWidgets('7. View College navigates using the correct college identifier', (tester) async {
      mockClient.mockLeads = [
        const StudentLeadDto(
          id: 'lead-1',
          collegeId: 'target-college-123',
          branchId: 'b1',
          streamCode: 'MPC',
          status: 'NEW',
          createdAt: '2025-02-24T10:00:00Z',
          collegeName: 'Target College',
          branchName: 'Main Campus',
        ),
      ];

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      expect(find.text('View College'), findsOneWidget);

      await tester.tap(find.text('View College'));
      await tester.pumpAndSettle();

      // CollegeDetailScreen pushed with target collegeId
      expect(find.byType(CollegeDetailScreen), findsOneWidget);
      final detailScreen = tester.widget<CollegeDetailScreen>(find.byType(CollegeDetailScreen));
      expect(detailScreen.collegeId, 'target-college-123');
    });

    // 8. Newly submitted enquiries appear after returning to My Leads / refresh
    testWidgets('8. Pull-to-refresh and returning to My Leads fetches latest enquiries', (tester) async {
      mockClient.mockLeads = [
        const StudentLeadDto(
          id: 'lead-1',
          collegeId: 'c1',
          branchId: 'b1',
          streamCode: 'MPC',
          status: 'NEW',
          createdAt: '2025-02-24T10:00:00Z',
          collegeName: 'Initial College',
          branchName: 'Campus 1',
        ),
      ];

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      expect(find.text('Initial College'), findsOneWidget);
      expect(mockClient.getStudentLeadsCallCount, 1);

      // Simulate new lead submitted and pull-to-refresh
      mockClient.mockLeads = [
        const StudentLeadDto(
          id: 'lead-1',
          collegeId: 'c1',
          branchId: 'b1',
          streamCode: 'MPC',
          status: 'NEW',
          createdAt: '2025-02-24T10:00:00Z',
          collegeName: 'Initial College',
          branchName: 'Campus 1',
        ),
        const StudentLeadDto(
          id: 'lead-2',
          collegeId: 'c2',
          branchId: 'b2',
          streamCode: 'MEC',
          status: 'NEW',
          createdAt: '2025-02-25T10:00:00Z',
          collegeName: 'Newly Added College',
          branchName: 'Campus 2',
        ),
      ];

      // Trigger pull to refresh gesture
      await tester.fling(find.byType(ListView), const Offset(0.0, 300.0), 1000.0);
      await tester.pumpAndSettle();

      expect(mockClient.getStudentLeadsCallCount, 2);
      expect(find.text('Newly Added College'), findsOneWidget);
    });

    // 9. No preview/debug tabs appear in the production screen
    testWidgets('9. No preview/debug tabs appear in the production UI', (tester) async {
      mockClient.mockLeads = [
        const StudentLeadDto(
          id: 'lead-1',
          collegeId: 'c1',
          branchId: 'b1',
          streamCode: 'MPC',
          status: 'NEW',
          createdAt: '2025-02-24T10:00:00Z',
          collegeName: 'College A',
          branchName: 'Campus A',
        ),
      ];

      await tester.pumpWidget(createWidgetUnderTest());
      await tester.pumpAndSettle();

      // Ensure none of the debug/preview tab labels exist anywhere
      expect(find.text('Live API'), findsNothing);
      expect(find.text('Active (3)'), findsNothing);
      expect(find.text('Skeleton'), findsNothing);
      expect(find.text('Empty'), findsNothing);
      expect(find.text('Error'), findsNothing);
    });
  });
}

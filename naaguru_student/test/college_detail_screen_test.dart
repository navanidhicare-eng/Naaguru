import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';
import 'package:naaguru_student/features/college/presentation/college_detail_screen.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';

class MockDetailApiClient extends ApiClient {
  final Map<String, dynamic> responseData;
  bool failPost;

  MockDetailApiClient({required this.responseData, this.failPost = false});

  @override
  Future<Map<String, dynamic>> get(String path) async {
    return responseData;
  }

  @override
  Future<Map<String, dynamic>> post(
    String path, {
    Map<String, dynamic>? body,
  }) async {
    if (failPost) {
      throw ApiException('You already have an active lead for this branch', 409);
    }
    return {
      'id': 'lead-123',
      'collegeId': body?['collegeId'] ?? 'college-uuid-1',
      'branchId': body?['branchId'] ?? 'b-1',
      'streamCode': body?['streamCode'] ?? 'MPC',
      'status': 'CREATED',
      'createdAt': '2026-09-26T12:00:00.000Z',
    };
  }
}

class MockErrorApiClient extends ApiClient {
  @override
  Future<Map<String, dynamic>> get(String path) async {
    throw ApiException('Not found', 404);
  }
}

void main() {
  final fullCollegeData = {
    'id': 'college-uuid-1',
    'name': 'Sri Chaitanya Junior College',
    'description': 'A premier junior college offering MPC and BiPC coaching.',
    'contactPhone': '+918912554433',
    'contactEmail': 'info@srichaitanya.net',
    'website': 'https://srichaitanya.net',
    'ownershipType': 'PRIVATE',
    'branches': [
      {
        'id': 'b-1',
        'name': 'MVP Colony Campus',
        'type': 'MAIN',
        'locationName': 'Visakhapatnam, Andhra Pradesh',
        'address': 'Door No. 4-48/2, MVP Sector 3, Visakhapatnam',
        'hostel': {
          'hasBoysHostel': true,
          'hasGirlsHostel': true,
          'annualHostelFee': 60000,
        },
        'offerings': [
          {'streamCode': 'MPC', 'tuitionFee': 55000},
          {'streamCode': 'BIPC', 'tuitionFee': 60000},
        ],
      },
      {
        'id': 'b-2',
        'name': 'Gajuwaka Campus',
        'type': 'BRANCH',
        'locationName': 'Gajuwaka, Visakhapatnam',
        'address': 'Main Road, Gajuwaka',
        'hostel': {
          'hasBoysHostel': false,
          'hasGirlsHostel': false,
          'annualHostelFee': null,
        },
        'offerings': [
          {'streamCode': 'MEC', 'tuitionFee': 45000},
        ],
      },
    ],
    'media': [
      {
        'id': 'med-1',
        'mediaType': 'IMAGE',
        'url': 'https://example.com/cover.jpg',
        'caption': 'Science Lab',
        'isCover': true,
        'displayOrder': 1,
        'status': 'ACTIVE',
      },
    ],
    'achievements': [
      {
        'id': 'ach-1',
        'studentName': 'Rahul Sharma',
        'exam': 'JEE Advanced',
        'achievement': 'AIR 42',
        'year': 2025,
        'description': 'Scored 310/360 in JEE Advanced',
        'imageUrl': null,
        'displayOrder': 1,
      },
    ],
    'accreditations': [
      {
        'id': 'acc-1',
        'name': 'NAAC A+ Grade',
        'issuingBody': 'National Assessment and Accreditation Council',
        'year': 2023,
        'validUntilYear': 2028,
        'description': 'Accredited with highest academic excellence score.',
        'certificateUrl': 'https://example.com/cert.pdf',
        'verificationUrl': 'https://example.com/verify',
        'displayOrder': 1,
      },
    ],
    'leadership': [
      {
        'id': 'lead-1',
        'name': 'Dr. K. Rao',
        'designation': 'Dean of Academics',
        'bio': 'Over 25 years of educational leadership.',
        'imageUrl': null,
        'displayOrder': 1,
      },
    ],
    'testimonials': [
      {
        'id': 'test-1',
        'personName': 'Ananya Reddy',
        'personType': 'STUDENT',
        'testimonialText': 'The faculty support helped me achieve my goals.',
        'imageUrl': null,
        'displayOrder': 1,
      },
    ],
  };

  testWidgets(
    'CollegeDetailScreen renders Stitch sections, banner, and bottom action bar',
    (WidgetTester tester) async {
      final mockApi = MockDetailApiClient(responseData: fullCollegeData);
      final collegeClient = CollegeApiClient(apiClient: mockApi);
      final studentClient = StudentApiClient(apiClient: mockApi);

      await tester.pumpWidget(
        MaterialApp(
          home: CollegeDetailScreen(
            collegeId: 'college-uuid-1',
            initialData: fullCollegeData,
            collegeApiClient: collegeClient,
            studentApiClient: studentClient,
          ),
        ),
      );
      await tester.pumpAndSettle();

      // 1. Title & Header
      expect(find.text('College Details'), findsOneWidget);
      expect(find.text('Sri Chaitanya Junior College'), findsWidgets);
      expect(find.text('Verified by Naaguru'), findsOneWidget);
      expect(find.text('Private Unaided'), findsOneWidget);

      // 2. Branch selector
      expect(find.text('SELECT CAMPUS / BRANCH'), findsOneWidget);
      expect(find.text('MVP Colony Campus'), findsWidgets);

      // 3. About & Streams
      expect(find.text('ABOUT THIS COLLEGE'), findsOneWidget);
      expect(find.text('STREAMS OFFERED AT THIS BRANCH'), findsOneWidget);
      expect(find.text('MPC'), findsWidgets);
      expect(find.text('BiPC'), findsWidgets);

      // 4. Hostel
      expect(find.text('HOSTEL & ACCOMMODATION'), findsOneWidget);
      expect(find.text('Hostel Available'), findsOneWidget);

      // 5. Bottom Actions
      expect(find.text('Call College'), findsOneWidget);
      expect(find.text('Request Counselling →'), findsOneWidget);
    },
  );

  testWidgets('CollegeDetailScreen toggles Telugu bilingual translations', (
    WidgetTester tester,
  ) async {
    final mockApi = MockDetailApiClient(responseData: fullCollegeData);
    final collegeClient = CollegeApiClient(apiClient: mockApi);
    final studentClient = StudentApiClient(apiClient: mockApi);

    await tester.pumpWidget(
      MaterialApp(
        home: CollegeDetailScreen(
          collegeId: 'college-uuid-1',
          initialData: fullCollegeData,
          collegeApiClient: collegeClient,
          studentApiClient: studentClient,
        ),
      ),
    );
    await tester.pumpAndSettle();

    // Switch language to Telugu
    await tester.tap(find.text('తెలుగు'));
    await tester.pumpAndSettle();

    expect(find.text('కళాశాల వివరాలు'), findsOneWidget);
    expect(find.text('ఈ కళాశాల గురించి'), findsOneWidget);
    expect(find.text('హాస్టల్ వసతి'), findsOneWidget);
    expect(find.text('కాల్ చేయండి'), findsOneWidget);
    expect(find.text('కౌన్సెలింగ్ అభ్యర్థించండి →'), findsOneWidget);
  });

  testWidgets(
    'CollegeDetailScreen opens Request Counselling sheet and submits enquiry with View My Leads action',
    (WidgetTester tester) async {
      final mockApi = MockDetailApiClient(responseData: fullCollegeData);
      final collegeClient = CollegeApiClient(apiClient: mockApi);
      final studentClient = StudentApiClient(apiClient: mockApi);

      await tester.pumpWidget(
        MaterialApp(
          home: CollegeDetailScreen(
            collegeId: 'college-uuid-1',
            initialData: fullCollegeData,
            collegeApiClient: collegeClient,
            studentApiClient: studentClient,
          ),
          routes: {
            '/my-leads': (context) => const Scaffold(body: Center(child: Text('My Leads Screen Loaded'))),
          },
        ),
      );
      await tester.pumpAndSettle();

      // Tap 'Request Counselling →'
      await tester.tap(find.text('Request Counselling →'));
      await tester.pumpAndSettle();

      expect(find.text('Request Academic Counselling'), findsOneWidget);
      expect(find.text('Confirm Counselling Request'), findsOneWidget);

      // Confirm enquiry
      await tester.tap(find.text('Confirm Counselling Request'));
      await tester.pumpAndSettle();

      expect(find.text('Your enquiry has been successfully sent to the college!'), findsOneWidget);
      expect(find.text('View My Leads'), findsOneWidget);

      // Tap 'View My Leads'
      await tester.tap(find.text('View My Leads'));
      await tester.pumpAndSettle();

      expect(find.text('My Leads Screen Loaded'), findsOneWidget);
    },
  );

  testWidgets(
    'CollegeDetailScreen failed / duplicate enquiry does not show View My Leads action',
    (WidgetTester tester) async {
      final mockApi = MockDetailApiClient(responseData: fullCollegeData, failPost: true);
      final collegeClient = CollegeApiClient(apiClient: mockApi);
      final studentClient = StudentApiClient(apiClient: mockApi);

      await tester.pumpWidget(
        MaterialApp(
          home: CollegeDetailScreen(
            collegeId: 'college-uuid-1',
            initialData: fullCollegeData,
            collegeApiClient: collegeClient,
            studentApiClient: studentClient,
          ),
          routes: {
            '/my-leads': (context) => const Scaffold(body: Center(child: Text('My Leads Screen Loaded'))),
          },
        ),
      );
      await tester.pumpAndSettle();

      // Tap 'Request Counselling →'
      await tester.tap(find.text('Request Counselling →'));
      await tester.pumpAndSettle();

      // Confirm enquiry
      await tester.tap(find.text('Confirm Counselling Request'));
      await tester.pumpAndSettle();

      // View My Leads must NOT be shown
      expect(find.text('View My Leads'), findsNothing);
      expect(find.text('My Leads Screen Loaded'), findsNothing);
    },
  );

  testWidgets('CollegeDetailScreen renders error state when fetch fails', (
    WidgetTester tester,
  ) async {
    final mockApi = MockErrorApiClient();
    final collegeClient = CollegeApiClient(apiClient: mockApi);

    await tester.pumpWidget(
      MaterialApp(
        home: CollegeDetailScreen(
          collegeId: 'college-uuid-error',
          collegeApiClient: collegeClient,
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text("We couldn't find the requested information."), findsOneWidget);
    expect(find.text('Retry'), findsOneWidget);
  });
}

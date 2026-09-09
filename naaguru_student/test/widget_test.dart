// This is a basic app launch test.
import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/main.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/features/auth/auth_service.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';

void main() {
  testWidgets('App launches successfully smoke test', (WidgetTester tester) async {
    final apiClient = ApiClient();
    final authService = AuthService(apiClient: apiClient);
    final studentApiClient = StudentApiClient(apiClient: apiClient);

    await tester.pumpWidget(NaaguruStudentApp(
      authService: authService,
      studentApiClient: studentApiClient,
    ));

    // Verify app launches successfully
    expect(find.byType(NaaguruStudentApp), findsOneWidget);
  });
}

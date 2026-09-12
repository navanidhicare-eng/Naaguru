import 'package:flutter_test/flutter_test.dart';
import 'package:lottie/lottie.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Test Lottie loading', (WidgetTester tester) async {
    final lottieFiles = [
      'assets/illustrations/assessment/assessment_progress_10.json',
      'assets/illustrations/assessment/assessment_progress_20.json',
      'assets/illustrations/assessment/assessment_progress_30.json',
      'assets/illustrations/assessment/assessment_complete.json',
    ];

    for (final file in lottieFiles) {
      final composition = await AssetLottie(file).load();
      expect(composition.duration.inMilliseconds, greaterThan(0));
    }
  });
}

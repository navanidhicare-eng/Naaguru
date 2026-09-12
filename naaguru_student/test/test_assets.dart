import 'package:flutter/services.dart';
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
      print('Testing Lottie: $file');
      try {
        final composition = await AssetLottie(file).load();
        print('Success: $file loaded ${composition.duration}');
      } catch (e, stack) {
        print('Error loading $file: $e\n$stack');
      }
    }
  });
}

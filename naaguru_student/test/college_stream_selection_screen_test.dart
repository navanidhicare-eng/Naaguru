import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/features/college/presentation/college_stream_selection_screen.dart';

void main() {
  final List<Map<String, dynamic>> mockPrograms = [
    {"id": "1", "code": "MPC", "nameEn": "MPC (Maths, Physics, Chemistry)", "nameTe": "MPC (గణితం, భౌతిక, రసాయన)", "displayOrder": 1, "status": "ACTIVE"},
    {"id": "2", "code": "BIPC", "nameEn": "BiPC (Biology, Physics, Chemistry)", "nameTe": "BiPC (జీవ, భౌతిక, రసాయన)", "displayOrder": 2, "status": "ACTIVE"},
    {"id": "3", "code": "MEC", "nameEn": "MEC (Maths, Economics, Commerce)", "nameTe": "MEC (గణితం, అర్థ, కామర్స్)", "displayOrder": 3, "status": "ACTIVE"},
    {"id": "4", "code": "CEC", "nameEn": "CEC (Commerce, Economics, Civics)", "nameTe": "CEC (కామర్స్, అర్థ, పౌరనీతి)", "displayOrder": 4, "status": "ACTIVE"}
  ];

  testWidgets('CollegeStreamSelectionScreen renders options and allows selecting stream', (WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp(
      home: CollegeStreamSelectionScreen(
        programs: mockPrograms,
        pathwayCode: 'INTERMEDIATE',
        isTelugu: false,
        onLanguageChanged: (val) {},
      ),
    ));
    await tester.pumpAndSettle();

    expect(find.text('Which stream are you interested in?'), findsOneWidget);
    expect(find.text('MPC'), findsOneWidget);
    expect(find.text('BIPC'), findsOneWidget);
    expect(find.text('Continue →'), findsOneWidget);

    // Initial state: continue should be disabled? The test doesn't check disabled state easily without tapping it,
    // but we can tap MPC.
    await tester.tap(find.text('MPC'));
    await tester.pumpAndSettle();
  });

  testWidgets('CollegeStreamSelectionScreen renders in Telugu', (WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp(
      home: CollegeStreamSelectionScreen(
        programs: mockPrograms,
        pathwayCode: 'INTERMEDIATE',
        isTelugu: true,
        onLanguageChanged: (val) {},
      ),
    ));
    await tester.pumpAndSettle();

    expect(find.text('మీకు ఏ స్ట్రీమ్ అంటే ఆసక్తి?'), findsOneWidget);
    expect(find.text('MPC'), findsOneWidget); // English code is used as title
    expect(find.text('గణితం • భౌతికశాస్త్రం • రసాయనశాస్త్రం'), findsOneWidget);
    expect(find.text('కొనసాగించండి →'), findsOneWidget);
  });
}

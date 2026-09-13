import 'package:flutter/material.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/core/ui/buttons.dart';
import 'package:naaguru_student/core/ui/language_toggle.dart';
import 'package:naaguru_student/features/college/presentation/college_location_preferences_screen.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';

class CollegeStreamSelectionScreen extends StatefulWidget {
  final CollegeApiClient collegeApiClient;
  final List<Map<String, dynamic>> programs;
  final String pathwayCode;
  final bool isTelugu;
  final ValueChanged<bool> onLanguageChanged;

  const CollegeStreamSelectionScreen({
    super.key,
    required this.collegeApiClient,
    required this.programs,
    required this.pathwayCode,
    required this.isTelugu,
    required this.onLanguageChanged,
  });

  @override
  State<CollegeStreamSelectionScreen> createState() => _CollegeStreamSelectionScreenState();
}

class _CollegeStreamSelectionScreenState extends State<CollegeStreamSelectionScreen> {
  late bool _isTelugu;
  String? _selectedStream;

  @override
  void initState() {
    super.initState();
    _isTelugu = widget.isTelugu;
  }

  Map<String, dynamic> _getStreamDetails(String code) {
    if (code == 'MPC') {
      return {
        'subjectsEn': 'Mathematics • Physics • Chemistry',
        'subjectsTe': 'గణితం • భౌతికశాస్త్రం • రసాయనశాస్త్రం',
        'scopeIcon': Icons.architecture,
        'scopeEn': 'Engineering, Architecture, Tech, Pure Sciences',
        'scopeTe': 'ఇంజనీరింగ్, ఆర్కిటెక్చర్, టెక్నాలజీ, ప్యూర్ సైన్సెస్',
      };
    } else if (code == 'BIPC') {
      return {
        'subjectsEn': 'Biology • Physics • Chemistry',
        'subjectsTe': 'జీవశాస్త్రం • భౌతికశాస్త్రం • రసాయనశాస్త్రం',
        'scopeIcon': Icons.medical_services_outlined,
        'scopeEn': 'Medicine, Pharmacy, Biotechnology, Agriculture',
        'scopeTe': 'మెడిసిన్, ఫార్మసీ, బయోటెక్నాలజీ, వ్యవసాయం',
      };
    } else if (code == 'MEC') {
      return {
        'subjectsEn': 'Mathematics • Economics • Commerce',
        'subjectsTe': 'గణితం • అర్థశాస్త్రం • వాణిజ్యశాస్త్రం',
        'scopeIcon': Icons.show_chart,
        'scopeEn': 'Chartered Accountancy, Finance, Business Analytics',
        'scopeTe': 'చార్టర్డ్ అకౌంటెన్సీ, ఫైనాన్స్, బిజినెస్ అనలిటిక్స్',
      };
    } else if (code == 'CEC') {
      return {
        'subjectsEn': 'Civics • Economics • Commerce',
        'subjectsTe': 'పౌరశాస్త్రం • అర్థశాస్త్రం • వాణిజ్యశాస్త్రం',
        'scopeIcon': Icons.account_balance_outlined,
        'scopeEn': 'Law, Civil Services, Management, Banking',
        'scopeTe': 'లా, సివిల్ సర్వీసెస్, మేనేజ్‌మెంట్, బ్యాంకింగ్',
      };
    }
    return {
      'subjectsEn': 'General Studies',
      'subjectsTe': 'సాధారణ అధ్యయనాలు',
      'scopeIcon': Icons.work_outline,
      'scopeEn': 'Various fields',
      'scopeTe': 'వివిధ రంగాలు',
    };
  }

  void _onContinue() {
    if (_selectedStream == null) return;
    
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CollegeLocationPreferencesScreen(
          collegeApiClient: widget.collegeApiClient,
          pathwayCode: widget.pathwayCode,
          programCode: _selectedStream!,
          isTelugu: _isTelugu,
          onLanguageChanged: widget.onLanguageChanged,
        ),
      ),
    );
  }

  Widget _buildProgressSegment(bool isActive) {
    return Container(
      height: 4,
      decoration: BoxDecoration(
        color: isActive ? NaaguruTheme.primaryDark : NaaguruTheme.muted.withAlpha(50),
        borderRadius: BorderRadius.circular(2),
      ),
    );
  }

  Widget _buildProgressIndicator() {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Text(
                    _isTelugu ? 'దశ 2/4' : 'Step 2 of 4',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    _isTelugu ? '50% పూర్తయింది' : '50% Completed',
                    style: const TextStyle(fontSize: 12, color: NaaguruTheme.muted),
                  ),
                ],
              ),
              GestureDetector(
                onTap: () => Navigator.of(context).pop(),
                child: Row(
                  children: [
                    const Icon(Icons.school_outlined, size: 14, color: NaaguruTheme.primaryDark),
                    const SizedBox(width: 4),
                    Text(
                      widget.pathwayCode == 'INTERMEDIATE' ? 'Inter' : widget.pathwayCode,
                      style: const TextStyle(fontSize: 12, color: NaaguruTheme.primaryDark),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _isTelugu ? 'మార్చు' : 'Change',
                      style: const TextStyle(
                        fontSize: 12, 
                        color: NaaguruTheme.primaryDark,
                        decoration: TextDecoration.underline,
                      ),
                    ),
                  ],
                ),
              )
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            children: [
              Expanded(child: _buildProgressSegment(true)),
              const SizedBox(width: 4),
              Expanded(child: _buildProgressSegment(true)),
              const SizedBox(width: 4),
              Expanded(child: _buildProgressSegment(false)),
              const SizedBox(width: 4),
              Expanded(child: _buildProgressSegment(false)),
            ],
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    // Only display active programs
    final activePrograms = widget.programs.where((p) => p['status'] == 'ACTIVE').toList();

    return Scaffold(
      backgroundColor: NaaguruTheme.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: NaaguruTheme.primaryDark, size: 20),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Row(
          children: [
            Icon(Icons.school, color: NaaguruTheme.primaryDark),
            SizedBox(width: 8),
            Text(
              'Naaguru',
              style: TextStyle(
                color: NaaguruTheme.primaryDark,
                fontWeight: FontWeight.bold,
                fontSize: 20,
              ),
            ),
          ],
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 12),
            child: Center(
              child: LanguageToggle(
                isTelugu: _isTelugu,
                onToggle: (val) {
                  setState(() => _isTelugu = val);
                  widget.onLanguageChanged(val);
                },
              ),
            ),
          ),
          GestureDetector(
            onTap: () {},
            child: const CircleAvatar(
              radius: 16,
              backgroundColor: NaaguruTheme.primaryLight,
              child: Icon(Icons.person, size: 20, color: NaaguruTheme.primaryDark),
            ),
          ),
          const SizedBox(width: 20),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
             _buildProgressIndicator(),
             Expanded(
               child: SingleChildScrollView(
                 padding: const EdgeInsets.all(20),
                 child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                       Row(
                         crossAxisAlignment: CrossAxisAlignment.start,
                         children: [
                           const Icon(Icons.explore_outlined, color: NaaguruTheme.primaryDark),
                           const SizedBox(width: 12),
                           Expanded(
                             child: Text(
                               _isTelugu ? 'మీకు ఏ స్ట్రీమ్ అంటే ఆసక్తి?' : 'Which stream are you interested in?',
                               style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark),
                             ),
                           ),
                         ],
                       ),
                       const SizedBox(height: 8),
                       Text(
                         _isTelugu 
                             ? 'మీరు అన్వేషించాలనుకుంటున్న స్ట్రీమ్‌ను ఎంచుకోండి.' 
                             : 'Choose the stream you\'d like to explore.',
                         style: const TextStyle(fontSize: 15, color: NaaguruTheme.muted),
                       ),
                       const SizedBox(height: 24),
                       
                       // Assessment-Independent Notice
                       Container(
                         padding: const EdgeInsets.all(16),
                         decoration: BoxDecoration(
                           color: NaaguruTheme.primaryLight.withAlpha(100),
                           borderRadius: BorderRadius.circular(12),
                         ),
                         child: Row(
                           children: [
                              const Icon(Icons.verified_user_outlined, color: NaaguruTheme.primaryDark, size: 20),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  _isTelugu 
                                      ? 'అసెస్‌మెంట్ ఫలితాలతో సంబంధం లేకుండా మీరు ఎంచుకోవచ్చు.'
                                      : 'You can choose independently of any assessment results.',
                                  style: const TextStyle(fontSize: 13, color: NaaguruTheme.text),
                                ),
                              ),
                           ],
                         ),
                       ),
                       const SizedBox(height: 24),

                       // Stream Cards
                       ...activePrograms.map((program) {
                         final code = program['code'] as String;
                         final details = _getStreamDetails(code);
                         final isSelected = _selectedStream == code;

                         return GestureDetector(
                           onTap: () => setState(() => _selectedStream = code),
                           child: Container(
                             margin: const EdgeInsets.only(bottom: 12),
                             padding: const EdgeInsets.all(16),
                             decoration: BoxDecoration(
                               color: isSelected ? NaaguruTheme.primaryLight.withAlpha(50) : Colors.white,
                               borderRadius: BorderRadius.circular(16),
                               border: Border.all(
                                 color: isSelected ? NaaguruTheme.primaryDark : NaaguruTheme.muted.withAlpha(30),
                                 width: isSelected ? 2 : 1,
                               ),
                               boxShadow: isSelected ? [] : [
                                  BoxShadow(color: Colors.black.withAlpha(5), blurRadius: 10, offset: const Offset(0, 4))
                               ],
                             ),
                             child: Column(
                               crossAxisAlignment: CrossAxisAlignment.start,
                               children: [
                                 Row(
                                   mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                   children: [
                                     Text(
                                       code,
                                       style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: NaaguruTheme.text),
                                     ),
                                     Icon(
                                       isSelected ? Icons.check_circle : Icons.radio_button_unchecked,
                                       color: isSelected ? NaaguruTheme.primaryDark : NaaguruTheme.muted.withAlpha(50),
                                       size: 24,
                                     ),
                                   ],
                                 ),
                                 const SizedBox(height: 4),
                                 Text(
                                   _isTelugu ? details['subjectsTe'] : details['subjectsEn'],
                                   style: const TextStyle(fontSize: 12, color: NaaguruTheme.muted),
                                 ),
                                 const SizedBox(height: 16),
                                 Container(
                                   padding: const EdgeInsets.all(12),
                                   decoration: BoxDecoration(
                                     color: isSelected ? Colors.white : NaaguruTheme.background,
                                     borderRadius: BorderRadius.circular(8),
                                     border: Border.all(color: NaaguruTheme.muted.withAlpha(20)),
                                   ),
                                   child: Row(
                                     children: [
                                       Icon(details['scopeIcon'], size: 18, color: NaaguruTheme.muted),
                                       const SizedBox(width: 12),
                                       Expanded(
                                         child: Column(
                                           crossAxisAlignment: CrossAxisAlignment.start,
                                           children: [
                                             Text(
                                               _isTelugu ? 'కెరీర్ అవకాశాలు' : 'CAREER SCOPE',
                                               style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: NaaguruTheme.muted, letterSpacing: 0.5),
                                             ),
                                             const SizedBox(height: 2),
                                             Text(
                                               _isTelugu ? details['scopeTe'] : details['scopeEn'],
                                               style: const TextStyle(fontSize: 12, color: NaaguruTheme.text),
                                             ),
                                           ],
                                         ),
                                       ),
                                     ],
                                   ),
                                 ),
                               ],
                             ),
                           ),
                         );
                       }),
                       const SizedBox(height: 24),
                    ],
                 ),
               ),
             ),
             
             // Bottom CTA
             Container(
               padding: const EdgeInsets.all(20),
               decoration: BoxDecoration(
                 color: Colors.white,
                 border: Border(top: BorderSide(color: NaaguruTheme.muted.withAlpha(40))),
               ),
               child: PrimaryButton(
                 text: _isTelugu ? 'కొనసాగించండి →' : 'Continue →',
                 onPressed: _selectedStream != null ? _onContinue : null,
               ),
             ),
          ],
        ),
      ),
    );
  }
}

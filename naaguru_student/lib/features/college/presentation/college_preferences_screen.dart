import 'package:flutter/material.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/core/ui/buttons.dart';
import 'package:naaguru_student/core/ui/language_toggle.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';

import 'package:naaguru_student/features/college/presentation/college_stream_selection_screen.dart';

class CollegePreferencesScreen extends StatefulWidget {
  final CollegeApiClient collegeApiClient;
  final bool isTelugu;
  final ValueChanged<bool> onLanguageChanged;

  const CollegePreferencesScreen({
    super.key,
    required this.collegeApiClient,
    required this.isTelugu,
    required this.onLanguageChanged,
  });

  @override
  State<CollegePreferencesScreen> createState() => _CollegePreferencesScreenState();
}

class _CollegePreferencesScreenState extends State<CollegePreferencesScreen> {
  List<Map<String, dynamic>> _pathways = [];
  bool _isLoading = true;
  String? _selectedPathway;
  late bool _isTelugu;

  @override
  void initState() {
    super.initState();
    _isTelugu = widget.isTelugu;
    _fetchPathways();
  }

  Future<void> _fetchPathways() async {
    try {
      final pathways = await widget.collegeApiClient.getCatalogPathways();
      setState(() {
        _pathways = pathways;
        _isLoading = false;
        final active = pathways.where((p) => p['status'] == 'ACTIVE').toList();
        if (active.isNotEmpty) {
          _selectedPathway = active.first['code'] as String;
        }
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  String _getPathwayDescription(String code) {
    if (code == 'INTERMEDIATE') {
      return _isTelugu 
        ? 'ఎంపిసి, బైపిసి, ఎంఈసి మొదలైన అకడమిక్ మార్గాలు, ఇవి యూనివర్సిటీ డిగ్రీలకు దారితీస్తాయి.'
        : 'Covers academic streams (MPC, BiPC, MEC, CEC) leading to degrees and professional certifications.';
    } else if (code == 'POLYTECHNIC') {
      return _isTelugu
        ? 'ఇంజనీరింగ్ మరియు సాంకేతిక రంగాలలో 3-సంవత్సరాల డిప్లొమా కోర్సులు.'
        : '3-year technical diploma courses in engineering and non-engineering fields.';
    } else if (code == 'ITI') {
      return _isTelugu
        ? 'పారిశ్రామిక శిక్షణా సంస్థలలో నైపుణ్య ఆధారిత కోర్సులు.'
        : 'Skill-based trade courses at Industrial Training Institutes.';
    } else if (code == 'DEFENCE') {
      return _isTelugu
        ? 'ఎన్‌డిఎ, ఆర్మీ, నేవీ, మరియు రక్షణ దళాలలో చేరడానికి మార్గాలు.'
        : 'Pathways into NDA, Army, Navy, Air Force, and Police services.';
    }
    return '';
  }

  IconData _getPathwayIcon(String code) {
    if (code == 'INTERMEDIATE') return Icons.school_outlined;
    if (code == 'POLYTECHNIC') return Icons.engineering_outlined;
    if (code == 'ITI') return Icons.handyman_outlined;
    if (code == 'DEFENCE') return Icons.shield_outlined;
    return Icons.school_outlined;
  }

  void _onContinue() {
    if (_selectedPathway == null) return;
    
    // Pass the active programs of the selected pathway to Screen 3
    final selectedPathwayObj = _pathways.firstWhere((p) => p['code'] == _selectedPathway);
    final programs = selectedPathwayObj['programs'] as List;

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CollegeStreamSelectionScreen(
          programs: programs.cast<Map<String, dynamic>>(),
          pathwayCode: _selectedPathway!,
          isTelugu: _isTelugu,
          onLanguageChanged: widget.onLanguageChanged,
        ),
      ),
    );
  }

  Widget _buildProgressIndicator() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            _isTelugu ? 'దశ 1/4' : 'STEP 1 OF 4',
            style: const TextStyle(
              fontSize: 11, 
              fontWeight: FontWeight.bold, 
              color: NaaguruTheme.muted, 
              letterSpacing: 1.2
            ),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(child: _buildProgressSegment(true)),
              const SizedBox(width: 4),
              Expanded(child: _buildProgressSegment(false)),
              const SizedBox(width: 4),
              Expanded(child: _buildProgressSegment(false)),
              const SizedBox(width: 4),
              Expanded(child: _buildProgressSegment(false)),
            ],
          ),
        ],
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

  List<Widget> _buildPathwayCards() {
    return _pathways.map((pathway) {
      final code = pathway['code'] as String;
      final nameEn = pathway['nameEn'] as String;
      final nameTe = pathway['nameTe'] as String;
      final status = pathway['status'] as String;
      
      final isSelected = _selectedPathway == code;
      final isActive = status == 'ACTIVE';

      return Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: InkWell(
          onTap: isActive ? () {
            setState(() { _selectedPathway = code; });
          } : null,
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isActive ? Colors.white : NaaguruTheme.background,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isSelected ? NaaguruTheme.primaryDark : NaaguruTheme.muted.withAlpha(40),
                width: isSelected ? 2 : 1,
              ),
              boxShadow: isActive ? [
                 BoxShadow(color: Colors.black.withAlpha(5), blurRadius: 10, offset: const Offset(0, 4))
              ] : [],
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                 Icon(
                   _getPathwayIcon(code),
                   size: 32,
                   color: isActive ? NaaguruTheme.primaryDark : NaaguruTheme.muted.withAlpha(150),
                 ),
                 const SizedBox(width: 16),
                 Expanded(
                   child: Column(
                     crossAxisAlignment: CrossAxisAlignment.start,
                     children: [
                        Row(
                          children: [
                            Text(
                              _isTelugu ? nameTe : nameEn,
                              style: TextStyle(
                                fontSize: 16, 
                                fontWeight: FontWeight.bold,
                                color: isActive ? NaaguruTheme.primaryDark : NaaguruTheme.muted,
                              ),
                            ),
                            if (!isActive) ...[
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: NaaguruTheme.muted.withAlpha(30),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  _isTelugu ? 'త్వరలో' : 'Coming soon',
                                  style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: NaaguruTheme.muted),
                                ),
                              ),
                            ]
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _getPathwayDescription(code),
                          style: TextStyle(
                            fontSize: 13, 
                            color: isActive ? NaaguruTheme.text : NaaguruTheme.muted,
                            height: 1.4,
                          ),
                        ),
                     ],
                   ),
                 ),
                 if (isActive)
                   Icon(
                     isSelected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                     color: isSelected ? NaaguruTheme.primaryDark : NaaguruTheme.muted.withAlpha(100),
                   ),
              ],
            ),
          ),
        ),
      );
    }).toList();
  }

  Widget _buildMentorTip() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const CircleAvatar(
          radius: 20,
          backgroundColor: NaaguruTheme.primaryLight,
          child: Icon(Icons.psychology, color: NaaguruTheme.primaryDark),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: NaaguruTheme.muted.withAlpha(30)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _isTelugu ? 'మెంటార్ సూచన' : 'Mentor Tip',
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark),
                ),
                const SizedBox(height: 4),
                Text(
                  _isTelugu 
                      ? 'ఇంటర్మీడియట్ అత్యంత సాధారణ మార్గం. ఇది భవిష్యత్తులో యూనివర్సిటీ డిగ్రీలకు వెళ్లడానికి ఉపయోగపడుతుంది.'
                      : 'Intermediate is the most common pathway. It keeps your options open for university degrees.',
                  style: const TextStyle(fontSize: 13, color: NaaguruTheme.muted, height: 1.4),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
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
        child: _isLoading 
          ? const Center(child: CircularProgressIndicator()) 
          : Column(
              children: [
                 _buildProgressIndicator(),
                 Expanded(
                   child: SingleChildScrollView(
                     padding: const EdgeInsets.all(20),
                     child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                           Text(
                             _isTelugu ? 'మీరు ఏమి చదవాలనుకుంటున్నారు?' : 'What do you want to pursue?',
                             style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark),
                           ),
                           const SizedBox(height: 8),
                           Text(
                             _isTelugu 
                                 ? '10వ తరగతి తర్వాత మీరు ఆసక్తిగా ఉన్న విద్యా మార్గాన్ని ఎంచుకోండి.' 
                                 : 'Choose the type of education pathway you\'re interested in after Class 10.',
                             style: const TextStyle(fontSize: 15, color: NaaguruTheme.muted),
                           ),
                           const SizedBox(height: 24),
                           
                           // Informational Callout
                           Container(
                             padding: const EdgeInsets.all(16),
                             decoration: BoxDecoration(
                               color: NaaguruTheme.primaryLight.withAlpha(50),
                               borderRadius: BorderRadius.circular(12),
                             ),
                             child: Row(
                               crossAxisAlignment: CrossAxisAlignment.start,
                               children: [
                                  const Icon(Icons.info_outline, color: NaaguruTheme.primaryDark, size: 20),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      _isTelugu 
                                          ? 'మీ ఎంపిక ఆధారంగా సరిపోయే కళాశాలలు మరియు కోర్సులను మేము సూచిస్తాము.'
                                          : 'We will use your selected pathway to match relevant colleges and programs.',
                                      style: const TextStyle(fontSize: 13, color: NaaguruTheme.text),
                                    ),
                                  ),
                               ],
                             ),
                           ),
                           const SizedBox(height: 24),

                           // Pathway Cards
                           ..._buildPathwayCards(),
                           const SizedBox(height: 32),

                           // Mentor Tip
                           _buildMentorTip(),
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
                     onPressed: _selectedPathway != null ? _onContinue : null,
                   ),
                 ),
              ],
          ),
      ),
    );
  }
}

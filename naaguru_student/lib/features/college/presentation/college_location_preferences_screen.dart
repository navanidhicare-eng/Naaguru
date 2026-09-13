import 'package:flutter/material.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/core/ui/buttons.dart';
import 'package:naaguru_student/core/ui/language_toggle.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';

class CollegeLocationPreferencesScreen extends StatefulWidget {
  final CollegeApiClient collegeApiClient;
  final String pathwayCode;
  final String programCode;
  final bool isTelugu;
  final ValueChanged<bool> onLanguageChanged;

  const CollegeLocationPreferencesScreen({
    super.key,
    required this.collegeApiClient,
    required this.pathwayCode,
    required this.programCode,
    required this.isTelugu,
    required this.onLanguageChanged,
  });

  @override
  State<CollegeLocationPreferencesScreen> createState() => _CollegeLocationPreferencesScreenState();
}

class _CollegeLocationPreferencesScreenState extends State<CollegeLocationPreferencesScreen> {
  late bool _isTelugu;
  List<Map<String, dynamic>> _areas = [];
  bool _isLoading = true;

  String? _selectedAreaId;
  String? _selectedHostel; 
  String? _selectedBudget;

  @override
  void initState() {
    super.initState();
    _isTelugu = widget.isTelugu;
    _fetchAreas();
  }

  Future<void> _fetchAreas() async {
    try {
      final areas = await widget.collegeApiClient.getCatalogAreas();
      // Filter out non-active if any, just in case
      final activeAreas = areas.where((a) => a['status'] != 'INACTIVE').toList();
      if (mounted) {
        setState(() {
          _areas = activeAreas;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _onContinue() {
    if (_selectedAreaId == null || _selectedHostel == null || _selectedBudget == null) return;
    
    // Navigate to dummy Screen 5 (Review & Confirm)
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => Scaffold(
          appBar: AppBar(
            backgroundColor: Colors.white,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios, color: NaaguruTheme.primaryDark, size: 20),
              onPressed: () => Navigator.of(context).pop(),
            ),
          ),
          body: Center(
            child: Text(_isTelugu ? 'స్క్రీన్ 5 - సమీక్షించండి' : 'Screen 5 - Review & Confirm'),
          ),
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
                    _isTelugu ? 'దశ 3/4' : 'Step 3 of 4',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark),
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
                      '${widget.pathwayCode == 'INTERMEDIATE' ? 'Inter' : widget.pathwayCode} • ${widget.programCode}',
                      style: const TextStyle(fontSize: 12, color: NaaguruTheme.primaryDark),
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
              Expanded(child: _buildProgressSegment(true)),
              const SizedBox(width: 4),
              Expanded(child: _buildProgressSegment(false)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAreaSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          _isTelugu ? 'ప్రాధాన్యత గల ప్రాంతం' : 'Preferred area',
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark),
        ),
        const SizedBox(height: 12),
        if (_isLoading)
          const Center(child: CircularProgressIndicator())
        else if (_areas.isEmpty)
          const Text('No areas available')
        else
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: _areas.map((area) {
                final isSelected = _selectedAreaId == area['id'];
                final name = _isTelugu ? area['displayNameTe'] : area['displayNameEn'];
                return GestureDetector(
                  onTap: () => setState(() => _selectedAreaId = area['id']),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: isSelected ? NaaguruTheme.primaryDark : Colors.white,
                      border: Border.all(color: isSelected ? NaaguruTheme.primaryDark : NaaguruTheme.muted.withAlpha(50)),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (isSelected) ...[
                          const Icon(Icons.check, size: 16, color: Colors.white),
                          const SizedBox(width: 6),
                        ],
                        Text(
                          name ?? '',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            color: isSelected ? Colors.white : NaaguruTheme.text,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
      ],
    );
  }

  Widget _buildHostelSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          _isTelugu ? 'హాస్టల్ వసతి అవసరమా?' : 'Do you need hostel accommodation?',
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: _buildHostelOption('YES', _isTelugu ? 'అవును' : 'Yes')),
            const SizedBox(width: 8),
            Expanded(child: _buildHostelOption('NO', _isTelugu ? 'వద్దు' : 'No')),
            const SizedBox(width: 8),
            Expanded(child: _buildHostelOption('EITHER', _isTelugu ? 'ఏదైనా పర్వాలేదు' : 'Either is fine')),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            const Icon(Icons.bed_outlined, size: 16, color: NaaguruTheme.muted),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                _isTelugu 
                  ? 'హాస్టల్ సౌకర్యాలు మరియు ఫీజు వివరాలు కూడా పరిగణించబడతాయి.'
                  : 'Hostel availability and fees will be included in the estimate.',
                style: const TextStyle(fontSize: 12, color: NaaguruTheme.muted),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildHostelOption(String value, String label) {
    final isSelected = _selectedHostel == value;
    return GestureDetector(
      onTap: () => setState(() => _selectedHostel = value),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? NaaguruTheme.primaryDark : NaaguruTheme.primaryLight.withAlpha(50),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (isSelected) ...[
              const Icon(Icons.check, size: 16, color: Colors.white),
              const SizedBox(width: 4),
            ],
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? Colors.white : NaaguruTheme.text,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBudgetSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          _isTelugu ? 'మీ వార్షిక ట్యూషన్ ఫీజు అంచనా ఎంత?' : 'What\'s your approximate yearly tuition budget?',
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: _buildBudgetOption('UNDER_50K', '< ₹50,000')),
            const SizedBox(width: 12),
            Expanded(child: _buildBudgetOption('UP_TO_1L', 'Up to ₹1,00,000')),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: _buildBudgetOption('OVER_1L', '₹1,00,000+')),
            const SizedBox(width: 12),
            Expanded(child: _buildBudgetOption('NOT_SURE', _isTelugu ? 'ఇంకా నిర్ణయించలేదు' : 'Not sure yet')),
          ],
        ),
        const SizedBox(height: 16),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: NaaguruTheme.primaryLight.withAlpha(100),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.verified_user_outlined, color: NaaguruTheme.primaryDark, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _isTelugu ? 'స్పష్టమైన మరియు పారదర్శకమైన' : 'Clear & Transparent',
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: NaaguruTheme.text),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _isTelugu 
                          ? 'ఫీజు అంచనాలు నేరుగా కళాశాలల ద్వారా ధృవీకరించబడతాయి. దాచిన ఛార్జీలు లేవు.'
                          : 'Fee estimates are verified directly with institution administrations. No hidden discovery charges.',
                      style: const TextStyle(fontSize: 12, color: NaaguruTheme.muted),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildBudgetOption(String value, String label) {
    final isSelected = _selectedBudget == value;
    return GestureDetector(
      onTap: () => setState(() => _selectedBudget = value),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        decoration: BoxDecoration(
          color: isSelected ? NaaguruTheme.primaryLight.withAlpha(50) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? NaaguruTheme.primaryDark : NaaguruTheme.muted.withAlpha(30),
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: NaaguruTheme.text,
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle, size: 18, color: NaaguruTheme.primaryDark)
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final canContinue = _selectedAreaId != null && _selectedHostel != null && _selectedBudget != null;

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
          const CircleAvatar(
            radius: 16,
            backgroundColor: NaaguruTheme.primaryLight,
            child: Icon(Icons.person, size: 20, color: NaaguruTheme.primaryDark),
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
                       Text(
                         _isTelugu ? 'మీరు ఎక్కడ చదవాలనుకుంటున్నారు?' : 'Where would you like to study?',
                         style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark),
                       ),
                       const SizedBox(height: 8),
                       Text(
                         _isTelugu 
                             ? 'మీ ప్రాధాన్యత గల ప్రాంతం మరియు ముఖ్యమైన వివరాలను ఎంచుకోండి.' 
                             : 'Choose your preferred area and a few things that matter to you.',
                         style: const TextStyle(fontSize: 15, color: NaaguruTheme.muted),
                       ),
                       const SizedBox(height: 32),
                       
                       _buildAreaSelection(),
                       const SizedBox(height: 32),
                       
                       _buildHostelSelection(),
                       const SizedBox(height: 32),
                       
                       _buildBudgetSelection(),
                       const SizedBox(height: 32),
                    ],
                 ),
               ),
             ),
             
             Container(
               padding: const EdgeInsets.all(20),
               decoration: BoxDecoration(
                 color: Colors.white,
                 border: Border(top: BorderSide(color: NaaguruTheme.muted.withAlpha(40))),
               ),
               child: Column(
                 mainAxisSize: MainAxisSize.min,
                 children: [
                   PrimaryButton(
                     text: _isTelugu ? 'సమీక్షకు కొనసాగించండి →' : 'Continue to Review →',
                     onPressed: canContinue ? _onContinue : null,
                   ),
                   const SizedBox(height: 12),
                   Row(
                     mainAxisAlignment: MainAxisAlignment.center,
                     children: [
                       const Icon(Icons.lock_outline, size: 12, color: NaaguruTheme.muted),
                       const SizedBox(width: 4),
                       Text(
                         _isTelugu 
                            ? 'ప్రాధాన్యతలు ఎప్పుడైనా మార్చుకోవచ్చు'
                            : 'Preferences can be adjusted anytime later',
                         style: const TextStyle(fontSize: 11, color: NaaguruTheme.muted),
                       ),
                     ],
                   )
                 ],
               ),
             ),
          ],
        ),
      ),
    );
  }
}

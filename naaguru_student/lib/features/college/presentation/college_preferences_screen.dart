import 'package:flutter/material.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/core/ui/buttons.dart';
import 'package:naaguru_student/core/ui/language_toggle.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';
import 'package:naaguru_student/features/college/presentation/college_list_screen.dart';

class CollegePreferencesScreen extends StatefulWidget {
  final CollegeApiClient collegeApiClient;

  const CollegePreferencesScreen({super.key, required this.collegeApiClient});

  @override
  State<CollegePreferencesScreen> createState() =>
      _CollegePreferencesScreenState();
}

class _CollegePreferencesScreenState extends State<CollegePreferencesScreen> {
  bool _isTelugu = false;

  // Selected values
  String _selectedPathway = 'Intermediate';
  String? _selectedStream; // null = Any
  String? _selectedDistrict; // null = Any
  bool _requiresHostel = false;
  int? _maxFee; // null = Any

  final List<Map<String, String>> _pathways = [
    {'id': 'Intermediate', 'labelEn': 'Intermediate', 'labelTe': 'ఇంటర్మీడియట్', 'icon': '🎓'},
    {'id': 'Polytechnic', 'labelEn': 'Polytechnic', 'labelTe': 'పాలిటెక్నిక్', 'icon': '🔧'},
    {'id': 'ITI', 'labelEn': 'ITI Trades', 'labelTe': 'ఐటిఐ ట్రేడ్స్', 'icon': '🛠'},
    {'id': 'Defence', 'labelEn': 'Defence & Service', 'labelTe': 'డిఫెన్స్ & సర్వీస్', 'icon': '🛡'},
  ];

  final List<Map<String, String>> _streams = [
    {'code': '', 'nameEn': 'Any Stream', 'nameTe': 'ఏదైనా స్ట్రీమ్'},
    {'code': 'MPC', 'nameEn': 'MPC (Maths, Physics, Chemistry)', 'nameTe': 'MPC (గణితం, భౌతిక, రసాయన)'},
    {'code': 'BIPC', 'nameEn': 'BiPC (Biology, Physics, Chemistry)', 'nameTe': 'BiPC (జీవ, భౌతిక, రసాయన)'},
    {'code': 'MEC', 'nameEn': 'MEC (Maths, Economics, Commerce)', 'nameTe': 'MEC (గణితం, అర్థ, కామర్స్)'},
    {'code': 'CEC', 'nameEn': 'CEC (Commerce, Economics, Civics)', 'nameTe': 'CEC (కామర్స్, అర్థ, పౌరనీతి)'},
  ];

  final List<Map<String, String>> _districts = [
    {'id': '', 'nameEn': 'All Locations', 'nameTe': 'అన్ని ప్రాంతాలు'},
    {'id': 'Visakhapatnam', 'nameEn': 'Visakhapatnam', 'nameTe': 'విశాఖపట్నం'},
    {'id': 'Krishna', 'nameEn': 'Krishna / Vijayawada', 'nameTe': 'కృష్ణా / విజయవాడ'},
    {'id': 'Guntur', 'nameEn': 'Guntur', 'nameTe': 'గుంటూరు'},
    {'id': 'Hyderabad', 'nameEn': 'Hyderabad', 'nameTe': 'హైదరాబాద్'},
  ];

  final List<Map<String, dynamic>> _feeOptions = [
    {'fee': null, 'labelEn': 'Any Budget', 'labelTe': 'ఎంతైనా'},
    {'fee': 50000, 'labelEn': 'Under ₹50,000 / yr', 'labelTe': '₹50,000 లోపు / సం'},
    {'fee': 100000, 'labelEn': 'Under ₹1,00,000 / yr', 'labelTe': '₹1,00,000 లోపు / సం'},
  ];

  void _onFindColleges() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CollegeListScreen(
          collegeApiClient: widget.collegeApiClient,
          pathway: _selectedPathway,
          streamCode: _selectedStream?.isEmpty == true ? null : _selectedStream,
          district: _selectedDistrict?.isEmpty == true ? null : _selectedDistrict,
          requiresHostel: _requiresHostel,
          maxFee: _maxFee,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isIntermediate = _selectedPathway == 'Intermediate';

    return Scaffold(
      backgroundColor: NaaguruTheme.background,
      appBar: AppBar(
        title: Text(
          _isTelugu ? 'కళాశాల ప్రాధాన్యతలు' : 'Find a College',
          style: const TextStyle(
            color: NaaguruTheme.primaryDark,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: NaaguruTheme.text, size: 18),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: LanguageToggle(
              isTelugu: _isTelugu,
              onToggle: (val) => setState(() => _isTelugu = val),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header Card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: NaaguruTheme.primaryLight.withAlpha(77),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: const BoxDecoration(
                        color: NaaguruTheme.primaryDark,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.tune, color: Colors.white, size: 22),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _isTelugu ? 'మీ ప్రాధాన్యతలను ఎంచుకోండి' : 'Set Your Preferences',
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: NaaguruTheme.primaryDark,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _isTelugu
                                ? 'మీకు సరిపోయే కళాశాలలను శోధించడానికి వివరాలను ఎంచుకోండి.'
                                : 'Choose pathway, stream, location, and hostel preference.',
                            style: const TextStyle(fontSize: 12, color: NaaguruTheme.muted),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // 1. Pathway Selection
              Text(
                _isTelugu ? '1. మార్గం ఎంచుకోండి (Pathway)' : '1. Choose Pathway',
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: NaaguruTheme.text),
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _pathways.map((p) {
                  final isSelected = _selectedPathway == p['id'];
                  return ChoiceChip(
                    avatar: Text(p['icon']!, style: const TextStyle(fontSize: 16)),
                    label: Text(
                      _isTelugu ? p['labelTe']! : p['labelEn']!,
                      style: TextStyle(
                        color: isSelected ? Colors.white : NaaguruTheme.text,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                        fontSize: 13,
                      ),
                    ),
                    selected: isSelected,
                    selectedColor: NaaguruTheme.primaryDark,
                    backgroundColor: Colors.white,
                    side: BorderSide(
                      color: isSelected ? NaaguruTheme.primaryDark : NaaguruTheme.muted.withAlpha(51),
                    ),
                    onSelected: (val) {
                      if (val) setState(() => _selectedPathway = p['id']!);
                    },
                  );
                }).toList(),
              ),
              const SizedBox(height: 24),

              if (!isIntermediate) ...[
                // Coming Soon State for non-intermediate pathways
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: NaaguruTheme.muted.withAlpha(51)),
                  ),
                  child: Column(
                    children: [
                      const Text('⏳', style: TextStyle(fontSize: 40)),
                      const SizedBox(height: 12),
                      Text(
                        _isTelugu ? 'త్వరలో అందుబాటులోకి వస్తుంది' : 'Coming Soon to Naaguru',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _isTelugu
                            ? '$_selectedPathway కళాశాలల డేటా పరిశీలనలో ఉంది. ప్రస్తుతం ఇంటర్మీడియట్ కళాశాలలు అందుబాటులో ఉన్నాయి.'
                            : 'Verified institutes for $_selectedPathway are currently being onboarded. Intermediate junior colleges are available for direct search.',
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 13, color: NaaguruTheme.muted, height: 1.4),
                      ),
                      const SizedBox(height: 16),
                      OutlinedButton(
                        onPressed: () => setState(() => _selectedPathway = 'Intermediate'),
                        child: Text(_isTelugu ? 'ఇంటర్మీడియట్ చూడండి' : 'Switch to Intermediate'),
                      ),
                    ],
                  ),
                ),
              ] else ...[
                // 2. Stream Selection
                Text(
                  _isTelugu ? '2. అకడమిక్ స్ట్రీమ్ (Stream)' : '2. Academic Stream',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: NaaguruTheme.text),
                ),
                const SizedBox(height: 10),
                Column(
                  children: _streams.map((s) {
                    final isSelected = (_selectedStream ?? '') == s['code'];
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 8),
                      child: InkWell(
                        onTap: () => setState(() => _selectedStream = s['code']),
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          decoration: BoxDecoration(
                            color: isSelected ? NaaguruTheme.primaryLight.withAlpha(77) : Colors.white,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSelected ? NaaguruTheme.primaryDark : NaaguruTheme.muted.withAlpha(51),
                              width: isSelected ? 1.5 : 1,
                            ),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                isSelected ? Icons.radio_button_checked : Icons.radio_button_unchecked,
                                color: isSelected ? NaaguruTheme.primaryDark : NaaguruTheme.muted,
                                size: 20,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  _isTelugu ? s['nameTe']! : s['nameEn']!,
                                  style: TextStyle(
                                    fontSize: 14,
                                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                    color: NaaguruTheme.text,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 24),

                // 3. Location (District)
                Text(
                  _isTelugu ? '3. ప్రాధాన్య ప్రాంతం (Location)' : '3. Preferred Location',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: NaaguruTheme.text),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _districts.map((d) {
                    final isSelected = (_selectedDistrict ?? '') == d['id'];
                    return ChoiceChip(
                      label: Text(
                        _isTelugu ? d['nameTe']! : d['nameEn']!,
                        style: TextStyle(
                          color: isSelected ? Colors.white : NaaguruTheme.text,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                          fontSize: 13,
                        ),
                      ),
                      selected: isSelected,
                      selectedColor: NaaguruTheme.primaryDark,
                      backgroundColor: Colors.white,
                      side: BorderSide(
                        color: isSelected ? NaaguruTheme.primaryDark : NaaguruTheme.muted.withAlpha(51),
                      ),
                      onSelected: (val) {
                        if (val) setState(() => _selectedDistrict = d['id']);
                      },
                    );
                  }).toList(),
                ),
                const SizedBox(height: 24),

                // 4. Hostel Requirement
                Text(
                  _isTelugu ? '4. హాస్టల్ అవసరం (Hostel)' : '4. Hostel Requirement',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: NaaguruTheme.text),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: ChoiceChip(
                        label: Center(
                          child: Text(
                            _isTelugu ? 'అవసరం లేదు' : 'No Preference',
                            style: TextStyle(
                              color: !_requiresHostel ? Colors.white : NaaguruTheme.text,
                              fontWeight: !_requiresHostel ? FontWeight.bold : FontWeight.normal,
                              fontSize: 13,
                            ),
                          ),
                        ),
                        selected: !_requiresHostel,
                        selectedColor: NaaguruTheme.primaryDark,
                        backgroundColor: Colors.white,
                        side: BorderSide(
                          color: !_requiresHostel ? NaaguruTheme.primaryDark : NaaguruTheme.muted.withAlpha(51),
                        ),
                        onSelected: (val) {
                          if (val) setState(() => _requiresHostel = false);
                        },
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ChoiceChip(
                        avatar: const Icon(Icons.hotel, size: 16, color: Colors.orange),
                        label: Center(
                          child: Text(
                            _isTelugu ? 'హాస్టల్ కావాలి' : 'Hostel Required',
                            style: TextStyle(
                              color: _requiresHostel ? Colors.white : NaaguruTheme.text,
                              fontWeight: _requiresHostel ? FontWeight.bold : FontWeight.normal,
                              fontSize: 13,
                            ),
                          ),
                        ),
                        selected: _requiresHostel,
                        selectedColor: NaaguruTheme.primaryDark,
                        backgroundColor: Colors.white,
                        side: BorderSide(
                          color: _requiresHostel ? NaaguruTheme.primaryDark : NaaguruTheme.muted.withAlpha(51),
                        ),
                        onSelected: (val) {
                          if (val) setState(() => _requiresHostel = true);
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // 5. Budget / Fee Preference (Optional)
                Text(
                  _isTelugu ? '5. వార్షిక ఫీజు పరిమితి (Optional Fee)' : '5. Tuition Budget (Optional)',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: NaaguruTheme.text),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _feeOptions.map((f) {
                    final isSelected = _maxFee == f['fee'];
                    return ChoiceChip(
                      label: Text(
                        _isTelugu ? f['labelTe']! : f['labelEn']!,
                        style: TextStyle(
                          color: isSelected ? Colors.white : NaaguruTheme.text,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                          fontSize: 13,
                        ),
                      ),
                      selected: isSelected,
                      selectedColor: NaaguruTheme.primaryDark,
                      backgroundColor: Colors.white,
                      side: BorderSide(
                        color: isSelected ? NaaguruTheme.primaryDark : NaaguruTheme.muted.withAlpha(51),
                      ),
                      onSelected: (val) {
                        if (val) setState(() => _maxFee = f['fee'] as int?);
                      },
                    );
                  }).toList(),
                ),
                const SizedBox(height: 32),

                // Primary CTA
                PrimaryButton(
                  text: _isTelugu ? 'కళాశాలలను కనుగొనండి →' : 'Find Colleges →',
                  onPressed: _onFindColleges,
                ),
              ],
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/core/ui/buttons.dart';
import 'package:naaguru_student/core/ui/language_toggle.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';
import 'package:naaguru_student/features/college/presentation/college_discovery_wizard_state.dart';
import 'package:naaguru_student/features/college/presentation/college_review_and_confirm_screen.dart';
import 'package:naaguru_student/features/student/data/catalog_api_client.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';
import 'package:naaguru_student/features/student/presentation/location_picker_sheet.dart';

class _C {
  static const surfaceContainerLow = Color(0xFFE9F7F3);
  static const surfaceContainerHigh = Color(0xFFDDEBE7);
  static const onSurfaceVariant = Color(0xFF3E4946);
}

class CollegeLocationPreferencesScreen extends StatefulWidget {
  final CollegeApiClient collegeApiClient;
  final String pathwayCode;
  final String programCode;
  final bool isTelugu;
  final ValueChanged<bool> onLanguageChanged;
  final CatalogApiClient? catalogApiClient;
  final StudentApiClient? studentApiClient;
  final CollegeDiscoveryWizardState? wizardState;

  const CollegeLocationPreferencesScreen({
    super.key,
    required this.collegeApiClient,
    required this.pathwayCode,
    required this.programCode,
    required this.isTelugu,
    required this.onLanguageChanged,
    this.catalogApiClient,
    this.studentApiClient,
    this.wizardState,
  });

  @override
  State<CollegeLocationPreferencesScreen> createState() =>
      _CollegeLocationPreferencesScreenState();
}

class _CollegeLocationPreferencesScreenState
    extends State<CollegeLocationPreferencesScreen> {
  late bool _isTelugu;
  late final CollegeDiscoveryWizardState _wizard;
  late final CatalogApiClient _catalogApiClient;
  late final StudentApiClient _studentApiClient;

  @override
  void initState() {
    super.initState();
    _isTelugu = widget.isTelugu;
    _wizard = widget.wizardState ?? CollegeDiscoveryWizardState();
    _wizard.pathwayCode = widget.pathwayCode;
    _wizard.programCode = widget.programCode;
    _catalogApiClient =
        widget.catalogApiClient ?? CatalogApiClient(apiClient: ApiClient());
    _studentApiClient =
        widget.studentApiClient ?? StudentApiClient(apiClient: ApiClient());
  }

  // ── Location Picker Helpers ───────────────────────────────────────────────

  Future<void> _pickPreferredState() async {
    final picked = await LocationPickerSheet.show(
      context,
      levelLabel: 'Preferred State',
      levelLabelTe: 'రాష్ట్రం',
      isTelugu: _isTelugu,
      loader: () => _catalogApiClient.getLocations(type: 'STATE'),
      current: _wizard.preferredState,
    );
    if (picked != null && mounted) {
      setState(() => _wizard.selectPreferredState(picked));
    }
  }

  Future<void> _pickPreferredDistrict() async {
    if (_wizard.preferredState == null) return;
    final picked = await LocationPickerSheet.show(
      context,
      levelLabel: 'Preferred District',
      levelLabelTe: 'జిల్లా',
      isTelugu: _isTelugu,
      loader: () => _catalogApiClient.getLocations(
        type: 'DISTRICT',
        parentId: _wizard.preferredState!.id,
      ),
      current: _wizard.preferredDistrict,
    );
    if (picked != null && mounted) {
      setState(() => _wizard.selectPreferredDistrict(picked));
    }
  }

  Future<void> _pickPreferredMandal() async {
    if (_wizard.preferredDistrict == null) return;
    final picked = await LocationPickerSheet.show(
      context,
      levelLabel: 'Preferred Mandal',
      levelLabelTe: 'మండలం',
      isTelugu: _isTelugu,
      loader: () => _catalogApiClient.getLocations(
        type: 'MANDAL',
        parentId: _wizard.preferredDistrict!.id,
      ),
      current: _wizard.preferredMandal,
    );
    if (picked != null && mounted) {
      setState(() => _wizard.selectPreferredMandal(picked));
    }
  }

  Future<void> _pickPreferredLocality() async {
    if (_wizard.preferredMandal == null) return;
    final picked = await LocationPickerSheet.show(
      context,
      levelLabel: 'Preferred Village / City',
      levelLabelTe: 'గ్రామం / నగరం',
      isTelugu: _isTelugu,
      loader: () => _catalogApiClient.getLocations(
        type: 'LOCALITY',
        parentId: _wizard.preferredMandal!.id,
      ),
      current: _wizard.preferredLocality,
    );
    if (picked != null && mounted) {
      setState(() => _wizard.selectPreferredLocality(picked));
    }
  }

  void _onContinue() {
    if (!_wizard.isStep3Valid) return;

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CollegeReviewAndConfirmScreen(
          wizardState: _wizard,
          collegeApiClient: widget.collegeApiClient,
          studentApiClient: _studentApiClient,
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
        color: isActive
            ? NaaguruTheme.primaryDark
            : NaaguruTheme.muted.withAlpha(50),
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
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: NaaguruTheme.primaryDark,
                    ),
                  ),
                ],
              ),
              GestureDetector(
                onTap: () => Navigator.of(context).pop(),
                child: Row(
                  children: [
                    const Icon(Icons.school_outlined,
                        size: 14, color: NaaguruTheme.primaryDark),
                    const SizedBox(width: 4),
                    Text(
                      '${widget.pathwayCode == 'INTERMEDIATE' ? 'Inter' : widget.pathwayCode} • ${widget.programCode}',
                      style: const TextStyle(
                          fontSize: 12, color: NaaguruTheme.primaryDark),
                    ),
                  ],
                ),
              ),
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

  // ── Hierarchical Location Block ───────────────────────────────────────────

  Widget _buildLocationSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Text(
              _isTelugu
                  ? 'ప్రాధాన్యతా అధ్యయన ప్రాంతం'
                  : 'Preferred study location',
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: NaaguruTheme.primaryDark,
              ),
            ),
            const Text(
              ' *',
              style: TextStyle(
                fontSize: 15,
                color: NaaguruTheme.error,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          _isTelugu
              ? 'మీరు చదువుకోవాలనుకుంటున్న రాష్ట్రాన్ని, జిల్లాను, మండలాన్ని ఎంచుకోండి.'
              : 'Choose the state, district, mandal and locality where you prefer to study.',
          style: const TextStyle(fontSize: 12, color: NaaguruTheme.muted),
        ),
        const SizedBox(height: 12),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: NaaguruTheme.muted.withAlpha(40)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(6),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              _locationRow(
                sublabel: _isTelugu ? 'రాష్ట్రం' : 'PREFERRED STATE',
                value: _wizard.preferredState?.displayName(_isTelugu),
                placeholder:
                    _isTelugu ? 'రాష్ట్రాన్ని ఎంచుకోండి' : 'Select state',
                enabled: true,
                onTap: _pickPreferredState,
              ),
              _divider(),
              _locationRow(
                sublabel: _isTelugu ? 'జిల్లా' : 'PREFERRED DISTRICT',
                value: _wizard.preferredDistrict?.displayName(_isTelugu),
                placeholder: _wizard.preferredState != null
                    ? (_isTelugu ? 'జిల్లాను ఎంచుకోండి' : 'Select district')
                    : (_isTelugu
                        ? 'ముందు రాష్ట్రం ఎంచుకోండి'
                        : 'Select state first'),
                enabled: _wizard.preferredState != null,
                onTap: _pickPreferredDistrict,
              ),
              _divider(),
              _locationRow(
                sublabel: _isTelugu ? 'మండలం' : 'PREFERRED MANDAL',
                value: _wizard.preferredMandal?.displayName(_isTelugu),
                placeholder: _wizard.preferredDistrict != null
                    ? (_isTelugu ? 'మండలాన్ని ఎంచుకోండి' : 'Select mandal')
                    : (_isTelugu
                        ? 'ముందు జిల్లా ఎంచుకోండి'
                        : 'Select district first'),
                enabled: _wizard.preferredDistrict != null,
                onTap: _pickPreferredMandal,
              ),
              _divider(),
              _locationRow(
                sublabel:
                    _isTelugu ? 'గ్రామం / నగరం' : 'PREFERRED VILLAGE / CITY',
                value: _wizard.preferredLocality?.displayName(_isTelugu),
                placeholder: _wizard.preferredMandal != null
                    ? (_isTelugu
                        ? 'గ్రామం లేదా నగరాన్ని ఎంచుకోండి'
                        : 'Select village or city')
                    : (_isTelugu
                        ? 'ముందు మండలం ఎంచుకోండి'
                        : 'Select mandal first'),
                enabled: _wizard.preferredMandal != null,
                onTap: _pickPreferredLocality,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _locationRow({
    required String sublabel,
    required String? value,
    required String placeholder,
    required bool enabled,
    required VoidCallback onTap,
  }) {
    final hasValue = value != null && value.isNotEmpty;
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: enabled ? onTap : null,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      sublabel,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.8,
                        color: enabled
                            ? _C.onSurfaceVariant
                            : NaaguruTheme.muted.withAlpha(100),
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      hasValue ? value : placeholder,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight:
                            hasValue ? FontWeight.w600 : FontWeight.w400,
                        color: hasValue
                            ? NaaguruTheme.text
                            : NaaguruTheme.muted.withAlpha(enabled ? 200 : 100),
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: enabled ? _C.surfaceContainerLow : Colors.transparent,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.chevron_right_rounded,
                  size: 20,
                  color: enabled
                      ? _C.onSurfaceVariant
                      : NaaguruTheme.muted.withAlpha(80),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _divider() {
    return Container(
      height: 1,
      margin: const EdgeInsets.symmetric(horizontal: 16),
      color: _C.surfaceContainerHigh,
    );
  }

  // ── Hostel Selection ──────────────────────────────────────────────────────

  Widget _buildHostelSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Text(
              _isTelugu
                  ? 'హాస్టల్ వసతి అవసరమా?'
                  : 'Do you need hostel accommodation?',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: NaaguruTheme.primaryDark,
              ),
            ),
            const Text(
              ' *',
              style: TextStyle(
                fontSize: 16,
                color: NaaguruTheme.error,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
                child: _buildHostelOption('YES', _isTelugu ? 'అవును' : 'Yes')),
            const SizedBox(width: 8),
            Expanded(
                child: _buildHostelOption('NO', _isTelugu ? 'వద్దు' : 'No')),
            const SizedBox(width: 8),
            Expanded(
                child: _buildHostelOption(
                    'EITHER', _isTelugu ? 'ఏదైనా పర్వాలేదు' : 'Either is fine')),
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
    final isSelected = _wizard.hostel == value;
    return GestureDetector(
      onTap: () => setState(() => _wizard.selectHostel(value)),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? NaaguruTheme.primaryDark
              : NaaguruTheme.primaryLight.withAlpha(50),
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

  // ── Budget Selection ──────────────────────────────────────────────────────

  Widget _buildBudgetSelection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(
              child: Text(
                _isTelugu
                    ? 'మీ వార్షిక ట్యూషన్ ఫీజు అంచనా ఎంత?'
                    : "What's your approximate yearly tuition budget?",
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: NaaguruTheme.primaryDark,
                ),
              ),
            ),
            const Text(
              ' *',
              style: TextStyle(
                fontSize: 16,
                color: NaaguruTheme.error,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
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
            Expanded(
              child: _buildBudgetOption(
                'NOT_SURE',
                _isTelugu ? 'ఇంకా నిర్ణయించలేదు' : 'Not sure yet',
              ),
            ),
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
              const Icon(Icons.verified_user_outlined,
                  color: NaaguruTheme.primaryDark, size: 20),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _isTelugu
                          ? 'స్పష్టమైన మరియు పారదర్శకమైన'
                          : 'Clear & Transparent',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: NaaguruTheme.text,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _isTelugu
                          ? 'ఫీజు అంచనాలు నేరుగా కళాశాలల ద్వారా ధృవీకరించబడతాయి. దాచిన ఛార్జీలు లేవు.'
                          : 'Fee estimates are verified directly with institution administrations. No hidden discovery charges.',
                      style: const TextStyle(
                        fontSize: 12,
                        color: NaaguruTheme.muted,
                      ),
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
    final isSelected = _wizard.budget == value;
    return GestureDetector(
      onTap: () => setState(() => _wizard.selectBudget(value)),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        decoration: BoxDecoration(
          color: isSelected
              ? NaaguruTheme.primaryLight.withAlpha(50)
              : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? NaaguruTheme.primaryDark
                : NaaguruTheme.muted.withAlpha(30),
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
              const Icon(Icons.check_circle,
                  size: 18, color: NaaguruTheme.primaryDark)
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final canContinue = _wizard.isStep3Valid;

    return Scaffold(
      backgroundColor: NaaguruTheme.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios,
              color: NaaguruTheme.primaryDark, size: 20),
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
            child:
                Icon(Icons.person, size: 20, color: NaaguruTheme.primaryDark),
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
                      _isTelugu
                          ? 'మీరు ఎక్కడ చదవాలనుకుంటున్నారు?'
                          : 'Where would you like to study?',
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: NaaguruTheme.primaryDark,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _isTelugu
                          ? 'మీ ప్రాధాన్యత గల ప్రాంతం మరియు ముఖ్యమైన వివరాలను ఎంచుకోండి.'
                          : 'Choose your preferred area and a few things that matter to you.',
                      style: const TextStyle(
                        fontSize: 15,
                        color: NaaguruTheme.muted,
                      ),
                    ),
                    const SizedBox(height: 28),
                    _buildLocationSection(),
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
                border: Border(
                  top: BorderSide(color: NaaguruTheme.muted.withAlpha(40)),
                ),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  PrimaryButton(
                    text: _isTelugu
                        ? 'సమీక్షకు కొనసాగించండి →'
                        : 'Continue to Review →',
                    onPressed: canContinue ? _onContinue : null,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.lock_outline,
                          size: 12, color: NaaguruTheme.muted),
                      const SizedBox(width: 4),
                      Text(
                        _isTelugu
                            ? 'ప్రాధాన్యతలు ఎప్పుడైనా మార్చుకోవచ్చు'
                            : 'Preferences can be adjusted anytime later',
                        style: const TextStyle(
                          fontSize: 11,
                          color: NaaguruTheme.muted,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

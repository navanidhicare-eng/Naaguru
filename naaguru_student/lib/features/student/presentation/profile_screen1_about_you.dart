import 'dart:async';
import 'package:flutter/material.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/features/auth/auth_service.dart';
import 'package:naaguru_student/features/student/data/catalog_api_client.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';
import 'package:naaguru_student/features/student/presentation/location_picker_sheet.dart';
import 'package:naaguru_student/features/student/presentation/profile_screen2_where_you_live.dart';
import 'package:naaguru_student/features/student/presentation/profile_wizard_state.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Extra colors from the Stitch design system not already in NaaguruTheme
// ─────────────────────────────────────────────────────────────────────────────
class _C {
  static const surfaceContainer = Color(0xFFE3F1ED);
  static const surfaceContainerLow = Color(0xFFE9F7F3);
  static const surfaceContainerHigh = Color(0xFFDDEBE7);
  static const surfaceContainerHighest = Color(0xFFD8E5E2);
  static const onSurfaceVariant = Color(0xFF3E4946);
  static const secondaryContainer = Color(0xFFFEC24A);
  static const onSecondaryContainer = Color(0xFF715000);
}

/// Screen 1 of the mandatory profile wizard: "Complete Your Profile — About You".
///
/// Collects:
///   - Student's full name
///   - Gender (MALE / FEMALE)
///   - School selection via cascading School Location hierarchy:
///     State → District → Mandal → Village / City (Locality) → Partner School
///
/// Does NOT submit to the backend. Data is preserved in [ProfileWizardState].
/// Continue navigates to [ProfileScreen2WhereYouLive].
class ProfileScreen1AboutYou extends StatefulWidget {
  final AuthService authService;
  final StudentApiClient studentApiClient;
  final CatalogApiClient catalogApiClient;
  final ProfileWizardState? wizardState;

  const ProfileScreen1AboutYou({
    super.key,
    required this.authService,
    required this.studentApiClient,
    required this.catalogApiClient,
    this.wizardState,
  });

  @override
  State<ProfileScreen1AboutYou> createState() => _ProfileScreen1State();
}

class _ProfileScreen1State extends State<ProfileScreen1AboutYou> {
  // ── Wizard state ──────────────────────────────────────────────────────────
  late final ProfileWizardState _wizard;

  // ── Language ──────────────────────────────────────────────────────────────
  bool _isTelugu = false;

  // ── Name field ────────────────────────────────────────────────────────────
  late final TextEditingController _nameController;
  bool _nameTouched = false;

  // ── School selection ──────────────────────────────────────────────────────
  List<CatalogSchool> _schools = [];
  bool _schoolsLoading = false;
  bool _schoolsError = false;
  bool _initialFetchDone = false;

  // ── School-request sheet ──────────────────────────────────────────────────
  bool _showRequestSheet = false;
  final TextEditingController _requestNameController = TextEditingController();
  final TextEditingController _requestDistrictController =
      TextEditingController();
  final TextEditingController _requestMandalController =
      TextEditingController();

  @override
  void initState() {
    super.initState();
    _wizard = widget.wizardState ?? ProfileWizardState();
    _nameController = TextEditingController(text: _wizard.fullName);
    if (_wizard.fullName.isNotEmpty) {
      _nameTouched = true;
    }

    // Pre-fill name and gender from existing profile if available.
    _prefillName();

    // If returning with locality already selected, fetch schools.
    if (_wizard.schoolLocality != null) {
      _fetchSchools();
    }

    _nameController.addListener(_onNameChanged);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _requestNameController.dispose();
    _requestDistrictController.dispose();
    _requestMandalController.dispose();
    super.dispose();
  }

  Future<void> _prefillName() async {
    try {
      final profile = await widget.studentApiClient.getProfile();
      final name = profile?['fullName'] as String?;
      final gender = profile?['gender'] as String?;
      if (mounted) {
        if (name != null && name.isNotEmpty && _wizard.fullName.isEmpty) {
          _nameController.text = name;
          _wizard.fullName = name;
        }
        if (gender != null && _wizard.gender == null) {
          _wizard.updateGender(gender);
        }
      }
    } catch (_) {}
  }

  void _onNameChanged() {
    _wizard.updateFullName(_nameController.text);
    if (!_nameTouched && _nameController.text.isNotEmpty) {
      setState(() => _nameTouched = true);
    } else {
      setState(() {});
    }
  }

  // ── School location picker helpers ────────────────────────────────────────

  Future<void> _pickSchoolState() async {
    final picked = await LocationPickerSheet.show(
      context,
      levelLabel: 'School State',
      levelLabelTe: 'పాఠశాల రాష్ట్రం',
      isTelugu: _isTelugu,
      loader: () => widget.catalogApiClient.getLocations(type: 'STATE'),
      current: _wizard.schoolState,
    );
    if (picked != null && mounted) {
      setState(() {
        _wizard.selectSchoolState(picked);
        _schools = [];
        _initialFetchDone = false;
      });
    }
  }

  Future<void> _pickSchoolDistrict() async {
    if (_wizard.schoolState == null) return;
    final picked = await LocationPickerSheet.show(
      context,
      levelLabel: 'School District',
      levelLabelTe: 'పాఠశాల జిల్లా',
      isTelugu: _isTelugu,
      loader: () => widget.catalogApiClient.getLocations(
        type: 'DISTRICT',
        parentId: _wizard.schoolState!.id,
      ),
      current: _wizard.schoolDistrict,
    );
    if (picked != null && mounted) {
      setState(() {
        _wizard.selectSchoolDistrict(picked);
        _schools = [];
        _initialFetchDone = false;
      });
    }
  }

  Future<void> _pickSchoolMandal() async {
    if (_wizard.schoolDistrict == null) return;
    final picked = await LocationPickerSheet.show(
      context,
      levelLabel: 'School Mandal',
      levelLabelTe: 'పాఠశాల మండలం',
      isTelugu: _isTelugu,
      loader: () => widget.catalogApiClient.getLocations(
        type: 'MANDAL',
        parentId: _wizard.schoolDistrict!.id,
      ),
      current: _wizard.schoolMandal,
    );
    if (picked != null && mounted) {
      setState(() {
        _wizard.selectSchoolMandal(picked);
        _schools = [];
        _initialFetchDone = false;
      });
    }
  }

  Future<void> _pickSchoolLocality() async {
    if (_wizard.schoolMandal == null) return;
    final picked = await LocationPickerSheet.show(
      context,
      levelLabel: 'School Village / City',
      levelLabelTe: 'పాఠశాల గ్రామం / నగరం',
      isTelugu: _isTelugu,
      loader: () => widget.catalogApiClient.getLocations(
        type: 'LOCALITY',
        parentId: _wizard.schoolMandal!.id,
      ),
      current: _wizard.schoolLocality,
    );
    if (picked != null && mounted) {
      setState(() {
        _wizard.selectSchoolLocality(picked);
      });
      _fetchSchools();
    }
  }

  Future<void> _fetchSchools() async {
    if (_wizard.schoolLocality == null) {
      setState(() {
        _schools = [];
        _initialFetchDone = false;
      });
      return;
    }
    setState(() {
      _schoolsLoading = true;
      _schoolsError = false;
    });
    try {
      final results = await widget.catalogApiClient.getSchools(
        locationId: _wizard.schoolLocality!.id,
      );
      if (mounted) {
        setState(() {
          _schools = results;
          _schoolsLoading = false;
          _initialFetchDone = true;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _schoolsLoading = false;
          _schoolsError = true;
          _initialFetchDone = true;
        });
      }
    }
  }

  void _selectSchool(CatalogSchool school) {
    setState(() {
      if (_wizard.selectedSchool?.id == school.id) {
        _wizard.clearSchool();
      } else {
        _wizard.selectSchool(school);
      }
    });
  }

  void _openRequestSheet() {
    if (_wizard.schoolDistrict != null) {
      _requestDistrictController.text =
          _wizard.schoolDistrict!.displayName(_isTelugu);
    }
    if (_wizard.schoolMandal != null) {
      _requestMandalController.text =
          _wizard.schoolMandal!.displayName(_isTelugu);
    }
    setState(() => _showRequestSheet = true);
  }

  bool get _canContinue => _wizard.screen1Valid;

  void _handleContinue() {
    if (!_canContinue) return;
    Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => ProfileScreen2WhereYouLive(
        authService: widget.authService,
        studentApiClient: widget.studentApiClient,
        catalogApiClient: widget.catalogApiClient,
        wizardState: _wizard,
      ),
    ));
  }

  // ── Strings ───────────────────────────────────────────────────────────────
  String _s(String en, String te) => _isTelugu ? te : en;

  @override
  Widget build(BuildContext context) {
    final bottomPad = MediaQuery.of(context).viewInsets.bottom;

    return Scaffold(
      backgroundColor: NaaguruTheme.background,
      resizeToAvoidBottomInset: true,
      body: Stack(
        children: [
          SafeArea(
            bottom: false,
            child: Column(
              children: [
                _buildHeader(),
                _buildProgressBar(),
                Expanded(
                  child: SingleChildScrollView(
                    physics: const ClampingScrollPhysics(),
                    padding: EdgeInsets.only(
                      left: 16,
                      right: 16,
                      top: 8,
                      bottom: 100 + bottomPad,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildTitle(),
                        const SizedBox(height: 12),
                        _buildAssuranceCard(),
                        const SizedBox(height: 20),
                        _buildSectionHeading(),
                        const SizedBox(height: 16),
                        _buildNameField(),
                        const SizedBox(height: 20),
                        _buildGenderField(),
                        const SizedBox(height: 20),
                        _buildSchoolSection(),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Sticky bottom CTA.
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: _buildBottomCta(),
          ),
          // School-request bottom sheet overlay.
          if (_showRequestSheet) _buildSchoolRequestSheet(),
        ],
      ),
    );
  }

  // ── Header ────────────────────────────────────────────────────────────────

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: const BoxDecoration(
                  color: NaaguruTheme.primary,
                  shape: BoxShape.circle,
                ),
                child: const Center(
                  child: Text(
                    'N',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'Naaguru',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: NaaguruTheme.primary,
                  letterSpacing: -0.3,
                ),
              ),
            ],
          ),
          Row(
            children: [
              _buildLangButton('EN', !_isTelugu, () {
                if (_isTelugu) setState(() => _isTelugu = false);
              }),
              _buildLangButton('తెలుగు', _isTelugu, () {
                if (!_isTelugu) setState(() => _isTelugu = true);
              }),
              const SizedBox(width: 8),
              Container(
                width: 32,
                height: 32,
                decoration: const BoxDecoration(
                  color: NaaguruTheme.primary,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.person, color: Colors.white, size: 18),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLangButton(String text, bool active, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: active ? _C.surfaceContainerLow : Colors.transparent,
          borderRadius: BorderRadius.circular(100),
          boxShadow: active
              ? [
                  BoxShadow(
                    color: Colors.black.withAlpha(10),
                    blurRadius: 4,
                  ),
                ]
              : null,
        ),
        child: Text(
          text,
          style: TextStyle(
            fontSize: 12,
            fontWeight: active ? FontWeight.w600 : FontWeight.w500,
            color: active ? NaaguruTheme.primary : _C.onSurfaceVariant,
          ),
        ),
      ),
    );
  }

  // ── Progress ──────────────────────────────────────────────────────────────

  Widget _buildProgressBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 7,
                    height: 7,
                    decoration: const BoxDecoration(
                      color: NaaguruTheme.primary,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    _s('Step 1 of 3: About You', 'దశ 1/3: మీ గురించి'),
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: NaaguruTheme.primary,
                    ),
                  ),
                ],
              ),
              const Text(
                '33%',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: NaaguruTheme.muted,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(100),
            child: const LinearProgressIndicator(
              value: 0.33,
              minHeight: 4,
              backgroundColor: _C.surfaceContainerHigh,
              color: NaaguruTheme.primary,
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  // ── Title & Intro ─────────────────────────────────────────────────────────

  Widget _buildTitle() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          _s('Complete Your Profile', 'మీ ప్రొఫైల్ పూర్తి చేయండి'),
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w700,
            color: NaaguruTheme.text,
            letterSpacing: -0.4,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          _s(
            'This helps us give you accurate guidance for intermediate & polytechnic admissions.',
            'ఇంటర్మీడియట్ & పాలిటెక్నిక్ ప్రవేశాలకు ఖచ్చితమైన మార్గదర్శకత్వాన్ని అందించడానికి ఇది సహాయపడుతుంది.',
          ),
          style: const TextStyle(
            fontSize: 14,
            color: NaaguruTheme.muted,
            height: 1.4,
          ),
        ),
      ],
    );
  }

  Widget _buildAssuranceCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: _C.surfaceContainerLow,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(8),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: NaaguruTheme.surface,
              borderRadius: BorderRadius.circular(10),
              boxShadow: [
                BoxShadow(color: Colors.black.withAlpha(10), blurRadius: 4),
              ],
            ),
            child: const Icon(Icons.shield_outlined,
                color: NaaguruTheme.primary, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      _s('Privacy First', 'గోప్యతకు ప్రాధాన్యత'),
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: NaaguruTheme.primary,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      width: 4,
                      height: 4,
                      decoration: BoxDecoration(
                        color: NaaguruTheme.muted.withAlpha(120),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      _s('Class 10 Students', '10వ తరగతి విద్యార్థులు'),
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w500,
                        color: NaaguruTheme.muted,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  _s(
                    'Your school selection helps us find the right colleges near you.',
                    'మీ పాఠశాల ఎంపిక మీకు సమీపంలోని సరైన కళాశాలలను కనుగొనడంలో సహాయపడుతుంది.',
                  ),
                  style: const TextStyle(
                    fontSize: 12,
                    color: NaaguruTheme.muted,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Section heading ───────────────────────────────────────────────────────

  Widget _buildSectionHeading() {
    return Text(
      _s('Student Identity', 'విద్యార్థి వివరాలు'),
      style: const TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: NaaguruTheme.text,
      ),
    );
  }

  // ── Name field ────────────────────────────────────────────────────────────

  Widget _buildNameField() {
    final hasError = _nameTouched && _nameController.text.trim().isEmpty;
    final hasValue = _nameController.text.trim().isNotEmpty;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              _s('Full Name', 'పూర్తి పేరు'),
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: NaaguruTheme.text,
              ),
            ),
            const Text(
              ' *',
              style: TextStyle(
                fontSize: 13,
                color: NaaguruTheme.error,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        const SizedBox(height: 6),
        Container(
          height: 52,
          decoration: BoxDecoration(
            color: NaaguruTheme.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: hasError
                  ? NaaguruTheme.error
                  : (hasValue ? NaaguruTheme.primary : Colors.transparent),
              width: hasError || hasValue ? 1.5 : 1,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(8),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            children: [
              const SizedBox(width: 14),
              Icon(
                Icons.person_outline_rounded,
                size: 20,
                color: hasValue ? NaaguruTheme.primary : NaaguruTheme.muted,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: _nameController,
                  style:
                      const TextStyle(fontSize: 15, color: NaaguruTheme.text),
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    hintText: _s('Enter your name as in school records',
                        'పాఠశాల రికార్డులలో ఉన్నట్లు పేరు నమోదు చేయండి'),
                    hintStyle: TextStyle(
                      fontSize: 15,
                      color: NaaguruTheme.muted.withAlpha(180),
                      fontWeight: FontWeight.w400,
                    ),
                    isDense: true,
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
              ),
              if (hasValue) ...[
                const Icon(Icons.check_circle_rounded,
                    color: NaaguruTheme.primary, size: 20),
                const SizedBox(width: 14),
              ] else
                const SizedBox(width: 14),
            ],
          ),
        ),
        if (hasError) ...[
          const SizedBox(height: 4),
          Text(
            _s('Please enter your full name.',
                'దయచేసి పూర్తి పేరు నమోదు చేయండి.'),
            style: const TextStyle(
              fontSize: 11,
              color: NaaguruTheme.error,
            ),
          ),
        ],
      ],
    );
  }

  // ── Gender field ──────────────────────────────────────────────────────────

  Widget _buildGenderField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              _s('Gender', 'లింగం'),
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: NaaguruTheme.text,
              ),
            ),
            const Text(
              ' *',
              style: TextStyle(
                fontSize: 13,
                color: NaaguruTheme.error,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: _buildGenderOption(
                  'MALE', _s('Male', 'పురుషుడు'), Icons.male_rounded),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildGenderOption(
                  'FEMALE', _s('Female', 'స్త్రీ'), Icons.female_rounded),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildGenderOption(String value, String label, IconData icon) {
    final isSelected = _wizard.gender == value;
    return GestureDetector(
      onTap: () => _wizard.updateGender(value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: 52,
        decoration: BoxDecoration(
          color: isSelected ? _C.surfaceContainerLow : NaaguruTheme.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? NaaguruTheme.primary : Colors.transparent,
            width: 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(8),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon,
                size: 20,
                color: isSelected ? NaaguruTheme.primary : NaaguruTheme.muted),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 14,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                color: isSelected ? NaaguruTheme.primary : NaaguruTheme.text,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── School section ────────────────────────────────────────────────────────

  Widget _buildSchoolSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              _s('Which school do you study at?',
                  'మీరు ఏ పాఠశాలలో చదువుతున్నారు?'),
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: NaaguruTheme.text,
              ),
            ),
            const Text(
              ' *',
              style: TextStyle(
                fontSize: 13,
                color: NaaguruTheme.error,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        const SizedBox(height: 2),
        Text(
          _s(
            'Select your school location to view schools (Andhra Pradesh & Telangana)',
            'పాఠశాలలను చూడటానికి మీ పాఠశాల ప్రాంతాన్ని ఎంచుకోండి (ఆంధ్రప్రదేశ్ & తెలంగాణ)',
          ),
          style: const TextStyle(fontSize: 12, color: NaaguruTheme.muted),
        ),
        const SizedBox(height: 10),
        _buildSchoolLocationBlock(),
        const SizedBox(height: 14),
        _buildSchoolListSection(),
        const SizedBox(height: 10),
        _buildTrustLine(),
      ],
    );
  }

  Widget _buildSchoolLocationBlock() {
    return Container(
      decoration: BoxDecoration(
        color: NaaguruTheme.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          _locationRow(
            sublabel: _s('SCHOOL STATE', 'పాఠశాల రాష్ట్రం'),
            value: _wizard.schoolState?.displayName(_isTelugu),
            placeholder:
                _s('Select school state', 'పాఠశాల రాష్ట్రాన్ని ఎంచుకోండి'),
            enabled: true,
            onTap: _pickSchoolState,
          ),
          _divider(),
          _locationRow(
            sublabel: _s('SCHOOL DISTRICT', 'పాఠశాల జిల్లా'),
            value: _wizard.schoolDistrict?.displayName(_isTelugu),
            placeholder: _wizard.schoolState != null
                ? _s('Select school district', 'పాఠశాల జిల్లాను ఎంచుకోండి')
                : _s('Select state first', 'ముందు రాష్ట్రం ఎంచుకోండి'),
            enabled: _wizard.schoolState != null,
            onTap: _pickSchoolDistrict,
          ),
          _divider(),
          _locationRow(
            sublabel: _s('SCHOOL MANDAL', 'పాఠశాల మండలం'),
            value: _wizard.schoolMandal?.displayName(_isTelugu),
            placeholder: _wizard.schoolDistrict != null
                ? _s('Select school mandal', 'పాఠశాల మండలాన్ని ఎంచుకోండి')
                : _s('Select district first', 'ముందు జిల్లా ఎంచుకోండి'),
            enabled: _wizard.schoolDistrict != null,
            onTap: _pickSchoolMandal,
          ),
          _divider(),
          _locationRow(
            sublabel: _s('SCHOOL VILLAGE / CITY / WARD',
                'పాఠశాల గ్రామం / నగరం / వార్డు'),
            value: _wizard.schoolLocality?.displayName(_isTelugu),
            placeholder: _wizard.schoolMandal != null
                ? _s('Select school village or city',
                    'గ్రామం లేదా నగరాన్ని ఎంచుకోండి')
                : _s('Select mandal first', 'ముందు మండలం ఎంచుకోండి'),
            enabled: _wizard.schoolMandal != null,
            onTap: _pickSchoolLocality,
          ),
        ],
      ),
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

  // ── School List Section ───────────────────────────────────────────────────

  Widget _buildSchoolListSection() {
    // 1. If locality not selected, show helper card.
    if (_wizard.schoolLocality == null) {
      return Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: _C.surfaceContainerLow,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: _C.surfaceContainerHigh),
        ),
        child: Row(
          children: [
            const Icon(Icons.info_outline_rounded,
                color: NaaguruTheme.primary, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                _s(
                  'Select your school location to see schools.',
                  'పాఠశాలలను చూడటానికి మీ పాఠశాల ప్రాంతాన్ని ఎంచుకోండి.',
                ),
                style: const TextStyle(
                  fontSize: 13,
                  color: NaaguruTheme.text,
                  height: 1.4,
                ),
              ),
            ),
          ],
        ),
      );
    }

    // 2. Locality is selected: show container with header and school list.
    final localityName = _wizard.schoolLocality!.displayName(_isTelugu);

    return Container(
      decoration: BoxDecoration(
        color: NaaguruTheme.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header showing area.
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Row(
                    children: [
                      const Icon(Icons.location_on_rounded,
                          size: 16, color: NaaguruTheme.primary),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          _s('Schools in $localityName',
                              '$localityName లోని పాఠశాలలు'),
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: NaaguruTheme.text,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
                if (_initialFetchDone && !_schoolsLoading)
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                    decoration: BoxDecoration(
                      color: _C.surfaceContainerLow,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      '${_schools.length}',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: NaaguruTheme.primary,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          _divider(),

          // Body: loading, error, empty, or list.
          if (_schoolsLoading && !_initialFetchDone)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: NaaguruTheme.primary,
                      ),
                    ),
                    SizedBox(width: 10),
                    Text(
                      'Finding schools...',
                      style: TextStyle(
                        fontSize: 13,
                        color: NaaguruTheme.muted,
                      ),
                    ),
                  ],
                ),
              ),
            )
          else if (_schoolsError)
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  const Icon(Icons.cloud_off_outlined,
                      color: NaaguruTheme.muted, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      _s('Could not load schools.', 'పాఠశాలలు లోడ్ కాలేదు.'),
                      style: const TextStyle(
                          fontSize: 13, color: NaaguruTheme.muted),
                    ),
                  ),
                  TextButton(
                    onPressed: _fetchSchools,
                    child: Text(_s('Retry', 'మళ్లీ ప్రయత్నించండి')),
                  ),
                ],
              ),
            )
          else if (_initialFetchDone && _schools.isEmpty)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
              child: Column(
                children: [
                  const Icon(Icons.school_outlined,
                      color: NaaguruTheme.muted, size: 32),
                  const SizedBox(height: 8),
                  Text(
                    _s('No schools available in this area.',
                        'ఈ ప్రాంతంలో పాఠశాలలు అందుబాటులో లేవు.'),
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: NaaguruTheme.muted,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  GestureDetector(
                    onTap: _openRequestSheet,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.add_circle_outline_rounded,
                            color: NaaguruTheme.primary, size: 18),
                        const SizedBox(width: 6),
                        Text(
                          _s("Request your school",
                              'మీ పాఠశాలను అభ్యర్థించండి'),
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: NaaguruTheme.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            )
          else
            Padding(
              padding: const EdgeInsets.fromLTRB(12, 10, 12, 4),
              child: Column(
                children: [
                  for (int i = 0; i < _schools.length; i++) ...[
                    if (i > 0) const SizedBox(height: 8),
                    _SchoolRow(
                      school: _schools[i],
                      localityInfo:
                          '${_wizard.schoolLocality?.displayName(_isTelugu) ?? ''}, ${_wizard.schoolMandal?.displayName(_isTelugu) ?? ''}',
                      isSelected:
                          _wizard.selectedSchool?.id == _schools[i].id,
                      isTelugu: _isTelugu,
                      onTap: () => _selectSchool(_schools[i]),
                    ),
                  ],
                  if (_schoolsLoading && _initialFetchDone)
                    const Padding(
                      padding: EdgeInsets.only(top: 8),
                      child: LinearProgressIndicator(
                        minHeight: 2,
                        color: NaaguruTheme.primary,
                        backgroundColor: Colors.transparent,
                      ),
                    ),
                  const SizedBox(height: 8),
                  _buildSchoolFooter(),
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildSchoolFooter() {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          GestureDetector(
            onTap: _openRequestSheet,
            child: Row(
              children: [
                const Icon(Icons.add_circle_outline_rounded,
                    color: NaaguruTheme.primary, size: 16),
                const SizedBox(width: 4),
                Text(
                  _s("Can't find your school?", 'మీ పాఠశాల కనిపించలేదా?'),
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: NaaguruTheme.primary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTrustLine() {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Icon(Icons.verified_user_outlined,
            color: NaaguruTheme.primary, size: 16),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            _s(
              'Select your school from the partner schools currently available on Naaguru.',
              'నాగురులో అందుబాటులో ఉన్న భాగస్వామ్య పాఠశాలల నుండి మీ పాఠశాలను ఎంచుకోండి.',
            ),
            style: const TextStyle(
                fontSize: 12, color: NaaguruTheme.muted, height: 1.4),
          ),
        ),
      ],
    );
  }

  // ── Bottom CTA ────────────────────────────────────────────────────────────

  Widget _buildBottomCta() {
    final bottomInset = MediaQuery.of(context).viewInsets.bottom;
    final safeBottom = MediaQuery.of(context).padding.bottom;
    final effectivePad = bottomInset > 0 ? bottomInset : safeBottom;

    return Container(
      padding: EdgeInsets.fromLTRB(16, 10, 16, 12 + effectivePad),
      decoration: BoxDecoration(
        color: NaaguruTheme.surface.withAlpha(242),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(18),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: _canContinue ? _handleContinue : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: NaaguruTheme.primary,
                disabledBackgroundColor: _C.surfaceContainerHighest,
                foregroundColor: Colors.white,
                disabledForegroundColor: NaaguruTheme.muted,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
                elevation: _canContinue ? 2 : 0,
                textStyle: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(_s('Continue', 'కొనసాగించండి')),
                  const SizedBox(width: 6),
                  const Icon(Icons.arrow_forward_rounded, size: 18),
                ],
              ),
            ),
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.lock_outline_rounded,
                  size: 12, color: NaaguruTheme.muted),
              const SizedBox(width: 4),
              Text(
                _s('Step 1 of 3 • You can edit anytime later',
                    'దశ 1/3 • తర్వాత ఎప్పుడైనా సవరించుకోవచ్చు'),
                style: const TextStyle(
                  fontSize: 11,
                  color: NaaguruTheme.muted,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // ── School request bottom sheet ───────────────────────────────────────────

  Widget _buildSchoolRequestSheet() {
    return GestureDetector(
      onTap: () => setState(() => _showRequestSheet = false),
      child: Container(
        color: Colors.black.withAlpha(100),
        child: Align(
          alignment: Alignment.bottomCenter,
          child: GestureDetector(
            onTap: () {},
            child: Container(
              decoration: const BoxDecoration(
                color: NaaguruTheme.surface,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              padding: EdgeInsets.fromLTRB(
                20,
                20,
                20,
                20 + MediaQuery.of(context).padding.bottom,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 32,
                            height: 32,
                            decoration: BoxDecoration(
                              color: _C.surfaceContainer,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(Icons.assignment_add,
                                color: NaaguruTheme.primary, size: 18),
                          ),
                          const SizedBox(width: 10),
                          Text(
                            _s('Request Your School', 'పాఠశాల అభ్యర్థన'),
                            style: const TextStyle(
                              fontSize: 17,
                              fontWeight: FontWeight.w600,
                              color: NaaguruTheme.text,
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded,
                            color: NaaguruTheme.muted),
                        onPressed: () =>
                            setState(() => _showRequestSheet = false),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: _C.surfaceContainerLow,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.info_outline_rounded,
                            color: NaaguruTheme.primary, size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            _s(
                              'Our team will review your school request and add it to the catalog.',
                              'మా బృందం మీ పాఠశాల అభ్యర్థనను సమీక్షించి జోడిస్తుంది.',
                            ),
                            style: const TextStyle(
                                fontSize: 12,
                                color: NaaguruTheme.text,
                                height: 1.5),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  _sheetField(
                    label: _s('Official School Name', 'పాఠశాల అధికారిక పేరు'),
                    hint: _s('e.g. Govt High School, Bheemunipatnam',
                        'ఉదా: ప్రభుత్వ హై స్కూల్'),
                    controller: _requestNameController,
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: _sheetField(
                          label: _s('District', 'జిల్లా'),
                          hint: _s('e.g. Visakhapatnam', 'ఉదా: విశాఖపట్నం'),
                          controller: _requestDistrictController,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _sheetField(
                          label: _s('Mandal / Locality', 'మండలం / ప్రాంతం'),
                          hint: _s('e.g. Bheemili', 'ఉదా: భీమిలి'),
                          controller: _requestMandalController,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () =>
                              setState(() => _showRequestSheet = false),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(
                                color: NaaguruTheme.muted.withAlpha(100)),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                            minimumSize: const Size.fromHeight(46),
                          ),
                          child: Text(_s('Cancel', 'రద్దు'),
                              style: const TextStyle(
                                  color: NaaguruTheme.muted,
                                  fontWeight: FontWeight.w600)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            setState(() => _showRequestSheet = false);
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(_s(
                                  'School request submitted for review.',
                                  'పాఠశాల అభ్యర్థన సమీక్షకు పంపబడింది.',
                                )),
                              ),
                            );
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: NaaguruTheme.primary,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12)),
                            minimumSize: const Size.fromHeight(46),
                          ),
                          child: Text(_s('Submit', 'సమర్పించండి'),
                              style:
                                  const TextStyle(fontWeight: FontWeight.w600)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _sheetField({
    required String label,
    required String hint,
    required TextEditingController controller,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: NaaguruTheme.text)),
        const SizedBox(height: 4),
        TextField(
          controller: controller,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: TextStyle(fontSize: 13, color: NaaguruTheme.muted),
            filled: true,
            fillColor: _C.surfaceContainer,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
              borderSide: BorderSide.none,
            ),
          ),
        ),
      ],
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// School row widget
// ─────────────────────────────────────────────────────────────────────────────

class _SchoolRow extends StatelessWidget {
  final CatalogSchool school;
  final String localityInfo;
  final bool isSelected;
  final bool isTelugu;
  final VoidCallback onTap;

  const _SchoolRow({
    required this.school,
    required this.localityInfo,
    required this.isSelected,
    required this.isTelugu,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final displayName =
        (isTelugu && school.nameTe != null && school.nameTe!.isNotEmpty)
            ? school.nameTe!
            : school.nameEn;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isSelected ? _C.surfaceContainerLow : NaaguruTheme.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected
                ? NaaguruTheme.primary.withAlpha(120)
                : _C.surfaceContainerHigh,
            width: isSelected ? 1.5 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: NaaguruTheme.primary.withAlpha(20),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : null,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon badge.
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                color: isSelected
                    ? _C.surfaceContainer
                    : _C.surfaceContainerHigh,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.school_rounded,
                size: 18,
                color: isSelected
                    ? NaaguruTheme.primary
                    : _C.onSurfaceVariant,
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    displayName,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: NaaguruTheme.text,
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? _C.secondaryContainer
                              : _C.surfaceContainer,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          isTelugu ? 'భాగస్వామ్య పాఠశాల' : 'Partner School',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: isSelected
                                ? _C.onSecondaryContainer
                                : _C.onSurfaceVariant,
                          ),
                        ),
                      ),
                      if (localityInfo.isNotEmpty) ...[
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            localityInfo,
                            style: const TextStyle(
                              fontSize: 11,
                              color: NaaguruTheme.muted,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 8),
            // Selection indicator.
            isSelected
                ? const Icon(Icons.check_circle_rounded,
                    color: NaaguruTheme.primary, size: 22)
                : Icon(Icons.radio_button_unchecked_rounded,
                    color: _C.surfaceContainerHighest, size: 22),
          ],
        ),
      ),
    );
  }
}

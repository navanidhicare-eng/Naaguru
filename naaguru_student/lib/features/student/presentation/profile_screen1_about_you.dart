import 'dart:async';
import 'package:flutter/material.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/features/auth/auth_service.dart';
import 'package:naaguru_student/features/student/data/catalog_api_client.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';
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
  static const primaryContainer = Color(0xFF087F6C); // same as primary
}

/// Screen 1 of the mandatory profile wizard: "Complete Your Profile — About You".
///
/// Collects:
///   - Student's full name
///   - School selection (live search from GET /catalog/schools)
///
/// Does NOT submit to the backend. Data is preserved in [ProfileWizardState].
/// Continue navigates to [ProfileScreen2WhereYouLive].
class ProfileScreen1AboutYou extends StatefulWidget {
  final AuthService authService;
  final StudentApiClient studentApiClient;
  final CatalogApiClient catalogApiClient;

  const ProfileScreen1AboutYou({
    super.key,
    required this.authService,
    required this.studentApiClient,
    required this.catalogApiClient,
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

  // ── School search ─────────────────────────────────────────────────────────
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounce;
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
    _wizard = ProfileWizardState();
    _nameController = TextEditingController();

    // Pre-fill name from existing profile if available.
    _prefillName();

    // Load initial school list (no filter).
    _fetchSchools();

    _searchController.addListener(_onSearchChanged);
    _nameController.addListener(_onNameChanged);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _nameController.dispose();
    _searchController.dispose();
    _requestNameController.dispose();
    _requestDistrictController.dispose();
    _requestMandalController.dispose();
    _wizard.dispose();
    super.dispose();
  }

  Future<void> _prefillName() async {
    try {
      final profile = await widget.studentApiClient.getProfile();
      final name = profile?['fullName'] as String?;
      final gender = profile?['gender'] as String?;
      if (mounted) {
        if (name != null && name.isNotEmpty) {
          _nameController.text = name;
          _wizard.fullName = name;
        }
        if (gender != null) {
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

  void _onSearchChanged() {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), () {
      _fetchSchools(query: _searchController.text);
    });
  }

  Future<void> _fetchSchools({String? query}) async {
    setState(() {
      _schoolsLoading = true;
      _schoolsError = false;
    });
    try {
      final results = await widget.catalogApiClient.getSchools(search: query);
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
      // Resize so keyboard pushes content up correctly.
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
                      // Extra bottom pad so content is not hidden by sticky CTA.
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
          if (_showRequestSheet)
            _buildSchoolRequestSheet(),
        ],
      ),
    );
  }

  // ── Header ────────────────────────────────────────────────────────────────

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: Row(
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
                child: const Icon(Icons.school_rounded,
                    color: NaaguruTheme.primary, size: 18),
              ),
              const SizedBox(width: 8),
              Text(
                'Naaguru',
                style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  color: NaaguruTheme.primary,
                  letterSpacing: -0.3,
                ),
              ),
            ],
          ),
          // Pill-style language toggle matching Stitch.
          _buildLanguageToggle(),
        ],
      ),
    );
  }

  Widget _buildLanguageToggle() {
    return Container(
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: _C.surfaceContainerHigh,
        borderRadius: BorderRadius.circular(100),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _langPill('English', !_isTelugu, () => setState(() => _isTelugu = false)),
          _langPill('తెలుగు', _isTelugu, () => setState(() => _isTelugu = true)),
        ],
      ),
    );
  }

  Widget _langPill(String label, bool active, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: active ? NaaguruTheme.surface : Colors.transparent,
          borderRadius: BorderRadius.circular(100),
          boxShadow: active
              ? [BoxShadow(color: Colors.black.withAlpha(20), blurRadius: 4)]
              : null,
        ),
        child: Text(
          label,
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
                    decoration: BoxDecoration(
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
              Text(
                '33%',
                style: const TextStyle(
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
            child: LinearProgressIndicator(
              value: 1 / 3,
              minHeight: 6,
              backgroundColor: _C.surfaceContainerHigh,
              valueColor: AlwaysStoppedAnimation<Color>(_C.primaryContainer),
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  // ── Title ─────────────────────────────────────────────────────────────────

  Widget _buildTitle() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          _s('Complete Your Profile', 'మీ ప్రొఫైల్‌ను పూర్తి చేయండి'),
          style: const TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w700,
            color: NaaguruTheme.text,
            letterSpacing: -0.5,
            height: 1.2,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          _s('Just a few details to get you started.',
              'మీ ప్రారంభానికి కొన్ని ముఖ్య వివరాలు.'),
          style: const TextStyle(
            fontSize: 14,
            color: NaaguruTheme.muted,
            height: 1.4,
          ),
        ),
      ],
    );
  }

  // ── Assurance card ────────────────────────────────────────────────────────

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
              color: _C.surfaceContainer,
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.timer_rounded,
                color: NaaguruTheme.primary, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              _s(
                'Takes less than 2 minutes. Your details help us map local opportunities accurately.',
                '2 నిమిషాల కన్నా తక్కువ సమయం పడుతుంది. స్థానిక అవకాశాలను గుర్తించడంలో ఇది తోడ్పడుతుంది.',
              ),
              style: const TextStyle(
                fontSize: 12,
                color: NaaguruTheme.text,
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Section heading ───────────────────────────────────────────────────────

  Widget _buildSectionHeading() {
    return Text(
      _s('About You', 'మీ గురించి'),
      style: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: NaaguruTheme.text,
      ),
    );
  }

  // ── Name field ────────────────────────────────────────────────────────────

  Widget _buildNameField() {
    final bool hasError =
        _nameTouched && _nameController.text.trim().isEmpty;
    final bool hasValue = _nameController.text.trim().isNotEmpty;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              _s('Your full name', 'పూర్తి పేరు'),
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
        Container(
          height: 52,
          decoration: BoxDecoration(
            color: NaaguruTheme.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: hasError
                  ? NaaguruTheme.error
                  : hasValue
                      ? NaaguruTheme.primary.withAlpha(100)
                      : Colors.transparent,
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(10),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            children: [
              const SizedBox(width: 14),
              const Icon(Icons.person_outline_rounded,
                  color: NaaguruTheme.primary, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: _nameController,
                  textCapitalization: TextCapitalization.words,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w500,
                    color: NaaguruTheme.text,
                  ),
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    hintText: _s('Enter full name', 'పూర్తి పేరు నమోదు చేయండి'),
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
            _s('Please enter your full name.', 'దయచేసి పూర్తి పేరు నమోదు చేయండి.'),
            style: const TextStyle(
              fontSize: 11,
              color: NaaguruTheme.error,
            ),
          ),
        ],
      ],
    );
  }

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
              child: _buildGenderOption('MALE', _s('Male', 'పురుషుడు'), Icons.male_rounded),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildGenderOption('FEMALE', _s('Female', 'స్త్రీ'), Icons.female_rounded),
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
        Text(
          _s('Which school do you study at?', 'మీరు ఏ పాఠశాలలో చదువుతున్నారు?'),
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: NaaguruTheme.text,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          _s(
            'Class 10 school from Andhra Pradesh or Telangana',
            'ఆంధ్రప్రదేశ్ లేదా తెలంగాణలోని 10వ తరగతి పాఠశాల',
          ),
          style: const TextStyle(fontSize: 12, color: NaaguruTheme.muted),
        ),
        const SizedBox(height: 10),
        Container(
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
              // Search input.
              _buildSchoolSearch(),
              // Results list.
              _buildSchoolList(),
              // Can't find action + neutral copy.
              _buildSchoolFooter(),
            ],
          ),
        ),
        const SizedBox(height: 10),
        _buildTrustLine(),
      ],
    );
  }

  Widget _buildSchoolSearch() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 12, 12, 8),
      child: Container(
        height: 44,
        decoration: BoxDecoration(
          color: _C.surfaceContainer,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            const SizedBox(width: 12),
            Icon(Icons.search_rounded, color: NaaguruTheme.muted, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: TextField(
                controller: _searchController,
                style: const TextStyle(fontSize: 14, color: NaaguruTheme.text),
                decoration: InputDecoration(
                  border: InputBorder.none,
                  hintText: _s(
                    'Search school name or locality...',
                    'పాఠశాల పేరు లేదా ప్రాంతం శోధించండి...',
                  ),
                  hintStyle: const TextStyle(
                    fontSize: 14,
                    color: NaaguruTheme.muted,
                  ),
                  isDense: true,
                  contentPadding: EdgeInsets.zero,
                ),
              ),
            ),
            if (_searchController.text.isNotEmpty)
              GestureDetector(
                onTap: () {
                  _searchController.clear();
                  _fetchSchools();
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child:
                      Icon(Icons.close_rounded, color: NaaguruTheme.muted, size: 18),
                ),
              )
            else
              const SizedBox(width: 12),
          ],
        ),
      ),
    );
  }

  Widget _buildSchoolList() {
    if (_schoolsLoading && !_initialFetchDone) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 24),
        child: Center(
          child: CircularProgressIndicator(
            strokeWidth: 2,
            color: NaaguruTheme.primary,
          ),
        ),
      );
    }

    if (_schoolsError) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
        child: Row(
          children: [
            const Icon(Icons.cloud_off_outlined,
                color: NaaguruTheme.muted, size: 18),
            const SizedBox(width: 8),
            Text(
              _s('Could not load schools. Tap to retry.',
                  'పాఠశాలలు లోడ్ కాలేదు. మళ్లీ ప్రయత్నించండి.'),
              style: const TextStyle(fontSize: 13, color: NaaguruTheme.muted),
            ),
          ],
        ),
      );
    }

    if (_initialFetchDone && _schools.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
        child: Center(
          child: Text(
            _s('No schools found. Try a different search.',
                'ఏ పాఠశాల కనుగొనబడలేదు. వేరే పదం ప్రయత్నించండి.'),
            style: const TextStyle(fontSize: 13, color: NaaguruTheme.muted),
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    // Show up to 5 results so the list stays usable without scrolling.
    final visible = _schools.take(5).toList();
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 0, 12, 0),
      child: Column(
        children: [
          for (int i = 0; i < visible.length; i++) ...[
            if (i > 0) const SizedBox(height: 6),
            _SchoolRow(
              school: visible[i],
              isSelected: _wizard.selectedSchool?.id == visible[i].id,
              isTelugu: _isTelugu,
              onTap: () => _selectSchool(visible[i]),
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
        ],
      ),
    );
  }

  Widget _buildSchoolFooter() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 14),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          GestureDetector(
            onTap: () => setState(() => _showRequestSheet = true),
            child: Row(
              children: [
                const Icon(Icons.add_circle_outline_rounded,
                    color: NaaguruTheme.primary, size: 18),
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
              'Select your school from the schools currently available on Naaguru.',
              'నాగురులో అందుబాటులో ఉన్న పాఠశాలల నుండి మీ పాఠశాలను ఎంచుకోండి.',
            ),
            style:
                const TextStyle(fontSize: 12, color: NaaguruTheme.muted, height: 1.4),
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

  // ── School request bottom sheet ────────────────────────────────────────────

  Widget _buildSchoolRequestSheet() {
    return GestureDetector(
      onTap: () => setState(() => _showRequestSheet = false),
      child: Container(
        color: Colors.black.withAlpha(100),
        child: Align(
          alignment: Alignment.bottomCenter,
          child: GestureDetector(
            // Prevent taps inside the sheet from closing it.
            onTap: () {},
            child: Container(
              decoration: const BoxDecoration(
                color: NaaguruTheme.surface,
                borderRadius:
                    BorderRadius.vertical(top: Radius.circular(24)),
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
                                fontSize: 12, color: NaaguruTheme.text, height: 1.5),
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
                              style: const TextStyle(fontWeight: FontWeight.w600)),
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
  final bool isSelected;
  final bool isTelugu;
  final VoidCallback onTap;

  const _SchoolRow({
    required this.school,
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
                ? NaaguruTheme.primary.withAlpha(80)
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
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: isSelected
                    ? _C.surfaceContainer
                    : _C.surfaceContainerHigh,
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.account_balance_rounded,
                size: 16,
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
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: NaaguruTheme.text,
                      height: 1.3,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      // Board chip — backend doesn't return board; show 'School' as neutral chip.
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
                          'School',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            color: isSelected
                                ? _C.onSecondaryContainer
                                : _C.onSurfaceVariant,
                          ),
                        ),
                      ),
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

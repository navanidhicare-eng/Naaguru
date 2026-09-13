import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/features/auth/auth_service.dart';
import 'package:naaguru_student/features/student/data/catalog_api_client.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';
import 'package:naaguru_student/features/student/presentation/location_picker_sheet.dart';
import 'package:naaguru_student/features/student/presentation/profile_screen3_review.dart';
import 'package:naaguru_student/features/student/presentation/profile_wizard_state.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Shared Stitch-palette extras (mirrors Screen 1 constants).
// ─────────────────────────────────────────────────────────────────────────────
class _C {
  static const surfaceContainer = Color(0xFFE3F1ED);
  static const surfaceContainerLow = Color(0xFFE9F7F3);
  static const surfaceContainerHigh = Color(0xFFDDEBE7);
  static const surfaceContainerHighest = Color(0xFFD8E5E2);
  static const onSurfaceVariant = Color(0xFF3E4946);
  static final _pincodeRegex = RegExp(r'^[1-9][0-9]{5}$');
}

/// Screen 2 of the mandatory profile wizard: "Where do you live?"
///
/// Collects:
///   - State → District → Mandal → Locality (cascading, real backend data)
///   - Postal Pincode (validated 6-digit)
///   - Optional landmark
///
/// Does NOT submit to the backend or call markProfileComplete().
/// Continue navigates to [ProfileScreen3Review].
class ProfileScreen2WhereYouLive extends StatefulWidget {
  final AuthService authService;
  final StudentApiClient studentApiClient;
  final CatalogApiClient catalogApiClient;
  final ProfileWizardState wizardState;

  const ProfileScreen2WhereYouLive({
    super.key,
    required this.authService,
    required this.studentApiClient,
    required this.catalogApiClient,
    required this.wizardState,
  });

  @override
  State<ProfileScreen2WhereYouLive> createState() =>
      _ProfileScreen2State();
}

class _ProfileScreen2State extends State<ProfileScreen2WhereYouLive> {
  bool _isTelugu = false;

  // Pincode field
  late final TextEditingController _pincodeController;
  bool _pincodeTouched = false;

  // Landmark field
  late final TextEditingController _landmarkController;

  ProfileWizardState get _wizard => widget.wizardState;

  @override
  void initState() {
    super.initState();
    _pincodeController =
        TextEditingController(text: _wizard.pincode);
    _landmarkController =
        TextEditingController(text: _wizard.landmark);

    _pincodeController.addListener(() {
      _wizard.updatePincode(_pincodeController.text);
      setState(() {
        if (_pincodeController.text.isNotEmpty) _pincodeTouched = true;
      });
    });
    _landmarkController.addListener(() {
      _wizard.updateLandmark(_landmarkController.text);
    });
  }

  @override
  void dispose() {
    _pincodeController.dispose();
    _landmarkController.dispose();
    super.dispose();
  }

  String _s(String en, String te) => _isTelugu ? te : en;

  bool get _canContinue => _wizard.screen2Valid;

  void _handleContinue() {
    if (!_canContinue) return;
    Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => ProfileScreen3Review(
        authService: widget.authService,
        studentApiClient: widget.studentApiClient,
        catalogApiClient: widget.catalogApiClient,
        wizardState: _wizard,
      ),
    ));
  }

  // ── Location picker helpers ───────────────────────────────────────────────

  Future<void> _pickState() async {
    final picked = await LocationPickerSheet.show(
      context,
      levelLabel: 'State',
      levelLabelTe: 'రాష్ట్రం',
      isTelugu: _isTelugu,
      loader: () => widget.catalogApiClient.getLocations(type: 'STATE'),
      current: _wizard.selectedState,
    );
    if (picked != null && mounted) {
      setState(() => _wizard.selectState(picked));
    }
  }

  Future<void> _pickDistrict() async {
    if (_wizard.selectedState == null) return;
    final picked = await LocationPickerSheet.show(
      context,
      levelLabel: 'District',
      levelLabelTe: 'జిల్లా',
      isTelugu: _isTelugu,
      loader: () => widget.catalogApiClient.getLocations(
        type: 'DISTRICT',
        parentId: _wizard.selectedState!.id,
      ),
      current: _wizard.selectedDistrict,
    );
    if (picked != null && mounted) {
      setState(() => _wizard.selectDistrict(picked));
    }
  }

  Future<void> _pickMandal() async {
    if (_wizard.selectedDistrict == null) return;
    final picked = await LocationPickerSheet.show(
      context,
      levelLabel: 'Mandal',
      levelLabelTe: 'మండలం',
      isTelugu: _isTelugu,
      loader: () => widget.catalogApiClient.getLocations(
        type: 'MANDAL',
        parentId: _wizard.selectedDistrict!.id,
      ),
      current: _wizard.selectedMandal,
    );
    if (picked != null && mounted) {
      setState(() => _wizard.selectMandal(picked));
    }
  }

  Future<void> _pickLocality() async {
    if (_wizard.selectedMandal == null) return;
    final picked = await LocationPickerSheet.show(
      context,
      levelLabel: 'Village / City / Ward',
      levelLabelTe: 'గ్రామం / నగరం / వార్డు',
      isTelugu: _isTelugu,
      loader: () => widget.catalogApiClient.getLocations(
        type: 'LOCALITY',
        parentId: _wizard.selectedMandal!.id,
      ),
      current: _wizard.selectedLocality,
    );
    if (picked != null && mounted) {
      setState(() => _wizard.selectLocality(picked));
    }
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
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
                      bottom: 110 + MediaQuery.of(context).viewInsets.bottom,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildTitle(),
                        const SizedBox(height: 12),
                        _buildResidenceCard(),
                        const SizedBox(height: 20),
                        _buildSectionHeading(),
                        const SizedBox(height: 10),
                        _buildLocationBlock(),
                        const SizedBox(height: 24),
                        _buildPincodeField(),
                        const SizedBox(height: 16),
                        _buildLandmarkField(),
                        const SizedBox(height: 4),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: _buildBottomCta(),
          ),
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
              const Text(
                'Naaguru',
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  color: NaaguruTheme.primary,
                  letterSpacing: -0.3,
                ),
              ),
            ],
          ),
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
          _langPill('English', !_isTelugu,
              () => setState(() => _isTelugu = false)),
          _langPill('తెలుగు', _isTelugu,
              () => setState(() => _isTelugu = true)),
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
                    decoration: const BoxDecoration(
                      color: NaaguruTheme.primary,
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    _s('Step 2 of 3: Where You Live',
                        'దశ 2/3: మీరు ఎక్కడ నివసిస్తున్నారు'),
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: NaaguruTheme.primary,
                    ),
                  ),
                ],
              ),
              Text(
                '66%',
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
              value: 2 / 3,
              minHeight: 6,
              backgroundColor: _C.surfaceContainerHigh,
              valueColor:
                  const AlwaysStoppedAnimation<Color>(NaaguruTheme.primary),
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
          _s('Where do you live?', 'మీరు ఎక్కడ నివసిస్తున్నారు?'),
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
          _s('Tell us where you currently live.',
              'మీ ప్రస్తుత నివాస ప్రాంతాన్ని తెలియజేయండి.'),
          style: const TextStyle(
            fontSize: 14,
            color: NaaguruTheme.muted,
            height: 1.4,
          ),
        ),
      ],
    );
  }

  // ── Residence card ────────────────────────────────────────────────────────

  Widget _buildResidenceCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: _C.surfaceContainerLow,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withAlpha(8),
              blurRadius: 6,
              offset: const Offset(0, 2))
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
                BoxShadow(
                    color: Colors.black.withAlpha(10), blurRadius: 4)
              ],
            ),
            child: const Icon(Icons.location_on_rounded,
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
                      _s('Home Residence', 'ఇంటి నివాసం'),
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
                      _s('Privacy safe', 'గోప్యత సురక్షితం'),
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
                    'This is your home location, NOT where you have to study.',
                    'ఇది మీ నివాస ప్రాంతం మాత్రమే, కళాశాల ప్రాధాన్యత కాదు.',
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
      _s('Administrative Region', 'పరిపాలనా ప్రాంతం'),
      style: const TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: NaaguruTheme.text,
      ),
    );
  }

  // ── Cascading location block ───────────────────────────────────────────────

  Widget _buildLocationBlock() {
    return Container(
      decoration: BoxDecoration(
        color: NaaguruTheme.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withAlpha(10),
              blurRadius: 8,
              offset: const Offset(0, 2))
        ],
      ),
      child: Column(
        children: [
          _locationRow(
            sublabel: _s('STATE', 'రాష్ట్రం'),
            value: _wizard.selectedState?.displayName(_isTelugu),
            placeholder: _s('Select state', 'రాష్ట్రం ఎంచుకోండి'),
            enabled: true,
            onTap: _pickState,
          ),
          _divider(),
          _locationRow(
            sublabel: _s('DISTRICT', 'జిల్లా'),
            value: _wizard.selectedDistrict?.displayName(_isTelugu),
            placeholder: _wizard.selectedState != null
                ? _s('Select district', 'జిల్లా ఎంచుకోండి')
                : _s('Select state first', 'ముందు రాష్ట్రం ఎంచుకోండి'),
            enabled: _wizard.selectedState != null,
            onTap: _pickDistrict,
          ),
          _divider(),
          _locationRow(
            sublabel: _s('MANDAL', 'మండలం'),
            value: _wizard.selectedMandal?.displayName(_isTelugu),
            placeholder: _wizard.selectedDistrict != null
                ? _s('Select mandal', 'మండలం ఎంచుకోండి')
                : _s('Select district first', 'ముందు జిల్లా ఎంచుకోండి'),
            enabled: _wizard.selectedDistrict != null,
            onTap: _pickMandal,
          ),
          _divider(),
          _buildLocalityRow(),
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
                        color: enabled ? _C.onSurfaceVariant : NaaguruTheme.muted.withAlpha(100),
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      hasValue ? value : placeholder,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: hasValue ? FontWeight.w600 : FontWeight.w400,
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
                  color: enabled ? _C.onSurfaceVariant : NaaguruTheme.muted.withAlpha(80),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLocalityRow() {
    final locality = _wizard.selectedLocality;
    final mandal = _wizard.selectedMandal;
    final enabled = mandal != null;

    return Padding(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _s('VILLAGE / CITY / WARD', 'గ్రామం / నగరం / వార్డు'),
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        letterSpacing: 0.8,
                        color: enabled
                            ? _C.onSurfaceVariant
                            : NaaguruTheme.muted.withAlpha(100),
                      ),
                    ),
                    if (locality != null) ...[
                      const SizedBox(height: 3),
                      Text(
                        locality.displayName(_isTelugu),
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: NaaguruTheme.primary,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              if (locality != null)
                Container(
                  width: 28,
                  height: 28,
                  decoration: const BoxDecoration(
                    color: NaaguruTheme.primary,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.check_rounded,
                      color: Colors.white, size: 16),
                ),
            ],
          ),
          const SizedBox(height: 10),
          // Inline locality search trigger.
          GestureDetector(
            onTap: enabled ? _pickLocality : null,
            child: Container(
              height: 44,
              decoration: BoxDecoration(
                color: enabled ? _C.surfaceContainer : _C.surfaceContainerHigh,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const SizedBox(width: 12),
                  Icon(Icons.search_rounded,
                      color: enabled
                          ? _C.onSurfaceVariant
                          : NaaguruTheme.muted.withAlpha(80),
                      size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      enabled
                          ? _s('Search village, ward, or locality...',
                              'గ్రామం, వార్డు లేదా ప్రాంతాన్ని శోధించండి...')
                          : _s('Select mandal first', 'ముందు మండలం ఎంచుకోండి'),
                      style: TextStyle(
                        fontSize: 14,
                        color: enabled
                            ? _C.onSurfaceVariant
                            : NaaguruTheme.muted.withAlpha(80),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (enabled) ...[
            const SizedBox(height: 8),
            Text(
              _s(
                'Localities in ${mandal.displayName(false)} mandal',
                '${mandal.displayName(true)} మండలంలోని లొకేషన్లు',
              ),
              style: const TextStyle(
                fontSize: 11,
                color: NaaguruTheme.muted,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _divider() =>
      Container(height: 1, color: _C.surfaceContainerHigh);

  // ── Pincode field ─────────────────────────────────────────────────────────

  Widget _buildPincodeField() {
    final pin = _pincodeController.text.trim();
    final isValid = _C._pincodeRegex.hasMatch(pin);
    final hasError = _pincodeTouched && !isValid;
    final showSuccess = _pincodeTouched && isValid;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          _s('Postal Pincode', 'తపాలా పిన్‌కోడ్'),
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: NaaguruTheme.text,
          ),
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
                  : showSuccess
                      ? NaaguruTheme.primary.withAlpha(100)
                      : Colors.transparent,
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                  color: Colors.black.withAlpha(10),
                  blurRadius: 6,
                  offset: const Offset(0, 2))
            ],
          ),
          child: Row(
            children: [
              const SizedBox(width: 14),
              Expanded(
                child: TextField(
                  controller: _pincodeController,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 2,
                    color: NaaguruTheme.text,
                  ),
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    counterText: '',
                    hintText: _s('e.g. 530052', 'ఉదా. 530052'),
                    hintStyle: TextStyle(
                      fontSize: 15,
                      color: NaaguruTheme.muted.withAlpha(180),
                      fontWeight: FontWeight.w400,
                      letterSpacing: 0,
                    ),
                    isDense: true,
                    contentPadding: EdgeInsets.zero,
                  ),
                ),
              ),
              if (showSuccess) ...[
                const Icon(Icons.check_circle_rounded,
                    color: NaaguruTheme.primary, size: 20),
                const SizedBox(width: 14),
              ] else if (hasError) ...[
                const Icon(Icons.error_outline_rounded,
                    color: NaaguruTheme.error, size: 20),
                const SizedBox(width: 14),
              ] else
                const SizedBox(width: 14),
            ],
          ),
        ),
        if (showSuccess) ...[
          const SizedBox(height: 4),
          Row(
            children: [
              const Icon(Icons.verified_rounded,
                  color: NaaguruTheme.primary, size: 14),
              const SizedBox(width: 4),
              Text(
                _s('Valid 6-digit pincode', 'సరైన 6 అంకెల పిన్‌కోడ్'),
                style: const TextStyle(
                    fontSize: 11,
                    color: NaaguruTheme.primary,
                    fontWeight: FontWeight.w500),
              ),
            ],
          ),
        ] else if (hasError) ...[
          const SizedBox(height: 4),
          Text(
            _s('Please enter a valid 6-digit pincode.',
                'దయచేసి సరైన 6 అంకెల పిన్‌కోడ్ నమోదు చేయండి.'),
            style: const TextStyle(fontSize: 11, color: NaaguruTheme.error),
          ),
        ],
      ],
    );
  }

  // ── Landmark field ────────────────────────────────────────────────────────

  Widget _buildLandmarkField() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              _s('Nearby landmark', 'సమీప ల్యాండ్మార్క్'),
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: NaaguruTheme.text,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: _C.surfaceContainer,
                borderRadius: BorderRadius.circular(100),
              ),
              child: Text(
                _s('Optional', 'ఐచ్ఛికం'),
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                  color: NaaguruTheme.muted,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: NaaguruTheme.surface,
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(
                  color: Colors.black.withAlpha(10),
                  blurRadius: 6,
                  offset: const Offset(0, 2))
            ],
          ),
          child: TextField(
            controller: _landmarkController,
            maxLength: 255,
            textCapitalization: TextCapitalization.sentences,
            style: const TextStyle(fontSize: 14, color: NaaguruTheme.text),
            decoration: InputDecoration(
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(
                  horizontal: 16, vertical: 14),
              counterText: '',
              hintText: _s(
                'e.g. Near Main Bus Stop or Church',
                'ఉదా. మెయిన్ బస్ స్టాప్ లేదా చర్చ్ వద్ద',
              ),
              hintStyle: TextStyle(
                  fontSize: 14, color: NaaguruTheme.muted.withAlpha(180)),
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(
          _s(
            'Optional — helps identify nearby facilities.',
            'ఐచ్ఛికం — సమీప సౌకర్యాలను గుర్తించడంలో సహాయపడుతుంది.',
          ),
          style: const TextStyle(fontSize: 11, color: NaaguruTheme.muted),
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
              offset: const Offset(0, -4))
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
                    fontSize: 15, fontWeight: FontWeight.w600),
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
                _s('Step 2 of 3 • You can edit anytime later',
                    'దశ 2/3 • తర్వాత ఎప్పుడైనా సవరించుకోవచ్చు'),
                style: const TextStyle(
                    fontSize: 11, color: NaaguruTheme.muted),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

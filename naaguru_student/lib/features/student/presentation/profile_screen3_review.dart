import 'package:flutter/material.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/features/auth/auth_service.dart';
import 'package:naaguru_student/features/student/data/catalog_api_client.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';
import 'package:naaguru_student/features/student/presentation/profile_wizard_state.dart';

class _C {
  static const surfaceContainer = Color(0xFFE3F1ED);
  static const surfaceContainerLow = Color(0xFFE9F7F3);
  static const surfaceContainerLowest = Color(0xFFFFFFFF);
  static const surfaceContainerHighest = Color(0xFFD8E5E2);
  static const secondaryContainer = Color(0xFFFEC24A);
  static const onSecondaryContainer = Color(0xFF715000);
}

class ProfileScreen3Review extends StatefulWidget {
  final AuthService authService;
  final StudentApiClient studentApiClient;
  final CatalogApiClient catalogApiClient;
  final ProfileWizardState wizardState;

  const ProfileScreen3Review({
    super.key,
    required this.authService,
    required this.studentApiClient,
    required this.catalogApiClient,
    required this.wizardState,
  });

  @override
  State<ProfileScreen3Review> createState() => _ProfileScreen3ReviewState();
}

class _ProfileScreen3ReviewState extends State<ProfileScreen3Review> {
  bool _isTelugu = false;
  bool _isSubmitting = false;
  String? _errorMsg;

  String _s(String en, String te) => _isTelugu ? te : en;

  void _setLanguage(bool toTelugu) {
    if (_isTelugu != toTelugu) {
      setState(() {
        _isTelugu = toTelugu;
      });
    }
  }

  void _handleEditSchool() {
    // Pop twice to get back to Screen 1 safely without locking the Navigator
    int count = 0;
    Navigator.of(context).popUntil((_) => count++ >= 2);
  }

  void _handleEditLocation() {
    // Pop once to get back to Screen 2
    Navigator.of(context).pop();
  }

  Future<void> _handleSubmit() async {
    if (_isSubmitting) return;

    if (!widget.wizardState.screen1Valid || !widget.wizardState.screen2Valid) {
      setState(() {
        _errorMsg = _s('Please complete all previous steps first.',
            'దయచేసి ముందుగా మునుపటి అన్ని దశలను పూర్తి చేయండి.');
      });
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorMsg = null;
    });

    try {
      final existingProfile = await widget.studentApiClient.getProfile();
      
      final fullName = widget.wizardState.fullName;
      final gender = widget.wizardState.gender!;
      final schoolId = widget.wizardState.selectedSchool!.id;
      final residenceLocationId = widget.wizardState.residenceLocationId!;
      final pincode = widget.wizardState.pincode;
      final landmark = widget.wizardState.landmark;

      if (existingProfile == null) {
        await widget.studentApiClient.createProfile(
          fullName: fullName,
          gender: gender,
          educationStage: '10TH_PASSED',
          schoolId: schoolId,
          residenceLocationId: residenceLocationId,
          pincode: pincode,
          landmark: landmark,
        );
      } else {
        await widget.studentApiClient.updateProfile(
          fullName: fullName,
          gender: gender,
          schoolId: schoolId,
          residenceLocationId: residenceLocationId,
          pincode: pincode,
          landmark: landmark,
        );
      }

      widget.authService.markProfileComplete();
      
      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/home');
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
          _errorMsg = _s(
            "Couldn't save your profile. Please try again.",
            "మీ ప్రొఫైల్‌ను సేవ్ చేయడం సాధ్యం కాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి."
          );
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NaaguruTheme.background,
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
                    padding: const EdgeInsets.only(
                      left: 16,
                      right: 16,
                      top: 8,
                      bottom: 120,
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildReadyBadge(),
                        const SizedBox(height: 12),
                        _buildTitle(),
                        const SizedBox(height: 24),
                        _buildLocationSummary(),
                        const SizedBox(height: 16),
                        _buildSchoolSummary(),
                        const SizedBox(height: 16),
                        _buildNextStepsCard(),
                        if (_errorMsg != null) ...[
                          const SizedBox(height: 16),
                          _buildErrorMsg(),
                        ],
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
          Expanded(
            child: Row(
              children: [
                GestureDetector(
                  onTap: () => Navigator.of(context).pop(),
                  child: Transform.translate(
                    offset: const Offset(-12, 0),
                    child: Container(
                      width: 44,
                      height: 44,
                      color: Colors.transparent,
                      child: const Center(
                        child: Icon(Icons.arrow_back,
                            color: NaaguruTheme.text, size: 22),
                      ),
                    ),
                  ),
                ),
                const Icon(Icons.school_rounded,
                    color: NaaguruTheme.primary, size: 18),
                const SizedBox(width: 6),
                Flexible(
                  child: Text(
                    'Naaguru',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: NaaguruTheme.text,
                      letterSpacing: -0.2,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(2),
                decoration: BoxDecoration(
                  color: _C.surfaceContainer,
                  borderRadius: BorderRadius.circular(100),
                ),
                child: Row(
                  children: [
                    _buildLangButton(
                        'EN', !_isTelugu, () => _setLanguage(false)),
                    _buildLangButton(
                        'తెలుగు', _isTelugu, () => _setLanguage(true)),
                  ],
                ),
              ),
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
          color: active ? _C.surfaceContainerLowest : Colors.transparent,
          borderRadius: BorderRadius.circular(100),
          boxShadow: active
              ? [
                  BoxShadow(
                    color: Colors.black.withAlpha(10),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                  )
                ]
              : null,
        ),
        child: Text(
          text,
          style: TextStyle(
            fontSize: 11,
            fontWeight: active ? FontWeight.w600 : FontWeight.w500,
            color: active ? NaaguruTheme.primary : NaaguruTheme.muted,
          ),
        ),
      ),
    );
  }

  Widget _buildProgressBar() {
    return Padding(
      padding: const EdgeInsets.only(left: 16, right: 16, top: 12, bottom: 8),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  _s('Step 3 of 3 • Final Review', '3/3 దశ • తుది సమీక్ష'),
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: NaaguruTheme.primary,
                    letterSpacing: 0.2,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: _C.surfaceContainerLow,
                  borderRadius: BorderRadius.circular(100),
                ),
                child: Text(
                  _s('100% Done', '100% పూర్తయింది'),
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: NaaguruTheme.primary,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Container(
            height: 6,
            width: double.infinity,
            decoration: BoxDecoration(
              color: _C.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(3),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    decoration: BoxDecoration(
                      color: NaaguruTheme.primary,
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Main Content ──────────────────────────────────────────────────────────

  Widget _buildReadyBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: _C.surfaceContainerLow,
        borderRadius: BorderRadius.circular(100),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 4,
            offset: const Offset(0, 1),
          )
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.check_circle,
              color: NaaguruTheme.primary, size: 16),
          const SizedBox(width: 6),
          Text(
            _s('Profile Ready', 'ప్రొఫైల్ సిద్ధం'),
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: NaaguruTheme.primary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTitle() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          _s("You're all set!", "అన్నీ సిద్ధమయ్యాయి!"),
          style: const TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w700,
            color: NaaguruTheme.text,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          _s('Check your details before you continue.',
              'కొనసాగడానికి ముందు మీ వివరాలను ఒకసారి పరిశీలించండి.'),
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w400,
            color: NaaguruTheme.muted,
          ),
        ),
      ],
    );
  }

  Widget _buildLocationSummary() {
    final wiz = widget.wizardState;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _C.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withAlpha(10),
              blurRadius: 6,
              offset: const Offset(0, 2))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: _C.surfaceContainerLow,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.location_on,
                          color: NaaguruTheme.primary, size: 18),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _s('Where You Live', 'మీ నివాస ప్రాంతం'),
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: NaaguruTheme.text,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              _buildEditButton(_handleEditLocation),
            ],
          ),
          const SizedBox(height: 12),
          _buildSummaryRow(
              _s('State', 'రాష్ట్రం'), wiz.selectedState?.displayName(_isTelugu)),
          _buildSummaryRow(_s('District', 'జిల్లా'),
              wiz.selectedDistrict?.displayName(_isTelugu)),
          _buildSummaryRow(
              _s('Mandal', 'మండలం'), wiz.selectedMandal?.displayName(_isTelugu)),
          _buildSummaryRow(_s('Village / City', 'గ్రామం / నగరం'),
              wiz.selectedLocality?.displayName(_isTelugu)),
          _buildSummaryRow(_s('Pincode', 'పిన్కోడ్'), wiz.pincode),
          if (wiz.landmark.isNotEmpty)
            _buildSummaryRow(_s('Landmark', 'గుర్తింపు ప్రదేశం (Landmark)'),
                wiz.landmark),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: _C.surfaceContainerLow,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.only(top: 2),
                  child: Icon(Icons.verified,
                      color: NaaguruTheme.primary, size: 18),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _s(
                        'Your location helps Naaguru show opportunities relevant to your area.',
                        'మీ నివాస ప్రాంతం ఆధారంగా నాగురు మీకు తగిన అవకాశాలను చూపుతుంది.'),
                    style: const TextStyle(
                      fontSize: 12,
                      color: NaaguruTheme.primary,
                      height: 1.3,
                    ),
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildSchoolSummary() {
    final wiz = widget.wizardState;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: _C.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withAlpha(10),
              blurRadius: 6,
              offset: const Offset(0, 2))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Row(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: _C.surfaceContainerLow,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Icon(Icons.school,
                          color: NaaguruTheme.primary, size: 18),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _s('Your School & Identity', 'మీ పాఠశాల & వివరాలు'),
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: NaaguruTheme.text,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),
              _buildEditButton(_handleEditSchool),
            ],
          ),
          const SizedBox(height: 12),
          _buildSummaryBlock(
              _s('Student Name', 'విద్యార్థి పేరు'), wiz.fullName),
          const SizedBox(height: 8),
          _buildSummaryBlock(
              _s('Gender', 'లింగం'),
              wiz.gender == 'MALE'
                  ? _s('Male', 'పురుషుడు')
                  : (wiz.gender == 'FEMALE' ? _s('Female', 'స్త్రీ') : '')),
          const SizedBox(height: 8),
          _buildSummaryBlock(
            _s('School Name', 'పాఠశాల పేరు'),
            _isTelugu && wiz.selectedSchool?.nameTe != null
                ? wiz.selectedSchool!.nameTe!
                : (wiz.selectedSchool?.nameEn ?? ''),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: _C.surfaceContainerLow,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Padding(
                  padding: EdgeInsets.only(top: 2),
                  child: Icon(Icons.verified_user,
                      color: NaaguruTheme.primary, size: 18),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _s(
                        'Your school selection is saved to your Naaguru profile.',
                        'మీ పాఠశాల ఎంపిక నాగురు ప్రొఫైల్‌లో సేవ్ చేయబడింది.'),
                    style: const TextStyle(
                      fontSize: 12,
                      color: NaaguruTheme.primary,
                      height: 1.3,
                    ),
                  ),
                ),
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String? value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: const TextStyle(
                fontSize: 12,
                color: NaaguruTheme.muted,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            flex: 3,
            child: Text(
              value ?? '',
              textAlign: TextAlign.right,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: NaaguruTheme.text,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryBlock(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: NaaguruTheme.muted,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: NaaguruTheme.text,
          ),
        ),
      ],
    );
  }

  Widget _buildEditButton(VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: _C.surfaceContainerLow,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            const Icon(Icons.edit, color: NaaguruTheme.primary, size: 14),
            const SizedBox(width: 4),
            Text(
              _s('Edit', 'సవరించండి'),
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: NaaguruTheme.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNextStepsCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [_C.surfaceContainerLow, _C.surfaceContainer],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
              color: Colors.black.withAlpha(5),
              blurRadius: 4,
              offset: const Offset(0, 1))
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.auto_awesome,
                  color: NaaguruTheme.accent, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  _s('What happens next?', 'తదుపరి ఏమి జరుగుతుంది?'),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    color: NaaguruTheme.text,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            _s(
                "Next, you can explore Naaguru's career guidance and college discovery features.",
                "తదుపరి, మీరు నాగురు కెరీర్ గైడెన్స్ మరియు కాలేజ్ సెర్చ్ ఫీచర్లను అన్వేషించవచ్చు."),
            style: const TextStyle(
              fontSize: 14,
              color: NaaguruTheme.muted,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorMsg() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: NaaguruTheme.error.withAlpha(20),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: NaaguruTheme.error.withAlpha(80)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline,
              color: NaaguruTheme.error, size: 20),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              _errorMsg!,
              style: const TextStyle(
                fontSize: 13,
                color: NaaguruTheme.error,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomCta() {
    final safeBottom = MediaQuery.of(context).padding.bottom;
    return Container(
      padding: EdgeInsets.fromLTRB(16, 10, 16, 12 + safeBottom),
      decoration: BoxDecoration(
        color: NaaguruTheme.surface.withAlpha(242),
        boxShadow: [
          BoxShadow(
              color: NaaguruTheme.primary.withAlpha(15),
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
              onPressed: _isSubmitting ? null : _handleSubmit,
              style: ElevatedButton.styleFrom(
                backgroundColor: NaaguruTheme.primary,
                disabledBackgroundColor: _C.surfaceContainerHighest,
                foregroundColor: Colors.white,
                disabledForegroundColor: NaaguruTheme.muted,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
                elevation: 0,
              ),
              child: _isSubmitting
                  ? const SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Flexible(
                          child: Text(
                            _s('Complete Profile', 'ప్రొఫైల్ పూర్తి చేయండి'),
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 6),
                        const Icon(Icons.arrow_forward, size: 20),
                      ],
                    ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _s(
              'You can adjust your profile details anytime from your Account settings.',
              'మీ ఖాతా సెట్టింగ్‌ల నుండి వివరాలను ఎప్పుడైనా మార్చుకోవచ్చు.',
            ),
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 11, color: NaaguruTheme.muted),
          ),
        ],
      ),
    );
  }
}

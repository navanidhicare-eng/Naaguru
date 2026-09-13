import 'package:flutter/material.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';
import 'package:naaguru_student/features/college/presentation/college_discovery_wizard_state.dart';
import 'package:naaguru_student/features/college/presentation/college_list_screen.dart';
import 'package:naaguru_student/features/college/presentation/college_location_preferences_screen.dart';
import 'package:naaguru_student/features/college/presentation/college_preferences_screen.dart';
import 'package:naaguru_student/features/college/presentation/college_stream_selection_screen.dart';
import 'package:naaguru_student/features/student/data/catalog_api_client.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';

class _C {
  static const surfaceContainerLow = Color(0xFFE9F7F3);
  static const surfaceContainerHigh = Color(0xFFDDEBE7);
  static const surfaceContainerHighest = Color(0xFFD8E5E2);
  static const onSurfaceVariant = Color(0xFF3E4946);
}

/// Step 4 of 4 in College Discovery: Review & Confirm.
///
/// Displays real student selections across Pathway, Stream, Preferred Study
/// Location hierarchy, Hostel, and Budget.
///
/// Tapping "Confirm & View Colleges" saves the student's College Intent via
/// `POST /api/v1/students/me/college-intent`, then transitions to the college
/// directory.
class CollegeReviewAndConfirmScreen extends StatefulWidget {
  final CollegeDiscoveryWizardState wizardState;
  final CollegeApiClient collegeApiClient;
  final StudentApiClient studentApiClient;
  final CatalogApiClient? catalogApiClient;
  final bool isDirectEntry;
  final bool isTelugu;
  final ValueChanged<bool>? onLanguageChanged;

  const CollegeReviewAndConfirmScreen({
    super.key,
    required this.wizardState,
    required this.collegeApiClient,
    required this.studentApiClient,
    this.catalogApiClient,
    this.isDirectEntry = false,
    required this.isTelugu,
    this.onLanguageChanged,
  });

  @override
  State<CollegeReviewAndConfirmScreen> createState() =>
      _CollegeReviewAndConfirmScreenState();
}

class _CollegeReviewAndConfirmScreenState
    extends State<CollegeReviewAndConfirmScreen> {
  late bool _isTelugu;
  bool _isSubmitting = false;
  bool _isLoadingIntent = true;
  int? _currentVersionNumber;
  bool _canEditPreferences = true;
  bool _isNavigatingEdit = false;
  String? _errorMessage;
  String? _loadIntentError;

  @override
  void initState() {
    super.initState();
    _isTelugu = widget.isTelugu;
    _currentVersionNumber = widget.wizardState.versionNumber;
    _canEditPreferences = widget.wizardState.canEditPreferences;
    _loadPersistedIntent();
  }

  Future<void> _loadPersistedIntent() async {
    setState(() {
      _isLoadingIntent = true;
      _loadIntentError = null;
    });

    try {
      final intent = await widget.studentApiClient.getCurrentCollegeIntent();
      if (!mounted) return;

      if (intent != null) {
        final version = intent['versionNumber'] as int?;
        widget.wizardState.versionNumber = version;
        setState(() {
          _currentVersionNumber = version;
          // Self-service editing is locked once Version 2 is reached.
          _canEditPreferences = version == null || version < 2;
          _isLoadingIntent = false;
        });
      } else {
        // First-time submission flow (no intent exists yet -> Version 1)
        setState(() {
          _currentVersionNumber = null;
          _canEditPreferences = true;
          _isLoadingIntent = false;
        });
      }
    } catch (e) {
      if (!mounted) return;
      // Rule: If intent cannot be loaded or there is ambiguity,
      // do NOT assume editing is allowed. Default to safe state (false).
      setState(() {
        _canEditPreferences = false;
        _isLoadingIntent = false;
        _loadIntentError = _s(
          'Could not verify revision limit. Tap Retry to check again.',
          'సవరణ పరిమితులను ధృవీకరించడం సాధ్యం కాలేదు. మళ్లీ ప్రయత్నించండి.',
        );
      });
    }
  }

  String _s(String en, String te) => _isTelugu ? te : en;

  void _setLanguage(bool toTelugu) {
    setState(() => _isTelugu = toTelugu);
    widget.onLanguageChanged?.call(toTelugu);
  }

  // ── Edit Navigation ───────────────────────────────────────────────────────

  void _editPathway() {
    if (!_canEditPreferences || _isNavigatingEdit) return;
    if (widget.isDirectEntry) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => CollegePreferencesScreen(
            collegeApiClient: widget.collegeApiClient,
            catalogApiClient: widget.catalogApiClient,
            studentApiClient: widget.studentApiClient,
            wizardState: widget.wizardState,
            isTelugu: _isTelugu,
            onLanguageChanged: widget.onLanguageChanged ?? (_) {},
          ),
        ),
      ).then((_) {
        if (mounted) setState(() {});
      });
    } else {
      _isNavigatingEdit = true;
      int count = 0;
      Navigator.of(context).popUntil((_) => count++ >= 3);
    }
  }

  Future<void> _editStream() async {
    if (!_canEditPreferences || _isNavigatingEdit) return;
    if (widget.isDirectEntry) {
      List<Map<String, dynamic>> programs = widget.wizardState.availablePrograms;
      if (programs.isEmpty) {
        try {
          final pathways = await widget.collegeApiClient.getCatalogPathways();
          final pathway = pathways.firstWhere(
            (p) => p['code'] == (widget.wizardState.pathwayCode ?? 'INTERMEDIATE'),
            orElse: () => <String, dynamic>{},
          );
          programs = (pathway['programs'] as List? ?? []).cast<Map<String, dynamic>>();
        } catch (_) {}
      }

      if (!mounted) return;

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => CollegeStreamSelectionScreen(
            collegeApiClient: widget.collegeApiClient,
            catalogApiClient: widget.catalogApiClient,
            studentApiClient: widget.studentApiClient,
            wizardState: widget.wizardState,
            programs: programs,
            pathwayCode: widget.wizardState.pathwayCode ?? 'INTERMEDIATE',
            isTelugu: _isTelugu,
            onLanguageChanged: widget.onLanguageChanged ?? (_) {},
          ),
        ),
      ).then((_) {
        if (mounted) setState(() {});
      });
    } else {
      _isNavigatingEdit = true;
      int count = 0;
      Navigator.of(context).popUntil((_) => count++ >= 2);
    }
  }

  void _editStep3() {
    if (!_canEditPreferences || _isNavigatingEdit) return;
    if (widget.isDirectEntry) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => CollegeLocationPreferencesScreen(
            collegeApiClient: widget.collegeApiClient,
            catalogApiClient: widget.catalogApiClient,
            studentApiClient: widget.studentApiClient,
            wizardState: widget.wizardState,
            pathwayCode: widget.wizardState.pathwayCode ?? 'INTERMEDIATE',
            programCode: widget.wizardState.programCode ?? 'MPC',
            isTelugu: _isTelugu,
            onLanguageChanged: widget.onLanguageChanged ?? (_) {},
          ),
        ),
      ).then((_) {
        if (mounted) setState(() {});
      });
    } else {
      _isNavigatingEdit = true;
      Navigator.of(context).pop();
    }
  }

  void _handleGoBack() {
    if (widget.isDirectEntry) {
      Navigator.of(context).pop();
    } else if (!_canEditPreferences) {
      // Step 7: When editing is locked, Go Back must not return to an editable screen (Step 3/2/1).
      // Pop all the way out of the wizard cleanly to the root (Home).
      Navigator.of(context).popUntil((route) => route.isFirst);
    } else {
      Navigator.of(context).pop();
    }
  }

  // ── Intent Submission & CTA ───────────────────────────────────────────────

  Future<void> _handleConfirmAndSave() async {
    if (_isSubmitting) return; // Prevent duplicate rapid taps

    setState(() {
      _isSubmitting = true;
      _errorMessage = null;
    });

    try {
      // Step 4 & 5: If intent is already at Version 2, editing is locked.
      // Do NOT call submitCollegeIntent (which would reject with 403).
      // Directly proceed to view colleges based on the final saved intent!
      if (_currentVersionNumber != null && _currentVersionNumber! >= 2) {
        _navigateToCollegeList();
        return;
      }

      // If intent is new or Version 1, submit to backend
      String? hostelGender;
      if (widget.wizardState.requiresHostel) {
        final profile = await widget.studentApiClient.getProfile();
        final studentGender = profile?['gender'] as String?;
        hostelGender = studentGender == 'FEMALE' ? 'GIRLS' : 'BOYS';
      }

      final result = await widget.studentApiClient.submitCollegeIntent(
        pathwayCode: widget.wizardState.pathwayCode!,
        programCode: widget.wizardState.programCode,
        preferredLocationId: widget.wizardState.preferredLocationId,
        requiresHostel: widget.wizardState.requiresHostel,
        hostelGender: hostelGender,
        maxAnnualFee: widget.wizardState.maxAnnualFee,
      );

      if (!mounted) return;

      final newVersion = result['versionNumber'] as int?;
      widget.wizardState.versionNumber = newVersion;
      _currentVersionNumber = newVersion;
      _canEditPreferences = newVersion == null || newVersion < 2;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(_s(
            'College preferences saved successfully.',
            'కళాశాల ప్రాధాన్యతలు విజయవంతంగా సేవ్ చేయబడ్డాయి.',
          )),
          duration: const Duration(seconds: 2),
        ),
      );

      _navigateToCollegeList();
    } on ApiException catch (e) {
      if (!mounted) return;
      if (e.statusCode == 403) {
        setState(() {
          _isSubmitting = false;
          _canEditPreferences = false;
          _errorMessage = _s(
            'Maximum self-service revisions reached (limit: 2).',
            'గరిష్ట సవరణల పరిమితి ముగిసింది (పరిమితి: 2).',
          );
        });
        await _loadPersistedIntent();
      } else {
        setState(() {
          _isSubmitting = false;
          _errorMessage = e.message.isNotEmpty
              ? e.message
              : _s('Could not save your preferences. Please try again.',
                  'మీ ప్రాధాన్యతలను సేవ్ చేయడం సాధ్యం కాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.');
        });
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isSubmitting = false;
        _errorMessage = _s(
          'Could not save your preferences. Please try again.',
          'మీ ప్రాధాన్యతలను సేవ్ చేయడం సాధ్యం కాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి.',
        );
      });
    }
  }

  void _navigateToCollegeList() {
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(
        builder: (_) => CollegeListScreen(
          collegeApiClient: widget.collegeApiClient,
          pathway: widget.wizardState.pathwayCode!,
          streamCode: widget.wizardState.programCode,
          district: widget.wizardState.preferredDistrict?.nameEn,
          requiresHostel: widget.wizardState.requiresHostel,
          maxFee: widget.wizardState.maxAnnualFee,
        ),
      ),
    );
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
                        _buildTitle(),
                        const SizedBox(height: 12),
                        if (_loadIntentError != null) ...[
                          _buildLoadErrorBanner(),
                          const SizedBox(height: 12),
                        ] else if (!_canEditPreferences && !_isLoadingIntent) ...[
                          _buildLockedPreferencesBanner(),
                          const SizedBox(height: 12),
                        ],
                        _buildPathwayCard(),
                        const SizedBox(height: 12),
                        _buildStreamCard(),
                        const SizedBox(height: 12),
                        _buildLocationCard(),
                        const SizedBox(height: 12),
                        _buildHostelCard(),
                        const SizedBox(height: 12),
                        _buildBudgetCard(),
                        const SizedBox(height: 16),
                        _buildInfoReassuranceCard(),
                        if (_errorMessage != null) ...[
                          const SizedBox(height: 16),
                          _buildErrorBanner(),
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
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back_rounded,
                    color: NaaguruTheme.text),
                onPressed: _handleGoBack,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
              const SizedBox(width: 12),
              Text(
                _s('Review & Confirm', 'సమీక్షించండి & నిర్ధారించండి'),
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: NaaguruTheme.text,
                ),
              ),
            ],
          ),
          Row(
            children: [
              _buildLangButton('EN', !_isTelugu, () => _setLanguage(false)),
              _buildLangButton('తెలుగు', _isTelugu, () => _setLanguage(true)),
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

  // ── Progress Bar ──────────────────────────────────────────────────────────

  Widget _buildProgressBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Text(
                    _s('STEP 4 OF 4', 'దశ 4/4'),
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: NaaguruTheme.primary,
                      letterSpacing: 0.5,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF3C7),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      _s('Final Step', 'చివరి దశ'),
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF92400E),
                      ),
                    ),
                  ),
                ],
              ),
              Text(
                '100% Complete',
                style: const TextStyle(
                  fontSize: 11,
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
              value: 1.0,
              minHeight: 4,
              backgroundColor: _C.surfaceContainerHigh,
              color: NaaguruTheme.primary,
            ),
          ),
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
          _s("Let's make sure this looks right",
              'వివరాలు సరిగ్గా ఉన్నాయో చూసుకోండి'),
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: NaaguruTheme.text,
            letterSpacing: -0.3,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          _s(
            'Review your preferences before saving. You can edit anything below.',
            'మీ ప్రాధాన్యతలను సమీక్షించండి. మీరు కింద ఉన్న వివరాలను ఎప్పుడైనా సవరించుకోవచ్చు.',
          ),
          style: const TextStyle(
            fontSize: 13,
            color: NaaguruTheme.muted,
            height: 1.4,
          ),
        ),
      ],
    );
  }

  Widget _buildLockedPreferencesBanner() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 2),
            child: Icon(Icons.lock_rounded, size: 16, color: NaaguruTheme.muted),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _s('FINAL PREFERENCES', 'తుది ప్రాధాన్యతలు'),
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.6,
                    color: NaaguruTheme.muted,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  _s(
                    'Your preference changes have been used. You can still view colleges based on your current choices.',
                    'మీ ప్రాధాన్యతల మార్పులు ఉపయోగించబడ్డాయి. మీరు ప్రస్తుత ఎంపికల ఆధారంగా కళాశాలలను చూడవచ్చు.',
                  ),
                  style: const TextStyle(
                    fontSize: 12,
                    color: NaaguruTheme.text,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadErrorBanner() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF2F2),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFFECACA)),
      ),
      child: Row(
        children: [
          const Icon(Icons.warning_amber_rounded,
              size: 18, color: NaaguruTheme.error),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              _loadIntentError!,
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF991B1B),
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          TextButton(
            onPressed: _loadPersistedIntent,
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: Text(
              _s('Retry', 'మళ్లీ ప్రయత్నించండి'),
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: NaaguruTheme.error,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Preference Cards ──────────────────────────────────────────────────────

  Widget _buildReviewCard({
    required IconData icon,
    required String sectionLabel,
    required String title,
    String? subtitle,
    String? extra,
    required VoidCallback onEdit,
  }) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: NaaguruTheme.surface,
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
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: _C.surfaceContainerLow,
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 20, color: NaaguruTheme.primary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  sectionLabel.toUpperCase(),
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                    color: NaaguruTheme.muted,
                    letterSpacing: 0.8,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: NaaguruTheme.text,
                  ),
                ),
                if (subtitle != null && subtitle.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 12,
                      color: NaaguruTheme.muted,
                      height: 1.3,
                    ),
                  ),
                ],
                if (extra != null && extra.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(
                    extra,
                    style: const TextStyle(
                      fontSize: 11,
                      color: _C.onSurfaceVariant,
                    ),
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: 8),
          _canEditPreferences && !_isLoadingIntent
              ? GestureDetector(
                  onTap: onEdit,
                  child: Padding(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                    child: Row(
                      children: [
                        Text(
                          _s('Edit', 'మార్చండి'),
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: NaaguruTheme.primary,
                          ),
                        ),
                        const SizedBox(width: 2),
                        const Icon(Icons.edit_outlined,
                            size: 14, color: NaaguruTheme.primary),
                      ],
                    ),
                  ),
                )
              : Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F5F9),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.lock_outline_rounded,
                          size: 12, color: NaaguruTheme.muted),
                      const SizedBox(width: 4),
                      Text(
                        _s('Final', 'స్థిరమైనది'),
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: NaaguruTheme.muted,
                        ),
                      ),
                    ],
                  ),
                ),
        ],
      ),
    );
  }

  Widget _buildPathwayCard() {
    final wiz = widget.wizardState;
    final name = wiz.pathwayCode == 'INTERMEDIATE'
        ? _s('Intermediate', 'ఇంటర్మీడియట్')
        : (wiz.pathwayCode ?? '');

    return _buildReviewCard(
      icon: Icons.alt_route_rounded,
      sectionLabel: _s('Pathway', 'విద్యా మార్గం'),
      title: name,
      subtitle: _s(
        'Academic streams after Class 10',
        '10వ తరగతి తర్వాత అకడమిక్ మార్గాలు',
      ),
      onEdit: _editPathway,
    );
  }

  Widget _buildStreamCard() {
    final wiz = widget.wizardState;
    String subjects = '';
    String scope = '';

    if (wiz.programCode == 'MPC') {
      subjects = _s('Mathematics • Physics • Chemistry',
          'గణితం • భౌతికశాస్త్రం • రసాయనశాస్త్రం');
      scope = _s('Engineering & Pure Science scope',
          'ఇంజనీరింగ్ మరియు సైన్స్ అవకాశాలు');
    } else if (wiz.programCode == 'BIPC') {
      subjects = _s('Biology • Physics • Chemistry',
          'జీవశాస్త్రం • భౌతికశాస్త్రం • రసాయనశాస్త్రం');
      scope = _s('Medicine & Life Sciences scope', 'వైద్యం మరియు లైఫ్ సైన్సెస్');
    } else if (wiz.programCode == 'MEC') {
      subjects = _s('Mathematics • Economics • Commerce',
          'గణితం • అర్థశాస్త్రం • వాణిజ్యశాస్త్రం');
      scope = _s('Finance & Business scope', 'ఫైనాన్స్ మరియు బిజినెస్');
    } else if (wiz.programCode == 'CEC') {
      subjects = _s('Civics • Economics • Commerce',
          'పౌరశాస్త్రం • అర్థశాస్త్రం • వాణిజ్యశాస్త్రం');
      scope = _s('Commerce & Management scope', 'కామర్స్ మరియు మేనేజ్‌మెంట్');
    }

    return _buildReviewCard(
      icon: Icons.science_outlined,
      sectionLabel: _s('Stream', 'స్ట్రీమ్'),
      title: wiz.programCode ?? '',
      subtitle: subjects,
      extra: scope,
      onEdit: _editStream,
    );
  }

  Widget _buildLocationCard() {
    final wiz = widget.wizardState;
    final locality = wiz.preferredLocality?.displayName(_isTelugu) ?? '';
    final mandal = wiz.preferredMandal?.displayName(_isTelugu) ?? '';
    final district = wiz.preferredDistrict?.displayName(_isTelugu) ?? '';
    final state = wiz.preferredState?.displayName(_isTelugu) ?? '';

    final hierarchy = [state, district, mandal, locality]
        .where((s) => s.isNotEmpty)
        .join(' → ');

    return _buildReviewCard(
      icon: Icons.location_on_outlined,
      sectionLabel: _s('Preferred Study Location', 'ప్రాధాన్యతా అధ్యయన ప్రాంతం'),
      title: locality.isNotEmpty ? '$locality, $district' : district,
      subtitle: hierarchy,
      onEdit: _editStep3,
    );
  }

  Widget _buildHostelCard() {
    final wiz = widget.wizardState;
    String label = '';
    String subtitle = '';

    if (wiz.hostel == 'YES') {
      label = _s('Yes, required', 'అవును, కావాలి');
      subtitle = _s('Prioritize on-campus safe boarding',
          'క్యాంపస్ హాస్టల్ సౌకర్యానికి ప్రాధాన్యత');
    } else if (wiz.hostel == 'NO') {
      label = _s('No', 'వద్దు');
      subtitle = _s('Day scholar accommodation', 'డే స్కాలర్');
    } else {
      label = _s('Either is fine', 'ఏదైనా పర్వాలేదు');
      subtitle = _s('Flexible with boarding options', 'హాస్టల్ సౌలభ్యమైన ఎంపిక');
    }

    return _buildReviewCard(
      icon: Icons.bed_outlined,
      sectionLabel: _s('Hostel Accommodation', 'హాస్టల్ వసతి'),
      title: label,
      subtitle: subtitle,
      onEdit: _editStep3,
    );
  }

  Widget _buildBudgetCard() {
    final wiz = widget.wizardState;
    String label = '';
    String subtitle = '';

    if (wiz.budget == 'UNDER_50K') {
      label = '< ₹50,000 / ${_s('year', 'సంవత్సరం')}';
      subtitle = _s('Affordable fee bracket', 'సరసమైన ఫీజు పరిధి');
    } else if (wiz.budget == 'UP_TO_1L') {
      label = 'Up to ₹1,00,000 / ${_s('year', 'సంవత్సరం')}';
      subtitle = _s('Merit scholarship eligible bracket',
          'మెరిట్ స్కాలర్‌షిప్ పరిధి');
    } else if (wiz.budget == 'OVER_1L') {
      label = '₹1,00,000+ / ${_s('year', 'సంవత్సరం')}';
      subtitle = _s('Premium institution bracket', 'ప్రీమియం సంస్థల పరిధి');
    } else {
      label = _s('Not sure yet', 'ఇంకా నిర్ణయించలేదు');
      subtitle = _s('Flexible tuition range', 'అన్ని ఫీజు పరిధులు');
    }

    return _buildReviewCard(
      icon: Icons.account_balance_wallet_outlined,
      sectionLabel: _s('Yearly Tuition Budget', 'వార్షిక ట్యూషన్ బడ్జెట్'),
      title: label,
      subtitle: subtitle,
      onEdit: _editStep3,
    );
  }

  Widget _buildInfoReassuranceCard() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: _C.surfaceContainerLow,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(Icons.info_outline_rounded,
              color: NaaguruTheme.primary, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _s(
                    'These preferences will be used to help find junior colleges that match what you\'re looking for.',
                    'మీ అవసరాలకు సరిపోయే జూనియర్ కళాశాలలను కనుగొనడానికి ఈ ప్రాధాన్యతలు ఉపయోగించబడతాయి.',
                  ),
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: NaaguruTheme.text,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _s(
                    'You can review everything before continuing. Your choices can be adjusted anytime without losing your profile progress.',
                    'మీరు కొనసాగే ముందు ప్రతిదాన్ని సమీక్షించవచ్చు. మీ ఎంపికలను ఎప్పుడైనా సవరించుకోవచ్చు.',
                  ),
                  style: const TextStyle(
                    fontSize: 11,
                    color: NaaguruTheme.muted,
                    height: 1.3,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorBanner() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFEE2E2),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFFCA5A5)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline_rounded,
              color: NaaguruTheme.error, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              _errorMessage!,
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF991B1B),
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  // ── Bottom CTA ────────────────────────────────────────────────────────────

  Widget _buildBottomCta() {
    final bottomPad = MediaQuery.of(context).padding.bottom;

    return Container(
      padding: EdgeInsets.fromLTRB(16, 12, 16, 14 + bottomPad),
      decoration: BoxDecoration(
        color: NaaguruTheme.surface.withAlpha(245),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(16),
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
              onPressed: _isSubmitting ? null : _handleConfirmAndSave,
              style: ElevatedButton.styleFrom(
                backgroundColor: NaaguruTheme.primary,
                disabledBackgroundColor: _C.surfaceContainerHighest,
                foregroundColor: Colors.white,
                disabledForegroundColor: NaaguruTheme.muted,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
                elevation: _isSubmitting ? 0 : 2,
                textStyle: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                ),
              ),
              child: _isSubmitting
                  ? Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Text(_s('Saving preferences...', 'సేవ్ చేస్తోంది...')),
                      ],
                    )
                  : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(_s('Confirm & View Colleges',
                            'ధృవీకరించి కళాశాలలను చూడండి')),
                        const SizedBox(width: 6),
                        const Icon(Icons.arrow_forward_rounded, size: 18),
                      ],
                    ),
            ),
          ),
          const SizedBox(height: 6),
          GestureDetector(
            onTap: _handleGoBack,
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.arrow_back_rounded,
                      size: 14, color: NaaguruTheme.muted),
                  const SizedBox(width: 4),
                  Text(
                    _s('Go Back', 'వెనకకు వెళ్ళండి'),
                    style: const TextStyle(
                      fontSize: 12,
                      color: NaaguruTheme.muted,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

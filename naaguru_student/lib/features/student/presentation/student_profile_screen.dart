import 'package:flutter/material.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/core/ui/buttons.dart';
import 'package:naaguru_student/core/ui/inputs.dart';
import 'package:naaguru_student/core/ui/language_toggle.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';

class StudentProfileScreen extends StatefulWidget {
  final StudentApiClient studentApiClient;

  const StudentProfileScreen({super.key, required this.studentApiClient});

  @override
  State<StudentProfileScreen> createState() => _StudentProfileScreenState();
}

class _StudentProfileScreenState extends State<StudentProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _guardianNameController = TextEditingController();
  final _guardianPhoneController = TextEditingController();

  String? _selectedClass = '10TH_PURSUING';
  String? _selectedBoard = 'AP Board';
  String? _selectedDistrict;
  String? _authPhone;

  bool _isTelugu = false;
  bool _isLoading = true;
  bool _isSaving = false;
  bool _profileExists = false;

  @override
  void initState() {
    super.initState();
    _nameController.addListener(_onFieldChanged);
    _guardianNameController.addListener(_onFieldChanged);
    _guardianPhoneController.addListener(_onFieldChanged);
    _loadProfile();
  }

  @override
  void dispose() {
    _nameController.removeListener(_onFieldChanged);
    _guardianNameController.removeListener(_onFieldChanged);
    _guardianPhoneController.removeListener(_onFieldChanged);
    _nameController.dispose();
    _guardianNameController.dispose();
    _guardianPhoneController.dispose();
    super.dispose();
  }

  void _onFieldChanged() {
    if (mounted) setState(() {});
  }

  bool get _isFormValid {
    final nameValid = _nameController.text.trim().isNotEmpty;
    final classValid = _selectedClass != null && _selectedClass!.isNotEmpty;
    final boardValid = _selectedBoard != null && _selectedBoard!.isNotEmpty;
    final districtValid = _selectedDistrict != null && _selectedDistrict!.isNotEmpty;
    final guardianNameValid = _guardianNameController.text.trim().isNotEmpty;
    final phoneText = _guardianPhoneController.text.trim();
    final guardianPhoneValid = phoneText.length == 10 && RegExp(r'^\d{10}$').hasMatch(phoneText);

    return nameValid && classValid && boardValid && districtValid && guardianNameValid && guardianPhoneValid;
  }

  Future<void> _loadProfile() async {
    setState(() => _isLoading = true);
    try {
      // 1. Fetch auth details (phone number)
      try {
        final me = await widget.studentApiClient.getMe();
        if (mounted && me['phoneNumber'] != null) {
          _authPhone = me['phoneNumber'] as String;
        }
      } catch (_) {
        // Ignored if auth fetch fails
      }

      // 2. Fetch profile
      final profile = await widget.studentApiClient.getProfile();
      if (profile != null && mounted) {
        _profileExists = true;
        _nameController.text = profile['fullName'] as String? ?? '';

        final edStage = profile['educationStage'] as String?;
        if (edStage != null && edStage == '10TH_PURSUING') {
          _selectedClass = edStage;
        } else {
          _selectedClass = '10TH_PURSUING';
        }

        final board = profile['board'] as String?;
        if (board != null && ['AP Board', 'Telangana Board', 'CBSE / Other'].contains(board)) {
          _selectedBoard = board;
        }

        final district = profile['district'] as String?;
        if (district != null && district.isNotEmpty) {
          _selectedDistrict = district;
        }

        _guardianNameController.text = profile['guardianName'] as String? ?? '';
        _guardianPhoneController.text = profile['guardianPhone'] as String? ?? '';
      }
    } on ApiException catch (_) {
      // Ignored, form stays empty for new profile
    } catch (_) {
      // Ignored
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;
    if (!_isFormValid) return;

    if (_selectedDistrict == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(_isTelugu ? "దయచేసి మీ జిల్లాను ఎంచుకోండి." : "Please select your district.")),
      );
      return;
    }

    setState(() => _isSaving = true);

    try {
      if (_profileExists) {
        await widget.studentApiClient.updateProfile(
          fullName: _nameController.text.trim(),
          educationStage: _selectedClass,
          board: _selectedBoard,
          district: _selectedDistrict,
          guardianName: _guardianNameController.text.trim(),
          guardianPhone: _guardianPhoneController.text.trim(),
        );
      } else {
        await widget.studentApiClient.createProfile(
          fullName: _nameController.text.trim(),
          educationStage: _selectedClass ?? '10TH_PURSUING',
          board: _selectedBoard,
          district: _selectedDistrict,
          guardianName: _guardianNameController.text.trim(),
          guardianPhone: _guardianPhoneController.text.trim(),
        );
        _profileExists = true;
      }

      if (mounted) {
        Navigator.of(context).pushReplacementNamed('/home');
      }
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Could not save profile.')));
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: NaaguruTheme.background,
        body: Center(child: CircularProgressIndicator(color: NaaguruTheme.primary)),
      );
    }

    return Scaffold(
      backgroundColor: NaaguruTheme.background,
      body: SafeArea(
        child: Column(
          children: [
            // Custom Header
            Container(
              height: 56,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(
                color: NaaguruTheme.background,
                border: Border(bottom: BorderSide(color: NaaguruTheme.muted.withAlpha(25))),
              ),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.of(context).pop(),
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        border: Border.all(color: NaaguruTheme.muted.withAlpha(51)),
                      ),
                      child: const Icon(Icons.chevron_left, color: NaaguruTheme.text, size: 24),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      _isTelugu ? "మీ ప్రొఫైల్‌ను రూపొందించండి" : "Create Your Profile",
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: NaaguruTheme.text),
                    ),
                  ),
                  LanguageToggle(
                    isTelugu: _isTelugu,
                    onToggle: (val) => setState(() => _isTelugu = val),
                  ),
                ],
              ),
            ),

            // Scrollable Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Heading
                      Text(
                        _isTelugu ? "మీ ప్రొఫైల్‌ను రూపొందిద్దాం" : "Let's create your profile",
                        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: NaaguruTheme.text, height: 1.2),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        _isTelugu 
                          ? "మీ Naaguru ప్రయాణాన్ని మీకు అనుగుణంగా రూపొందించడానికి ఈ వివరాలను ఉపయోగిస్తాము."
                          : "We'll use these details to personalize your Naaguru journey.",
                        style: const TextStyle(fontSize: 14, color: NaaguruTheme.muted),
                      ),
                      const SizedBox(height: 24),

                      // Section: Student Details
                      Row(
                        children: [
                          Container(width: 8, height: 8, decoration: const BoxDecoration(color: NaaguruTheme.primary, shape: BoxShape.circle)),
                          const SizedBox(width: 8),
                          Text(
                            _isTelugu ? "విద్యార్థి వివరాలు" : "STUDENT DETAILS",
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: NaaguruTheme.muted, letterSpacing: 0.5),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      const Divider(color: NaaguruTheme.muted, thickness: 0.2, height: 1),
                      const SizedBox(height: 16),

                      if (_authPhone != null) ...[
                        NaaguruTextField(
                          controller: TextEditingController(text: _authPhone),
                          label: _isTelugu ? "మీ వాట్సాప్ నంబర్" : "Your WhatsApp Number",
                          enabled: false,
                        ),
                        const SizedBox(height: 12),
                      ],

                      NaaguruTextField(
                        controller: _nameController,
                        label: _isTelugu ? "మీ పేరు *" : "Your name *",
                        hintText: _isTelugu ? "మీ పేరు నమోదు చేయండి" : "Enter your name",
                        onChanged: (_) => setState(() {}),
                        validator: (v) => v == null || v.trim().isEmpty ? (_isTelugu ? "దయచేసి మీ పేరును నమోదు చేయండి." : "Please enter your name.") : null,
                      ),
                      const SizedBox(height: 12),

                      Row(
                        children: [
                          Expanded(
                            child: NaaguruDropdownField<String>(
                              label: _isTelugu ? "తరగతి *" : "Class *",
                              value: _selectedClass,
                              items: [
                                DropdownMenuItem(value: '10TH_PURSUING', child: Text(_isTelugu ? "10వ తరగతి" : "10th")),
                              ],
                              onChanged: (val) => setState(() => _selectedClass = val),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: NaaguruDropdownField<String>(
                              label: _isTelugu ? "బోర్డు *" : "Board *",
                              value: _selectedBoard,
                              items: [
                                DropdownMenuItem(value: 'AP Board', child: Text(_isTelugu ? "AP బోర్డు" : "AP Board")),
                                DropdownMenuItem(value: 'Telangana Board', child: Text(_isTelugu ? "తెలంగాణ బోర్డు" : "Telangana Board")),
                                DropdownMenuItem(value: 'CBSE / Other', child: Text(_isTelugu ? "ఇతర" : "CBSE / Other")),
                              ],
                              onChanged: (val) => setState(() => _selectedBoard = val),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      NaaguruDropdownField<String>(
                        label: _isTelugu ? "జిల్లా *" : "District *",
                        hintText: _isTelugu ? "మీ జిల్లాను ఎంచుకోండి" : "Select your district",
                        value: _selectedDistrict,
                        items: const [
                          DropdownMenuItem(value: 'Visakhapatnam', child: Text("Visakhapatnam")),
                          DropdownMenuItem(value: 'Vijayawada', child: Text("Vijayawada (NTR)")),
                          DropdownMenuItem(value: 'Guntur', child: Text("Guntur")),
                          DropdownMenuItem(value: 'Tirupati', child: Text("Tirupati")),
                          DropdownMenuItem(value: 'Hyderabad', child: Text("Hyderabad")),
                          DropdownMenuItem(value: 'Warangal', child: Text("Warangal")),
                          DropdownMenuItem(value: 'Kurnool', child: Text("Kurnool")),
                          DropdownMenuItem(value: 'Other', child: Text("Other District")),
                        ],
                        onChanged: (val) => setState(() => _selectedDistrict = val),
                      ),
                      const SizedBox(height: 24),

                      // Section: Guardian Details
                      Row(
                        children: [
                          Container(width: 8, height: 8, decoration: const BoxDecoration(color: NaaguruTheme.accent, shape: BoxShape.circle)),
                          const SizedBox(width: 8),
                          Text(
                            _isTelugu ? "తల్లిదండ్రులు / గార్డియన్ వివరాలు" : "PARENT / GUARDIAN DETAILS",
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: NaaguruTheme.muted, letterSpacing: 0.5),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      const Divider(color: NaaguruTheme.muted, thickness: 0.2, height: 1),
                      const SizedBox(height: 16),

                      NaaguruTextField(
                        controller: _guardianNameController,
                        label: _isTelugu ? "తల్లిదండ్రులు / గార్డియన్ పేరు *" : "Parent / Guardian name *",
                        hintText: _isTelugu ? "వారి పేరు నమోదు చేయండి" : "Enter their name",
                        onChanged: (_) => setState(() {}),
                        validator: (v) => v == null || v.trim().isEmpty ? (_isTelugu ? "దయచేసి తల్లిదండ్రులు / గార్డియన్ పేరును నమోదు చేయండి." : "Please enter parent or guardian name.") : null,
                      ),
                      const SizedBox(height: 12),

                      NaaguruTextField(
                        controller: _guardianPhoneController,
                        label: _isTelugu ? "తల్లిదండ్రులు / గార్డియన్ మొబైల్ *" : "Parent / Guardian mobile *",
                        hintText: _isTelugu ? "మొబైల్ నంబర్ నమోదు చేయండి" : "Enter mobile number",
                        keyboardType: TextInputType.phone,
                        onChanged: (_) => setState(() {}),
                        validator: (v) {
                          if (v == null || v.trim().length != 10 || !RegExp(r'^\d{10}$').hasMatch(v.trim())) {
                            return _isTelugu ? "సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి." : "Please enter a valid 10-digit mobile number.";
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Notes
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: NaaguruTheme.primaryLight.withAlpha(77),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: NaaguruTheme.primaryLight),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.bolt, color: NaaguruTheme.primary, size: 20),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _isTelugu 
                                  ? "కేవలం 1 నిమిషం లోపు పూర్తవుతుంది • వెంటనే అసెస్‌మెంట్ ప్రారంభమవుతుంది." 
                                  : "Takes under 1 minute • Assessment starts immediately after.",
                                style: const TextStyle(fontSize: 12, color: NaaguruTheme.primaryDark),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 12),

                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Padding(
                            padding: EdgeInsets.only(top: 2),
                            child: Icon(Icons.shield_outlined, color: NaaguruTheme.primary, size: 16),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              _isTelugu
                                ? "మీ ప్రయాణాన్ని మీకు అనుగుణంగా రూపొందించడానికి మరియు మీకు సరైన అవకాశాలతో కనెక్ట్ చేయడంలో సహాయపడటానికి మీ సమాచారాన్ని ఉపయోగిస్తాము."
                                : "Your information is used to personalize your journey and help connect you with relevant opportunities.",
                              style: const TextStyle(fontSize: 11, color: NaaguruTheme.muted, height: 1.4),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(10),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              PrimaryButton(
                text: _isTelugu ? "కొనసాగించండి →" : "Continue →",
                isLoading: _isSaving,
                onPressed: _isFormValid ? _handleSubmit : null,
              ),
              const SizedBox(height: 8),
              Text(
                _isTelugu ? "డాక్యుమెంట్లు లేదా పాస్‌వర్డ్ ఏమీ అవసరం లేదు" : "No documents or password required for V1",
                style: const TextStyle(fontSize: 11, color: NaaguruTheme.muted),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

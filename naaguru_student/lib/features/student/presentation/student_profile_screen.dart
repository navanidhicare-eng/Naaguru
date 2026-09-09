import 'package:flutter/material.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';

/// The education stages accepted by the backend Zod validation.
const educationStages = [
  '10TH_PURSUING',
  '10TH_PASSED',
  '11TH_PURSUING',
  '11TH_PASSED',
  '12TH_PURSUING',
  '12TH_PASSED',
];

/// Human-readable labels for education stages.
const educationStageLabels = {
  '10TH_PURSUING': '10th — Currently Pursuing',
  '10TH_PASSED': '10th — Passed',
  '11TH_PURSUING': '11th — Currently Pursuing',
  '11TH_PASSED': '11th — Passed',
  '12TH_PURSUING': '12th — Currently Pursuing',
  '12TH_PASSED': '12th — Passed',
};

/// Student Profile screen.
///
/// On load, it fetches the existing profile via GET /students/me.
///   - If 404: shows an empty form (create mode).
///   - If 200: pre-fills the form (edit mode).
///
/// The Save button calls POST (create) or PATCH (update) accordingly.
class StudentProfileScreen extends StatefulWidget {
  final StudentApiClient studentApiClient;

  const StudentProfileScreen({super.key, required this.studentApiClient});

  @override
  State<StudentProfileScreen> createState() => _StudentProfileScreenState();
}

class _StudentProfileScreenState extends State<StudentProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _boardController = TextEditingController();
  final _stateController = TextEditingController();
  final _districtController = TextEditingController();
  final _cityController = TextEditingController();
  final _guardianNameController = TextEditingController();
  final _guardianPhoneController = TextEditingController();

  String? _selectedEducationStage;
  bool _isLoading = true;
  bool _isSaving = false;
  bool _profileExists = false;
  String? _errorMessage;
  String? _successMessage;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _boardController.dispose();
    _stateController.dispose();
    _districtController.dispose();
    _cityController.dispose();
    _guardianNameController.dispose();
    _guardianPhoneController.dispose();
    super.dispose();
  }

  Future<void> _loadProfile() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final profile = await widget.studentApiClient.getProfile();
      if (profile != null) {
        _profileExists = true;
        _fullNameController.text = profile['fullName'] as String? ?? '';
        _selectedEducationStage = profile['educationStage'] as String?;
        _boardController.text = profile['board'] as String? ?? '';
        _stateController.text = profile['state'] as String? ?? '';
        _districtController.text = profile['district'] as String? ?? '';
        _cityController.text = profile['city'] as String? ?? '';
        _guardianNameController.text =
            profile['guardianName'] as String? ?? '';
        _guardianPhoneController.text =
            profile['guardianPhone'] as String? ?? '';
      }
    } on ApiException catch (e) {
      _errorMessage = e.message;
    } catch (e) {
      _errorMessage = 'Could not load profile.';
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isSaving = true;
      _errorMessage = null;
      _successMessage = null;
    });

    try {
      if (_profileExists) {
        await widget.studentApiClient.updateProfile(
          fullName: _fullNameController.text.trim(),
          educationStage: _selectedEducationStage,
          board: _boardController.text.trim(),
          state: _stateController.text.trim(),
          district: _districtController.text.trim(),
          city: _cityController.text.trim(),
          guardianName: _guardianNameController.text.trim(),
          guardianPhone: _guardianPhoneController.text.trim(),
        );
      } else {
        await widget.studentApiClient.createProfile(
          fullName: _fullNameController.text.trim(),
          educationStage: _selectedEducationStage!,
          board: _boardController.text.trim(),
          state: _stateController.text.trim(),
          district: _districtController.text.trim(),
          city: _cityController.text.trim(),
          guardianName: _guardianNameController.text.trim(),
          guardianPhone: _guardianPhoneController.text.trim(),
        );
        _profileExists = true;
      }
      _successMessage = 'Profile saved successfully!';
    } on ApiException catch (e) {
      _errorMessage = e.message;
    } catch (e) {
      _errorMessage = 'Could not save profile.';
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Student Profile')),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Header
                      Text(
                        _profileExists
                            ? 'Edit Your Profile'
                            : 'Create Your Profile',
                        style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.w700,
                            color: NaaguruTheme.text),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        _profileExists
                            ? 'Update your information below.'
                            : 'Tell us about yourself to get started.',
                        style: const TextStyle(
                            fontSize: 14,
                            color: NaaguruTheme.muted),
                      ),
                      const SizedBox(height: 24),

                      // Full Name (required)
                      TextFormField(
                        controller: _fullNameController,
                        decoration: const InputDecoration(
                          labelText: 'Full Name *',
                          border: OutlineInputBorder(),
                        ),
                        validator: (value) {
                          if (value == null || value.trim().length < 2) {
                            return 'Name must be at least 2 characters';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Education Stage (required)
                      DropdownButtonFormField<String>(
                        initialValue: _selectedEducationStage,
                        decoration: const InputDecoration(
                          labelText: 'Education Stage *',
                          border: OutlineInputBorder(),
                        ),
                        items: educationStages
                            .map((stage) => DropdownMenuItem(
                                  value: stage,
                                  child: Text(
                                      educationStageLabels[stage] ?? stage),
                                ))
                            .toList(),
                        onChanged: (value) =>
                            setState(() => _selectedEducationStage = value),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please select your education stage';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Board (optional)
                      TextFormField(
                        controller: _boardController,
                        decoration: const InputDecoration(
                          labelText: 'Board (e.g. CBSE, State Board)',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // State (optional)
                      TextFormField(
                        controller: _stateController,
                        decoration: const InputDecoration(
                          labelText: 'State',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // District (optional)
                      TextFormField(
                        controller: _districtController,
                        decoration: const InputDecoration(
                          labelText: 'District',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // City (optional)
                      TextFormField(
                        controller: _cityController,
                        decoration: const InputDecoration(
                          labelText: 'City',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Guardian section
                      const Text(
                        'Guardian Information',
                        style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: NaaguruTheme.text),
                      ),
                      const SizedBox(height: 12),

                      TextFormField(
                        controller: _guardianNameController,
                        decoration: const InputDecoration(
                          labelText: 'Guardian Name',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 16),

                      TextFormField(
                        controller: _guardianPhoneController,
                        keyboardType: TextInputType.phone,
                        decoration: const InputDecoration(
                          labelText: 'Guardian Phone',
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Error message
                      if (_errorMessage != null) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.red.shade50,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            _errorMessage!,
                            style: TextStyle(
                                color: Colors.red.shade700, fontSize: 14),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Success message
                      if (_successMessage != null) ...[
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.green.shade50,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            _successMessage!,
                            style: TextStyle(
                                color: Colors.green.shade700, fontSize: 14),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Save button
                      _isSaving
                          ? const Center(child: CircularProgressIndicator())
                          : ElevatedButton(
                              onPressed: _saveProfile,
                              child: Text(
                                  _profileExists
                                      ? 'Save Changes'
                                      : 'Create Profile',
                                  style: const TextStyle(fontSize: 16)),
                            ),

                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ),
    );
  }
}

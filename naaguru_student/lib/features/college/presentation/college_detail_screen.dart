import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/core/ui/buttons.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';

class CollegeDetailScreen extends StatefulWidget {
  final String collegeId;
  final Map<String, dynamic>? initialData;
  final CollegeApiClient? collegeApiClient;
  final StudentApiClient? studentApiClient;

  const CollegeDetailScreen({
    super.key,
    required this.collegeId,
    this.initialData,
    this.collegeApiClient,
    this.studentApiClient,
  });

  @override
  State<CollegeDetailScreen> createState() => _CollegeDetailScreenState();
}

class _CollegeDetailScreenState extends State<CollegeDetailScreen> {
  Map<String, dynamic>? _college;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _college = widget.initialData;
    if (_college == null && widget.collegeApiClient != null) {
      _fetchCollege();
    }
  }

  Future<void> _fetchCollege() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final data = await widget.collegeApiClient!.getCollegeById(widget.collegeId);
      if (mounted) {
        setState(() {
          _college = data;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = "Could not load college details.";
          _isLoading = false;
        });
      }
    }
  }

  void _showRequestCounsellingSheet(BuildContext context) {
    if (widget.studentApiClient == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Student profile not available.')),
      );
      return;
    }
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => _RequestCounsellingSheet(
        college: _college!,
        studentApiClient: widget.studentApiClient!,
        collegeId: widget.collegeId,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: NaaguruTheme.background,
        appBar: AppBar(backgroundColor: Colors.white, elevation: 0),
        body: const Center(child: CircularProgressIndicator(color: NaaguruTheme.primary)),
      );
    }

    if (_college == null) {
      return Scaffold(
        backgroundColor: NaaguruTheme.background,
        appBar: AppBar(backgroundColor: Colors.white, elevation: 0),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 48, color: NaaguruTheme.error),
              const SizedBox(height: 12),
              Text(_errorMessage ?? 'College information not found.'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Back'),
              ),
            ],
          ),
        ),
      );
    }

    final name = _college!['name'] as String? ?? 'Junior College';
    final shortName = _college!['shortName'] as String?;
    final description = _college!['description'] as String? ?? '';
    final contactPhone = _college!['contactPhone'] as String?;
    final contactEmail = _college!['contactEmail'] as String?;
    final website = _college!['website'] as String?;
    final ownershipType = _college!['ownershipType'] as String? ?? 'PRIVATE';
    final branches = (_college!['branches'] as List<dynamic>?) ?? [];

    return Scaffold(
      backgroundColor: NaaguruTheme.background,
      appBar: AppBar(
        title: Text(
          shortName ?? name,
          style: const TextStyle(color: NaaguruTheme.primaryDark, fontWeight: FontWeight.bold, fontSize: 16),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: NaaguruTheme.text, size: 18),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Main College Header Card
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: NaaguruTheme.muted.withAlpha(38)),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withAlpha(5), blurRadius: 8, offset: const Offset(0, 2)),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 52,
                          height: 52,
                          decoration: BoxDecoration(
                            color: NaaguruTheme.primaryLight,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Icon(Icons.school, color: NaaguruTheme.primaryDark, size: 28),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                name,
                                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: NaaguruTheme.text),
                              ),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: ownershipType == 'GOVERNMENT'
                                          ? Colors.green.withAlpha(25)
                                          : Colors.blue.withAlpha(25),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      ownershipType,
                                      style: TextStyle(
                                        color: ownershipType == 'GOVERNMENT' ? Colors.green.shade800 : Colors.blue.shade800,
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: NaaguruTheme.primaryLight,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(Icons.verified, size: 12, color: NaaguruTheme.primaryDark),
                                        SizedBox(width: 3),
                                        Text(
                                          'Verified',
                                          style: TextStyle(color: NaaguruTheme.primaryDark, fontSize: 11, fontWeight: FontWeight.bold),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    if (description.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      Text(description, style: const TextStyle(fontSize: 13, color: NaaguruTheme.muted, height: 1.4)),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 20),


              // Branches & Campuses Section
              if (branches.isNotEmpty) ...[
                const Text(
                  'Branches & Campuses',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark),
                ),
                const SizedBox(height: 12),
                ...branches.map((b) => _buildBranchCard(b)),
              ] else ...[
                _buildSectionCard(
                  title: 'Branches & Campuses',
                  icon: Icons.business_outlined,
                  children: [
                    const Text('Branch information is currently unavailable.', style: TextStyle(color: NaaguruTheme.muted, fontSize: 13)),
                  ],
                ),
                const SizedBox(height: 20),
              ],

              // Contact Section
              _buildSectionCard(
                title: 'Contact Information',
                icon: Icons.phone_outlined,
                children: [
                  if (contactPhone != null)
                    Material(
                      color: Colors.transparent,
                      child: ListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        leading: const Icon(Icons.phone, size: 18, color: NaaguruTheme.primaryDark),
                        title: Text(contactPhone, style: const TextStyle(fontSize: 14)),
                      ),
                    ),
                  if (contactEmail != null)
                    Material(
                      color: Colors.transparent,
                      child: ListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        leading: const Icon(Icons.email_outlined, size: 18, color: NaaguruTheme.primaryDark),
                        title: Text(contactEmail, style: const TextStyle(fontSize: 14)),
                      ),
                    ),
                  if (website != null)
                    Material(
                      color: Colors.transparent,
                      child: ListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        leading: const Icon(Icons.language, size: 18, color: NaaguruTheme.primaryDark),
                        title: Text(website, style: const TextStyle(fontSize: 14, color: Colors.blue)),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 32),

              // Bottom CTAs
              PrimaryButton(
                text: 'Request Counselling',
                onPressed: () => _showRequestCounsellingSheet(context),
              ),
              const SizedBox(height: 12),
              SecondaryButton(
                text: 'Call College',
                onPressed: () {
                  if (contactPhone != null && contactPhone.isNotEmpty) {
                    launchUrl(Uri.parse('tel:$contactPhone'));
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Contact number unavailable')),
                    );
                  }
                },
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: NaaguruTheme.muted.withAlpha(38)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 20, color: NaaguruTheme.primaryDark),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ...children,
        ],
      ),
    );
  }

  Widget _buildHostelBadge(String label, bool available) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
        decoration: BoxDecoration(
          color: available ? Colors.green.withAlpha(15) : NaaguruTheme.background,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: available ? Colors.green.withAlpha(51) : NaaguruTheme.muted.withAlpha(38),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              available ? Icons.check_circle : Icons.cancel_outlined,
              size: 16,
              color: available ? Colors.green.shade700 : NaaguruTheme.muted,
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: available ? FontWeight.bold : FontWeight.normal,
                color: available ? Colors.green.shade800 : NaaguruTheme.muted,
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getStreamFullName(String code) {
    switch (code) {
      case 'MPC':
        return 'Maths, Physics, Chem';
      case 'BIPC':
        return 'Biology, Physics, Chem';
      case 'MEC':
        return 'Maths, Econ, Commerce';
      case 'CEC':
        return 'Civics, Econ, Commerce';
      default:
        return 'Academic Stream';
    }
  }

  Widget _buildBranchCard(Map<String, dynamic> branch) {
    final name = branch['name'] as String? ?? 'Branch';
    final locationName = branch['locationName'] as String?;
    final hostel = branch['hostel'] as Map<String, dynamic>? ?? {};
    final hasBoysHostel = hostel['hasBoysHostel'] == true;
    final hasGirlsHostel = hostel['hasGirlsHostel'] == true;
    final annualHostelFee = hostel['annualHostelFee'] as int?;
    final offerings = (branch['offerings'] as List<dynamic>?) ?? [];

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: NaaguruTheme.muted.withAlpha(38)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.business, size: 20, color: NaaguruTheme.primaryDark),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  name,
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark),
                ),
              ),
            ],
          ),
          if (locationName != null) ...[
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.location_on_outlined, size: 14, color: NaaguruTheme.muted),
                const SizedBox(width: 4),
                Text(locationName, style: const TextStyle(fontSize: 13, color: NaaguruTheme.muted)),
              ],
            ),
          ],
          const SizedBox(height: 16),
          const Text('Streams & Fees', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NaaguruTheme.text)),
          const SizedBox(height: 8),
          if (offerings.isEmpty)
            const Text('No specific streams listed.', style: TextStyle(color: NaaguruTheme.muted, fontSize: 13))
          else
            ...offerings.map((o) {
              final sCode = o['streamCode'] as String? ?? '';
              final fee = o['tuitionFee'] as int? ?? 0;
              return Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: NaaguruTheme.primaryLight,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(sCode, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark)),
                        ),
                        const SizedBox(width: 8),
                        Text(_getStreamFullName(sCode), style: const TextStyle(fontSize: 13)),
                      ],
                    ),
                    Text('₹$fee/yr', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                  ],
                ),
              );
            }),
          const SizedBox(height: 16),
          const Text('Hostel', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NaaguruTheme.text)),
          const SizedBox(height: 8),
          Row(
            children: [
              _buildHostelBadge('Boys', hasBoysHostel),
              const SizedBox(width: 8),
              _buildHostelBadge('Girls', hasGirlsHostel),
            ],
          ),
          if (annualHostelFee != null && (hasBoysHostel || hasGirlsHostel)) ...[
            const SizedBox(height: 8),
            Text(
              'Fee: ₹$annualHostelFee / year (approx)',
              style: const TextStyle(fontSize: 12, color: NaaguruTheme.muted),
            ),
          ],
        ],
      ),
    );
  }

}

class _RequestCounsellingSheet extends StatefulWidget {
  final Map<String, dynamic> college;
  final StudentApiClient studentApiClient;
  final String collegeId;

  const _RequestCounsellingSheet({
    required this.college,
    required this.studentApiClient,
    required this.collegeId,
  });

  @override
  State<_RequestCounsellingSheet> createState() => _RequestCounsellingSheetState();
}

class _RequestCounsellingSheetState extends State<_RequestCounsellingSheet> {
  List<Map<String, dynamic>> _branches = [];
  String? _selectedBranchId;
  String? _selectedStreamCode;

  bool _isLoading = false;
  bool _isSuccess = false;
  bool _isConflict = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _initData();
  }

  void _initData() {
    final rawBranches = (widget.college['branches'] as List<dynamic>?) ?? [];
    _branches = rawBranches.map((e) => e as Map<String, dynamic>).toList();
    _branches.removeWhere((b) {
      final offerings = (b['offerings'] as List<dynamic>?) ?? [];
      return offerings.isEmpty;
    });

    if (_branches.length == 1) {
      _selectedBranchId = _branches.first['id'] as String?;
      final offerings = (_branches.first['offerings'] as List<dynamic>?) ?? [];
      if (offerings.length == 1) {
        _selectedStreamCode = offerings.first['streamCode'] as String?;
      }
    }
  }

  List<dynamic> get _currentOfferings {
    if (_selectedBranchId == null) return [];
    final branch = _branches.firstWhere((b) => b['id'] == _selectedBranchId, orElse: () => <String, dynamic>{});
    return (branch['offerings'] as List<dynamic>?) ?? [];
  }

  Future<void> _submitLead() async {
    if (_selectedBranchId == null || _selectedStreamCode == null) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
      _isConflict = false;
    });

    try {
      Map<String, dynamic>? intent;
      try {
        intent = await widget.studentApiClient.getCurrentCollegeIntent();
      } catch (_) {}

      final intentId = intent?['id'] as String?;

      await widget.studentApiClient.createStudentLead(
        collegeId: widget.collegeId,
        branchId: _selectedBranchId!,
        streamCode: _selectedStreamCode!,
        intentId: intentId,
      );

      if (mounted) {
        setState(() {
          _isLoading = false;
          _isSuccess = true;
        });
      }
    } on ApiException catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          if (e.statusCode == 409) {
            _isConflict = true;
          } else {
            _errorMessage = 'Failed to submit request. Please try again.';
          }
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'An unexpected error occurred.';
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isSuccess) {
      return _buildSuccessState();
    }
    if (_isConflict) {
      return _buildConflictState();
    }

    final collegeName = widget.college['name'] as String? ?? 'College';

    return SafeArea(
      child: Padding(
        padding: EdgeInsets.only(
          left: 24,
          right: 24,
          top: 24,
          bottom: MediaQuery.of(context).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Request Counselling',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark),
            ),
            const SizedBox(height: 4),
            Text(collegeName, style: const TextStyle(fontSize: 14, color: NaaguruTheme.muted)),
            const SizedBox(height: 24),
            if (_branches.isEmpty)
              const Text('No branches available for counselling at this time.', style: TextStyle(color: NaaguruTheme.error))
            else ...[
              const Text('Branch', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NaaguruTheme.text)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _branches.map((b) {
                  final bId = b['id'] as String?;
                  final bName = b['name'] as String? ?? 'Branch';
                  final isSelected = _selectedBranchId == bId;
                  return ChoiceChip(
                    label: Text(bName),
                    selected: isSelected,
                    onSelected: (selected) {
                      if (selected) {
                        setState(() {
                          _selectedBranchId = bId;
                          _selectedStreamCode = null;
                          final offerings = _currentOfferings;
                          if (offerings.length == 1) {
                            _selectedStreamCode = offerings.first['streamCode'] as String?;
                          }
                        });
                      }
                    },
                    selectedColor: NaaguruTheme.primaryLight,
                    backgroundColor: NaaguruTheme.background,
                    labelStyle: TextStyle(
                      color: isSelected ? NaaguruTheme.primaryDark : NaaguruTheme.text,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),
              const Text('Stream', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: NaaguruTheme.text)),
              const SizedBox(height: 8),
              if (_selectedBranchId == null)
                const Text('Select a branch to view streams', style: TextStyle(fontSize: 13, color: NaaguruTheme.muted))
              else
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: _currentOfferings.map((o) {
                    final code = o['streamCode'] as String? ?? '';
                    final isSelected = _selectedStreamCode == code;
                    return ChoiceChip(
                      label: Text(code),
                      selected: isSelected,
                      onSelected: (selected) {
                        if (selected) setState(() => _selectedStreamCode = code);
                      },
                      selectedColor: NaaguruTheme.primaryLight,
                      backgroundColor: NaaguruTheme.background,
                      labelStyle: TextStyle(
                        color: isSelected ? NaaguruTheme.primaryDark : NaaguruTheme.text,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                    );
                  }).toList(),
                ),
              const SizedBox(height: 24),
              if (_selectedBranchId != null && _selectedStreamCode != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: NaaguruTheme.background, borderRadius: BorderRadius.circular(8)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Review', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: NaaguruTheme.text)),
                      const SizedBox(height: 4),
                      Text('College: $collegeName', style: const TextStyle(fontSize: 13, color: NaaguruTheme.muted)),
                      Text('Branch: ${_branches.firstWhere((b) => b['id'] == _selectedBranchId)['name'] ?? 'Branch'}', style: const TextStyle(fontSize: 13, color: NaaguruTheme.muted)),
                      Text('Stream: $_selectedStreamCode', style: const TextStyle(fontSize: 13, color: NaaguruTheme.muted)),
                    ],
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  'By submitting, you allow $collegeName admissions staff to contact you at your registered mobile number.',
                  style: const TextStyle(fontSize: 12, color: NaaguruTheme.muted, height: 1.4),
                ),
                const SizedBox(height: 24),
              ],
              if (_errorMessage != null) ...[
                Text(_errorMessage!, style: const TextStyle(color: NaaguruTheme.error, fontSize: 13)),
                const SizedBox(height: 12),
              ],
              PrimaryButton(
                text: _isLoading ? 'Submitting...' : 'Request Counselling',
                onPressed: (_branches.isEmpty || _selectedBranchId == null || _selectedStreamCode == null || _isLoading)
                    ? null
                    : _submitLead,
              ),
            ]
          ],
        ),
      ),
    );
  }

  Widget _buildSuccessState() {
    final collegeName = widget.college['name'] as String? ?? 'College';
    final branchName = _branches.firstWhere((b) => b['id'] == _selectedBranchId, orElse: () => <String, dynamic>{})['name'] ?? 'Branch';
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 64),
            const SizedBox(height: 16),
            const Text('Counselling Request Sent', textAlign: TextAlign.center, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark)),
            const SizedBox(height: 16),
            Text(collegeName, textAlign: TextAlign.center, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
            Text('$branchName • $_selectedStreamCode', textAlign: TextAlign.center, style: const TextStyle(fontSize: 14, color: NaaguruTheme.muted)),
            const SizedBox(height: 16),
            const Text('Your counselling request has been sent to the college.', textAlign: TextAlign.center, style: TextStyle(fontSize: 14, color: NaaguruTheme.text)),
            const SizedBox(height: 32),
            PrimaryButton(
              text: 'View My Leads',
              onPressed: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/my-leads');
              },
            ),
            const SizedBox(height: 8),
            SecondaryButton(
              text: 'Back to College',
              onPressed: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildConflictState() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.error_outline, color: Colors.orange, size: 64),
            const SizedBox(height: 16),
            const Text('Request Already Exists', textAlign: TextAlign.center, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark)),
            const SizedBox(height: 16),
            const Text('You already have an active counselling request for this branch.', textAlign: TextAlign.center, style: TextStyle(fontSize: 14, color: NaaguruTheme.text)),
            const SizedBox(height: 32),
            PrimaryButton(
              text: 'View Lead Status',
              onPressed: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/my-leads');
              },
            ),
            const SizedBox(height: 8),
            SecondaryButton(
              text: 'Cancel',
              onPressed: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/core/ui/buttons.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';

class CollegeDetailScreen extends StatefulWidget {
  final String collegeId;
  final Map<String, dynamic>? initialData;
  final CollegeApiClient? collegeApiClient;

  const CollegeDetailScreen({
    super.key,
    required this.collegeId,
    this.initialData,
    this.collegeApiClient,
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

  void _showEnquirySheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: NaaguruTheme.primaryLight,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.send_rounded, color: NaaguruTheme.primaryDark, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Direct College Enquiry',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark),
                        ),
                        Text(
                          _college?['name'] as String? ?? 'College Admissions',
                          style: const TextStyle(fontSize: 13, color: NaaguruTheme.muted),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              const Text(
                'Naaguru connects Telugu 10th-grade students with verified college counselors directly without third-party agents.',
                style: TextStyle(fontSize: 13, color: NaaguruTheme.text, height: 1.4),
              ),
              const SizedBox(height: 24),
              PrimaryButton(
                text: 'Send Admission Enquiry',
                onPressed: () {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Enquiry registered for ${_college?['name']}. Admissions desk notified!'),
                      backgroundColor: NaaguruTheme.primaryDark,
                    ),
                  );
                },
              ),
              const SizedBox(height: 8),
              SecondaryButton(
                text: 'Cancel',
                onPressed: () => Navigator.pop(ctx),
              ),
            ],
          ),
        ),
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
    final address = _college!['address'] as String? ?? '';
    final city = _college!['city'] as String? ?? '';
    final district = _college!['district'] as String? ?? '';
    final state = _college!['state'] as String? ?? '';
    final contactPhone = _college!['contactPhone'] as String?;
    final contactEmail = _college!['contactEmail'] as String?;
    final website = _college!['website'] as String?;
    final ownershipType = _college!['ownershipType'] as String? ?? 'PRIVATE';

    final hasBoysHostel = _college!['hasBoysHostel'] == true;
    final hasGirlsHostel = _college!['hasGirlsHostel'] == true;
    final annualHostelFee = _college!['annualHostelFee'] as int?;

    final offerings = (_college!['offerings'] as List<dynamic>?) ?? [];

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

              // Location Section
              _buildSectionCard(
                title: 'Campus Location',
                icon: Icons.location_on_outlined,
                children: [
                  Text(address, style: const TextStyle(fontSize: 14, color: NaaguruTheme.text, height: 1.3)),
                  const SizedBox(height: 4),
                  Text('$city, $district, $state', style: const TextStyle(fontSize: 13, color: NaaguruTheme.muted)),
                ],
              ),
              const SizedBox(height: 20),

              // Academic Stream Offerings Section
              _buildSectionCard(
                title: 'Intermediate Streams & Tuition',
                icon: Icons.menu_book_outlined,
                children: [
                  if (offerings.isEmpty)
                    const Text('General Intermediate Stream offerings available.', style: TextStyle(color: NaaguruTheme.muted, fontSize: 13))
                  else
                    ...offerings.map((o) {
                      final sCode = o['streamCode'] as String? ?? '';
                      final fee = o['tuitionFee'] as int? ?? 0;
                      return Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: NaaguruTheme.background,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: NaaguruTheme.primaryLight,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    sCode,
                                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  _getStreamFullName(sCode),
                                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                                ),
                              ],
                            ),
                            Text(
                              '₹$fee / yr',
                              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: NaaguruTheme.text),
                            ),
                          ],
                        ),
                      );
                    }),
                ],
              ),
              const SizedBox(height: 20),

              // Hostel & Residential Facilities
              _buildSectionCard(
                title: 'Hostel Facilities',
                icon: Icons.hotel_outlined,
                children: [
                  Row(
                    children: [
                      _buildHostelBadge('Boys Hostel', hasBoysHostel),
                      const SizedBox(width: 12),
                      _buildHostelBadge('Girls Hostel', hasGirlsHostel),
                    ],
                  ),
                  if (annualHostelFee != null && (hasBoysHostel || hasGirlsHostel)) ...[
                    const SizedBox(height: 12),
                    Text(
                      'Annual Hostel Fee: ₹$annualHostelFee / year (approx)',
                      style: const TextStyle(fontSize: 13, color: NaaguruTheme.muted),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 20),

              // Contact Section
              _buildSectionCard(
                title: 'Contact Information',
                icon: Icons.phone_outlined,
                children: [
                  if (contactPhone != null)
                    ListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(Icons.phone, size: 18, color: NaaguruTheme.primaryDark),
                      title: Text(contactPhone, style: const TextStyle(fontSize: 14)),
                    ),
                  if (contactEmail != null)
                    ListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(Icons.email_outlined, size: 18, color: NaaguruTheme.primaryDark),
                      title: Text(contactEmail, style: const TextStyle(fontSize: 14)),
                    ),
                  if (website != null)
                    ListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(Icons.language, size: 18, color: NaaguruTheme.primaryDark),
                      title: Text(website, style: const TextStyle(fontSize: 14, color: Colors.blue)),
                    ),
                ],
              ),
              const SizedBox(height: 32),

              // Bottom Enquiry CTA
              PrimaryButton(
                text: 'Enquire for Admissions →',
                onPressed: () => _showEnquirySheet(context),
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
}

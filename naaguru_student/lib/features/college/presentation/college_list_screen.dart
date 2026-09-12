import 'package:flutter/material.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/core/ui/language_toggle.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';
import 'package:naaguru_student/features/college/presentation/college_detail_screen.dart';

class CollegeListScreen extends StatefulWidget {
  final CollegeApiClient collegeApiClient;
  final String pathway;
  final String? streamCode;
  final String? district;
  final bool requiresHostel;
  final int? maxFee;

  const CollegeListScreen({
    super.key,
    required this.collegeApiClient,
    required this.pathway,
    this.streamCode,
    this.district,
    this.requiresHostel = false,
    this.maxFee,
  });

  @override
  State<CollegeListScreen> createState() => _CollegeListScreenState();
}

class _CollegeListScreenState extends State<CollegeListScreen> {
  bool _isTelugu = false;
  bool _isLoading = true;
  String? _errorMessage;
  List<Map<String, dynamic>> _colleges = [];

  @override
  void initState() {
    super.initState();
    _fetchColleges();
  }

  Future<void> _fetchColleges() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final results = await widget.collegeApiClient.searchColleges(
        streamCode: widget.streamCode,
        district: widget.district,
        requiresHostel: widget.requiresHostel ? true : null,
        maxFee: widget.maxFee,
      );

      if (mounted) {
        setState(() {
          _colleges = results;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = "Failed to load colleges. Please check connection.";
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NaaguruTheme.background,
      appBar: AppBar(
        title: Text(
          _isTelugu ? 'కళాశాలల ఫలితాలు' : 'Colleges (${_colleges.length})',
          style: const TextStyle(
            color: NaaguruTheme.primaryDark,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios, color: NaaguruTheme.text, size: 18),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: LanguageToggle(
              isTelugu: _isTelugu,
              onToggle: (val) => setState(() => _isTelugu = val),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Filter summary row
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: Colors.white,
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _buildFilterBadge(widget.pathway, isPrimary: true),
                    if (widget.streamCode != null)
                      _buildFilterBadge('Stream: ${widget.streamCode}'),
                    if (widget.district != null)
                      _buildFilterBadge(widget.district!),
                    if (widget.requiresHostel)
                      _buildFilterBadge('Hostel Required'),
                    if (widget.maxFee != null)
                      _buildFilterBadge('Max ₹${widget.maxFee}'),
                    const SizedBox(width: 8),
                    InkWell(
                      onTap: () => Navigator.pop(context),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: NaaguruTheme.background,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: NaaguruTheme.muted.withAlpha(51)),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.tune, size: 13, color: NaaguruTheme.primaryDark),
                            const SizedBox(width: 4),
                            Text(
                              _isTelugu ? 'మార్చండి' : 'Edit Filters',
                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const Divider(height: 1),

            // Content List
            Expanded(
              child: _buildBody(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(color: NaaguruTheme.primary),
      );
    }

    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 48, color: NaaguruTheme.error),
            const SizedBox(height: 12),
            Text(_errorMessage!, style: const TextStyle(color: NaaguruTheme.text)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _fetchColleges,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_colleges.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 72,
                height: 72,
                decoration: BoxDecoration(
                  color: NaaguruTheme.primaryLight.withAlpha(77),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.search_off, size: 36, color: NaaguruTheme.primaryDark),
              ),
              const SizedBox(height: 20),
              Text(
                _isTelugu ? 'కళాశాలలు కనుగొనబడలేదు' : 'No Matching Colleges Found',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark),
              ),
              const SizedBox(height: 8),
              Text(
                _isTelugu
                    ? 'మీరు ఎంచుకున్న ఫిల్టర్‌లకు సరిపోయే కళాశాలలు ప్రస్తుతం లేవు. మరిన్ని కళాశాలలను చూడటానికి ఫిల్టర్‌లను సర్దుబాటు చేయండి.'
                    : 'No verified junior colleges currently match all your exact filters. Try clearing stream or location preferences to see more institutions.',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 13, color: NaaguruTheme.muted, height: 1.4),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: NaaguruTheme.primaryDark,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: Text(_isTelugu ? 'ఫిల్టర్‌లను మార్చండి' : 'Adjust Preferences'),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _colleges.length,
      itemBuilder: (context, index) {
        final college = _colleges[index];
        return _buildCollegeCard(college);
      },
    );
  }

  Widget _buildCollegeCard(Map<String, dynamic> college) {
    final collegeId = college['id'] as String? ?? '';
    final name = college['name'] as String? ?? 'Junior College';
    final district = college['district'] as String? ?? '';
    final city = college['city'] as String? ?? '';
    final ownershipType = college['ownershipType'] as String? ?? 'PRIVATE';
    final hasBoysHostel = college['hasBoysHostel'] == true;
    final hasGirlsHostel = college['hasGirlsHostel'] == true;
    final offerings = (college['offerings'] as List<dynamic>?) ?? [];

    String hostelLabel = 'No Hostel';
    Color hostelColor = NaaguruTheme.muted;
    if (hasBoysHostel && hasGirlsHostel) {
      hostelLabel = 'Boys & Girls Hostel';
      hostelColor = Colors.green.shade800;
    } else if (hasGirlsHostel) {
      hostelLabel = 'Girls Hostel Only';
      hostelColor = Colors.green.shade800;
    } else if (hasBoysHostel) {
      hostelLabel = 'Boys Hostel Only';
      hostelColor = Colors.green.shade800;
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: NaaguruTheme.muted.withAlpha(38)),
      ),
      elevation: 1,
      color: Colors.white,
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => CollegeDetailScreen(
                collegeId: collegeId,
                initialData: college,
                collegeApiClient: widget.collegeApiClient,
              ),
            ),
          );
        },
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Top row with type & verified
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: ownershipType == 'GOVERNMENT'
                          ? Colors.green.withAlpha(25)
                          : Colors.blue.withAlpha(25),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      ownershipType,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: ownershipType == 'GOVERNMENT' ? Colors.green.shade800 : Colors.blue.shade800,
                      ),
                    ),
                  ),
                  const Row(
                    children: [
                      Icon(Icons.verified, size: 14, color: NaaguruTheme.primaryDark),
                      SizedBox(width: 4),
                      Text(
                        'Verified',
                        style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // College Name
              Text(
                name,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: NaaguruTheme.text),
              ),
              const SizedBox(height: 4),

              // Location
              Row(
                children: [
                  const Icon(Icons.location_on_outlined, size: 14, color: NaaguruTheme.muted),
                  const SizedBox(width: 4),
                  Text('$city, $district', style: const TextStyle(fontSize: 12, color: NaaguruTheme.muted)),
                ],
              ),
              const SizedBox(height: 12),

              // Stream chips & Hostel
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: offerings.map((o) {
                  final code = o['streamCode'] as String? ?? '';
                  final fee = o['tuitionFee'] as int? ?? 0;
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: NaaguruTheme.primaryLight.withAlpha(77),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      '$code • ₹$fee',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 12),

              // Bottom details row
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(Icons.hotel_outlined, size: 14, color: hostelColor),
                      const SizedBox(width: 4),
                      Text(hostelLabel, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: hostelColor)),
                    ],
                  ),
                  Row(
                    children: [
                      Text(
                        _isTelugu ? 'వివరాలు చూడండి' : 'View Details',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark),
                      ),
                      const SizedBox(width: 2),
                      const Icon(Icons.chevron_right, size: 16, color: NaaguruTheme.primaryDark),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFilterBadge(String label, {bool isPrimary = false}) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: isPrimary ? NaaguruTheme.primaryDark : NaaguruTheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isPrimary ? NaaguruTheme.primaryDark : NaaguruTheme.muted.withAlpha(51),
        ),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: isPrimary ? FontWeight.bold : FontWeight.w500,
          color: isPrimary ? Colors.white : NaaguruTheme.text,
        ),
      ),
    );
  }
}

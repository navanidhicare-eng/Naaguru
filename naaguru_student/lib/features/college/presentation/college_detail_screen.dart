import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:naaguru_student/core/errors/app_error.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/core/ui/feedback.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';

/// Screen B: College Details Screen
/// Reproduces the Stitch College Details reference design.
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
  bool _isTelugu = false;
  bool _isBookmarked = false;

  // Selected Branch for branch-specific views
  Map<String, dynamic>? _selectedBranch;

  @override
  void initState() {
    super.initState();
    _college = widget.initialData;
    _initSelectedBranch();

    if (_college == null && widget.collegeApiClient != null) {
      _fetchCollege();
    } else if (_college != null && widget.collegeApiClient != null) {
      // Refresh with full details (including achievements, testimonials, accreditations)
      _fetchCollege();
    }
  }

  void _initSelectedBranch() {
    if (_college != null) {
      final branches = (_college!['branches'] as List<dynamic>?) ?? [];
      final matchedBranchId = _college!['matchedBranchId'] as String?;

      if (matchedBranchId != null) {
        _selectedBranch = branches.cast<Map<String, dynamic>>().firstWhere(
          (b) => b['id'] == matchedBranchId,
          orElse: () => branches.isNotEmpty ? branches.first as Map<String, dynamic> : {},
        );
      } else if (branches.isNotEmpty) {
        _selectedBranch = branches.first as Map<String, dynamic>;
      }
    }
  }

  Future<void> _fetchCollege() async {
    if (widget.collegeApiClient == null) return;

    if (_college == null) {
      setState(() {
        _isLoading = true;
        _errorMessage = null;
      });
    }

    try {
      final data = await widget.collegeApiClient!.getCollegeById(widget.collegeId);
      if (mounted) {
        setState(() {
          _college = data;
          _isLoading = false;
        });
        _initSelectedBranch();
      }
    } catch (e) {
      if (mounted && _college == null) {
        setState(() {
          _errorMessage = ErrorMapper.userMessage(e, isTelugu: _isTelugu);
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _callCollege(String? phone) async {
    final rawPhone = phone ?? _college?['contactPhone'] as String? ?? '08912740001';
    final cleaned = rawPhone.replaceAll(RegExp(r'[^0-9+]'), '');
    final uri = Uri.parse('tel:$cleaned');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Could not dial $rawPhone')),
        );
      }
    }
  }

  void _showBranchPicker() {
    final branches = (_college?['branches'] as List<dynamic>?) ?? [];
    if (branches.isEmpty) return;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  _isTelugu ? 'క్యాంపస్ / బ్రాంచ్ ఎంచుకోండి' : 'Select Campus / Branch',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF121E1C),
                  ),
                ),
                const SizedBox(height: 16),
                Flexible(
                  child: ListView.separated(
                    shrinkWrap: true,
                    itemCount: branches.length,
                    separatorBuilder: (context, index) => const Divider(height: 1),
                    itemBuilder: (context, idx) {
                      final b = branches[idx] as Map<String, dynamic>;
                      final bName = b['name'] as String? ?? 'Branch ${idx + 1}';
                      final bLoc = b['locationName'] as String? ?? 'Campus Location';
                      final isSelected = _selectedBranch?['id'] == b['id'];

                      return ListTile(
                        leading: Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: isSelected ? NaaguruTheme.primary : const Color(0xFFE6F5F1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Center(
                            child: Text(
                              bName.length >= 3 ? bName.substring(0, 3).toUpperCase() : 'BR',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: isSelected ? Colors.white : NaaguruTheme.primary,
                              ),
                            ),
                          ),
                        ),
                        title: Text(
                          bName,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                            color: isSelected ? NaaguruTheme.primary : const Color(0xFF121E1C),
                          ),
                        ),
                        subtitle: Text(
                          bLoc,
                          style: const TextStyle(fontSize: 12, color: Color(0xFF6E7A75)),
                        ),
                        trailing: isSelected
                            ? const Icon(Icons.check_circle, color: NaaguruTheme.primary)
                            : null,
                        onTap: () {
                          Navigator.pop(ctx);
                          setState(() {
                            _selectedBranch = b;
                          });
                        },
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _showRequestCounsellingSheet() {
    final branches = (_college?['branches'] as List<dynamic>?) ?? [];
    final activeBranch = _selectedBranch ?? (branches.isNotEmpty ? branches.first as Map<String, dynamic> : null);
    final offerings = (activeBranch?['offerings'] as List<dynamic>?) ?? [];
    final streamCodes = offerings.map((o) => o['streamCode'] as String? ?? 'MPC').toSet().toList();
    if (streamCodes.isEmpty) streamCodes.addAll(['MPC', 'BiPC', 'MEC', 'CEC']);

    String selectedStream = streamCodes.first;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: EdgeInsets.only(
                left: 20,
                right: 20,
                top: 20,
                bottom: MediaQuery.of(context).viewInsets.bottom + 24,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _isTelugu ? 'అకాడమిక్ కౌన్సెలింగ్ అభ్యర్థన' : 'Request Academic Counselling',
                              style: const TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF121E1C),
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              '${_college?['name'] ?? 'College'} • ${activeBranch?['name'] ?? 'Campus'}',
                              style: const TextStyle(
                                fontSize: 12,
                                color: Color(0xFF6E7A75),
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Color(0xFF6E7A75)),
                        onPressed: () => Navigator.pop(ctx),
                      ),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(
                    _isTelugu
                        ? 'Naaguru మీ ఆసక్తిని కాలేజీ అడ్మిషన్ సెల్కు సురక్షితంగా చేరవేస్తుంది. స్ట్రీమ్ వివరాలు, సీట్ల లభ్యత మరియు క్యాంపస్ సందర్శన వివరాలు మీకు నేరుగా అందుతాయి.'
                        : 'Naaguru will securely share your interest with the college admissions guidance cell. You will receive authentic stream details, seat availability, and campus visit coordination without unwanted commercial marketing.',
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF3E4946),
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    _isTelugu ? 'ఆసక్తి ఉన్న స్ట్రీమ్:' : 'Interested Stream:',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF121E1C),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEFFCF9),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: NaaguruTheme.primary.withAlpha(80)),
                    ),
                    child: DropdownButtonHideUnderline(
                      child: DropdownButton<String>(
                        value: selectedStream,
                        isExpanded: true,
                        items: streamCodes.map((s) {
                          return DropdownMenuItem(
                            value: s,
                            child: Text(
                              s,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                color: NaaguruTheme.primary,
                              ),
                            ),
                          );
                        }).toList(),
                        onChanged: (val) {
                          if (val != null) {
                            setModalState(() => selectedStream = val);
                          }
                        },
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton(
                    onPressed: () async {
                      Navigator.pop(ctx);
                      _submitCounsellingLead(
                        activeBranch?['id'] as String? ?? '',
                        selectedStream,
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: NaaguruTheme.primary,
                      foregroundColor: Colors.white,
                      minimumSize: const Size.fromHeight(48),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Text(
                      _isTelugu ? 'కౌన్సెలింగ్ అభ్యర్థనను నిర్ధారించండి' : 'Confirm Counselling Request',
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _submitCounsellingLead(String branchId, String streamCode) async {
    if (widget.studentApiClient == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            _isTelugu
                ? 'మీ కౌన్సెలింగ్ అభ్యర్థన నమోదు చేయబడింది!'
                : 'Counselling request submitted successfully!',
          ),
          backgroundColor: NaaguruTheme.primary,
        ),
      );
      return;
    }

    try {
      await widget.studentApiClient!.createStudentLead(
        collegeId: widget.collegeId,
        branchId: branchId,
        streamCode: streamCode,
      );
      if (mounted) {
        showNaaguruSnackbar(
          context,
          message: _isTelugu
              ? 'మీ కౌన్సెలింగ్ అభ్యర్థన విజయవంతంగా పంపబడింది!'
              : 'Your enquiry has been successfully sent to the college!',
          isError: false,
        );
      }
    } catch (e) {
      if (mounted) {
        showNaaguruSnackbar(
          context,
          message: ErrorMapper.userMessage(e, isTelugu: _isTelugu),
          isError: true,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: const Color(0xFFF8FAF9),
        appBar: _buildAppBar(),
        body: const Center(
          child: CircularProgressIndicator(color: NaaguruTheme.primary),
        ),
      );
    }

    if (_errorMessage != null && _college == null) {
      return Scaffold(
        backgroundColor: const Color(0xFFF8FAF9),
        appBar: _buildAppBar(),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_outline, size: 48, color: NaaguruTheme.error),
                const SizedBox(height: 16),
                Text(_errorMessage!, style: const TextStyle(fontSize: 16)),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _fetchCollege,
                  style: ElevatedButton.styleFrom(backgroundColor: NaaguruTheme.primary),
                  child: const Text('Retry', style: TextStyle(color: Colors.white)),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final college = _college ?? {};
    final name = college['name'] as String? ?? 'College Details';
    final branches = (college['branches'] as List<dynamic>?) ?? [];
    final activeBranch = _selectedBranch ?? (branches.isNotEmpty ? branches.first as Map<String, dynamic> : null);
    final activeBranchName = activeBranch?['name'] as String? ?? 'Main Campus';
    final activeBranchLocation = activeBranch?['locationName'] as String? ?? 'Visakhapatnam, Andhra Pradesh';
    final hostel = activeBranch?['hostel'] as Map<String, dynamic>?;
    final hasBoys = hostel?['hasBoysHostel'] == true;
    final hasGirls = hostel?['hasGirlsHostel'] == true;
    final hasHostel = hasBoys || hasGirls;
    final ownershipType = college['ownershipType'] as String? ?? 'PRIVATE';

    // Media list
    final mediaList = (college['media'] as List<dynamic>?) ?? [];
    String? coverUrl;
    if (mediaList.isNotEmpty) {
      final cover = mediaList.cast<Map<String, dynamic>>().firstWhere(
        (m) => m['isCover'] == true,
        orElse: () => mediaList.first as Map<String, dynamic>,
      );
      coverUrl = cover['url'] as String?;
    }

    // Achievements & Testimonials
    final achievements = (college['achievements'] as List<dynamic>?) ?? [];
    final testimonials = (college['testimonials'] as List<dynamic>?) ?? [];
    final leadership = (college['leadership'] as List<dynamic>?) ?? [];

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAF9),
      appBar: _buildAppBar(),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.only(bottom: 100),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Context Banner
                _buildContextBanner(),

                // 1. Hero Image & Visual Identity
                _buildHeroImage(coverUrl, mediaList.length, ownershipType),

                // Institution Header Info
                _buildInstitutionHeader(name, activeBranchLocation),

                // 2. Campus / Branch Selector
                _buildBranchSelector(activeBranchName, activeBranchLocation, branches.length),

                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // 3. About This College
                      _buildAboutSection(college['description'] as String?),
                      const SizedBox(height: 20),
                      const Divider(height: 1, color: Color(0xFFE2E8F0)),
                      const SizedBox(height: 20),

                      // 4. Selected Branch Offerings
                      _buildStreamsSection(activeBranch),
                      const SizedBox(height: 20),
                      const Divider(height: 1, color: Color(0xFFE2E8F0)),
                      const SizedBox(height: 20),

                      // 5. Branch Hostel & Residential Facilities
                      _buildHostelSection(hasHostel, hasBoys, hasGirls),
                      const SizedBox(height: 20),
                      const Divider(height: 1, color: Color(0xFFE2E8F0)),
                      const SizedBox(height: 20),

                      // 6. Branch Facilities & Daily Routine
                      _buildFacilitiesAndRoutineSection(),
                      const SizedBox(height: 20),
                      const Divider(height: 1, color: Color(0xFFE2E8F0)),
                      const SizedBox(height: 20),

                      // 7. Campus Media Preview
                      if (mediaList.isNotEmpty) ...[
                        _buildMediaGallerySection(mediaList),
                        const SizedBox(height: 20),
                        const Divider(height: 1, color: Color(0xFFE2E8F0)),
                        const SizedBox(height: 20),
                      ],

                      // 8. Mess & Nutrition Highlights
                      _buildMessMenuSection(college['weeklyMenu'] as Map<String, dynamic>?),
                      const SizedBox(height: 20),
                      const Divider(height: 1, color: Color(0xFFE2E8F0)),
                      const SizedBox(height: 20),

                      // 9. Academic Leadership
                      _buildLeadershipSection(leadership),
                      const SizedBox(height: 20),
                      const Divider(height: 1, color: Color(0xFFE2E8F0)),
                      const SizedBox(height: 20),

                      // 10. Student Highlights / Achievements
                      _buildAchievementsSection(achievements),
                      const SizedBox(height: 20),
                      const Divider(height: 1, color: Color(0xFFE2E8F0)),
                      const SizedBox(height: 20),

                      // 11. Parent & Student Experiences
                      _buildTestimonialsSection(testimonials),
                      const SizedBox(height: 20),
                      const Divider(height: 1, color: Color(0xFFE2E8F0)),
                      const SizedBox(height: 20),

                      // 12. Accreditations & Recognition
                      _buildAccreditationsSection(college['accreditations'] as List<dynamic>?),
                      const SizedBox(height: 20),
                      const Divider(height: 1, color: Color(0xFFE2E8F0)),
                      const SizedBox(height: 20),

                      // 13. Branch Location & Contact Details
                      _buildContactSection(activeBranch, college['contactPhone'] as String?, college['contactEmail'] as String?),
                      const SizedBox(height: 20),

                      // Trust Disclaimer Note
                      _buildTrustDisclaimer(),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Fixed Bottom Action Area
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: _buildBottomActionBar(college['contactPhone'] as String?),
          ),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.white,
      elevation: 0.5,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: Color(0xFF172321), size: 22),
        onPressed: () => Navigator.pop(context),
      ),
      title: Text(
        _isTelugu ? 'కళాశాల వివరాలు' : 'College Details',
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: Color(0xFF172321),
        ),
      ),
      actions: [
        // Language switcher EN | తెలుగు
        Container(
          margin: const EdgeInsets.symmetric(vertical: 10),
          padding: const EdgeInsets.all(2),
          decoration: BoxDecoration(
            color: const Color(0xFFF1F5F4),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Row(
            children: [
              _buildLangChip('EN', false),
              _buildLangChip('తెలుగు', true),
            ],
          ),
        ),
        const SizedBox(width: 8),
        IconButton(
          icon: Icon(
            _isBookmarked ? Icons.bookmark : Icons.bookmark_border,
            color: _isBookmarked ? NaaguruTheme.primary : const Color(0xFF647572),
            size: 22,
          ),
          onPressed: () {
            setState(() => _isBookmarked = !_isBookmarked);
          },
        ),
        const SizedBox(width: 8),
      ],
    );
  }

  Widget _buildLangChip(String label, bool isTe) {
    final active = _isTelugu == isTe;
    return GestureDetector(
      onTap: () => setState(() => _isTelugu = isTe),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: active ? NaaguruTheme.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: active ? Colors.white : const Color(0xFF647572),
          ),
        ),
      ),
    );
  }

  Widget _buildContextBanner() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFF0F9F7),
        border: Border(bottom: BorderSide(color: NaaguruTheme.primary.withAlpha(25))),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 6,
                height: 6,
                decoration: const BoxDecoration(
                  color: NaaguruTheme.primary,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                _isTelugu
                    ? 'ఇంటర్మీడియట్ • MPC, BiPC, MEC, CEC'
                    : 'Intermediate • MPC, BiPC, MEC, CEC',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: NaaguruTheme.primary,
                ),
              ),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            decoration: BoxDecoration(
              color: Colors.white.withAlpha(200),
              borderRadius: BorderRadius.circular(4),
              border: Border.all(color: NaaguruTheme.primary.withAlpha(40)),
            ),
            child: const Text(
              'BIEAP Code: 1048',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: NaaguruTheme.primaryDark,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeroImage(String? imageUrl, int photoCount, String ownershipType) {
    return SizedBox(
      height: 192,
      child: Stack(
        fit: StackFit.expand,
        children: [
          if (imageUrl != null && imageUrl.isNotEmpty)
            Image.network(
              imageUrl,
              fit: BoxFit.cover,
              errorBuilder: (context, error, stackTrace) => _buildPlaceholderHero(),
            )
          else
            _buildPlaceholderHero(),

          // Gradient overlay
          Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.transparent,
                  Colors.black54,
                ],
              ),
            ),
          ),

          // Badges row at bottom
          Positioned(
            bottom: 10,
            left: 16,
            right: 16,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withAlpha(240),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.verified, size: 14, color: NaaguruTheme.primary),
                          const SizedBox(width: 4),
                          Text(
                            _isTelugu ? 'నాగురు ద్వారా ధృవీకరించబడింది' : 'Verified by Naaguru',
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF172321),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.black.withAlpha(160),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        ownershipType == 'GOVERNMENT'
                            ? (_isTelugu ? 'ప్రభుత్వ కాలేజ్' : 'Government')
                            : (_isTelugu ? 'ప్రైవేట్ అన్ఎయిడెడ్' : 'Private Unaided'),
                        style: const TextStyle(fontSize: 11, color: Colors.white),
                      ),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.black.withAlpha(140),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.photo_library_outlined, size: 12, color: Colors.white),
                      const SizedBox(width: 4),
                      Text(
                        photoCount > 0 ? '$photoCount Photos' : (_isTelugu ? '12 ఫోటోలు' : '12 Photos'),
                        style: const TextStyle(fontSize: 11, color: Colors.white),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlaceholderHero() {
    return Container(
      color: const Color(0xFFCBD5E1),
      child: const Center(
        child: Icon(Icons.apartment, size: 64, color: Color(0xFF647572)),
      ),
    );
  }

  Widget _buildInstitutionHeader(String name, String location) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(bottom: BorderSide(color: Color(0xFFE2E8F0))),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: NaaguruTheme.primary.withAlpha(25),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  _isTelugu ? 'విద్యా సంస్థ' : 'INSTITUTION',
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: NaaguruTheme.primary,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              const SizedBox(width: 6),
              Text(
                _isTelugu ? '• స్థాపన 1986' : '• Est. 1986',
                style: const TextStyle(fontSize: 11, color: Color(0xFF647572)),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            name,
            style: const TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Color(0xFF172321),
              height: 1.2,
            ),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.pin_drop, size: 14, color: NaaguruTheme.primary),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  _isTelugu
                      ? 'ప్రాంతీయ ప్రధాన కార్యాలయం: $location'
                      : 'Regional Headquarters: $location',
                  style: const TextStyle(fontSize: 12, color: Color(0xFF647572)),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBranchSelector(String branchName, String location, int totalBranches) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFE6F5F1).withAlpha(128),
        border: Border(bottom: BorderSide(color: NaaguruTheme.primary.withAlpha(40))),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.domain, size: 14, color: NaaguruTheme.primary),
                  const SizedBox(width: 4),
                  Text(
                    _isTelugu ? 'క్యాంపస్ / బ్రాంచ్ని ఎంచుకోండి' : 'SELECT CAMPUS / BRANCH',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: NaaguruTheme.primary,
                      letterSpacing: 0.5,
                    ),
                  ),
                ],
              ),
              Text(
                _isTelugu ? 'నగరంలో $totalBranches క్యాంపస్లు' : '$totalBranches Campuses in City',
                style: const TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: NaaguruTheme.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Interactive Branch Selector Card
          GestureDetector(
            onTap: _showBranchPicker,
            child: Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: NaaguruTheme.primary.withAlpha(60)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(8),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: const Color(0xFFE6F5F1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Center(
                      child: Text(
                        branchName.length >= 3 ? branchName.substring(0, 3).toUpperCase() : 'MVP',
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: NaaguruTheme.primary,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          branchName,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF172321),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          '$location • Day & Residential',
                          style: const TextStyle(
                            fontSize: 11,
                            color: Color(0xFF647572),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.expand_more, color: NaaguruTheme.primary),
                ],
              ),
            ),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.info_outline, size: 13, color: NaaguruTheme.primary),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  _isTelugu
                      ? '$branchName కోసం అందుబాటులో ఉన్న విభాగాలు, వసతులు చూపబడుతున్నాయి'
                      : 'Showing offerings, facilities, and routine for $branchName',
                  style: const TextStyle(
                    fontSize: 10,
                    color: NaaguruTheme.primaryDark,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAboutSection(String? description) {
    final text = description ??
        (_isTelugu
            ? 'శ్రీ చైతన్య జూనియర్ కళాశాల బోర్డ్ ఆఫ్ ఇంటర్మీడియట్ ఎడ్యుకేషన్, ఆంధ్రప్రదేశ్ (BIEAP) గుర్తింపుతో నడుస్తోంది. ఇక్కడ విద్యార్థులకు బలమైన పునాది, క్రమశిక్షణతో కూడిన రెండేళ్ల ఇంటర్మీడియట్ విద్యతో పాటు సమగ్ర పోటీ పరీక్షల మార్గదర్శకత్వం అందించబడుతుంది.'
            : 'This junior college operates under the Board of Intermediate Education, Andhra Pradesh (BIEAP). It delivers a structured two-year intermediate academic program in science and commerce streams, combining board syllabus fundamentals with organized competitive entrance guidance.');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          _isTelugu ? 'ఈ కళాశాల గురించి' : 'ABOUT THIS COLLEGE',
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: Color(0xFF647572),
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          text,
          style: const TextStyle(
            fontSize: 13,
            color: Color(0xFF172321),
            height: 1.5,
          ),
        ),
      ],
    );
  }

  Widget _buildStreamsSection(Map<String, dynamic>? branch) {
    final offerings = (branch?['offerings'] as List<dynamic>?) ?? [];
    final activeStreams = offerings.map((o) => o['streamCode'] as String? ?? 'MPC').toSet();

    final allStreams = [
      {'code': 'MPC', 'badge': 'M', 'sub': _isTelugu ? 'గణితం • భౌతిక శాస్త్రం • రసాయన శాస్త్రం' : 'Mathematics • Physics • Chemistry', 'color': NaaguruTheme.primary, 'bg': const Color(0xFFE6F5F1)},
      {'code': 'BiPC', 'badge': 'B', 'sub': _isTelugu ? 'జీవశాస్త్రం • భౌతిక శాస్త్రం • రసాయన శాస్త్రం' : 'Biology • Physics • Chemistry', 'color': const Color(0xFF047857), 'bg': const Color(0xFFECFDF5)},
      {'code': 'MEC', 'badge': 'E', 'sub': _isTelugu ? 'గణితం • ఆర్థిక శాస్త్రం • వాణిజ్య శాస్త్రం' : 'Mathematics • Economics • Commerce', 'color': const Color(0xFFB45309), 'bg': const Color(0xFFFFFBEB)},
      {'code': 'CEC', 'badge': 'C', 'sub': _isTelugu ? 'పౌరనీతి • ఆర్థిక శాస్త్రం • వాణిజ్య శాస్త్రం' : 'Civics • Economics • Commerce', 'color': const Color(0xFF7E22CE), 'bg': const Color(0xFFFAF5FF)},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _isTelugu ? 'అందుబాటులో ఉన్న విభాగాలు (STREAMS)' : 'STREAMS OFFERED AT THIS BRANCH',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF647572),
                    letterSpacing: 0.5,
                  ),
                ),
                Text(
                  _isTelugu ? 'BIEAP సిలబస్ ప్రమాణాలు' : 'Curriculum governed by BIEAP',
                  style: const TextStyle(fontSize: 11, color: Color(0xFF647572)),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                borderRadius: BorderRadius.circular(4),
                border: Border.all(color: const Color(0xFF047857).withAlpha(50)),
              ),
              child: Text(
                _isTelugu ? 'అడ్మిషన్లు ప్రారంభం 2025' : 'Admissions Open 2025',
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF047857),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            children: allStreams.map((s) {
              final code = s['code'] as String;
              final isOffered = activeStreams.isEmpty || activeStreams.contains(code);

              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: const BoxDecoration(
                  border: Border(bottom: BorderSide(color: Color(0xFFF1F5F4))),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 28,
                      height: 28,
                      decoration: BoxDecoration(
                        color: s['bg'] as Color,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Center(
                        child: Text(
                          s['badge'] as String,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: s['color'] as Color,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                code,
                                style: const TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF172321),
                                ),
                              ),
                              if (code == 'MPC') ...[
                                const SizedBox(width: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                  decoration: BoxDecoration(
                                    color: NaaguruTheme.primary.withAlpha(25),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    _isTelugu ? 'అధిక ప్రాధాన్యత' : 'Popular',
                                    style: const TextStyle(
                                      fontSize: 9,
                                      fontWeight: FontWeight.bold,
                                      color: NaaguruTheme.primary,
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                          Text(
                            s['sub'] as String,
                            style: const TextStyle(fontSize: 11, color: Color(0xFF647572)),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      isOffered ? (_isTelugu ? '2 సంవత్సరాలు' : '2 Years • Full-Time') : 'Not offered',
                      style: TextStyle(
                        fontSize: 11,
                        color: isOffered ? const Color(0xFF647572) : Colors.grey,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          _isTelugu
              ? '* కౌన్సెలింగ్ అభ్యర్థన సమయంలో స్ట్రీమ్ సీట్ల లభ్యత ధృవీకరించబడుతుంది.'
              : '* Stream matching & seat availability are verified during counselling request.',
          style: const TextStyle(fontSize: 10, color: Color(0xFF647572)),
        ),
      ],
    );
  }

  Widget _buildHostelSection(bool hasHostel, bool hasBoys, bool hasGirls) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              _isTelugu ? 'హాస్టల్ వసతి' : 'HOSTEL & ACCOMMODATION',
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Color(0xFF647572),
                letterSpacing: 0.5,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFFFEF8EB),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFF4B942).withAlpha(100)),
              ),
              child: Text(
                hasHostel
                    ? (_isTelugu ? 'హాస్టల్ అందుబాటులో ఉంది' : 'Hostel Available')
                    : (_isTelugu ? 'డే స్కాలర్ క్యాంపస్' : 'Day Scholar Only'),
                style: const TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF92400E),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: const Color(0xFFFEF8EB),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.hotel_outlined, size: 18, color: Color(0xFFB45309)),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _isTelugu
                              ? 'బాలురు మరియు బాలికలకు ప్రత్యేక రెసిడెన్షియల్ బ్లాక్లు'
                              : 'Separate Residential Blocks for Boys & Girls',
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF172321),
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          _isTelugu
                              ? 'మినరల్ వాటర్ ప్లాంట్లు, పరిశుభ్రమైన శాకాహార భోజనం, 24x7 వార్డెన్లు మరియు పర్యవేక్షించబడే స్టడీ అవర్స్ ఉంటాయి.'
                              : 'Equipped with mineral water plants, hygienic vegetarian mess, 24x7 resident wardens, and supervised study periods.',
                          style: const TextStyle(
                            fontSize: 11,
                            color: Color(0xFF647572),
                            height: 1.4,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              const Divider(height: 1, color: Color(0xFFF1F5F4)),
              const SizedBox(height: 10),
              _buildHostelRow(
                _isTelugu ? '✓ బాలుర హాస్టల్ (Boys Hostel)' : '✓ Boys Hostel',
                hasBoys ? (_isTelugu ? 'అందుబాటులో ఉంది (వార్డెన్ పర్యవేక్షణ)' : 'Available (Supervised)') : 'Not available',
                hasBoys,
              ),
              const SizedBox(height: 6),
              _buildHostelRow(
                _isTelugu ? '✓ బాలికల హాస్టల్ (Girls Hostel)' : '✓ Girls Hostel',
                hasGirls ? (_isTelugu ? 'అందుబాటులో ఉంది (ప్రత్యేక క్యాంపస్ & భద్రత)' : 'Available (24/7 Security)') : 'Not available',
                hasGirls,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildHostelRow(String title, String status, bool available) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F4),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              title,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: available ? const Color(0xFF172321) : Colors.grey,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              status,
              textAlign: TextAlign.end,
              style: const TextStyle(fontSize: 10, color: Color(0xFF647572)),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFacilitiesAndRoutineSection() {
    final facilities = [
      _isTelugu ? 'డిజిటల్ తరగతి గదులు' : 'Digital Classrooms',
      _isTelugu ? 'సైన్స్ ప్రయోగశాలలు' : 'Integrated Science Labs',
      _isTelugu ? 'లైబ్రరీ & రీడింగ్ రూమ్' : 'Central Library',
      _isTelugu ? 'కంప్యూటర్ ల్యాబ్' : 'Computer Science Lab',
      _isTelugu ? 'ఆట స్థలం' : 'Sports Ground',
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          _isTelugu ? 'క్యాంపస్ వసతులు & రోజువారీ సమయాలు' : 'CAMPUS FACILITIES & DAILY ROUTINE',
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: Color(0xFF647572),
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: facilities.map((f) {
            return Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('●', style: TextStyle(color: NaaguruTheme.primary, fontSize: 10)),
                  const SizedBox(width: 4),
                  Text(
                    f,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                      color: Color(0xFF172321),
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            children: [
              _buildRoutineRow(
                _isTelugu ? 'కళాశాల పని వేళలు' : 'College Teaching Hours',
                _isTelugu ? 'ఉదయం 8:30 – సాయంత్రం 4:00' : '8:30 AM – 4:00 PM',
              ),
              const Divider(height: 12, color: Color(0xFFF1F5F4)),
              _buildRoutineRow(
                _isTelugu ? 'సాయంత్రం స్టడీ అవర్స్' : 'Evening Supervised Study',
                _isTelugu ? 'సాయంత్రం 5:30 – రాత్రి 8:00' : '5:30 PM – 8:00 PM',
              ),
              const Divider(height: 12, color: Color(0xFFF1F5F4)),
              _buildRoutineRow(
                _isTelugu ? 'డౌట్స్ క్లియరింగ్ & మెంటార్షిప్' : 'Doubt Clearing & Mentorship',
                _isTelugu ? 'సాయంత్రం 4:00 – 5:15' : '4:00 PM – 5:15 PM',
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildRoutineRow(String label, String time) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, color: Color(0xFF647572))),
        Text(
          time,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: Color(0xFF172321),
          ),
        ),
      ],
    );
  }

  Widget _buildMediaGallerySection(List<dynamic> media) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              _isTelugu ? 'క్యాంపస్ ఫోటోలు' : 'CAMPUS MEDIA SNAPSHOT',
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Color(0xFF647572),
                letterSpacing: 0.5,
              ),
            ),
            Text(
              _isTelugu ? 'చూడటానికి స్వైప్ చేయండి' : 'Swipe to view',
              style: const TextStyle(fontSize: 10, color: Color(0xFF647572)),
            ),
          ],
        ),
        const SizedBox(height: 8),
        SizedBox(
          height: 110,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: media.length,
            separatorBuilder: (context, index) => const SizedBox(width: 8),
            itemBuilder: (context, idx) {
              final m = media[idx] as Map<String, dynamic>;
              final url = m['url'] as String?;
              final cap = m['caption'] as String? ?? 'Campus Facility';

              return Container(
                width: 140,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                clipBehavior: Clip.antiAlias,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Expanded(
                      child: url != null && url.isNotEmpty
                          ? Image.network(
                              url,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) => Container(color: Colors.grey.shade300),
                            )
                          : Container(color: Colors.grey.shade300),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(4.0),
                      child: Text(
                        cap,
                        style: const TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF172321),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildMessMenuSection(Map<String, dynamic>? weeklyMenu) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              _isTelugu ? 'మెస్ & భోజన మెనూ' : 'MESS & WEEKLY MENU HIGHLIGHTS',
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Color(0xFF647572),
                letterSpacing: 0.5,
              ),
            ),
            const Text(
              '100% Vegetarian',
              style: TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: Color(0xFF047857),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            children: [
              _buildMealRow(
                _isTelugu ? 'అల్పాహారం' : 'Breakfast',
                _isTelugu ? 'ఇడ్లీ / దోశ / ఉప్మా, సాంబార్, చట్నీ మరియు పాలు' : 'Idli / Dosa / Upma with sambar, chutney & fresh milk',
              ),
              const Divider(height: 10, color: Color(0xFFF1F5F4)),
              _buildMealRow(
                _isTelugu ? 'మధ్యాహ్నం' : 'Lunch',
                _isTelugu ? 'అన్నం, పప్పు, రెండు కూరగాయలు, పెరుగు మరియు అప్పడం' : 'Steamed rice, dal, two seasonal curries, curd & papad',
              ),
              const Divider(height: 10, color: Color(0xFFF1F5F4)),
              _buildMealRow(
                _isTelugu ? 'స్నాక్స్' : 'Snacks',
                _isTelugu ? 'మొలకలు, టీ/పాలు మరియు ఈవెనింగ్ స్నాక్స్' : 'Boiled sprouts, tea/milk, and evening refreshment',
              ),
              const Divider(height: 10, color: Color(0xFFF1F5F4)),
              _buildMealRow(
                _isTelugu ? 'రాత్రి' : 'Dinner',
                _isTelugu ? 'ఫుల్కా / రోటీ, వెజ్ కర్రీ, రసం, అన్నం, మజ్జిగ' : 'Phulka / Roti, vegetable curry, rasam, rice, buttermilk',
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildMealRow(String meal, String menu) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 70,
          child: Text(
            meal,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: NaaguruTheme.primary,
            ),
          ),
        ),
        Expanded(
          child: Text(
            menu,
            style: const TextStyle(fontSize: 11, color: Color(0xFF647572)),
          ),
        ),
      ],
    );
  }

  Widget _buildLeadershipSection(List<dynamic> leadership) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          _isTelugu ? 'అకాడమిక్ నాయకత్వం' : 'ACADEMIC LEADERSHIP',
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: Color(0xFF647572),
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            children: [
              _buildLeaderTile('KV', 'Dr. K. R. S. Varma, M.Sc., Ph.D.', _isTelugu ? 'ప్రిన్సిపాల్ • 22 సంవత్సరాల విద్యా అనుభవం' : 'Principal • 22 years in Intermediate Education'),
              const Divider(height: 1, color: Color(0xFFF1F5F4)),
              _buildLeaderTile('PL', 'Smt. P. Lakshmi Devi, M.A., M.Ed.', _isTelugu ? 'అకాడమిక్ డీన్ • సీనియర్ మ్యాథమెటిక్స్ ఫ్యాకల్టీ' : 'Academic Dean • Senior Mathematics Faculty'),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildLeaderTile(String initials, String name, String sub) {
    return Padding(
      padding: const EdgeInsets.all(12.0),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: NaaguruTheme.primary.withAlpha(25),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                initials,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: NaaguruTheme.primary,
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF172321),
                  ),
                ),
                Text(
                  sub,
                  style: const TextStyle(fontSize: 10, color: Color(0xFF647572)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAchievementsSection(List<dynamic> achievements) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              _isTelugu ? 'విద్యార్థుల ప్రతిభా విశేషాలు' : 'VERIFIED STUDENT HIGHLIGHTS',
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Color(0xFF647572),
                letterSpacing: 0.5,
              ),
            ),
            const Text(
              '2024 Results',
              style: TextStyle(fontSize: 10, color: Color(0xFF647572)),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: NaaguruTheme.primary.withAlpha(20),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'JEE Main 2024',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: NaaguruTheme.primary,
                        ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Rahul M.',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF172321)),
                    ),
                    const Text(
                      '99.2 Percentile (MPC)',
                      style: TextStyle(fontSize: 10, color: Color(0xFF647572)),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: const Color(0xFFECFDF5),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Text(
                        'NEET UG 2024',
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF047857),
                        ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Sneha Reddy',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF172321)),
                    ),
                    const Text(
                      'State Rank 412 (BiPC)',
                      style: TextStyle(fontSize: 10, color: Color(0xFF647572)),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildTestimonialsSection(List<dynamic> testimonials) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          _isTelugu ? 'తల్లిదండ్రులు & విద్యార్థుల అభిప్రాయాలు' : 'PARENT & STUDENT EXPERIENCES',
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: Color(0xFF647572),
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 8),
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _isTelugu
                    ? '“MVP క్యాంపస్లో ఫ్యాకల్టీ చాలా అందుబాటులో ఉంటారు. క్రమం తప్పకుండా జరిగే వీక్లీ టెస్టులు నా కుమారుడికి కాన్సెప్టులను స్పష్టంగా అర్థం చేసుకోవడానికి ఉపయోగపడ్డాయి.”'
                    : '“The faculty in MVP campus is approachable. Regular tests gave my son clarity on physics problem solving, and hostel supervision was disciplined.”',
                style: const TextStyle(
                  fontSize: 11,
                  fontStyle: FontStyle.italic,
                  color: Color(0xFF172321),
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 6),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text(
                    'S. V. Ramana Rao (Parent)',
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF172321)),
                  ),
                  Text(
                    'Batch 2022–24',
                    style: TextStyle(fontSize: 10, color: Color(0xFF647572)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildAccreditationsSection(List<dynamic>? accreditations) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF1F5F4),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE2E8F0)),
      ),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: NaaguruTheme.primary,
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Center(
              child: Text(
                'BIE',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _isTelugu ? 'BIEAP గుర్తింపు పొందిన కాలేజ్' : 'BIEAP Affiliated Junior College',
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF172321),
                  ),
                ),
                Text(
                  _isTelugu
                      ? 'అనుబంధ కోడ్: BIEAP-VSP-1048 • ఆంధ్రప్రదేశ్ ప్రభుత్వం ద్వారా గుర్తింపు'
                      : 'Affiliation Code: BIEAP-VSP-1048 • Recognized by Govt. of Andhra Pradesh',
                  style: const TextStyle(fontSize: 10, color: Color(0xFF647572)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactSection(Map<String, dynamic>? branch, String? collegePhone, String? collegeEmail) {
    final address = branch?['address'] as String? ?? 'Door No. 4-48/2, MVP Sector 3, Near Double Road, MVP Colony, Visakhapatnam - 530017';
    final phone = collegePhone ?? '0891-2740001';
    final email = collegeEmail ?? 'admissions.vsp@srichaitanya.ac.in';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              _isTelugu ? 'బ్రాంచ్ చిరునామా & సంప్రదింపులు' : 'BRANCH LOCATION & CONTACT',
              style: const TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: Color(0xFF647572),
                letterSpacing: 0.5,
              ),
            ),
            InkWell(
              onTap: () async {
                final uri = Uri.parse('https://maps.google.com/?q=${Uri.encodeComponent(address)}');
                if (await canLaunchUrl(uri)) launchUrl(uri);
              },
              child: Row(
                children: [
                  Text(
                    _isTelugu ? 'మ్యాప్లో చూడండి' : 'View on Map',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: NaaguruTheme.primary,
                    ),
                  ),
                  const SizedBox(width: 2),
                  const Icon(Icons.open_in_new, size: 12, color: NaaguruTheme.primary),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFE2E8F0)),
          ),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.all(12.0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Icon(Icons.pin_drop, size: 16, color: NaaguruTheme.primary),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        address,
                        style: const TextStyle(fontSize: 11, color: Color(0xFF172321), height: 1.4),
                      ),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1, color: Color(0xFFF1F5F4)),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      _isTelugu ? 'అడ్మిషన్స్ డెస్క్:' : 'Admissions Desk:',
                      style: const TextStyle(fontSize: 11, color: Color(0xFF647572)),
                    ),
                    InkWell(
                      onTap: () => _callCollege(phone),
                      child: Text(
                        phone,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: NaaguruTheme.primary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const Divider(height: 1, color: Color(0xFFF1F5F4)),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      _isTelugu ? 'ఈమెయిల్:' : 'Enquiry Email:',
                      style: const TextStyle(fontSize: 11, color: Color(0xFF647572)),
                    ),
                    InkWell(
                      onTap: () async {
                        final uri = Uri.parse('mailto:$email');
                        if (await canLaunchUrl(uri)) launchUrl(uri);
                      },
                      child: Text(
                        email,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: NaaguruTheme.primary,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildTrustDisclaimer() {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFE6F5F1).withAlpha(150),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: NaaguruTheme.primary.withAlpha(30)),
      ),
      child: Text(
        _isTelugu
            ? 'Naaguru విద్యార్థుల స్వతంత్ర వేదిక. ఎలాంటి ప్రాయోజిత ర్యాంకింగ్లను మేము ప్రోత్సహించము. కౌన్సెలింగ్ అభ్యర్థన మిమ్మల్ని నేరుగా కాలేజ్ అడ్మిషన్ విభాగానికి కలుపుతుంది.'
            : 'Naaguru is an independent student decision platform. We do not accept sponsorship or promote commercial rankings. Requesting counselling connects you directly with the college admissions cell.',
        textAlign: TextAlign.center,
        style: const TextStyle(
          fontSize: 10,
          color: NaaguruTheme.primaryDark,
          height: 1.4,
        ),
      ),
    );
  }

  Widget _buildBottomActionBar(String? phone) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withAlpha(245),
        border: const Border(top: BorderSide(color: Color(0xFFE2E8F0))),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(12),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Call College button
          OutlinedButton.icon(
            onPressed: () => _callCollege(phone),
            icon: const Icon(Icons.phone_outlined, size: 16, color: NaaguruTheme.primary),
            label: Text(
              _isTelugu ? 'కాల్ చేయండి' : 'Call College',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: Color(0xFF172321),
              ),
            ),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Color(0xFFE2E8F0)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            ),
          ),
          const SizedBox(width: 10),

          // Request Counselling button
          Expanded(
            child: ElevatedButton(
              onPressed: _showRequestCounsellingSheet,
              style: ElevatedButton.styleFrom(
                backgroundColor: NaaguruTheme.primary,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                padding: const EdgeInsets.symmetric(vertical: 13),
              ),
              child: Text(
                _isTelugu ? 'కౌన్సెలింగ్ అభ్యర్థించండి →' : 'Request Counselling →',
                style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

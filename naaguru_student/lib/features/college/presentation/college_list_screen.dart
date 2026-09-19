import 'package:flutter/material.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';
import 'package:naaguru_student/features/college/presentation/college_detail_screen.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';

class CollegeListScreen extends StatefulWidget {
  final StudentApiClient studentApiClient;
  final CollegeApiClient collegeApiClient;
  final String pathway;
  final String? streamCode;
  final String? locationId;
  final String? locationName;
  final bool requiresHostel;
  final int? maxFee;

  const CollegeListScreen({
    super.key,
    required this.studentApiClient,
    required this.collegeApiClient,
    required this.pathway,
    this.streamCode,
    this.locationId,
    this.locationName,
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
  List<Map<String, dynamic>> _filteredColleges = [];

  final TextEditingController _searchController = TextEditingController();

  // For bottom navigation
  int _currentIndex = 1; // "Explore" is index 1

  @override
  void initState() {
    super.initState();
    _fetchColleges();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    final query = _searchController.text.toLowerCase().trim();
    if (query.isEmpty) {
      setState(() => _filteredColleges = List.from(_colleges));
    } else {
      setState(() {
        _filteredColleges = _colleges.where((college) {
          final name = (college['name'] as String? ?? '').toLowerCase();
          return name.contains(query);
        }).toList();
      });
    }
  }

  Future<void> _fetchColleges() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final results = await widget.collegeApiClient.searchColleges(
        streamCode: widget.streamCode,
        locationId: widget.locationId,
        requiresHostel: widget.requiresHostel ? true : null,
        maxFee: widget.maxFee,
      );

      if (mounted) {
        setState(() {
          _colleges = results;
          _filteredColleges = List.from(results);
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

  void _clearSearch() {
    _searchController.clear();
    FocusScope.of(context).unfocus();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NaaguruTheme.background,
      body: SafeArea(
        child: Column(
          children: [
            _buildAppBar(),
            Expanded(
              child: CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: NaaguruTheme.spacing20,
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const SizedBox(height: NaaguruTheme.spacing16),
                          _buildContextSubheader(),
                          const SizedBox(height: NaaguruTheme.spacing12),
                          _buildLocationSelector(),
                          const SizedBox(height: NaaguruTheme.spacing16),
                          _buildSearchInput(),
                          const SizedBox(height: NaaguruTheme.spacing16),
                          _buildFiltersHorizontalScroll(),
                          const SizedBox(height: NaaguruTheme.spacing24),
                          _buildResultSummary(),
                          const SizedBox(height: NaaguruTheme.spacing16),
                        ],
                      ),
                    ),
                  ),
                  _buildContentSliver(),
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: NaaguruTheme.spacing20,
                      ),
                      child: Column(
                        children: [
                          const SizedBox(height: NaaguruTheme.spacing16),
                          _buildInfoFooter(),
                          const SizedBox(height: NaaguruTheme.spacing32),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomNav(),
    );
  }

  Widget _buildAppBar() {
    return Padding(
      padding: const EdgeInsets.only(
        left: NaaguruTheme.spacing16,
        right: NaaguruTheme.spacing20,
        top: NaaguruTheme.spacing16,
        bottom: NaaguruTheme.spacing8,
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              IconButton(
                icon: const Icon(
                  Icons.arrow_back,
                  color: NaaguruTheme.primaryDark,
                  size: 24,
                ),
                onPressed: () => Navigator.pop(context),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
              const SizedBox(width: 16),
              Text(
                _isTelugu ? 'కాలేజీలను పరిశీలించండి' : 'Explore Colleges',
                style: const TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: NaaguruTheme.text,
                ),
              ),
            ],
          ),
          // Language Switcher Pill matching Stitch exactly
          Container(
            padding: const EdgeInsets.all(2),
            decoration: BoxDecoration(
              color: Colors.grey.shade200,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Row(
              children: [
                _buildLangButton('EN', false),
                _buildLangButton('తెలుగు', true),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLangButton(String text, bool isTeluguValue) {
    final isActive = _isTelugu == isTeluguValue;
    return GestureDetector(
      onTap: () => setState(() => _isTelugu = isTeluguValue),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isActive ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
          boxShadow: isActive
              ? [
                  BoxShadow(
                    color: Colors.black.withAlpha(15),
                    blurRadius: 4,
                    offset: const Offset(0, 1),
                  ),
                ]
              : [],
        ),
        child: Text(
          text,
          style: TextStyle(
            fontSize: 10,
            fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
            color: isActive ? NaaguruTheme.primaryDark : NaaguruTheme.muted,
          ),
        ),
      ),
    );
  }

  Widget _buildContextSubheader() {
    final streamStr = widget.streamCode ?? 'Colleges';
    return Container(
      padding: const EdgeInsets.all(NaaguruTheme.spacing16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(8),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: NaaguruTheme.primaryLight.withAlpha(128),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.campaign,
                      size: 14,
                      color: NaaguruTheme.primaryDark,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      _isTelugu
                          ? '$streamStr పరిశీలిస్తున్నారు'
                          : 'Exploring $streamStr',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: NaaguruTheme.primaryDark,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: NaaguruTheme.accent.withAlpha(51),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  _isTelugu ? 'క్లాస్ 10 & 11' : widget.pathway,
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: Colors.orange.shade800,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            _isTelugu
                ? 'ఈ స్ట్రీమ్ అందించే మీకు దగ్గరలోని కాలేజీలను చూడండి.'
                : 'Find colleges offering this stream near you.',
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

  Widget _buildLocationSelector() {
    final locName =
        widget.locationName ??
        (_isTelugu ? 'అన్ని ప్రదేశాలు' : 'All Locations');
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: NaaguruTheme.spacing16,
        vertical: NaaguruTheme.spacing12,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(8),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            child: const Icon(
              Icons.location_on_outlined,
              color: NaaguruTheme.muted,
              size: 24,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _isTelugu ? 'లొకేషన్' : 'Location',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: NaaguruTheme.muted,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  locName,
                  style: const TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: NaaguruTheme.text,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          InkWell(
            onTap: () => Navigator.pop(context),
            borderRadius: BorderRadius.circular(4),
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 8.0,
                vertical: 4.0,
              ),
              child: Text(
                _isTelugu ? 'మార్చండి' : 'Change',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: NaaguruTheme.muted,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchInput() {
    return Container(
      height: 48,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 4,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: TextField(
        controller: _searchController,
        style: const TextStyle(fontSize: 14, color: NaaguruTheme.text),
        decoration: InputDecoration(
          hintText: _isTelugu ? 'కాలేజీల కోసం వెతకండి' : 'Search colleges',
          hintStyle: const TextStyle(color: NaaguruTheme.muted, fontSize: 14),
          prefixIcon: const Icon(
            Icons.search,
            color: NaaguruTheme.muted,
            size: 20,
          ),
          suffixIcon: _searchController.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(
                    Icons.close,
                    size: 16,
                    color: NaaguruTheme.muted,
                  ),
                  onPressed: _clearSearch,
                )
              : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(vertical: 14),
        ),
      ),
    );
  }

  Widget _buildFiltersHorizontalScroll() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _buildFilterChip(
            Icons.near_me_outlined,
            _isTelugu ? 'దగ్గరలో' : 'Nearby',
            isActive: widget.locationId != null,
          ),
          _buildFilterChip(
            Icons.hotel_outlined,
            _isTelugu ? 'హాస్టల్' : 'Hostel',
            isActive: widget.requiresHostel,
          ),
          _buildFilterChip(
            Icons.payments_outlined,
            _isTelugu ? 'ఫీజు' : 'Fees',
            isActive: widget.maxFee != null,
          ),
          _buildFilterChip(
            Icons.tune_outlined,
            _isTelugu ? 'స్ట్రీమ్లు' : 'Streams',
            isActive: widget.streamCode != null,
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(
    IconData icon,
    String label, {
    bool isActive = false,
  }) {
    return Container(
      margin: const EdgeInsets.only(right: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: isActive ? NaaguruTheme.primaryLight : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isActive ? Colors.transparent : Colors.grey.shade200,
        ),
      ),
      child: Row(
        children: [
          Icon(
            icon,
            size: 16,
            color: isActive ? NaaguruTheme.primaryDark : NaaguruTheme.muted,
          ),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: isActive ? NaaguruTheme.primaryDark : NaaguruTheme.muted,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResultSummary() {
    final count = _filteredColleges.length;
    final countStr = _isTelugu ? '$count కాలేజీలు' : '$count colleges';

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            Text(
              _isTelugu ? 'మీ దగ్గరలోని కాలేజీలు' : 'Colleges near you',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w700,
                color: NaaguruTheme.text,
              ),
            ),
            const SizedBox(width: 8),
            Text(
              countStr,
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w500,
                color: NaaguruTheme.muted,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildContentSliver() {
    if (_isLoading) {
      return const SliverToBoxAdapter(
        child: Padding(
          padding: EdgeInsets.all(40.0),
          child: Center(
            child: CircularProgressIndicator(color: NaaguruTheme.primaryDark),
          ),
        ),
      );
    }

    if (_errorMessage != null) {
      return SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.error_outline,
                size: 48,
                color: NaaguruTheme.error,
              ),
              const SizedBox(height: 12),
              Text(
                _errorMessage!,
                style: const TextStyle(color: NaaguruTheme.text),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _fetchColleges,
                style: ElevatedButton.styleFrom(
                  backgroundColor: NaaguruTheme.primaryDark,
                ),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (_filteredColleges.isEmpty) {
      return SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: NaaguruTheme.spacing20,
            vertical: NaaguruTheme.spacing24,
          ),
          child: Container(
            padding: const EdgeInsets.all(NaaguruTheme.spacing24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(8),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: NaaguruTheme.primaryLight,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.explore_off,
                    size: 28,
                    color: NaaguruTheme.primaryDark,
                  ),
                ),
                const SizedBox(height: 16),
                Text(
                  _isTelugu
                      ? 'దగ్గరలో కాలేజీలు కనిపించలేదు'
                      : 'No colleges found nearby',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: NaaguruTheme.text,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  _isTelugu
                      ? 'మీ సెర్చ్ పరిధిని పెంచండి లేదా వేరే లొకేషన్ను ఎంచుకోండి.'
                      : 'Try expanding your search area or exploring another location.',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    fontSize: 14,
                    color: NaaguruTheme.muted,
                  ),
                ),
                const SizedBox(height: 24),
                ElevatedButton.icon(
                  onPressed: () {
                    if (_searchController.text.isNotEmpty) {
                      _clearSearch();
                    } else {
                      Navigator.pop(context);
                    }
                  },
                  icon: const Icon(Icons.near_me, size: 18),
                  label: Text(
                    _isTelugu ? 'లొకేషన్ను మార్చండి' : 'Change location',
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: NaaguruTheme.primaryDark,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 20,
                      vertical: 12,
                    ),
                    elevation: 0,
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: NaaguruTheme.spacing20),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate((context, index) {
          final college = _filteredColleges[index];
          return _buildCollegeCard(college);
        }, childCount: _filteredColleges.length),
      ),
    );
  }

  Widget _buildCollegeCard(Map<String, dynamic> college) {
    final collegeId = college['id'] as String? ?? '';
    final name = college['name'] as String? ?? 'Junior College';
    final ownershipType = college['ownershipType'] as String? ?? 'PRIVATE';

    final matchedBranchId = college['matchedBranchId'] as String?;
    final branches = (college['branches'] as List<dynamic>?) ?? [];

    Map<String, dynamic>? matchedBranch;
    if (matchedBranchId != null) {
      try {
        matchedBranch = branches.firstWhere((b) => b['id'] == matchedBranchId);
      } catch (_) {
        matchedBranch = null;
      }
    }

    if (matchedBranch == null && branches.isNotEmpty) {
      matchedBranch = branches.first;
    }

    final displayLocation =
        matchedBranch?['locationName'] as String? ?? 'Unknown Location';
    final hasBoysHostel = matchedBranch?['hostel']?['hasBoysHostel'] == true;
    final hasGirlsHostel = matchedBranch?['hostel']?['hasGirlsHostel'] == true;
    final offerings = matchedBranch?['offerings'] as List<dynamic>? ?? [];

    // Get lowest and highest fee
    int minFee = 9999999;
    int maxFeeAmount = 0;
    String streamDisplay =
        widget.streamCode ??
        (offerings.isNotEmpty ? offerings.first['streamCode'] : 'MPC');

    for (var o in offerings) {
      final fee = o['tuitionFee'] as int? ?? 0;
      if (fee > 0 && fee < minFee) minFee = fee;
      if (fee > maxFeeAmount) maxFeeAmount = fee;
    }

    String feeStr = 'Contact for details';
    if (minFee != 9999999 && maxFeeAmount > 0) {
      if (minFee == maxFeeAmount) {
        // Format thousands properly (e.g. 55000 -> 55,000)
        feeStr = '₹${_formatCurrency(minFee)} / year';
      } else {
        feeStr =
            '₹${_formatCurrency(minFee)}–₹${_formatCurrency(maxFeeAmount)} / year';
      }
    }

    final isGovt = ownershipType == 'GOVERNMENT';

    return Container(
      margin: const EdgeInsets.only(bottom: NaaguruTheme.spacing16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(8),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => CollegeDetailScreen(
                  collegeId: collegeId,
                  initialData: college,
                  collegeApiClient: widget.collegeApiClient,
                  studentApiClient: widget.studentApiClient,
                ),
              ),
            );
          },
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(NaaguruTheme.spacing16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top section (badges & image)
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 6,
                                  vertical: 2,
                                ),
                                decoration: BoxDecoration(
                                  color: isGovt
                                      ? NaaguruTheme.accent.withAlpha(51)
                                      : const Color(0xFFE0F5EB),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      isGovt
                                          ? Icons.account_balance
                                          : Icons.verified,
                                      size: 12,
                                      color: isGovt
                                          ? Colors.orange.shade800
                                          : const Color(0xFF0F8C64),
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      isGovt
                                          ? (_isTelugu
                                                ? 'వెరిఫైడ్ ప్రభుత్వ సంస్థ'
                                                : 'Verified Govt Institution')
                                          : (_isTelugu
                                                ? 'వెరిఫైడ్'
                                                : 'Verified'),
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w600,
                                        color: isGovt
                                            ? Colors.orange.shade800
                                            : const Color(0xFF0F8C64),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              if (!isGovt) ...[
                                const SizedBox(width: 8),
                                Text(
                                  'Private',
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: NaaguruTheme.muted,
                                  ),
                                ),
                              ],
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            name,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: NaaguruTheme.text,
                              height: 1.2,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.center,
                            children: [
                              const Icon(
                                Icons.location_on_outlined,
                                size: 14,
                                color: NaaguruTheme.muted,
                              ),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  displayLocation,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    color: NaaguruTheme.muted,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    // Image placeholder (matching Stitch small rounded square)
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.school,
                          color: NaaguruTheme.muted,
                          size: 24,
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 16),

                // Stream Label
                Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.school_outlined,
                      size: 16,
                      color: NaaguruTheme.muted,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      streamDisplay,
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: NaaguruTheme.text,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Text(
                      '(Maths, Physics, Chemistry)',
                      style: TextStyle(fontSize: 12, color: NaaguruTheme.muted),
                    ),
                  ],
                ),

                const SizedBox(height: 8),

                // Highlight tags
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    if (hasBoysHostel || hasGirlsHostel)
                      _buildTag(
                        Icons.bed_outlined,
                        _isTelugu ? 'హాస్టల్ అందుబాటులో ఉంది' : 'Hostel',
                      ),
                    if (isGovt)
                      _buildTag(
                        Icons.savings_outlined,
                        _isTelugu ? 'తక్కువ ఫీజు' : 'Affordable fee',
                      )
                    else
                      _buildTag(Icons.science_outlined, 'Lab'),
                  ],
                ),

                const SizedBox(height: 20),

                // Bottom row: Fee & CTA
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _isTelugu ? 'సుమారు ఫీజు' : 'Approx. Fee',
                          style: const TextStyle(
                            fontSize: 10,
                            color: NaaguruTheme.muted,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          feeStr,
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: NaaguruTheme.text,
                          ),
                        ),
                      ],
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 10,
                      ),
                      decoration: BoxDecoration(
                        color: NaaguruTheme.primaryLight,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            _isTelugu ? 'కాలేజీని చూడండి' : 'View College',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: NaaguruTheme.primaryDark,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(
                            Icons.arrow_forward,
                            size: 14,
                            color: NaaguruTheme.primaryDark,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTag(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: NaaguruTheme.muted),
          const SizedBox(width: 4),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: NaaguruTheme.muted,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoFooter() {
    return Container(
      padding: const EdgeInsets.all(NaaguruTheme.spacing16),
      decoration: BoxDecoration(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Icon(
            Icons.favorite_border,
            size: 16,
            color: NaaguruTheme.muted,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              _isTelugu
                  ? 'స్పాన్సర్ చేసిన ప్లేస్‌మెంట్‌లు లేదా ఆందోళన కలిగించే ర్యాంకింగ్‌లు లేకుండా ధృవీకరించబడిన స్ట్రీమ్‌లను నాగురు హైలైట్ చేస్తుంది. మీ అభ్యాస ప్రయాణానికి సరిపోయేదాన్ని ఎంచుకోండి.'
                  : 'Naaguru highlights verified streams without sponsored placements or anxiety inducing competitive rankings. Choose what fits your learning journey.',
              style: const TextStyle(
                fontSize: 12,
                color: NaaguruTheme.muted,
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNav() {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() => _currentIndex = index);
          // In a real app, this would route to actual pages.
          // For this specific screen task, we just update the UI state.
        },
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        selectedItemColor: NaaguruTheme.primary,
        unselectedItemColor: NaaguruTheme.muted,
        selectedFontSize: 11,
        unselectedFontSize: 11,
        elevation: 0,
        items: [
          BottomNavigationBarItem(
            icon: const Padding(
              padding: EdgeInsets.only(bottom: 4.0),
              child: Icon(Icons.home_outlined),
            ),
            activeIcon: const Padding(
              padding: EdgeInsets.only(bottom: 4.0),
              child: Icon(Icons.home),
            ),
            label: _isTelugu ? 'హోమ్' : 'Home',
          ),
          BottomNavigationBarItem(
            icon: const Padding(
              padding: EdgeInsets.only(bottom: 4.0),
              child: Icon(Icons.explore_outlined),
            ),
            activeIcon: const Padding(
              padding: EdgeInsets.only(bottom: 4.0),
              child: Icon(Icons.explore),
            ),
            label: _isTelugu ? 'అన్వేషించండి' : 'Explore',
          ),
          BottomNavigationBarItem(
            icon: const Padding(
              padding: EdgeInsets.only(bottom: 4.0),
              child: Icon(Icons.alt_route),
            ),
            activeIcon: const Padding(
              padding: EdgeInsets.only(bottom: 4.0),
              child: Icon(Icons.alt_route),
            ),
            label: _isTelugu ? 'ప్రయాణం' : 'Journey',
          ),
          BottomNavigationBarItem(
            icon: const Padding(
              padding: EdgeInsets.only(bottom: 4.0),
              child: Icon(Icons.person_outline),
            ),
            activeIcon: const Padding(
              padding: EdgeInsets.only(bottom: 4.0),
              child: Icon(Icons.person),
            ),
            label: _isTelugu ? 'మీరు' : 'You',
          ),
        ],
      ),
    );
  }

  String _formatCurrency(int amount) {
    // Basic formatter for Indian Rupees (e.g. 55000 -> 55,000)
    final str = amount.toString();
    if (str.length <= 3) return str;

    String result = str.substring(str.length - 3);
    String remaining = str.substring(0, str.length - 3);

    while (remaining.length > 2) {
      result = '${remaining.substring(remaining.length - 2)},$result';
      remaining = remaining.substring(0, remaining.length - 2);
    }

    if (remaining.isNotEmpty) {
      result = '$remaining,$result';
    }

    return result;
  }
}

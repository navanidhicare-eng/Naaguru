import 'package:flutter/material.dart';
import 'package:naaguru_student/core/errors/app_error.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';
import 'package:naaguru_student/features/college/presentation/college_detail_screen.dart';
import 'package:naaguru_student/features/student/data/catalog_api_client.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';
import 'package:naaguru_student/features/student/presentation/location_picker_sheet.dart';

/// Screen A: College Discovery Screen
/// Reproduces the Stitch College Listing reference design.
class CollegeListScreen extends StatefulWidget {
  final StudentApiClient? studentApiClient;
  final CollegeApiClient? collegeApiClient;
  final CatalogApiClient? catalogApiClient;
  final String pathway;
  final String? streamCode;
  final String? locationId;
  final String? locationName;
  final bool requiresHostel;
  final int? maxFee;
  final bool showBottomNav;

  const CollegeListScreen({
    super.key,
    this.studentApiClient,
    this.collegeApiClient,
    this.catalogApiClient,
    this.pathway = 'Intermediate',
    this.streamCode,
    this.locationId,
    this.locationName,
    this.requiresHostel = false,
    this.maxFee,
    this.showBottomNav = true,
  });

  @override
  State<CollegeListScreen> createState() => _CollegeListScreenState();
}

class _CollegeListScreenState extends State<CollegeListScreen> {
  bool _isLoading = true;
  String? _errorMessage;

  List<Map<String, dynamic>> _colleges = [];
  List<Map<String, dynamic>> _filteredColleges = [];

  // Active filter states
  String? _selectedStreamCode;
  String? _selectedLocationId;
  String? _selectedLocationName;
  bool _requiresHostel = false;
  int? _maxFee;

  // Search input
  final TextEditingController _searchController = TextEditingController();

  // Saved bookmarks set
  final Set<String> _bookmarkedCollegeIds = {};

  // For bottom navigation
  int _currentIndex = 1; // Discover is index 1

  @override
  void initState() {
    super.initState();
    _selectedStreamCode = widget.streamCode ?? 'MPC';
    _selectedLocationId = widget.locationId;
    _selectedLocationName = widget.locationName ?? 'Visakhapatnam, AP';
    _requiresHostel = widget.requiresHostel;
    _maxFee = widget.maxFee;

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
          final desc = (college['description'] as String? ?? '').toLowerCase();
          final branches = (college['branches'] as List<dynamic>?) ?? [];
          final matchBranch = branches.any((b) {
            final loc = (b['locationName'] as String? ?? '').toLowerCase();
            final bName = (b['name'] as String? ?? '').toLowerCase();
            return loc.contains(query) || bName.contains(query);
          });
          return name.contains(query) || desc.contains(query) || matchBranch;
        }).toList();
      });
    }
  }

  Future<void> _fetchColleges() async {
    if (widget.collegeApiClient == null) {
      setState(() {
        _isLoading = false;
        _colleges = [];
        _filteredColleges = [];
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final results = await widget.collegeApiClient!.searchColleges(
        streamCode: _selectedStreamCode,
        locationId: _selectedLocationId,
        requiresHostel: _requiresHostel ? true : null,
        maxFee: _maxFee,
      );

      if (mounted) {
        setState(() {
          _colleges = results;
          _filteredColleges = List.from(results);
          _isLoading = false;
        });
        _onSearchChanged();
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = ErrorMapper.userMessage(e);
          _isLoading = false;
        });
      }
    }
  }

  void _toggleStream(String stream) {
    setState(() {
      if (_selectedStreamCode == stream) {
        _selectedStreamCode = null;
      } else {
        _selectedStreamCode = stream;
      }
    });
    _fetchColleges();
  }

  void _toggleHostel() {
    setState(() {
      _requiresHostel = !_requiresHostel;
    });
    _fetchColleges();
  }

  Future<void> _pickLocation() async {
    if (widget.catalogApiClient == null) return;

    final picked = await LocationPickerSheet.show(
      context,
      levelLabel: 'District / Location',
      levelLabelTe: 'జిల్లా / ప్రదేశం',
      isTelugu: false,
      loader: () => widget.catalogApiClient!.getLocations(type: 'DISTRICT'),
    );

    if (picked != null && mounted) {
      setState(() {
        _selectedLocationId = picked.id;
        _selectedLocationName = '${picked.nameEn}, AP';
      });
      _fetchColleges();
    }
  }

  void _showFeeFilterSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: NaaguruTheme.surface,
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
                const Text(
                  'Filter by Annual Tuition Fee',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: NaaguruTheme.text,
                  ),
                ),
                const SizedBox(height: 16),
                _buildFeeOption(ctx, label: 'Any Fee', fee: null),
                _buildFeeOption(ctx, label: 'Under ₹50,000 / yr', fee: 50000),
                _buildFeeOption(ctx, label: 'Under ₹1,00,000 / yr', fee: 100000),
                _buildFeeOption(ctx, label: 'Under ₹1,50,000 / yr', fee: 150000),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildFeeOption(BuildContext ctx, {required String label, required int? fee}) {
    final isSelected = _maxFee == fee;
    return ListTile(
      title: Text(
        label,
        style: TextStyle(
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          color: isSelected ? NaaguruTheme.primary : NaaguruTheme.text,
        ),
      ),
      trailing: isSelected ? const Icon(Icons.check, color: NaaguruTheme.primary) : null,
      onTap: () {
        Navigator.pop(ctx);
        setState(() => _maxFee = fee);
        _fetchColleges();
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFEFFCF9),
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            Expanded(
              child: RefreshIndicator(
                color: NaaguruTheme.primary,
                onRefresh: _fetchColleges,
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      _buildGreetingAndSearch(),
                      const SizedBox(height: 16),
                      _buildStreamSelector(),
                      const SizedBox(height: 16),
                      _buildFilterChips(),
                      const SizedBox(height: 20),
                      _buildCollegesHeader(),
                      const SizedBox(height: 12),
                      _buildCollegeListContent(),
                      const SizedBox(height: 20),
                      _buildCounselorPrompt(),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: widget.showBottomNav ? _buildBottomNav() : null,
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white.withAlpha(235),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10),
            blurRadius: 8,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: NaaguruTheme.primary,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.school,
                  color: Colors.white,
                  size: 20,
                ),
              ),
              const SizedBox(width: 8),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Naaguru',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: NaaguruTheme.primary,
                      letterSpacing: -0.2,
                    ),
                  ),
                  InkWell(
                    onTap: _pickLocation,
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          _selectedLocationName ?? 'Visakhapatnam, AP',
                          style: const TextStyle(
                            fontSize: 11,
                            color: Color(0xFF3E4946),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(width: 2),
                        const Icon(
                          Icons.expand_more,
                          size: 14,
                          color: Color(0xFF3E4946),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
          Row(
            children: [
              IconButton(
                icon: Stack(
                  children: [
                    const Icon(
                      Icons.notifications_outlined,
                      size: 22,
                      color: Color(0xFF3E4946),
                    ),
                    Positioned(
                      top: 1,
                      right: 1,
                      child: Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: Color(0xFFFEC24A),
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                  ],
                ),
                onPressed: () {},
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
              const SizedBox(width: 14),
              Container(
                width: 32,
                height: 32,
                decoration: const BoxDecoration(
                  color: NaaguruTheme.primary,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.person,
                  color: Colors.white,
                  size: 18,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildGreetingAndSearch() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'Find the right college for you',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: Color(0xFF121E1C),
            letterSpacing: -0.3,
          ),
        ),
        const SizedBox(height: 4),
        const Text(
          'Explore colleges that match your goals.',
          style: TextStyle(
            fontSize: 14,
            color: Color(0xFF3E4946),
          ),
        ),
        const SizedBox(height: 12),
        Container(
          height: 52,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(12),
                blurRadius: 6,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            children: [
              const SizedBox(width: 14),
              const Icon(
                Icons.search,
                size: 20,
                color: Color(0xFF6E7A75),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: TextField(
                  controller: _searchController,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Color(0xFF121E1C),
                  ),
                  decoration: const InputDecoration(
                    hintText: 'Search colleges or locations',
                    hintStyle: TextStyle(
                      color: Color(0xFF6E7A75),
                      fontSize: 14,
                    ),
                    border: InputBorder.none,
                  ),
                ),
              ),
              if (_searchController.text.isNotEmpty)
                IconButton(
                  icon: const Icon(Icons.close, size: 18, color: Color(0xFF6E7A75)),
                  onPressed: () {
                    _searchController.clear();
                    _onSearchChanged();
                  },
                ),
              Container(
                margin: const EdgeInsets.only(right: 8),
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: const Color(0xFFE9F7F3),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: IconButton(
                  icon: const Icon(
                    Icons.tune,
                    size: 18,
                    color: NaaguruTheme.primary,
                  ),
                  onPressed: _showFeeFilterSheet,
                  padding: EdgeInsets.zero,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStreamSelector() {
    final streams = [
      {'code': 'MPC', 'sub': 'Maths • Phy', 'icon': Icons.calculate_outlined},
      {'code': 'BIPC', 'sub': 'Bio • Chem', 'icon': Icons.biotech_outlined},
      {'code': 'MEC', 'sub': 'Commerce', 'icon': Icons.insights_outlined},
      {'code': 'CEC', 'sub': 'Civics • Eco', 'icon': Icons.balance_outlined},
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: const [
            Text(
              'Choose your stream',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Color(0xFF121E1C),
              ),
            ),
            Text(
              'After 10th',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: NaaguruTheme.primary,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: streams.map((s) {
            final code = s['code'] as String;
            final sub = s['sub'] as String;
            final icon = s['icon'] as IconData;
            final isSelected = _selectedStreamCode?.toUpperCase() == code.toUpperCase();

            return Expanded(
              child: GestureDetector(
                onTap: () => _toggleStream(code),
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFFE9F7F3) : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isSelected ? NaaguruTheme.primary : Colors.transparent,
                      width: 1.5,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(8),
                        blurRadius: 4,
                        offset: const Offset(0, 1),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF95F4DD) : const Color(0xFFE3F1ED),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          icon,
                          size: 18,
                          color: isSelected ? const Color(0xFF00201A) : const Color(0xFF3E4946),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        code,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: isSelected ? NaaguruTheme.primary : const Color(0xFF121E1C),
                        ),
                      ),
                      Text(
                        sub,
                        style: TextStyle(
                          fontSize: 9,
                          color: isSelected ? NaaguruTheme.primary.withAlpha(200) : const Color(0xFF6E7A75),
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildFilterChips() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          // Location Filter
          GestureDetector(
            onTap: _pickLocation,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
              decoration: BoxDecoration(
                color: const Color(0xFFE9F7F3),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: NaaguruTheme.primary.withAlpha(80)),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.location_on, size: 15, color: NaaguruTheme.primary),
                  const SizedBox(width: 4),
                  Text(
                    _selectedLocationName?.split(',').first ?? 'Visakhapatnam',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: NaaguruTheme.primary,
                    ),
                  ),
                  const SizedBox(width: 2),
                  const Icon(Icons.expand_more, size: 14, color: NaaguruTheme.primary),
                ],
              ),
            ),
          ),
          const SizedBox(width: 8),

          // Fees Filter
          GestureDetector(
            onTap: _showFeeFilterSheet,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
              decoration: BoxDecoration(
                color: _maxFee != null ? const Color(0xFFE9F7F3) : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: _maxFee != null ? NaaguruTheme.primary : const Color(0xFFBDC9C4),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(6),
                    blurRadius: 3,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    _maxFee != null ? 'Fees < ₹${(_maxFee! / 1000).toInt()}k' : 'Fees < ₹1L',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: _maxFee != null ? FontWeight.w600 : FontWeight.w500,
                      color: _maxFee != null ? NaaguruTheme.primary : const Color(0xFF3E4946),
                    ),
                  ),
                  const SizedBox(width: 2),
                  const Icon(Icons.expand_more, size: 14, color: Color(0xFF6E7A75)),
                ],
              ),
            ),
          ),
          const SizedBox(width: 8),

          // Hostel Filter
          GestureDetector(
            onTap: _toggleHostel,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
              decoration: BoxDecoration(
                color: _requiresHostel ? const Color(0xFFE9F7F3) : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: _requiresHostel ? NaaguruTheme.primary : const Color(0xFFBDC9C4),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(6),
                    blurRadius: 3,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.bed_outlined,
                    size: 15,
                    color: _requiresHostel ? NaaguruTheme.primary : const Color(0xFF3E4946),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Hostel: Available',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: _requiresHostel ? FontWeight.w600 : FontWeight.w500,
                      color: _requiresHostel ? NaaguruTheme.primary : const Color(0xFF3E4946),
                    ),
                  ),
                  if (_requiresHostel) ...[
                    const SizedBox(width: 4),
                    const Icon(Icons.check, size: 14, color: NaaguruTheme.primary),
                  ],
                ],
              ),
            ),
          ),
          const SizedBox(width: 8),

          // More Filters
          GestureDetector(
            onTap: _showFeeFilterSheet,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFBDC9C4)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withAlpha(6),
                    blurRadius: 3,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: const [
                  Icon(Icons.tune, size: 15, color: Color(0xFF6E7A75)),
                  SizedBox(width: 4),
                  Text(
                    'More Filters',
                    style: TextStyle(
                      fontSize: 12,
                      color: Color(0xFF3E4946),
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

  Widget _buildCollegesHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Colleges for you',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF121E1C),
              ),
            ),
            Text(
              'Offering preferred stream (${_selectedStreamCode ?? 'All'})',
              style: const TextStyle(
                fontSize: 12,
                color: Color(0xFF3E4946),
              ),
            ),
          ],
        ),
        Text(
          '${_filteredColleges.length} found',
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: NaaguruTheme.primary,
          ),
        ),
      ],
    );
  }

  Widget _buildCollegeListContent() {
    if (_isLoading) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 40),
        child: Center(
          child: CircularProgressIndicator(color: NaaguruTheme.primary),
        ),
      );
    }

    if (_errorMessage != null) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            const Icon(Icons.error_outline, size: 40, color: NaaguruTheme.error),
            const SizedBox(height: 12),
            Text(
              _errorMessage!,
              textAlign: TextAlign.center,
              style: const TextStyle(color: NaaguruTheme.text),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _fetchColleges,
              style: ElevatedButton.styleFrom(
                backgroundColor: NaaguruTheme.primary,
                foregroundColor: Colors.white,
              ),
              child: const Text('Try Again'),
            ),
          ],
        ),
      );
    }

    if (_filteredColleges.isEmpty) {
      return Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            const Icon(Icons.search_off, size: 48, color: NaaguruTheme.muted),
            const SizedBox(height: 12),
            const Text(
              'No colleges found nearby',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: NaaguruTheme.text,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Try changing your stream, location, or fee preferences.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: NaaguruTheme.muted),
            ),
            const SizedBox(height: 16),
            OutlinedButton(
              onPressed: _pickLocation,
              child: const Text('Change location'),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: _filteredColleges.length,
      separatorBuilder: (context, index) => const SizedBox(height: 16),
      itemBuilder: (context, index) {
        final college = _filteredColleges[index];
        return _buildCollegeCard(college);
      },
    );
  }

  Widget _buildCollegeCard(Map<String, dynamic> college) {
    final collegeId = college['id'] as String? ?? '';
    final name = college['name'] as String? ?? 'College';
    final branches = (college['branches'] as List<dynamic>?) ?? [];
    final matchedBranchId = college['matchedBranchId'] as String?;

    // Find matched branch or fallback to first
    Map<String, dynamic>? branch;
    if (matchedBranchId != null) {
      branch = branches.cast<Map<String, dynamic>>().firstWhere(
        (b) => b['id'] == matchedBranchId,
        orElse: () => branches.isNotEmpty ? branches.first as Map<String, dynamic> : {},
      );
    } else if (branches.isNotEmpty) {
      branch = branches.first as Map<String, dynamic>;
    }

    final locationName = branch?['locationName'] as String? ?? 'Visakhapatnam, AP';
    final offerings = (branch?['offerings'] as List<dynamic>?) ?? [];
    final hostel = branch?['hostel'] as Map<String, dynamic>?;
    final hasBoys = hostel?['hasBoysHostel'] == true;
    final hasGirls = hostel?['hasGirlsHostel'] == true;

    // Calculate fee display
    String feeDisplay = '₹65,000 / yr';
    if (offerings.isNotEmpty) {
      final firstOff = offerings.first as Map<String, dynamic>;
      final minFee = firstOff['minFee'] ?? firstOff['tuitionFee'];
      if (minFee != null && minFee is num) {
        feeDisplay = '₹${minFee.toInt()} / yr';
      }
    }

    final isBookmarked = _bookmarkedCollegeIds.contains(collegeId);

    // Cover image URL if provided
    final mediaList = (college['media'] as List<dynamic>?) ?? [];
    String? imageUrl;
    if (mediaList.isNotEmpty) {
      final cover = mediaList.cast<Map<String, dynamic>>().firstWhere(
        (m) => m['isCover'] == true,
        orElse: () => mediaList.first as Map<String, dynamic>,
      );
      imageUrl = cover['url'] as String?;
    }

    return GestureDetector(
      onTap: () => _navigateToDetail(collegeId, college),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(10),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Card Image & Overlay
            AspectRatio(
              aspectRatio: 16 / 9,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (imageUrl != null && imageUrl.isNotEmpty)
                    Image.network(
                      imageUrl,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => _buildPlaceholderImage(),
                    )
                  else
                    _buildPlaceholderImage(),

                  // Subtle gradient scrim
                  Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black26,
                          Colors.transparent,
                          Colors.black45,
                        ],
                      ),
                    ),
                  ),

                  // Verified by Naaguru Badge
                  Positioned(
                    top: 10,
                    left: 10,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withAlpha(240),
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withAlpha(15),
                            blurRadius: 4,
                          ),
                        ],
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(Icons.verified, size: 14, color: NaaguruTheme.primary),
                          SizedBox(width: 4),
                          Text(
                            'Verified by Naaguru',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF121E1C),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Bookmark Button
                  Positioned(
                    top: 10,
                    right: 10,
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          if (isBookmarked) {
                            _bookmarkedCollegeIds.remove(collegeId);
                          } else {
                            _bookmarkedCollegeIds.add(collegeId);
                          }
                        });
                      },
                      child: Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: Colors.white.withAlpha(230),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                          size: 18,
                          color: isBookmarked ? NaaguruTheme.primary : const Color(0xFF3E4946),
                        ),
                      ),
                    ),
                  ),

                  // Rating overlay
                  Positioned(
                    bottom: 10,
                    left: 10,
                    child: Row(
                      children: const [
                        Icon(Icons.star, size: 14, color: Color(0xFFFEC24A)),
                        SizedBox(width: 4),
                        Text(
                          '4.6',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        SizedBox(width: 4),
                        Text(
                          '(320+ reviews)',
                          style: TextStyle(
                            fontSize: 11,
                            color: Colors.white70,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Card Body
            Padding(
              padding: const EdgeInsets.all(14.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF121E1C),
                    ),
                  ),
                  const SizedBox(height: 3),
                  Row(
                    children: [
                      const Icon(Icons.pin_drop, size: 14, color: NaaguruTheme.primary),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          locationName,
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF3E4946),
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Streams Row
                  Wrap(
                    spacing: 6,
                    children: [
                      _buildStreamTag('MPC', isPrimary: true),
                      _buildStreamTag('BiPC'),
                      _buildStreamTag('MEC'),
                    ],
                  ),
                  const SizedBox(height: 10),

                  // Quick Info Grid
                  Row(
                    children: [
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE9F7F3).withAlpha(150),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.payments_outlined, size: 18, color: NaaguruTheme.primary),
                              const SizedBox(width: 6),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Tuition Fee',
                                    style: TextStyle(fontSize: 10, color: Color(0xFF6E7A75)),
                                  ),
                                  Text(
                                    feeDisplay,
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF121E1C),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE9F7F3).withAlpha(150),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            children: [
                              const Icon(Icons.apartment, size: 18, color: NaaguruTheme.primary),
                              const SizedBox(width: 6),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Campus Type',
                                    style: TextStyle(fontSize: 10, color: Color(0xFF6E7A75)),
                                  ),
                                  Text(
                                    (hasBoys || hasGirls) ? 'Day & Resi' : 'Day Scholar',
                                    style: const TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF121E1C),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Hostel Note
                  if (hasBoys || hasGirls)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE3F1ED),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.meeting_room, size: 14, color: NaaguruTheme.primary),
                          const SizedBox(width: 6),
                          Text(
                            (hasBoys && hasGirls)
                                ? 'Hostel Available for Boys & Girls'
                                : hasGirls
                                    ? 'Hostel Available for Girls'
                                    : 'Hostel Available for Boys',
                            style: const TextStyle(
                              fontSize: 11,
                              color: Color(0xFF3E4946),
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  const SizedBox(height: 8),

                  // Action Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: const [
                          Icon(Icons.school_outlined, size: 15, color: NaaguruTheme.primary),
                          SizedBox(width: 4),
                          Text(
                            'BIEAP Board',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w500,
                              color: NaaguruTheme.primary,
                            ),
                          ),
                        ],
                      ),
                      ElevatedButton(
                        onPressed: () => _navigateToDetail(collegeId, college),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFE9F7F3),
                          foregroundColor: NaaguruTheme.primary,
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: const [
                            Text(
                              'View details',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                            SizedBox(width: 4),
                            Icon(Icons.arrow_forward, size: 14),
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
      ),
    );
  }

  Widget _buildStreamTag(String stream, {bool isPrimary = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: isPrimary ? const Color(0xFFE9F7F3) : const Color(0xFFE3F1ED),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        stream,
        style: TextStyle(
          fontSize: 11,
          fontWeight: isPrimary ? FontWeight.bold : FontWeight.w500,
          color: isPrimary ? NaaguruTheme.primary : const Color(0xFF3E4946),
        ),
      ),
    );
  }

  Widget _buildPlaceholderImage() {
    return Container(
      color: const Color(0xFFD8E5E2),
      child: const Center(
        child: Icon(Icons.apartment, size: 48, color: Color(0xFF6E7A75)),
      ),
    );
  }

  Widget _buildCounselorPrompt() {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFDDEBE7).withAlpha(160),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            decoration: const BoxDecoration(
              color: NaaguruTheme.primary,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.support_agent, color: Colors.white, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'Need help choosing a stream?',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF121E1C),
                  ),
                ),
                Text(
                  "Take Naaguru's 5-minute career clarity quiz",
                  style: TextStyle(
                    fontSize: 11,
                    color: Color(0xFF3E4946),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomNav() {
    return BottomNavigationBar(
      currentIndex: _currentIndex,
      onTap: (index) {
        if (index == 0) {
          Navigator.pushNamedAndRemoveUntil(context, '/home', (r) => false);
        } else if (index == 3) {
          Navigator.pushNamed(context, '/profile');
        } else {
          setState(() => _currentIndex = index);
        }
      },
      selectedItemColor: NaaguruTheme.primary,
      unselectedItemColor: const Color(0xFF6E7A75),
      showUnselectedLabels: true,
      type: BottomNavigationBarType.fixed,
      backgroundColor: Colors.white,
      items: const [
        BottomNavigationBarItem(
          icon: Icon(Icons.home_outlined),
          activeIcon: Icon(Icons.home),
          label: 'Home',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.explore_outlined),
          activeIcon: Icon(Icons.explore),
          label: 'Discover',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.bookmark_outline),
          activeIcon: Icon(Icons.bookmark),
          label: 'Saved',
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.account_circle_outlined),
          activeIcon: Icon(Icons.account_circle),
          label: 'Profile',
        ),
      ],
    );
  }

  void _navigateToDetail(String collegeId, Map<String, dynamic> college) {
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
  }
}

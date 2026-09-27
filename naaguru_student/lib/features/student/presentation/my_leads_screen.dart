import 'package:flutter/material.dart';
import 'package:naaguru_student/core/errors/app_error.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';
import 'package:naaguru_student/features/college/presentation/college_detail_screen.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';
import 'package:naaguru_student/features/student/data/student_lead_dto.dart';

class _C {
  static const surface = Color(0xFFEFFCF9);
  static const onSurface = Color(0xFF121E1C);
  static const onSurfaceVariant = Color(0xFF3E4946);
  static const primary = Color(0xFF006454);
  static const primaryContainer = Color(0xFF087F6C);
  static const primaryFixed = Color(0xFF95F4DD);
  static const onPrimaryFixed = Color(0xFF00201A);
  static const surfaceContainerLowest = Color(0xFFFFFFFF);
  static const surfaceContainerLow = Color(0xFFE9F7F3);
  static const surfaceContainer = Color(0xFFE3F1ED);
  static const surfaceContainerHigh = Color(0xFFDDEBE7);
  static const surfaceContainerHighest = Color(0xFFD8E5E2);
  static const secondary = Color(0xFF7C5800);
  static const secondaryFixed = Color(0xFFFFDEA7);
  static const onSecondaryFixedVariant = Color(0xFF5E4200);
  static const tertiary = Color(0xFF0E6456);
  static const error = Color(0xFFBA1A1A);
  static const errorContainer = Color(0xFFFFDAD6);
  static const outlineVariant = Color(0xFFBDC9C4);
}

class MyLeadsScreen extends StatefulWidget {
  final StudentApiClient studentApiClient;
  final CollegeApiClient? collegeApiClient;

  const MyLeadsScreen({
    super.key,
    required this.studentApiClient,
    this.collegeApiClient,
  });

  @override
  State<MyLeadsScreen> createState() => _MyLeadsScreenState();
}

class _MyLeadsScreenState extends State<MyLeadsScreen> {
  late Future<List<StudentLeadDto>> _leadsFuture;
  bool _isTelugu = false;
  String _selectedFilter = 'ALL'; // 'ALL', 'NEW', 'CONTACTED', 'APPLICATION_STARTED'
  String _sortOrder = 'RECENT'; // 'RECENT', 'OLDEST'
  bool _isSearchOpen = false;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _fetchLeads();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _fetchLeads() {
    setState(() {
      _leadsFuture = widget.studentApiClient.getStudentLeads();
    });
  }

  String _s(String en, String te) => _isTelugu ? te : en;

  String _mapStatus(String rawStatus) {
    switch (rawStatus) {
      case 'NEW':
        return _s('Request Sent', 'అభ్యర్థన పంపబడింది');
      case 'CONTACTED':
        return _s('College Contacted', 'కళాశాల సంప్రదించింది');
      case 'APPLICATION_STARTED':
        return _s('Application Started', 'దరఖాస్తు మొదలైంది');
      case 'ADMITTED_REPORTED':
        return _s('Admission Reported', 'చేరినట్లు నమోదైంది');
      case 'LOST':
        return _s('Closed', 'ముగిసింది');
      default:
        return rawStatus;
    }
  }

  IconData _statusIcon(String rawStatus) {
    switch (rawStatus) {
      case 'NEW':
        return Icons.send_rounded;
      case 'CONTACTED':
        return Icons.phone_in_talk_rounded;
      case 'APPLICATION_STARTED':
        return Icons.edit_document;
      case 'ADMITTED_REPORTED':
        return Icons.verified_rounded;
      case 'LOST':
        return Icons.cancel_outlined;
      default:
        return Icons.info_outline;
    }
  }

  Color _statusBgColor(String rawStatus) {
    switch (rawStatus) {
      case 'NEW':
        return _C.surfaceContainerHigh;
      case 'CONTACTED':
        return _C.surfaceContainerLow;
      case 'APPLICATION_STARTED':
        return _C.secondaryFixed;
      case 'ADMITTED_REPORTED':
        return const Color(0xFFD4FFF2);
      case 'LOST':
        return const Color(0xFFE2E8F0);
      default:
        return _C.surfaceContainerLow;
    }
  }

  Color _statusTextColor(String rawStatus) {
    switch (rawStatus) {
      case 'NEW':
        return _C.primary;
      case 'CONTACTED':
        return _C.tertiary;
      case 'APPLICATION_STARTED':
        return _C.onSecondaryFixedVariant;
      case 'ADMITTED_REPORTED':
        return _C.primary;
      case 'LOST':
        return const Color(0xFF64748B);
      default:
        return _C.onSurface;
    }
  }

  String _formatDate(String isoString) {
    try {
      final date = DateTime.parse(isoString).toLocal();
      final monthsEn = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      final monthsTe = [
        'జన', 'ఫిబ్ర', 'మార్చి', 'ఏప్రి', 'మే', 'జూన్',
        'జూలై', 'ఆగ', 'సెప్టెం', 'అక్టో', 'నవం', 'డిసెం'
      ];
      final month = _isTelugu ? monthsTe[date.month - 1] : monthsEn[date.month - 1];
      return '${date.day} $month ${date.year}';
    } catch (_) {
      return isoString;
    }
  }

  Future<void> _navigateToCollege(String collegeId) async {
    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CollegeDetailScreen(
          collegeId: collegeId,
          collegeApiClient: widget.collegeApiClient,
          studentApiClient: widget.studentApiClient,
        ),
      ),
    );
    if (mounted) {
      _fetchLeads();
    }
  }

  void _showLeadDetailsBottomSheet(StudentLeadDto lead) {
    final collegeName = lead.collegeName ?? _s('Unknown College', 'తెలియని కళాశాల');
    final branchName = lead.branchName ?? _s('Campus', 'క్యాంపస్');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: _C.surfaceContainerLowest,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: EdgeInsets.only(
            left: 20,
            right: 20,
            top: 20,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
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
                          _s('Enquiry Details', 'అభ్యర్థన వివరాలు'),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: _C.onSurface,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '$collegeName • $branchName',
                          style: const TextStyle(
                            fontSize: 12,
                            color: _C.onSurfaceVariant,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: _C.onSurfaceVariant),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: _C.surfaceContainerLow,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: _C.surfaceContainerHigh),
                ),
                child: Column(
                  children: [
                    _buildDetailRow(
                      _s('Application Status', 'దరఖాస్తు స్థితి'),
                      _mapStatus(lead.status),
                      statusColor: _statusTextColor(lead.status),
                    ),
                    const Divider(height: 16, color: _C.surfaceContainer),
                    _buildDetailRow(
                      _s('Applied Stream', 'ఎంచుకున్న విభాగం'),
                      lead.streamCode ?? 'General',
                    ),
                    const Divider(height: 16, color: _C.surfaceContainer),
                    _buildDetailRow(
                      _s('Submitted Date', 'సమర్పించిన తేదీ'),
                      _formatDate(lead.createdAt),
                    ),
                    const Divider(height: 16, color: _C.surfaceContainer),
                    _buildDetailRow(
                      _s('Reference ID', 'రిఫరెన్స్ ఐడీ'),
                      lead.id.length > 8 ? '${lead.id.substring(0, 8)}...' : lead.id,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(ctx);
                  _navigateToCollege(lead.collegeId);
                },
                icon: const Icon(Icons.school_outlined, size: 18),
                label: Text(
                  _s('View Full College Profile →', 'పూర్తి కళాశాల వివరాలు చూడండి →'),
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _C.primaryContainer,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 13),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value, {Color? statusColor}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(fontSize: 13, color: _C.onSurfaceVariant),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: statusColor ?? _C.onSurface,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _C.surface,
      appBar: _buildAppBar(),
      body: _buildBodyContent(),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: _C.surface.withAlpha(240),
      elevation: 0,
      scrolledUnderElevation: 1,
      surfaceTintColor: Colors.transparent,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: _C.onSurface),
        onPressed: () => Navigator.maybePop(context),
      ),
      titleSpacing: 0,
      title: _isSearchOpen
          ? TextField(
              controller: _searchController,
              autofocus: true,
              decoration: InputDecoration(
                hintText: _s('Search by college or campus...', 'కళాశాల పేరుతో వెతకండి...'),
                border: InputBorder.none,
                hintStyle: const TextStyle(color: _C.onSurfaceVariant, fontSize: 14),
              ),
              style: const TextStyle(color: _C.onSurface, fontSize: 14),
              onChanged: (val) => setState(() => _searchQuery = val.trim()),
            )
          : Row(
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: _C.primaryContainer,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Icon(Icons.school, color: Colors.white, size: 18),
                ),
                const SizedBox(width: 8),
                Text(
                  _s('Naaguru', 'నాగురు'),
                  style: const TextStyle(
                    color: _C.primary,
                    fontWeight: FontWeight.bold,
                    fontSize: 19,
                    letterSpacing: -0.3,
                  ),
                ),
              ],
            ),
      actions: [
        IconButton(
          icon: Icon(
            _isSearchOpen ? Icons.close : Icons.search,
            color: _C.onSurfaceVariant,
            size: 22,
          ),
          onPressed: () {
            setState(() {
              _isSearchOpen = !_isSearchOpen;
              if (!_isSearchOpen) {
                _searchController.clear();
                _searchQuery = '';
              }
            });
          },
        ),
        TextButton(
          style: TextButton.styleFrom(
            padding: const EdgeInsets.symmetric(horizontal: 8),
            minimumSize: const Size(36, 36),
          ),
          onPressed: () => setState(() => _isTelugu = !_isTelugu),
          child: Text(
            _isTelugu ? 'EN' : 'తెలుగు',
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: _C.primary,
            ),
          ),
        ),
        Padding(
          padding: const EdgeInsets.only(right: 14, left: 4),
          child: Container(
            width: 32,
            height: 32,
            decoration: const BoxDecoration(
              color: _C.primary,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.person, color: Colors.white, size: 18),
          ),
        ),
      ],
    );
  }

  Widget _buildBodyContent() {
    return FutureBuilder<List<StudentLeadDto>>(
      future: _leadsFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return _buildSkeletonView();
        }

        if (snapshot.hasError) {
          return _buildErrorView(ErrorMapper.userMessage(snapshot.error, isTelugu: _isTelugu));
        }

        final leads = snapshot.data ?? [];

        if (leads.isEmpty) {
          return _buildEmptyView();
        }

        return _buildPopulatedView(leads);
      },
    );
  }

  Widget _buildPopulatedView(List<StudentLeadDto> allLeads) {
    final totalCount = allLeads.length;
    final sentCount = allLeads.where((l) => l.status == 'NEW').length;
    final contactedCount = allLeads.where((l) => l.status == 'CONTACTED').length;
    final startedCount = allLeads.where((l) => l.status == 'APPLICATION_STARTED' || l.status == 'ADMITTED_REPORTED').length;

    var filtered = allLeads.where((lead) {
      if (_selectedFilter == 'NEW' && lead.status != 'NEW') {
        return false;
      }
      if (_selectedFilter == 'CONTACTED' && lead.status != 'CONTACTED') {
        return false;
      }
      if (_selectedFilter == 'APPLICATION_STARTED' &&
          lead.status != 'APPLICATION_STARTED' &&
          lead.status != 'ADMITTED_REPORTED') {
        return false;
      }

      if (_searchQuery.isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        final cName = (lead.collegeName ?? '').toLowerCase();
        final bName = (lead.branchName ?? '').toLowerCase();
        final stream = (lead.streamCode ?? '').toLowerCase();
        if (!cName.contains(query) && !bName.contains(query) && !stream.contains(query)) {
          return false;
        }
      }
      return true;
    }).toList();

    filtered.sort((a, b) {
      final aDate = DateTime.tryParse(a.createdAt) ?? DateTime.now();
      final bDate = DateTime.tryParse(b.createdAt) ?? DateTime.now();
      return _sortOrder == 'RECENT' ? bDate.compareTo(aDate) : aDate.compareTo(bDate);
    });

    return RefreshIndicator(
      onRefresh: () async => _fetchLeads(),
      color: _C.primary,
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        children: [
          Text(
            _s('Your college enquiries', 'మీ కళాశాల అభ్యర్థనలు'),
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              letterSpacing: -0.2,
              color: _C.onSurface,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            _s(
              "Track the colleges you've contacted and their updates.",
              'మీరు సంప్రదించిన కళాశాలలు మరియు వాటి తాజా వివరాలను ఇక్కడ ట్రాక్ చేయండి.',
            ),
            style: const TextStyle(fontSize: 12, color: _C.onSurfaceVariant),
          ),
          const SizedBox(height: 12),

          _buildKpiMetricsStrip(
            total: totalCount,
            sent: sentCount,
            contacted: contactedCount,
            started: startedCount,
          ),
          const SizedBox(height: 12),

          _buildFilterAndSortRow(
            total: totalCount,
            sent: sentCount,
            contacted: contactedCount,
            started: startedCount,
          ),
          const SizedBox(height: 12),

          if (filtered.isEmpty)
            Container(
              padding: const EdgeInsets.symmetric(vertical: 36),
              alignment: Alignment.center,
              child: Text(
                _s('No matching enquiries found.', 'సరిపోలే అభ్యర్థనలు లేవు.'),
                style: const TextStyle(color: _C.onSurfaceVariant, fontSize: 13),
              ),
            )
          else
            ...filtered.map(_buildEnquiryCard),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildKpiMetricsStrip({
    required int total,
    required int sent,
    required int contacted,
    required int started,
  }) {
    return Container(
      height: 58,
      decoration: BoxDecoration(
        color: _C.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(8),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          _buildKpiItem('$total', _s('Total', 'మొత్తం'), _C.onSurface),
          _buildKpiDivider(),
          _buildKpiItem('$sent', _s('Sent', 'పంపినవి'), _C.primary),
          _buildKpiDivider(),
          _buildKpiItem('$contacted', _s('Contacted', 'సంప్రదించారు'), _C.secondary),
          _buildKpiDivider(),
          _buildKpiItem('$started', _s('Started', 'మొదలయ్యాయి'), _C.tertiary),
        ],
      ),
    );
  }

  Widget _buildKpiItem(String count, String label, Color countColor) {
    return Expanded(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            count,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: countColor,
            ),
          ),
          Text(
            label,
            style: const TextStyle(fontSize: 11, color: _C.onSurfaceVariant),
          ),
        ],
      ),
    );
  }

  Widget _buildKpiDivider() {
    return Container(
      width: 1,
      height: 24,
      color: _C.surfaceContainerHighest,
    );
  }

  Widget _buildFilterAndSortRow({
    required int total,
    required int sent,
    required int contacted,
    required int started,
  }) {
    return Row(
      children: [
        Expanded(
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildFilterChip('ALL', '${_s("All", "అన్నీ")} ($total)'),
                const SizedBox(width: 6),
                _buildFilterChip('NEW', '${_s("Request Sent", "పంపినవి")} ($sent)'),
                const SizedBox(width: 6),
                _buildFilterChip('CONTACTED', '${_s("Contacted", "సంప్రదించారు")} ($contacted)'),
                const SizedBox(width: 6),
                _buildFilterChip('APPLICATION_STARTED', '${_s("Application Started", "మొదలయ్యాయి")} ($started)'),
              ],
            ),
          ),
        ),
        const SizedBox(width: 6),
        PopupMenuButton<String>(
          initialValue: _sortOrder,
          onSelected: (val) => setState(() => _sortOrder = val),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
            decoration: BoxDecoration(
              color: _C.surfaceContainerLowest,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(8),
                  blurRadius: 4,
                  offset: const Offset(0, 1),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  _sortOrder == 'RECENT'
                      ? _s('Recent', 'తాజావి')
                      : _s('Oldest', 'పాతవి'),
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                    color: _C.onSurface,
                  ),
                ),
                const Icon(Icons.expand_more, size: 16, color: _C.onSurfaceVariant),
              ],
            ),
          ),
          itemBuilder: (ctx) => [
            PopupMenuItem(
              value: 'RECENT',
              child: Text(_s('Recent First', 'తాజావి ముందుగా')),
            ),
            PopupMenuItem(
              value: 'OLDEST',
              child: Text(_s('Oldest First', 'పాతవి ముందుగా')),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildFilterChip(String key, String label) {
    final isSelected = _selectedFilter == key;
    return GestureDetector(
      onTap: () => setState(() => _selectedFilter = key),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? _C.primaryContainer : _C.surfaceContainerLowest,
          borderRadius: BorderRadius.circular(20),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: _C.primaryContainer.withAlpha(50),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ]
              : [
                  BoxShadow(
                    color: Colors.black.withAlpha(6),
                    blurRadius: 2,
                    offset: const Offset(0, 1),
                  ),
                ],
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: isSelected ? Colors.white : _C.onSurfaceVariant,
          ),
        ),
      ),
    );
  }

  Widget _buildEnquiryCard(StudentLeadDto lead) {
    final collegeName = lead.collegeName ?? _s('Unknown College', 'తెలియని కళాశాల');
    final branchName = lead.branchName ?? _s('Unknown Branch', 'తెలియని క్యాంపస్');
    final statusBg = _statusBgColor(lead.status);
    final statusText = _statusTextColor(lead.status);
    final statusIconData = _statusIcon(lead.status);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: _C.surfaceContainerLowest,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: _C.surfaceContainerHigh,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.account_balance,
                  color: _C.primary,
                  size: 24,
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      collegeName,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: _C.onSurface,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        const Icon(
                          Icons.location_on,
                          size: 13,
                          color: _C.primary,
                        ),
                        const SizedBox(width: 3),
                        Expanded(
                          child: Text(
                            branchName,
                            style: const TextStyle(
                              fontSize: 12,
                              color: _C.onSurfaceVariant,
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
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: statusBg,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(statusIconData, size: 13, color: statusText),
                    const SizedBox(width: 4),
                    Text(
                      _mapStatus(lead.status),
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: statusText,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),

          Row(
            children: [
              if (lead.streamCode != null && lead.streamCode!.isNotEmpty) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: _C.surfaceContainer,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    lead.streamCode!,
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: _C.onSurfaceVariant,
                    ),
                  ),
                ),
                const SizedBox(width: 6),
                const Text(
                  '•',
                  style: TextStyle(color: _C.outlineVariant, fontSize: 12),
                ),
                const SizedBox(width: 6),
              ],
              Text(
                '${_s("Requested on", "సమర్పించిన తేదీ")} ${_formatDate(lead.createdAt)}',
                style: const TextStyle(fontSize: 12, color: _C.onSurfaceVariant),
              ),
            ],
          ),

          if (lead.status == 'CONTACTED') ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              decoration: BoxDecoration(
                color: _C.surfaceContainerLow,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.check_circle, size: 14, color: _C.tertiary),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      _s(
                        'Counselor contact recorded • Follow-up scheduled',
                        'కౌన్సెలర్ సంప్రదించారు • తదుపరి చర్చ నిర్ణయించబడింది',
                      ),
                      style: const TextStyle(
                        fontSize: 11,
                        color: _C.onSurfaceVariant,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ] else if (lead.status == 'APPLICATION_STARTED') ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              decoration: BoxDecoration(
                color: _C.secondaryFixed.withAlpha(120),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.edit_note, size: 16, color: _C.onSecondaryFixedVariant),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      _s(
                        'Admission application in progress with college cell',
                        'అడ్మిషన్ దరఖాస్తు కళాశాలలో ప్రాసెస్ చేయబడుతోంది',
                      ),
                      style: const TextStyle(
                        fontSize: 11,
                        color: _C.onSecondaryFixedVariant,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 10),
          const Divider(height: 1, color: _C.surfaceContainer),
          const SizedBox(height: 8),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              TextButton(
                onPressed: () => _showLeadDetailsBottomSheet(lead),
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: Text(
                  _s('View Details', 'వివరాలు చూడండి'),
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                    color: _C.onSurfaceVariant,
                  ),
                ),
              ),
              ElevatedButton(
                onPressed: () => _navigateToCollege(lead.collegeId),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _C.primaryFixed,
                  foregroundColor: _C.onPrimaryFixed,
                  elevation: 0,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  minimumSize: const Size(110, 36),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      _s('View College', 'కాలేజ్ చూడండి'),
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 4),
                    const Icon(Icons.arrow_forward, size: 14),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyView() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 140,
              height: 140,
              decoration: const BoxDecoration(
                color: _C.surfaceContainerLow,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.school_outlined,
                size: 64,
                color: _C.primaryContainer,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              _s('No enquiries yet', 'ఇంకా ఎటువంటి అభ్యర్థనలు లేవు'),
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: _C.onSurface,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              _s(
                'Explore colleges and request counselling to keep track of your admission journey here.',
                'కళాశాలలను అన్వేషించండి మరియు మీ ప్రవేశ ప్రక్రియను ఇక్కడ ట్రాక్ చేయడానికి కౌన్సెలింగ్ అభ్యర్థించండి.',
              ),
              style: const TextStyle(
                fontSize: 14,
                color: _C.onSurfaceVariant,
                height: 1.4,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 28),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.pushNamedAndRemoveUntil(
                  context,
                  '/home',
                  (route) => false,
                );
              },
              icon: const Icon(Icons.arrow_forward, size: 16),
              label: Text(
                _s('Explore Colleges', 'కళాశాలలను చూడండి'),
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: _C.primaryContainer,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 1,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSkeletonView() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      children: [
        Container(
          width: 180,
          height: 22,
          margin: const EdgeInsets.only(right: 140),
          decoration: BoxDecoration(
            color: _C.surfaceContainerHigh,
            borderRadius: BorderRadius.circular(6),
          ),
        ),
        const SizedBox(height: 6),
        Container(
          width: 240,
          height: 14,
          margin: const EdgeInsets.only(right: 60),
          decoration: BoxDecoration(
            color: _C.surfaceContainer,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        const SizedBox(height: 14),

        Container(
          height: 58,
          decoration: BoxDecoration(
            color: _C.surfaceContainer,
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        const SizedBox(height: 14),

        Row(
          children: [
            Container(
              width: 70,
              height: 28,
              decoration: BoxDecoration(
                color: _C.surfaceContainerHigh,
                borderRadius: BorderRadius.circular(20),
              ),
            ),
            const SizedBox(width: 8),
            Container(
              width: 90,
              height: 28,
              decoration: BoxDecoration(
                color: _C.surfaceContainer,
                borderRadius: BorderRadius.circular(20),
              ),
            ),
            const SizedBox(width: 8),
            Container(
              width: 80,
              height: 28,
              decoration: BoxDecoration(
                color: _C.surfaceContainer,
                borderRadius: BorderRadius.circular(20),
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),

        for (int i = 0; i < 3; i++) ...[
          Container(
            padding: const EdgeInsets.all(16),
            margin: const EdgeInsets.only(bottom: 12),
            decoration: BoxDecoration(
              color: _C.surfaceContainerLowest,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(6),
                  blurRadius: 4,
                  offset: const Offset(0, 1),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: _C.surfaceContainerHigh,
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            width: 140,
                            height: 16,
                            decoration: BoxDecoration(
                              color: _C.surfaceContainerHigh,
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                          const SizedBox(height: 6),
                          Container(
                            width: 100,
                            height: 12,
                            decoration: BoxDecoration(
                              color: _C.surfaceContainer,
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    Container(
                      width: 80,
                      height: 24,
                      decoration: BoxDecoration(
                        color: _C.surfaceContainer,
                        borderRadius: BorderRadius.circular(20),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Container(
                  width: 120,
                  height: 12,
                  decoration: BoxDecoration(
                    color: _C.surfaceContainer,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(height: 12),
                const Divider(height: 1, color: _C.surfaceContainer),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      width: 70,
                      height: 16,
                      decoration: BoxDecoration(
                        color: _C.surfaceContainer,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                    Container(
                      width: 96,
                      height: 32,
                      decoration: BoxDecoration(
                        color: _C.surfaceContainerHigh,
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildErrorView(String errorDescription) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: const BoxDecoration(
                color: _C.errorContainer,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.wifi_off_rounded,
                size: 36,
                color: _C.error,
              ),
            ),
            const SizedBox(height: 20),
            Text(
              _s('Unable to load enquiries', 'అభ్యర్థనలను లోడ్ చేయలేకపోయాము'),
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: _C.onSurface,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              _s(
                'Please check your network connection and try again.',
                'దయచేసి మీ నెట్‌వర్క్ కనెక్షన్‌ని తనిఖీ చేసి మళ్లీ ప్రయత్నించండి.',
              ),
              style: const TextStyle(
                fontSize: 13,
                color: _C.onSurfaceVariant,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: 180,
              height: 44,
              child: ElevatedButton.icon(
                onPressed: _fetchLeads,
                icon: const Icon(Icons.refresh, size: 18),
                label: Text(
                  _s('Retry', 'మళ్లీ ప్రయత్నించండి'),
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: _C.primaryContainer,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

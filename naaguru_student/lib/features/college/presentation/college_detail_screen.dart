import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/core/theme.dart';
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
  bool _isTelugu = false;

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
      final data = await widget.collegeApiClient!.getCollegeById(
        widget.collegeId,
      );
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
        appBar: _buildAppBar(context, 'College Details'),
        body: const Center(
          child: CircularProgressIndicator(color: NaaguruTheme.primary),
        ),
      );
    }

    if (_college == null) {
      return Scaffold(
        backgroundColor: NaaguruTheme.background,
        appBar: _buildAppBar(context, 'College Details'),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.error_outline,
                size: 48,
                color: NaaguruTheme.error,
              ),
              const SizedBox(height: 12),
              Text(_errorMessage ?? 'College information not found.'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  backgroundColor: NaaguruTheme.primary,
                ),
                child: const Text('Back'),
              ),
            ],
          ),
        ),
      );
    }

    // Extract Data
    final name = _college!['name'] as String? ?? 'Junior College';
    final description = _college!['description'] as String? ?? '';
    final contactPhone = _college!['contactPhone'] as String?;
    final contactEmail = _college!['contactEmail'] as String?;
    final website = _college!['website'] as String?;
    final ownershipType = _college!['ownershipType'] as String? ?? 'PRIVATE';
    final branches = (_college!['branches'] as List<dynamic>?) ?? [];

    // Aggregate Streams and Locations
    final Set<String> streamCodes = {};
    bool hasBoysHostel = false;
    bool hasGirlsHostel = false;
    String? primaryLocationName;
    int? maxHostelFee;

    // Maps streamCode to [minFee, maxFee]
    final Map<String, List<int>> aggregatedStreams = {};

    for (var branch in branches) {
      if (branch['locationName'] != null && primaryLocationName == null) {
        primaryLocationName = branch['locationName'] as String?;
      }

      final hostel = branch['hostel'] as Map<String, dynamic>? ?? {};
      if (hostel['hasBoysHostel'] == true) hasBoysHostel = true;
      if (hostel['hasGirlsHostel'] == true) hasGirlsHostel = true;

      final fee = hostel['annualHostelFee'] as int?;
      if (fee != null) {
        if (maxHostelFee == null || fee > maxHostelFee) {
          maxHostelFee = fee;
        }
      }

      final offerings = (branch['offerings'] as List<dynamic>?) ?? [];
      for (var o in offerings) {
        final code = o['streamCode'] as String? ?? '';
        streamCodes.add(code);

        final tFee = o['tuitionFee'] as int? ?? 0;
        if (tFee > 0) {
          if (!aggregatedStreams.containsKey(code)) {
            aggregatedStreams[code] = [tFee, tFee];
          } else {
            if (tFee < aggregatedStreams[code]![0]) {
              aggregatedStreams[code]![0] = tFee;
            }
            if (tFee > aggregatedStreams[code]![1]) {
              aggregatedStreams[code]![1] = tFee;
            }
          }
        } else {
          if (!aggregatedStreams.containsKey(code)) {
            aggregatedStreams[code] = [0, 0];
          }
        }
      }
    }

    final hasAnyHostel = hasBoysHostel || hasGirlsHostel;
    final isGovt = ownershipType == 'GOVERNMENT';

    return Scaffold(
      backgroundColor: NaaguruTheme.background,
      appBar: _buildAppBar(
        context,
        _isTelugu ? 'కాలేజీ వివరాలు' : 'College Details',
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Context banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: const BoxDecoration(
                color: Color(0xFFF0F9F7), // primary-subtle
                border: Border(bottom: BorderSide(color: Color(0x1A087F6C))),
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
                            ? 'మీరు MPCని పరిశీలిస్తున్నారు'
                            : 'You\'re exploring MPC',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: NaaguruTheme.primary,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withAlpha(178),
                      border: Border.all(
                        color: NaaguruTheme.primary.withAlpha(38),
                      ),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      _isTelugu ? 'ఇంటర్మీడియట్' : 'Class 11 & 12',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: NaaguruTheme.primary.withAlpha(204),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            Expanded(
              child: CustomScrollView(
                slivers: [
                  SliverToBoxAdapter(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Image section placeholder
                        SizedBox(
                          height: 192,
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              Container(
                                color: Colors.grey.shade200,
                                child: const Center(
                                  child: Icon(
                                    Icons.account_balance,
                                    size: 48,
                                    color: Colors.black12,
                                  ),
                                ),
                              ),
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
                              // Overlay badges
                              Positioned(
                                bottom: 10,
                                left: 16,
                                child: Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 10,
                                        vertical: 4,
                                      ),
                                      decoration: BoxDecoration(
                                        color: Colors.white.withAlpha(242),
                                        borderRadius: BorderRadius.circular(6),
                                        boxShadow: [
                                          BoxShadow(
                                            color: Colors.black.withAlpha(25),
                                            blurRadius: 2,
                                          ),
                                        ],
                                      ),
                                      child: Row(
                                        children: [
                                          const Icon(
                                            Icons.check_circle,
                                            size: 14,
                                            color: NaaguruTheme.primary,
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            isGovt
                                                ? (_isTelugu
                                                      ? 'ప్రభుత్వ సంస్థ'
                                                      : 'Verified Govt')
                                                : (_isTelugu
                                                      ? 'Naaguru ద్వారా వెరిఫై చేయబడింది'
                                                      : 'Verified by Naaguru'),
                                            style: const TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.w600,
                                              color: NaaguruTheme.text,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    if (primaryLocationName != null)
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 8,
                                          vertical: 4,
                                        ),
                                        decoration: BoxDecoration(
                                          color: Colors.black.withAlpha(153),
                                          borderRadius: BorderRadius.circular(
                                            6,
                                          ),
                                        ),
                                        child: Text(
                                          primaryLocationName,
                                          style: const TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.w500,
                                            color: Colors.white,
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Identity Section
                        Container(
                          padding: const EdgeInsets.only(
                            left: 16,
                            right: 16,
                            top: 14,
                            bottom: 12,
                          ),
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            border: Border(
                              bottom: BorderSide(color: Color(0xFFE2E8F0)),
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                name,
                                style: const TextStyle(
                                  fontSize: 20,
                                  fontWeight: FontWeight.bold,
                                  color: NaaguruTheme.text,
                                  height: 1.2,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.center,
                                children: [
                                  const Icon(
                                    Icons.location_on_outlined,
                                    size: 14,
                                    color: NaaguruTheme.primary,
                                  ),
                                  const SizedBox(width: 6),
                                  Expanded(
                                    child: Text(
                                      primaryLocationName != null
                                          ? '$primaryLocationName, Andhra Pradesh'
                                          : 'Andhra Pradesh',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: NaaguruTheme.muted,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              const Divider(
                                height: 1,
                                color: Color(0xFFF1F5F9),
                              ), // slate-100
                              const SizedBox(height: 12),
                              Wrap(
                                spacing: 6,
                                runSpacing: 6,
                                children: [
                                  ...streamCodes.map(
                                    (code) => _buildStreamTag(code),
                                  ),
                                  if (hasAnyHostel) _buildHostelTag(),
                                ],
                              ),
                            ],
                          ),
                        ),

                        // Content Sections
                        Padding(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // About
                              if (description.isNotEmpty) ...[
                                _buildSectionTitle(
                                  _isTelugu
                                      ? 'ఈ కాలేజీ గురించి'
                                      : 'About this college',
                                ),
                                const SizedBox(height: 6),
                                Text(
                                  description,
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: NaaguruTheme.text.withAlpha(230),
                                    height: 1.6,
                                  ),
                                ),
                                const SizedBox(height: 20),
                              ],

                              // Streams & Fees
                              const Divider(
                                height: 1,
                                color: Color(0xFFE2E8F0),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  _buildSectionTitle(
                                    _isTelugu
                                        ? 'స్ట్రీమ్లు & ఫీజులు'
                                        : 'Streams & fees',
                                    paddingBottom: 0,
                                  ),
                                  Text(
                                    _isTelugu
                                        ? 'వార్షిక అంచనా'
                                        : 'Annual indicative',
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: NaaguruTheme.muted,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Container(
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: const Color(0xFFE2E8F0),
                                  ),
                                ),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 14,
                                  vertical: 4,
                                ),
                                child: Column(
                                  children: aggregatedStreams.entries.map((
                                    entry,
                                  ) {
                                    final isLast =
                                        entry.key ==
                                        aggregatedStreams.keys.last;
                                    return _buildStreamFeeRow(
                                      code: entry.key,
                                      minFee: entry.value[0],
                                      maxFee: entry.value[1],
                                      isLast: isLast,
                                    );
                                  }).toList(),
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                _isTelugu
                                    ? '* ఫీజులు అంచనా మాత్రమే. విచారణ సమయంలో మెరిట్ లేదా ఇతర రాయితీలు వర్తించవచ్చు.'
                                    : '* Fees are indicative based on standard curriculum. Concessions or merit scholarships may apply upon enquiry.',
                                style: const TextStyle(
                                  fontSize: 11,
                                  color: NaaguruTheme.muted,
                                  fontStyle: FontStyle.italic,
                                ),
                              ),
                              const SizedBox(height: 20),

                              // Hostel
                              if (hasAnyHostel) ...[
                                const Divider(
                                  height: 1,
                                  color: Color(0xFFE2E8F0),
                                ),
                                const SizedBox(height: 8),
                                _buildSectionTitle(
                                  _isTelugu ? 'హాస్టల్' : 'Hostel',
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  decoration: BoxDecoration(
                                    color: Colors.white,
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: const Color(0xFFE2E8F0),
                                    ),
                                  ),
                                  padding: const EdgeInsets.all(12),
                                  child: Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        width: 32,
                                        height: 32,
                                        decoration: BoxDecoration(
                                          color: const Color(
                                            0xFFFEF8EB,
                                          ), // amber-light
                                          borderRadius: BorderRadius.circular(
                                            8,
                                          ),
                                        ),
                                        child: const Icon(
                                          Icons.bed_outlined,
                                          size: 16,
                                          color: Color(0xFFC2410C),
                                        ), // amber-700
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              mainAxisAlignment:
                                                  MainAxisAlignment
                                                      .spaceBetween,
                                              children: [
                                                Text(
                                                  _isTelugu
                                                      ? 'హాస్టల్ వసతి అందుబాటులో ఉంది'
                                                      : 'Hostel facilities available',
                                                  style: const TextStyle(
                                                    fontSize: 14,
                                                    fontWeight: FontWeight.w600,
                                                    color: NaaguruTheme.text,
                                                  ),
                                                ),
                                                if (maxHostelFee != null &&
                                                    maxHostelFee > 0)
                                                  Text.rich(
                                                    TextSpan(
                                                      children: [
                                                        TextSpan(
                                                          text:
                                                              '₹${_formatCurrency(maxHostelFee)} ',
                                                          style:
                                                              const TextStyle(
                                                                fontSize: 12,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .bold,
                                                                color:
                                                                    NaaguruTheme
                                                                        .text,
                                                              ),
                                                        ),
                                                        TextSpan(
                                                          text: _isTelugu
                                                              ? '/ సం.'
                                                              : '/ yr',
                                                          style:
                                                              const TextStyle(
                                                                fontSize: 10,
                                                                fontWeight:
                                                                    FontWeight
                                                                        .normal,
                                                                color:
                                                                    NaaguruTheme
                                                                        .muted,
                                                              ),
                                                        ),
                                                      ],
                                                    ),
                                                  ),
                                              ],
                                            ),
                                            const SizedBox(height: 2),
                                            Text(
                                              _isTelugu
                                                  ? 'బాలురు మరియు బాలికలకు వసతి గృహాలు ఉంటాయి.'
                                                  : 'Accommodation available with dining and supervised study hours.',
                                              style: const TextStyle(
                                                fontSize: 12,
                                                color: NaaguruTheme.muted,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(height: 20),
                              ],

                              // Location
                              const Divider(
                                height: 1,
                                color: Color(0xFFE2E8F0),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceBetween,
                                children: [
                                  _buildSectionTitle(
                                    _isTelugu ? 'లొకేషన్' : 'Location',
                                    paddingBottom: 0,
                                  ),
                                  Row(
                                    children: [
                                      Text(
                                        _isTelugu
                                            ? 'మ్యాప్లో చూడండి'
                                            : 'View on map',
                                        style: const TextStyle(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                          color: NaaguruTheme.primary,
                                        ),
                                      ),
                                      const SizedBox(width: 2),
                                      const Icon(
                                        Icons.arrow_forward,
                                        size: 14,
                                        color: NaaguruTheme.primary,
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              const SizedBox(height: 8),
                              Container(
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: const Color(0xFFE2E8F0),
                                  ),
                                ),
                                clipBehavior: Clip.antiAlias,
                                child: Column(
                                  children: [
                                    Container(
                                      height: 112,
                                      width: double.infinity,
                                      color: const Color(0xFFE2ECE9),
                                      child: Stack(
                                        alignment: Alignment.center,
                                        children: [
                                          const Icon(
                                            Icons.map,
                                            size: 80,
                                            color: Colors.white54,
                                          ),
                                          Column(
                                            mainAxisSize: MainAxisSize.min,
                                            children: [
                                              Container(
                                                width: 32,
                                                height: 32,
                                                decoration: BoxDecoration(
                                                  color: NaaguruTheme.primary,
                                                  shape: BoxShape.circle,
                                                  border: Border.all(
                                                    color: Colors.white,
                                                    width: 2,
                                                  ),
                                                  boxShadow: [
                                                    BoxShadow(
                                                      color: Colors.black
                                                          .withAlpha(51),
                                                      blurRadius: 4,
                                                    ),
                                                  ],
                                                ),
                                                child: const Icon(
                                                  Icons.location_on,
                                                  size: 16,
                                                  color: Colors.white,
                                                ),
                                              ),
                                              const SizedBox(height: 4),
                                              if (primaryLocationName != null)
                                                Container(
                                                  padding:
                                                      const EdgeInsets.symmetric(
                                                        horizontal: 8,
                                                        vertical: 2,
                                                      ),
                                                  decoration: BoxDecoration(
                                                    color: Colors.white
                                                        .withAlpha(242),
                                                    borderRadius:
                                                        BorderRadius.circular(
                                                          4,
                                                        ),
                                                    boxShadow: [
                                                      BoxShadow(
                                                        color: Colors.black
                                                            .withAlpha(25),
                                                        blurRadius: 2,
                                                      ),
                                                    ],
                                                  ),
                                                  child: Text(
                                                    primaryLocationName,
                                                    style: const TextStyle(
                                                      fontSize: 11,
                                                      fontWeight:
                                                          FontWeight.bold,
                                                      color: NaaguruTheme.text,
                                                    ),
                                                  ),
                                                ),
                                            ],
                                          ),
                                        ],
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.all(12),
                                      color: Colors.white,
                                      child: Row(
                                        children: [
                                          Expanded(
                                            child: Column(
                                              crossAxisAlignment:
                                                  CrossAxisAlignment.start,
                                              children: [
                                                Text(
                                                  name,
                                                  style: const TextStyle(
                                                    fontSize: 12,
                                                    fontWeight: FontWeight.w600,
                                                    color: NaaguruTheme.text,
                                                  ),
                                                ),
                                                const SizedBox(height: 2),
                                                Text(
                                                  primaryLocationName != null
                                                      ? '$primaryLocationName, Andhra Pradesh'
                                                      : 'Andhra Pradesh',
                                                  style: const TextStyle(
                                                    fontSize: 11,
                                                    color: NaaguruTheme.muted,
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 20),

                              // Contact
                              const Divider(
                                height: 1,
                                color: Color(0xFFE2E8F0),
                              ),
                              const SizedBox(height: 8),
                              _buildSectionTitle(
                                _isTelugu ? 'సంప్రదించండి' : 'Contact',
                              ),
                              const SizedBox(height: 4),
                              Container(
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: const Color(0xFFE2E8F0),
                                  ),
                                ),
                                child: Column(
                                  children: [
                                    if (contactPhone != null &&
                                        contactPhone.isNotEmpty)
                                      _buildContactRow(
                                        icon: Icons.phone_outlined,
                                        label: _isTelugu
                                            ? 'ఫోన్ సపోర్ట్'
                                            : 'Phone Support',
                                        value: contactPhone,
                                        onTap: () => launchUrl(
                                          Uri.parse('tel:$contactPhone'),
                                        ),
                                        isLast:
                                            (contactEmail == null ||
                                                contactEmail.isEmpty) &&
                                            (website == null ||
                                                website.isEmpty),
                                      ),
                                    if (contactEmail != null &&
                                        contactEmail.isNotEmpty)
                                      _buildContactRow(
                                        icon: Icons.email_outlined,
                                        label: _isTelugu
                                            ? 'ఎంక్వైరీ ఈమెయిల్'
                                            : 'Enquiry Email',
                                        value: contactEmail,
                                        onTap: () => launchUrl(
                                          Uri.parse('mailto:$contactEmail'),
                                        ),
                                        isLast:
                                            (website == null ||
                                            website.isEmpty),
                                      ),
                                    if (website != null && website.isNotEmpty)
                                      _buildContactRow(
                                        icon: Icons.language,
                                        label: _isTelugu
                                            ? 'అధికారిక వెబ్సైట్'
                                            : 'Official Website',
                                        value: website,
                                        onTap: () => launchUrl(
                                          Uri.parse(
                                            website.startsWith('http')
                                                ? website
                                                : 'https://$website',
                                          ),
                                        ),
                                        isLast: true,
                                      ),
                                    if ((contactPhone == null ||
                                            contactPhone.isEmpty) &&
                                        (contactEmail == null ||
                                            contactEmail.isEmpty) &&
                                        (website == null || website.isEmpty))
                                      const Padding(
                                        padding: EdgeInsets.all(12),
                                        child: Text(
                                          'Contact information unavailable.',
                                          style: TextStyle(
                                            color: NaaguruTheme.muted,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 20),

                              // Trust Note
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: const Color(
                                    0xFFF0F9F7,
                                  ), // primary-subtle
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: NaaguruTheme.primary.withAlpha(38),
                                  ),
                                ),
                                child: Text(
                                  _isTelugu
                                      ? 'Naaguru ఎలాంటి కమిషన్ లేదా స్పాన్సర్డ్ ర్యాంకింగ్స్ లేకుండా సమాచారాన్ని అందిస్తుంది. ఫీజులు, వివరాలు తెలుసుకోవడానికి నేరుగా సంప్రదించవచ్చు.'
                                      : 'Naaguru provides verified college facts without commission or sponsored listings. Connect directly to ask questions or verify fee details.',
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: NaaguruTheme.primary,
                                    height: 1.5,
                                  ),
                                ),
                              ),

                              // Space for bottom fixed bar
                              const SizedBox(height: 80),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),

      // Bottom Action Area
      bottomSheet: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white.withAlpha(
            242,
          ), // surface/95 backdrop-blur equivalent
          border: const Border(top: BorderSide(color: Color(0xFFE2E8F0))),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(10),
              blurRadius: 10,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: Row(
            children: [
              // Secondary Action: Call
              InkWell(
                onTap: () {
                  if (contactPhone != null && contactPhone.isNotEmpty) {
                    launchUrl(Uri.parse('tel:$contactPhone'));
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Contact number unavailable'),
                      ),
                    );
                  }
                },
                child: Container(
                  height: 48,
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: const Color(0xFFE2E8F0)),
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withAlpha(10),
                        blurRadius: 2,
                      ),
                    ],
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.phone_outlined,
                        size: 16,
                        color: NaaguruTheme.primary,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        _isTelugu ? 'కాల్ చేయండి' : 'Call College',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: NaaguruTheme.text,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 10),
              // Primary Action: Enquiry
              Expanded(
                child: InkWell(
                  onTap: () => _showRequestCounsellingSheet(context),
                  child: Container(
                    height: 48,
                    decoration: BoxDecoration(
                      color: NaaguruTheme.primary,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(15),
                          blurRadius: 4,
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(
                          Icons.chat_bubble_outline,
                          size: 16,
                          color: Colors.white,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          _isTelugu ? 'ఎంక్వైరీ పంపండి' : 'Send Enquiry',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context, String title) {
    return AppBar(
      title: Text(
        title,
        style: const TextStyle(
          color: NaaguruTheme.text,
          fontWeight: FontWeight.bold,
          fontSize: 16,
        ),
      ),
      backgroundColor: Colors.white,
      elevation: 0,
      centerTitle: false,
      leading: IconButton(
        icon: const Icon(
          Icons.arrow_back_ios,
          color: NaaguruTheme.text,
          size: 18,
        ),
        onPressed: () => Navigator.of(context).pop(),
      ),
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1.0),
        child: Container(color: const Color(0xFFE2E8F0), height: 1.0),
      ),
      actions: [
        Center(
          child: Container(
            margin: const EdgeInsets.only(right: 8),
            padding: const EdgeInsets.all(2),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F5F4), // surface-alt
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE2E8F0)),
            ),
            child: Row(
              children: [
                _buildLangButton('EN', false),
                _buildLangButton('తెలుగు', true),
              ],
            ),
          ),
        ),
        IconButton(
          icon: const Icon(Icons.bookmark_border, color: NaaguruTheme.muted),
          onPressed: () {},
        ),
        const SizedBox(width: 4),
      ],
    );
  }

  Widget _buildLangButton(String text, bool isTeluguValue) {
    final isActive = _isTelugu == isTeluguValue;
    return GestureDetector(
      onTap: () => setState(() => _isTelugu = isTeluguValue),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isActive ? NaaguruTheme.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(16),
          boxShadow: isActive
              ? [
                  BoxShadow(
                    color: Colors.black.withAlpha(25),
                    blurRadius: 2,
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
            color: isActive ? Colors.white : NaaguruTheme.muted,
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title, {double paddingBottom = 4}) {
    return Padding(
      padding: EdgeInsets.only(bottom: paddingBottom),
      child: Text(
        title.toUpperCase(),
        style: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
          color: NaaguruTheme.muted,
        ),
      ),
    );
  }

  Widget _buildStreamTag(String code) {
    final isPrimary =
        code == 'MPC'; // In design, MPC gets primary color, others get alt.
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
      decoration: BoxDecoration(
        color: isPrimary ? NaaguruTheme.primaryLight : const Color(0xFFF1F5F4),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isPrimary
              ? NaaguruTheme.primary.withAlpha(51)
              : const Color(0xFFE2E8F0),
        ),
      ),
      child: Text(
        code,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: isPrimary ? NaaguruTheme.primary : NaaguruTheme.muted,
        ),
      ),
    );
  }

  Widget _buildHostelTag() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF8EB), // amber-light
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFFF4B942).withAlpha(77),
        ), // amber-warm 30%
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.bed_outlined,
            size: 12,
            color: Color(0xFFD97706),
          ), // amber-600
          const SizedBox(width: 4),
          Text(
            _isTelugu ? 'హాస్టల్ అందుబాటులో ఉంది' : 'Hostel Available',
            style: const TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: Color(0xFF92400E), // amber-800
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStreamFeeRow({
    required String code,
    required int minFee,
    required int maxFee,
    required bool isLast,
  }) {
    final firstChar = code.isNotEmpty ? code[0] : '?';
    Color iconBg;
    Color iconText;

    // Assign specific colors to streams similar to design (M=green, B=emerald, E=amber, C=purple)
    if (code.startsWith('M')) {
      iconBg = NaaguruTheme.primaryLight;
      iconText = NaaguruTheme.primary;
    } else if (code.startsWith('B')) {
      iconBg = Colors.teal.shade50;
      iconText = Colors.teal.shade700;
    } else if (code.startsWith('E')) {
      iconBg = Colors.amber.shade50;
      iconText = Colors.amber.shade700;
    } else {
      iconBg = Colors.purple.shade50;
      iconText = Colors.purple.shade700;
    }

    String feeStr = 'Contact';
    if (minFee > 0 && maxFee > 0) {
      if (minFee == maxFee) {
        feeStr = '₹${_formatCurrency(minFee)}';
      } else {
        feeStr = '₹${_formatCurrency(minFee)}–₹${_formatCurrency(maxFee)}';
      }
    }

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 10),
      decoration: BoxDecoration(
        border: isLast
            ? null
            : const Border(
                bottom: BorderSide(color: Color(0xFFF1F5F9)),
              ), // slate-100
      ),
      child: Row(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: iconBg,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Center(
              child: Text(
                firstChar,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: iconText,
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
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
                        fontWeight: FontWeight.w600,
                        color: NaaguruTheme.text,
                      ),
                    ),
                    if (code == 'MPC') ...[
                      const SizedBox(width: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 4,
                          vertical: 1,
                        ),
                        decoration: BoxDecoration(
                          color: NaaguruTheme.primary.withAlpha(25),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          _isTelugu ? 'మీ స్ట్రీమ్' : 'Your Stream',
                          style: const TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.w600,
                            color: NaaguruTheme.primary,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
                Text(
                  _getStreamFullName(code),
                  style: const TextStyle(
                    fontSize: 11,
                    color: NaaguruTheme.muted,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                feeStr,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: NaaguruTheme.text,
                ),
              ),
              Text(
                _isTelugu ? '/ సంవత్సరం' : '/ year',
                style: const TextStyle(fontSize: 9, color: NaaguruTheme.muted),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildContactRow({
    required IconData icon,
    required String label,
    required String value,
    required VoidCallback onTap,
    required bool isLast,
  }) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          border: isLast
              ? null
              : const Border(bottom: BorderSide(color: Color(0xFFF1F5F9))),
        ),
        child: Row(
          children: [
            Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                color: NaaguruTheme.primaryLight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, size: 14, color: NaaguruTheme.primary),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: const TextStyle(
                      fontSize: 11,
                      color: NaaguruTheme.muted,
                    ),
                  ),
                  const SizedBox(height: 1),
                  Text(
                    value,
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: NaaguruTheme.text,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.arrow_forward_ios,
              size: 12,
              color: NaaguruTheme.muted,
            ),
          ],
        ),
      ),
    );
  }

  String _getStreamFullName(String code) {
    if (_isTelugu) {
      switch (code.toUpperCase()) {
        case 'MPC':
          return 'మ్యాథ్స్, ఫిజిక్స్, కెమిస్ట్రీ';
        case 'BIPC':
          return 'బయాలజీ, ఫిజిక్స్, కెమిస్ట్రీ';
        case 'MEC':
          return 'మ్యాథ్స్, ఎకనామిక్స్, కామర్స్';
        case 'CEC':
          return 'సివిక్స్, ఎకనామిక్స్, కామర్స్';
        default:
          return 'అకడమిక్ స్ట్రీమ్';
      }
    } else {
      switch (code.toUpperCase()) {
        case 'MPC':
          return 'Maths, Physics, Chemistry';
        case 'BIPC':
          return 'Biology, Physics, Chemistry';
        case 'MEC':
          return 'Maths, Economics, Commerce';
        case 'CEC':
          return 'Civics, Economics, Commerce';
        default:
          return 'Academic Stream';
      }
    }
  }

  String _formatCurrency(int amount) {
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

// -----------------------------------------------------------------------------
// Request Counselling Sheet (Unchanged logic, just styled closely to the design)
// -----------------------------------------------------------------------------
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
  State<_RequestCounsellingSheet> createState() =>
      _RequestCounsellingSheetState();
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
    final branch = _branches.firstWhere(
      (b) => b['id'] == _selectedBranchId,
      orElse: () => <String, dynamic>{},
    );
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
          left: 20,
          right: 20,
          top: 24,
          bottom: MediaQuery.of(context).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Enquire with College',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: NaaguruTheme.text,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Regarding $collegeName Admissions',
                      style: const TextStyle(
                        fontSize: 12,
                        color: NaaguruTheme.muted,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: NaaguruTheme.muted),
                  onPressed: () => Navigator.pop(context),
                  style: IconButton.styleFrom(
                    backgroundColor: const Color(0xFFF1F5F4),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            if (_branches.isEmpty)
              const Text(
                'No branches available for counselling at this time.',
                style: TextStyle(color: NaaguruTheme.error),
              )
            else ...[
              const Text(
                'Select Branch',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: NaaguruTheme.text,
                ),
              ),
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
                            _selectedStreamCode =
                                offerings.first['streamCode'] as String?;
                          }
                        });
                      }
                    },
                    selectedColor: NaaguruTheme.primaryLight,
                    backgroundColor: NaaguruTheme.background,
                    labelStyle: TextStyle(
                      color: isSelected
                          ? NaaguruTheme.primaryDark
                          : NaaguruTheme.text,
                      fontWeight: isSelected
                          ? FontWeight.bold
                          : FontWeight.w500,
                      fontSize: 12,
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),
              const Text(
                'Select Stream',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: NaaguruTheme.text,
                ),
              ),
              const SizedBox(height: 8),
              if (_selectedBranchId == null)
                const Text(
                  'Select a branch to view streams',
                  style: TextStyle(fontSize: 12, color: NaaguruTheme.muted),
                )
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
                        if (selected)
                          setState(() => _selectedStreamCode = code);
                      },
                      selectedColor: NaaguruTheme.primaryLight,
                      backgroundColor: NaaguruTheme.background,
                      labelStyle: TextStyle(
                        color: isSelected
                            ? NaaguruTheme.primaryDark
                            : NaaguruTheme.text,
                        fontWeight: isSelected
                            ? FontWeight.bold
                            : FontWeight.w500,
                        fontSize: 12,
                      ),
                    );
                  }).toList(),
                ),
              const SizedBox(height: 24),
              const Text(
                'Naaguru will connect your request with the college admission office without spam.',
                style: TextStyle(
                  fontSize: 12,
                  color: NaaguruTheme.muted,
                  height: 1.4,
                ),
              ),
              const SizedBox(height: 20),

              if (_errorMessage != null) ...[
                Text(
                  _errorMessage!,
                  style: const TextStyle(
                    color: NaaguruTheme.error,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 12),
              ],

              ElevatedButton(
                onPressed:
                    (_branches.isEmpty ||
                        _selectedBranchId == null ||
                        _selectedStreamCode == null ||
                        _isLoading)
                    ? null
                    : _submitLead,
                style: ElevatedButton.styleFrom(
                  backgroundColor: NaaguruTheme.primary,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 44),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: Text(
                  _isLoading ? 'Submitting...' : 'Confirm & Send Enquiry',
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildSuccessState() {
    final collegeName = widget.college['name'] as String? ?? 'College';
    final branchName =
        _branches.firstWhere(
          (b) => b['id'] == _selectedBranchId,
          orElse: () => <String, dynamic>{},
        )['name'] ??
        'Branch';
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 56),
            const SizedBox(height: 16),
            const Text(
              'Enquiry Sent',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: NaaguruTheme.text,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              collegeName,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
            ),
            Text(
              '$branchName • $_selectedStreamCode',
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 13, color: NaaguruTheme.muted),
            ),
            const SizedBox(height: 16),
            const Text(
              'Your enquiry has been successfully sent to the college.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: NaaguruTheme.text),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/my-leads');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: NaaguruTheme.primary,
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 44),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              child: const Text('View My Enquiries'),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text(
                'Back to College',
                style: TextStyle(color: NaaguruTheme.muted),
              ),
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
            const Icon(Icons.error_outline, color: Colors.orange, size: 56),
            const SizedBox(height: 16),
            const Text(
              'Enquiry Already Exists',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: NaaguruTheme.text,
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'You already have an active enquiry for this branch.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, color: NaaguruTheme.text),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pushNamed(context, '/my-leads');
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: NaaguruTheme.primary,
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 44),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              child: const Text('View Enquiry Status'),
            ),
            const SizedBox(height: 8),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text(
                'Back to College',
                style: TextStyle(color: NaaguruTheme.muted),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

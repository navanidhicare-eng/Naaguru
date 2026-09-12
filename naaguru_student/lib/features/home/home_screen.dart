import 'package:flutter/material.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/core/ui/buttons.dart';
import 'package:naaguru_student/core/ui/language_toggle.dart';
import 'package:naaguru_student/features/assessment/data/assessment_api_client.dart';
import 'package:naaguru_student/features/assessment/presentation/results_screen.dart';
import 'package:naaguru_student/features/auth/auth_service.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';
import 'package:naaguru_student/features/college/presentation/college_preferences_screen.dart';
import 'package:naaguru_student/features/explore/presentation/explore_paths_screen.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';

class HomeScreen extends StatefulWidget {
  final AuthService? authService;
  final StudentApiClient? studentApiClient;
  final AssessmentApiClient? assessmentApiClient;
  final CollegeApiClient? collegeApiClient;

  const HomeScreen({
    super.key,
    this.authService,
    this.studentApiClient,
    this.assessmentApiClient,
    this.collegeApiClient,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  bool _isTelugu = false;

  String? _studentName;
  bool _isLoadingState = true;

  // Assessment State
  bool _hasCompletedAssessment = false;
  String? _recommendedStream;
  bool _hasInProgressAssessment = false;
  Map<String, dynamic>? _completedResult;
  Map<String, dynamic>? _completedRecommendation;

  @override
  void initState() {
    super.initState();
    _loadInitialData();
  }

  Future<void> _loadInitialData() async {
    setState(() => _isLoadingState = true);

    // 1. Fetch Student Profile for greeting
    if (widget.studentApiClient != null) {
      try {
        final profile = await widget.studentApiClient!.getProfile();
        if (profile != null && mounted) {
          final fullName = profile['fullName'] as String?;
          if (fullName != null && fullName.isNotEmpty) {
            _studentName = fullName.split(' ').first;
          }
        }
      } catch (_) {}
    }

    // 2. Fetch Assessment State from Backend
    if (widget.assessmentApiClient != null) {
      try {
        // Check if completed
        final result = await widget.assessmentApiClient!.getResult();
        if (result.isNotEmpty) {
          _hasCompletedAssessment = true;
          _completedResult = result;

          try {
            final rec = await widget.assessmentApiClient!.getRecommendation();
            _completedRecommendation = rec;
            final rankedResults = (rec['rankedResults'] as List<dynamic>?) ?? [];
            if (rankedResults.isNotEmpty) {
              final top = rankedResults.first as Map<String, dynamic>;
              _recommendedStream = top['streamCode'] as String?;
            }
          } catch (_) {
            _recommendedStream = 'MPC';
          }
        }
      } catch (_) {
        // Not completed, check if in progress
        try {
          final attempt = await widget.assessmentApiClient!.startOrResumeAttempt();
          final answers = (attempt['answers'] as List<dynamic>?) ?? [];
          if (answers.isNotEmpty && attempt['state'] == 'IN_PROGRESS') {
            _hasInProgressAssessment = true;
          }
        } catch (_) {}
      }
    }

    if (mounted) {
      setState(() => _isLoadingState = false);
    }
  }

  String _getStreamDescription(String code) {
    switch (code.toUpperCase()) {
      case 'MPC':
        return 'Mathematics • Physics • Chemistry';
      case 'BIPC':
        return 'Biology • Physics • Chemistry';
      case 'MEC':
        return 'Mathematics • Economics • Commerce';
      case 'CEC':
        return 'Commerce • Economics • Civics';
      default:
        return 'Core Academic Stream';
    }
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
              child: IndexedStack(
                index: _currentIndex,
                children: [
                  _buildHomeView(context),
                  const ExplorePathsScreen(),
                  const Center(
                    child: Text(
                      'Journey - Coming Soon',
                      style: TextStyle(color: NaaguruTheme.muted),
                    ),
                  ),
                  _buildYouView(),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        selectedItemColor: NaaguruTheme.primaryDark,
        unselectedItemColor: NaaguruTheme.muted,
        showUnselectedLabels: true,
        type: BottomNavigationBarType.fixed,
        items: [
          BottomNavigationBarItem(
            icon: const Icon(Icons.home_outlined),
            activeIcon: const Icon(Icons.home),
            label: _isTelugu ? 'హోమ్' : 'Home',
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.explore_outlined),
            activeIcon: const Icon(Icons.explore),
            label: _isTelugu ? 'అన్వేషించండి' : 'Explore',
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.timeline),
            label: _isTelugu ? 'జర్నీ' : 'Journey',
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.person_outline),
            activeIcon: const Icon(Icons.person),
            label: _isTelugu ? 'మీరు' : 'You',
          ),
        ],
      ),
    );
  }

  Widget _buildAppBar() {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: NaaguruTheme.spacing20,
        vertical: NaaguruTheme.spacing12,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border(
          bottom: BorderSide(color: NaaguruTheme.muted.withAlpha(25)),
        ),
      ),
      child: Row(
        children: [
          Row(
            children: [
              const Icon(Icons.school, color: NaaguruTheme.primaryDark),
              const SizedBox(width: 8),
              const Text(
                'Naaguru',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: NaaguruTheme.primaryDark,
                ),
              ),
            ],
          ),
          const Spacer(),
          LanguageToggle(
            isTelugu: _isTelugu,
            onToggle: (val) => setState(() => _isTelugu = val),
          ),
          const SizedBox(width: 12),
          GestureDetector(
            onTap: () => _handleAvatarTap(context),
            child: Container(
              width: 34,
              height: 34,
              decoration: const BoxDecoration(
                color: NaaguruTheme.primaryDark,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.person, color: Colors.white, size: 20),
            ),
          ),
        ],
      ),
    );
  }

  void _handleAvatarTap(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                _isTelugu ? 'నా ఖాతా' : 'My Account',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: NaaguruTheme.primaryDark,
                ),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: const Icon(Icons.person_outline, color: NaaguruTheme.primary),
                title: Text(_isTelugu ? 'నా ప్రొఫైల్' : 'My Profile'),
                onTap: () {
                  Navigator.pop(ctx);
                  Navigator.pushNamed(context, '/profile');
                },
              ),
              ListTile(
                leading: const Icon(Icons.logout, color: NaaguruTheme.error),
                title: Text(
                  _isTelugu ? 'లాగ్ అవుట్' : 'Log Out',
                  style: const TextStyle(color: NaaguruTheme.error),
                ),
                onTap: () async {
                  Navigator.pop(ctx);
                  await widget.authService?.logout();
                  if (context.mounted) {
                    Navigator.pushReplacementNamed(context, '/login');
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildYouView() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: const BoxDecoration(
                color: NaaguruTheme.primaryLight,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.person, size: 44, color: NaaguruTheme.primaryDark),
            ),
            const SizedBox(height: 16),
            Text(
              _studentName != null ? 'Hello, $_studentName' : 'Student Account',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: NaaguruTheme.text),
            ),
            const SizedBox(height: 24),
            OutlinedButton.icon(
              icon: const Icon(Icons.edit_outlined),
              label: Text(_isTelugu ? 'ప్రొఫైల్ వివరాలు సవరించండి' : 'Edit Profile'),
              onPressed: () => Navigator.pushNamed(context, '/profile'),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              icon: const Icon(Icons.logout, color: NaaguruTheme.error),
              label: Text(_isTelugu ? 'లాగ్ అవుట్' : 'Log Out', style: const TextStyle(color: NaaguruTheme.error)),
              onPressed: () async {
                await widget.authService?.logout();
                if (mounted) Navigator.pushReplacementNamed(context, '/login');
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGreeting() {
    final String greetingText = _studentName != null
        ? (_isTelugu ? 'నమస్తే, $_studentName! 👋' : 'Hi, $_studentName! 👋')
        : (_isTelugu ? 'నమస్తే! 👋' : 'Hi there! 👋');

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          greetingText,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: NaaguruTheme.primaryDark,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          _isTelugu
              ? "10వ తరగతి తర్వాత మీ ప్రయాణాన్ని ప్రారంభించండి."
              : "What would you like to explore today?",
          style: const TextStyle(fontSize: 14, color: NaaguruTheme.muted),
        ),
      ],
    );
  }

  /// PILLAR 1: Discover Your Path (Take / Continue Assessment OR View Results)
  Widget _buildAssessmentPillar(BuildContext context) {
    if (_hasCompletedAssessment) {
      final stream = _recommendedStream ?? 'MPC';
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: NaaguruTheme.primary.withAlpha(51), width: 1.5),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(8),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: NaaguruTheme.primaryLight,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    _isTelugu ? "• మీ అంచనా ఫలితం" : "• YOUR ASSESSMENT RESULT",
                    style: const TextStyle(
                      color: NaaguruTheme.primaryDark,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.green.withAlpha(25),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.check, size: 14, color: Colors.green),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              _isTelugu ? "మీ బలమైన విద్యా-విభాగ మ్యాచ్" : "Your Strongest Academic Stream",
              style: const TextStyle(
                fontSize: 13,
                color: NaaguruTheme.muted,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(height: 6),
            Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: [
                Text(
                  stream,
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: NaaguruTheme.primaryDark,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    _getStreamDescription(stream),
                    style: const TextStyle(fontSize: 12, color: NaaguruTheme.muted),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            PrimaryButton(
              text: _isTelugu ? 'నా ఫలితాలను చూడండి →' : 'View My Results →',
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => ResultsScreen(
                      assessmentApiClient: widget.assessmentApiClient,
                      initialResult: _completedResult,
                      initialRecommendation: _completedRecommendation,
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      );
    }

    if (_hasInProgressAssessment) {
      return Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.orange.withAlpha(77), width: 1.5),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(8),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.orange.withAlpha(25),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    _isTelugu ? "• కొనసాగుతోంది" : "• IN PROGRESS",
                    style: TextStyle(
                      color: Colors.orange.shade800,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const Icon(Icons.edit_note, size: 20, color: Colors.orange),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              _isTelugu ? "మీ అసెస్‌మెంట్‌ను కొనసాగించండి" : "Continue Your Assessment",
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: NaaguruTheme.primaryDark,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              _isTelugu
                  ? "మీరు ఆపిన చోట నుండే ప్రారంభించండి. 40 చిన్న ప్రశ్నలు, ఎటువంటి మార్కులు లేదా ఒత్తిడి లేదు."
                  : "Pick up right where you left off. 40 quick interest questions with zero pressure.",
              style: const TextStyle(fontSize: 13, color: NaaguruTheme.muted, height: 1.4),
            ),
            const SizedBox(height: 16),
            PrimaryButton(
              text: _isTelugu ? 'కొనసాగించండి →' : 'Continue Assessment →',
              onPressed: () {
                Navigator.pushNamed(context, '/assessment-question');
              },
            ),
          ],
        ),
      );
    }

    // Default: No Attempt
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: NaaguruTheme.muted.withAlpha(51)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(6),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: NaaguruTheme.primaryLight,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              _isTelugu ? "• ఆసక్తుల అన్వేషణ" : "• DISCOVER YOUR PATH",
              style: const TextStyle(
                color: NaaguruTheme.primaryDark,
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            _isTelugu ? "10వ తరగతి తర్వాత మీ మార్గం తెలుసుకోండి" : "Discover What Comes After 10th",
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: NaaguruTheme.primaryDark,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            _isTelugu
                ? "మీ నిజమైన ఆసక్తులను అర్థం చేసుకుని, మీకు సరిపోయే ఇంటర్మీడియట్ స్ట్రీమ్‌ను కనుగొనండి."
                : "Understand your interests and discover which academic stream fits you best.",
            style: const TextStyle(fontSize: 13, color: NaaguruTheme.muted, height: 1.4),
          ),
          const SizedBox(height: 16),
          PrimaryButton(
            text: _isTelugu ? 'అసెస్‌మెంట్ ప్రారంభించండి →' : 'Take Assessment →',
            onPressed: () {
              Navigator.pushNamed(context, '/assessment-intro');
            },
          ),
        ],
      ),
    );
  }

  /// PILLAR 2: Find a College (Browse Colleges directly)
  Widget _buildCollegePillar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: NaaguruTheme.muted.withAlpha(51)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(6),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFE8F4FD),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              _isTelugu ? "• ప్రత్యక్ష కళాశాలల శోధన" : "• FIND A COLLEGE",
              style: TextStyle(
                color: Colors.blue.shade800,
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            _isTelugu ? "కళాశాలలను శోధించండి" : "Browse Verified Colleges",
            style: const TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w700,
              color: NaaguruTheme.primaryDark,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            _isTelugu
                ? "మీకు ఏ స్ట్రీమ్ లేదా లొకేషన్ కావాలో ఇప్పటికే తెలుసా? మీ ప్రాధాన్యతలకు సరిపోయే కళాశాలలను చూడండి."
                : "Already know what you want? Find junior colleges that match your stream, location, and hostel preferences.",
            style: const TextStyle(fontSize: 13, color: NaaguruTheme.muted, height: 1.4),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              if (widget.collegeApiClient != null) {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => CollegePreferencesScreen(
                      collegeApiClient: widget.collegeApiClient!,
                    ),
                  ),
                );
              } else {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('College search is initializing...')),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF1E3A5F),
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              minimumSize: const Size(double.infinity, 48),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  _isTelugu ? 'కళాశాలలను చూడండి →' : 'Browse Colleges →',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  /// Supporting Section: Teaser for Explore Paths
  Widget _buildExploreTeaser(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: NaaguruTheme.primaryLight.withAlpha(77),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.explore, color: NaaguruTheme.primaryDark, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _isTelugu ? 'అన్ని మార్గాలను అన్వేషించండి' : 'Explore All Major Paths',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: NaaguruTheme.primaryDark),
                ),
                const SizedBox(height: 2),
                Text(
                  _isTelugu
                      ? 'ఇంటర్మీడియట్, పాలిటెక్నిక్, ఐటిఐ మరియు డిఫెన్స్ అవకాశాలను చూడండి.'
                      : 'Discover Intermediate, Polytechnic, ITI, and Defence pathways after 10th.',
                  style: const TextStyle(fontSize: 12, color: NaaguruTheme.muted),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.arrow_forward_ios, size: 16, color: NaaguruTheme.primaryDark),
            onPressed: () => setState(() => _currentIndex = 1), // Switch to Explore tab
          ),
        ],
      ),
    );
  }

  Widget _buildHomeView(BuildContext context) {
    if (_isLoadingState) {
      return const Center(child: CircularProgressIndicator(color: NaaguruTheme.primary));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(
        horizontal: NaaguruTheme.spacing20,
        vertical: NaaguruTheme.spacing20,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildGreeting(),
          const SizedBox(height: 20),

          // Pillar 1: Assessment Action
          _buildAssessmentPillar(context),
          const SizedBox(height: 16),

          // Pillar 2: College Action
          _buildCollegePillar(context),
          const SizedBox(height: 24),

          // Explore Paths Teaser
          _buildExploreTeaser(context),
          const SizedBox(height: 24),

          // Peace of Mind Guidance Banner
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.verified_user_outlined, size: 16, color: NaaguruTheme.primary),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  _isTelugu
                      ? "నాగురు మీ నిర్ణయాలలో విశ్వసనీయ మార్గదర్శి."
                      : "Naaguru is your trusted guide for life after 10th grade.",
                  style: const TextStyle(fontSize: 12, color: NaaguruTheme.muted),
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}

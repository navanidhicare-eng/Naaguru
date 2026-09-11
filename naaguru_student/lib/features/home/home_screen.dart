import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/core/ui/buttons.dart';
import 'package:naaguru_student/features/auth/auth_service.dart';
import 'package:naaguru_student/features/student/data/student_api_client.dart';

class HomeScreen extends StatefulWidget {
  final AuthService? authService;
  final StudentApiClient? studentApiClient;

  const HomeScreen({super.key, this.authService, this.studentApiClient});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NaaguruTheme.background,
      body: SafeArea(
        child: Column(
          children: [
            _buildAppBar(),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(
                  horizontal: NaaguruTheme.spacing20,
                  vertical: NaaguruTheme.spacing24,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _buildGreeting(),
                    const SizedBox(height: NaaguruTheme.spacing24),
                    _buildMainCard(context),
                    const SizedBox(height: NaaguruTheme.spacing32),
                    _buildJourneySection(),
                    const SizedBox(height: NaaguruTheme.spacing32),
                    _buildSecondaryCard(),
                    const SizedBox(height: NaaguruTheme.spacing16),
                    _buildTertiaryCard(),
                    const SizedBox(height: NaaguruTheme.spacing24),
                  ],
                ),
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
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), activeIcon: Icon(Icons.home), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.explore_outlined), activeIcon: Icon(Icons.explore), label: 'Explore'),
          BottomNavigationBarItem(icon: Icon(Icons.timeline), label: 'Journey'),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), activeIcon: Icon(Icons.person), label: 'You'),
        ],
      ),
    );
  }

  Widget _buildAppBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: NaaguruTheme.spacing20,
        vertical: NaaguruTheme.spacing12,
      ),
      child: Row(
        children: [
          // Logo placeholder or SVG
          Row(
            children: [
              const Icon(Icons.school, color: NaaguruTheme.primaryDark),
              const SizedBox(width: 8),
              Text(
                'Naaguru',
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: NaaguruTheme.primaryDark,
                ),
              ),
            ],
          ),
          const Spacer(),
          // Language indicator
          const Icon(Icons.translate, color: NaaguruTheme.text, size: 20),
          const SizedBox(width: NaaguruTheme.spacing16),
          // Notification Bell
          const Icon(Icons.notifications_none, color: NaaguruTheme.text, size: 24),
          const SizedBox(width: NaaguruTheme.spacing16),
          // User Avatar
          GestureDetector(
            onTap: () => _handleAvatarTap(context),
            child: Container(
              width: 32,
              height: 32,
              decoration: const BoxDecoration(
                color: NaaguruTheme.primaryDark,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.person, color: NaaguruTheme.surface, size: 20),
            ),
          ),
        ],
      ),
    );
  }

  void _handleAvatarTap(BuildContext context) {
    final isAuth = widget.authService?.isAuthenticated ?? false;
    if (!isAuth) {
      Navigator.pushNamed(context, '/login');
      return;
    }

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
              const Text(
                'My Account',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: NaaguruTheme.primaryDark,
                ),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: const Icon(Icons.person_outline, color: NaaguruTheme.primary),
                title: const Text('My Profile'),
                onTap: () {
                  Navigator.pop(ctx);
                  Navigator.pushNamed(context, '/profile');
                },
              ),
              ListTile(
                leading: const Icon(Icons.logout, color: NaaguruTheme.error),
                title: const Text('Log Out', style: TextStyle(color: NaaguruTheme.error)),
                onTap: () async {
                  Navigator.pop(ctx);
                  await widget.authService?.logout();
                  if (context.mounted) {
                    setState(() {});
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Logged out successfully.')),
                    );
                  }
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildGreeting() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Hi there! 👋',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
                color: NaaguruTheme.primaryDark,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: NaaguruTheme.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: NaaguruTheme.muted.withAlpha(77)),
              ),
              child: Row(
                children: const [
                  Icon(Icons.translate, size: 14, color: NaaguruTheme.muted),
                  SizedBox(width: 4),
                  Text(
                    'తెలుగు / Eng',
                    style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: NaaguruTheme.muted),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: NaaguruTheme.spacing4),
        const Text(
          "Ready to explore what's next after Class 10?",
          style: TextStyle(
            fontSize: 14,
            color: NaaguruTheme.muted,
          ),
        ),
      ],
    );
  }

  Widget _buildMainCard(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: NaaguruTheme.surface,
        border: Border.all(color: NaaguruTheme.muted.withAlpha(51)),
        boxShadow: const [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 4,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: NaaguruTheme.accent.withAlpha(51),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
            ),
            child: SvgPicture.asset(
              'assets/illustrations/home_exploration.svg',
              fit: BoxFit.contain,
              placeholderBuilder: (_) => const Center(child: Icon(Icons.image, size: 48, color: NaaguruTheme.muted)),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(NaaguruTheme.spacing20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  "Let's find a path that feels right for you.",
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                    color: NaaguruTheme.primaryDark,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: NaaguruTheme.spacing8),
                const Text(
                  "Explore your interests, discover possible career directions, and find colleges that match your journey.",
                  style: TextStyle(
                    fontSize: 14,
                    color: NaaguruTheme.muted,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: NaaguruTheme.spacing20),
                PrimaryButton(
                  text: 'Start Your Journey \u2192',
                  onPressed: () {
                    final isAuth = widget.authService?.isAuthenticated ?? false;
                    Navigator.pushNamed(context, isAuth ? '/profile' : '/login');
                  },
                ),
                const SizedBox(height: NaaguruTheme.spacing12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.auto_awesome, size: 14, color: NaaguruTheme.accent),
                    const SizedBox(width: 4),
                    const Expanded(
                      child: Text(
                        "Takes only 8-10 mins • No pressure, explore at your own pace",
                        style: TextStyle(
                          fontSize: 11,
                          color: NaaguruTheme.muted,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildJourneySection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                Text(
                  'Your Journey',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                    color: NaaguruTheme.primaryDark,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Step 1 of 4 • Just beginning',
                  style: TextStyle(
                    fontSize: 12,
                    color: NaaguruTheme.muted,
                  ),
                ),
              ],
            ),
            const Icon(Icons.explore_outlined, color: NaaguruTheme.muted),
          ],
        ),
        const SizedBox(height: NaaguruTheme.spacing16),
        Container(
          padding: const EdgeInsets.all(NaaguruTheme.spacing20),
          decoration: BoxDecoration(
            color: NaaguruTheme.surface,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(5),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            children: [
              _buildStepItem(
                number: '1',
                title: 'Create your profile',
                description: 'Tell us a little about your class, goals, and dreams.',
                isActive: true,
                badge: 'In Progress',
                isLast: false,
              ),
              _buildStepItem(
                number: '2',
                title: 'Explore your interests',
                description: 'Quick, fun questions about activities that genuinely excite you.',
                isActive: false,
                isLast: false,
              ),
              _buildStepItem(
                number: '3',
                title: 'Discover possible paths',
                description: 'Understand Intermediate streams (MPC, BiPC, CEC, MEC) & career maps.',
                isActive: false,
                isLast: false,
              ),
              _buildStepItem(
                number: '4',
                title: 'Find colleges',
                description: 'Explore junior colleges and polytechnic campuses tailored to your vision.',
                isActive: false,
                isLast: true,
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildStepItem({
    required String number,
    required String title,
    required String description,
    required bool isActive,
    required bool isLast,
    String? badge,
  }) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Timeline column
          Column(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: isActive ? NaaguruTheme.primaryDark : NaaguruTheme.background,
                  shape: BoxShape.circle,
                  border: isActive ? null : Border.all(color: NaaguruTheme.muted.withAlpha(77)),
                ),
                alignment: Alignment.center,
                child: isActive
                    ? const Icon(Icons.edit, size: 14, color: NaaguruTheme.surface)
                    : Text(
                        number,
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: NaaguruTheme.muted,
                        ),
                      ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: NaaguruTheme.background,
                    margin: const EdgeInsets.symmetric(vertical: 4),
                  ),
                ),
            ],
          ),
          const SizedBox(width: NaaguruTheme.spacing16),
          // Content column
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: NaaguruTheme.spacing24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          title,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: isActive ? NaaguruTheme.primaryDark : NaaguruTheme.text,
                          ),
                        ),
                      ),
                      if (badge != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: NaaguruTheme.primaryLight,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            badge,
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              color: NaaguruTheme.primaryDark,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    description,
                    style: TextStyle(
                      fontSize: 13,
                      color: NaaguruTheme.muted,
                      height: 1.4,
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

  Widget _buildSecondaryCard() {
    return Container(
      padding: const EdgeInsets.all(NaaguruTheme.spacing16),
      decoration: BoxDecoration(
        color: NaaguruTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: NaaguruTheme.muted.withAlpha(51)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: NaaguruTheme.accent.withAlpha(51),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.account_balance, color: NaaguruTheme.primaryDark),
          ),
          const SizedBox(width: NaaguruTheme.spacing16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Looking for colleges directly?',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: NaaguruTheme.text,
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Browse junior colleges & Polytechnic institutes nearby.',
                  style: TextStyle(
                    fontSize: 12,
                    color: NaaguruTheme.muted,
                  ),
                ),
                const SizedBox(height: 8),
                Row(
                  children: const [
                    Text(
                      'Browse colleges',
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: NaaguruTheme.primaryDark,
                      ),
                    ),
                    SizedBox(width: 4),
                    Icon(Icons.arrow_forward, size: 14, color: NaaguruTheme.primaryDark),
                  ],
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: NaaguruTheme.muted),
        ],
      ),
    );
  }

  Widget _buildTertiaryCard() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: NaaguruTheme.spacing16, vertical: NaaguruTheme.spacing12),
      decoration: BoxDecoration(
        color: NaaguruTheme.primaryLight.withAlpha(128),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: const BoxDecoration(
              color: NaaguruTheme.accent,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.favorite, size: 16, color: NaaguruTheme.primaryDark),
          ),
          const SizedBox(width: NaaguruTheme.spacing12),
          const Expanded(
            child: Text.rich(
              TextSpan(
                text: "You don't have to figure everything out alone. ",
                style: TextStyle(fontSize: 13, color: NaaguruTheme.text),
                children: [
                  TextSpan(
                    text: "Naaguru",
                    style: TextStyle(fontWeight: FontWeight.w700, color: NaaguruTheme.primaryDark),
                  ),
                  TextSpan(text: " is with you at every step."),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

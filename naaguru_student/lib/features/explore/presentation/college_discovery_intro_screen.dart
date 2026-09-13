import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/features/college/data/college_api_client.dart';
import 'package:naaguru_student/features/college/presentation/college_preferences_screen.dart';
import 'package:naaguru_student/features/explore/presentation/explore_paths_screen.dart';

class CollegeDiscoveryIntroScreen extends StatelessWidget {
  final CollegeApiClient? collegeApiClient;
  final bool isTelugu;

  const CollegeDiscoveryIntroScreen({
    super.key,
    this.collegeApiClient,
    required this.isTelugu,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.all(NaaguruTheme.spacing20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // "Find Your College" header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.school_outlined, color: NaaguruTheme.primaryDark, size: 22),
                    const SizedBox(width: 8),
                    Text(
                      isTelugu ? 'మీ కాలేజీని వెతకండి' : 'Find Your College',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: NaaguruTheme.primaryDark,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 24),
            
            // Hero Illustration
            Container(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    NaaguruTheme.primaryLight,
                    Color(0xFFFDFBF7), // Warm Amber light tint
                  ],
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              padding: const EdgeInsets.symmetric(vertical: 32, horizontal: 16),
              child: Column(
                children: [
                  SvgPicture.asset(
                    'assets/illustrations/path_exploration.svg',
                    height: 200,
                  ),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white.withAlpha(220),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: NaaguruTheme.primary,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          isTelugu ? 'AP & TG క్యాంపస్ గైడ్' : 'AP & TG Campus Guide',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: NaaguruTheme.primaryDark,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            
            // Title & Description
            Text(
              isTelugu ? 'సరిపోయే కాలేజీలను కనుగొనండి' : 'Find colleges that fit you',
              style: const TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.w800,
                color: NaaguruTheme.text,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              isTelugu 
                  ? "మీరు ఏమి చదవాలనుకుంటున్నారో, ఎక్కడ చదవాలనుకుంటున్నారో మరియు మీ అవసరాలను చెప్పండి. సరిపోయే కాలేజీలను చూపిస్తాం."
                  : "Tell us what you want to study, where you want to study, and what you need. We'll show colleges that match.",
              style: const TextStyle(
                fontSize: 15,
                color: NaaguruTheme.text,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 24),
            
            // Chips
            _buildFeatureChip(Icons.search, isTelugu ? 'ప్రత్యక్ష కళాశాలల శోధన' : 'Direct College Search'),
            const SizedBox(height: 10),
            _buildFeatureChip(Icons.shield_outlined, isTelugu ? 'అసెస్‌మెంట్ తప్పనిసరి కాదు' : 'No Mandatory Assessment'),
            const SizedBox(height: 10),
            _buildFeatureChip(Icons.domain_verification_outlined, isTelugu ? 'AP & TG అంతటా ధృవీకరించబడిన సంస్థలు' : 'Verified Institutions across AP & TG'),
            const SizedBox(height: 32),
            
            // Primary CTA
            ElevatedButton(
              onPressed: () {
                if (collegeApiClient != null) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => CollegePreferencesScreen(
                        collegeApiClient: collegeApiClient!,
                      ),
                    ),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('College discovery is initializing...')),
                  );
                }
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: NaaguruTheme.primaryDark,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              child: Row(
                children: [
                  const SizedBox(width: 16),
                  Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            isTelugu ? 'కాలేజీని వెతకండి' : 'Find a College',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(width: 4),
                          const Icon(Icons.arrow_forward, size: 18),
                        ],
                      ),
                    ],
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white.withAlpha(50),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.search, size: 20),
                  ),
                  const SizedBox(width: 8),
                ],
              ),
            ),
            const SizedBox(height: 16),
            
            // Secondary CTA
            OutlinedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const ExplorePathsScreen()),
                );
              },
              style: OutlinedButton.styleFrom(
                backgroundColor: NaaguruTheme.background,
                foregroundColor: NaaguruTheme.primaryDark,
                padding: const EdgeInsets.symmetric(vertical: 14),
                side: const BorderSide(color: NaaguruTheme.primaryLight, width: 2),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.alt_route, size: 20),
                  const SizedBox(width: 8),
                  Text(
                    isTelugu ? 'కోర్సు మార్గాలను చూడండి' : 'Explore Paths',
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            
            // Reassurance text
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.schedule, size: 14, color: NaaguruTheme.muted),
                const SizedBox(width: 6),
                Text(
                  isTelugu ? 'అన్వేషించడానికి ఉచితం • 3-నిమిషాల మార్గదర్శకత్వం' : 'Free to explore • 3-minute guided discovery',
                  style: const TextStyle(fontSize: 12, color: NaaguruTheme.muted),
                ),
              ],
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildFeatureChip(IconData icon, String text) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: NaaguruTheme.primaryLight.withAlpha(150),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: NaaguruTheme.primaryDark),
            const SizedBox(width: 8),
            Text(
              text,
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: NaaguruTheme.text,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

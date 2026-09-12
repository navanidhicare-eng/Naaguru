import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:flutter/material.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/core/ui/buttons.dart';
import 'package:naaguru_student/core/ui/language_toggle.dart';

class AssessmentIntroScreen extends StatefulWidget {
  const AssessmentIntroScreen({super.key});

  @override
  State<AssessmentIntroScreen> createState() => _AssessmentIntroScreenState();
}

class _AssessmentIntroScreenState extends State<AssessmentIntroScreen> {
  bool _isTelugu = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NaaguruTheme.background,
      body: SafeArea(
        child: Column(
          children: [
            // Custom Header
            Container(
              height: 56,
              padding: const EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(
                color: NaaguruTheme.background,
                border: Border(
                  bottom: BorderSide(
                    color: NaaguruTheme.muted.withAlpha(25),
                  ),
                ),
              ),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () {
                      if (Navigator.canPop(context)) {
                        Navigator.of(context).pop();
                      }
                    },
                    child: Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: NaaguruTheme.muted.withAlpha(51),
                        ),
                      ),
                      child: const Icon(
                        Icons.chevron_left,
                        color: NaaguruTheme.text,
                        size: 24,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Center(
                      child: SvgPicture.asset(
                        'assets/branding/logo.svg',
                        height: 28,
                        errorBuilder: (context, error, stackTrace) => const Text(
                          'Naaguru',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: NaaguruTheme.primary,
                          ),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  LanguageToggle(
                    isTelugu: _isTelugu,
                    onToggle: (val) => setState(() => _isTelugu = val),
                  ),
                ],
              ),
            ),

            // Scrollable Body Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Step Badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: NaaguruTheme.primaryLight,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: NaaguruTheme.primary.withAlpha(38),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
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
                                ? "స్టెప్ 1 / 3 • ఆసక్తుల అన్వేషణ"
                                : "STEP 1 OF 3 • INTEREST DISCOVERY",
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                              color: NaaguruTheme.primaryDark,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Hero Illustration Card
                    Container(
                      width: double.infinity,
                      height: 180,
                      decoration: BoxDecoration(
                        color: NaaguruTheme.primaryLight.withAlpha(51),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: NaaguruTheme.muted.withAlpha(38),
                        ),
                      ),
                      padding: const EdgeInsets.all(12),
                      child: Center(
                        child: SvgPicture.asset(
                          'assets/illustrations/home_exploration.svg',
                          fit: BoxFit.contain,
                          errorBuilder: (context, error, stackTrace) =>
                              const Icon(
                            Icons.explore,
                            size: 64,
                            color: NaaguruTheme.primary,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Title
                    Text(
                      _isTelugu
                          ? "మీ గురించి తెలుసుకోవడానికి సిద్ధంగా ఉన్నారా?"
                          : "Ready to explore?",
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: NaaguruTheme.text,
                        height: 1.25,
                      ),
                    ),
                    const SizedBox(height: 10),

                    // Reassurance Tag Pill
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFAF4E4),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: const Color(0xFFF4B942).withAlpha(77),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.auto_awesome,
                            size: 14,
                            color: Color(0xFFF4B942),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            _isTelugu
                                ? "ఇక్కడ సరైన లేదా తప్పు సమాధానాలు ఏవీ లేవు"
                                : "No right or wrong answers here",
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF8F6406),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),

                    // Explanatory Narrative
                    Text(
                      _isTelugu
                          ? "వివిధ రకాల కార్యకలాపాలను చూస్తారు. వాటిలో మీకు ఎంత ఆసక్తి ఉందో చెప్పండి. మీ సమాధానాలు మీకు సరిపోయే సబ్జెక్టులు, స్ట్రీమ్‌లు మరియు కెరీర్ దిశలను తెలుసుకోవడంలో సహాయపడతాయి."
                          : "Explore different activities and tell us how much you enjoy them. Your answers will help you discover subjects, streams, and career directions that may fit your interests.",
                      style: const TextStyle(
                        fontSize: 13.5,
                        color: NaaguruTheme.muted,
                        height: 1.5,
                      ),
                    ),
                    const SizedBox(height: 20),

                    // 3 Highlight Attribute Cards
                    Row(
                      children: [
                        Expanded(
                          child: _AttributeCard(
                            icon: Icons.schedule_outlined,
                            iconBg: NaaguruTheme.primaryLight,
                            iconColor: NaaguruTheme.primary,
                            title: _isTelugu ? "40 చిన్న ప్రశ్నలు" : "40 quick questions",
                            subtitle: _isTelugu ? "~8–10 నిమిషాలు" : "~8–10 mins",
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _AttributeCard(
                            icon: Icons.check_circle_outline,
                            iconBg: NaaguruTheme.primaryLight,
                            iconColor: NaaguruTheme.primary,
                            title: _isTelugu ? "మార్కులు లేవు" : "No marks",
                            subtitle: _isTelugu ? "ఎలాంటి ఒత్తిడి లేదు" : "Zero pressure",
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: _AttributeCard(
                            icon: Icons.wb_sunny_outlined,
                            iconBg: const Color(0xFFFAF3E0),
                            iconColor: NaaguruTheme.accent,
                            title: _isTelugu ? "మీ స్వంత వేగంతో" : "Self Paced",
                            subtitle: _isTelugu ? "ఎప్పుడైనా ఆపవచ్చు" : "Pause anytime",
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Mentorship Counselor Banner
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: NaaguruTheme.surface,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: NaaguruTheme.muted.withAlpha(38),
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              color: NaaguruTheme.primaryLight,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: NaaguruTheme.primary.withAlpha(51),
                              ),
                            ),
                            child: const Icon(
                              Icons.shield_outlined,
                              color: NaaguruTheme.primary,
                              size: 20,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              _isTelugu
                                  ? "విద్యార్థి కౌన్సెలర్ల సహకారంతో నమ్మకంగా ఎంపిక చేసుకోవడానికి రూపొందించబడింది."
                                  : "Built with experienced student counselors to help Telugu students choose with clarity.",
                              style: const TextStyle(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w500,
                                color: NaaguruTheme.text,
                                height: 1.4,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),

      // Sticky Bottom Action Panel
      bottomNavigationBar: Container(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 16),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withAlpha(10),
              blurRadius: 20,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              PrimaryButton(
                text: _isTelugu ? "ప్రారంభిద్దాం →" : "Let's Begin →",
                onPressed: () {
                  Navigator.of(context).pushNamed('/assessment-question');
                },
              ),
              const SizedBox(height: 8),
              Text(
                _isTelugu
                    ? "మీకు సమయం తీసుకోవచ్చు. మీకు నిజంగా ఎలా అనిపిస్తుందో దాని ప్రకారం సమాధానం ఇవ్వండి."
                    : "You can take your time. Just answer what feels true for you.",
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 11.5,
                  color: NaaguruTheme.muted,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _AttributeCard extends StatelessWidget {
  final IconData icon;
  final Color iconBg;
  final Color iconColor;
  final String title;
  final String subtitle;

  const _AttributeCard({
    required this.icon,
    required this.iconBg,
    required this.iconColor,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: const BoxConstraints(minHeight: 96),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: NaaguruTheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: NaaguruTheme.muted.withAlpha(38),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: iconBg,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(icon, color: iconColor, size: 16),
          ),
          const SizedBox(height: 8),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.bold,
                  color: NaaguruTheme.text,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: const TextStyle(
                  fontSize: 10,
                  color: NaaguruTheme.muted,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/core/ui/language_toggle.dart';
import 'package:naaguru_student/features/assessment/data/assessment_api_client.dart';
import 'package:naaguru_student/features/explore/presentation/path_detail_screen.dart';

class ResultsScreen extends StatefulWidget {
  final AssessmentApiClient? assessmentApiClient;
  final Map<String, dynamic>? initialResult;
  final Map<String, dynamic>? initialRecommendation;

  const ResultsScreen({
    super.key,
    this.assessmentApiClient,
    this.initialResult,
    this.initialRecommendation,
  });

  @override
  State<ResultsScreen> createState() => _ResultsScreenState();
}

class _ResultsScreenState extends State<ResultsScreen> {
  bool _isTelugu = false;
  bool _isLoading = false;
  String? _errorMessage;

  Map<String, dynamic>? _result;
  Map<String, dynamic>? _recommendation;

  @override
  void initState() {
    super.initState();
    _result = widget.initialResult;
    _recommendation = widget.initialRecommendation;

    if (_result == null || _recommendation == null) {
      _loadResults();
    }
  }

  Future<void> _loadResults() async {
    if (widget.assessmentApiClient == null) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final res = await widget.assessmentApiClient!.getResult();
      Map<String, dynamic>? rec;
      try {
        rec = await widget.assessmentApiClient!.getRecommendation();
      } catch (_) {}

      if (mounted) {
        setState(() {
          _result = res;
          _recommendation = rec;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = "Could not load assessment results.";
          _isLoading = false;
        });
      }
    }
  }

  String _getStreamDescription(String code) {
    switch (code) {
      case 'MPC':
        return 'Mathematics • Physics • Chemistry';
      case 'BIPC':
        return 'Biology • Physics • Chemistry';
      case 'MEC':
        return 'Mathematics • Economics • Commerce';
      case 'CEC':
        return 'Commerce • Economics • Civics';
      default:
        return 'Core Academic Subjects';
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: NaaguruTheme.background,
        body: const Center(
          child: CircularProgressIndicator(color: NaaguruTheme.primary),
        ),
      );
    }

    if (_errorMessage != null || _result == null) {
      return Scaffold(
        backgroundColor: NaaguruTheme.background,
        appBar: AppBar(
          title: Text(_isTelugu ? "మీ ఫలితాలు" : "Your Results",
              style: const TextStyle(color: NaaguruTheme.text)),
          backgroundColor: NaaguruTheme.background,
          elevation: 0,
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.info_outline,
                    size: 64, color: NaaguruTheme.muted),
                const SizedBox(height: 16),
                Text(
                  _isTelugu
                      ? "ఫలితాలు ఇంకా అందుబాటులో లేవు"
                      : "No completed assessment results found.",
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                      fontSize: 16, color: NaaguruTheme.text),
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: Text(_isTelugu ? "వెనుకకు" : "Go Back"),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final scores =
        _result?['dimensionScores'] as Map<String, dynamic>? ?? {};
    final rankedResults =
        (_recommendation?['rankedResults'] as List<dynamic>?) ?? [];

    String topStreamId = 'MPC';
    if (rankedResults.isNotEmpty) {
      final topMatch = rankedResults.first as Map<String, dynamic>;
      topStreamId = topMatch['streamCode'] as String? ?? 'MPC';
    }

    final sortedEntries = scores.entries.toList()
      ..sort((a, b) {
        final valA = double.tryParse(a.value.toString()) ?? 0.0;
        final valB = double.tryParse(b.value.toString()) ?? 0.0;
        return valB.compareTo(valA);
      });
    final top3 = sortedEntries.take(3).toList();

    return Scaffold(
      backgroundColor: NaaguruTheme.background,
      appBar: AppBar(
        title: const Text(
          'Naaguru',
          style: TextStyle(
            color: NaaguruTheme.primaryDark,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios,
              color: NaaguruTheme.text, size: 18),
          onPressed: () => Navigator.of(context).pop(),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 20),
            child: LanguageToggle(
              isTelugu: _isTelugu,
              onToggle: (val) => setState(() => _isTelugu = val),
            ),
          )
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Primary Assessment Result
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: NaaguruTheme.muted.withAlpha(38)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(5),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: NaaguruTheme.primaryLight,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        _isTelugu
                            ? "• మీ అంచనా ఫలితం"
                            : "• YOUR ASSESSMENT RESULT",
                        style: const TextStyle(
                          color: NaaguruTheme.primaryDark,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _isTelugu
                          ? "మీ బలమైన విద్యా-విభాగ మ్యాచ్"
                          : "Your strongest academic-stream match",
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: NaaguruTheme.text,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      topStreamId.toUpperCase(),
                      style: const TextStyle(
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                        color: NaaguruTheme.primaryDark,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _getStreamDescription(topStreamId.toUpperCase()),
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 14,
                        color: NaaguruTheme.muted,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      _isTelugu
                          ? "మీ ప్రతిస్పందనలు ఈ అకడమిక్ స్ట్రీమ్‌ను మరింత అన్వేషించడం విలువైనదిగా సూచిస్తున్నాయి."
                          : "Your responses suggest this academic stream may be worth exploring further.",
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 13,
                        color: NaaguruTheme.muted,
                      ),
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => PathDetailScreen(
                              pathId: topStreamId.toUpperCase(),
                              title: topStreamId.toUpperCase(),
                            ),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: NaaguruTheme.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        minimumSize: const Size(double.infinity, 50),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            _isTelugu
                                ? "అన్వేషించండి ${topStreamId.toUpperCase()}"
                                : "Explore ${topStreamId.toUpperCase()}",
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Icon(Icons.arrow_forward, size: 18),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // 2. Interest Profile Summary Card
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: NaaguruTheme.muted.withAlpha(38)),
                ),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: NaaguruTheme.accent.withAlpha(25),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        _isTelugu
                            ? "• మీ ఆసక్తి ప్రొఫైల్"
                            : "• YOUR INTEREST PROFILE",
                        style: const TextStyle(
                          color: NaaguruTheme.accent,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            border: Border.all(
                                color: NaaguruTheme.muted.withAlpha(25)),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Center(
                            child: SvgPicture.asset(
                              'assets/illustrations/path_exploration.svg',
                              fit: BoxFit.contain,
                              width: 60,
                              height: 60,
                              errorBuilder: (c, e, s) => const Icon(
                                Icons.person,
                                color: NaaguruTheme.primary,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _isTelugu
                                    ? "మీ సమాధానాలు సూచిస్తున్నాయి"
                                    : "Here's what your answers suggest",
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                  color: NaaguruTheme.text,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                _isTelugu
                                    ? "మీరు ఆస్వాదించే కార్యకలాపాలు మరియు అభ్యాస రంగాలను మీ ప్రతిస్పందనలు చూపుతాయి."
                                    : "Your responses show the kinds of activities and learning areas that you may enjoy exploring.",
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: NaaguruTheme.muted,
                                  height: 1.4,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // 3. Top Interest Areas Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _isTelugu
                              ? "మీ ప్రధాన ఆసక్తి రంగాలు"
                              : "YOUR TOP INTEREST AREAS",
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: NaaguruTheme.primaryDark,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _isTelugu
                              ? "మీ ప్రతిస్పందనలలో ఎక్కువగా నిలిచిన రంగాలు ఇవే."
                              : "These are the areas that stood out most in your responses.",
                          style: const TextStyle(
                            fontSize: 13,
                            color: NaaguruTheme.muted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: NaaguruTheme.primaryLight.withAlpha(128),
                      shape: BoxShape.circle,
                    ),
                    child: const Center(
                      child: Text(
                        "Top\n3",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: NaaguruTheme.primaryDark,
                          height: 1.1,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Top 3 Cards
              ...top3.map((e) {
                final dimCode = e.key.toUpperCase();
                final val = double.tryParse(e.value.toString()) ?? 0.0;

                String title = dimCode;
                String desc =
                    "Exploring activities related to this interest area.";
                IconData icon = Icons.lightbulb_outline;

                switch (dimCode) {
                  case 'ISI':
                    title = "Investigative & Scientific Inquiry";
                    desc =
                        "Exploring how things work, analyzing causes, and finding answers to interesting questions.";
                    icon = Icons.science_outlined;
                    break;
                  case 'QCR':
                    title = "Quantitative & Computational Reasoning";
                    desc =
                        "Working with numbers, patterns, logic, and structured problem-solving.";
                    icon = Icons.calculate_outlined;
                    break;
                  case 'CEA':
                    title = "Creative & Expressive Arts";
                    desc =
                        "Creating, expressing ideas, and finding different ways to communicate.";
                    icon = Icons.palette_outlined;
                    break;
                  case 'SHC':
                    title = "Social & Helping";
                    desc =
                        "Connecting with people, helping others, and supporting community well-being.";
                    icon = Icons.people_outline;
                    break;
                  case 'CEE':
                    title = "Commercial & Enterprising";
                    desc =
                        "Leading projects, business concepts, and convincing others.";
                    icon = Icons.business_center_outlined;
                    break;
                  case 'TMD':
                    title = "Technical & Mechanical Design";
                    desc =
                        "Building, repairing, and understanding how machines and tools operate.";
                    icon = Icons.build_circle_outlined;
                    break;
                }

                String affinityLabel = "Worth exploring";
                Color affinityColor = NaaguruTheme.accent;
                if (val >= 80) {
                  affinityLabel = "Strong affinity";
                  affinityColor = NaaguruTheme.primary;
                } else if (val >= 60) {
                  affinityLabel = "Solid affinity";
                  affinityColor = Colors.orange;
                }

                String badgeText = "Active Interest";
                Color badgeBg = Colors.blue.withAlpha(25);
                Color badgeTextCol = Colors.blue.shade700;
                if (val >= 80) {
                  badgeText = "Very High Curiosity";
                  badgeBg = NaaguruTheme.primaryLight;
                  badgeTextCol = NaaguruTheme.primaryDark;
                } else if (val >= 60) {
                  badgeText = "High Curiosity";
                  badgeBg = Colors.orange.withAlpha(25);
                  badgeTextCol = Colors.orange.shade800;
                }

                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border:
                          Border.all(color: NaaguruTheme.muted.withAlpha(38)),
                    ),
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: NaaguruTheme.background,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Icon(icon, color: affinityColor, size: 20),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(title,
                                      style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 14)),
                                  const SizedBox(height: 6),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: badgeBg,
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(badgeText,
                                        style: TextStyle(
                                            color: badgeTextCol,
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold)),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(desc,
                            style: const TextStyle(
                                fontSize: 13, color: NaaguruTheme.muted)),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            Expanded(
                              child: ClipRRect(
                                borderRadius: BorderRadius.circular(4),
                                child: LinearProgressIndicator(
                                  value: val / 100.0,
                                  minHeight: 6,
                                  backgroundColor:
                                      NaaguruTheme.muted.withAlpha(25),
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                      affinityColor),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Text(affinityLabel,
                                style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: affinityColor)),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              }),
              const SizedBox(height: 32),

              // 4. Explore Other Paths
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: NaaguruTheme.muted.withAlpha(38)),
                ),
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _isTelugu
                          ? "ఇతర మార్గాలను అన్వేషించండి"
                          : "Explore other paths",
                      style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: NaaguruTheme.primaryDark),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      _isTelugu
                          ? "10వ తరగతి తర్వాత మరిన్ని ఎంపికలు అందుబాటులో ఉన్నాయి."
                          : "There are more options available after 10th.",
                      style: const TextStyle(
                          fontSize: 13, color: NaaguruTheme.muted),
                    ),
                    const SizedBox(height: 16),
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Text("🔧", style: TextStyle(fontSize: 24)),
                      title: Text(_isTelugu ? "పాలిటెక్నిక్" : "Polytechnic",
                          style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text(_isTelugu
                          ? "డిప్లొమా మార్గాలు"
                          : "Diploma pathways"),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const PathDetailScreen(
                              pathId: 'Polytechnic',
                              title: 'Polytechnic',
                            ),
                          ),
                        );
                      },
                    ),
                    const Divider(height: 1),
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Text("🛠", style: TextStyle(fontSize: 24)),
                      title: Text(_isTelugu ? "ఐటిఐ (ITI)" : "ITI",
                          style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text(_isTelugu
                          ? "నైపుణ్యం & వాణిజ్య మార్గాలు"
                          : "Skill & trade pathways"),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const PathDetailScreen(
                              pathId: 'ITI',
                              title: 'ITI',
                            ),
                          ),
                        );
                      },
                    ),
                    const Divider(height: 1),
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Text("🛡", style: TextStyle(fontSize: 24)),
                      title: Text(_isTelugu ? "డిఫెన్స్" : "Defence",
                          style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text(_isTelugu
                          ? "రక్షణ & సేవా మార్గాలు"
                          : "Defence & service pathways"),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => const PathDetailScreen(
                              pathId: 'Defence',
                              title: 'Defence',
                            ),
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),
              Text(
                _isTelugu
                    ? "ఈ అసెస్‌మెంట్ మీ ప్రస్తుత ఆసక్తులను ప్రతిబింబిస్తుంది. మీ ఆసక్తులు కాలక్రమేణా మారవచ్చు."
                    : "This assessment reflects your current interests and learning preferences. Your interests can grow and change over time.",
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 12, color: NaaguruTheme.muted),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}

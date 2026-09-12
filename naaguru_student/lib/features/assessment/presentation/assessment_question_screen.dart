import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:lottie/lottie.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/core/ui/language_toggle.dart';
import 'package:naaguru_student/features/assessment/data/assessment_api_client.dart';
import 'package:naaguru_student/features/assessment/presentation/results_screen.dart';

class AssessmentQuestionScreen extends StatefulWidget {
  final AssessmentApiClient? assessmentApiClient;

  const AssessmentQuestionScreen({super.key, this.assessmentApiClient});

  @override
  State<AssessmentQuestionScreen> createState() =>
      _AssessmentQuestionScreenState();
}

class _AssessmentQuestionScreenState extends State<AssessmentQuestionScreen> with TickerProviderStateMixin {
  bool _isLoading = true;
  String? _errorMessage;
  bool _isTelugu = false;
  bool _isSavingAnswer = false;

  int _currentIndex = 0;
  List<Map<String, dynamic>> _questions = [];
  final Map<String, String> _userAnswers = {};

  bool _isTransitioning = false;
  bool _isCompleted = false;
  Map<String, dynamic>? _completedResult;
  Map<String, dynamic>? _completedRecommendation;

  late AnimationController _lottieController;

  @override
  void initState() {
    super.initState();
    _lottieController = AnimationController(vsync: this);
    _loadAssessment();
  }

  @override
  void dispose() {
    _lottieController.dispose();
    super.dispose();
  }

  Future<void> _loadAssessment() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    if (widget.assessmentApiClient == null) {
      _loadFallbackQuestions();
      setState(() => _isLoading = false);
      return;
    }

    try {
      final activeAssessment =
          await widget.assessmentApiClient!.getActiveAssessment();
      final rawQuestions =
          activeAssessment['questions'] as List<dynamic>? ?? [];

      if (rawQuestions.isEmpty) {
        _loadFallbackQuestions();
      } else {
        _questions = rawQuestions
            .map((q) => Map<String, dynamic>.from(q as Map))
            .toList();
        _questions.sort((a, b) =>
            ((a['sequence'] ?? 0) as int).compareTo((b['sequence'] ?? 0) as int));
      }

      // Resume attempt if exists
      try {
        final attempt =
            await widget.assessmentApiClient!.startOrResumeAttempt();
        final rawAnswers = attempt['answers'] as List<dynamic>? ?? [];
        _userAnswers.clear();
        for (final a in rawAnswers) {
          if (a is Map) {
            final qId = a['questionId'] as String?;
            final optId = a['selectedOptionId'] as String?;
            if (qId != null && optId != null) {
              _userAnswers[qId] = optId;
            }
          }
        }
      } catch (_) {
        // Ignored, start fresh attempt locally
      }

      // Determine starting question index (first unanswered question)
      int targetIndex = 0;
      for (int i = 0; i < _questions.length; i++) {
        final qId = _questions[i]['id'] as String?;
        if (qId != null && !_userAnswers.containsKey(qId)) {
          targetIndex = i;
          break;
        }
      }
      if (_userAnswers.length == _questions.length && _questions.isNotEmpty) {
        targetIndex = _questions.length - 1;
      }
      _currentIndex = targetIndex;
    } on ApiException catch (_) {
      // Fallback to local questions if API fails or backend offline
      _loadFallbackQuestions();
      _errorMessage = null; // Proceed gracefully with available questions
    } catch (_) {
      _loadFallbackQuestions();
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _loadFallbackQuestions() {
    // Standard 40 interest assessment questions structure
    _questions = List.generate(40, (index) {
      final seq = index + 1;
      return {
        'id': 'fallback-q-$seq',
        'sequence': seq,
        'textEn': _getFallbackQuestionTextEn(seq),
        'textTe': _getFallbackQuestionTextTe(seq),
        'options': [
          {
            'id': 'opt-$seq-1',
            'textEn': 'Strongly dislike',
            'textTe': 'అసలు ఆసక్తి ఉండదు',
          },
          {
            'id': 'opt-$seq-2',
            'textEn': 'Dislike',
            'textTe': 'ఆసక్తి తక్కువగా ఉంటుంది',
          },
          {
            'id': 'opt-$seq-3',
            'textEn': 'Not sure',
            'textTe': 'ఖచ్చితంగా తెలియదు',
          },
          {
            'id': 'opt-$seq-4',
            'textEn': 'Like',
            'textTe': 'ఆసక్తిగా ఉంటుంది',
          },
          {
            'id': 'opt-$seq-5',
            'textEn': 'Strongly like',
            'textTe': 'చాలా ఆసక్తిగా ఉంటుంది',
          },
        ],
      };
    });
  }

  String _getFallbackQuestionTextEn(int seq) {
    switch (seq) {
      case 1:
        return "How much would you enjoy understanding how physical forces like gravity or electricity work in real life?";
      case 2:
        return "How much would you enjoy solving complex math puzzles or algebra problems step by step?";
      case 3:
        return "How much would you enjoy experimenting with chemical reactions or analyzing substance properties?";
      case 4:
        return "How much would you enjoy figuring out why a science experiment gave a surprising result?";
      case 5:
        return "How much would you enjoy learning how biological cells, organs, and human anatomy function?";
      default:
        return "How much would you enjoy exploring practical applications and real-world experiments in subject #$seq?";
    }
  }

  String _getFallbackQuestionTextTe(int seq) {
    switch (seq) {
      case 1:
        return "గురుత్వాకర్షణ లేదా విద్యుత్ వంటి భౌతిక శక్తులు నిజ జీవితంలో ఎలా పనిచేస్తాయో అర్థం చేసుకోవడం మీకు ఎంతవరకు ఆసక్తిగా ఉంటుంది?";
      case 2:
        return "క్లిష్టమైన గణిత సమస్యలు లేదా బీజగణితాన్ని దశలవారీగా పరిష్కరించడం మీకు ఎంతవరకు ఆసక్తిగా ఉంటుంది?";
      case 3:
        return "రసాయన చర్యలతో ప్రయోగాలు చేయడం లేదా పదార్థ గుణాలను విశ్లేషించడం మీకు ఎంతవరకు ఆసక్తిగా ఉంటుంది?";
      case 4:
        return "ఒక సైన్స్ ప్రయోగంలో ఊహించని ఫలితం ఎందుకు వచ్చిందో తెలుసుకోవడం మీకు ఎంతవరకు ఆసక్తిగా ఉంటుంది?";
      case 5:
        return "జీవకణాలు, అవయవాలు మరియు మానవ శరీరం ఎలా పనిచేస్తాయో నేర్చుకోవడం మీకు ఎంతవరకు ఆసక్తిగా ఉంటుంది?";
      default:
        return "#$seq విషయానికి సంబంధించిన ప్రయోగాత్మక అన్వేషణలు మరియు ఉదాహరణలు నేర్చుకోవడం మీకు ఎంతవరకు ఆసక్తిగా ఉంటుంది?";
    }
  }

  String _getStreamCategoryTitle(int seq) {
    if (seq <= 10) {
      return _isTelugu ? "సైన్స్ మరియు అన్వేషణ" : "Science & Discovery";
    } else if (seq <= 20) {
      return _isTelugu
          ? "సాంకేతిక మరియు సమస్య పరిష్కారం"
          : "Technical & Problem Solving";
    } else if (seq <= 30) {
      return _isTelugu
          ? "సృజనాత్మక మరియు కమ్యూనికేషన్"
          : "Creative & Communication";
    } else {
      return _isTelugu ? "ప్రజలు మరియు వ్యాపారం" : "People & Business";
    }
  }

  String _getIllustrationForQuestion(int seq) {
    // V1 Architecture: Maps sequences to specific construct illustrations
    // If exact mapping is unknown, fall back to the generic category illustration
    if (seq <= 10) {
      return 'assets/illustrations/assessment/question_science.svg';
    } else if (seq <= 20) {
      return 'assets/illustrations/assessment/question_technical.svg';
    } else if (seq <= 30) {
      return 'assets/illustrations/assessment/question_creative.svg';
    } else {
      return 'assets/illustrations/assessment/question_business.svg';
    }
  }

  Future<void> _selectOption(String questionId, String optionId) async {
    if (_isSavingAnswer) return;

    setState(() {
      _userAnswers[questionId] = optionId;
      _isSavingAnswer = true;
    });

    // Save answer via API if available
    if (widget.assessmentApiClient != null) {
      try {
        await widget.assessmentApiClient!.saveAnswer(
          questionId: questionId,
          optionId: optionId,
        );
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                _isTelugu
                    ? "సమాధానం సేవ్ చేయడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి."
                    : "Could not save answer. Please check your connection.",
              ),
              action: SnackBarAction(
                label: _isTelugu ? "మళ్లీ ప్రయత్నించండి" : "Retry",
                onPressed: () => _selectOption(questionId, optionId),
              ),
            ),
          );
        }
        setState(() => _isSavingAnswer = false);
        return;
      }
    }

    // Brief transition delay for user feedback
    await Future.delayed(const Duration(milliseconds: 250));

    if (!mounted) return;

    // Advance to next question or complete
    if (_currentIndex < _questions.length - 1) {
      final nextSequence = _questions[_currentIndex + 1]['sequence'] as int? ?? (_currentIndex + 2);
      if (nextSequence == 11 || nextSequence == 21 || nextSequence == 31) {
        setState(() {
          _isTransitioning = true;
          _isSavingAnswer = false;
          _currentIndex++;
        });
      } else {
        setState(() {
          _currentIndex++;
          _isSavingAnswer = false;
        });
      }
    } else {
      // Final question answered
      if (widget.assessmentApiClient != null) {
        try {
          await widget.assessmentApiClient!.submitAttempt();
          final result = await widget.assessmentApiClient!.getResult();
          final rec = await widget.assessmentApiClient!.getRecommendation();
          if (mounted) {
            setState(() {
              _completedResult = result;
              _completedRecommendation = rec;
              _isCompleted = true;
            });
          }
        } catch (e) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(
                  _isTelugu
                      ? "సమర్పించడంలో విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి."
                      : "Failed to submit assessment. Please try again.",
                ),
              ),
            );
          }
        }
      } else {
        // Fallback local completion
        if (mounted) {
          setState(() => _isCompleted = true);
        }
      }

      if (mounted) {
        setState(() => _isSavingAnswer = false);
      }
    }
  }

  void _previousQuestion() {
    if (_isTransitioning) {
      setState(() {
        _isTransitioning = false;
        _currentIndex--;
      });
      return;
    }

    if (_currentIndex > 0) {
      setState(() {
        _currentIndex--;
      });
    } else {
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: NaaguruTheme.background,
        body: Center(
          child: CircularProgressIndicator(color: NaaguruTheme.primary),
        ),
      );
    }

    if (_isCompleted) {
      return _buildCompletionScreen();
    }

    if (_completedResult != null) {
      return _buildResultScreen();
    }

    if (_isTransitioning) {
      return _buildTransitionScreen();
    }

    if (_questions.isEmpty) {
      return Scaffold(
        backgroundColor: NaaguruTheme.background,
        body: SafeArea(
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline,
                    size: 48, color: NaaguruTheme.error),
                const SizedBox(height: 16),
                Text(
                  _errorMessage ?? "No questions available.",
                  style: const TextStyle(color: NaaguruTheme.text),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _loadAssessment,
                  child: const Text("Retry"),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final currentQuestion = _questions[_currentIndex];
    final questionId = currentQuestion['id'] as String;
    final sequence = currentQuestion['sequence'] as int? ?? (_currentIndex + 1);
    final totalQuestions = _questions.length;

    final textEn = currentQuestion['textEn'] as String? ?? '';
    final textTe = currentQuestion['textTe'] as String? ?? textEn;
    final options = currentQuestion['options'] as List<dynamic>? ?? [];

    final progressRatio = (sequence / totalQuestions).clamp(0.0, 1.0);
    final percentage = (progressRatio * 100).round();
    final selectedOptionId = _userAnswers[questionId];

    return Scaffold(
      backgroundColor: NaaguruTheme.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
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
                  SvgPicture.asset(
                    'assets/branding/logo.svg',
                    height: 26,
                    errorBuilder: (context, error, stackTrace) => const Text(
                      'Naaguru',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: NaaguruTheme.primary,
                      ),
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.translate,
                        color: NaaguruTheme.muted, size: 20),
                    onPressed: () => setState(() => _isTelugu = !_isTelugu),
                  ),
                  const SizedBox(width: 4),
                  Container(
                    width: 32,
                    height: 32,
                    decoration: const BoxDecoration(
                      color: NaaguruTheme.primary,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.person,
                        color: Colors.white, size: 18),
                  ),
                ],
              ),
            ),

            // Scrollable Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Sub-Header Row: Back button, Category Badge, Language Toggle
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Back Button
                        GestureDetector(
                          onTap: _previousQuestion,
                          child: Container(
                            width: 38,
                            height: 38,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: NaaguruTheme.muted.withAlpha(51),
                              ),
                            ),
                            child: const Icon(
                              Icons.arrow_back,
                              color: NaaguruTheme.primary,
                              size: 20,
                            ),
                          ),
                        ),

                        // Stream Category Badge
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 5,
                          ),
                          decoration: BoxDecoration(
                            color: NaaguruTheme.primaryLight,
                            borderRadius: BorderRadius.circular(16),
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
                                _getStreamCategoryTitle(sequence),
                                style: const TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.bold,
                                  color: NaaguruTheme.primaryDark,
                                ),
                              ),
                            ],
                          ),
                        ),

                        // Language Toggle
                        LanguageToggle(
                          isTelugu: _isTelugu,
                          onToggle: (val) => setState(() => _isTelugu = val),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),

                    // Progress Section
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              _isTelugu
                                  ? "ప్రశ్న $sequence"
                                  : "Question $sequence",
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: NaaguruTheme.text,
                              ),
                            ),
                            Text(
                              _isTelugu
                                  ? " / $totalQuestions"
                                  : " of $totalQuestions",
                              style: const TextStyle(
                                fontSize: 14,
                                color: NaaguruTheme.muted,
                              ),
                            ),
                          ],
                        ),
                        Text(
                          "$percentage%",
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                            color: NaaguruTheme.primary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),

                    // Progress Bar
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: progressRatio,
                        minHeight: 6,
                        backgroundColor: NaaguruTheme.primaryLight,
                        valueColor: const AlwaysStoppedAnimation<Color>(
                          NaaguruTheme.primary,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Illustration Card Frame
                    Container(
                      width: double.infinity,
                      height: 170,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: NaaguruTheme.muted.withAlpha(38),
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withAlpha(5),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      padding: const EdgeInsets.all(12),
                      child: Center(
                        child: SvgPicture.asset(
                          _getIllustrationForQuestion(sequence),
                          fit: BoxFit.contain,
                          errorBuilder: (context, error, stackTrace) =>
                              SvgPicture.asset(
                            'assets/illustrations/path_exploration.svg',
                            fit: BoxFit.contain,
                            errorBuilder: (context, error, stackTrace) =>
                                const Icon(
                              Icons.science_outlined,
                              size: 64,
                              color: NaaguruTheme.primary,
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),

                    // Question Title
                    Text(
                      _isTelugu ? textTe : textEn,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: NaaguruTheme.text,
                        height: 1.35,
                      ),
                    ),
                    const SizedBox(height: 20),

                    // 5 Option Cards
                    Column(
                      children: List.generate(options.length, (optIndex) {
                        final option =
                            options[optIndex] as Map<String, dynamic>;
                        final optId = option['id'] as String;
                        final optTextEn = option['textEn'] as String? ?? '';
                        final optTextTe =
                            option['textTe'] as String? ?? optTextEn;

                        final isSelected = selectedOptionId == optId;
                        final sentimentIcon = _getSentimentIcon(optIndex);

                        return Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: GestureDetector(
                            onTap: () => _selectOption(questionId, optId),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              constraints:
                                  const BoxConstraints(minHeight: 52),
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 12,
                              ),
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? NaaguruTheme.primaryLight
                                    : Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: isSelected
                                      ? NaaguruTheme.primary
                                      : NaaguruTheme.muted.withAlpha(38),
                                  width: isSelected ? 1.5 : 1.0,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: isSelected
                                        ? NaaguruTheme.primary.withAlpha(15)
                                        : Colors.black.withAlpha(5),
                                    blurRadius: isSelected ? 8 : 4,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                              ),
                              child: Row(
                                children: [
                                  // Sentiment Icon Circle
                                  Container(
                                    width: 28,
                                    height: 28,
                                    decoration: BoxDecoration(
                                      color: isSelected
                                          ? NaaguruTheme.primary
                                          : NaaguruTheme.primaryLight
                                              .withAlpha(128),
                                      shape: BoxShape.circle,
                                    ),
                                    child: Icon(
                                      sentimentIcon,
                                      size: 18,
                                      color: isSelected
                                          ? Colors.white
                                          : NaaguruTheme.primaryDark,
                                    ),
                                  ),
                                  const SizedBox(width: 12),

                                  // Option Text
                                  Expanded(
                                    child: Text(
                                      _isTelugu ? optTextTe : optTextEn,
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: isSelected
                                            ? FontWeight.bold
                                            : FontWeight.w500,
                                        color: isSelected
                                            ? NaaguruTheme.primaryDark
                                            : NaaguruTheme.text,
                                      ),
                                    ),
                                  ),

                                  // Right Radio Check Indicator
                                  Container(
                                    width: 20,
                                    height: 20,
                                    decoration: BoxDecoration(
                                      color: isSelected
                                          ? NaaguruTheme.primary
                                          : NaaguruTheme.primaryLight
                                              .withAlpha(77),
                                      shape: BoxShape.circle,
                                    ),
                                    child: isSelected
                                        ? const Icon(
                                            Icons.check,
                                            size: 14,
                                            color: Colors.white,
                                          )
                                        : null,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      }),
                    ),
                    const SizedBox(height: 12),

                    // Reassurance Footer Note
                    Center(
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.auto_awesome,
                            size: 14,
                            color: NaaguruTheme.accent,
                          ),
                          const SizedBox(width: 6),
                          Flexible(
                            child: Text(
                              _isTelugu
                                  ? "మీకు నిజంగా ఎలా అనిపిస్తుందో అదే ఎంచుకోండి. ఇక్కడ సరైన లేదా తప్పు సమాధానాలు ఏవీ లేవు."
                                  : "Go with what feels right for you. There are no right or wrong answers.",
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                fontSize: 11.5,
                                color: NaaguruTheme.muted,
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
    );
  }

  IconData _getSentimentIcon(int index) {
    switch (index) {
      case 0:
        return Icons.sentiment_very_dissatisfied;
      case 1:
        return Icons.sentiment_dissatisfied;
      case 2:
        return Icons.sentiment_neutral;
      case 3:
        return Icons.sentiment_satisfied;
      case 4:
        return Icons.sentiment_very_satisfied;
      default:
        return Icons.sentiment_neutral;
    }
  }

  Widget _buildTransitionScreen() {
    final sequence = _questions[_currentIndex]['sequence'] as int? ?? (_currentIndex + 1);
    String lottieAsset = 'assets/illustrations/assessment/assessment_progress_10.json';
    String titleEn = "Great Progress!";
    String titleTe = "చాలా బాగుంది!";
    String subtitleEn = "You've completed 10 questions.";
    String subtitleTe = "మీరు 10 ప్రశ్నలు పూర్తి చేశారు.";

    if (sequence == 21) {
      lottieAsset = 'assets/illustrations/assessment/assessment_progress_20.json';
      titleEn = "Halfway There!";
      titleTe = "సగం పూర్తయింది!";
      subtitleEn = "You've completed 20 questions.";
      subtitleTe = "మీరు 20 ప్రశ్నలు పూర్తి చేశారు.";
    } else if (sequence == 31) {
      lottieAsset = 'assets/illustrations/assessment/assessment_progress_30.json';
      titleEn = "Last Stretch!";
      titleTe = "చివరి దశ!";
      subtitleEn = "You've completed 30 questions.";
      subtitleTe = "మీరు 30 ప్రశ్నలు పూర్తి చేశారు.";
    }

    return Scaffold(
      backgroundColor: NaaguruTheme.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              Lottie.asset(
                lottieAsset,
                controller: _lottieController,
                onLoaded: (composition) {
                  _lottieController
                    ..duration = composition.duration
                    ..forward(from: 0.0);
                },
                height: 250,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) => const Icon(
                  Icons.check_circle_outline,
                  size: 100,
                  color: NaaguruTheme.primary,
                ),
              ),
              const SizedBox(height: 32),
              Text(
                _isTelugu ? titleTe : titleEn,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: NaaguruTheme.text,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                _isTelugu ? subtitleTe : subtitleEn,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 16,
                  color: NaaguruTheme.muted,
                  height: 1.5,
                ),
              ),
              const Spacer(),
              ElevatedButton(
                onPressed: () => setState(() => _isTransitioning = false),
                style: ElevatedButton.styleFrom(
                  backgroundColor: NaaguruTheme.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  _isTelugu ? "కొనసాగించు" : "Continue",
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCompletionScreen() {
    return Scaffold(
      backgroundColor: NaaguruTheme.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              Lottie.asset(
                'assets/illustrations/assessment/assessment_complete.json',
                controller: _lottieController,
                onLoaded: (composition) {
                  _lottieController
                    ..duration = composition.duration
                    ..forward(from: 0.0);
                },
                height: 250,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) => const Icon(
                  Icons.stars,
                  size: 100,
                  color: NaaguruTheme.primary,
                ),
              ),
              const SizedBox(height: 32),
              Text(
                _isTelugu ? "అసెస్‌మెంట్ పూర్తయింది!" : "Assessment Complete!",
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: NaaguruTheme.text,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                _isTelugu 
                  ? "మీరు మొత్తం 40 ప్రశ్నలను పూర్తి చేశారు."
                  : "You've finished all 40 questions.",
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 16,
                  color: NaaguruTheme.muted,
                  height: 1.5,
                ),
              ),
              const Spacer(),
              ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pushReplacement(
                    MaterialPageRoute(
                      builder: (_) => ResultsScreen(
                        assessmentApiClient: widget.assessmentApiClient,
                        initialResult: _completedResult,
                        initialRecommendation: _completedRecommendation,
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
                ),
                child: Text(
                  _isTelugu ? "నా ఫలితాలను చూడండి" : "View My Results",
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildResultScreen() {
    return ResultsScreen(
      assessmentApiClient: widget.assessmentApiClient,
      initialResult: _completedResult,
      initialRecommendation: _completedRecommendation,
    );
  }
}


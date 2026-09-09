import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/features/auth/auth_service.dart';
import 'package:naaguru_student/core/ui/buttons.dart';
import 'package:naaguru_student/core/ui/language_toggle.dart';

class LoginScreen extends StatefulWidget {
  final AuthService authService;

  const LoginScreen({super.key, required this.authService});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();

  bool _otpSent = false;
  bool _loading = false;
  String? _errorMessage;
  bool _isTelugu = false; // For the language toggle state

  @override
  void dispose() {
    _phoneController.dispose();
    _otpController.dispose();
    super.dispose();
  }

  Future<void> _requestOtp() async {
    final phone = _phoneController.text.trim();
    if (phone.isEmpty) {
      setState(() => _errorMessage = 'Enter a valid 10-digit mobile number.');
      return;
    }

    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      await widget.authService.requestOtp(phone);
      setState(() => _otpSent = true);
    } on ApiException catch (e) {
      setState(() => _errorMessage = e.message);
    } catch (e) {
      setState(() => _errorMessage = 'Could not connect to server.');
    } finally {
      setState(() => _loading = false);
    }
  }

  Future<void> _verifyOtp() async {
    final phone = _phoneController.text.trim();
    final code = _otpController.text.trim();

    if (code.length != 6) {
      setState(() => _errorMessage = 'OTP must be 6 digits.');
      return;
    }

    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      await widget.authService.verifyOtp(phone, code);
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/profile');
      }
    } on ApiException catch (e) {
      setState(() => _errorMessage = e.message);
    } catch (e) {
      setState(() => _errorMessage = 'Could not verify OTP.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: NaaguruTheme.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(
            horizontal: NaaguruTheme.spacing20,
            vertical: NaaguruTheme.spacing16,
          ),
          child: _otpSent ? _buildOtpState() : _buildMobileNumberState(),
        ),
      ),
    );
  }

  Widget _buildMobileNumberState() {
    final double screenHeight = MediaQuery.sizeOf(context).height;
    final double heroSize = screenHeight < 800 ? 150.0 : 180.0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Top Navigation Row
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              decoration: BoxDecoration(
                color: NaaguruTheme.primaryLight.withValues(alpha: 0.3),
                shape: BoxShape.circle,
              ),
              child: IconButton(
                icon: const Icon(Icons.arrow_back, color: NaaguruTheme.text),
                onPressed: () {
                  if (Navigator.canPop(context)) Navigator.pop(context);
                },
              ),
            ),
            LanguageToggle(
              isTelugu: _isTelugu,
              onToggle: (val) => setState(() => _isTelugu = val),
            ),
          ],
        ),
        const SizedBox(height: NaaguruTheme.spacing24),

        // Hero Container with Warm Framing
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: NaaguruTheme.spacing24),
          decoration: BoxDecoration(
            color: NaaguruTheme.primaryLight.withValues(alpha: 0.3),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Center(
            child: Stack(
              clipBehavior: Clip.none,
              alignment: Alignment.bottomRight,
              children: [
                Container(
                  height: heroSize,
                  width: heroSize,
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: NaaguruTheme.surface,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.05),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: Lottie.asset(
                      '/illustrations/journey_start.json',
                      fit: BoxFit.cover,
                      repeat: false,
                      errorBuilder: (context, error, stackTrace) =>
                          const Center(child: Icon(Icons.image, size: 48, color: NaaguruTheme.muted)),
                    ),
                  ),
                ),
                // Badge
                Positioned(
                  bottom: -8,
                  right: -8,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: NaaguruTheme.accent,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.1),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.bolt, size: 14, color: NaaguruTheme.text),
                        const SizedBox(width: 2),
                        Text(
                          _isTelugu ? 'వేగవంతమైన OTP' : 'Quick OTP',
                          style: const TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            color: NaaguruTheme.text,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: NaaguruTheme.spacing24),

        // Header & Copy
        Text(
          _isTelugu ? "ప్రారంభిద్దాం" : "Let's get you started",
          style: const TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w700,
            color: NaaguruTheme.text,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: NaaguruTheme.spacing8),
        Text(
          _isTelugu
              ? "మీ మొబైల్ నంబర్ను నమోదు చేయండి. దాన్ని ధృవీకరించడానికి WhatsAppలో ఒక వెరిఫికేషన్ కోడ్ పంపిస్తాము."
              : "Enter your mobile number. We'll send a verification code on WhatsApp to verify you.",
          style: const TextStyle(
            fontSize: 14,
            color: NaaguruTheme.muted,
            height: 1.5,
          ),
        ),
        const SizedBox(height: NaaguruTheme.spacing24),

        // Mobile Input Card
        Container(
          padding: const EdgeInsets.all(NaaguruTheme.spacing16),
          decoration: BoxDecoration(
            color: NaaguruTheme.surface,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.03),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                _isTelugu ? "మొబైల్ నంబర్" : "Mobile number",
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: NaaguruTheme.text,
                ),
              ),
              const SizedBox(height: NaaguruTheme.spacing8),
              Container(
                decoration: BoxDecoration(
                  color: NaaguruTheme.primaryLight.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(left: 12, right: 8, top: 12, bottom: 12),
                      child: Row(
                        children: [
                          const Text(
                            '🇮🇳',
                            style: TextStyle(fontSize: 18),
                          ),
                          const SizedBox(width: 6),
                          const Text(
                            '+91',
                            style: TextStyle(
                              fontSize: 16,
                              color: NaaguruTheme.text,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            width: 1,
                            height: 20,
                            color: NaaguruTheme.muted.withValues(alpha: 0.4),
                          ),
                        ],
                      ),
                    ),
                    Expanded(
                      child: TextField(
                        controller: _phoneController,
                        keyboardType: TextInputType.phone,
                        style: const TextStyle(
                          fontSize: 18,
                          color: NaaguruTheme.text,
                          fontWeight: FontWeight.w500,
                          letterSpacing: 1.0,
                        ),
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 8),
                          hintText: _isTelugu ? '10 అంకెల నంబర్' : 'Enter 10-digit number',
                          hintStyle: const TextStyle(
                            color: NaaguruTheme.muted,
                            fontSize: 14,
                            letterSpacing: 0,
                          ),
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.only(right: 12),
                      child: Container(
                        padding: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: NaaguruTheme.primaryLight,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.check,
                          size: 16,
                          color: NaaguruTheme.primaryDark,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              if (_errorMessage != null) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.error_outline, size: 14, color: NaaguruTheme.error),
                    const SizedBox(width: 4),
                    Text(
                      _errorMessage!,
                      style: const TextStyle(color: NaaguruTheme.error, fontSize: 12),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: NaaguruTheme.spacing16),

        // WhatsApp Delivery Banner
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: NaaguruTheme.primaryLight.withValues(alpha: 0.3),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: NaaguruTheme.primaryDark,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(Icons.chat_bubble_rounded, color: NaaguruTheme.surface, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _isTelugu
                          ? 'వెరిఫికేషన్ కోడ్ WhatsAppలో పంపబడుతుంది.'
                          : 'Verification code will be sent on WhatsApp.',
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: NaaguruTheme.text,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: const BoxDecoration(
                            color: NaaguruTheme.primaryDark,
                            shape: BoxShape.circle,
                          ),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            _isTelugu
                                ? '1-ట్యాప్ తక్షణ ధృవీకరణ • వేగవంతమైన డెలివరీ'
                                : 'Quick 1-tap verification • Instant delivery',
                            style: const TextStyle(
                              fontSize: 12,
                              color: NaaguruTheme.muted,
                            ),
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
        const SizedBox(height: NaaguruTheme.spacing24),

        // Security / Peace of Mind Reassurance
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.verified_user, size: 16, color: NaaguruTheme.primaryDark),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                _isTelugu
                    ? "Naaguruలో మిమ్మల్ని సురక్షితంగా సైన్ ఇన్ చేయడానికి మీ నంబర్ను ఉపయోగిస్తాము."
                    : "We'll use your number to securely sign you in to Naaguru.",
                style: const TextStyle(
                  fontSize: 12,
                  color: NaaguruTheme.muted,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
        const SizedBox(height: NaaguruTheme.spacing24),

        // Dominant Primary Action Button
        SizedBox(
          height: 48,
          child: ElevatedButton(
            onPressed: _loading ? null : _requestOtp,
            style: ElevatedButton.styleFrom(
              backgroundColor: NaaguruTheme.primaryDark,
              foregroundColor: NaaguruTheme.surface,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 2,
            ),
            child: _loading
                ? const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                      color: NaaguruTheme.surface,
                      strokeWidth: 2,
                    ),
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _isTelugu ? 'OTP పంపండి' : 'Send OTP',
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: 8),
                      const Icon(Icons.arrow_forward, size: 18),
                    ],
                  ),
          ),
        ),
        const SizedBox(height: NaaguruTheme.spacing24),
      ],
    );
  }

  // Preserved OTP state from original implementation
  Widget _buildOtpState() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 32),
        const Icon(Icons.lock_outline, size: 64, color: NaaguruTheme.primary),
        const SizedBox(height: 16),
        const Text(
          'Enter OTP',
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: NaaguruTheme.text,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Enter the 6-digit code sent to ${_phoneController.text.trim()}',
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 14, color: NaaguruTheme.muted),
        ),
        const SizedBox(height: 32),
        TextField(
          controller: _otpController,
          keyboardType: TextInputType.number,
          maxLength: 6,
          decoration: const InputDecoration(
            labelText: 'OTP Code',
            hintText: '123456',
            border: OutlineInputBorder(),
            prefixIcon: Icon(Icons.lock_outline),
          ),
        ),
        if (_errorMessage != null) ...[
          const SizedBox(height: 12),
          Text(
            _errorMessage!,
            style: const TextStyle(color: NaaguruTheme.error, fontSize: 14),
            textAlign: TextAlign.center,
          ),
        ],
        const SizedBox(height: 24),
        PrimaryButton(
          text: 'Verify OTP',
          onPressed: _verifyOtp,
          isLoading: _loading,
        ),
        const SizedBox(height: 12),
        TextButton(
          onPressed: _loading
              ? null
              : () {
                  setState(() {
                    _otpSent = false;
                    _otpController.clear();
                    _errorMessage = null;
                  });
                },
          child: const Text('Change mobile number'),
        ),
      ],
    );
  }
}



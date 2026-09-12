import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/material.dart';
import 'package:naaguru_student/core/api_client.dart';
import 'package:naaguru_student/core/theme.dart';
import 'package:naaguru_student/features/auth/auth_service.dart';

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

  Timer? _resendTimer;
  int _resendSeconds = 28;

  void _startResendTimer() {
    setState(() => _resendSeconds = 28);
    _resendTimer?.cancel();
    _resendTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      if (_resendSeconds > 0) {
        setState(() => _resendSeconds--);
      } else {
        timer.cancel();
      }
    });
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _otpController.dispose();
    _resendTimer?.cancel();
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
      _startResendTimer();
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
                color: NaaguruTheme.primaryLight.withAlpha(77),
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
            color: NaaguruTheme.primaryLight.withAlpha(77),
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
                        color: Colors.black.withAlpha(13),
                        blurRadius: 10,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: const Center(
                      child: Icon(Icons.explore, size: 64, color: NaaguruTheme.primaryDark),
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
                          color: Colors.black.withAlpha(25),
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
                color: Colors.black.withAlpha(8),
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
                  color: NaaguruTheme.primaryLight.withAlpha(77),
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
                            color: NaaguruTheme.muted.withAlpha(102),
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
            color: NaaguruTheme.primaryLight.withAlpha(77),
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
    final String phone = _phoneController.text.trim();
    final String maskedPhone = phone.length >= 10 
        ? "+91 ••••• ••${phone.substring(phone.length - 4)}"
        : "+91 $phone";

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // Top Nav
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              decoration: BoxDecoration(
                color: NaaguruTheme.primaryLight.withAlpha(77),
                shape: BoxShape.circle,
              ),
              child: IconButton(
                icon: const Icon(Icons.arrow_back, color: NaaguruTheme.text),
                onPressed: () {
                  setState(() {
                    _otpSent = false;
                    _otpController.clear();
                    _errorMessage = null;
                    _resendTimer?.cancel();
                  });
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

        // Illustration
        Center(
          child: Container(
            width: 128,
            height: 128,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  NaaguruTheme.primaryLight.withAlpha(128),
                  NaaguruTheme.surface,
                  NaaguruTheme.accent.withAlpha(25),
                ],
                begin: Alignment.topRight,
                end: Alignment.bottomLeft,
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: NaaguruTheme.muted.withAlpha(38)),
            ),
            child: Stack(
              clipBehavior: Clip.none,
              children: [
                Center(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: const Icon(Icons.phonelink_lock, size: 64, color: NaaguruTheme.primaryDark),
                  ),
                ),
                Positioned(
                  bottom: -6,
                  right: -6,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: NaaguruTheme.surface,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withAlpha(25),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Container(
                      width: 28,
                      height: 28,
                      decoration: const BoxDecoration(
                        color: Color(0xFF25D366), // WhatsApp Green
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.chat_bubble, size: 16, color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: NaaguruTheme.spacing24),

        // Header
        Text(
          _isTelugu ? "మీ WhatsApp చూడండి" : "Check your WhatsApp",
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: NaaguruTheme.text,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          _isTelugu 
            ? "మీ WhatsAppకు 6 అంకెల వెరిఫికేషన్ కోడ్ పంపించాము." 
            : "We sent a 6-digit verification code to",
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 12, color: NaaguruTheme.muted, height: 1.5),
        ),
        const SizedBox(height: 12),

        // Phone Number Pill
        Center(
          child: Container(
            padding: const EdgeInsets.only(left: 12, right: 16, top: 6, bottom: 6),
            decoration: BoxDecoration(
              color: NaaguruTheme.surface,
              borderRadius: BorderRadius.circular(100),
              border: Border.all(color: NaaguruTheme.muted.withAlpha(51)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withAlpha(5),
                  blurRadius: 4,
                  offset: const Offset(0, 1),
                ),
              ],
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Color(0xFF25D366),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  maskedPhone,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: NaaguruTheme.text,
                    letterSpacing: 1.0,
                  ),
                ),
                const SizedBox(width: 12),
                GestureDetector(
                  onTap: () {
                    setState(() {
                      _otpSent = false;
                      _otpController.clear();
                      _errorMessage = null;
                      _resendTimer?.cancel();
                    });
                  },
                  child: Text(
                    _isTelugu ? "మార్చండి" : "Edit",
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: NaaguruTheme.primaryDark,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),

        Text(
          _isTelugu ? "కొనసాగడానికి ఆ కోడ్‌ను నమోదు చేయండి." : "Enter the code to continue.",
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 11, color: NaaguruTheme.muted),
        ),
        const SizedBox(height: 16),

        // OTP Input Boxes
        _buildOtpBoxes(),
        
        // Error Message
        if (_errorMessage != null) ...[
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
            decoration: BoxDecoration(
              color: NaaguruTheme.error.withAlpha(25),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 14, color: NaaguruTheme.error),
                const SizedBox(width: 6),
                Flexible(
                  child: Text(
                    _errorMessage!,
                    style: const TextStyle(color: NaaguruTheme.error, fontSize: 12, fontWeight: FontWeight.w500),
                    textAlign: TextAlign.center,
                  ),
                ),
              ],
            ),
          ),
        ],

        const SizedBox(height: 24),

        // Resend Text & Action
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              _isTelugu ? "కోడ్ రాలేదా? " : "Didn't receive the code? ",
              style: const TextStyle(fontSize: 12, color: NaaguruTheme.muted),
            ),
            if (_resendSeconds > 0)
              Text(
                _isTelugu ? "$_resendSeconds సెకన్లలో మళ్లీ పంపవచ్చు" : "Resend in ${_resendSeconds}s",
                style: const TextStyle(fontSize: 12, color: NaaguruTheme.primaryDark, fontWeight: FontWeight.w600),
              )
            else
              GestureDetector(
                onTap: _loading ? null : () {
                  _requestOtp();
                  _startResendTimer();
                },
                child: Text(
                  _isTelugu ? "కోడ్‌ను మళ్లీ పంపండి" : "Resend code",
                  style: const TextStyle(fontSize: 12, color: NaaguruTheme.primaryDark, fontWeight: FontWeight.w700),
                ),
              ),
          ],
        ),
        const SizedBox(height: 16),
        
        // Change Number Text
        Center(
          child: TextButton(
            onPressed: () {
              setState(() {
                _otpSent = false;
                _otpController.clear();
                _errorMessage = null;
                _resendTimer?.cancel();
              });
            },
            style: TextButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: Text(
              _isTelugu ? "మొబైల్ నంబర్ మార్చండి" : "Change mobile number",
              style: const TextStyle(fontSize: 12, color: NaaguruTheme.muted),
            ),
          ),
        ),
        
        const SizedBox(height: 32),

        // Primary Action Button
        SizedBox(
          height: 48,
          child: ElevatedButton(
            onPressed: (_otpController.text.length == 6 && !_loading) ? _verifyOtp : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: NaaguruTheme.primaryDark,
              foregroundColor: NaaguruTheme.surface,
              disabledBackgroundColor: NaaguruTheme.primaryDark.withAlpha(102),
              disabledForegroundColor: NaaguruTheme.surface.withAlpha(178),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              elevation: 0,
            ),
            child: _loading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      color: NaaguruTheme.surface,
                      strokeWidth: 2,
                    ),
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        _isTelugu ? "ధృవీకరించి కొనసాగండి" : "Verify & Continue",
                        style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                      ),
                      const SizedBox(width: 8),
                      const Icon(Icons.arrow_forward, size: 16),
                    ],
                  ),
          ),
        ),
        const SizedBox(height: 16),
        
        // Trust Note
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.verified_user_outlined, size: 14, color: NaaguruTheme.primary),
            const SizedBox(width: 4),
            Text(
              _isTelugu 
                ? "సులభమైన వెరిఫికేషన్ • Naaguru మీ గోప్యతను కాపాడుతుంది"
                : "Quick 1-step verification • Naaguru protects your privacy",
              style: const TextStyle(fontSize: 11, color: NaaguruTheme.muted),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildOtpBoxes() {
    return LayoutBuilder(
      builder: (context, constraints) {
        final boxWidth = (constraints.maxWidth - (5 * 8)) / 6;
        final clampedWidth = boxWidth.clamp(40.0, 54.0); // max width 54, min 40
        
        return Center(
          child: SizedBox(
            width: (clampedWidth * 6) + (5 * 8),
            height: 54,
            child: Stack(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: List.generate(6, (index) {
                    final text = _otpController.text;
                    final char = index < text.length ? text[index] : '';
                    final isFocused = index == text.length;
                    final isError = _errorMessage != null;
                    
                    Color borderColor = NaaguruTheme.muted.withAlpha(77);
                    Color bgColor = NaaguruTheme.surface;
                    
                    if (isError) {
                      borderColor = NaaguruTheme.error;
                      bgColor = NaaguruTheme.error.withAlpha(13);
                    } else if (isFocused) {
                      borderColor = NaaguruTheme.primaryDark;
                    } else if (char.isNotEmpty) {
                      borderColor = NaaguruTheme.primaryDark;
                      bgColor = NaaguruTheme.primaryLight.withAlpha(25);
                    }

                    return Container(
                      width: clampedWidth,
                      height: 54,
                      alignment: Alignment.center,
                      decoration: BoxDecoration(
                        color: bgColor,
                        border: Border.all(color: borderColor, width: isFocused ? 2 : 1.5),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        char,
                        style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                          color: isError ? NaaguruTheme.error : NaaguruTheme.text,
                        ),
                      ),
                    );
                  }),
                ),
                Positioned.fill(
                  child: TextField(
                    controller: _otpController,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    autofocus: true,
                    showCursor: false,
                    cursorColor: Colors.transparent,
                    style: const TextStyle(color: Colors.transparent, fontSize: 24),
                    decoration: const InputDecoration(
                      counterText: '',
                      border: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                      contentPadding: EdgeInsets.zero,
                    ),
                    onChanged: (val) {
                      setState(() {
                        if (_errorMessage != null) {
                          _errorMessage = null; // Clear error on typing
                        }
                      });
                      if (val.length == 6 && !_loading) {
                        _verifyOtp(); // Auto-verify when 6 digits are typed
                      }
                    },
                  ),
                ),
              ],
            ),
          ),
        );
      }
    );
  }
}



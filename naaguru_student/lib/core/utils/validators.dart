/// Reusable form input validation utilities for student forms.
class PhoneValidator {
  PhoneValidator._();

  /// Cleans raw phone input by removing whitespaces, dashes, and leading '+91' or '0'.
  static String clean(String? input) {
    if (input == null) return '';
    var cleaned = input.replaceAll(RegExp(r'\s+|-|\(|\)'), '');
    if (cleaned.startsWith('+91')) {
      cleaned = cleaned.substring(3);
    } else if (cleaned.startsWith('91') && cleaned.length > 10) {
      cleaned = cleaned.substring(2);
    } else if (cleaned.startsWith('0') && cleaned.length > 10) {
      cleaned = cleaned.substring(1);
    }
    return cleaned.trim();
  }

  /// Validates an Indian mobile number.
  /// Returns a user-friendly error message, or null if valid.
  static String? validate(String? input, {bool isTelugu = false}) {
    if (input == null || input.trim().isEmpty) {
      return isTelugu
          ? 'దయచేసి మీ 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.'
          : 'Enter a valid 10-digit mobile number.';
    }

    final cleaned = clean(input);

    if (RegExp(r'\D').hasMatch(cleaned)) {
      return isTelugu
          ? 'దయచేసి అంకెలు మాత్రమే నమోదు చేయండి.'
          : 'Enter a valid 10-digit mobile number using digits only.';
    }

    if (cleaned.length < 10) {
      return isTelugu
          ? 'దయచేసి పూర్తి 10 అంకెలు నమోదు చేయండి.'
          : 'Please enter all 10 digits of your mobile number.';
    }

    if (cleaned.length > 10) {
      return isTelugu
          ? 'మొబైల్ నంబర్ 10 అంకెలు మాత్రమే ఉండాలి.'
          : 'Mobile number must be exactly 10 digits.';
    }

    if (!RegExp(r'^[6-9]').hasMatch(cleaned)) {
      return isTelugu
          ? 'దయచేసి 6-9తో ప్రారంభమయ్యే సరైన మొబైల్ నంబర్ నమోదు చేయండి.'
          : 'Enter a valid 10-digit mobile number starting with 6-9.';
    }

    return null;
  }

  /// Fast boolean check for whether input is a valid 10-digit Indian phone.
  static bool isValid(String? input) => validate(input) == null;
}

/// Validation for OTP / verification codes.
class OtpValidator {
  OtpValidator._();

  static String? validate(String? input, {bool isTelugu = false}) {
    if (input == null || input.trim().isEmpty) {
      return isTelugu
          ? 'దయచేసి 6 అంకెల వెరిఫికేషన్ కోడ్ నమోదు చేయండి.'
          : 'Please enter the 6-digit verification code.';
    }

    final trimmed = input.trim();

    if (RegExp(r'\D').hasMatch(trimmed)) {
      return isTelugu
          ? 'వెరిఫికేషన్ కోడ్‌లో అంకెలు మాత్రమే ఉండాలి.'
          : 'Verification code must contain digits only.';
    }

    if (trimmed.length != 6) {
      return isTelugu
          ? 'వెరిఫికేషన్ కోడ్ సరిగ్గా 6 అంకెలు ఉండాలి.'
          : 'Verification code must be exactly 6 digits.';
    }

    return null;
  }

  static bool isValid(String? input) => validate(input) == null;
}

/// Validation for Indian 6-digit PIN codes.
class PincodeValidator {
  PincodeValidator._();

  static String? validate(String? input, {bool isTelugu = false}) {
    if (input == null || input.trim().isEmpty) {
      return isTelugu
          ? 'దయచేసి మీ 6 అంకెల పిన్‌కోడ్ నమోదు చేయండి.'
          : 'Please enter your 6-digit pincode.';
    }

    final trimmed = input.trim();

    if (trimmed.length != 6 || !RegExp(r'^\d{6}$').hasMatch(trimmed)) {
      return isTelugu
          ? 'దయచేసి సరైన 6 అంకెల పిన్‌కోడ్ నమోదు చేయండి.'
          : 'Enter a valid 6-digit pincode.';
    }

    return null;
  }

  static bool isValid(String? input) => validate(input) == null;
}

/// Validation for text fields like Name, Landmark, etc.
class TextValidator {
  TextValidator._();

  static String? validateRequired(
    String? input, {
    String fieldName = 'Field',
    int minLength = 2,
    bool isTelugu = false,
  }) {
    if (input == null || input.trim().isEmpty) {
      return isTelugu
          ? 'దయచేసి ఈ వివరాలను పూరించండి.'
          : 'Please enter $fieldName.';
    }

    if (input.trim().length < minLength) {
      return isTelugu
          ? 'కనీసం $minLength అక్షరాలు ఉండాలి.'
          : '$fieldName must be at least $minLength characters.';
    }

    return null;
  }
}

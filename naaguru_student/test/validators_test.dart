import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/core/utils/validators.dart';

void main() {
  group('PhoneValidator Tests', () {
    test('rejects empty or null input', () {
      expect(PhoneValidator.validate(null), 'Enter a valid 10-digit mobile number.');
      expect(PhoneValidator.validate(''), 'Enter a valid 10-digit mobile number.');
      expect(PhoneValidator.validate('   '), 'Enter a valid 10-digit mobile number.');
      expect(PhoneValidator.validate('', isTelugu: true), 'దయచేసి మీ 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.');
    });

    test('rejects 9-digit input with clear instruction to enter all 10 digits', () {
      final error = PhoneValidator.validate('987654321');
      expect(error, 'Please enter all 10 digits of your mobile number.');
      expect(PhoneValidator.isValid('987654321'), isFalse);
    });

    test('accepts valid 10-digit Indian mobile numbers starting with 6, 7, 8, 9', () {
      expect(PhoneValidator.validate('9876543210'), isNull);
      expect(PhoneValidator.validate('8123456789'), isNull);
      expect(PhoneValidator.validate('7012345678'), isNull);
      expect(PhoneValidator.validate('6301234567'), isNull);
      expect(PhoneValidator.isValid('9876543210'), isTrue);
    });

    test('rejects numbers not starting with 6-9', () {
      expect(PhoneValidator.validate('1234567890'), 'Enter a valid 10-digit mobile number starting with 6-9.');
      expect(PhoneValidator.validate('5555555555'), 'Enter a valid 10-digit mobile number starting with 6-9.');
      expect(PhoneValidator.validate('0123456789'), 'Enter a valid 10-digit mobile number starting with 6-9.');
    });

    test('rejects input with invalid non-digit characters', () {
      expect(PhoneValidator.validate('987654321a'), isNotNull);
      expect(PhoneValidator.validate('98765-4321'), isNotNull);
    });

    test('clean utility strips +91, 0, whitespace, and dashes properly', () {
      expect(PhoneValidator.clean('+91 98765 43210'), '9876543210');
      expect(PhoneValidator.clean('+919876543210'), '9876543210');
      expect(PhoneValidator.clean('91 9876543210'), '9876543210');
      expect(PhoneValidator.clean('09876543210'), '9876543210');
      expect(PhoneValidator.clean('98765-43210'), '9876543210');
    });
  });

  group('OtpValidator Tests', () {
    test('rejects empty or null input', () {
      expect(OtpValidator.validate(null), 'Please enter the 6-digit verification code.');
      expect(OtpValidator.validate(''), 'Please enter the 6-digit verification code.');
    });

    test('rejects less than 6 digits', () {
      expect(OtpValidator.validate('12345'), 'Verification code must be exactly 6 digits.');
    });

    test('rejects more than 6 digits', () {
      expect(OtpValidator.validate('1234567'), 'Verification code must be exactly 6 digits.');
    });

    test('rejects non-numeric characters', () {
      expect(OtpValidator.validate('12345a'), 'Verification code must contain digits only.');
    });

    test('accepts valid 6 digit code', () {
      expect(OtpValidator.validate('123456'), isNull);
      expect(OtpValidator.isValid('654321'), isTrue);
    });
  });

  group('PincodeValidator Tests', () {
    test('rejects empty input', () {
      expect(PincodeValidator.validate(''), 'Please enter your 6-digit pincode.');
    });

    test('rejects non-6-digit input', () {
      expect(PincodeValidator.validate('53000'), 'Enter a valid 6-digit pincode.');
      expect(PincodeValidator.validate('5300012'), 'Enter a valid 6-digit pincode.');
      expect(PincodeValidator.validate('53000A'), 'Enter a valid 6-digit pincode.');
    });

    test('accepts valid 6 digit pincode', () {
      expect(PincodeValidator.validate('530001'), isNull);
      expect(PincodeValidator.isValid('530001'), isTrue);
    });
  });
}

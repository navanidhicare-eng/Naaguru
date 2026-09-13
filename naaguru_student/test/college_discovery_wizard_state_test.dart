import 'package:flutter_test/flutter_test.dart';
import 'package:naaguru_student/features/student/data/catalog_api_client.dart';
import 'package:naaguru_student/features/college/presentation/college_discovery_wizard_state.dart';

void main() {
  group('CollegeDiscoveryWizardState Unit Tests', () {
    final locState = CatalogLocation(id: 'state-ap', type: 'STATE', nameEn: 'Andhra Pradesh', nameTe: 'ఆంధ్రప్రదేశ్');
    final locDistrict = CatalogLocation(id: 'dist-gnt', type: 'DISTRICT', nameEn: 'Guntur', nameTe: 'గుంటూరు', parentId: 'state-ap');
    final locMandal = CatalogLocation(id: 'mnd-ten', type: 'MANDAL', nameEn: 'Tenali', nameTe: 'తెనాలి', parentId: 'dist-gnt');
    final locLocality = CatalogLocation(id: 'loc-mor', type: 'LOCALITY', nameEn: 'Morrispet', nameTe: 'మోరిస్‌పేట్', parentId: 'mnd-ten');

    test('Initial state is unconfigured and invalid', () {
      final state = CollegeDiscoveryWizardState();
      expect(state.pathwayCode, isNull);
      expect(state.programCode, isNull);
      expect(state.preferredLocationId, isNull);
      expect(state.isStep3Valid, isFalse);
      expect(state.isAllValid, isFalse);
    });

    test('Budget choices correctly map to maxAnnualFee', () {
      final state = CollegeDiscoveryWizardState();

      state.selectBudget('UNDER_50K');
      expect(state.maxAnnualFee, 50000);

      state.selectBudget('UP_TO_1L');
      expect(state.maxAnnualFee, 100000);

      state.selectBudget('OVER_1L');
      expect(state.maxAnnualFee, isNull);

      state.selectBudget('NOT_SURE');
      expect(state.maxAnnualFee, isNull);
    });

    test('Cascading location selection and resets work accurately', () {
      final state = CollegeDiscoveryWizardState();

      // Set all 4 levels
      state.selectPreferredState(locState);
      state.selectPreferredDistrict(locDistrict);
      state.selectPreferredMandal(locMandal);
      state.selectPreferredLocality(locLocality);

      expect(state.preferredLocationId, 'loc-mor');
      expect(state.preferredLocality?.nameEn, 'Morrispet');
      expect(state.preferredMandal?.nameEn, 'Tenali');
      expect(state.preferredDistrict?.nameEn, 'Guntur');
      expect(state.preferredState?.nameEn, 'Andhra Pradesh');

      // Change mandal -> locality should reset
      final locMandal2 = CatalogLocation(id: 'mnd-bpt', type: 'MANDAL', nameEn: 'Bapatla', parentId: 'dist-gnt');
      state.selectPreferredMandal(locMandal2);
      expect(state.preferredMandal?.nameEn, 'Bapatla');
      expect(state.preferredLocality, isNull);
      expect(state.preferredLocationId, isNull);

      // Restore locality, then change district -> mandal and locality must reset
      state.selectPreferredLocality(locLocality);
      final locDistrict2 = CatalogLocation(id: 'dist-kri', type: 'DISTRICT', nameEn: 'Krishna', parentId: 'state-ap');
      state.selectPreferredDistrict(locDistrict2);
      expect(state.preferredDistrict?.nameEn, 'Krishna');
      expect(state.preferredMandal, isNull);
      expect(state.preferredLocality, isNull);
      expect(state.preferredLocationId, isNull);

      // Set mandal and locality again, then change state -> district, mandal, locality must reset
      state.selectPreferredDistrict(locDistrict);
      state.selectPreferredMandal(locMandal);
      state.selectPreferredLocality(locLocality);
      final locState2 = CatalogLocation(id: 'state-ts', type: 'STATE', nameEn: 'Telangana');
      state.selectPreferredState(locState2);
      expect(state.preferredState?.nameEn, 'Telangana');
      expect(state.preferredDistrict, isNull);
      expect(state.preferredMandal, isNull);
      expect(state.preferredLocality, isNull);
      expect(state.preferredLocationId, isNull);
    });

    test('Validation requirements for Step 3 and Complete intent', () {
      final state = CollegeDiscoveryWizardState();
      state.selectPathway(code: 'INTERMEDIATE', nameEn: 'Intermediate');
      state.selectProgram(code: 'MPC', nameEn: 'MPC');

      // Step 3 incomplete without location, hostel, and budget
      expect(state.isStep3Valid, isFalse);
      expect(state.isAllValid, isFalse);

      state.selectPreferredState(locState);
      state.selectPreferredDistrict(locDistrict);
      state.selectPreferredMandal(locMandal);
      state.selectPreferredLocality(locLocality);
      expect(state.isStep3Valid, isFalse);

      state.selectHostel('YES');
      expect(state.isStep3Valid, isFalse);

      state.selectBudget('UP_TO_1L');
      expect(state.isStep3Valid, true);
      expect(state.isAllValid, true);
    });

    test('Canonical preferredLocationId is derived from locality only', () {
      final state = CollegeDiscoveryWizardState();
      state.selectPathway(code: 'INTERMEDIATE', nameEn: 'Intermediate');
      state.selectProgram(code: 'MPC', nameEn: 'MPC');
      state.selectPreferredState(locState);
      state.selectPreferredDistrict(locDistrict);
      state.selectPreferredMandal(locMandal);
      state.selectPreferredLocality(locLocality);
      state.selectHostel('YES');
      state.selectBudget('UNDER_50K');

      expect(state.preferredLocationId, 'loc-mor');
      expect(state.preferredLocalityId, 'loc-mor');
      expect(state.requiresHostel, isTrue);
      expect(state.maxAnnualFee, 50000);
    });
  });
}

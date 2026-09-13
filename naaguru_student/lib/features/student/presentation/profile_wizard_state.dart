import 'package:flutter/foundation.dart';
import 'package:naaguru_student/features/student/data/catalog_api_client.dart';

/// Holds the in-progress state for the multi-screen student profile wizard.
///
/// This object is created once when the mandatory profile flow begins and
/// passed through each screen. It is NOT backed by persistent storage —
/// it lives only for the duration of the wizard session.
///
/// Screens that compose the wizard:
///   Screen 1 — About You     (fullName, schoolId)
///   Screen 2 — Where You Live (state, district, mandal, locality, pincode, landmark)
///   Screen 3 — Review & Save  (calls backend POST/PATCH, then markProfileComplete)
///
/// The backend submission is deferred to Screen 3. No screen calls
/// markProfileComplete() directly. ProfileGate is only unblocked
/// after the final confirmed save.
class ProfileWizardState extends ChangeNotifier {
  // ── Screen 1 — Identity ───────────────────────────────────────────────────
  String fullName = '';
  String? gender;

  // ── Screen 1 — School Location hierarchy (independent from residence) ─────
  CatalogLocation? schoolState;
  CatalogLocation? schoolDistrict;
  CatalogLocation? schoolMandal;
  CatalogLocation? schoolLocality;
  CatalogSchool? selectedSchool;

  String? get schoolStateId => schoolState?.id;
  String? get schoolDistrictId => schoolDistrict?.id;
  String? get schoolMandalId => schoolMandal?.id;
  String? get schoolLocalityId => schoolLocality?.id;
  String? get selectedSchoolId => selectedSchool?.id;

  // ── Screen 2 — Residence Location hierarchy (independent from school) ─────
  CatalogLocation? selectedState;
  CatalogLocation? selectedDistrict;
  CatalogLocation? selectedMandal;
  CatalogLocation? selectedLocality;

  /// The final backend residenceLocationId is the ID of the lowest selected
  /// level (LOCALITY if present, otherwise MANDAL, etc.).
  String? get residenceLocationId => selectedLocality?.id;

  String pincode = '';
  String landmark = '';

  // ── Screen 1 mutations ────────────────────────────────────────────────────

  void updateFullName(String value) {
    fullName = value;
    notifyListeners();
  }

  void updateGender(String? value) {
    gender = value;
    notifyListeners();
  }

  /// Select school state and reset all dependent school selections.
  void selectSchoolState(CatalogLocation state) {
    schoolState = state;
    schoolDistrict = null;
    schoolMandal = null;
    schoolLocality = null;
    selectedSchool = null;
    notifyListeners();
  }

  /// Select school district and reset mandal + locality + school.
  void selectSchoolDistrict(CatalogLocation district) {
    schoolDistrict = district;
    schoolMandal = null;
    schoolLocality = null;
    selectedSchool = null;
    notifyListeners();
  }

  /// Select school mandal and reset locality + school.
  void selectSchoolMandal(CatalogLocation mandal) {
    schoolMandal = mandal;
    schoolLocality = null;
    selectedSchool = null;
    notifyListeners();
  }

  /// Select school locality and reset school.
  void selectSchoolLocality(CatalogLocation locality) {
    schoolLocality = locality;
    selectedSchool = null;
    notifyListeners();
  }

  void selectSchool(CatalogSchool school) {
    selectedSchool = school;
    notifyListeners();
  }

  void clearSchool() {
    selectedSchool = null;
    notifyListeners();
  }

  // ── Screen 2 — Residence cascading location mutations ─────────────────────

  /// Select residence state and reset all dependent residence selections.
  void selectState(CatalogLocation state) {
    selectedState = state;
    selectedDistrict = null;
    selectedMandal = null;
    selectedLocality = null;
    notifyListeners();
  }

  /// Select residence district and reset residence mandal + locality.
  void selectDistrict(CatalogLocation district) {
    selectedDistrict = district;
    selectedMandal = null;
    selectedLocality = null;
    notifyListeners();
  }

  /// Select residence mandal and reset residence locality.
  void selectMandal(CatalogLocation mandal) {
    selectedMandal = mandal;
    selectedLocality = null;
    notifyListeners();
  }

  void selectLocality(CatalogLocation locality) {
    selectedLocality = locality;
    notifyListeners();
  }

  void updatePincode(String value) {
    pincode = value;
    notifyListeners();
  }

  void updateLandmark(String value) {
    landmark = value;
    notifyListeners();
  }

  // ── Validation predicates ─────────────────────────────────────────────────

  /// Returns true when Screen 1 has the minimum required data to proceed:
  /// Full Name + Gender + School State + School District + School Mandal +
  /// School Locality + Selected School.
  bool get screen1Valid =>
      fullName.trim().isNotEmpty &&
      gender != null &&
      schoolState != null &&
      schoolDistrict != null &&
      schoolMandal != null &&
      schoolLocality != null &&
      selectedSchool != null;

  static final _pincodeRegex = RegExp(r'^[1-9][0-9]{5}$');

  bool get pincodeValid => _pincodeRegex.hasMatch(pincode.trim());

  /// Returns true when Screen 2 has the minimum required data to proceed.
  bool get screen2Valid =>
      selectedState != null &&
      selectedDistrict != null &&
      selectedMandal != null &&
      selectedLocality != null &&
      pincodeValid;
}

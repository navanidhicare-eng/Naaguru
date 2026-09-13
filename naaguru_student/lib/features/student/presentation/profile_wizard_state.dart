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
  // ── Screen 1 ──────────────────────────────────────────────────────────────
  String fullName = '';
  String? gender;
  CatalogSchool? selectedSchool;

  // ── Screen 2 — Cascading location hierarchy ────────────────────────────────
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

  void selectSchool(CatalogSchool school) {
    selectedSchool = school;
    notifyListeners();
  }

  void clearSchool() {
    selectedSchool = null;
    notifyListeners();
  }

  // ── Screen 2 — Cascading location mutations ───────────────────────────────

  /// Select a state and reset all dependent selections.
  void selectState(CatalogLocation state) {
    selectedState = state;
    selectedDistrict = null;
    selectedMandal = null;
    selectedLocality = null;
    notifyListeners();
  }

  /// Select a district and reset mandal + locality.
  void selectDistrict(CatalogLocation district) {
    selectedDistrict = district;
    selectedMandal = null;
    selectedLocality = null;
    notifyListeners();
  }

  /// Select a mandal and reset locality.
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

  /// Returns true when Screen 1 has the minimum required data to proceed.
  bool get screen1Valid =>
      fullName.trim().isNotEmpty && gender != null && selectedSchool != null;

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

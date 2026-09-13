import 'package:flutter/foundation.dart';
import 'package:naaguru_student/features/student/data/catalog_api_client.dart';

/// Holds in-progress wizard state for the multi-step College Discovery flow:
///   Step 1 — Pathway (Intermediate, Polytechnic, ITI, Defence)
///   Step 2 — Stream / Program (MPC, BiPC, MEC, CEC, etc.)
///   Step 3 — Preferred Study Area (State → District → Mandal → Locality) + Hostel + Budget
///   Step 4 — Review & Confirm (saves student college intent)
///
/// Note: Preferred Study Location is strictly decoupled from Student Residence
/// Location (Profile Screen 2) and School Location (Profile Screen 1).
class CollegeDiscoveryWizardState extends ChangeNotifier {
  // ── Step 1: Pathway ────────────────────────────────────────────────────────
  String? pathwayCode;
  String? pathwayNameEn;
  String? pathwayNameTe;

  // ── Step 2: Stream / Program ───────────────────────────────────────────────
  String? programCode;
  String? programNameEn;
  String? programNameTe;
  List<Map<String, dynamic>> availablePrograms = [];

  // ── Step 3: Preferred Study Location Hierarchy ─────────────────────────────
  CatalogLocation? preferredState;
  CatalogLocation? preferredDistrict;
  CatalogLocation? preferredMandal;
  CatalogLocation? preferredLocality;

  String? get preferredStateId => preferredState?.id;
  String? get preferredDistrictId => preferredDistrict?.id;
  String? get preferredMandalId => preferredMandal?.id;
  String? get preferredLocalityId => preferredLocality?.id;

  String? _preferredLocationIdOverride;

  /// Canonical location ID persisted to the backend college intent.
  String? get preferredLocationId => preferredLocality?.id ?? _preferredLocationIdOverride;
  set preferredLocationId(String? val) {
    _preferredLocationIdOverride = val;
  }

  // ── Step 3: Hostel & Budget ───────────────────────────────────────────────
  /// 'YES' | 'NO' | 'EITHER'
  String? hostel;

  /// 'UNDER_50K' | 'UP_TO_1L' | 'OVER_1L' | 'NOT_SURE'
  String? budget;

  // ── Version & Editability ──────────────────────────────────────────────────
  /// Current persisted version number from backend (null = unsaved, 1 = initial, 2 = revised).
  int? versionNumber;

  /// Whether the student is allowed to edit preferences.
  /// Self-service allows maximum 2 versions (Version 1 -> initial, Version 2 -> one revision).
  bool get canEditPreferences => versionNumber == null || versionNumber! < 2;

  // ── Step 1 & 2 Mutations ──────────────────────────────────────────────────

  void selectPathway({
    required String code,
    String? nameEn,
    String? nameTe,
    List<Map<String, dynamic>>? programs,
  }) {
    if (pathwayCode != code) {
      // If pathway changes, reset selected stream
      programCode = null;
      programNameEn = null;
      programNameTe = null;
    }
    pathwayCode = code;
    pathwayNameEn = nameEn;
    pathwayNameTe = nameTe;
    if (programs != null) {
      availablePrograms = programs;
    }
    notifyListeners();
  }

  void selectProgram({
    required String code,
    String? nameEn,
    String? nameTe,
  }) {
    programCode = code;
    programNameEn = nameEn;
    programNameTe = nameTe;
    notifyListeners();
  }

  // ── Step 3: Cascading Location Mutations ──────────────────────────────────

  /// Selecting state resets district, mandal, and locality.
  void selectPreferredState(CatalogLocation state) {
    preferredState = state;
    preferredDistrict = null;
    preferredMandal = null;
    preferredLocality = null;
    notifyListeners();
  }

  /// Selecting district resets mandal and locality.
  void selectPreferredDistrict(CatalogLocation district) {
    preferredDistrict = district;
    preferredMandal = null;
    preferredLocality = null;
    notifyListeners();
  }

  /// Selecting mandal resets locality.
  void selectPreferredMandal(CatalogLocation mandal) {
    preferredMandal = mandal;
    preferredLocality = null;
    notifyListeners();
  }

  /// Selecting locality sets preferredLocality.
  void selectPreferredLocality(CatalogLocation locality) {
    preferredLocality = locality;
    notifyListeners();
  }

  // ── Step 3: Hostel & Budget Mutations ─────────────────────────────────────

  void selectHostel(String value) {
    hostel = value;
    notifyListeners();
  }

  void selectBudget(String value) {
    budget = value;
    notifyListeners();
  }

  // ── Derived Intent Fields ─────────────────────────────────────────────────

  bool get requiresHostel => hostel == 'YES';

  /// Maps selected budget UI option to backend maxAnnualFee:
  ///   UNDER_50K → 50000
  ///   UP_TO_1L  → 100000
  ///   OVER_1L   → null (no ceiling)
  ///   NOT_SURE  → null (unconstrained)
  int? get maxAnnualFee {
    switch (budget) {
      case 'UNDER_50K':
        return 50000;
      case 'UP_TO_1L':
        return 100000;
      case 'OVER_1L':
      case 'NOT_SURE':
      default:
        return null;
    }
  }

  // ── Validation Predicates ─────────────────────────────────────────────────

  bool get isLocationValid =>
      preferredState != null &&
      preferredDistrict != null &&
      preferredMandal != null &&
      preferredLocality != null;

  bool get isStep3Valid =>
      isLocationValid && hostel != null && budget != null;

  bool get isAllValid =>
      pathwayCode != null &&
      programCode != null &&
      isStep3Valid;
}

# Graph Report - Naaguru  (2026-09-13)

## Corpus Check
- 247 files · ~477,599 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1860 nodes · 3114 edges · 111 communities (76 shown, 17 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 63 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5a397672`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- login_screen.dart
- Windows Desktop Platform Runner
- College
- Recommendation
- Student
- Apple Platform Runner
- Linux Platform Runner
- Mobile UI Design Tokens
- profile_screen1_about_you.dart
- assessment/index.ts
- api_client.dart
- student_profile_screen.dart
- AssessmentAttempt
- location_picker_sheet.dart
- package.json
- assessment_question_screen.dart
- auth/middleware.ts
- home_screen.dart
- TypeScript Compiler Options
- auth_service.dart
- catalog/domain/models.ts
- package:naaguru_student/core/theme.dart
- inputs.dart
- package:flutter/material.dart
- main.dart
- profile_screen2_where_you_live.dart
- Production Runtime Dependencies
- package:naaguru_student/core/api_client.dart
- Windows Native Windowing
- State
- devDependencies
- NPM Script Workflows
- Web App Manifest
- College Admin Login UI
- college_preferences_screen.dart
- profile_wizard_state.dart
- college_review_and_confirm_screen.dart
- profile_screen3_review.dart
- college_location_preferences_screen.dart
- home_screen_test.dart
- college_discovery_wizard_state.dart
- Next.js Web Layout
- profile_screen2_where_you_live_test.dart
- StudentCollegeIntent
- StudentApiClient
- college_list_screen.dart
- package:naaguru_student/features/student/data/student_api_client.dart
- college_detail_screen.dart
- Android Native Activity
- ESLint Linting Rules
- AI Agent Instructions
- Mobile Design Guidelines
- Repository Overview Docs
- Node Project Manifest
- Flutter Package Manifest
- Dart Nullable Types
- results_screen.dart
- MaterialPageRoute
- errors/index.ts
- src/middleware.ts
- naaguru_student
- rules/graphify.md
- workflows/graphify.md
- LaunchImage.imageset/README.md
- profile_screen3_review_test.dart
- auth/index.ts
- DrizzleAssessmentRepository.ts
- college_stream_selection_screen.dart
- DrizzleCatalogRepository.ts
- zod
- drizzle-orm
- package:naaguru_student/features/student/data/catalog_api_client.dart
- college_review_and_confirm_screen_test.dart
- catalog_api_client.dart
- language_toggle.dart
- feedback.dart
- AppError
- students/me/route.ts
- auth/schema.ts
- CollegeApiClient
- college_discovery_intro_screen.dart
- college-login/route.ts
- config.dart
- config/index.ts
- buttons.dart
- Question
- assessment_api_client.dart
- StatelessWidget
- explore_paths_screen.dart
- _buildAssessmentPillar
- _buildYouView
- reset-db.ts
- seed-admin.ts

## God Nodes (most connected - your core abstractions)
1. `AppError` - 55 edges
2. `College` - 32 edges
3. `AssessmentAttempt` - 31 edges
4. `Student` - 30 edges
5. `Win32Window` - 24 edges
6. `StudentApiClient` - 22 edges
7. `drizzle-orm` - 19 edges
8. `AssessmentVersion` - 18 edges
9. `Recommendation` - 17 edges
10. `CatalogApiClient` - 16 edges

## Surprising Connections (you probably didn't know these)
- `MockStudentApiClientForPref` --inherits--> `StudentApiClient`  [EXTRACTED]
  naaguru_student/test/college_preferences_screen_test.dart → naaguru_student/lib/features/student/data/student_api_client.dart
- `wWinMain()` --calls--> `CreateAndAttachConsole()`  [INFERRED]
  naaguru_student/windows/runner/main.cpp → naaguru_student/windows/runner/utils.cpp
- `Win32Window::Win32Window()` --calls--> `Destroy`  [INFERRED]
  naaguru_student/windows/runner/win32_window.cpp → naaguru_student/windows/runner/win32_window.h
- `StreamProps` --references--> `StreamCode`  [EXTRACTED]
  src/modules/career/domain/models.ts → src/shared/domain/StreamCode.ts
- `MockApiClient` --inherits--> `ApiClient`  [EXTRACTED]
  naaguru_student/test/assessment_api_client_test.dart → naaguru_student/lib/core/api_client.dart

## Import Cycles
- None detected.

## Communities (111 total, 17 thin omitted)

### Community 0 - "login_screen.dart"
Cohesion: 0.10
Nodes (20): authService, build, _buildMobileNumberState, _buildOtpBoxes, _buildOtpState, createState, dispose, _errorMessage (+12 more)

### Community 1 - "Windows Desktop Platform Runner"
Cohesion: 0.05
Nodes (57): RegisterPlugins(), DartProject, HWND, LPARAM, LRESULT, UINT, WPARAM, FlutterWindow (+49 more)

### Community 2 - "College"
Cohesion: 0.06
Nodes (23): GET(), GET(), CollegeStreamOfferingDto, PublicCollegeDto, CollegeUseCases, CollegeSearchCriteria, ICollegeRepository, College (+15 more)

### Community 3 - "Recommendation"
Cohesion: 0.07
Nodes (14): RecommendationDto, CareerUseCases, ICareerRepository, CareerRule, CareerRuleProps, RankedResult, Recommendation, RecommendationProps (+6 more)

### Community 4 - "Student"
Cohesion: 0.08
Nodes (13): CreateStudentProfileDto, StudentProfileDto, UpdateStudentProfileDto, StudentUseCases, IStudentRepository, Student, StudentGender, StudentProps (+5 more)

### Community 5 - "Apple Platform Runner"
Cohesion: 0.07
Nodes (23): Any, Cocoa, Flutter, flutter_secure_storage_macos, FlutterAppDelegate, FlutterMacOS, FlutterPluginRegistry, FlutterViewController (+15 more)

### Community 6 - "Linux Platform Runner"
Cohesion: 0.09
Nodes (22): FlPluginRegistry, FlView, GApplication, gboolean, gchar, GObject, GtkApplication, MyApplicationClass (+14 more)

### Community 7 - "Mobile UI Design Tokens"
Cohesion: 0.07
Nodes (26): accent, background, borderRadius, error, muted, NaaguruTheme, primary, primaryDark (+18 more)

### Community 8 - "profile_screen1_about_you.dart"
Cohesion: 0.03
Nodes (62): authService, build, _buildAssuranceCard, _buildBottomCta, _buildGenderField, _buildGenderOption, _buildHeader, _buildLangButton (+54 more)

### Community 9 - "assessment/index.ts"
Cohesion: 0.14
Nodes (11): AssessmentAttemptDto, AssessmentResultDto, AssessmentVersionDto, AttemptAnswerDto, QuestionDto, QuestionOptionDto, AssessmentUseCases, IRulesetProvider (+3 more)

### Community 10 - "api_client.dart"
Cohesion: 0.09
Nodes (21): Client, dart:async, _accessToken, clearTokens, _decodeResponse, _headers, _httpClient, isAuthenticated (+13 more)

### Community 11 - "student_profile_screen.dart"
Cohesion: 0.08
Nodes (26): FormState, _authPhone, authService, build, createState, dispose, _formKey, _guardianNameController (+18 more)

### Community 13 - "location_picker_sheet.dart"
Cohesion: 0.08
Nodes (24): _all, build, _buildContent, _C, createState, current, _debounce, dispose (+16 more)

### Community 14 - "package.json"
Cohesion: 0.09
Nodes (20): name, private, version, dotenv, drizzle-kit, eslint, eslint-config-next, material-symbols (+12 more)

### Community 15 - "assessment_question_screen.dart"
Cohesion: 0.06
Nodes (35): AnimationController, assessmentApiClient, AssessmentQuestionScreen, _AssessmentQuestionScreenState, build, _buildCompletionScreen, _buildResultScreen, _buildTransitionScreen (+27 more)

### Community 16 - "auth/middleware.ts"
Cohesion: 0.15
Nodes (18): GET, answerSchema, PATCH, GET, POST, GET, GET, GET (+10 more)

### Community 17 - "home_screen.dart"
Cohesion: 0.06
Nodes (32): assessmentApiClient, authService, build, _buildAppBar, _buildCollegePillar, _buildCollegePreferencesCard, _buildExploreTeaser, _buildGreeting (+24 more)

### Community 18 - "TypeScript Compiler Options"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 19 - "auth_service.dart"
Cohesion: 0.10
Nodes (20): bool get, FlutterSecureStorage, _accessTokenKey, _apiClient, authStateNotifier, _bindApiClientCallbacks, _fetchAndUpdateProfileState, isAuthenticated (+12 more)

### Community 20 - "catalog/domain/models.ts"
Cohesion: 0.08
Nodes (19): LocationDto, PathwayDto, ProgramDto, SchoolDto, ServiceAreaDto, CatalogUseCases, CatalogStatus, Location (+11 more)

### Community 21 - "package:naaguru_student/core/theme.dart"
Cohesion: 0.10
Nodes (18): Color, IconData, createState, icon, iconBg, iconColor, _isTelugu, subtitle (+10 more)

### Community 22 - "inputs.dart"
Cohesion: 0.14
Nodes (13): build, controller, enabled, errorText, hintText, items, keyboardType, label (+5 more)

### Community 23 - "package:flutter/material.dart"
Cohesion: 0.09
Nodes (23): ApiClient, main, MockApiClient, patch, post, buildTestWidget, main, buildTestWidget (+15 more)

### Community 24 - "main.dart"
Cohesion: 0.08
Nodes (24): Future, AuthService, apiClient, assessmentApiClient, authService, build, catalogApiClient, collegeApiClient (+16 more)

### Community 25 - "profile_screen2_where_you_live.dart"
Cohesion: 0.05
Nodes (44): authService, build, _buildBottomCta, _buildHeader, _buildLandmarkField, _buildLanguageToggle, _buildLocalityRow, _buildLocationBlock (+36 more)

### Community 26 - "Production Runtime Dependencies"
Cohesion: 0.14
Nodes (14): dependencies, drizzle-orm, jose, material-symbols, next, postcss, postgres, react (+6 more)

### Community 27 - "package:naaguru_student/core/api_client.dart"
Cohesion: 0.08
Nodes (32): dart:convert, Exception, ApiException, main, _completeProfile, _incompleteProfileMissingSchool, main, _makeClient (+24 more)

### Community 28 - "Windows Native Windowing"
Cohesion: 0.24
Nodes (9): _In_, _In_opt_, wWinMain(), string, wchar_t, CreateAndAttachConsole(), GetCommandLineArguments(), Utf8FromUtf16() (+1 more)

### Community 29 - "State"
Cohesion: 0.20
Nodes (14): AssessmentIntroScreen, _AssessmentIntroScreenState, LoginScreen, _LoginScreenState, CollegePreferencesScreen, _CollegePreferencesScreenState, HomeScreen, _HomeScreenState (+6 more)

### Community 30 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, dotenv, drizzle-kit, eslint, eslint-config-next, @tailwindcss/cli, @types/jest, @types/node (+5 more)

### Community 31 - "NPM Script Workflows"
Cohesion: 0.17
Nodes (12): scripts, build, ci, db:generate, db:migrate, db:push, db:verify, dev (+4 more)

### Community 32 - "Web App Manifest"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, name, orientation, prefer_related_applications, short_name (+2 more)

### Community 33 - "College Admin Login UI"
Cohesion: 0.20
Nodes (4): react, metadata, TabKey, CollegeAdminLoginForm()

### Community 34 - "college_preferences_screen.dart"
Cohesion: 0.09
Nodes (21): build, _buildMentorTip, _buildPathwayCards, _buildProgressIndicator, _buildProgressSegment, catalogApiClient, _checkExistingIntent, collegeApiClient (+13 more)

### Community 35 - "profile_wizard_state.dart"
Cohesion: 0.05
Nodes (38): clearSchool, fullName, gender, landmark, pincode, _pincodeRegex, pincodeValid, residenceLocationId (+30 more)

### Community 36 - "college_review_and_confirm_screen.dart"
Cohesion: 0.04
Nodes (45): build, _buildBottomCta, _buildBudgetCard, _buildErrorBanner, _buildHeader, _buildHostelCard, _buildInfoReassuranceCard, _buildLangButton (+37 more)

### Community 37 - "profile_screen3_review.dart"
Cohesion: 0.06
Nodes (34): authService, build, _buildBottomCta, _buildEditButton, _buildErrorMsg, _buildHeader, _buildLangButton, _buildLocationSummary (+26 more)

### Community 38 - "college_location_preferences_screen.dart"
Cohesion: 0.06
Nodes (33): class, build, _buildBudgetOption, _buildBudgetSelection, _buildHostelOption, _buildHostelSelection, _buildLocationSection, _buildProgressIndicator (+25 more)

### Community 39 - "home_screen_test.dart"
Cohesion: 0.07
Nodes (29): Map, MockApiClient, client, lastGetPath, main, mockApi, responseToReturn, getCurrentCollegeIntent (+21 more)

### Community 40 - "college_discovery_wizard_state.dart"
Cohesion: 0.06
Nodes (33): availablePrograms, budget, canEditPreferences, hostel, isAllValid, isLocationValid, isStep3Valid, pathwayCode (+25 more)

### Community 41 - "Next.js Web Layout"
Cohesion: 0.29
Nodes (4): nextConfig, next, inter, metadata

### Community 42 - "profile_screen2_where_you_live_test.dart"
Cohesion: 0.08
Nodes (26): ElevatedButton, MockClient, CatalogApiClient, FakeCatalogApiClient, getLocations, getProfile, getSchools, lastFetchedLocationId (+18 more)

### Community 43 - "StudentCollegeIntent"
Cohesion: 0.18
Nodes (6): IntentRequestDto, IntentResponseDto, StudentIntentUseCases, IStudentIntentRepository, StudentCollegeIntent, DrizzleStudentIntentRepository

### Community 44 - "StudentApiClient"
Cohesion: 0.14
Nodes (13): _apiClient, createProfile, getCurrentCollegeIntent, getMe, getProfile, StudentApiClient, submitCollegeIntent, updateProfile (+5 more)

### Community 45 - "college_list_screen.dart"
Cohesion: 0.10
Nodes (20): int?, build, _buildBody, _buildFilterBadge, collegeApiClient, CollegeListScreen, _CollegeListScreenState, _colleges (+12 more)

### Community 46 - "package:naaguru_student/features/student/data/student_api_client.dart"
Cohesion: 0.14
Nodes (13): authService, build, catalogApiClient, child, ProfileGate, studentApiClient, ProfileState, main (+5 more)

### Community 47 - "college_detail_screen.dart"
Cohesion: 0.12
Nodes (16): build, _buildHostelBadge, _buildSectionCard, _college, collegeApiClient, CollegeDetailScreen, _CollegeDetailScreenState, collegeId (+8 more)

### Community 65 - "results_screen.dart"
Cohesion: 0.13
Nodes (15): assessmentApiClient, build, createState, _errorMessage, _getStreamDescription, initialRecommendation, initialResult, initState (+7 more)

### Community 66 - "MaterialPageRoute"
Cohesion: 0.14
Nodes (14): MaterialPageRoute, _buildCollegeCard, _onContinue, _onContinue, _editPathway, _editStep3, _editStream, _onContinue (+6 more)

### Community 67 - "errors/index.ts"
Cohesion: 0.12
Nodes (6): AssessmentAttemptProps, AssessmentVersion, AssessmentVersionProps, QuestionOption, ScoringEngine, ScoringResult

### Community 81 - "profile_screen3_review_test.dart"
Cohesion: 0.07
Nodes (28): MockAuthService, MockCatalogApiClient, authService, capturedEducationStage, catalogApiClient, createProfile, createProfileCalled, createWidgetUnderTest (+20 more)

### Community 82 - "auth/index.ts"
Cohesion: 0.17
Nodes (11): logoutSchema, POST, refreshSchema, POST(), requestOtpSchema, POST(), verifyOtpSchema, authUseCases (+3 more)

### Community 83 - "DrizzleAssessmentRepository.ts"
Cohesion: 0.20
Nodes (16): loadJson(), seed(), AttemptAnswerProps, QuestionOptionProps, QuestionProps, assessmentAttemptsTable, assessmentResultsTable, assessmentVersionQuestionsTable (+8 more)

### Community 84 - "college_stream_selection_screen.dart"
Cohesion: 0.10
Nodes (21): ChangeNotifier, CollegeDiscoveryWizardState, build, _buildProgressIndicator, _buildProgressSegment, catalogApiClient, collegeApiClient, CollegeStreamSelectionScreen (+13 more)

### Community 85 - "DrizzleCatalogRepository.ts"
Cohesion: 0.12
Nodes (11): postgres, crackHash(), run(), crackHash(), run(), catalogStatusEnum, educationPathwaysTable, educationProgramsTable (+3 more)

### Community 86 - "zod"
Cohesion: 0.18
Nodes (9): zod, ApiErrorResponse, handleApiError(), LogContext, logger, maskSensitiveData(), SENSITIVE_KEYS, createStudentProfileSchema (+1 more)

### Community 87 - "drizzle-orm"
Cohesion: 0.14
Nodes (12): drizzle-orm, jose, vitest, runTest(), DEV_COLLEGES, collegesTable, collegeStreamOfferingsTable, studentCollegeIntentsTable (+4 more)

### Community 88 - "package:naaguru_student/features/student/data/catalog_api_client.dart"
Cohesion: 0.18
Nodes (10): FakeCollegeApiClient, main, fakeCatalogApi, fakeCollegeApi, fakeStudentApi, main, noSuchMethod, package:naaguru_student/features/college/presentation/college_discovery_wizard_state.dart (+2 more)

### Community 89 - "college_review_and_confirm_screen_test.dart"
Cohesion: 0.11
Nodes (17): MockCollegeApiClient, MockStudentApiClient, buildScreen, collegeApiClient, failGetIntent, failStatusCode, getCurrentCollegeIntent, getProfile (+9 more)

### Community 90 - "catalog_api_client.dart"
Cohesion: 0.13
Nodes (14): _apiClient, CatalogLocation, CatalogSchool, code, displayName, fromJson, getLocations, getSchools (+6 more)

### Community 91 - "language_toggle.dart"
Cohesion: 0.20
Nodes (9): build, isSelected, isTelugu, _LanguageButton, LanguageToggle, onTap, onToggle, text (+1 more)

### Community 92 - "feedback.dart"
Cohesion: 0.22
Nodes (8): buttons.dart, build, error, message, NaaguruErrorView, NaaguruLoadingIndicator, onRetry, VoidCallback

### Community 93 - "AppError"
Cohesion: 0.17
Nodes (10): GET(), GET(), GET(), GET(), IntentStatus, StudentCollegeIntentProps, CatalogModule, catalogRepository (+2 more)

### Community 94 - "students/me/route.ts"
Cohesion: 0.30
Nodes (8): GET, POST, GET, PATCH, POST, createStudentProfileSchema, updateStudentProfileSchema, StudentModule

### Community 95 - "auth/schema.ts"
Cohesion: 0.16
Nodes (9): DevOtpProvider, IOtpProvider, ITokenService, otpRequestsTable, sessionsTable, userRoleEnum, usersTable, AuthUseCases (+1 more)

### Community 96 - "CollegeApiClient"
Cohesion: 0.18
Nodes (10): _apiClient, CollegeApiClient, getCatalogAreas, getCatalogPathways, getCollegeById, searchColleges, FakeCollegeApiClient, MockCollegeApiClient (+2 more)

### Community 97 - "college_discovery_intro_screen.dart"
Cohesion: 0.10
Nodes (18): List, build, _buildFeatureChip, catalogApiClient, collegeApiClient, isTelugu, onLanguageChanged, studentApiClient (+10 more)

### Community 98 - "college-login/route.ts"
Cohesion: 0.31
Nodes (6): server-only, hashValue(), loginSchema, POST(), getJwtSecretKey(), TokenService

### Community 99 - "config.dart"
Cohesion: 0.40
Nodes (4): AppConfig, appName, package:flutter/foundation.dart, static const String

### Community 100 - "config/index.ts"
Cohesion: 0.40
Nodes (3): env, envSchema, parsedEnv

### Community 101 - "buttons.dart"
Cohesion: 0.22
Nodes (8): build, isLoading, onPressed, PrimaryButton, SecondaryButton, TertiaryButton, text, ../theme.dart

### Community 104 - "assessment_api_client.dart"
Cohesion: 0.22
Nodes (8): _apiClient, AssessmentApiClient, getActiveAssessment, getRecommendation, getResult, saveAnswer, startOrResumeAttempt, submitAttempt

### Community 105 - "StatelessWidget"
Cohesion: 0.25
Nodes (8): NaaguruDropdownField, NaaguruTextField, _AttributeCard, CollegeDiscoveryIntroScreen, _SchoolRow, NaaguruStudentApp, _MockProfileScreen, StatelessWidget

### Community 106 - "explore_paths_screen.dart"
Cohesion: 0.29
Nodes (6): build, _buildCategoryHeader, _buildIntermediateGrid, _buildOtherPathwaysList, ExplorePathsScreen, package:naaguru_student/features/explore/presentation/path_detail_screen.dart

### Community 107 - "_buildAssessmentPillar"
Cohesion: 0.50
Nodes (4): build, _buildAssessmentPillar, Route /assessment-intro, Route /assessment-question

### Community 108 - "_buildYouView"
Cohesion: 0.67
Nodes (3): _buildYouView, _handleAvatarTap, Route /profile

## Knowledge Gaps
- **930 isolated node(s):** `eslintConfig`, `_httpClient`, `_accessToken`, `_refreshToken`, `_refreshFuture` (+925 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1142 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AppError` connect `AppError` to `College`, `errors/index.ts`, `Recommendation`, `Student`, `Question`, `assessment/index.ts`, `StudentCollegeIntent`, `auth/middleware.ts`, `catalog/domain/models.ts`, `zod`, `drizzle-orm`, `students/me/route.ts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `drizzle-orm` connect `drizzle-orm` to `College`, `college-login/route.ts`, `package.json`, `DrizzleAssessmentRepository.ts`, `DrizzleCatalogRepository.ts`, `auth/schema.ts`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `CatalogApiClient` connect `profile_screen2_where_you_live_test.dart` to `college_discovery_intro_screen.dart`, `college_preferences_screen.dart`, `college_review_and_confirm_screen.dart`, `profile_screen3_review.dart`, `college_location_preferences_screen.dart`, `profile_screen1_about_you.dart`, `package:naaguru_student/features/student/data/student_api_client.dart`, `home_screen.dart`, `college_stream_selection_screen.dart`, `main.dart`, `profile_screen2_where_you_live.dart`, `catalog_api_client.dart`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `_httpClient`, `_accessToken` to the rest of the system?**
  _930 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `login_screen.dart` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `Windows Desktop Platform Runner` be split into smaller, more focused modules?**
  _Cohesion score 0.05311676909569798 - nodes in this community are weakly interconnected._
- **Should `College` be split into smaller, more focused modules?**
  _Cohesion score 0.061018437225636525 - nodes in this community are weakly interconnected._
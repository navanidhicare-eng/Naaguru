# Graph Report - Naaguru  (2026-09-13)

## Corpus Check
- 247 files · ~475,303 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1833 nodes · 3063 edges · 107 communities (68 shown, 21 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 63 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1396238b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AuthUseCases
- Windows Desktop Platform Runner
- College
- Recommendation
- public/index.ts
- Apple Platform Runner
- Linux Platform Runner
- Mobile UI Design Tokens
- profile_screen1_about_you.dart
- IAssessmentRepository
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
- assessment_intro_screen.dart
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
- college_preferences_screen_test.dart
- college_discovery_wizard_state.dart
- Next.js Web Layout
- profile_screen2_where_you_live_test.dart
- StudentCollegeIntent
- StudentApiClient
- college_list_screen.dart
- package:naaguru_student/core/theme.dart
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
- AssessmentVersion
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
- college/domain/models.ts
- DrizzleCollegeRepository.ts
- check_otp_rows.mjs
- college_review_and_confirm_screen_test.dart
- catalog_api_client.dart
- Student
- AppError
- catalog/index.ts
- students/me/route.ts
- auth/schema.ts
- CollegeApiClient
- college_discovery_intro_screen.dart
- college-login/route.ts
- config.dart
- config/index.ts
- ProfileScreen1AboutYou
- Question
- assessment_api_client.dart
- StudentIntentUseCases
- test_verify_e2e.mjs

## God Nodes (most connected - your core abstractions)
1. `AppError` - 55 edges
2. `College` - 32 edges
3. `AssessmentAttempt` - 31 edges
4. `Student` - 30 edges
5. `Win32Window` - 24 edges
6. `StudentApiClient` - 21 edges
7. `drizzle-orm` - 19 edges
8. `AssessmentVersion` - 18 edges
9. `Recommendation` - 17 edges
10. `compilerOptions` - 16 edges

## Surprising Connections (you probably didn't know these)
- `MockStudentApiClientForPref` --inherits--> `StudentApiClient`  [EXTRACTED]
  naaguru_student/test/college_preferences_screen_test.dart → naaguru_student/lib/features/student/data/student_api_client.dart
- `wWinMain()` --calls--> `CreateAndAttachConsole()`  [INFERRED]
  naaguru_student/windows/runner/main.cpp → naaguru_student/windows/runner/utils.cpp
- `Win32Window::Win32Window()` --calls--> `Destroy`  [INFERRED]
  naaguru_student/windows/runner/win32_window.cpp → naaguru_student/windows/runner/win32_window.h
- `MockApiClient` --inherits--> `ApiClient`  [EXTRACTED]
  naaguru_student/test/assessment_api_client_test.dart → naaguru_student/lib/core/api_client.dart
- `MockApiClient` --inherits--> `ApiClient`  [EXTRACTED]
  naaguru_student/test/assessment_question_screen_test.dart → naaguru_student/lib/core/api_client.dart

## Import Cycles
- None detected.

## Communities (107 total, 21 thin omitted)

### Community 1 - "Windows Desktop Platform Runner"
Cohesion: 0.05
Nodes (57): RegisterPlugins(), DartProject, HWND, LPARAM, LRESULT, UINT, WPARAM, FlutterWindow (+49 more)

### Community 2 - "College"
Cohesion: 0.07
Nodes (6): PublicCollegeDto, CollegeUseCases, ICollegeRepository, College, CollegeStreamOffering, DrizzleCollegeRepository

### Community 3 - "Recommendation"
Cohesion: 0.07
Nodes (13): RecommendationDto, CareerUseCases, ICareerRepository, CareerRule, CareerRuleProps, RankedResult, Recommendation, RecommendationProps (+5 more)

### Community 4 - "public/index.ts"
Cohesion: 0.18
Nodes (11): CreateStudentProfileDto, StudentProfileDto, UpdateStudentProfileDto, StudentUseCases, IStudentRepository, StudentGender, StudentProps, intentRepository (+3 more)

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

### Community 9 - "IAssessmentRepository"
Cohesion: 0.16
Nodes (9): AssessmentAttemptDto, AssessmentResultDto, AssessmentVersionDto, AttemptAnswerDto, QuestionDto, QuestionOptionDto, AssessmentUseCases, IRulesetProvider (+1 more)

### Community 10 - "api_client.dart"
Cohesion: 0.09
Nodes (21): Client, dart:async, _accessToken, clearTokens, _decodeResponse, _headers, _httpClient, isAuthenticated (+13 more)

### Community 11 - "student_profile_screen.dart"
Cohesion: 0.08
Nodes (24): FormState, _authPhone, authService, build, createState, dispose, _formKey, _guardianNameController (+16 more)

### Community 13 - "location_picker_sheet.dart"
Cohesion: 0.04
Nodes (46): authService, build, _buildMobileNumberState, _buildOtpBoxes, _buildOtpState, createState, dispose, _errorMessage (+38 more)

### Community 14 - "package.json"
Cohesion: 0.09
Nodes (20): name, private, version, dotenv, drizzle-kit, eslint, eslint-config-next, material-symbols (+12 more)

### Community 15 - "assessment_question_screen.dart"
Cohesion: 0.06
Nodes (32): AnimationController, assessmentApiClient, build, _buildCompletionScreen, _buildResultScreen, _buildTransitionScreen, _completedRecommendation, _completedResult (+24 more)

### Community 16 - "auth/middleware.ts"
Cohesion: 0.17
Nodes (17): GET, answerSchema, PATCH, GET, POST, GET, GET, AssessmentModule (+9 more)

### Community 17 - "home_screen.dart"
Cohesion: 0.07
Nodes (27): assessmentApiClient, authService, build, _buildAppBar, _buildExploreTeaser, _buildGreeting, _buildHomeView, _buildYouView (+19 more)

### Community 18 - "TypeScript Compiler Options"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 19 - "auth_service.dart"
Cohesion: 0.10
Nodes (20): bool get, FlutterSecureStorage, _accessTokenKey, _apiClient, authStateNotifier, _bindApiClientCallbacks, _fetchAndUpdateProfileState, isAuthenticated (+12 more)

### Community 20 - "catalog/domain/models.ts"
Cohesion: 0.08
Nodes (19): LocationDto, PathwayDto, ProgramDto, SchoolDto, ServiceAreaDto, CatalogUseCases, CatalogStatus, Location (+11 more)

### Community 21 - "assessment_intro_screen.dart"
Cohesion: 0.13
Nodes (14): Color, IconData, build, createState, icon, iconBg, iconColor, _isTelugu (+6 more)

### Community 22 - "inputs.dart"
Cohesion: 0.05
Nodes (45): buttons.dart, build, isLoading, onPressed, PrimaryButton, SecondaryButton, TertiaryButton, text (+37 more)

### Community 23 - "package:flutter/material.dart"
Cohesion: 0.10
Nodes (19): ApiClient, main, MockApiClient, patch, post, buildTestWidget, main, MockApiClient (+11 more)

### Community 24 - "main.dart"
Cohesion: 0.08
Nodes (24): Future, apiClient, assessmentApiClient, authService, build, catalogApiClient, collegeApiClient, createState (+16 more)

### Community 25 - "profile_screen2_where_you_live.dart"
Cohesion: 0.05
Nodes (44): authService, build, _buildBottomCta, _buildHeader, _buildLandmarkField, _buildLanguageToggle, _buildLocalityRow, _buildLocationBlock (+36 more)

### Community 26 - "Production Runtime Dependencies"
Cohesion: 0.14
Nodes (14): dependencies, drizzle-orm, jose, material-symbols, next, postcss, postgres, react (+6 more)

### Community 27 - "package:naaguru_student/core/api_client.dart"
Cohesion: 0.07
Nodes (39): dart:convert, Exception, ApiException, main, _completeProfile, _incompleteProfileMissingSchool, main, _makeClient (+31 more)

### Community 28 - "Windows Native Windowing"
Cohesion: 0.24
Nodes (9): _In_, _In_opt_, wWinMain(), string, wchar_t, CreateAndAttachConsole(), GetCommandLineArguments(), Utf8FromUtf16() (+1 more)

### Community 29 - "State"
Cohesion: 0.21
Nodes (13): AssessmentIntroScreen, _AssessmentIntroScreenState, AssessmentQuestionScreen, _AssessmentQuestionScreenState, HomeScreen, _HomeScreenState, StudentProfileScreen, _StudentProfileScreenState (+5 more)

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
Cohesion: 0.06
Nodes (32): List, build, _buildMentorTip, _buildPathwayCards, _buildProgressIndicator, _buildProgressSegment, catalogApiClient, _checkExistingIntent (+24 more)

### Community 35 - "profile_wizard_state.dart"
Cohesion: 0.05
Nodes (38): clearSchool, fullName, gender, landmark, pincode, _pincodeRegex, pincodeValid, residenceLocationId (+30 more)

### Community 36 - "college_review_and_confirm_screen.dart"
Cohesion: 0.04
Nodes (46): build, _buildBottomCta, _buildBudgetCard, _buildErrorBanner, _buildHeader, _buildHostelCard, _buildInfoReassuranceCard, _buildLangButton (+38 more)

### Community 37 - "profile_screen3_review.dart"
Cohesion: 0.06
Nodes (34): authService, build, _buildBottomCta, _buildEditButton, _buildErrorMsg, _buildHeader, _buildLangButton, _buildLocationSummary (+26 more)

### Community 38 - "college_location_preferences_screen.dart"
Cohesion: 0.06
Nodes (33): class, build, _buildBudgetOption, _buildBudgetSelection, _buildHostelOption, _buildHostelSelection, _buildLocationSection, _buildProgressIndicator (+25 more)

### Community 39 - "college_preferences_screen_test.dart"
Cohesion: 0.13
Nodes (13): Map, MockApiClient, client, lastGetPath, main, mockApi, responseToReturn, getCurrentCollegeIntent (+5 more)

### Community 40 - "college_discovery_wizard_state.dart"
Cohesion: 0.06
Nodes (32): availablePrograms, budget, canEditPreferences, hostel, isAllValid, isLocationValid, isStep3Valid, pathwayCode (+24 more)

### Community 41 - "Next.js Web Layout"
Cohesion: 0.29
Nodes (4): nextConfig, next, inter, metadata

### Community 42 - "profile_screen2_where_you_live_test.dart"
Cohesion: 0.05
Nodes (42): ElevatedButton, MockClient, authService, build, catalogApiClient, child, ProfileGate, studentApiClient (+34 more)

### Community 43 - "StudentCollegeIntent"
Cohesion: 0.18
Nodes (5): IStudentIntentRepository, IntentStatus, StudentCollegeIntent, StudentCollegeIntentProps, DrizzleStudentIntentRepository

### Community 44 - "StudentApiClient"
Cohesion: 0.15
Nodes (12): _apiClient, createProfile, getCurrentCollegeIntent, getMe, getProfile, StudentApiClient, submitCollegeIntent, updateProfile (+4 more)

### Community 45 - "college_list_screen.dart"
Cohesion: 0.10
Nodes (20): int?, build, _buildBody, _buildFilterBadge, collegeApiClient, CollegeListScreen, _CollegeListScreenState, _colleges (+12 more)

### Community 46 - "package:naaguru_student/core/theme.dart"
Cohesion: 0.20
Nodes (8): build, PathDetailScreen, pathId, title, build, JourneyPlaceholderScreen, package:naaguru_student/core/theme.dart, package:naaguru_student/core/ui/buttons.dart

### Community 47 - "college_detail_screen.dart"
Cohesion: 0.12
Nodes (16): build, _buildHostelBadge, _buildSectionCard, _college, collegeApiClient, CollegeDetailScreen, _CollegeDetailScreenState, collegeId (+8 more)

### Community 65 - "results_screen.dart"
Cohesion: 0.14
Nodes (14): assessmentApiClient, createState, _errorMessage, _getStreamDescription, initialRecommendation, initialResult, initState, _isLoading (+6 more)

### Community 66 - "MaterialPageRoute"
Cohesion: 0.12
Nodes (16): MaterialPageRoute, build, _buildCollegeCard, _onContinue, _onContinue, _onContinue, build, _buildCategoryHeader (+8 more)

### Community 81 - "profile_screen3_review_test.dart"
Cohesion: 0.07
Nodes (28): MockAuthService, MockCatalogApiClient, authService, capturedEducationStage, catalogApiClient, createProfile, createProfileCalled, createWidgetUnderTest (+20 more)

### Community 82 - "auth/index.ts"
Cohesion: 0.09
Nodes (20): zod, logoutSchema, POST, refreshSchema, POST(), requestOtpSchema, POST(), verifyOtpSchema (+12 more)

### Community 83 - "DrizzleAssessmentRepository.ts"
Cohesion: 0.20
Nodes (16): loadJson(), seed(), AttemptAnswerProps, QuestionOptionProps, QuestionProps, assessmentAttemptsTable, assessmentResultsTable, assessmentVersionQuestionsTable (+8 more)

### Community 84 - "college_stream_selection_screen.dart"
Cohesion: 0.07
Nodes (28): FakeCollegeApiClient, build, _buildProgressIndicator, _buildProgressSegment, catalogApiClient, collegeApiClient, CollegeStreamSelectionScreen, _CollegeStreamSelectionScreenState (+20 more)

### Community 85 - "DrizzleCatalogRepository.ts"
Cohesion: 0.14
Nodes (9): postgres, resetDb(), sql, catalogStatusEnum, educationPathwaysTable, educationProgramsTable, locationsTable, locationTypeEnum (+1 more)

### Community 86 - "college/domain/models.ts"
Cohesion: 0.15
Nodes (18): GET(), GET(), StreamProps, CollegeStreamOfferingDto, CollegeSearchCriteria, CollegeProps, CollegeStatus, CollegeStreamOfferingProps (+10 more)

### Community 87 - "DrizzleCollegeRepository.ts"
Cohesion: 0.19
Nodes (10): drizzle-orm, vitest, DEV_COLLEGES, collegesTable, collegeStreamOfferingsTable, studentCollegeIntentsTable, studentsTable, serviceAreasTable (+2 more)

### Community 89 - "college_review_and_confirm_screen_test.dart"
Cohesion: 0.10
Nodes (20): ChangeNotifier, MockCollegeApiClient, MockStudentApiClient, CollegeDiscoveryWizardState, ProfileWizardState, buildScreen, collegeApiClient, failGetIntent (+12 more)

### Community 90 - "catalog_api_client.dart"
Cohesion: 0.13
Nodes (14): _apiClient, CatalogLocation, CatalogSchool, code, displayName, fromJson, getLocations, getSchools (+6 more)

### Community 92 - "AppError"
Cohesion: 0.23
Nodes (8): GET, POST, AssessmentAttemptProps, AssessmentVersionProps, ScoringEngine, ScoringResult, CareerModule, AppError

### Community 93 - "catalog/index.ts"
Cohesion: 0.29
Nodes (7): GET(), GET(), GET(), GET(), CatalogModule, catalogRepository, catalogUseCases

### Community 94 - "students/me/route.ts"
Cohesion: 0.30
Nodes (8): GET, POST, GET, PATCH, POST, createStudentProfileSchema, updateStudentProfileSchema, StudentModule

### Community 95 - "auth/schema.ts"
Cohesion: 0.23
Nodes (9): server-only, hashValue(), seedAdmin(), DevOtpProvider, IOtpProvider, otpRequestsTable, sessionsTable, userRoleEnum (+1 more)

### Community 96 - "CollegeApiClient"
Cohesion: 0.20
Nodes (9): _apiClient, CollegeApiClient, getCatalogAreas, getCatalogPathways, getCollegeById, searchColleges, FakeCollegeApiClient, MockCollegeApiClient (+1 more)

### Community 97 - "college_discovery_intro_screen.dart"
Cohesion: 0.22
Nodes (8): build, _buildFeatureChip, collegeApiClient, CollegeDiscoveryIntroScreen, isTelugu, onLanguageChanged, package:flutter_svg/flutter_svg.dart, package:naaguru_student/features/explore/presentation/explore_paths_screen.dart

### Community 98 - "college-login/route.ts"
Cohesion: 0.19
Nodes (8): jose, runTest(), hashValue(), loginSchema, POST(), ITokenService, getJwtSecretKey(), TokenService

### Community 99 - "config.dart"
Cohesion: 0.40
Nodes (4): AppConfig, appName, package:flutter/foundation.dart, static const String

### Community 100 - "config/index.ts"
Cohesion: 0.40
Nodes (3): env, envSchema, parsedEnv

### Community 104 - "assessment_api_client.dart"
Cohesion: 0.22
Nodes (8): _apiClient, AssessmentApiClient, getActiveAssessment, getRecommendation, getResult, saveAnswer, startOrResumeAttempt, submitAttempt

### Community 105 - "StudentIntentUseCases"
Cohesion: 0.61
Nodes (3): IntentRequestDto, IntentResponseDto, StudentIntentUseCases

## Knowledge Gaps
- **910 isolated node(s):** `eslintConfig`, `_httpClient`, `_accessToken`, `_refreshToken`, `_refreshFuture` (+905 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1122 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AppError` connect `AppError` to `College`, `Recommendation`, `public/index.ts`, `Question`, `IAssessmentRepository`, `StudentIntentUseCases`, `StudentCollegeIntent`, `AssessmentAttempt`, `auth/middleware.ts`, `auth/index.ts`, `catalog/domain/models.ts`, `college/domain/models.ts`, `DrizzleCollegeRepository.ts`, `catalog/index.ts`, `students/me/route.ts`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `drizzle-orm` connect `DrizzleCollegeRepository.ts` to `college-login/route.ts`, `package.json`, `DrizzleAssessmentRepository.ts`, `DrizzleCatalogRepository.ts`, `auth/schema.ts`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `StudentApiClient` connect `StudentApiClient` to `college_preferences_screen.dart`, `college_review_and_confirm_screen.dart`, `profile_screen3_review.dart`, `college_location_preferences_screen.dart`, `college_preferences_screen_test.dart`, `profile_screen1_about_you.dart`, `profile_screen2_where_you_live_test.dart`, `student_profile_screen.dart`, `location_picker_sheet.dart`, `home_screen.dart`, `college_stream_selection_screen.dart`, `main.dart`, `profile_screen2_where_you_live.dart`, `package:naaguru_student/core/api_client.dart`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `_httpClient`, `_accessToken` to the rest of the system?**
  _910 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Windows Desktop Platform Runner` be split into smaller, more focused modules?**
  _Cohesion score 0.05311676909569798 - nodes in this community are weakly interconnected._
- **Should `College` be split into smaller, more focused modules?**
  _Cohesion score 0.06951219512195123 - nodes in this community are weakly interconnected._
- **Should `Recommendation` be split into smaller, more focused modules?**
  _Cohesion score 0.07184325108853411 - nodes in this community are weakly interconnected._
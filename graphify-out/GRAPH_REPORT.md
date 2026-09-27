# Graph Report - Naaguru  (2026-09-26)

## Corpus Check
- 400 files · ~676,347 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2582 nodes · 5038 edges · 149 communities (96 shown, 33 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 150 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `953b347b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- login_screen.dart
- win32_window.cpp
- CollegeUseCases.ts
- Recommendation
- Student
- GeneratedPluginRegistrant.swift
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
- AppError
- home_screen.dart
- TypeScript Compiler Options
- auth_service.dart
- DrizzleCatalogRepository
- assessment_intro_screen.dart
- inputs.dart
- main.dart
- package:flutter/material.dart
- profile_screen2_where_you_live.dart
- dependencies
- package:naaguru_student/core/api_client.dart
- Windows Native Windowing
- State
- devDependencies
- scripts
- Web App Manifest
- react
- college_preferences_screen.dart
- profile_wizard_state.dart
- college_review_and_confirm_screen.dart
- profile_screen3_review.dart
- college_location_preferences_screen.dart
- home_screen_test.dart
- college_discovery_wizard_state.dart
- app/layout.tsx
- profile_screen2_where_you_live_test.dart
- StudentCollegeIntent
- StudentApiClient
- college_list_screen.dart
- DrizzleCollegeRepository.ts
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
- CollegeUseCases
- naaguru_student
- rules/graphify.md
- workflows/graphify.md
- LaunchImage.imageset/README.md
- profile_screen3_review_test.dart
- vitest
- DrizzleAssessmentRepository.ts
- college_stream_selection_screen.dart
- postgres
- zod
- db.ts
- StaffMembership
- college_review_and_confirm_screen_test.dart
- catalog_api_client.dart
- language_toggle.dart
- StatelessWidget
- catalog/index.ts
- student/public/index.ts
- useCases.ts
- college_discovery_intro_screen.dart
- College
- Admission
- config.dart
- AdminIcons.tsx
- CollegeTestimonial
- Question
- assessment_api_client.dart
- Lead
- explore_paths_screen.dart
- EnquiryModule
- college/domain/models.ts
- CollegeAchievement
- StudentUseCases.ts
- CollegeMedia
- EnquiryUseCases.ts
- EnquiryUseCases
- schools/page.tsx
- locations.test.ts
- admin/page.tsx
- CollegeAccreditation
- LeadHistory
- drizzle-orm
- seed-dev.ts
- Branch
- Win32Window
- AssessmentUseCases.test.ts
- AssessmentUseCases.ts
- student_lead_dto.dart
- sign-in.tsx
- WeeklyMenu
- MessageHandler
- CompanyAdminHeader.tsx
- LeadershipProfile
- OnCreate
- MessageHandler
- ILeadRepository
- CollegeStreamOffering
- StudentIntentUseCases
- sidebar.js
- QuestionOption
- (authenticated)/layout.tsx
- locations/page.tsx
- branchLocationValidation.ts
- Point
- Size
- measure.js
- proxy.ts
- CollegeReviewAndConfirmScreen
- ProfileScreen1AboutYou

## God Nodes (most connected - your core abstractions)
1. `AppError` - 118 edges
2. `College` - 45 edges
3. `vitest` - 43 edges
4. `drizzle-orm` - 42 edges
5. `db` - 41 edges
6. `CollegeUseCases` - 39 edges
7. `Admission` - 33 edges
8. `AssessmentAttempt` - 32 edges
9. `Lead` - 32 edges
10. `Student` - 30 edges

## Surprising Connections (you probably didn't know these)
- `testAPI()` --references--> `CollegeModule`  [EXTRACTED]
  scripts/test-api.ts → src/modules/college/index.ts
- `MockApiClient` --inherits--> `ApiClient`  [EXTRACTED]
  naaguru_student/test/assessment_api_client_test.dart → naaguru_student/lib/core/api_client.dart
- `MockApiClient` --inherits--> `ApiClient`  [EXTRACTED]
  naaguru_student/test/assessment_question_screen_test.dart → naaguru_student/lib/core/api_client.dart
- `MockApiClient` --inherits--> `ApiClient`  [EXTRACTED]
  naaguru_student/test/results_screen_test.dart → naaguru_student/lib/core/api_client.dart
- `FakeStudentApiClient` --inherits--> `StudentApiClient`  [EXTRACTED]
  naaguru_student/test/college_location_preferences_screen_test.dart → naaguru_student/lib/features/student/data/student_api_client.dart

## Import Cycles
- None detected.

## Communities (149 total, 33 thin omitted)

### Community 0 - "login_screen.dart"
Cohesion: 0.09
Nodes (22): authService, build, _buildMobileNumberState, _buildOtpBoxes, _buildOtpState, createState, dispose, _errorMessage (+14 more)

### Community 1 - "win32_window.cpp"
Cohesion: 0.18
Nodes (14): wchar_t, Scale(), Create, Destroy, SetQuitOnClose, Show, UpdateTheme, Win32Window::Win32Window() (+6 more)

### Community 2 - "CollegeUseCases.ts"
Cohesion: 0.07
Nodes (34): testAPI(), GET(), GET(), CollegeAccreditationDto, CollegeAccreditationInputDto, CollegeAchievementDto, CollegeAchievementInputDto, CollegeMediaDto (+26 more)

### Community 3 - "Recommendation"
Cohesion: 0.07
Nodes (13): RecommendationDto, CareerUseCases, ICareerRepository, CareerRule, CareerRuleProps, RankedResult, Recommendation, RecommendationProps (+5 more)

### Community 5 - "GeneratedPluginRegistrant.swift"
Cohesion: 0.07
Nodes (24): Any, Cocoa, Flutter, flutter_secure_storage_macos, FlutterAppDelegate, FlutterMacOS, FlutterPluginRegistry, FlutterViewController (+16 more)

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
Cohesion: 0.26
Nodes (3): AssessmentAttemptDto, AssessmentUseCases, IAssessmentRepository

### Community 10 - "api_client.dart"
Cohesion: 0.10
Nodes (20): Client, _accessToken, clearTokens, _decodeResponse, _headers, _httpClient, isAuthenticated, message (+12 more)

### Community 11 - "student_profile_screen.dart"
Cohesion: 0.08
Nodes (26): FormState, _authPhone, authService, build, createState, dispose, _formKey, _guardianNameController (+18 more)

### Community 13 - "location_picker_sheet.dart"
Cohesion: 0.08
Nodes (24): _all, build, _buildContent, _C, createState, current, _debounce, dispose (+16 more)

### Community 14 - "package.json"
Cohesion: 0.08
Nodes (23): name, private, version, dotenv, drizzle-kit, eslint, eslint-config-next, jose (+15 more)

### Community 15 - "assessment_question_screen.dart"
Cohesion: 0.06
Nodes (32): assessmentApiClient, _attemptSubmit, build, _buildCompletionScreen, _buildResultScreen, _buildTransitionScreen, _completedRecommendation, _completedResult (+24 more)

### Community 16 - "AppError"
Cohesion: 0.11
Nodes (29): GET, answerSchema, PATCH, GET, POST, GET, logoutSchema, POST (+21 more)

### Community 17 - "home_screen.dart"
Cohesion: 0.06
Nodes (35): assessmentApiClient, authService, build, _buildAppBar, _buildCollegePillar, _buildCollegePreferencesCard, _buildExploreTeaser, _buildGreeting (+27 more)

### Community 18 - "TypeScript Compiler Options"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 19 - "auth_service.dart"
Cohesion: 0.10
Nodes (20): bool get, FlutterSecureStorage, _accessTokenKey, _apiClient, authStateNotifier, _bindApiClientCallbacks, _fetchAndUpdateProfileState, isAuthenticated (+12 more)

### Community 20 - "DrizzleCatalogRepository"
Cohesion: 0.07
Nodes (21): SchoolsTableProps, LocationDto, PathwayDto, ProgramDto, SchoolDto, ServiceAreaDto, CatalogAdminUseCases, CatalogUseCases (+13 more)

### Community 21 - "assessment_intro_screen.dart"
Cohesion: 0.15
Nodes (13): Color, IconData, AssessmentIntroScreen, _AssessmentIntroScreenState, _AttributeCard, createState, icon, iconBg (+5 more)

### Community 22 - "inputs.dart"
Cohesion: 0.14
Nodes (13): build, controller, enabled, errorText, hintText, items, keyboardType, label (+5 more)

### Community 23 - "main.dart"
Cohesion: 0.06
Nodes (31): apiClient, assessmentApiClient, authService, build, catalogApiClient, collegeApiClient, createState, initState (+23 more)

### Community 24 - "package:flutter/material.dart"
Cohesion: 0.11
Nodes (18): Future, build, PathDetailScreen, pathId, title, build, build, createState (+10 more)

### Community 25 - "profile_screen2_where_you_live.dart"
Cohesion: 0.05
Nodes (44): authService, build, _buildBottomCta, _buildHeader, _buildLandmarkField, _buildLanguageToggle, _buildLocalityRow, _buildLocationBlock (+36 more)

### Community 26 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, drizzle-orm, jose, lucide-react, material-symbols, next, postcss, postgres (+5 more)

### Community 27 - "package:naaguru_student/core/api_client.dart"
Cohesion: 0.06
Nodes (42): dart:convert, Exception, ApiException, main, _completeProfile, _incompleteProfileMissingSchool, main, _makeClient (+34 more)

### Community 28 - "Windows Native Windowing"
Cohesion: 0.24
Nodes (9): _In_, _In_opt_, wWinMain(), string, wchar_t, CreateAndAttachConsole(), GetCommandLineArguments(), Utf8FromUtf16() (+1 more)

### Community 29 - "State"
Cohesion: 0.16
Nodes (18): AssessmentQuestionScreen, _AssessmentQuestionScreenState, CollegeLocationPreferencesScreen, _CollegeLocationPreferencesScreenState, CollegePreferencesScreen, _CollegePreferencesScreenState, CollegeStreamSelectionScreen, _CollegeStreamSelectionScreenState (+10 more)

### Community 30 - "devDependencies"
Cohesion: 0.12
Nodes (17): devDependencies, dotenv, drizzle-kit, eslint, eslint-config-next, tailwindcss, @tailwindcss/cli, @tailwindcss/container-queries (+9 more)

### Community 31 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, ci, db:generate, db:migrate, db:push, db:seed:dev, db:verify (+5 more)

### Community 32 - "Web App Manifest"
Cohesion: 0.18
Nodes (10): background_color, description, display, icons, name, orientation, prefer_related_applications, short_name (+2 more)

### Community 34 - "college_preferences_screen.dart"
Cohesion: 0.07
Nodes (26): List, build, _buildMentorTip, _buildPathwayCards, _buildProgressIndicator, _buildProgressSegment, catalogApiClient, _checkExistingIntent (+18 more)

### Community 35 - "profile_wizard_state.dart"
Cohesion: 0.05
Nodes (38): clearSchool, fullName, gender, landmark, pincode, _pincodeRegex, pincodeValid, residenceLocationId (+30 more)

### Community 36 - "college_review_and_confirm_screen.dart"
Cohesion: 0.05
Nodes (43): build, _buildBottomCta, _buildBudgetCard, _buildErrorBanner, _buildHeader, _buildHostelCard, _buildInfoReassuranceCard, _buildLangButton (+35 more)

### Community 37 - "profile_screen3_review.dart"
Cohesion: 0.06
Nodes (32): authService, build, _buildBottomCta, _buildEditButton, _buildErrorMsg, _buildHeader, _buildLangButton, _buildLocationSummary (+24 more)

### Community 38 - "college_location_preferences_screen.dart"
Cohesion: 0.06
Nodes (30): build, _buildBudgetOption, _buildBudgetSelection, _buildHostelOption, _buildHostelSelection, _buildLocationSection, _buildProgressIndicator, _buildProgressSegment (+22 more)

### Community 39 - "home_screen_test.dart"
Cohesion: 0.05
Nodes (44): Map, MockApiClient, ApiClient, client, lastGetPath, main, mockApi, MockApiClient (+36 more)

### Community 40 - "college_discovery_wizard_state.dart"
Cohesion: 0.06
Nodes (34): int?, availablePrograms, budget, canEditPreferences, hostel, isAllValid, isLocationValid, isStep3Valid (+26 more)

### Community 41 - "app/layout.tsx"
Cohesion: 0.25
Nodes (5): nextConfig, next, inter, metadata, notoSansTelugu

### Community 42 - "profile_screen2_where_you_live_test.dart"
Cohesion: 0.05
Nodes (38): ElevatedButton, MockClient, authService, build, catalogApiClient, child, ProfileGate, studentApiClient (+30 more)

### Community 43 - "StudentCollegeIntent"
Cohesion: 0.18
Nodes (5): IStudentIntentRepository, IntentStatus, StudentCollegeIntent, StudentCollegeIntentProps, DrizzleStudentIntentRepository

### Community 44 - "StudentApiClient"
Cohesion: 0.08
Nodes (25): dart:async, _apiClient, createProfile, createStudentLead, getCurrentCollegeIntent, getMe, getProfile, getStudentLeads (+17 more)

### Community 45 - "college_list_screen.dart"
Cohesion: 0.05
Nodes (37): build, _buildAppBar, _buildBottomNav, _buildContentSliver, _buildContextSubheader, _buildFilterChip, _buildFiltersHorizontalScroll, _buildInfoFooter (+29 more)

### Community 46 - "DrizzleCollegeRepository.ts"
Cohesion: 0.10
Nodes (21): accreditationStatusEnum, achievementStatusEnum, branchesTable, branchTypeEnum, collegeAccreditationsTable, collegeAchievementsTable, collegeLeadershipTable, collegeMediaTable (+13 more)

### Community 47 - "college_detail_screen.dart"
Cohesion: 0.05
Nodes (45): _branches, build, _buildAccreditationRow, _buildAchievementRow, _buildAppBar, _buildAvatarPlaceholder, _buildBranchRow, _buildConflictState (+37 more)

### Community 65 - "results_screen.dart"
Cohesion: 0.12
Nodes (16): assessmentApiClient, build, createState, _errorMessage, _getStreamDescription, initialRecommendation, initialResult, initState (+8 more)

### Community 66 - "MaterialPageRoute"
Cohesion: 0.11
Nodes (18): MaterialPageRoute, build, _buildCollegeCard, _onContinue, _onContinue, _editPathway, _editStep3, _editStream (+10 more)

### Community 68 - "CollegeUseCases"
Cohesion: 0.16
Nodes (12): PUT, PUT, PUT(), POST(), DELETE, PUT, PUT, PUT (+4 more)

### Community 81 - "profile_screen3_review_test.dart"
Cohesion: 0.07
Nodes (28): MockAuthService, MockCatalogApiClient, authService, capturedEducationStage, catalogApiClient, createProfile, createProfileCalled, createWidgetUnderTest (+20 more)

### Community 82 - "vitest"
Cohesion: 0.14
Nodes (14): vitest, POST(), refreshSchema, POST(), requestOtpSchema, POST(), verifyOtpSchema, authUseCases (+6 more)

### Community 83 - "DrizzleAssessmentRepository.ts"
Cohesion: 0.19
Nodes (14): loadJson(), seed(), dynamic, assessmentAttemptsTable, assessmentResultsTable, assessmentVersionQuestionsTable, assessmentVersionsTable, attemptAnswersTable (+6 more)

### Community 84 - "college_stream_selection_screen.dart"
Cohesion: 0.07
Nodes (28): class, FakeCollegeApiClient, build, _buildProgressIndicator, _buildProgressSegment, catalogApiClient, collegeApiClient, createState (+20 more)

### Community 85 - "postgres"
Cohesion: 0.11
Nodes (9): postgres, crackHash(), run(), crackHash(), run(), resetDb(), sql, hashValue() (+1 more)

### Community 86 - "zod"
Cohesion: 0.09
Nodes (18): zod, accreditationInputSchema, currentYear, idParamSchema, syncAccreditationsSchema, syncTestimonialsSchema, testimonialInputSchema, env (+10 more)

### Community 87 - "db.ts"
Cohesion: 0.08
Nodes (20): server-only, runTest(), check(), hashValue(), CollegeBranchRow, LocationRow, MappingStatus, resolveToLocality() (+12 more)

### Community 88 - "StaffMembership"
Cohesion: 0.09
Nodes (8): StaffMembership, StaffMembershipProps, StaffRole, StaffStatus, LinkStaffToCollegeInput, StaffMembershipDto, StaffUseCases, IStaffMembershipRepository

### Community 89 - "college_review_and_confirm_screen_test.dart"
Cohesion: 0.10
Nodes (20): ChangeNotifier, MockCollegeApiClient, MockStudentApiClient, CollegeDiscoveryWizardState, ProfileWizardState, buildScreen, collegeApiClient, failGetIntent (+12 more)

### Community 90 - "catalog_api_client.dart"
Cohesion: 0.13
Nodes (14): _apiClient, CatalogLocation, CatalogSchool, code, displayName, fromJson, getLocations, getSchools (+6 more)

### Community 91 - "language_toggle.dart"
Cohesion: 0.20
Nodes (9): build, isSelected, isTelugu, _LanguageButton, LanguageToggle, onTap, onToggle, text (+1 more)

### Community 92 - "StatelessWidget"
Cohesion: 0.10
Nodes (23): buttons.dart, build, isLoading, onPressed, PrimaryButton, SecondaryButton, TertiaryButton, text (+15 more)

### Community 93 - "catalog/index.ts"
Cohesion: 0.26
Nodes (8): GET(), GET(), GET(), GET(), catalogAdminUseCases, CatalogModule, catalogRepository, catalogUseCases

### Community 94 - "student/public/index.ts"
Cohesion: 0.20
Nodes (12): GET, POST, GET, PATCH, POST, createStudentProfileSchema, updateStudentProfileSchema, intentRepository (+4 more)

### Community 95 - "useCases.ts"
Cohesion: 0.17
Nodes (7): DevOtpProvider, IOtpProvider, ITokenService, otpRequestsTable, sessionsTable, AuthUseCases, hashValue()

### Community 96 - "college_discovery_intro_screen.dart"
Cohesion: 0.10
Nodes (19): _apiClient, CollegeApiClient, getCatalogAreas, getCatalogPathways, getCollegeById, searchColleges, build, _buildFeatureChip (+11 more)

### Community 99 - "config.dart"
Cohesion: 0.40
Nodes (4): AppConfig, appName, package:flutter/foundation.dart, static const String

### Community 100 - "AdminIcons.tsx"
Cohesion: 0.15
Nodes (19): NavGroup, navGroups, NavItem, IconAnalytics(), IconAssessments(), IconAuditLog(), IconCareerAreas(), IconChevronDown() (+11 more)

### Community 101 - "CollegeTestimonial"
Cohesion: 0.09
Nodes (5): CollegeTestimonial, CollegeTestimonialProps, PersonType, testimonialSchema, TestimonialStatus

### Community 104 - "assessment_api_client.dart"
Cohesion: 0.22
Nodes (8): _apiClient, AssessmentApiClient, getActiveAssessment, getRecommendation, getResult, saveAnswer, startOrResumeAttempt, submitAttempt

### Community 106 - "explore_paths_screen.dart"
Cohesion: 0.29
Nodes (6): build, _buildCategoryHeader, _buildIntermediateGrid, _buildOtherPathwaysList, ExplorePathsScreen, package:naaguru_student/features/explore/presentation/path_detail_screen.dart

### Community 107 - "EnquiryModule"
Cohesion: 0.16
Nodes (15): PATCH, GET, GET, POST, PATCH, GET, GET, POST (+7 more)

### Community 108 - "college/domain/models.ts"
Cohesion: 0.12
Nodes (16): StreamProps, accreditationSchema, AccreditationStatus, CollegeAccreditationProps, currentYear, BranchHostelProps, BranchProps, BranchType (+8 more)

### Community 109 - "CollegeAchievement"
Cohesion: 0.10
Nodes (4): achievementSchema, AchievementStatus, CollegeAchievement, CollegeAchievementProps

### Community 110 - "StudentUseCases.ts"
Cohesion: 0.24
Nodes (7): CreateStudentProfileDto, StudentProfileDto, UpdateStudentProfileDto, StudentUseCases, IStudentRepository, StudentGender, StudentProps

### Community 112 - "EnquiryUseCases.ts"
Cohesion: 0.24
Nodes (10): AdminAdmissionDto, CollegeAdmissionDto, CollegeLeadDto, StudentLeadDto, AdmissionProps, LeadProps, AdmissionVerificationStatus, LeadStatus (+2 more)

### Community 114 - "schools/page.tsx"
Cohesion: 0.19
Nodes (12): lucide-react, EditSchoolPayload, SchoolsDrawer(), SchoolsDrawerProps, SchoolsTable(), LocationItem, useLocationHierarchy(), useSchools() (+4 more)

### Community 115 - "locations.test.ts"
Cohesion: 0.18
Nodes (14): PATCH, updateLocationSchema, createLocationSchema, GET, locationTypeSchema, POST, PATCH, patchBodySchema (+6 more)

### Community 116 - "admin/page.tsx"
Cohesion: 0.13
Nodes (13): AdminBadge(), AdminBadgeProps, BadgeVariant, variantStyles, AdminButton(), AdminButtonProps, ButtonVariant, variantStyles (+5 more)

### Community 118 - "LeadHistory"
Cohesion: 0.14
Nodes (3): ILeadHistoryRepository, LeadHistory, LeadHistoryProps

### Community 119 - "drizzle-orm"
Cohesion: 0.32
Nodes (9): drizzle-orm, collegeStreamOfferingsTable, DrizzleLeadHistoryRepository, admissionsTable, admissionVerificationStatusEnum, leadHistoryTable, leadsTable, leadStatusEnum (+1 more)

### Community 120 - "seed-dev.ts"
Cohesion: 0.20
Nodes (10): RFC-4122, FIXTURE_IDS, hashPassword(), loadJson(), main(), staffMembershipsTable, tokenService, studentsTable (+2 more)

### Community 122 - "Win32Window"
Cohesion: 0.18
Nodes (12): FlutterWindow, flutter_controller_, OnDestroy, project_, DartProject, HWND, Win32Window, child_content_ (+4 more)

### Community 123 - "AssessmentUseCases.test.ts"
Cohesion: 0.24
Nodes (7): AssessmentAttemptProps, AttemptAnswerProps, AssessmentVersionProps, QuestionOptionProps, QuestionProps, ScoringEngine, ScoringResult

### Community 124 - "AssessmentUseCases.ts"
Cohesion: 0.21
Nodes (6): AssessmentResultDto, AssessmentVersionDto, AttemptAnswerDto, QuestionDto, QuestionOptionDto, IRulesetProvider

### Community 125 - "student_lead_dto.dart"
Cohesion: 0.18
Nodes (10): branchId, branchName, collegeId, collegeName, createdAt, fromJson, id, status (+2 more)

### Community 126 - "sign-in.tsx"
Cohesion: 0.22
Nodes (4): sampleTestimonials, SignInPage(), SignInPageProps, Testimonial

### Community 127 - "WeeklyMenu"
Cohesion: 0.18
Nodes (7): CollegeProps, dailyMenuSchema, mealItemSchema, mealSchema, WeeklyMenu, WeeklyMenuProps, weeklyMenuSchema

### Community 128 - "MessageHandler"
Cohesion: 0.36
Nodes (10): HWND, LPARAM, LRESULT, UINT, WPARAM, EnableFullDpiSupportIfAvailable(), GetHandle, GetThisFromHandle (+2 more)

### Community 129 - "CompanyAdminHeader.tsx"
Cohesion: 0.27
Nodes (8): CompanyAdminHeader(), getTitleFromPathname(), CompanyAdminSidebar(), IconBell(), IconRefresh(), IconSearch(), CompanyAdminLayout(), getServerAdminAuthContext()

### Community 131 - "OnCreate"
Cohesion: 0.25
Nodes (7): RegisterPlugins(), OnCreate, GetClientArea, OnCreate, SetChildContent, PluginRegistry, RECT

### Community 132 - "MessageHandler"
Cohesion: 0.22
Nodes (8): DartProject, HWND, LPARAM, LRESULT, UINT, WPARAM, FlutterWindow::FlutterWindow(), MessageHandler

### Community 135 - "StudentIntentUseCases"
Cohesion: 0.61
Nodes (3): IntentRequestDto, IntentResponseDto, StudentIntentUseCases

### Community 136 - "sidebar.js"
Cohesion: 0.62
Nodes (6): attachLinkHandlers(), generateSidebarHtml(), getCurrentPageName(), initSidebar(), navigateToPage(), updateSidebarActiveItem()

### Community 139 - "locations/page.tsx"
Cohesion: 0.50
Nodes (4): Location, LocationsPage(), LocationType, UI_LEVELS

### Community 140 - "branchLocationValidation.ts"
Cohesion: 0.40
Nodes (4): BranchLocationValidationResult, LocationType, ResolvedLocationInfo, validateBranchLocationAssignment()

### Community 141 - "Point"
Cohesion: 0.50
Nodes (3): Point, x, y

### Community 142 - "Size"
Cohesion: 0.50
Nodes (3): Size, height, width

## Knowledge Gaps
- **1084 isolated node(s):** `eslintConfig`, `_httpClient`, `_accessToken`, `_refreshToken`, `_refreshFuture` (+1079 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1445 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **33 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AppError` connect `AppError` to `CollegeUseCases.ts`, `Recommendation`, `ILeadRepository`, `StudentIntentUseCases`, `IAssessmentRepository`, `AssessmentAttempt`, `DrizzleCatalogRepository`, `StudentCollegeIntent`, `DrizzleCollegeRepository.ts`, `AssessmentVersion`, `CollegeUseCases`, `vitest`, `zod`, `db.ts`, `StaffMembership`, `catalog/index.ts`, `student/public/index.ts`, `CollegeAchievement`, `StudentUseCases.ts`, `CollegeMedia`, `EnquiryUseCases.ts`, `EnquiryUseCases`, `locations.test.ts`, `AssessmentUseCases.test.ts`, `AssessmentUseCases.ts`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `CompanyAdminHeader.tsx`, `AdminIcons.tsx`, `locations/page.tsx`, `package.json`, `schools/page.tsx`, `admin/page.tsx`, `sign-in.tsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `drizzle-orm` connect `drizzle-orm` to `DrizzleCollegeRepository.ts`, `package.json`, `EnquiryUseCases.ts`, `DrizzleAssessmentRepository.ts`, `postgres`, `db.ts`, `seed-dev.ts`, `useCases.ts`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `_httpClient`, `_accessToken` to the rest of the system?**
  _1084 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `login_screen.dart` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `CollegeUseCases.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07294117647058823 - nodes in this community are weakly interconnected._
- **Should `Recommendation` be split into smaller, more focused modules?**
  _Cohesion score 0.07184325108853411 - nodes in this community are weakly interconnected._
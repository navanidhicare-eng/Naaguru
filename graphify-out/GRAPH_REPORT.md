# Graph Report - Naaguru  (2026-09-12)

## Corpus Check
- 192 files · ~424,670 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1163 nodes · 1949 edges · 81 communities (47 shown, 17 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 49 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7912f631`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- DrizzleAssessmentRepository.ts
- Windows Desktop Platform Runner
- College
- Recommendation
- AppError
- Apple Platform Runner
- Linux Platform Runner
- Mobile UI Design Tokens
- assessment/index.ts
- IAssessmentRepository
- api_client.dart
- student_profile_screen.dart
- AssessmentAttempt
- login_screen.dart
- package.json
- assessment_question_screen.dart
- auth/middleware.ts
- home_screen.dart
- TypeScript Compiler Options
- auth_service.dart
- errors/index.ts
- assessment_intro_screen.dart
- inputs.dart
- package:naaguru_student/core/api_client.dart
- main.dart
- home_screen_test.dart
- Production Runtime Dependencies
- student_profile_screen_test.dart
- Windows Native Windowing
- State
- Development Build Tooling
- NPM Script Workflows
- Web App Manifest
- College Admin Login UI
- college_preferences_screen.dart
- Error Feedback Components
- Primary Action Buttons
- language_toggle.dart
- assessment_api_client.dart
- ApiClient
- StatelessWidget
- Next.js Web Layout
- Question
- QuestionOption
- student_api_client.dart
- college_list_screen.dart
- package:flutter/material.dart
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

## God Nodes (most connected - your core abstractions)
1. `AppError` - 40 edges
2. `College` - 32 edges
3. `AssessmentAttempt` - 31 edges
4. `Student` - 28 edges
5. `Win32Window` - 24 edges
6. `AssessmentVersion` - 18 edges
7. `Recommendation` - 17 edges
8. `compilerOptions` - 16 edges
9. `CareerRule` - 15 edges
10. `AssessmentModule` - 14 edges

## Surprising Connections (you probably didn't know these)
- `MockApiClient` --inherits--> `ApiClient`  [EXTRACTED]
  naaguru_student/test/assessment_question_screen_test.dart → naaguru_student/lib/core/api_client.dart
- `MockApiClient` --inherits--> `ApiClient`  [EXTRACTED]
  naaguru_student/test/results_screen_test.dart → naaguru_student/lib/core/api_client.dart
- `wWinMain()` --calls--> `CreateAndAttachConsole()`  [INFERRED]
  naaguru_student/windows/runner/main.cpp → naaguru_student/windows/runner/utils.cpp
- `Win32Window::Win32Window()` --calls--> `Destroy`  [INFERRED]
  naaguru_student/windows/runner/win32_window.cpp → naaguru_student/windows/runner/win32_window.h
- `StreamProps` --references--> `StreamCode`  [EXTRACTED]
  src/modules/career/domain/models.ts → src/shared/domain/StreamCode.ts

## Import Cycles
- None detected.

## Communities (81 total, 17 thin omitted)

### Community 0 - "DrizzleAssessmentRepository.ts"
Cohesion: 0.06
Nodes (40): postgres, server-only, resetDb(), sql, hashValue(), seedAdmin(), loadJson(), seed() (+32 more)

### Community 1 - "Windows Desktop Platform Runner"
Cohesion: 0.05
Nodes (57): RegisterPlugins(), DartProject, HWND, LPARAM, LRESULT, UINT, WPARAM, FlutterWindow (+49 more)

### Community 2 - "College"
Cohesion: 0.06
Nodes (27): drizzle-orm, DEV_COLLEGES, GET(), GET(), CollegeStreamOfferingDto, PublicCollegeDto, CollegeUseCases, CollegeSearchCriteria (+19 more)

### Community 3 - "Recommendation"
Cohesion: 0.07
Nodes (14): RecommendationDto, CareerUseCases, ICareerRepository, CareerRule, CareerRuleProps, RankedResult, Recommendation, RecommendationProps (+6 more)

### Community 4 - "AppError"
Cohesion: 0.08
Nodes (12): CreateStudentProfileDto, StudentProfileDto, UpdateStudentProfileDto, StudentUseCases, IStudentRepository, Student, StudentProps, DrizzleStudentRepository (+4 more)

### Community 5 - "Apple Platform Runner"
Cohesion: 0.07
Nodes (23): Any, Cocoa, Flutter, flutter_secure_storage_macos, FlutterAppDelegate, FlutterMacOS, FlutterPluginRegistry, FlutterViewController (+15 more)

### Community 6 - "Linux Platform Runner"
Cohesion: 0.09
Nodes (22): FlPluginRegistry, FlView, GApplication, gboolean, gchar, GObject, GtkApplication, MyApplicationClass (+14 more)

### Community 7 - "Mobile UI Design Tokens"
Cohesion: 0.07
Nodes (26): accent, background, borderRadius, error, muted, NaaguruTheme, primary, primaryDark (+18 more)

### Community 8 - "assessment/index.ts"
Cohesion: 0.22
Nodes (6): AssessmentVersionDto, AttemptAnswerDto, QuestionDto, QuestionOptionDto, assessmentRepository, internalUseCases

### Community 9 - "IAssessmentRepository"
Cohesion: 0.28
Nodes (4): AssessmentAttemptDto, AssessmentResultDto, AssessmentUseCases, IAssessmentRepository

### Community 10 - "api_client.dart"
Cohesion: 0.09
Nodes (21): Client, dart:async, _accessToken, clearTokens, _decodeResponse, _headers, _httpClient, isAuthenticated (+13 more)

### Community 11 - "student_profile_screen.dart"
Cohesion: 0.09
Nodes (22): FormState, _authPhone, build, createState, dispose, _formKey, _guardianNameController, _guardianPhoneController (+14 more)

### Community 13 - "login_screen.dart"
Cohesion: 0.09
Nodes (22): authService, build, _buildMobileNumberState, _buildOtpBoxes, _buildOtpState, createState, dispose, _errorMessage (+14 more)

### Community 14 - "package.json"
Cohesion: 0.09
Nodes (20): name, private, version, dotenv, drizzle-kit, eslint, eslint-config-next, jose (+12 more)

### Community 15 - "assessment_question_screen.dart"
Cohesion: 0.06
Nodes (30): AnimationController, assessmentApiClient, build, _buildCompletionScreen, _buildResultScreen, _buildTransitionScreen, _completedRecommendation, _completedResult (+22 more)

### Community 16 - "auth/middleware.ts"
Cohesion: 0.06
Nodes (44): vitest, zod, GET, answerSchema, PATCH, GET, POST, GET (+36 more)

### Community 17 - "home_screen.dart"
Cohesion: 0.08
Nodes (26): assessmentApiClient, authService, build, _buildAppBar, _buildExploreTeaser, _buildGreeting, _buildHomeView, _buildYouView (+18 more)

### Community 18 - "TypeScript Compiler Options"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 19 - "auth_service.dart"
Cohesion: 0.10
Nodes (19): bool get, FlutterSecureStorage, AppConfig, appName, _accessTokenKey, _apiClient, authStateNotifier, _bindApiClientCallbacks (+11 more)

### Community 20 - "errors/index.ts"
Cohesion: 0.29
Nodes (5): IRulesetProvider, AssessmentAttemptProps, AssessmentVersionProps, ScoringEngine, ScoringResult

### Community 21 - "assessment_intro_screen.dart"
Cohesion: 0.15
Nodes (12): Color, IconData, build, createState, icon, iconBg, iconColor, _isTelugu (+4 more)

### Community 22 - "inputs.dart"
Cohesion: 0.14
Nodes (13): build, controller, enabled, errorText, hintText, items, keyboardType, label (+5 more)

### Community 23 - "package:naaguru_student/core/api_client.dart"
Cohesion: 0.13
Nodes (14): main, patch, post, buildTestWidget, main, MockApiClient, patch, post (+6 more)

### Community 24 - "main.dart"
Cohesion: 0.12
Nodes (16): Future, apiClient, assessmentApiClient, authService, build, collegeApiClient, createState, initState (+8 more)

### Community 25 - "home_screen_test.dart"
Cohesion: 0.20
Nodes (9): AuthService, apiClient, authService, build, buildHomeScreen, buildLoginScreen, studentApiClient, package:naaguru_student/features/auth/login_screen.dart (+1 more)

### Community 26 - "Production Runtime Dependencies"
Cohesion: 0.14
Nodes (14): dependencies, drizzle-orm, jose, material-symbols, next, postcss, postgres, react (+6 more)

### Community 27 - "student_profile_screen_test.dart"
Cohesion: 0.11
Nodes (21): dart:convert, Exception, ApiException, main, main, main, apiClient, buildTestWidget (+13 more)

### Community 28 - "Windows Native Windowing"
Cohesion: 0.24
Nodes (9): _In_, _In_opt_, wWinMain(), string, wchar_t, CreateAndAttachConsole(), GetCommandLineArguments(), Utf8FromUtf16() (+1 more)

### Community 29 - "State"
Cohesion: 0.18
Nodes (15): AssessmentIntroScreen, _AssessmentIntroScreenState, AssessmentQuestionScreen, _AssessmentQuestionScreenState, HomeScreen, _HomeScreenState, StudentProfileScreen, _StudentProfileScreenState (+7 more)

### Community 30 - "Development Build Tooling"
Cohesion: 0.17
Nodes (12): devDependencies, dotenv, drizzle-kit, eslint, eslint-config-next, @tailwindcss/cli, @types/node, @types/react (+4 more)

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
Cohesion: 0.10
Nodes (20): int?, List, build, collegeApiClient, CollegePreferencesScreen, _CollegePreferencesScreenState, createState, _districts (+12 more)

### Community 35 - "Error Feedback Components"
Cohesion: 0.22
Nodes (8): buttons.dart, build, error, message, NaaguruErrorView, NaaguruLoadingIndicator, onRetry, VoidCallback

### Community 36 - "Primary Action Buttons"
Cohesion: 0.22
Nodes (8): build, isLoading, onPressed, PrimaryButton, SecondaryButton, TertiaryButton, text, ../theme.dart

### Community 37 - "language_toggle.dart"
Cohesion: 0.20
Nodes (9): build, isSelected, isTelugu, _LanguageButton, LanguageToggle, onTap, onToggle, text (+1 more)

### Community 38 - "assessment_api_client.dart"
Cohesion: 0.22
Nodes (8): _apiClient, AssessmentApiClient, getActiveAssessment, getRecommendation, getResult, saveAnswer, startOrResumeAttempt, submitAttempt

### Community 39 - "ApiClient"
Cohesion: 0.10
Nodes (19): Map, MockApiClient, ApiClient, _apiClient, CollegeApiClient, getCollegeById, searchColleges, MockApiClient (+11 more)

### Community 40 - "StatelessWidget"
Cohesion: 0.25
Nodes (8): NaaguruDropdownField, NaaguruTextField, _AttributeCard, PathDetailScreen, JourneyPlaceholderScreen, NaaguruStudentApp, _MockProfileScreen, StatelessWidget

### Community 41 - "Next.js Web Layout"
Cohesion: 0.29
Nodes (4): nextConfig, next, inter, metadata

### Community 44 - "student_api_client.dart"
Cohesion: 0.29
Nodes (6): _apiClient, createProfile, getMe, getProfile, StudentApiClient, updateProfile

### Community 45 - "college_list_screen.dart"
Cohesion: 0.11
Nodes (19): build, _buildBody, _buildFilterBadge, collegeApiClient, CollegeListScreen, _CollegeListScreenState, _colleges, createState (+11 more)

### Community 46 - "package:flutter/material.dart"
Cohesion: 0.25
Nodes (7): build, pathId, title, build, package:flutter/material.dart, package:naaguru_student/core/theme.dart, package:naaguru_student/core/ui/buttons.dart

### Community 47 - "college_detail_screen.dart"
Cohesion: 0.12
Nodes (16): build, _buildHostelBadge, _buildSectionCard, _college, collegeApiClient, CollegeDetailScreen, _CollegeDetailScreenState, collegeId (+8 more)

### Community 65 - "results_screen.dart"
Cohesion: 0.13
Nodes (15): assessmentApiClient, createState, _errorMessage, _getStreamDescription, initialRecommendation, initialResult, initState, _isLoading (+7 more)

### Community 66 - "MaterialPageRoute"
Cohesion: 0.14
Nodes (14): MaterialPageRoute, build, _buildCollegeCard, _onFindColleges, build, _buildCategoryHeader, _buildIntermediateGrid, _buildOtherPathwaysList (+6 more)

## Knowledge Gaps
- **451 isolated node(s):** `eslintConfig`, `_httpClient`, `_accessToken`, `_refreshToken`, `_refreshFuture` (+446 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 641 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AppError` connect `AppError` to `College`, `AssessmentVersion`, `Recommendation`, `assessment/index.ts`, `IAssessmentRepository`, `AssessmentAttempt`, `auth/middleware.ts`, `errors/index.ts`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `zod` connect `auth/middleware.ts` to `DrizzleAssessmentRepository.ts`, `package.json`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `drizzle-orm` connect `College` to `DrizzleAssessmentRepository.ts`, `AppError`, `package.json`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `_httpClient`, `_accessToken` to the rest of the system?**
  _451 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `DrizzleAssessmentRepository.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06050228310502283 - nodes in this community are weakly interconnected._
- **Should `Windows Desktop Platform Runner` be split into smaller, more focused modules?**
  _Cohesion score 0.05311676909569798 - nodes in this community are weakly interconnected._
- **Should `College` be split into smaller, more focused modules?**
  _Cohesion score 0.05543859649122807 - nodes in this community are weakly interconnected._
# Graph Report - Naaguru  (2026-09-10)

## Corpus Check
- 272 files · ~408,736 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 960 nodes · 1631 edges · 65 communities (45 shown, 11 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 47 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Database Schema and ORM
- Windows Desktop Platform Runner
- College Administration and Directory
- Career Recommendation Engine
- Student Profile Management
- Apple Platform Runner
- Linux Platform Runner
- Mobile UI Design Tokens
- Assessment API Endpoints
- Assessment Application DTOs
- Mobile Network Client
- Student Profile Screen
- Assessment Attempt Domain
- Mobile Authentication UI
- Project Build Configurations
- Assessment Question Flow
- Student Route Handlers
- Mobile Home Dashboard
- TypeScript Compiler Options
- Secure Session Storage
- Assessment Scoring Engine
- Assessment Intro UI
- Form Input Components
- Student Widget Test Suites
- Mobile App Entrypoint
- Auth Navigation Tests
- Production Runtime Dependencies
- API Client Unit Tests
- Windows Native Windowing
- Mobile Screen Navigation
- Development Build Tooling
- NPM Script Workflows
- Web App Manifest
- College Admin Login UI
- Auth API and Validation
- Error Feedback Components
- Primary Action Buttons
- Bilingual Language Switcher
- Assessment API Client
- OTP Authentication Routes
- Form Dropdown Widgets
- Next.js Web Layout
- Assessment Question Model
- Question Option Model
- Student Data Client
- Student App Configuration
- Career Journey Screen
- Environment Variable Config
- Android Native Activity
- ESLint Linting Rules
- AI Agent Instructions
- Mobile Design Guidelines
- Repository Overview Docs
- Node Project Manifest
- Flutter Package Manifest
- Dart Nullable Types

## God Nodes (most connected - your core abstractions)
1. `AppError` - 40 edges
2. `College` - 32 edges
3. `AssessmentAttempt` - 28 edges
4. `Student` - 28 edges
5. `Win32Window` - 24 edges
6. `AssessmentVersion` - 18 edges
7. `Recommendation` - 16 edges
8. `compilerOptions` - 16 edges
9. `CareerRule` - 15 edges
10. `AssessmentModule` - 14 edges

## Surprising Connections (you probably didn't know these)
- `wWinMain()` --calls--> `CreateAndAttachConsole()`  [INFERRED]
  naaguru_student/windows/runner/main.cpp → naaguru_student/windows/runner/utils.cpp
- `Win32Window::Win32Window()` --calls--> `Destroy`  [INFERRED]
  naaguru_student/windows/runner/win32_window.cpp → naaguru_student/windows/runner/win32_window.h
- `my_application_activate()` --calls--> `fl_register_plugins()`  [INFERRED]
  naaguru_student/linux/runner/my_application.cc → naaguru_student/linux/flutter/generated_plugin_registrant.cc
- `main()` --calls--> `my_application_new()`  [INFERRED]
  naaguru_student/linux/runner/main.cc → naaguru_student/linux/runner/my_application.cc
- `OnCreate` --calls--> `RegisterPlugins()`  [INFERRED]
  naaguru_student/windows/runner/flutter_window.h → naaguru_student/windows/flutter/generated_plugin_registrant.cc

## Import Cycles
- None detected.

## Communities (65 total, 11 thin omitted)

### Community 0 - "Database Schema and ORM"
Cohesion: 0.06
Nodes (38): drizzle-orm, jose, postgres, server-only, vitest, hashValue(), seedAdmin(), hashValue() (+30 more)

### Community 1 - "Windows Desktop Platform Runner"
Cohesion: 0.05
Nodes (57): RegisterPlugins(), DartProject, HWND, LPARAM, LRESULT, UINT, WPARAM, FlutterWindow (+49 more)

### Community 2 - "College Administration and Directory"
Cohesion: 0.06
Nodes (24): GET(), GET(), StreamProps, CollegeStreamOfferingDto, PublicCollegeDto, CollegeUseCases, CollegeSearchCriteria, ICollegeRepository (+16 more)

### Community 3 - "Career Recommendation Engine"
Cohesion: 0.07
Nodes (19): GET, POST, RecommendationDto, CareerUseCases, ICareerRepository, CareerRule, CareerRuleProps, RankedResult (+11 more)

### Community 4 - "Student Profile Management"
Cohesion: 0.09
Nodes (11): CreateStudentProfileDto, StudentProfileDto, UpdateStudentProfileDto, StudentUseCases, IStudentRepository, Student, StudentProps, DrizzleStudentRepository (+3 more)

### Community 5 - "Apple Platform Runner"
Cohesion: 0.07
Nodes (23): Any, Cocoa, Flutter, flutter_secure_storage_macos, FlutterAppDelegate, FlutterMacOS, FlutterPluginRegistry, FlutterViewController (+15 more)

### Community 6 - "Linux Platform Runner"
Cohesion: 0.09
Nodes (22): FlPluginRegistry, FlView, GApplication, gboolean, gchar, GObject, GtkApplication, MyApplicationClass (+14 more)

### Community 7 - "Mobile UI Design Tokens"
Cohesion: 0.07
Nodes (26): accent, background, borderRadius, error, muted, NaaguruTheme, primary, primaryDark (+18 more)

### Community 8 - "Assessment API Endpoints"
Cohesion: 0.20
Nodes (14): GET, answerSchema, PATCH, GET, POST, GET, AssessmentModule, assessmentRepository (+6 more)

### Community 9 - "Assessment Application DTOs"
Cohesion: 0.16
Nodes (8): AssessmentAttemptDto, AssessmentResultDto, AssessmentVersionDto, AttemptAnswerDto, QuestionDto, QuestionOptionDto, AssessmentUseCases, IAssessmentRepository

### Community 10 - "Mobile Network Client"
Cohesion: 0.09
Nodes (21): Client, Map, _accessToken, clearTokens, _decodeResponse, _headers, _httpClient, isAuthenticated (+13 more)

### Community 11 - "Student Profile Screen"
Cohesion: 0.09
Nodes (21): FormState, build, createState, dispose, _formKey, _guardianNameController, _guardianPhoneController, _handleSubmit (+13 more)

### Community 13 - "Mobile Authentication UI"
Cohesion: 0.10
Nodes (20): dart:async, authService, build, _buildMobileNumberState, _buildOtpBoxes, _buildOtpState, createState, dispose (+12 more)

### Community 14 - "Project Build Configurations"
Cohesion: 0.10
Nodes (19): name, private, version, dotenv, drizzle-kit, eslint, eslint-config-next, material-symbols (+11 more)

### Community 15 - "Assessment Question Flow"
Cohesion: 0.10
Nodes (19): assessmentApiClient, build, createState, _currentIndex, _errorMessage, _getFallbackQuestionTextEn, _getFallbackQuestionTextTe, _getSentimentIcon (+11 more)

### Community 16 - "Student Route Handlers"
Cohesion: 0.15
Nodes (14): GET, PATCH, POST, createStudentProfileSchema, updateStudentProfileSchema, StudentModule, RouteContext, RouteHandler (+6 more)

### Community 17 - "Mobile Home Dashboard"
Cohesion: 0.11
Nodes (18): authService, build, _buildAppBar, _buildGreeting, _buildJourneySection, _buildMainCard, _buildSecondaryCard, _buildStepItem (+10 more)

### Community 18 - "TypeScript Compiler Options"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 19 - "Secure Session Storage"
Cohesion: 0.12
Nodes (15): bool get, FlutterSecureStorage, _accessTokenKey, _apiClient, authStateNotifier, _bindApiClientCallbacks, isAuthenticated, logout (+7 more)

### Community 20 - "Assessment Scoring Engine"
Cohesion: 0.23
Nodes (4): AssessmentAttemptProps, AssessmentVersion, AssessmentVersionProps, ScoringEngine

### Community 21 - "Assessment Intro UI"
Cohesion: 0.13
Nodes (14): Color, IconData, build, createState, icon, iconBg, iconColor, _isTelugu (+6 more)

### Community 22 - "Form Input Components"
Cohesion: 0.13
Nodes (14): List, build, controller, enabled, errorText, hintText, items, keyboardType (+6 more)

### Community 23 - "Student Widget Test Suites"
Cohesion: 0.15
Nodes (12): buildTestWidget, main, buildTestWidget, main, apiClient, buildTestWidget, main, studentApiClient (+4 more)

### Community 24 - "Mobile App Entrypoint"
Cohesion: 0.14
Nodes (13): Future, apiClient, assessmentApiClient, authService, build, createState, initState, main (+5 more)

### Community 25 - "Auth Navigation Tests"
Cohesion: 0.16
Nodes (12): MaterialPageRoute, AuthService, apiClient, authService, build, buildApp, main, studentApiClient (+4 more)

### Community 26 - "Production Runtime Dependencies"
Cohesion: 0.14
Nodes (14): dependencies, drizzle-orm, jose, material-symbols, next, postcss, postgres, react (+6 more)

### Community 27 - "API Client Unit Tests"
Cohesion: 0.24
Nodes (10): dart:convert, Exception, ApiException, main, main, main, package:flutter_secure_storage/flutter_secure_storage.dart, package:http/http.dart (+2 more)

### Community 28 - "Windows Native Windowing"
Cohesion: 0.24
Nodes (9): _In_, _In_opt_, wWinMain(), string, wchar_t, CreateAndAttachConsole(), GetCommandLineArguments(), Utf8FromUtf16() (+1 more)

### Community 29 - "Mobile Screen Navigation"
Cohesion: 0.23
Nodes (12): AssessmentIntroScreen, _AssessmentIntroScreenState, AssessmentQuestionScreen, _AssessmentQuestionScreenState, LoginScreen, _LoginScreenState, StudentProfileScreen, _StudentProfileScreenState (+4 more)

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

### Community 34 - "Auth API and Validation"
Cohesion: 0.22
Nodes (6): zod, logoutSchema, POST, refreshSchema, authUseCases, ApiErrorResponse

### Community 35 - "Error Feedback Components"
Cohesion: 0.22
Nodes (8): buttons.dart, build, error, message, NaaguruErrorView, NaaguruLoadingIndicator, onRetry, VoidCallback

### Community 36 - "Primary Action Buttons"
Cohesion: 0.22
Nodes (8): build, isLoading, onPressed, PrimaryButton, SecondaryButton, TertiaryButton, text, ../theme.dart

### Community 37 - "Bilingual Language Switcher"
Cohesion: 0.22
Nodes (8): build, isSelected, isTelugu, LanguageToggle, onTap, onToggle, text, ValueChanged

### Community 38 - "Assessment API Client"
Cohesion: 0.25
Nodes (7): ApiClient, _apiClient, AssessmentApiClient, getActiveAssessment, saveAnswer, startOrResumeAttempt, submitAttempt

### Community 39 - "OTP Authentication Routes"
Cohesion: 0.39
Nodes (5): POST(), requestOtpSchema, POST(), verifyOtpSchema, normalizePhoneNumber()

### Community 40 - "Form Dropdown Widgets"
Cohesion: 0.29
Nodes (7): NaaguruDropdownField, NaaguruTextField, _LanguageButton, _AttributeCard, NaaguruStudentApp, _MockProfileScreen, StatelessWidget

### Community 41 - "Next.js Web Layout"
Cohesion: 0.29
Nodes (4): nextConfig, next, inter, metadata

### Community 44 - "Student Data Client"
Cohesion: 0.33
Nodes (5): _apiClient, createProfile, getProfile, StudentApiClient, updateProfile

### Community 45 - "Student App Configuration"
Cohesion: 0.40
Nodes (4): AppConfig, appName, package:flutter/foundation.dart, static const String

### Community 46 - "Career Journey Screen"
Cohesion: 0.40
Nodes (4): build, JourneyPlaceholderScreen, package:flutter/material.dart, package:naaguru_student/core/theme.dart

### Community 47 - "Environment Variable Config"
Cohesion: 0.40
Nodes (3): env, envSchema, parsedEnv

## Knowledge Gaps
- **335 isolated node(s):** `eslintConfig`, `_httpClient`, `_accessToken`, `_refreshToken`, `_refreshFuture` (+330 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 500 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AppError` connect `Assessment API Endpoints` to `Database Schema and ORM`, `College Administration and Directory`, `Career Recommendation Engine`, `Student Profile Management`, `Auth API and Validation`, `Assessment Application DTOs`, `Assessment Attempt Domain`, `Assessment Scoring Engine`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `drizzle-orm` connect `Database Schema and ORM` to `Career Recommendation Engine`, `Student Profile Management`, `Project Build Configurations`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `zod` connect `Auth API and Validation` to `Database Schema and ORM`, `OTP Authentication Routes`, `Assessment API Endpoints`, `Project Build Configurations`, `Environment Variable Config`, `Student Route Handlers`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `_httpClient`, `_accessToken` to the rest of the system?**
  _335 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Database Schema and ORM` be split into smaller, more focused modules?**
  _Cohesion score 0.06265984654731457 - nodes in this community are weakly interconnected._
- **Should `Windows Desktop Platform Runner` be split into smaller, more focused modules?**
  _Cohesion score 0.05311676909569798 - nodes in this community are weakly interconnected._
- **Should `College Administration and Directory` be split into smaller, more focused modules?**
  _Cohesion score 0.05575065847234416 - nodes in this community are weakly interconnected._
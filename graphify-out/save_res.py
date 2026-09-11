import subprocess
from pathlib import Path

py = Path('graphify-out/.graphify_python').read_text(encoding='utf-8').strip()

question = "Explain authentication flow: Flutter OTP verification through session storage, API client, backend auth, and refresh"
answer = """Expanded from original query via vocab: ['auth', 'authenticated', 'client', 'login', 'otp', 'refresh', 'screen', 'secure', 'service', 'session', 'storage', 'token', 'verify'].
Traced through the knowledge graph from Flutter UI to backend:
1. Flutter OTP Verification: LoginScreen (L10 in login_screen.dart) collects OTP in _buildOtpBoxes and invokes authService.verifyOtp().
2. Secure Session Storage: AuthService (L16 in auth_service.dart) stores accessToken and refreshToken into FlutterSecureStorage using _accessTokenKey and _refreshTokenKey, and broadcasts state via authStateNotifier to AuthGate (L70 in main.dart).
3. API Client Interception: ApiClient (L16 in api_client.dart) caches _accessToken and _refreshToken, injects Bearer header in _headers, and intercepts 401 via _tryRefreshTokens with deduplication in _refreshFuture.
4. Backend Authentication & Issuance: POST /api/v1/auth/verify-otp routes through verifyOtpSchema and AuthUseCases.verifyOtp (useCases.ts L10), issuing JWTs via TokenService.issueTokens (TokenService.ts L14). Protected routes use withAuth() middleware (middleware.ts L22).
5. Token Refresh & Rotation: ApiClient calls refreshWithToken to POST /api/v1/auth/refresh, which validates with refreshSchema and invokes AuthUseCases.refreshTokens, notifying Flutter callbacks onTokensRefreshed and onSessionExpired."""

nodes = [
    "LoginScreen", "AuthService", "FlutterSecureStorage", "ApiClient",
    "AuthUseCases", "TokenService", "withAuth()", "verifyOtpSchema", "refreshSchema"
]

cmd = [
    py, "-m", "graphify", "save-result",
    "--question", question,
    "--answer", answer,
    "--type", "query",
    "--outcome", "useful",
    "--nodes"
] + nodes

res = subprocess.run(cmd, capture_output=True, text=True)
print("save-result exit code:", res.returncode)
if res.stdout:
    print("STDOUT:", res.stdout)
if res.stderr:
    print("STDERR:", res.stderr)

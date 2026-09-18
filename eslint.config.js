const globals = require('globals');

/**
 * Deliberately minimal: this is Phase 0 of the hardening roadmap
 * ("run lint on every push/PR"), not a rewrite of the codebase's
 * style. Rules are limited to things that catch real bugs
 * (undefined vars, unreachable code, etc). Formatting/style rules
 * can be layered on later once the baseline is green.
 */
const recommendedRules = {
  'no-undef': 'error',
  'no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_' }],
  'no-unreachable': 'error',
  'no-dupe-keys': 'error',
  'no-dupe-args': 'error',
  'no-const-assign': 'error',
  'no-fallthrough': 'warn',
};

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'supabase/functions/**', // Deno runtime, linted separately via `deno lint`
      'frontend/public/assets/**',
      'frontend/dist/**', // Phase 6 build output — regenerated, not source
      'frontend/js/app/main.generated.js', // Phase 6 build artifact — regenerated, not source
      'frontend/public/dashboard-bundle.generated.js', // Phase 6 build artifact — regenerated, not source
      'screenshots/**',
      '.github/**',
    ],
  },
  {
    // Browser-side app code. app.js is loaded as a single ES module built
    // by Vite from these 10 source chunks (see
    // frontend/scripts/build-app-bundle.mjs) but the chunks themselves are
    // still plain global-scope code — index.html's own inline <script>
    // blocks and its 131 onclick="..." attributes call straight into them
    // by bare name, so functions/vars defined here are declared as known
    // globals below rather than producing no-undef noise.
    files: ['frontend/js/app/*.js', 'frontend/public/analytics.js', 'frontend/public/splash.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: {
        ...globals.browser,
        supabase: 'readonly', // Supabase UMD CDN script tag in index.html
        CANONICAL_SYLLABUS: 'readonly',
        S: 'writable',
        _handleRoute: 'readonly',
        _isKnownPath: 'readonly',
        _lhRestoreTimer: 'writable',
        _restoreHoursFilter: 'readonly',
        _routeMap: 'readonly',
        _setRobotsMeta: 'readonly',
        checkHWTNotifs: 'readonly',
        closeM: 'readonly',
        closeSidebar: 'readonly',
        drawJeeDonut: 'readonly',
        getDefaultJeeYear: 'readonly',
        isCustomChapter: 'readonly',
        mobNavTo: 'readonly',
        navMarkDirty: 'readonly',
        openM: 'readonly',
        openMobDrawer: 'readonly',
        renderOverview: 'readonly',
        setQuote: 'readonly',
        show404: 'readonly',
        toast: 'readonly',
        Chart: 'readonly', // Chart.js, loaded lazily from CDN via ensureChartJs()
        chartInstances_ov: 'writable', // pre-existing implicit global (no let/const/var anywhere) — not introduced by this refactor, left as-is
        settingsNavTap: 'readonly', // defined in index.html's own remaining inline script (~line 3070)
        ensureChartJs: 'readonly', // defined in index.html's own remaining inline script (~line 100)
        loadScript: 'readonly', // defined in index.html's own remaining inline script (~line 97)
        loadDashboardBundle: 'readonly', // defined in app-01-boot-auth.js (core), called from app-02's password-reset flow too
        // Phase 6 (landing-page-load split): these three routing-display
        // constants moved from dashboard-controller.js into
        // app-00-routing.js (core bundle) since _isKnownPath()/show404()
        // need _routeMap/_staticPages at boot time, before we know if the
        // dashboard bundle will ever load. _pageToPath/_pageTitles/
        // _settingsTabs went along with them for cohesion — dashboard-only
        // code (nav(), _handleRoute()) still reads them, now as an
        // already-loaded core global rather than a same-file constant.
        _pageToPath: 'readonly',
        _pageTitles: 'readonly',
        _settingsTabs: 'readonly',
        // Referenced (behind a typeof guard) but never actually defined
        // anywhere in this codebase — pre-existing dead reference, not
        // introduced by this refactor. Declared here only so the *call*
        // site (not behind a typeof check) doesn't false-positive; left
        // exactly as-is otherwise.
        settingsMobileReset: 'readonly',
        // Phase 6 (index.html split): dashboard-controller.js is the former
        // 4,799-line inline <script> block (was lines 4541-9337 of
        // index.html), extracted the same way app.js was in Phase 5 — kept
        // as a classic (non-module) external script, loaded at the exact
        // same document position, so execution order relative to the small
        // trailing inline script (which reads window.nav) and to app.js's
        // module (which always runs after all classic scripts, regardless
        // of this file's move) is unchanged. It calls into a number of
        // app.js-exposed globals that no app-*.js chunk needed to reference
        // before, hence these weren't already declared above.
        SUPABASE_URL: 'readonly',
        _aiCanGenerate: 'readonly',
        _aiDaysUntilReset: 'readonly',
        _aiIncrementUsage: 'readonly',
        dbDelete: 'readonly',
        getGoalAdv: 'readonly',
        getGoalMains: 'readonly',
        maybeShowAiReview: 'readonly',
        maybeShowHoursReview: 'readonly',
        maybeShowReviewPrompt: 'readonly',
        maybeShowSyllabusReview: 'readonly',
        renderSettings: 'readonly',
        showSettingsPanel: 'readonly',
        fmt: 'readonly', // moved from dashboard-controller.js to app-00-routing.js (core) — see that file's comment
        toastTopWarn: 'readonly',
        updateActivity: 'readonly',
        toastDismiss: 'readonly',
        updateBadges: 'readonly',
        updateMobTopbarTitle: 'readonly',
        // analytics.js <-> app.js/index.html cross-file globals, same
        // no-bundler situation as above. posthog/_jtTrack/_jtIdentify
        // are assigned via `window.x = ...` (PostHog's own init snippet,
        // and analytics.js's own tracking helpers) rather than `var`/
        // `function`, which is why ESLint can't infer them on its own.
        posthog: 'writable',
        nav: 'readonly',
        _jtTrack: 'readonly',
        _jtIdentify: 'readonly',
        showApp: 'readonly',
        currentUser: 'readonly',
        userProfile: 'readonly',
        doAuth: 'readonly',
        authTab: 'readonly',
        doGoogleAuth: 'readonly',
        signOut: 'readonly',
        finishOnboarding: 'readonly',
        save: 'readonly',
        saveChapter: 'readonly',
        savePracticeLog: 'readonly',
        sendFeedback: 'readonly',
        exportPDF: 'readonly',
        // Phase 5: app.js itself was split into frontend/js/app/*.js (still
        // plain classic scripts loaded in sequence, same global scope as
        // before — see the note above). Each chunk is now linted on its
        // own, so cross-chunk references need declaring here too, same
        // reasoning as the analytics.js block above.
        sb: 'writable',
        isSaving: 'writable',
        saveQueue: 'writable',
        TURNSTILE_SITE_KEY: 'writable',
        _appInitialized: 'writable',
        _authSlideAnimating: 'writable',
        _siteConfigCache: 'writable',
        _syncSnapshot: 'writable',
        _turnstileTokens: 'writable',
        COACHING_BY_MODE: 'readonly',
        COACHING_LIST: 'readonly',
        PRESET_AVATARS: 'readonly',
        initSupabase: 'readonly',
        hideSplash: 'readonly',
        showConfigError: 'readonly',
        showAuthScreen: 'readonly',
        hideAuthMsg: 'readonly',
        switchAuthTab: 'readonly',
        _checkLoginBackoff: 'readonly',
        _recordLoginFailure: 'readonly',
        _clearLoginFailures: 'readonly',
        _renderTurnstileWidgets: 'readonly',
        _resetTurnstile: 'readonly',
        _shouldShowOnboarding: 'readonly',
        setDashGreeting: 'readonly',
        loadEmailReportPref: 'readonly',
        toggleEmailReport: 'readonly',
        getDefaultState: 'readonly',
        loadUserData: 'readonly',
        _payloadTest: 'readonly',
        _payloadHour: 'readonly',
        _payloadBacklog: 'readonly',
        _payloadTodo: 'readonly',
        _payloadUpcoming: 'readonly',
        _payloadSyllabusState: 'readonly',
        _payloadPracticeLog: 'readonly',
        flushSave: 'readonly',
        loadUserProfile: 'readonly',
        saveUserProfile: 'readonly',
        checkSupportPrompt: 'readonly',
        checkWelcomeModal: 'readonly',
        updatePracticeNewBadge: 'readonly',
        registerPushNotifications: 'readonly',
        startActivityHeartbeat: 'readonly',
        claimGuestDonationsAndLoadBadge: 'readonly',
        initHeroDemo: 'readonly',
        initSlideshow: 'readonly',
        loadPublicSiteConfig: 'readonly',
        _fmtStatPlain: 'readonly',
        _initScrollReveal: 'readonly',
        _rollOdometer: 'readonly',
        _resolveFakeLoop: 'readonly',
        _buildPremiumOdometer: 'readonly',
        _initCountUp: 'readonly',
        _initLandFabScroll: 'readonly',
        loadLandingTestimonials: 'readonly',
        toggleCustomCoaching: 'readonly',
        buildSettingsCoachingSelect: 'readonly',
        showOnboarding: 'readonly',
        _goalKey: 'readonly',
        _snapKey: 'readonly',
        _applyAvatarImage: 'readonly',
      },
    },
    // Every top-level declaration here is effectively "exported" to a
    // shared global scope — read by index.html's 131 onclick="..."
    // attributes, by its own remaining inline scripts, and across these
    // files themselves (see the exposure list above). ESLint's per-file
    // analysis can't see those HTML-side call sites, so `vars: 'local'`
    // tells no-unused-vars to only flag genuinely-local (function-scope)
    // unused variables — which are real signals — not top-level
    // declarations, which are this architecture's public surface by
    // design and were producing pure false-positive noise.
    rules: { ...recommendedRules, 'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none', vars: 'local', varsIgnorePattern: '^_' }] },
  },
  {
    // Service worker
    files: ['frontend/public/sw.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'script',
      globals: { ...globals.serviceworker },
    },
    rules: recommendedRules,
  },
  {
    // Vercel Node serverless functions (ESM import/export syntax)
    files: ['frontend/api/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: recommendedRules,
  },
  {
    // Local Node build/CLI scripts (CommonJS)
    files: ['frontend/scripts/**/*.js', 'eslint.config.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: recommendedRules,
  },
];

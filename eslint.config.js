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
      'frontend/assets/**',
      'screenshots/**',
      '.github/**',
    ],
  },
  {
    // Browser-side app code. app.js is loaded alongside index.html's own
    // inline <script> blocks and shares their global scope (no bundler
    // yet — see Phase 6), so functions/vars defined there are declared
    // as known globals here rather than producing no-undef noise.
    files: ['frontend/js/app/*.js', 'frontend/analytics.js'],
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
    rules: recommendedRules,
  },
  {
    // Service worker
    files: ['frontend/sw.js'],
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

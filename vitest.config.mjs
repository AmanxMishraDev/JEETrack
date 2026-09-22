import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.mjs'],
    // test/db/** needs a real local Postgres (see that file's own header
    // comment) and is intentionally excluded from the default fast run —
    // it has its own `npm run test:db` script.
    exclude: ['test/db/**', '**/node_modules/**'],
    // Set before any test file's imports run — server/admin/lib/auth.js reads
    // these into exported `const`s at module-load time, so they must exist
    // before that module is ever imported (import statements always run
    // before a test file's own top-level code, so setting these inside a
    // test file would be too late).
    env: {
      ADMIN_TOKEN_SECRET: 'test-secret-for-vitest-only',
      ADMIN_PASSWORD: 'test-admin-password-for-vitest-only',
      UPSTASH_REDIS_REST_URL: 'https://fake-upstash.test',
      UPSTASH_REDIS_REST_TOKEN: 'fake-upstash-token',
    },
  },
});

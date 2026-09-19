import { defineConfig } from 'vitest/config';

// Separate from vitest.config.mjs on purpose — this suite needs a real
// local Postgres running (`supabase start`) and takes longer, so it's not
// part of the default fast `npm test` run. See test/db/query-performance.test.mjs
// for what it actually checks and how to run it.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/db/**/*.test.mjs'],
  },
});

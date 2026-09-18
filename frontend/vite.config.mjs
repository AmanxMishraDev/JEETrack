import { defineConfig } from 'vite';

export default defineConfig({
  // frontend/ is the project root (index.html lives here); public/ holds
  // everything that should be copied through untouched (admin panel,
  // marketing pages, icons, sw.js, analytics.js, etc.) — see
  // docs/ARCHITECTURE.md for why those aren't run through the bundler.
  build: {
    outDir: 'dist',
    // Vite's default CSS minifier (lightningcss) hard-errors on
    // `:not(::before)` in styles.css — technically invalid CSS (you can't
    // nest a pseudo-*element* inside :not()), but browsers have always
    // tolerated it silently, so it's not a bug worth chasing down in a
    // build-tooling phase. esbuild's CSS minifier is more lenient and
    // still minifies everything else fully.
    cssMinify: 'esbuild',
    // Content-hashed filenames (Phase 6 roadmap item) — this is what lets
    // us set long-lived immutable Cache-Control headers on the JS/CSS
    // output safely, since a filename only ever refers to one exact
    // version of the file's contents.
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
  },
});

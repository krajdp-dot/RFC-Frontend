import { defineConfig } from 'vitest/config';
import path from 'path';

/**
 * Phase 11 — this project had `vitest` as a dependency but no config and
 * no "test" script wiring it to anything; `tests/business.test.ts` (a
 * leftover from before this repo's current architecture — it imports a
 * standalone `src/lib/prisma.ts` / `src/lib/services/*` layer that the
 * app itself no longer uses, against a live database this environment
 * doesn't have) was already unrun by anything. This config intentionally
 * scopes to the new offline-lib unit tests rather than pulling that file
 * in — see PHASE-11-REPORT.md, "Pre-existing, out of scope".
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/lib/offline/**/*.test.ts', 'src/lib/whatsapp/**/*.test.ts'],
    setupFiles: ['./src/lib/offline/test-setup.ts'],
  },
});

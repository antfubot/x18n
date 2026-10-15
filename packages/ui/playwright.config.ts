import { defineConfig } from '@playwright/test'

/** Kept out of `pnpm test` (vitest); run with `pnpm -C packages/ui test:e2e` after `pnpm build`. */
export default defineConfig({
  testDir: 'test/e2e',
  testMatch: '*.e2e.ts',
  timeout: 60_000,
  use: { browserName: 'chromium', headless: true },
})

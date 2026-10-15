import { defineConfig } from 'x18n'

/** The UI's own messages. `x18n check` runs on this in CI once config loading lands (M2). */
export default defineConfig({
  sourceLocale: 'en',
  resources: [{ pattern: 'packages/ui/app/locales/{locale}.json' }],
  usage: {
    include: ['packages/ui/app/**/*.vue'],
  },
})

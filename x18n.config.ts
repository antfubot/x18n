import { defineConfig } from 'x18n'

/** The UI's own messages; `x18n check` runs on them in CI. */
export default defineConfig({
  sourceLocale: 'en',
  resources: [{ pattern: 'packages/ui/app/locales/{locale}.json' }],
  usage: {
    include: ['packages/ui/app/**/*.vue', 'packages/ui/app/**/*.ts'],
    calls: [{ callee: ['t', '$t'] }],
  },
})

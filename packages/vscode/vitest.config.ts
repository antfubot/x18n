import { defineProject } from 'vitest/config'

/** The view models only; `test/e2e` runs inside VS Code through `test:e2e`. */
export default defineProject({
  test: {
    name: 'vscode',
    include: ['test/*.test.ts'],
  },
})

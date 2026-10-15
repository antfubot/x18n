import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      'packages/builtins',
      'packages/cli',
      'packages/core',
      'packages/lsp',
      'packages/node',
      {
        test: {
          name: 'exports',
          root: './test',
        },
      },
    ],
  },
})

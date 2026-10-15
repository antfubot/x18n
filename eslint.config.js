// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    pnpm: true,
    vue: true,
    antislop: true,
    ignores: [
      '**/.nuxt',
      '**/.output',
      '**/.data',
      'packages/vscode/src/generated',
      'packages/core/schema',
      // Sample user projects for tests.
      'test/fixtures',
    ],
  },
  {
    rules: {
      // Parsers, scanners and the edit planner walk trees; 25 keeps them readable without splitting every visitor.
      'sonarjs/cognitive-complexity': ['error', 25],
    },
  },
)

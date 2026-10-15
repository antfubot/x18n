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
    ],
  },
)

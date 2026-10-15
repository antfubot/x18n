import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/presets.ts', 'src/cli.ts'],
  platform: 'node',
  dts: true,
  exports: {
    exclude: ['cli'],
  },
  publint: true,
})

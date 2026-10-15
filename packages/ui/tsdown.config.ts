import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/node/index.ts'],
  platform: 'node',
  tsconfig: 'tsconfig.node.json',
  dts: true,
  exports: true,
  publint: true,
  // `nuxt build` writes the SPA to `dist/public` first; keep it.
  clean: false,
})

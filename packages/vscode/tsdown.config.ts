import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts', 'src/server.ts'],
  format: 'cjs',
  platform: 'node',
  target: 'node20',
  shims: false,
  dts: false,
  external: ['vscode'],
  // The extension ships without node_modules, so every dependency is bundled.
  noExternal: [/.*/],
})

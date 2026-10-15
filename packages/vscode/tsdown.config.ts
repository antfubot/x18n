import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: ['src/index.ts', 'src/server.ts'],
    format: 'cjs',
    platform: 'node',
    target: 'node20',
    shims: false,
    dts: false,
    external: ['vscode'],
    // The extension ships without node_modules, so every dependency is bundled.
    noExternal: [/.*/],
    // Prefer ESM entries: UMD `main` builds (jsonc-parser) `require` relative files that are not bundled.
    inputOptions: { resolve: { mainFields: ['module', 'main'] } },
  },
  {
    // The e2e suite, loaded with `require` by the VS Code extension host; not packaged.
    entry: { suite: 'test/e2e/suite.ts' },
    outDir: 'test/e2e/dist',
    format: 'cjs',
    platform: 'node',
    target: 'node20',
    dts: false,
    external: ['vscode'],
  },
])

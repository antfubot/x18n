import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: { formats: 'src/formats/index.ts' },
  dts: true,
  // Kept by hand: tsdown maps a single entry to ".", but builtins only ship subpaths.
  exports: false,
  publint: true,
})

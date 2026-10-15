import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'checks': 'src/checks/index.ts',
    'extractors': 'src/extractors/index.ts',
    'finders': 'src/finders/index.ts',
    'formats': 'src/formats/index.ts',
    'manifests': 'src/manifests/index.ts',
    'placeholders': 'src/placeholders/index.ts',
    'presets': 'src/presets/index.ts',
    'reporters': 'src/reporters/index.ts',
    'scanners': 'src/scanners/index.ts',
    'yaml-plugin': 'src/yaml-plugin/index.ts',
  },
  dts: true,
  exports: true,
  publint: true,
})

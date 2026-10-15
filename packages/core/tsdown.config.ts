import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  exports: {
    customExports: {
      './schema/config.json': './schema/config.json',
      './schema/plugin.json': './schema/plugin.json',
    },
  },
  publint: true,
})

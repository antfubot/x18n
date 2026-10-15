const strict = {
  noUncheckedIndexedAccess: true,
  exactOptionalPropertyTypes: true,
  noImplicitOverride: true,
  noFallthroughCasesInSwitch: true,
}

export default defineNuxtConfig({
  ssr: false,

  modules: ['@unocss/nuxt'],

  imports: {
    autoImport: false,
  },

  components: {
    dirs: [],
  },

  css: ['@unocss/reset/tailwind.css'],

  nitro: {
    preset: 'static',
    output: {
      dir: './dist',
    },
  },

  // Relative base: the SPA is served under any mount path (devframe, static hosting, VS Code webview).
  app: {
    baseURL: './',
    head: {
      title: 'x18n',
      viewport: 'width=device-width,initial-scale=1',
    },
  },

  vite: {
    base: './',
  },

  typescript: {
    strict: true,
    tsConfig: { compilerOptions: strict },
    nodeTsConfig: { compilerOptions: strict },
    sharedTsConfig: { compilerOptions: strict },
  },

  devtools: {
    enabled: false,
  },

  compatibilityDate: '2026-10-01',
})

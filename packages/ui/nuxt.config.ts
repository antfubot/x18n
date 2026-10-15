import { fileURLToPath } from 'node:url'

const strict = {
  noUncheckedIndexedAccess: true,
  exactOptionalPropertyTypes: true,
  noImplicitOverride: true,
  noFallthroughCasesInSwitch: true,
}

const source = (path: string): string => fileURLToPath(new URL(`../${path}`, import.meta.url))

// Moves a magic-link code out of the fragment before the hash router reads it; `app/backend.ts` exchanges it.
const stashOtp = `{const p=new URLSearchParams(location.hash.slice(1)),c=p.get('devframe_otp');if(c){sessionStorage.setItem('x18n:otp',c);history.replaceState(null,'',location.pathname+location.search+'#'+(p.get('route')||'/'))}}`

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

  // The wire types in `src/node` name core types; resolve them from sources so typecheck needs no build.
  alias: {
    '@x18n/core': source('core/src/index.ts'),
    '@x18n/builtins/extractors': source('builtins/src/extractors/index.ts'),
  },

  nitro: {
    preset: 'static',
    output: {
      dir: './dist',
    },
  },

  // Hash routes and a relative base: the SPA works under any mount path and on hosts without a fallback route.
  router: {
    options: {
      hashMode: true,
    },
  },

  app: {
    baseURL: './',
    head: {
      title: 'x18n',
      viewport: 'width=device-width,initial-scale=1',
      script: [{ innerHTML: stashOtp }],
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

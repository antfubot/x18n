import process from 'node:process'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',

  /**
   * Develop against a local checkout of the layer:
   * COMARK_DOCS_LAYER=../../comark-docs pnpm docs
   */
  extends: [process.env.COMARK_DOCS_LAYER || 'comark-docs'],

  site: {
    url: 'https://x18n.antfu.dev',
    name: 'x18n',
  },

  llms: {
    domain: 'https://x18n.antfu.dev',
    title: 'x18n',
    description: 'Manage and view i18n files of any project, for humans and agents: a core engine, CLI, language server, VS Code extension and UI.',
  },

  devtools: { enabled: false },
})

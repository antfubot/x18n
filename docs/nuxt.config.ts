import process from 'node:process'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',

  /**
   * Develop against a local checkout of the layer:
   * COMARK_DOCS_LAYER=../../comark-docs pnpm docs
   */
  extends: [process.env.COMARK_DOCS_LAYER || 'comark-docs'],

  site: {
    name: 'x18n',
  },

  llms: {
    title: 'x18n',
    description: 'Manage and view i18n files of any project, for humans and agents: a core engine, CLI, language server, VS Code extension and UI.',
  },

  devtools: { enabled: false },
})

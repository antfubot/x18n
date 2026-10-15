---
navigation: false
title: 'x18n: i18n files, checked and maintained'
description: x18n reads the locale files of any project, finds where each key is used, and reports missing, unused and broken keys. A CLI, a language server, a VS Code extension, a UI and MCP tools share one engine.
---

<!-- eslint-disable markdown/no-missing-atx-heading-space -- `#title` and the like are MDC slot names, not headings. -->

::u-page-hero
---
orientation: horizontal
---
```sh
$ npx x18n check
src/App.vue:17:15 - error missing-key: "app.titel" is not defined in en.
17     <p>{{ $t('app.titel') }}</p>
                 ~~~~~~~~~

src/locales/en.json:18:4 - warning unused-key: "unused" is not used.
18   "unused": "Nobody uses me",
      ~~~~~~

Found 1 error and 1 warning in 2 files.
```

#title
i18n files, checked and maintained

#description
x18n reads the locale files and the translate calls of your project. It reports missing, unused and broken keys, and changes locale files without breaking their format. For humans, CI and coding agents.

#links
  :::u-button
  ---
  to: /guide/getting-started
  size: lg
  trailing-icon: i-lucide-arrow-right
  ---
  Get started
  :::

  :::u-button
  ---
  icon: i-simple-icons-github
  color: neutral
  variant: ghost
  size: lg
  to: https://github.com/antfu/x18n
  target: _blank
  ---
  View on GitHub
  :::
::

::landing-features
#headline
Surfaces

#title
One engine, every place you work

#description
Every surface reads the same config and reports the same diagnostics. The CLI in CI, the editor and the UI always agree.

#default
  :::landing-feature-card{icon="i-lucide-terminal" to="/surfaces/cli"}
  #title
  CLI and x18n check

  #description
  `x18n check` reports invalid, untranslated and unused keys like `tsc --noEmit`. Every command has JSON output.
  :::

  :::landing-feature-card{icon="i-lucide-code" to="/surfaces/vscode"}
  #title
  VS Code

  #description
  Translations in place of keys, go to definition, find references and rename across code and every locale file.
  :::

  :::landing-feature-card{icon="i-lucide-table" to="/surfaces/ui"}
  #title
  UI

  #description
  Every key across every locale in one table. Edit values in the browser, or publish a static, read-only report.
  :::

  :::landing-feature-card{icon="i-lucide-bot" to="/agents/workflows"}
  #title
  Agents

  #description
  Translate prompts, safe write commands and MCP tools let an agent translate, check and clean up messages.
  :::

  :::landing-feature-card{icon="i-lucide-package" to="/presets"}
  #title
  Presets

  #description
  Detected from your dependencies: vue-i18n, @nuxtjs/i18n, i18next, react-i18next, next-intl, react-intl, svelte-i18n and VS Code extensions.
  :::

  :::landing-feature-card{icon="i-lucide-puzzle" to="/plugins"}
  #title
  Plugins

  #description
  Add a library, a file format or a check with a YAML file, or with a typed TypeScript plugin.
  :::
::

::landing-tabs
---
items:
  - icon: i-lucide-list
    title: See the project
    description: Locales with coverage, and the counts of resources, keys and usages.
  - icon: i-lucide-circle-check
    title: Check it
    description: Missing, unused and broken keys. Exits with 1 on errors.
  - icon: i-lucide-file-cog
    title: Write a config
    description: x18n.config.ts from the detected presets and locale files.
---

#headline
Quick start

#title
No config to start

#description
Run x18n in the root of a project. It detects the i18n library from your dependencies and finds the locale files. [Read the guide](/guide/getting-started).

#code-0
  ```sh
  npx x18n
  ```

#code-1
  ```sh
  npx x18n check
  ```

#code-2
  ```sh
  npx x18n init
  ```
::

::landing-cta
#title
Coming from i18n-ally?

#description
`x18n migrate i18n-ally` converts your settings and custom frameworks into an x18n config. x18n is in early development.

#links
  :::u-button
  ---
  to: /guide/getting-started
  size: lg
  trailing-icon: i-lucide-arrow-right
  ---
  Get started
  :::

  :::u-button
  ---
  to: /migration
  color: neutral
  variant: subtle
  size: lg
  ---
  Migrate from i18n-ally
  :::
::

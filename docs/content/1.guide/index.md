---
title: What is x18n
description: x18n reads the i18n setup of a project, reports problems in its locale files and changes them safely.
---

x18n reads the i18n setup of a project: the locale files, and the translate calls in the code. It shows every key across locales, finds where each key is used, and reports keys that are missing, unused or broken. It also changes locale files for you, without breaking their format.

## The problem

Locale files drift as a project grows:

- A key exists in English but not in German.
- A key stays in the files after the code stops using it.
- A translation drops a placeholder, so `Hello {name}` becomes `Hallo`.
- Hard-coded text gets into the UI without a key.

[i18n-ally](https://github.com/lokalise/i18n-ally) found many of these problems inside VS Code. Its logic is tied to the VS Code API, so it cannot run in CI, in a browser or for a coding agent. x18n moves the same logic into an engine that runs anywhere.

## One engine, many surfaces

The engine is `@x18n/core`. It does no file access itself and knows no editor. A surface is a layer that people or tools use on top of the engine:

- The [CLI](/surfaces/cli) is for humans, CI and agents. `x18n check` does for i18n what `tsc --noEmit` does for types.
- The [VS Code extension](/surfaces/vscode) shows translations in place and treats keys like symbols: go to definition, find references and rename.
- The [language server](/references/lsp-protocol) gives the same features to any editor with an LSP client.
- The [UI](/surfaces/ui) shows every key across locales in a table. It runs as a local server, or as a static report.
- The [MCP server](/agents/mcp) gives the same tools to coding agents.

Every surface reads the same config and reports the same diagnostics. A fix that you make in the editor shows in the UI, and `x18n check` in CI agrees with both.

## Libraries and formats

x18n knows no i18n library and no file format by itself. Plugins add that knowledge. A preset is a group of plugins for one library. x18n detects the presets from the dependencies of the project:

- [vue-i18n](/presets/vue-i18n) and [@nuxtjs/i18n](/presets/nuxt-i18n)
- [i18next](/presets/i18next) and [react-i18next](/presets/react-i18next)
- [next-intl](/presets/next-intl)
- [react-intl](/presets/react-intl)
- [svelte-i18n](/presets/svelte-i18n)
- [VS Code extensions](/presets/vscode-extension) (`vscode.l10n` and `package.nls.json`)

The built-in formats read JSON, JSONC, JSON5 and YAML locale files, and Vue `<i18n>` blocks. For a library or format that x18n does not support, [write a plugin](/plugins) in YAML or TypeScript.

## What x18n does not do

- It does not call machine translation services. Instead, it writes a [translate prompt](/agents/prompts) for an agent or an LLM, and checks the result.
- It is not a runtime i18n library. It reads and writes the files that your runtime library uses.
- It has no hosted service, no account and no telemetry.
- It does not run your source files or locale files. It parses them. Only a TS or JS config file and TS plugins run.

## Packages

| Package | Contents |
| --- | --- |
| `x18n` | The CLI, `defineConfig`, and the presets in `x18n/presets`. |
| `@x18n/core` | The engine: domain model, plugin API and analysis. |
| `@x18n/builtins` | The built-in plugins and presets. |
| `@x18n/node` | Config loading and file access in Node. |
| `@x18n/lsp` | The language server. |
| `@x18n/ui` | The UI. |
| `x18n-vscode` | The VS Code extension. |

x18n is in early development. The plan lives in [`plans/`](https://github.com/antfu/x18n/tree/main/plans).

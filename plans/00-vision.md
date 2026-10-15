# 00 - Vision

## Problem

Locale files drift. Keys go missing in some locales, keys stay in files after the code stops using them, placeholders break during translation, and hard-coded strings get into the UI. i18n-ally solved much of this inside VS Code, but its logic is tied to the VS Code API. It cannot run in CI, in another editor, in a browser, or for a coding agent.

## Goal

x18n is one engine that understands the i18n setup of any project, and many surfaces on top of it:

1. **`@x18n/core`**: an engine that runs anywhere (Node, browser, worker). It does no I/O itself and has no editor types.
2. **`x18n` CLI**: for humans, CI and agents. Every command has stable JSON output.
3. **`@x18n/lsp`**: a language server, so any LSP editor gets hovers, inlay hints, diagnostics, completion, rename and code actions.
4. **`x18n-vscode`**: a thin VS Code extension on the LSP, with views, decorations and the embedded UI.
5. **`@x18n/ui`**: a devframe app. The same UI runs as a local dev server, as a static deployed report, as an in-browser workspace, and inside a VS Code webview.

All behaviour that depends on the i18n library in use (vue-i18n, i18next, next-intl, ...) or on the file format (JSON, YAML, PO, ...) comes from **plugins**. The core knows none of them. Built-in plugins cover popular stacks. Users write custom plugins in TypeScript or YAML, both with types and a schema.

## Users

| User | Needs |
| --- | --- |
| Developer in an editor | See translations inline, jump to definitions, rename keys, extract strings, fix missing keys fast. |
| Translator or reviewer | Browse every key across locales in a table, edit values, comment, approve, see where a key is used. |
| CI | Fail a build on missing translations, broken placeholders or unused keys. Post a summary to a PR. |
| Coding agent | Ask "what is missing", get a prompt that describes the translation work, write values back with safe commands, then check the result. All without parsing human output. |
| Plugin author | Support a new library or format with a small typed object, or with a YAML file when no code is needed. |

## Non-goals

- **No machine-translation engines.** i18n-ally called Google, DeepL and others. x18n instead creates a translation prompt for an agent or an LLM, and validates the result ([10-agents.md](./10-agents.md)).
- **No hosted service or account.** The deployed website is static or runs fully in the browser.
- **No runtime i18n library.** x18n reads and writes the files that runtime libraries use. It does not translate at runtime.
- **No telemetry.**
- **No execution of user code to read locale files.** i18n-ally ran JS/TS locale files through ts-node. x18n reads them statically (see [05-builtins.md](./05-builtins.md)). Config files and TS plugins are code the user chose to load, which is a different trust level.

## Success criteria for 1.0

- Any project that i18n-ally supports today works with x18n without hand-written config, or after `x18n migrate i18n-ally`.
- `x18n check` runs in CI on a 5,000-file project in under 10 seconds cold and under 2 seconds with a warm cache ([15-quality.md](./15-quality.md)).
- An agent can finish the loop "find missing translations, translate, write, verify" with CLI commands only, using the shipped skill.
- The LSP works in VS Code, Neovim and Zed with the same server binary.
- The plugin API is fully typed with strict TypeScript, and the YAML plugin format validates against a published JSON Schema in editors.

# 00 - Vision

## Problem

Locale files drift:
- keys go missing in some locales
- keys stay in files after the code stops using them
- placeholders break during translation
- hard-coded strings get into the UI

i18n-ally solved much of this inside VS Code, but its logic is tied to the VS Code API. It cannot run in CI, in a browser, or for a coding agent.

## Goal

x18n is one engine that understands the i18n setup of any project, plus several surfaces on top of it:

1. **`@x18n/core`**: an engine that runs anywhere (Node, browser, worker). It does no I/O itself and has no editor types.
2. **`x18n` CLI**: for humans, CI and agents. `x18n check` is to i18n what `tsc --noEmit` is to types: it reports invalid, untranslated and unused keys and fails the build on errors. Every command has stable JSON output.
3. **`@x18n/lsp`**: a language server that makes `t('xxx.yyy')` behave like an imported TypeScript symbol. That means go to definition, find all usages, rename, hovers, inlay hints and diagnostics.
4. **`x18n-vscode`**: a thin VS Code extension on the LSP, with in-place annotations, views and the embedded UI.
5. **`@x18n/ui`**: a devframe app. The same UI runs as a local dev server, as a static deployed report, and inside a VS Code webview. An in-browser workspace follows in 1.x.

All behaviour that depends on the i18n library in use (vue-i18n, i18next, next-intl, ...) or on the file format (JSON, YAML, PO, ...) comes from **plugins**. The core knows none of them. Built-in plugins cover popular stacks. Users write custom plugins in TypeScript or YAML, both with types and a schema. Projects are configured with `x18n.config.ts`.

## Users

| User | Needs |
| --- | --- |
| Developer in an editor | Treat keys like symbols: jump to the definition, find usages, rename safely. See translations in place. Fix missing keys fast. |
| Translator or reviewer | Browse every key across locales in a table, edit values, see where a key is used. |
| CI | Fail a build on invalid keys or broken placeholders, warn on untranslated and unused keys, post a summary to a PR. |
| Coding agent | Ask "what is missing", get a prompt that describes the translation work, write values back with safe commands, then check the result. All without parsing human output. |
| Plugin author | Support a new library or format with a small typed object, or with a YAML file when no code is needed. |

## Non-goals

- **No machine-translation engines.** i18n-ally called Google, DeepL and others. x18n instead writes a translation prompt for an agent or an LLM, and validates the result ([10-agents.md](./10-agents.md)).
- **No hosted service or account.** The deployed website is static, or runs fully in the browser (1.x).
- **No runtime i18n library.** x18n reads and writes the files that runtime libraries use. It does not translate at runtime.
- **No telemetry.**
- **No silent execution of locale files.** JS/TS locale files are read statically. Running them is an explicit opt-in per resource pattern, Node only, and makes those resources read-only ([05-builtins.md](./05-builtins.md)).

## Success criteria for 1.0

- Projects on the tier 1 presets work without a hand-written config, or after `x18n migrate i18n-ally`.
- `x18n check` on a 5,000-file project takes under 10 seconds cold and under 2 seconds with a warm cache ([15-quality.md](./15-quality.md)).
- In VS Code, definition, references and rename on keys work in code and in locale files, and TypeScript never takes over rename on a key.
- An agent can finish the loop "find missing translations, translate, write, verify" with CLI commands only, using the shipped skill.
- The plugin API is fully typed with strict TypeScript, and the YAML plugin format validates against a published JSON Schema in editors.

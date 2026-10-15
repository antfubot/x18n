# 17 - Roadmap

Each milestone is one or a few PRs. A milestone is done when its exit criteria pass in CI. Order follows dependencies; M9 to M12 can run in parallel once M7 is done.

## M0 - Plan and scaffold (this PR)

- `plans/` documents.
- pnpm monorepo with catalogs, Turborepo, `tsconfig.base.json`, ESLint, knip, Vitest projects, tsnapi.
- Packages with a minimal real seed each: `@x18n/core` (plugin and config types, `definePlugin`, `defineConfig`, memory host), `@x18n/builtins` (`json` format), `@x18n/node` (node host file read and write), `x18n` (CLI with `--version`), `@x18n/lsp` (server that answers `initialize`), `@x18n/ui` (devframe definition, Nuxt SPA shell), `x18n-vscode` (activates and starts the LSP), `docs` (comark-docs layer, landing).

**Exit:** all five gates pass.

## M1 - Core engine, read path

- Domain types, `KeyString` codec, locale tags (port).
- Config schema (valibot), `defineConfig`, resolution with origins, JSON Schema generation at build.
- Plugin runner: order, presets, `config` hooks, conflicts, `explain()`.
- `pattern` finder (port of PathMatcher), `json`, `jsonc`, `yaml` formats (read).
- Key index, `project.keys()`, `get`, `message`, coverage.
- Checks runner + `missing-translation`, `empty-translation`, `key-conflict`.

**Exit:** memory-host tests on 3 fixtures; config schema snapshot; type tests for `defineConfig` and `definePlugin`.

## M2 - Node host and CLI read commands

- Node host: glob with gitignore, watch, cache.
- Config loading for all file types, YAML plugin loading.
- Manifest readers, preset detection; presets `vue-i18n` and `i18next` (resources and key hooks only).
- CLI: `status`, `keys`, `get`, `locales`, `doctor`, `check`, `schema`, `init`; reporters `pretty`, `json`, `markdown`, `github`.
- JSON contract v1 for these commands.

**Exit:** CLI snapshot tests on fixtures; `x18n check` runs in this repo's CI against `packages/ui/app/locales`.

## M3 - Usage scanning and analysis

- `regex` scanner (port), `js` scanner on oxc with call specs and alias tracking, `vue` scanner.
- Scopes and namespaces from factories, dynamic prefix usages, derived keys.
- Usage index with per-file hashes and persistent cache.
- Checks `missing-key`, `unused-key`. CLI `usages`, `keys --unused`.
- Tier 1 presets complete for scanning: vue-i18n, nuxt-i18n, i18next, react-i18next, next-intl, react-intl, svelte-i18n, vscode-extension.
- Benchmark fixture and budgets.

**Exit:** parity tests against i18n-ally examples for tier 1 presets (same keys found).

## M4 - Edits and write commands

- Edit planner, decisions, stale-plan detection.
- In-place `edit` for json, jsonc, yaml; `serialize` fallback; key style handling; `keepFilled`; target strategies.
- Placeholder syntaxes per preset, `placeholder-mismatch` and `invalid-syntax` checks.
- CLI `set`, `apply`, `rename` (with usage edits), `delete`, `fill`, `format`, all with `--dry-run`.

**Exit:** round-trip tests prove bytes outside edited ranges stay the same; rename updates code in all tier 1 presets.

## M5 - Agent surface

- Translate and review prompt builders, `translatePrompt` hook, glossary.
- CLI `prompt translate`, `prompt review`, paging with cursors.
- devframe definition in `@x18n/ui` node side (no SPA needed yet), `x18n mcp`.
- Skill `packages/cli/skills/x18n/SKILL.md`; test that commands in the skill exist.

**Exit:** a scripted agent loop on a fixture (prompt, apply generated JSON, check) ends with zero missing translations.

## M6 - UI: dev server and static build

- Nuxt SPA with `@antfu/design`, `UiBackend` with server and static adapters.
- Pages: overview, keys grid, key detail, locale, usages, project.
- `x18n ui`, `x18n build`. MCP over HTTP on the dev server.
- UI messages localized with x18n.

**Exit:** Playwright e2e for dev (edit a value, file changes on disk) and static (renders, no edit controls).

## M7 - Language server

- Overlay host, project per folder, watched files.
- Diagnostics, hover, inlay hints, completion, definition, references, rename, code actions, symbols.
- Custom `x18n/*` protocol; `x18n/openUi` hosting the UI server.
- Docs for Neovim, Zed, Helix.

**Exit:** in-process LSP tests for each feature; stdio smoke test.

## M8 - VS Code extension

- Client, decorations and in-place mode, views, status bar, UI webview panel, schema validation contributions, commands.
- Packaging and publishing scripts (Marketplace and Open VSX). Publishing waits for human approval.

**Exit:** test-electron smoke test; manual check list in the PR.

## M9 - Extraction

- Extractors and rules (port), key generation, templates per preset, plan files.
- CLI `extract`, LSP code actions, UI `/extract`, MCP tools.

**Exit:** extraction fixtures per tier 1 preset produce the expected source and resource edits.

## M10 - Reviews

- YAML review store, CLI `review *`, LSP and VS Code comments, UI threads, stale approvals.

**Exit:** review ops in one plan with message edits; rename moves threads.

## M11 - Migration and preset parity

- `x18n migrate i18n-ally` and the VS Code prompt.
- Tier 2 presets and formats.

**Exit:** migration fixtures; parity tests for tier 2.

## M12 - In-browser workspace and docs playground

- Browser host, worker, WASM scanners, `local` backend.
- Docs `/play`, `/demo`, schemas.

**Exit:** Playwright test on the docs build: open the demo fixture, edit, see the change in the file view.

## M13 - Performance and scale

- Worker-thread scanning in the node host, cache tuning, LSP memory work.

**Exit:** budgets in [15-quality.md](./15-quality.md) pass on the benchmark fixture.

## Release

The first npm and Marketplace release follows M8 at the earliest. Every release (version bump, tag, publish) needs explicit human approval.

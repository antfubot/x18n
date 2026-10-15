# Decisions

Each entry: what was decided, what else was considered, and why. New decisions go at the end.

## D1 - Scoped package layout

`@x18n/core`, `@x18n/builtins`, `@x18n/node`, `x18n` (CLI), `@x18n/lsp`, `@x18n/ui`, `x18n-vscode`.

- Considered: one package per plugin (`@x18n/plugin-*`), or few packages (`x18n` with everything).
- Why: layer boundaries are package boundaries, which keeps core free of Node and editor code. One `builtins` package with subpaths keeps installs simple while staying tree-shakable.

## D2 - Core takes an injected host and runs in the browser

- Considered: Node-only core.
- Why: the in-browser workspace, the LSP overlay of unsaved buffers, and memory-host tests all need the same seam.

## D3 - Config in TS, YAML or JSON, validated by valibot

- Considered: zod 4, hand-written JSON Schema.
- Why: one schema for runtime validation, JSON Schema for editors and the serializable TS types. valibot is small and tree-shakable, which matters for the browser bundle.

## D4 - AST-first scanners, regex kept

- Considered: regex only (i18n-ally parity), AST only.
- Why: AST scanning handles aliases, scopes and multi-line calls. Regex stays for i18n-ally parity, languages without an AST scanner, and YAML plugins. Both are scanners; neither is special in core.

## D5 - Unified plugin object plus presets

- Considered: separate registries per capability; frameworks as their own concept.
- Why: one plugin often needs several capabilities that must agree (a library's scanner, key normalization and placeholder syntax). A preset is just a detected list of plugins, so "framework" needs no special concept.

## D6 - UI on Nuxt (SPA mode)

- Considered: plain Vue + Vite SPA.
- Why: matches node-modules-inspector and eslint-config-inspector, which already ship devframe UIs with Nuxt static output and relative base. File routing and modules (UnoCSS, VueUse) come for free.

## D7 - The LSP hosts the UI server; VS Code iframes it

- Considered: a second server in the extension host; a postMessage RPC bridge.
- Why: one `Project` per process keeps the editor and UI in sync without reloads. devframe has no postMessage transport in its public API. `asExternalUri` makes it work in remote setups.

## D8 - Deployed site: static report and in-browser workspace

- Considered: static report only.
- Why: the static report covers CI and translators. The in-browser workspace lets people try x18n with no install, and is cheap once D2 holds.

## D9 - No machine translation engines; translate prompts instead

- Considered: porting i18n-ally translators.
- Why: agents and LLMs already translate well with context. x18n's value is the context (usages, glossary, placeholders, style examples) and safe write-back (`x18n apply` with checks). It also removes API keys from the tool.

## D10 - Reviews in `.x18n/reviews.yml`

- Considered: no built-in store; comments inside locale files.
- Why: git-tracked, format-independent, and reviewable in PRs. The store is pluggable for other backends.

## D11 - Strict TypeScript

`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `isolatedDeclarations` for libraries.

- Why: the plugin API is the product for plugin authors. Strict options catch the optional and index bugs that i18n-ally's `object`-typed data allowed.

## D12 - Turborepo for tasks

- Considered: `pnpm -r`.
- Why: caching of builds and typechecks across 8 workspaces, and `dependsOn` for the UI build that the CLI and extension need. Same setup as devframe and vite-devtools.

## D13 - Docs on comark-docs

- Why: same stack as devframe docs, with `llms.txt` generation for agents.

## D14 - Node >= 22, VS Code ^1.100

- Why: ESM-only packages, `fs.glob`-era Node APIs, current LSP client features.

## D15 - Locale files are never executed

- Why: i18n-ally ran JS/TS locale files through ts-node, which runs user code with no clear consent. Static reading covers the common `export default { ... }` case.

## Open questions

- Docs domain. It feeds `site.url` and `llms.domain` of the docs site and the hosted `$schema` URLs.
- Marketplace publisher and extension id (`antfu.x18n-vscode` for now).
- Whether `@x18n/ui` ships its SPA inside the package or as a separate `--assets` package served through devframe remote assets (smaller install for CLI-only users).

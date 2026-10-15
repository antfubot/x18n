# 14 - Vendoring from i18n-ally

i18n-ally is MIT licensed (Copyright Lokalise Inc., Anthony Fu, think2011). x18n may copy and change its code.

## Rules

- Vendored files keep a header line: `Adapted from i18n-ally (MIT), <original path>`.
- `THIRD-PARTY-NOTICES.md` at the repo root holds the i18n-ally license text and the list of adapted files. Each package that ships vendored code includes it in `files`.
- Vendored code MUST meet x18n rules after the port: no `vscode`, no global singletons, no `any`, strict types, tests. Port the logic, not the structure.
- Port tests along with code. i18n-ally has unit tests for `flat`, `cleanObject`, `PathMatcher` and extraction; those become vitest specs.

## What to take

| i18n-ally source | Goes to | Notes |
| --- | --- | --- |
| `utils/PathMatcher.ts` | `@x18n/builtins` `pattern` finder | Matcher tokens and `ReplaceLocale`. Add tests for every token. |
| `core/loaders/LocaleLoader.ts` `guessDirStructure`, `findLocaleDirs` | `pattern` finder auto-guess | Only the heuristics; the loader itself is replaced by the core engine. |
| `tagSystems/*` | `@x18n/core` lenient `localeInfo` parse | Display data only (language, region, flag); codes are never rewritten. Declare `bcp-47` as a dependency (missing in i18n-ally). |
| `utils/flat.ts`, `utils/utils.ts` `applyPendingToObject` | core key style | |
| `frameworks/*.ts` | `@x18n/builtins/presets` | Regexes become `regex` scanner config for parity; call specs for the `js` scanner are new. Refactor templates, derived key rules, `rewriteKeys`, scope rules, data transforms (Rails, chrome-ext). Fix `perferredKeystyle` typos while porting. Register `i18n-js` (never registered upstream). |
| `frameworks/custom.ts` | YAML plugin format + migration | |
| `utils/Regex.ts` (`handleRegexMatch`, `regexFindKeys`, `normalizeUsageMatchRegex`) | `regex` scanner | Replace `lastIndexOf` positioning with capture group indices (`d` flag). |
| `core/Analyst.ts` usage report | core analysis + `unused-key` / `missing-key` checks | |
| `core/Nodes.ts` linked messages | `vue-i18n` preset placeholder syntax and resolution | |
| `extraction/rules/*`, `extraction/shouldExtract.ts`, `extraction/parseHardString.ts` | `@x18n/builtins/extractors` | On oxc and Vue compiler ASTs instead of Babel and htmlparser2. |
| `core/Extract.ts` `generateKeyFromText` | key generation in extraction | |
| `parsers/json.ts`, `parsers/yaml.ts` key ranges (`json-source-map`, YAML CST) | `json` and `yaml` formats | Replaced by `jsonc-parser` and `yaml` v2 ranges. |
| `packagesParsers/*` | manifest readers | Fix the Gemfile reader. |
| `core/Review.ts` data model | reviews | New file location and schema. |
| `examples/by-frameworks/*`, `examples/by-features/*` | `test/fixtures/` | Base for parity tests. |
| `locales/*.json` (extension UI strings) | none at first | x18n UI messages are new; reuse translations where text matches. |

## What not to take

- `core/Global.ts`, `core/Config.ts`, `core/CurrentFile.ts`: singletons tied to VS Code. Replaced by `Project` and config resolution.
- `translators/*`, `core/Translator.ts`: replaced by translate prompts.
- `parsers/ecmascript.ts` (ts-node execution): replaced by static reading, plus the opt-in `execute: true` that reuses the config loader.
- `core/Telemetry.ts`, `update-notification.ts`.
- `webview/` (Vue 2, Parcel): replaced by `@x18n/ui`.
- `views/*` tree item classes: replaced by LSP requests and thin VS Code views.

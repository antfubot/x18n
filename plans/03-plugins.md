# 03 - Plugins and presets

Everything that depends on an i18n library or a file format is a plugin. Built-in plugins use the same API as third-party ones ([01-architecture.md](./01-architecture.md), rule 3).

## Shape

One plugin object can contribute any number of capabilities. This is the same idea as Vite or unplugin: one name, many hooks.

```ts
interface Plugin {
  /** Unique, kebab-case. Built-ins use the `x18n:` prefix, for example `x18n:format-json`. */
  readonly name: string
  /** Order among plugins of the same capability. Default 'normal'. */
  readonly enforce?: 'pre' | 'post'
  /** Where the plugin can run. Default 'any'. 'node' plugins are skipped in the browser with a notice in `explain()`. */
  readonly runtime?: 'any' | 'node'

  /** Change the config before it is final. Presets use this to set defaults. */
  readonly config?: (config: ConfigDraft, ctx: ConfigContext) => void | Promise<void>
  /** Called once the config is final. */
  readonly configResolved?: (config: ResolvedConfig) => void

  readonly manifests?: readonly ManifestReader[]
  readonly localeFinders?: readonly LocaleFinder[]
  readonly formats?: readonly Format[]
  readonly scanners?: readonly Scanner[]
  readonly extractors?: readonly Extractor[]
  readonly checks?: readonly Check[]
  readonly reporters?: readonly Reporter[]
  readonly placeholders?: readonly PlaceholderSyntax[]
  readonly reviewStore?: ReviewStoreFactory

  readonly normalizeKey?: (raw: string, ctx: KeyContext) => string | undefined
  readonly derivedKeys?: readonly DerivedKeyRule[]
  readonly transformResource?: ResourceTransform
  readonly translatePrompt?: (draft: PromptDraft, ctx: PromptContext) => void
}

interface Preset {
  readonly name: string
  /** Decides if the preset applies. Without `detect`, the preset applies only when listed in config. */
  readonly detect?: (ctx: DetectContext) => boolean | Promise<boolean>
  /** When true and detected, presets that come after it are not applied (i18n-ally `monopoly`). */
  readonly exclusive?: boolean
  readonly plugins: readonly (Plugin | Preset)[]
}

function definePlugin<const T extends Plugin>(plugin: T): T
function definePlugin<O, const T extends Plugin>(factory: (options: O) => T): (options: O) => T
function definePreset<const T extends Preset>(preset: T): T
```

Built-in plugins and presets are factories with typed options, for example `vueI18n({ sfc: true })`, `json({ indent: 2 })`.

## Capabilities

### Manifest reader

Reads a package manifest into a dependency list for `detect`. Built-ins: `package.json`, `composer.json`, `pubspec.yaml`, `Gemfile` (fixing the i18n-ally parser that only reported `rails-i18n`).

```ts
interface ManifestReader {
  readonly id: string
  readonly file: string // 'package.json'
  readonly read: (text: string) => readonly string[] // dependency names
}
```

`DetectContext` gives `hasDependency(name)`, `hasAnyDependency(names)`, `fileExists(glob)` and the raw manifests. In a monorepo it checks the project root first, then workspace roots up to the repo root.

### Locale finder

Finds resources. It returns candidates; core does the parsing.

```ts
interface LocaleFinder {
  readonly id: string
  readonly find: (ctx: FinderContext) => Promise<readonly ResourceCandidate[]>
  /** Where a new resource for (locale, namespace) should go. Used by edits that create files. */
  readonly resolveNew?: (target: { locale: LocaleCode, namespace: string | undefined }, ctx: FinderContext) => string | undefined
}

interface ResourceCandidate {
  readonly path: string
  readonly locale: LocaleCode
  readonly namespace: string | undefined
  readonly format?: string // hint; otherwise picked by extension
  readonly block?: ResourceBlock // embedded resource, for example a Vue <i18n> block
}
```

Built-ins:

- **`pattern`**: path patterns ported from i18n-ally `PathMatcher` with tokens `{locale}`, `{locale?}`, `{namespace}`, `{namespaces}` (several path segments, joined with `.`), `{ext}` and globs. Example: `locales/{locale}/{namespaces}.{ext}`. Includes the i18n-ally guess for `file` vs `dir` layout, used only when no pattern is configured.
- **`sfc-blocks`**: `<i18n>` blocks in Vue SFCs (vue-i18n) and `<fluent>` blocks (fluent-vue).

### Format

Reads and writes one file format.

```ts
interface Format {
  readonly id: string
  readonly extensions: readonly string[] // without dot: ['json']
  readonly parse: (text: string, ctx: FormatContext) => ParseResult
  /** Edits text in place. Preferred; keeps comments and layout. */
  readonly edit?: (text: string, ops: readonly MessageOp[], ctx: FormatContext) => readonly TextEdit[]
  /** Full serialization. Used to create files, and when `edit` is missing. */
  readonly serialize?: (tree: MessageTree, ctx: FormatContext) => string
}

interface ParseResult {
  readonly tree: MessageTree
  /** Ranges of keys and values, for go-to-definition and annotations inside locale files. */
  readonly ranges?: ReadonlyMap<string, { key: TextRange, value: TextRange }>
}

type MessageOp
  = | { type: 'set', path: readonly string[], value: MessageLeaf }
    | { type: 'delete', path: readonly string[] }
    | { type: 'rename', from: readonly string[], to: readonly string[] }
```

A format with neither `edit` nor `serialize` is read-only. Key style (`nested` vs `flat`) is applied by core before calling `edit` or `serialize`, so formats only see paths.

### Scanner

Finds key usages in source files.

```ts
interface Scanner {
  readonly id: string
  /** File extensions or language ids this scanner handles: ['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs']. */
  readonly extensions: readonly string[]
  readonly scan: (file: SourceFile, ctx: ScanContext) => ScanResult | Promise<ScanResult>
}

interface ScanResult {
  readonly usages: readonly UsageCandidate[]
  /** Text regions with a default namespace or key prefix, for example `useTranslation('auth')`. */
  readonly scopes?: readonly Scope[]
  /** Positions where completion of a key makes sense, used by the LSP. */
  readonly keySlots?: readonly TextRange[]
}
```

Built-in scanners ([05-builtins.md](./05-builtins.md)):

- **`regex`**: configurable patterns with a `{key}` placeholder, the same model as i18n-ally `usageMatchRegex`. Kept for parity and for YAML plugins.
- **`js`**: AST scanner using `oxc-parser`. It is driven by **call specs** (data, not code), so presets and YAML plugins can configure it:

```ts
interface CallSpec {
  /** Function or member path: 't', '$t', 'i18n.t', 'i18next.t', 'intl.formatMessage'. */
  readonly callee: string | readonly string[]
  /** Only count calls whose callee comes from these modules or factories (alias tracking). */
  readonly from?: readonly ImportSource[]
  /** Which argument holds the key. Default 0. Object form: `{ arg: 0, property: 'id' }` for formatMessage. */
  readonly key?: number | { arg: number, property: string }
  /** Where the namespace comes from: an argument of the factory (`useTranslation('ns')`) or an option. */
  readonly namespace?: NamespaceSource
  /** The callee is a factory whose return value is the translate function, for example `useI18n()` returning `{ t }`. */
  readonly factory?: boolean
}
```

  Alias tracking means `const { t: translate } = useI18n()` or `import { t as tr } from 'i18next'` are found, which regexes cannot do. Template literals with a static prefix give `dynamic: 'prefix'` usages, which checks treat as "keys under this prefix are used".
- **`vue`**: splits SFCs with `@vue/compiler-sfc`, runs `js` on `<script>`, and walks the template AST for `$t()`, `t()`, `v-t`, `<i18n-t keypath>` and `<i18n path>`.
- **`svelte`**, **`html`**, **`jsx-attr`** (for `<Trans i18nKey>`): same idea for their syntaxes.

### Extractor

Finds hard-coded strings and builds the replacement. See [11-extraction.md](./11-extraction.md).

### Check

```ts
interface Check {
  readonly id: string // 'missing-translation'
  readonly defaultSeverity: Severity | 'off'
  readonly docs?: string
  readonly run: (ctx: CheckContext) => Iterable<DiagnosticInput>
}
```

`CheckContext` gives read-only access to indexes and the analysis of the current revision, so a check cannot change the project.

### Reporter

```ts
interface Reporter {
  readonly id: string // 'pretty', 'json', 'sarif'
  readonly report: (input: ReportInput, ctx: ReporterContext) => string | Promise<string>
}
```

Reporters return text; the CLI decides where it goes (`--output <file>`, stdout).

### Placeholder syntax

Describes placeholders in message values, so checks and prompts can protect them: `{name}`, `{{name}}`, ICU `{count, plural, ...}`, `%s`, `%{name}`, `@:linked.key`. Presets register the syntax of their library.

```ts
interface PlaceholderSyntax {
  readonly id: string
  readonly find: (value: string) => readonly Placeholder[]
}
```

### Key hooks

- `normalizeKey(raw, ctx)`: turns the raw key text into canonical form. Example: i18next `ns:a.b` becomes namespace `ns`, path `a.b`; next-translate `ns:a` the same. Replaces i18n-ally `rewriteKeys`.
- `derivedKeys`: rules like `{key}_plural`, `{key}_one`, `{key}_other`. When `{key}` is used, the derived keys count as used. When a derived key exists, `{key}` resolves.
- `transformResource`: `{ read(tree, ctx), write(tree, ctx) }`. Example: Rails removes the top-level locale key on read and adds it back on write.

## Order and conflicts

- The final plugin list is: built-in core plugins, then detected or listed presets (flattened depth-first), then user plugins. Within that, `enforce: 'pre'` plugins come first and `'post'` last.
- For `formats` and `scanners`, the first plugin that claims an extension wins, unless the config maps it explicitly (`formats: { '.json': 'jsonc' }`). The losers are listed in `explain()`.
- For `localeFinders`, `checks` and `reporters`, all run. Ids MUST be unique; a duplicate id is a config error (`X18N1002`) unless the later one sets `override: true`.
- Hooks (`config`, `normalizeKey`, `transformResource`) run in order. `normalizeKey` stops at the first plugin that returns a value.

## YAML plugins

Many custom setups need no code. A YAML plugin is a file `*.x18n-plugin.yml` (or `.yaml`) that describes the declarative subset of the API. It replaces `.vscode/i18n-ally-custom-framework.yml`.

```yaml
# yaml-language-server: $schema=../node_modules/@x18n/core/schema/plugin.json
name: acme-i18n
detect:
  dependencies:
    any: ['@acme/i18n']
config:
  sourceLocale: en
  resources:
    - pattern: 'src/i18n/{locale}/{namespace}.yml'
  namespace:
    separator: ':'
    default: common
scanners:
  calls: # configures the built-in `js` scanner
    - callee: [t, translate]
      from: [{module: '@acme/i18n'}]
    - callee: useT
      factory: true
      namespace: {arg: 0}
  regex: # configures the built-in `regex` scanner
    - extensions: [html]
      patterns: ['data-i18n="({key})"']
scopes:
  regex: 'useNamespace\([''"](.+?)[''"]\)' # group 1 = namespace, ported from scopeRangeRegex
derivedKeys: ['{key}_plural']
normalizeKey:
  - replace: {pattern: /, with: .}
placeholders: ['{name}', '%{name}']
extract:
  templates:
    - '{t}(''{key}'')'
    - extensions: [vue]
      source: html-attribute
      template: ':{attr}="$t(''{key}'')"'
```

Rules:

- The YAML schema is generated from the same valibot schemas that validate it at load time, so the editor schema and the runtime check never drift ([04-config.md](./04-config.md)).
- Each YAML section maps to a typed TS factory in `@x18n/builtins` (for example `scanners.calls` maps to options of the `js` scanner). A YAML plugin compiles to a normal `Plugin` object. This makes "YAML first, move to TS later" a small change, and `x18n plugin eject <file>` can print the TS equivalent.
- YAML plugins cannot contain code. Anything that needs code (a new format, a custom check) is a TS plugin.

## TS plugins

```ts
// x18n/acme.ts
import { definePlugin } from 'x18n'

export default definePlugin((options: { prefix: string }) => ({
  name: 'acme-keys',
  normalizeKey: raw => raw.startsWith(options.prefix) ? raw.slice(options.prefix.length) : undefined,
  checks: [{
    id: 'acme/no-todo',
    defaultSeverity: 'warning',
    * run(ctx) {
      for (const m of ctx.messages()) {
        if (typeof m.value === 'string' && m.value.includes('TODO'))
          yield { key: m.key, locale: m.locale, message: 'Message contains TODO' }
      }
    },
  }],
}))
```

TS plugins are loaded by `@x18n/node` (through the config loader) or bundled into the in-browser workspace. A plugin package SHOULD be named `x18n-plugin-*` or `@scope/x18n-plugin-*`, so it can be referenced from YAML and JSON config by name.

## Typing rules for the API

- No `any`, `unknown` parameters or `Record<string, unknown>` bags in the public API. Hook contexts are named interfaces.
- `definePlugin` and `definePreset` use `const` type parameters, so literal ids stay literal. This lets reporter and check ids be typed in config (`checks: { 'missing-translation': 'error' }` autocompletes ids of known plugins through declaration merging of a `CheckIds` interface).
- Plugins that add config keys extend `PluginConfigs` through declaration merging, so `defineConfig` checks their options.

```ts
declare module '@x18n/core' {
  interface PluginConfigs {
    acme: { strict?: boolean }
  }
}
```

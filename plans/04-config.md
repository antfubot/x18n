# 04 - Config

## Files

Looked up from the project root, first match wins:

```
x18n.config.ts  x18n.config.mts  x18n.config.js  x18n.config.mjs
x18n.config.yml  x18n.config.yaml  x18n.config.json
package.json#x18n
```

`@x18n/node` loads them with `unconfig` (TS through its built-in loader). Without a config file, x18n runs on detection alone, the same as i18n-ally `autoDetection`. `x18n init` writes a config with what detection found.

```ts
// x18n.config.ts
import { defineConfig } from 'x18n'
import { vueI18n } from 'x18n/presets'

export default defineConfig({
  sourceLocale: 'en',
  presets: [vueI18n({ sfc: true })],
  resources: [{ pattern: 'src/locales/{locale}.json' }],
  checks: { 'unused-key': 'warning', 'missing-translation': 'error' },
})
```

```yaml
# x18n.config.yml
# yaml-language-server: $schema=./node_modules/@x18n/core/schema/config.json
sourceLocale: en
presets: [vue-i18n]
plugins:
  - ./x18n/acme.x18n-plugin.yml
  - [x18n-plugin-foo, {strict: true}]
resources:
  - pattern: 'src/locales/{locale}.json'
checks:
  unused-key: warning
```

## Options

| Key | Type | Default | Notes |
| --- | --- | --- | --- |
| `root` | string | config dir | Project root. |
| `sourceLocale` | string | detected, else `en` | Source of truth for checks and prompts. |
| `displayLocale` | string | `sourceLocale` | Locale shown in annotations. Editors MAY override per user. |
| `locales` | string[] | all found | Filter. |
| `ignoreLocales` | string[] | `[]` | |
| `localeTags` | `'bcp47' \| 'legacy' \| 'none'` | `'bcp47'` | Locale normalization. |
| `presets` | `'auto' \| PresetOption[]` | `'auto'` | `'auto'` runs `detect` of all built-in presets. |
| `plugins` | PluginOption[] | `[]` | Plugin object, factory result, module specifier, or `[specifier, options]`. |
| `resources` | ResourceSpec[] | from presets | `{ pattern, format?, namespace? }`. Feeds the `pattern` finder. |
| `formats` | `Record<ext, formatId>` | by extension | Explicit format per extension. |
| `keyStyle` | `'auto' \| 'nested' \| 'flat'` | `'auto'` | `'auto'` keeps what each file uses. New files use the style of most files. |
| `namespace` | `{ separator?, default?, fromPath? }` | from presets | |
| `usage.include` / `usage.exclude` | string[] | `**/*` / gitignore + build dirs | Source files to scan. |
| `usage.keysInUse` | string[] (globs) | `[]` | Keys that count as used, for example keys built at runtime. |
| `usage.derivedKeys` | string[] | from presets | Extra derived key rules. |
| `write.sort` | `false \| 'binary' \| 'locale'` | `false` | |
| `write.indent` | number \| `'tab'` | detect per file | |
| `write.keepFilled` | boolean | `false` | i18n-ally `keepFulfilled`. |
| `write.target` | `'same-namespace' \| 'closest-path' \| 'most-similar-keys' \| 'ask'` | `'same-namespace'` | Where new keys go. |
| `extract` | ExtractOptions | from presets | See [11-extraction.md](./11-extraction.md). |
| `checks` | `Record<checkId, Severity \| 'off' \| [Severity, options]>` | check defaults | ESLint-like. |
| `ignoreKeys` | string[] (globs) | `[]` | Keys excluded from all checks. |
| `glossary` | `{ term, translations?, note? }[]` or path | `[]` | Used by translate prompts and an optional `glossary` check. |
| `review` | `{ enabled?, file? }` | `{ enabled: true, file: '.x18n/reviews.yml' }` | See [12-reviews.md](./12-reviews.md). |
| `projects` | string[] (globs) | - | Monorepo: each match is a separate project with its own config, inheriting the root config. |

Plugin options live under the plugin's own key in `PluginConfigs` (see [03-plugins.md](./03-plugins.md)) or in the factory call.

## Resolution

1. Load the file. YAML and JSON go through the valibot schema. TS goes through `defineConfig` types, then the same schema for the serializable part, so errors read the same.
2. Resolve plugin specifiers. Relative `.yml` / `.yaml` load as YAML plugins, other paths and package names are imported (Node only).
3. Expand presets: `'auto'` runs `detect` of every built-in preset. A listed preset always applies.
4. Run `config` hooks in plugin order on a mutable draft. Defaults from presets come first, user values override them. Each value records its origin for `explain()`.
5. Validate the final config. Unknown keys are errors in YAML and JSON (typos are common there) and type errors in TS.
6. Freeze and call `configResolved` hooks.

## Schemas and types

- valibot schemas in `@x18n/core` are the single source for runtime validation, the JSON Schemas and the TS types of the serializable part (`v.InferInput`).
- The build of `@x18n/core` writes `schema/config.json` and `schema/plugin.json` with `@valibot/to-json-schema`. They are part of the package `exports`.
- The docs site also serves them, so `$schema` can point at a URL.
- `x18n-vscode` contributes `jsonValidation` for `x18n.config.json` and `yamlValidation` (through the YAML extension's `yaml.schemas` contribution) for `x18n.config.y?(a)ml` and `*.x18n-plugin.y?(a)ml`.
- `defineConfig` in TS accepts more than the schema (plugin objects, functions). That part is typed by TS only, and the schema shows it as `plugins: (string | [string, object])[]`.
- A test asserts that the TS input type and the valibot output type agree on the serializable keys, so they cannot drift.

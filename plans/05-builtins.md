# 05 - Built-in plugins

`@x18n/builtins` holds every built-in plugin and preset, with tree-shakable subpath exports:

```
@x18n/builtins/formats    json(), jsonc(), json5(), yaml(), po(), properties(), ...
@x18n/builtins/finders    pattern(), sfcBlocks()
@x18n/builtins/scanners   regex(), js(), vue(), svelte(), html()
@x18n/builtins/extractors ...
@x18n/builtins/checks     recommended() and each check
@x18n/builtins/reporters  pretty(), json(), markdown(), github(), sarif()
@x18n/builtins/presets    vueI18n(), i18next(), reactI18next(), nextIntl(), ...
```

`x18n` re-exports `presets` as `x18n/presets` so a TS config has one import source.

Tiers decide the milestone: tier 1 ships with the first release, tier 2 with i18n-ally parity (M11), tier 3 when someone asks.

## Formats

| Id | Extensions | Read | Write | Library | Tier |
| --- | --- | --- | --- | --- | --- |
| `json` | json | yes | in place | `jsonc-parser` (`modify` keeps layout) | 1 |
| `jsonc` | jsonc | yes | in place | `jsonc-parser` | 1 |
| `json5` | json5 | yes | serialize | `json5` | 1 |
| `yaml` | yml, yaml | yes | in place, keeps comments | `yaml` v2 Document API | 1 |
| `po` | po, pot | yes | in place | `pofile` or a small own parser | 2 |
| `properties` | properties | yes | in place | own line-based parser | 2 |
| `ftl` | ftl | yes | in place | `@fluent/syntax` | 2 |
| `arb` | arb | yes | in place (json) | json + `@@locale` and `@key` metadata | 2 |
| `js` / `ts` | js, mjs, cjs, ts, mts | static only: `export default { ... }` and object literals | in place | `oxc-parser` to read, `magicast` to write | 2 |
| `php` | php | static `return [ ... ]` arrays | serialize | own parser | 2 |
| `xliff` | xlf, xliff | yes | in place | small XML parser | 3 |
| `ini` | ini | yes | serialize | `ini` | 3 |
| `strings` | strings (Apple) | yes | in place | own parser | 3 |
| `android-xml` | xml (`res/values*/strings.xml`) | yes | in place | small XML parser | 3 |
| `resx` | resx | yes | in place | small XML parser | 3 |

The `js` / `ts` format never runs user code. A file that is not a static literal is reported as `X18N2004` with a hint to use JSON or YAML, instead of i18n-ally's ts-node execution.

## Locale finders

| Id | What it finds |
| --- | --- |
| `pattern` | Files that match `resources[].pattern` (tokens in [03-plugins.md](./03-plugins.md)). |
| `sfc-blocks` | Vue `<i18n>` blocks (with `lang` and `locale` attributes) and fluent-vue `<fluent>` blocks. |
| `nls` | VS Code extension `package.nls.json` / `package.nls.{locale}.json`. |

## Scanners

| Id | Extensions | Engine |
| --- | --- | --- |
| `js` | js, jsx, mjs, cjs, ts, tsx, mts, cts | `oxc-parser` (native in Node, `@oxc-parser/wasm` in the browser), driven by call specs |
| `vue` | vue | `@vue/compiler-sfc` + `js` |
| `svelte` | svelte | `svelte/compiler` + `js` (Node only at first) |
| `html` | html, and attributes inside other templates | small HTML tokenizer |
| `regex` | any configured | RegExp, i18n-ally compatible |

Other languages (PHP, Ruby, Dart, Blade, ERB) start with `regex` scanners in their presets, with the i18n-ally patterns. AST scanners for them are tier 3.

## Presets

Detection uses the dependencies listed. "Parity" means the i18n-ally framework with the same name works with this preset, checked by the fixture tests in [15-quality.md](./15-quality.md).

| Preset | Detect | Adds | Tier |
| --- | --- | --- | --- |
| `vue-i18n` | vue-i18n, vuex-i18n, @intlify/*, petite-vue-i18n | `$t`, `t`, `tc`, `te`, `d`, `n`, `v-t`, `<i18n-t>`, `useI18n` factory, linked messages `@:key`, `sfc-blocks` | 1 |
| `nuxt-i18n` | @nuxtjs/i18n | `vue-i18n` + Nuxt `langDir` from `nuxt.config` when static, `i18n/locales` default | 1 |
| `i18next` | i18next | `t`, namespaces `ns:key`, plural and context suffixes, `{{x}}` placeholders | 1 |
| `react-i18next` | react-i18next, next-i18next | `i18next` + `useTranslation(ns)` factory, `<Trans i18nKey>`, `keyPrefix` | 1 |
| `next-intl` | next-intl | `useTranslations(ns)` / `getTranslations` factories, `t.rich`, `t.markup`, `t.raw`, ICU placeholders | 1 |
| `react-intl` | react-intl, @formatjs/* | `formatMessage({ id })`, `<FormattedMessage id>`, `defineMessages`, ICU | 1 |
| `svelte-i18n` | svelte-i18n | `$_`, `$t`, `$format` | 1 |
| `vscode-extension` | vscode, @types/vscode | `nls` finder, `%key%` in `package.json`, `l10n.t` | 1 |
| `general` | always last | hard-string extraction for JS/TS/HTML, no scanners | 1 |
| `sveltekit-i18n` | sveltekit-i18n | `$t` | 2 |
| `next-international` | next-international | `useI18n`, `useScopedI18n(scope)` | 2 |
| `next-translate` | next-translate | `{locale}/{namespace}.json`, `ns:key` | 2 |
| `ngx-translate` | @ngx-translate/core | `translate` pipe, `instant`, `get`, `[translate]` | 2 |
| `transloco` | @jsverse/transloco, @ngneat/transloco | pipe, directive, `*transloco="let t; read: 'scope'"` scopes | 2 |
| `lingui` | @lingui/core | `po` format, `{locale}/messages.po`, `t` macro, `<Trans>` | 2 |
| `fluent-vue` | fluent-vue | `ftl` format, `$t`, `<fluent>` blocks | 2 |
| `paraglide` | @inlang/paraglide-js | `messages/{locale}.json`, `m.key()` member calls | 2 |
| `typesafe-i18n` | typesafe-i18n | `LL.key()` member calls, TS locale files | 2 |
| `laravel` | composer: laravel/framework | `php` format, `lang/{locale}/{namespace}.php`, `__()`, `trans()`, `@lang` | 2 |
| `ruby-rails` | Gemfile: rails | `yaml` with top-level locale transform, `t('.lazy')` from view path | 2 |
| `flutter` | pubspec: flutter_localizations, intl, flutter_i18n | `arb` format, `AppLocalizations.of(context).key` | 2 |
| `chrome-extension` | manifest.json with `default_locale` | `_locales/{locale}/messages.json`, `.message` transform, `chrome.i18n.getMessage` | 2 |
| `angular` | @angular/localize | `xliff`, `$localize` | 3 |
| `ember-intl` | ember-intl | `t` helper | 3 |
| `polyglot`, `globalize`, `i18n-tag`, `ui5`, `php-gettext`, `php-joomla`, `jekyll`, `i18n-js` | as in i18n-ally | port of the i18n-ally definition | 3 |

## Checks

| Id | Default | Reports |
| --- | --- | --- |
| `missing-key` | error | A usage whose key is not defined in the source locale. |
| `missing-translation` | warning | A key in the source locale that a target locale lacks. |
| `empty-translation` | warning | An empty string value. |
| `unused-key` | warning | A key with no usage, after `keysInUse`, derived keys and dynamic prefixes. Skipped when the project has no scanners. |
| `placeholder-mismatch` | error | Target value placeholders differ from the source value. |
| `invalid-syntax` | error | Message syntax errors (ICU, vue-i18n linked messages, i18next nesting). |
| `identical-to-source` | off | Target equals source (often untranslated copy). |
| `key-conflict` | error | A key is both a leaf and a parent (`a` and `a.b`), or duplicate across files of the same locale and namespace. |
| `key-style` | off | Key does not match a naming rule (options: `case`, `pattern`). |
| `hard-string` | off | Detected hard-coded string ([11-extraction.md](./11-extraction.md)). |
| `review-changes-requested` | info | An open "request change" review ([12-reviews.md](./12-reviews.md)). |
| `glossary` | off | A glossary term is translated differently from the glossary. |

`recommended()` turns on the defaults above.

## Reporters

| Id | Output | Use |
| --- | --- | --- |
| `pretty` | Colored terminal tables (coverage per locale, grouped diagnostics) | Humans |
| `json` | The versioned JSON contract of [06-cli.md](./06-cli.md) | Tools, agents |
| `markdown` | Summary and tables | PR comments, agent context |
| `github` | `::error file=...` workflow commands | GitHub Actions annotations |
| `sarif` | SARIF 2.1.0 | Code scanning |

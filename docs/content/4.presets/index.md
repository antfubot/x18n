---
title: Presets
description: The built-in presets, how x18n detects them, and the placeholders and extraction templates they add.
---

A preset is a group of plugins for one i18n library. It tells x18n which calls are translate calls, how namespaces work, which placeholder syntax the messages use, and which code replaces a hard string.

| Preset | Library | Detected from |
| --- | --- | --- |
| [`nuxt-i18n`](/presets/nuxt-i18n) | @nuxtjs/i18n | `@nuxtjs/i18n`, `nuxt-i18n` |
| [`vue-i18n`](/presets/vue-i18n) | vue-i18n | `vue-i18n`, `vuex-i18n`, `petite-vue-i18n`, `vue-i18n-bridge`, `@intlify/*` |
| [`react-i18next`](/presets/react-i18next) | react-i18next | `react-i18next`, `next-i18next` |
| [`i18next`](/presets/i18next) | i18next | `i18next` |
| [`next-intl`](/presets/next-intl) | next-intl | `next-intl`, `use-intl` |
| [`react-intl`](/presets/react-intl) | react-intl (FormatJS) | `react-intl`, `@formatjs/*` |
| [`svelte-i18n`](/presets/svelte-i18n) | svelte-i18n | `svelte-i18n` |
| [`vscode-extension`](/presets/vscode-extension) | VS Code extension API | `vscode`, `@types/vscode` |
| [`general`](/presets/general) | none | always |

## Detection

With the default `presets: 'auto'`, x18n tests each preset in the order of the table. A preset applies when the project depends on one of the listed packages. x18n reads the dependencies, dev dependencies and peer dependencies in `package.json`, and the dependencies in `composer.json`, `pubspec.yaml` and `Gemfile`. The manifests in the parent directories, up to the git root, count too.

A preset can be exclusive. When an exclusive preset applies, x18n tests no preset after it. `react-i18next` is exclusive, because it includes everything that the `i18next` preset adds.

Run `x18n doctor` to see the result. Each preset shows as `detected`, `not-detected`, `listed`, or `after-exclusive`.

## List presets

To pick the presets yourself, list them. x18n then applies exactly the listed presets and detects none:

::code-group

```ts [x18n.config.ts]
import { defineConfig } from 'x18n'
import { general, vueI18n } from 'x18n/presets'

export default defineConfig({
  presets: [vueI18n(), general()],
})
```

```yaml [x18n.config.yml]
presets: [vue-i18n, general]
```

::

In TS, the presets are functions from `x18n/presets`: `nuxtI18n`, `vueI18n`, `reactI18next`, `i18next`, `nextIntl`, `reactIntl`, `svelteI18n`, `vscodeExtension` and `general`. In YAML and JSON, use the names in the first column of the table. `presets: []` turns every preset off.

## What a preset adds

Each preset page lists what the preset adds:

- Translate calls: the callee names that count as translate calls, and where the key, the namespace and the key prefix come from. These become `usage.calls`.
- Defaults: namespace rules, derived keys and resource patterns.
- Placeholders: the syntax of the placeholders in messages.
- Extraction templates: the code that replaces a hard string.

Your config adds to these defaults. For example, `usage.calls` in the config adds callees to the ones of the preset. See [How x18n merges the config](/guide/configuration#how-x18n-merges-the-config).

## Placeholders

A placeholder syntax tells x18n how placeholders look in messages. The [`placeholder-mismatch`](/checks/placeholder-mismatch) check and `x18n apply` compare the placeholders of each translation with the source value. Translate prompts list them.

| Syntax | Example | Used by |
| --- | --- | --- |
| braces | `{name}` | vue-i18n, nuxt-i18n, vscode-extension |
| linked | `@:key`, `@.lower:key` | vue-i18n, nuxt-i18n |
| double braces | `{{name}}`, `{{name, format}}`, `{{- raw}}` | i18next, react-i18next |
| nesting | `$t(key)` | i18next, react-i18next |
| ICU | `{name}`, `{count, plural, one {# item} other {# items}}` | next-intl, react-intl, svelte-i18n |

A linked message (`@:key`) and a nesting placeholder (`$t(key)`) name another key. That key then counts as used. The [`invalid-syntax`](/checks/invalid-syntax) check reports a linked message whose key does not exist, and ICU messages that do not parse or that lack an `other` case.

`@x18n/builtins/placeholders` also has `percentBraces` (`%{name}`) and `printf` (`%s`, `%1$s`) for plugins. A [YAML plugin](/plugins/yaml#sections-placeholders) can declare a shape such as `%{name}`.

## Extraction templates

`x18n extract` replaces a hard string with code from a template. A template has these tokens:

| Token | Becomes |
| --- | --- |
| `{key}` | The new key. |
| `{attr}` | The attribute name, for attribute kinds. |
| `{args}` | The arguments of a template string: `, { name: user.name }`. Empty when there are none. |

Each hard string has a kind, which tells where it is:

| Kind | Example |
| --- | --- |
| `jsx-text` | `<p>Hello</p>` in JSX |
| `jsx-attribute` | `<input placeholder="Search" />` in JSX |
| `vue-template-text` | Text in a Vue template |
| `vue-attribute` | An attribute in a Vue template |
| `svelte-text` | Text in a Svelte component |
| `svelte-attribute` | An attribute in a Svelte component |
| `js-string` | A string literal in JS or TS |
| `js-template` | A template string in JS or TS |

x18n picks the first template that matches the kind (`kinds`) and the file (`files`). It tries the templates of `extract.templates` first, then those of the presets, then these defaults:

| Kinds | Template |
| --- | --- |
| `jsx-text` | `{t('{key}'{args})}` |
| `jsx-attribute` | `{attr}={t('{key}'{args})}` |
| `vue-template-text` | `{{ $t('{key}'{args}) }}` |
| `vue-attribute` | `:{attr}="$t('{key}'{args})"` |
| `svelte-text` | `{$t('{key}'{args})}` |
| `svelte-attribute` | `{attr}={$t('{key}'{args})}` |
| any | `t('{key}'{args})` |

A template can add `imports`: lines that x18n adds once to the file when they are missing, such as `import { useI18n } from 'vue-i18n'`.

```ts [x18n.config.ts]
import { defineConfig } from 'x18n'

export default defineConfig({
  extract: {
    keyPrefix: '{component}',
    templates: [
      {
        template: 'i18n.t(\'{key}\'{args})',
        kinds: ['js-string', 'js-template'],
        files: ['src/server/**'],
        imports: ['import { i18n } from \'~/i18n\''],
      },
    ],
  },
})
```

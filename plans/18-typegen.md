# 18 - Typegen (1.x)

Generated TypeScript types for keys and message parameters. Typegen is opt-in, for TypeScript projects only, and ships after 1.0 (M13). The design is settled now so 1.0 does not block it.

## What it generates

- x18n builds the messages type itself from the merged source-locale view. That works for every format and layout: YAML, PO, multi-file namespaces, Vue `<i18n>` blocks. `typeof import('./en.json')` covers none of these.
- Each preset emits that type as the library's own augmentation, through the plugin `typegen` hook:

| Preset | Augmentation |
| --- | --- |
| `i18next`, `react-i18next` | `CustomTypeOptions['resources']` (per namespace) |
| `vue-i18n`, `nuxt-i18n` | `DefineLocaleMessage` |
| `next-intl` | `AppConfig['Messages']` |
| `react-intl` | `FormatjsIntl.Message['ids']` |

- Message parameters are typed from placeholder syntax where the library accepts typed params:
  - `{name}` becomes `string | number`
  - ICU `{count, plural, ...}` becomes `number`
  - `{d, date}` becomes `Date`

  Libraries that cannot take typed params get keys only. When a library infers parameters from literal values (i18next), leaves are emitted as literal types; otherwise as `string`.
- Other presets get typegen later through the same hook. YAML plugins can name a typegen target.

## Setup

```ts
export default defineConfig({
  typegen: true, // or { output: 'src/x18n.d.ts' }
})
```

- Output is one file, `x18n.d.ts` at the project root by default, **committed to git**, so plain `tsc` works in CI without running x18n first.
- In projects without `typescript` or a tsconfig, `typegen` is ignored with a notice.

## When it runs

| Trigger | Behaviour |
| --- | --- |
| `x18n typegen [--watch]` | Writes the file; `--watch` regenerates on resource changes. |
| LSP | Regenerates (debounced) whenever a source-locale resource changes, including edits from rename, the UI or agents, so editor types follow. |
| `x18n check` | The `typegen-stale` check (error in `recommended`) fails when the committed file is out of date. |

## Interaction with rename

Typed keys make tsserver accept rename on key literals. The VS Code coexistence strategy in [08-vscode.md](./08-vscode.md) keeps x18n's rename in charge. After a rename, the LSP regenerates `x18n.d.ts` in the same `WorkspaceEdit`, so types and files stay in sync.

# 08 - VS Code extension

Package `packages/vscode`, published as `antfu.x18n-vscode` (publisher and id to confirm) to the Marketplace and Open VSX. Built with `reactive-vscode`, types and meta from `vscode-ext-gen`, bundled by tsdown to CJS with `vscode` external, `--no-dependencies` packaging. Engine `^1.100.0`.

The extension holds no i18n logic. Everything comes from the LSP through standard and `x18n/*` requests.

## Activation

- `workspaceContains:**/x18n.config.*`, `workspaceContains:**/package.json` (the server then decides, and stays idle when nothing is detected), and `onCommand:x18n.*`.
- Starts the bundled `x18n-lsp` with `vscode-languageclient` over node IPC. The document selector is broad (`file` scheme, all languages); the server ignores files it has no scanner or format for.

## Features

| Feature | Built from |
| --- | --- |
| Inline annotations and in-place mode | `x18n/decorations` + `TextEditorDecorationType`. Falls back to LSP inlay hints when in-place is off. Same options as i18n-ally: `annotations`, `annotationInPlace`, `annotationMaxLength`, `annotationDelimiter`. |
| Hover, completion, definition, references, rename, diagnostics, code actions | Standard LSP. |
| Activity bar container with views: Current File, Progress, Keys, Usage Report, Reviews | `x18n/fileKeys`, `x18n/progress`, `x18n/tree`, `x18n/usageReport`, review requests. Refresh on `x18n/changed`. |
| Status bar: display locale and source locale | `x18n/projects`, `x18n/setDisplayLocale`. |
| x18n UI panel | Webview panel whose content is an `<iframe>` of `asExternalUri(url)` from `x18n/openUi`. |
| Key editor | Same UI, opened at the key route (`#/keys/<key>`), replaces the i18n-ally Vue 2 webview. |
| Review comments | VS Code Comments API threads on key usages and resource lines, backed by review requests. |
| Schema validation | `jsonValidation` for `x18n.config.json`; `yaml.schemas` contribution for `x18n.config.y?(a)ml` and `*.x18n-plugin.y?(a)ml`. |
| Copy translate prompt | Command and hover link, via `x18n/translatePrompt`, to the clipboard. |
| i18n-ally migration | When `.vscode/settings.json` has `i18n-ally.*` keys and no x18n config exists, offer "Migrate from i18n-ally" (runs the migration through the server, shows the diff). |

## Webview embedding details

- The webview sets a CSP that allows `frame-src` of the external URI only.
- Theme: the iframe URL carries `?theme=dark|light|high-contrast`, and the webview script forwards `vscode` theme changes with `postMessage` to the iframe. The UI listens only for messages from its parent with the expected shape.
- In Remote, Codespaces and WSL, `asExternalUri` forwards the port. The server binds to loopback only.
- Auth: the token from `x18n/openUi` is passed in the URL fragment, which devframe reads as a magic link, so it is not sent in requests or logs.

## Settings

Only editor UX settings, under `x18n.*`: `enabled`, `annotations`, `annotationInPlace`, `annotationMaxLength`, `annotationDelimiter`, `displayLocale`, `codeLens`, `trace.server`. Everything about the project is in the config file, so CLI, CI and editor agree.

## Commands

Generated into `src/generated/meta.ts` by `vscode-ext-gen`. Initial set: `x18n.openUi`, `x18n.openKey`, `x18n.setDisplayLocale`, `x18n.setSourceLocale`, `x18n.editKey`, `x18n.renameKey`, `x18n.deleteKey`, `x18n.extract`, `x18n.extractFile`, `x18n.copyTranslatePrompt`, `x18n.goToNextUsage`, `x18n.goToPrevUsage`, `x18n.restartServer`, `x18n.migrateFromI18nAlly`, `x18n.showOutput`.

## Testing

- Unit tests for view models with a fake language client.
- `@vscode/test-electron` e2e on one fixture: activation, inlay hint text, a rename, the UI panel opens (M8 exit criteria).

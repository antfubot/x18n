# 07 - Language server

Package `@x18n/lsp`, binary `x18n-lsp` (`--stdio`, `--node-ipc`, `--socket=<port>`). Built on `vscode-languageserver` and `vscode-languageserver-textdocument`. It MUST work in any LSP client; VS Code-only features use custom requests that other clients can ignore.

## Server state

- One `Project` per workspace folder that has a config file or a detected preset. Folders without either stay inactive, so the server is cheap in unrelated repos.
- An overlay host on top of the node host: open documents shadow disk content. `didChange` re-scans the document (debounced) without a save, which fixes the i18n-ally limit of updating only on save.
- File watching through `workspace/didChangeWatchedFiles` when the client supports dynamic registration, else the node host watcher.

## Standard features

| LSP request | Behaviour | i18n-ally origin |
| --- | --- | --- |
| `textDocument/inlayHint` | Value in the display locale after each key usage. Missing value shows the fallback locale value or "missing". Respects `maxLength`. | `editor/annotation.ts` |
| `textDocument/hover` | Table of all locale values, review state, number of usages, and command links (edit, open in UI, copy translate prompt). | `editor/hover.ts` |
| `textDocument/completion` | Keys at key slots reported by scanners, filtered by scope prefix. Item detail shows the source value. Trigger characters `.`, `'`, `"`, `` ` ``, `:`. | `editor/completion.ts` |
| `textDocument/definition` | Locations of the key in every locale resource (source locale first). | `editor/definition.ts` |
| `textDocument/references` | All usages, plus the definitions in resources. | `editor/reference.ts` |
| `textDocument/prepareRename`, `rename` | Rename key across resources and usages, as one `WorkspaceEdit` from the edit planner. | `editor/reference.ts` |
| `textDocument/publishDiagnostics` (and pull `textDocument/diagnostic` when supported) | Diagnostics of the file: missing key, missing translation in display locale, hard strings, placeholder mismatch inside resources. | `editor/problems.ts` |
| `textDocument/codeAction` | Quick fixes from diagnostic `fixes`: add missing key, fill from source, extract string, ignore string (file or global), replace selection with an existing key with the same value. | `editor/refactor.ts`, `editor/extract.ts` |
| `textDocument/documentSymbol` | In resource files: key tree. | new |
| `workspace/symbol` | Search keys and values across the project. | new |
| `textDocument/codeLens` (opt-in) | In resource files: "used 3 times", "missing in de, fr". | new |
| `workspace/executeCommand` | `x18n.set`, `x18n.delete`, `x18n.extract`, `x18n.review.*`. | commands |

Hover and inlay hints inside resource files show the value in the display locale next to the same key in another locale file, as i18n-ally did for locale files.

## Custom protocol

All under the `x18n/` method prefix. Shapes are valibot schemas shared with the client and versioned with the JSON contract version of [06-cli.md](./06-cli.md).

| Method | Kind | Purpose |
| --- | --- | --- |
| `x18n/projects` | request | List active projects, locales, source and display locale. |
| `x18n/tree` | request | Key tree with coverage per node, for tree views. Lazy by parent key. |
| `x18n/progress` | request | Coverage per locale with missing and empty key lists. |
| `x18n/fileKeys` | request | Keys used in a document, keys not found, hard strings (Current File view). |
| `x18n/usageReport` | request | Unused and missing keys with locations. |
| `x18n/decorations` | request | Ranges and values for in-place annotation (hide the key, show the value). Clients that cannot hide text use inlay hints instead. |
| `x18n/setDisplayLocale` | notification | Per-client display locale. |
| `x18n/openUi` | request | Start (or reuse) the UI server for a project; returns `{ url, token }`. |
| `x18n/translatePrompt` | request | Prompt text for a locale or key set. |
| `x18n/changed` | server notification | Project revision and changed keys, so client views refresh only what changed. |

## Hosting the UI

`x18n/openUi` starts the devframe dev server from `@x18n/ui` inside the server process, on `127.0.0.1` and a free port, using the same `Project` instance. The UI and the editor then see the same state and the same edits. The token is a devframe client auth token, so the iframe needs no OTP. The server stops the UI server when the last client disconnects, or on `shutdown`.

"Open in editor" actions in the UI call an RPC that the LSP turns into `window/showDocument`, which works in every client that supports it.

## Other editors

Docs give setup for Neovim (`nvim-lspconfig` snippet), Zed (extension manifest) and Helix (`languages.toml`). The server reads its settings from `workspace/configuration` section `x18n` (editor UX only, for example `annotations`, `displayLocale`). Project settings live in the config file, never in editor settings.

## Testing

- In-process tests: create the connection with `PassThrough` streams and drive it with `vscode-languageserver/node` client messages against fixture projects with a memory host.
- One smoke test spawns the built binary over stdio.

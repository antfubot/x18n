# x18n

Manage and view the i18n files of any project, for humans and agents.

x18n takes the ideas of [i18n-ally](https://github.com/lokalise/i18n-ally) and rebuilds them as layers that work outside VS Code:

| Package | What it is |
| --- | --- |
| [`@x18n/core`](./packages/core) | Engine that runs in Node and in the browser: domain model, plugin API, analysis, edits |
| [`@x18n/builtins`](./packages/builtins) | Built-in plugins: formats, locale finders, usage scanners, checks, reporters, presets for popular i18n libraries |
| [`@x18n/node`](./packages/node) | Node.js host: file system, config and plugin loading |
| [`x18n`](./packages/cli) | The CLI, with JSON output for CI and agents |
| [`@x18n/lsp`](./packages/lsp) | Language server for any LSP editor |
| [`@x18n/ui`](./packages/ui) | devframe UI: local dev server, static report, in-browser workspace, VS Code panel |
| [`x18n-vscode`](./packages/vscode) | VS Code extension on top of the language server |

> [!NOTE]
> x18n is in early development. Nothing is published yet. Read the [plan](./plans/README.md).

## License

[MIT](./LICENSE.md) License © [Anthony Fu](https://github.com/antfu)

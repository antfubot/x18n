import type { Connection } from 'vscode-languageserver'
import { TextDocumentSyncKind } from 'vscode-languageserver'
import { version } from '../package.json' with { type: 'json' }

/** Registers the x18n handlers on a connection. The caller owns transport and `listen()`. */
export function setupServer(connection: Connection): void {
  connection.onInitialize(() => ({
    serverInfo: { name: 'x18n', version },
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
    },
  }))
}

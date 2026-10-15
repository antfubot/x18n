import type { LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node'
import { defineExtension, extensionContext, useCommand } from 'reactive-vscode'
import { Uri } from 'vscode'
import { LanguageClient, TransportKind } from 'vscode-languageclient/node'
import { commands, displayName } from './generated/meta'

const { activate, deactivate } = defineExtension(async () => {
  const context = extensionContext.value
  if (!context)
    return

  const module = Uri.joinPath(context.extensionUri, 'dist', 'server.cjs').fsPath
  const serverOptions: ServerOptions = {
    run: { module, transport: TransportKind.ipc },
    debug: { module, transport: TransportKind.ipc, options: { execArgv: ['--nolazy', '--inspect=6009'] } },
  }
  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file' }],
  }

  const client = new LanguageClient('x18n', displayName, serverOptions, clientOptions)
  useCommand(commands.restartServer, () => client.restart())
  await client.start()
  return { dispose: () => client.stop() }
})

export { activate, deactivate }

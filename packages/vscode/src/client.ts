import type { Decoration } from '@x18n/lsp'
import type { ExtensionContext } from 'vscode'
import type { LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node'
import { Uri } from 'vscode'
import { LanguageClient, TransportKind } from 'vscode-languageclient/node'
import { config } from './config'
import { displayName } from './generated/meta'
import { hintCovered } from './model/inplace'
import { dedupeLocations } from './model/locations'

export interface ClientHooks {
  /** Decorations of a document, for dropping inlay hints that in-place mode already shows. */
  readonly decorations: (uri: string) => Promise<readonly Decoration[]>
  /** Runs `x18n.extract` when invoked without the server's `{ uri }` argument (palette, keybinding). */
  readonly extractAtCursor: () => Promise<void>
}

export function createClient(context: ExtensionContext, hooks: ClientHooks): LanguageClient {
  const module = Uri.joinPath(context.extensionUri, 'dist', 'server.cjs').fsPath
  const serverOptions: ServerOptions = {
    run: { module, transport: TransportKind.ipc },
    debug: { module, transport: TransportKind.ipc, options: { execArgv: ['--nolazy', '--inspect=6009'] } },
  }
  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: 'file' }],
    // Read on every (re)start, so a restart after a settings change picks up new values.
    initializationOptions: () => ({
      displayLocale: config.displayLocale || undefined,
      annotationMaxLength: config.annotationMaxLength,
      codeLens: config.codeLens,
    }),
    middleware: {
      // VS Code merges references from every provider and has no API to read the others' results from inside one
      // provider without recursing into ours, so only our own duplicates (a key both used and defined in one spot) go.
      provideReferences: async (document, position, options, token, next) => {
        const locations = await next(document, position, options, token)
        return locations && dedupeLocations(locations)
      },
      provideInlayHints: async (document, range, token, next) => {
        if (!config.annotations)
          return []
        const hints = await next(document, range, token)
        if (!hints || !config.inPlace)
          return hints
        const decorations = await hooks.decorations(document.uri.toString())
        return hints.filter(hint => !hintCovered(hint.position, decorations, config.annotationMaxLength))
      },
      // The client registers the server's `x18n.extract` as a VS Code command, so the palette entry lands here too.
      executeCommand: (command, args, next) => command === 'x18n.extract' && args.length === 0 ? hooks.extractAtCursor() : next(command, args),
    },
  }
  return new LanguageClient('x18n', displayName, serverOptions, clientOptions)
}

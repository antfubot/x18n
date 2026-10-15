import { PassThrough } from 'node:stream'
import { afterEach, describe, expect, it } from 'vitest'
import { createMessageConnection, StreamMessageReader, StreamMessageWriter } from 'vscode-jsonrpc/node'
import { createConnection, InitializeRequest, TextDocumentSyncKind } from 'vscode-languageserver/node'
import { version } from '../package.json' with { type: 'json' }
import { setupServer } from '../src'

const disposers: (() => void)[] = []

afterEach(() => {
  disposers.splice(0).forEach(dispose => dispose())
})

function connect() {
  const toServer = new PassThrough()
  const toClient = new PassThrough()
  const server = createConnection(new StreamMessageReader(toServer), new StreamMessageWriter(toClient))
  setupServer(server)
  server.listen()
  const client = createMessageConnection(new StreamMessageReader(toClient), new StreamMessageWriter(toServer))
  client.listen()
  disposers.push(() => client.dispose(), () => server.dispose())
  return client
}

describe('language server', () => {
  it('answers initialize with server info and sync kind', async () => {
    const client = connect()
    const result = await client.sendRequest(InitializeRequest.type, {
      processId: null,
      rootUri: null,
      capabilities: {},
    })
    expect(result.serverInfo).toEqual({ name: 'x18n', version })
    expect(result.capabilities.textDocumentSync).toBe(TextDocumentSyncKind.Incremental)
  })
})

import { createConnection, ProposedFeatures } from 'vscode-languageserver/node'
import { setupServer } from './index'

// Transport (--stdio, --node-ipc, --socket) is picked from argv by `createConnection`.
const connection = createConnection(ProposedFeatures.all)
setupServer(connection)
connection.listen()

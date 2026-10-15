import { setupServer } from '@x18n/lsp'
import { createConnection, ProposedFeatures } from 'vscode-languageserver/node'

const connection = createConnection(ProposedFeatures.all)
setupServer(connection)
connection.listen()

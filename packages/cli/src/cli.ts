import cac from 'cac'
import { version } from '../package.json' with { type: 'json' }

const cli = cac('x18n')

cli.help()
cli.version(version)
cli.parse()

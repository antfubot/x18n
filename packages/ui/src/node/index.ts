import type { DevframeDefinition } from 'devframe'
import { fileURLToPath } from 'node:url'
import { defineDevframe, defineRpcFunction } from 'devframe'
import { description, homepage, name, version } from '../../package.json' with { type: 'json' }

const info = defineRpcFunction({
  name: 'info',
  type: 'static',
  jsonSerializable: true,
  handler: () => ({ version }),
})

export function createX18nDevframe(): DevframeDefinition {
  return defineDevframe({
    id: 'x18n',
    name: 'x18n',
    version,
    packageName: name,
    homepage,
    description,
    importMetaUrl: import.meta.url,
    clientAssets: fileURLToPath(new URL('./public', import.meta.url)),
    setup(ctx) {
      ctx.scope('x18n').rpc.register(info)
    },
  })
}

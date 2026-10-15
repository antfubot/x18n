import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describePackagesApiSnapshots } from 'tsnapi/vitest'

describePackagesApiSnapshots({
  cwd: fileURLToPath(new URL('..', import.meta.url)),
  filter(ctx) {
    const pkg: { private?: boolean } = JSON.parse(readFileSync(`${ctx.packageRoot}/package.json`, 'utf8'))
    return !pkg.private
  },
})

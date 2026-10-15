import { execFile } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { describe, expect, it } from 'vitest'
import { version } from '../package.json' with { type: 'json' }

const bin = fileURLToPath(new URL('../bin.mjs', import.meta.url))
const run = promisify(execFile)

describe('x18n binary', () => {
  it('prints its version', async () => {
    const { stdout } = await run(process.execPath, [bin, '--version'])
    expect(stdout).toContain(`x18n/${version}`)
  })
})

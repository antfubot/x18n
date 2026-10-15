import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createNodeHost } from '../src'

let root: string

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'x18n-node-'))
})

afterEach(async () => {
  await rm(root, { recursive: true, force: true })
})

describe('createNodeHost', () => {
  it('writes into missing directories and reads back', async () => {
    const host = createNodeHost(root)
    await host.writeFile('locales/de/common.json', '{}\n')
    expect(await readFile(join(root, 'locales/de/common.json'), 'utf8')).toBe('{}\n')
    expect(await host.readFile('locales/de/common.json')).toBe('{}\n')
  })

  it('returns undefined for missing files', async () => {
    expect(await createNodeHost(root).readFile('nope.json')).toBeUndefined()
  })
})

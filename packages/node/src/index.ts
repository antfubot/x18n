import type { Host } from '@x18n/core'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

export function createNodeHost(root: string): Host {
  return {
    async readFile(path) {
      try {
        return await readFile(resolve(root, path), 'utf8')
      }
      catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT')
          return undefined
        throw error
      }
    },
    async writeFile(path, content) {
      const file = resolve(root, path)
      await mkdir(dirname(file), { recursive: true })
      await writeFile(file, content, 'utf8')
    },
  }
}

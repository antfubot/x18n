import type { Host } from './types'

export interface MemoryHost extends Host {
  readonly files: ReadonlyMap<string, string>
}

export function createMemoryHost(initial: Readonly<Record<string, string>> = {}): MemoryHost {
  const files = new Map(Object.entries(initial))
  return {
    files,
    readFile: async path => files.get(path),
    writeFile: async (path, content) => {
      files.set(path, content)
    },
  }
}

import type { Host } from './types/host'

export interface OverlayHost extends Host {
  /** Shadows the file content, for example with an unsaved editor buffer. */
  readonly setOverlay: (path: string, content: string) => void
  readonly clearOverlay: (path: string) => void
  readonly hasOverlay: (path: string) => boolean
}

/** Wraps a host so open editor buffers shadow the content on disk. */
export function createOverlayHost(base: Host): OverlayHost {
  const overlays = new Map<string, string>()
  return {
    ...base,
    readFile: async path => overlays.get(path) ?? base.readFile(path),
    async writeFile(path, content) {
      overlays.delete(path)
      await base.writeFile(path, content)
    },
    setOverlay: (path, content) => {
      overlays.set(path, content)
    },
    clearOverlay: (path) => {
      overlays.delete(path)
    },
    hasOverlay: path => overlays.has(path),
  }
}

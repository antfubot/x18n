import type { Format, MessageTree, Plugin } from '@x18n/core'
import { definePlugin, isMessageTree } from '@x18n/core'

export interface JsonOptions {
  /** Spaces per level. Default 2. */
  readonly indent?: number
}

export function json(options: JsonOptions = {}): Plugin {
  const indent = options.indent ?? 2
  const format: Format = {
    id: 'json',
    extensions: ['json'],
    parse(text) {
      const data: unknown = JSON.parse(text)
      if (!isMessageTree(data))
        throw new TypeError('JSON locale file must be an object of strings, numbers, booleans, null or nested objects')
      return data
    },
    serialize: (tree: MessageTree) => `${JSON.stringify(tree, null, indent)}\n`,
  }
  return definePlugin({ name: 'x18n:format-json', formats: [format] })
}

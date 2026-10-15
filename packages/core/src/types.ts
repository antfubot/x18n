export type MessageLeaf = string | number | boolean | null

export interface MessageTree {
  readonly [segment: string]: MessageLeaf | MessageTree
}

export interface Format {
  readonly id: string
  /** File extensions without the leading dot. */
  readonly extensions: readonly string[]
  readonly parse: (text: string) => MessageTree
  /** Missing when the format is read-only. */
  readonly serialize?: (tree: MessageTree) => string
}

export interface Plugin {
  /** Unique, kebab-case. Built-ins use the `x18n:` prefix. */
  readonly name: string
  readonly formats?: readonly Format[]
}

export interface UserConfig {
  readonly sourceLocale?: string
  readonly plugins?: readonly Plugin[]
}

export interface Host {
  /** Resolves to `undefined` when the file does not exist. */
  readonly readFile: (path: string) => Promise<string | undefined>
  readonly writeFile: (path: string, content: string) => Promise<void>
}

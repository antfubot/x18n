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

export interface Preset {
  readonly name: string
  readonly plugins: readonly (Plugin | Preset)[]
}

export interface ResourceSpec {
  /** Path pattern with `{locale}`, `{namespace}`, `{namespaces}` and `{ext}` tokens. */
  readonly pattern: string
  readonly format?: string
  readonly namespace?: string
  /** Run matching JS/TS files in Node instead of reading them statically. Makes them read-only. */
  readonly execute?: boolean
}

export type Severity = 'error' | 'warning' | 'info' | 'hint'

export interface UsageOptions {
  readonly include?: readonly string[]
  readonly exclude?: readonly string[]
  /** Keys (globs) that count as used, for example keys built at runtime. */
  readonly keysInUse?: readonly string[]
  /** Callee names never counted as translate calls. */
  readonly ignoreCallees?: readonly string[]
}

export interface UserConfig {
  readonly sourceLocale?: string
  /** Locale codes as written in paths. Filters the found locales. */
  readonly locales?: readonly string[]
  readonly ignoreLocales?: readonly string[]
  /** `'auto'` detects built-in presets from the project's dependencies. */
  readonly presets?: 'auto' | readonly Preset[]
  readonly plugins?: readonly Plugin[]
  readonly resources?: readonly ResourceSpec[]
  readonly keyStyle?: 'auto' | 'nested' | 'flat'
  readonly usage?: UsageOptions
  /** Overrides on top of the `recommended` check set. */
  readonly checks?: Readonly<Record<string, Severity | 'off'>>
  /** Turn every warning into an error. */
  readonly strict?: boolean
  /** Keys (globs) excluded from all checks. */
  readonly ignoreKeys?: readonly string[]
  /** Monorepo: directories (globs) that are projects inheriting this config. */
  readonly projects?: readonly string[]
}

export interface Host {
  /** Resolves to `undefined` when the file does not exist. */
  readonly readFile: (path: string) => Promise<string | undefined>
  readonly writeFile: (path: string, content: string) => Promise<void>
}

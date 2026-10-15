/**
 * Every coded error. Groups: 0xxx config, 1xxx plugin, 2xxx discovery and parse,
 * 3xxx scanning, 4xxx edits, 5xxx reviews.
 */
export type ErrorCode
  = 'X18N0001'
    | 'X18N0002'
    | 'X18N0003'
    | 'X18N1001'
    | 'X18N1002'
    | 'X18N1003'
    | 'X18N1004'
    | 'X18N2001'
    | 'X18N2002'
    | 'X18N2003'
    | 'X18N2004'
    | 'X18N3001'
    | 'X18N4001'
    | 'X18N4002'
    | 'X18N4003'
    | 'X18N4004'
    | 'X18N4005'
    | 'X18N4006'
    | 'X18N4007'
    | 'X18N4008'

export const errorCodes: { readonly [C in ErrorCode]: { readonly message: string, readonly hint: string } } = {
  X18N0001: { message: 'Invalid config', hint: 'Check the reported field against the config schema (`x18n schema config`).' },
  X18N0002: { message: 'Config file could not be loaded', hint: 'Fix the syntax error, or run `x18n doctor` for details.' },
  X18N0003: { message: 'Unknown project', hint: 'Pick a project name listed by `x18n status`.' },
  X18N1001: { message: 'Plugin could not be loaded', hint: 'Install the plugin package, or check the path.' },
  X18N1002: { message: 'Duplicate capability id', hint: 'Rename the id, or set `override: true` on the later one.' },
  X18N1003: { message: 'Unknown preset', hint: 'Use a preset name listed in the docs, or a preset object.' },
  X18N1004: { message: 'Invalid YAML plugin', hint: 'Validate the file against `schema/plugin.json`.' },
  X18N2001: { message: 'No format for resource', hint: 'Map the extension in `formats`, or add a format plugin.' },
  X18N2002: { message: 'Resource could not be parsed', hint: 'Fix the syntax error in the file.' },
  X18N2003: { message: 'Resource is not an object of messages', hint: 'Locale files hold nested objects of strings, numbers, booleans or null.' },
  X18N2004: { message: 'Locale file is not static', hint: 'Use JSON or YAML, or opt in to execution with `execute: true` on the resource pattern.' },
  X18N3001: { message: 'Source file could not be scanned', hint: 'Fix the syntax error, or exclude the file with `usage.exclude`.' },
  X18N4001: { message: 'Resource is read-only', hint: 'Edit the source of computed values, or use a writable format.' },
  X18N4002: { message: 'Rename target already exists', hint: 'Delete or rename the existing key first.' },
  X18N4003: { message: 'A decision is needed', hint: 'Answer the listed decisions, or pass `--yes` to accept defaults.' },
  X18N4004: { message: 'Plan is stale', hint: 'Files changed since the plan was made. Plan again.' },
  X18N4005: { message: 'No resource for the key', hint: 'Add a resource pattern for the locale, or create the locale file.' },
  X18N4006: { message: 'Key not found', hint: 'List keys with `x18n keys`.' },
  X18N4007: { message: 'Placeholder mismatch', hint: 'Keep every placeholder of the source value, or pass `--force`.' },
  X18N4008: { message: 'Invalid edit input', hint: 'Check the input shape against the docs.' },
}

export interface ErrorInfo {
  readonly code: ErrorCode
  readonly message: string
  readonly hint: string
  readonly docs: string
}

export class X18nError extends Error {
  readonly code: ErrorCode
  readonly hint: string
  readonly docs: string
  readonly details: readonly string[]

  constructor(code: ErrorCode, detail?: string, details: readonly string[] = []) {
    const base = errorCodes[code]
    super(detail ? `${base.message}: ${detail}` : base.message)
    this.name = 'X18nError'
    this.code = code
    this.hint = base.hint
    this.docs = `https://x18n.antfu.dev/errors/${code.toLowerCase()}`
    this.details = details
  }

  toJSON(): ErrorInfo {
    return { code: this.code, message: this.message, hint: this.hint, docs: this.docs }
  }
}

export function isX18nError(error: unknown): error is X18nError {
  return error instanceof X18nError
}

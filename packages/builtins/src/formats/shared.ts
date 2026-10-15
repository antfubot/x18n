import type { MessageLeaf } from '@x18n/core'

/** Indent of the first indented line, so edits keep the file's style. */
export function detectIndent(text: string, fallback: number | 'tab' | undefined): { readonly insertSpaces: boolean, readonly tabSize: number } {
  if (fallback === 'tab')
    return { insertSpaces: false, tabSize: 1 }
  if (typeof fallback === 'number')
    return { insertSpaces: true, tabSize: fallback }
  const match = /^([ \t]+)\S/m.exec(text)
  if (match?.[1]?.startsWith('\t'))
    return { insertSpaces: false, tabSize: 1 }
  return { insertSpaces: true, tabSize: match?.[1]?.length ?? 2 }
}

export function detectEol(text: string): string {
  return text.includes('\r\n') ? '\r\n' : '\n'
}

export function toLeaf(value: unknown): MessageLeaf | undefined {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
    return value
  if (value instanceof Date)
    return value.toISOString()
  return undefined
}

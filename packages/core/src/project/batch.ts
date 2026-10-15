import type { EditOp, JsonValue, KeyString, LocaleCode, MessageLeaf } from '../types/model'
import type { Project } from '../types/project'
import { X18nError } from '../errors'
import { isJsonObject } from '../schema'

/** A value whose placeholders differ from the source value of its key. */
export interface PlaceholderProblem {
  readonly key: KeyString
  readonly locale: LocaleCode
  readonly missing: readonly string[]
  readonly extra: readonly string[]
}

function isLeaf(value: JsonValue): value is MessageLeaf {
  return value === null || typeof value !== 'object'
}

/** Parses the batch shape `{ "<locale>": { "<key>": "<value>" } }` (as in `x18n apply`) into set ops. */
export function parseMessageBatch(project: Project, data: JsonValue): EditOp[] {
  if (!isJsonObject(data))
    throw new X18nError('X18N4008', 'expected { "<locale>": { "<key>": "<value>" } }')
  const ops: EditOp[] = []
  for (const [locale, entries] of Object.entries(data)) {
    if (!isJsonObject(entries))
      throw new X18nError('X18N4008', `"${locale}" must map keys to values`)
    for (const [raw, value] of Object.entries(entries)) {
      if (!isLeaf(value))
        throw new X18nError('X18N4008', `"${locale}.${raw}" must be a string, number, boolean or null`)
      ops.push({ type: 'set', key: project.parseKey(raw), locale, value })
    }
  }
  return ops
}

/** Set ops whose value drops or adds placeholders compared to the source value. */
export function placeholderProblems(project: Project, ops: readonly EditOp[]): PlaceholderProblem[] {
  const names = (text: string): string[] => project.placeholderSyntaxes.flatMap(s => s.find(text)).map(ph => ph.name).sort()
  return ops.flatMap((op) => {
    if (op.type !== 'set' || op.locale === project.sourceLocale || typeof op.value !== 'string')
      return []
    const source = project.message(op.key, project.sourceLocale)?.value
    if (typeof source !== 'string')
      return []
    const expected = names(source)
    const actual = names(op.value)
    const missing = expected.filter(n => !actual.includes(n))
    const extra = actual.filter(n => !expected.includes(n))
    return missing.length || extra.length ? [{ key: op.key, locale: op.locale, missing, extra }] : []
  })
}

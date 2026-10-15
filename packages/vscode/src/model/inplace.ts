import type { Decoration, Range } from '@x18n/lsp'

export interface InPlace {
  /** Key text hidden and replaced by `text`. */
  readonly replaced: readonly { readonly range: Range, readonly text: string }[]
  /** Keys with no value, shown as the raw key in a warning color. */
  readonly missing: readonly Range[]
}

/** Whether in-place mode handles the decoration; the rest falls back to the server's inlay hints. */
function coveredByInPlace(decoration: Decoration, maxLength: number): boolean {
  if (decoration.state === 'missing')
    return true
  return decoration.state === 'ok' && decoration.range.start.line === decoration.range.end.line
    && decoration.value !== undefined && decoration.value.length <= maxLength
}

function revealed(range: Range, selections: readonly Range[]): boolean {
  return selections.some(s => range.start.line <= s.end.line && range.end.line >= s.start.line)
}

/** Splits decorations into what to draw; keys on a line touched by a selection or the cursor stay raw. */
export function computeInPlace(decorations: readonly Decoration[], selections: readonly Range[], maxLength: number): InPlace {
  const replaced: { range: Range, text: string }[] = []
  const missing: Range[] = []
  for (const decoration of decorations) {
    if (decoration.state === 'missing')
      missing.push(decoration.range)
    else if (decoration.value !== undefined && coveredByInPlace(decoration, maxLength) && !revealed(decoration.range, selections))
      replaced.push({ range: decoration.range, text: decoration.value.replace(/\s*\n\s*/g, ' ') })
  }
  return { replaced, missing }
}

/** Whether an inlay hint sits right after a key that in-place mode already shows (hints go one past the closing quote). */
export function hintCovered(position: { line: number, character: number }, decorations: readonly Decoration[], maxLength: number): boolean {
  return decorations.some(d => d.range.end.line === position.line && d.range.end.character + 1 === position.character && coveredByInPlace(d, maxLength))
}

import type { Position, Range } from '@x18n/lsp'

interface LocationLike {
  readonly uri: { toString: () => string }
  readonly range: Range
}

function rangeId(range: Range): string {
  return `${range.start.line}:${range.start.character}-${range.end.line}:${range.end.character}`
}

export function dedupeLocations<T extends LocationLike>(locations: readonly T[]): T[] {
  const seen = new Set<string>()
  return locations.filter((location) => {
    const id = `${location.uri.toString()}#${rangeId(location.range)}`
    if (seen.has(id))
      return false
    seen.add(id)
    return true
  })
}

function compare(a: Position, b: Position): number {
  return a.line - b.line || a.character - b.character
}

/** The usage after (or before) the cursor, wrapping around the file. */
export function adjacentRange(ranges: readonly Range[], cursor: Position, direction: 1 | -1): Range | undefined {
  const sorted = [...ranges].sort((a, b) => compare(a.start, b.start))
  if (direction === 1)
    return sorted.find(r => compare(r.start, cursor) > 0) ?? sorted[0]
  return sorted.findLast(r => compare(r.end, cursor) < 0) ?? sorted.at(-1)
}

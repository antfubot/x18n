import { describe, expect, it } from 'vitest'
import { json } from '../src/formats'

const format = json().formats?.[0]

describe('json format', () => {
  it('round-trips a nested tree', () => {
    const text = '{\n  "a": {\n    "b": "hello"\n  },\n  "n": 1\n}\n'
    const tree = format?.parse(text)
    expect(tree).toEqual({ a: { b: 'hello' }, n: 1 })
    expect(tree && format?.serialize?.(tree)).toBe(text)
  })

  it('rejects arrays', () => {
    expect(() => format?.parse('["a"]')).toThrow(TypeError)
  })

  it('uses the configured indent', () => {
    expect(json({ indent: 4 }).formats?.[0]?.serialize?.({ a: 'b' })).toBe('{\n    "a": "b"\n}\n')
  })
})

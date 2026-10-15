import { describe, expect, expectTypeOf, it } from 'vitest'
import { createMemoryHost, definePlugin, definePreset, isMessageTree } from '../src'

describe('isMessageTree', () => {
  it('accepts nested objects of leaves', () => {
    expect(isMessageTree({ a: 'x', b: { c: 1, d: null, e: true } })).toBe(true)
  })

  it('rejects arrays, non-objects and nested arrays', () => {
    expect(isMessageTree(['a'])).toBe(false)
    expect(isMessageTree('a')).toBe(false)
    expect(isMessageTree(null)).toBe(false)
    expect(isMessageTree({ a: ['x'] })).toBe(false)
  })
})

describe('createMemoryHost', () => {
  it('reads what it was given and what was written', async () => {
    const host = createMemoryHost({ 'en.json': '{}' })
    await host.writeFile('de.json', '{"a":"b"}')
    expect(await host.readFile('en.json')).toBe('{}')
    expect(await host.readFile('de.json')).toBe('{"a":"b"}')
    expect(await host.readFile('fr.json')).toBeUndefined()
  })
})

describe('definePlugin', () => {
  it('keeps literal types', () => {
    const plugin = definePlugin({ name: 'acme' })
    expectTypeOf(plugin.name).toEqualTypeOf<'acme'>()
  })
})

describe('definePreset', () => {
  it('keeps literal names of nested plugins', () => {
    const preset = definePreset({ name: 'acme', plugins: [definePlugin({ name: 'acme-format' })] })
    expectTypeOf(preset.name).toEqualTypeOf<'acme'>()
    expectTypeOf(preset.plugins[0].name).toEqualTypeOf<'acme-format'>()
  })
})

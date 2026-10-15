import messages from './locales/en.json'

type Paths<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : Paths<T[K], `${Prefix}${K}.`>
}[keyof T & string]

export type MessageKey = Paths<typeof messages>

interface Tree { readonly [segment: string]: string | Tree }

const flat = new Map<string, string>()
function walk(tree: Tree, prefix: string): void {
  for (const [segment, value] of Object.entries(tree)) {
    if (typeof value === 'string')
      flat.set(`${prefix}${segment}`, value)
    else
      walk(value, `${prefix}${segment}.`)
  }
}
walk(messages, '')

/** The UI's own messages (dogfooding: `x18n check` runs on `locales/`). English only for now. */
export function t(key: MessageKey, params: Readonly<Record<string, string | number>> = {}): string {
  return (flat.get(key) ?? key).replace(/\{(\w+)\}/g, (match, name: string) => String(params[name] ?? match))
}

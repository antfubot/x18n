import type { EditOp, JsonValue } from '@x18n/core'
import type { GlobalOptions } from '../context'
import { parseMessageBatch, placeholderProblems, X18nError } from '@x18n/core'
import { openWorkspace, out, printJson, readInput, runPlan, singleProject, stdinArg } from '../context'

interface WriteOptions extends GlobalOptions {
  readonly dryRun?: boolean | undefined
}

async function project(options: GlobalOptions): Promise<ReturnType<typeof singleProject>> {
  return singleProject(await openWorkspace(options))
}

export async function set(key: string, options: WriteOptions & { readonly locale?: string | undefined, readonly value?: string | undefined }): Promise<void> {
  if (options.value === undefined)
    throw new X18nError('X18N4008', 'pass --value <text> (or --value - to read stdin)')
  const loaded = await project(options)
  const value = options.value === stdinArg ? (await readInput(stdinArg)).replace(/\r?\n$/, '') : String(options.value)
  const locale = options.locale ?? loaded.project.sourceLocale
  await runPlan('set', loaded, loaded.project.plan([{ type: 'set', key: loaded.project.parseKey(key), locale, value }]), options)
}

export async function apply(source: string, options: WriteOptions & { readonly force?: boolean | undefined }): Promise<number> {
  const loaded = await project(options)
  const p = loaded.project
  let data: JsonValue
  try {
    data = JSON.parse(await readInput(source))
  }
  catch (error) {
    throw new X18nError('X18N4008', `${source} is not JSON: ${error instanceof Error ? error.message : String(error)}`)
  }
  const ops = parseMessageBatch(p, data)
  const rejected = placeholderProblems(p, ops)
  if (rejected.length > 0 && !options.force) {
    if (options.json) {
      printJson('apply', { applied: false, rejected }, [], [new X18nError('X18N4007', `${rejected.length} values`).toJSON()])
      return 1
    }
    for (const r of rejected)
      out(`rejected ${r.locale} ${r.key}: ${[r.missing.length ? `missing ${r.missing.join(', ')}` : '', r.extra.length ? `unexpected ${r.extra.join(', ')}` : ''].filter(Boolean).join('; ')}`)
    out(`${rejected.length} values have placeholder problems; nothing was written. Fix them or pass --force.`)
    return 1
  }
  await runPlan('apply', loaded, p.plan(ops), options)
  return 0
}

export async function rename(from: string, to: string, options: WriteOptions & { readonly usages?: boolean | undefined }): Promise<void> {
  const loaded = await project(options)
  const p = loaded.project
  const op: EditOp = { type: 'rename', from: p.parseKey(from), to: p.parseKey(to), usages: options.usages !== false }
  await runPlan('rename', loaded, p.plan([op]), options)
}

export async function remove(key: string, options: WriteOptions & { readonly locale?: string | readonly string[] | undefined }): Promise<void> {
  const loaded = await project(options)
  const locales = options.locale === undefined ? 'all' : [options.locale].flat()
  await runPlan('delete', loaded, loaded.project.plan([{ type: 'delete', key: loaded.project.parseKey(key), locales }]), options)
}

export async function fill(options: WriteOptions & { readonly locale?: string | readonly string[] | undefined, readonly copySource?: boolean | undefined }): Promise<void> {
  const loaded = await project(options)
  const p = loaded.project
  const targets = options.locale === undefined ? p.locales.filter(l => l !== p.sourceLocale) : [options.locale].flat()
  const ops: EditOp[] = []
  for (const locale of targets) {
    for (const key of p.keys({ missing: locale })) {
      if (p.message(key, locale) !== undefined)
        continue
      ops.push({ type: 'set', key, locale, value: options.copySource ? p.message(key, p.sourceLocale)?.value ?? '' : '' })
    }
  }
  await runPlan('fill', loaded, p.plan(ops), options)
}

export async function format(options: WriteOptions): Promise<void> {
  const loaded = await project(options)
  await runPlan('format', loaded, loaded.project.plan([{ type: 'format' }]), options)
}

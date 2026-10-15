import type { Answers, Diagnostic, EditOp, KeyString, LineIndex, LocaleCoverage, Plan, Usage, UsageMatch, WireDiagnostic } from '@x18n/core'
import type { AnalysisView, ApplyView, ExplainView, KeyDetail, KeyTable, PlanView, ProjectSummary, Snippet, UiProject, UsageView } from './types'
import { createLineIndex, placeholderProblems, toWireDiagnostic, X18nError } from '@x18n/core'

/** The named project, or the only one. */
export function pickProject(projects: readonly UiProject[], name: string | undefined): UiProject {
  const found = name === undefined
    ? (projects.length === 1 ? projects[0] : undefined)
    : projects.find(p => p.name === name)
  if (!found)
    throw new X18nError('X18N0003', name === undefined ? `pass a project (${projects.map(p => p.name).join(', ')})` : `"${name}" (${projects.map(p => p.name).join(', ')})`)
  return found
}

function percent(coverage: LocaleCoverage): number {
  return coverage.total === 0 ? 100 : Math.floor((coverage.translated / coverage.total) * 1000) / 10
}

export function summarize({ name, project }: UiProject): ProjectSummary {
  const analysis = project.analyze()
  const byCode = new Map<string, ProjectSummary['diagnostics']['byCode'][number]>()
  for (const d of analysis.diagnostics) {
    const entry = byCode.get(d.code)
    byCode.set(d.code, { code: d.code, severity: d.severity, count: (entry?.count ?? 0) + 1 })
  }
  const count = (severities: readonly string[]): number => analysis.diagnostics.filter(d => severities.includes(d.severity)).length
  return {
    name,
    sourceLocale: project.sourceLocale,
    namespaced: project.namespaced,
    locales: analysis.coverage.map((c) => {
      const info = project.localeInfo(c.locale)
      return { code: c.locale, displayName: info.displayName, flag: info.flag, total: c.total, translated: c.translated, missing: c.missing.length, empty: c.empty.length, percent: percent(c) }
    }),
    resources: project.resources.length,
    keys: project.keys().length,
    usages: project.usages().length,
    diagnostics: {
      errors: count(['error']),
      warnings: count(['warning']),
      infos: count(['info', 'hint']),
      byCode: [...byCode.values()].sort((a, b) => b.count - a.count || a.code.localeCompare(b.code)),
    },
    presets: project.explain().presets.filter(p => p.reason === 'listed' || p.reason === 'detected').map(p => p.name),
  }
}

export function keyTable({ name, project }: UiProject): KeyTable {
  const analysis = project.analyze()
  const unused = new Set(analysis.unused)
  const diagnostics = new Map<KeyString, number>()
  for (const d of analysis.diagnostics) {
    if (d.key !== undefined)
      diagnostics.set(d.key, (diagnostics.get(d.key) ?? 0) + 1)
  }
  const missing = new Map<KeyString, string[]>()
  for (const c of analysis.coverage) {
    for (const key of [...c.missing, ...c.empty]) {
      const list = missing.get(key) ?? []
      missing.set(key, list)
      list.push(c.locale)
    }
  }
  return {
    project: name,
    sourceLocale: project.sourceLocale,
    locales: project.locales,
    rows: project.keys().map((key) => {
      const info = project.get(key)
      return {
        key,
        namespace: info?.namespace,
        values: Object.fromEntries((info?.messages ?? []).map(m => [m.locale, m.value])),
        missing: missing.get(key) ?? [],
        unused: unused.has(key),
        diagnostics: diagnostics.get(key) ?? 0,
      }
    }),
  }
}

const indexes = new WeakMap<UiProject, Map<string, { text: string, index: LineIndex }>>()

/** Line index of a file, rebuilt only when its text changed. */
function lineIndex(p: UiProject, path: string): LineIndex {
  const text = p.project.text(path) ?? ''
  const cache = indexes.get(p) ?? new Map<string, { text: string, index: LineIndex }>()
  indexes.set(p, cache)
  const cached = cache.get(path)
  if (cached?.text === text)
    return cached.index
  const index = createLineIndex(text)
  cache.set(path, { text, index })
  return index
}

function snippet(index: LineIndex, line: number, around = 2): Snippet {
  const first = Math.max(0, line - around)
  const last = Math.min(index.lineCount - 1, line + around)
  return { line: first + 1, lines: Array.from({ length: last - first + 1 }, (_, i) => index.line(first + i)) }
}

function usageView(p: UiProject, usage: Usage, possible = false): UsageView {
  const index = lineIndex(p, usage.path)
  const position = index.position(usage.range.start)
  return {
    key: usage.key,
    raw: usage.raw,
    path: usage.path,
    line: position.line + 1,
    column: position.character + 1,
    kind: usage.kind,
    dynamic: usage.dynamic,
    possible,
    snippet: snippet(index, position.line),
  }
}

export function usageViews(p: UiProject, matches: readonly UsageMatch[]): UsageView[] {
  return matches.map(m => usageView(p, m.usage, m.possible))
}

function wire(p: UiProject, diagnostics: readonly Diagnostic[]): WireDiagnostic[] {
  return diagnostics.map(d => toWireDiagnostic(p.name, d, path => p.project.text(path)))
}

export function keyDetail(p: UiProject, key: KeyString): KeyDetail | null {
  const { project } = p
  const info = project.get(project.parseKey(key))
  if (!info)
    return null
  const syntaxes = project.placeholderSyntaxes
  return {
    project: p.name,
    key: info.key,
    namespace: info.namespace,
    messages: info.messages.map((m) => {
      const path = project.resources.find(r => r.id === m.resource)?.path ?? m.resource
      return {
        locale: m.locale,
        value: m.value,
        path,
        line: lineIndex(p, path).position(m.range?.key.start ?? 0).line + 1,
        placeholders: typeof m.value === 'string'
          ? syntaxes.flatMap(s => s.find(String(m.value))).map(ph => ({ text: ph.text, start: ph.range.start, end: ph.range.end })).sort((a, b) => a.start - b.start)
          : [],
      }
    }),
    missing: info.missing,
    usages: usageViews(p, info.usages),
    diagnostics: wire(p, info.diagnostics),
  }
}

export function analysisView(p: UiProject): AnalysisView {
  const analysis = p.project.analyze()
  return {
    project: p.name,
    diagnostics: wire(p, analysis.diagnostics),
    unused: analysis.unused,
    undefinedUsages: analysis.undefinedUsages.map(u => usageView(p, u)),
  }
}

export function explainView(p: UiProject): ExplainView {
  const { root: _root, ...rest } = p.project.explain()
  return rest
}

function planView(plan: Plan, problems: PlanView['problems']): PlanView {
  return {
    keys: plan.keys,
    warnings: plan.warnings,
    decisions: plan.decisions,
    changes: plan.changes.map(c => ({ type: c.type, path: c.path })),
    problems,
  }
}

export function previewOps(p: UiProject, ops: readonly EditOp[]): PlanView {
  return planView(p.project.plan(ops), placeholderProblems(p.project, ops))
}

/** Plans and applies ops; placeholder problems block the write unless `force`. */
export async function applyOps(p: UiProject, ops: readonly EditOp[], options: { readonly answers?: Answers | undefined, readonly force?: boolean | undefined } = {}): Promise<ApplyView> {
  const plan = p.project.plan(ops)
  const problems = placeholderProblems(p.project, ops)
  if (problems.length > 0 && !options.force)
    return { ...planView(plan, problems), applied: false, revision: p.project.revision }
  const answers: Record<string, string> = Object.fromEntries(plan.decisions.map(d => [d.id, options.answers?.[d.id] ?? d.default]))
  const result = await p.project.apply(plan, { answers })
  return { ...planView(plan, problems), applied: true, revision: result.revision }
}

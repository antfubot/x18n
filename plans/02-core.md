# 02 - Core

`@x18n/core` owns the domain model and every rule about it. It runs in Node, browsers and workers. All I/O goes through a `Host` that the caller passes in. Names follow [glossary.md](./glossary.md).

The code blocks below are design sketches. Final names can change during implementation; the shapes and the rules SHOULD NOT.

## Domain model

```ts
/** A BCP 47 tag after normalization, for example `en`, `zh-Hant`, `pt-BR`. */
type LocaleCode = string & { readonly __brand: 'LocaleCode' }

/** Canonical key: optional namespace plus path segments. Segments may contain dots when the key style is flat. */
interface KeyId {
  readonly namespace: string | undefined
  readonly path: readonly string[]
}

/** Canonical string form: `ns:a.b.c`, or `a.b.c` without namespace. Segments that contain the separator are escaped. */
type KeyString = string & { readonly __brand: 'KeyString' }

type MessageLeaf = string | number | boolean | null

/** One stored value of one key in one locale. */
interface Message {
  readonly key: KeyString
  readonly locale: LocaleCode
  readonly value: MessageLeaf
  readonly resource: ResourceId
  /** Byte range of the value in the resource text, when the format can report it. */
  readonly range: TextRange | undefined
}

/** One file (or one block inside a file) that holds messages for one locale and one namespace. */
interface Resource {
  readonly id: ResourceId
  readonly path: string // posix path relative to project root
  readonly locale: LocaleCode
  readonly namespace: string | undefined
  readonly format: string // format id, for example 'json'
  readonly block: ResourceBlock | undefined // set for embedded resources such as a Vue <i18n> block
  readonly readonly: boolean
}

interface Usage {
  readonly key: KeyString | undefined // undefined when the key is dynamic and could not be resolved
  readonly raw: string // the key text as written in code
  readonly path: string
  readonly range: TextRange
  readonly scanner: string // scanner id
  readonly dynamic: false | 'prefix' | 'unknown' // `t(`pages.${id}.title`)` gives 'prefix'
  readonly locale: LocaleCode | undefined // when the call pins a locale
}

interface TextRange { readonly start: number, readonly end: number } // UTF-16 offsets
```

Rules:

- Keys are compared by `KeyString` only. Plugins turn raw text into keys with `normalizeKey` hooks, never by string tricks in surfaces.
- Locale codes are normalized once at discovery, through the locale tag system of the config (`bcp47` default, `legacy`, `none`, ported from i18n-ally `tagSystems/`).
- Offsets are UTF-16 code units, the same as JS strings. The LSP converts to line and character.
- Messages keep non-string leaves as found, so a write does not turn `3` into `"3"`.

## Host

```ts
interface Host {
  readonly root: string
  readFile: (path: string) => Promise<string | undefined>
  writeFile: (path: string, content: string) => Promise<void>
  deleteFile: (path: string) => Promise<void>
  /** Returns posix paths relative to root. Must honour `ignore` and the project's gitignore when `gitignore` is true. */
  glob: (patterns: readonly string[], options: GlobOptions) => Promise<string[]>
  watch?: (patterns: readonly string[], onChange: (events: readonly FileEvent[]) => void) => Disposable
  /** Persistent key-value cache. Optional; without it, every run is cold. */
  cache?: CacheStore
  /** Identity for reviews. Node host reads git config. */
  identity?: () => Promise<Identity | undefined>
  logger: Logger
}
```

Implementations:

| Host | Package | Notes |
| --- | --- | --- |
| `createMemoryHost(files)` | `@x18n/core` | For tests, the demo playground and agents that pass in-memory content. |
| `createNodeHost(root)` | `@x18n/node` | `node:fs/promises`, tinyglobby, chokidar, cache in `node_modules/.cache/x18n`. |
| `createOverlayHost(base)` | `@x18n/core` | Wraps another host. Open editor buffers shadow disk content. Used by the LSP. |
| `createBrowserHost(dirHandle)` | `@x18n/ui` | File System Access API; falls back to a memory host. |

## Project engine

```ts
const project = await createProject({ host, config }) // config is the resolved config, see 04-config.md
await project.ready // discovery + parse + index

project.locales // LocaleCode[] in display order
project.sourceLocale
project.resources // Resource[]
project.keys() // KeyString[]; filters by namespace, prefix, glob
project.get(key) // KeyInfo: messages per locale, usages, diagnostics, review threads
project.message(key, locale)
project.usages({ key, path }) // both filters optional
project.analyze() // Analysis: diagnostics, coverage per locale, unused, missing
project.events.on('change', (change: ProjectChange) => {})
project.dispose()
```

Lifecycle:

1. **Resolve.** Config is resolved and the plugin list is final ([04-config.md](./04-config.md)).
2. **Detect.** Presets with `detect` run against the package manifests the host can read (`package.json`, `composer.json`, `pubspec.yaml`, `Gemfile`). Parsing of manifests is a plugin concern too (`manifests` contribution).
3. **Discover.** Every locale finder returns `ResourceCandidate[]`. Core merges them, drops duplicates (first finder wins, recorded in `project.explain()`), and picks a format per resource by finder hint, then by extension.
4. **Parse.** Each resource is parsed by its format into a `MessageTree`, then passes through `transformResource` hooks (for example Rails strips the top-level locale key).
5. **Index.** The key index maps `KeyString` to messages per locale. Namespaces come from the finder (path pattern) and are added to the key.
6. **Scan.** Scanners run over the usage file set (config `usage.include` / `exclude`, gitignore aware). Results go into the usage index, per file.
7. **Analyze.** Checks run over indexes and produce diagnostics.
8. **Watch.** When the host can watch, a file change invalidates only the affected resource or source file and re-runs the needed steps. Change events say what changed, so the LSP and UI refresh only that part.

Incremental rules:

- Each index entry stores a content hash. A parse or scan is skipped when the hash matches, which also makes the persistent cache work across runs.
- Analysis is lazy and memoized per revision. `project.revision` goes up on every change.
- Scanning SHOULD be able to run in parallel. Core exposes `scanFile(path, text)` as a pure function of config and text, so the Node host can spread it over worker threads in M13 without changing core.

### `project.explain()`

Returns how the project was understood: detected presets and why, each finder and what it found, which format read each file, which scanner handles which extension, the resolved config with the origin of each value (default, preset, user). The CLI prints it with `x18n doctor`, the UI shows it on the "Project" page. This is the main tool for plugin authors.

## Edits

Every write goes through one planner, so the CLI, LSP, UI and agents get the same behaviour.

```ts
const plan = project.plan([
  { type: 'set', key, locale, value },
  { type: 'rename', from, to, updateUsages: true },
  { type: 'delete', key, locales: 'all' },
  { type: 'extract', items }, // see 11-extraction.md
])

plan.changes // FileChange[]: text edits per file, or create / delete
plan.decisions // Decision[]: questions that need an answer, for example which file gets a new key
plan.warnings
const applied = await project.apply(plan, { answers }) // host writes; returns new revision
```

```ts
type FileChange
  = | { type: 'edit', path: string, edits: readonly TextEdit[] }
    | { type: 'create', path: string, content: string }
    | { type: 'delete', path: string }

interface TextEdit { readonly range: TextRange, readonly text: string }
```

Rules:

- Planning has no side effects. `plan` can run as a dry run, and the LSP turns `changes` into a `WorkspaceEdit` without writing anything.
- Formats SHOULD edit in place (keep comments, order, quotes and indentation). A format that can only serialize returns a full-file edit. The plan marks this in `warnings` so a surface can tell the user that formatting was reset.
- New keys go into a resource picked by the target strategy of the config (`same-namespace`, `closest-path`, `most-similar-keys`, `ask`). With `ask`, the plan returns a decision and the surface asks. CLI flags and agent input can answer upfront.
- A plan is checked against the current revision. If files changed between plan and apply, apply fails with a coded error and the caller plans again.
- `keepFilled` (i18n-ally `keepFulfilled`) is a config switch. When it is on, `set` in one locale also adds the key with an empty value to the other locales.

## Checks and diagnostics

```ts
interface Diagnostic {
  readonly code: string // check id, for example 'missing-translation'
  readonly severity: 'error' | 'warning' | 'info' | 'hint'
  readonly message: string
  readonly key: KeyString | undefined
  readonly locale: LocaleCode | undefined
  readonly location: { path: string, range: TextRange } | undefined
  readonly fixes: readonly Fix[] // each fix is a list of edit operations for the planner
}
```

Checks are plugins ([03-plugins.md](./03-plugins.md)), so core holds only the runner, severities and suppression. Suppression works by config (`checks: { 'unused-key': 'off' }`), by key glob (`keysInUse`, `ignoreKeys`), and by inline comment in source files (`// x18n-ignore-next-line`, handled by scanners).

## Translation prompt builder

Core builds prompts from the analysis, because the content depends only on project state. The surfaces only print or send them. Details in [10-agents.md](./10-agents.md).

## Errors

Core errors are coded (`X18N` + 4 digits) with a message, a hint and a docs link, so the CLI can print them well and JSON output can carry the code. They are grouped: `X18N0xxx` config, `1xxx` plugin, `2xxx` discovery and parse, `3xxx` scanning, `4xxx` edits, `5xxx` reviews. Each code gets a docs page under `docs/content/errors/` ([16-docs.md](./16-docs.md)).

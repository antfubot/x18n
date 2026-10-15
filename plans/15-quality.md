# 15 - Quality

## TypeScript

`tsconfig.base.json` sets, for every package:

```jsonc
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true,
  "noImplicitOverride": true,
  "noFallthroughCasesInSwitch": true,
  "verbatimModuleSyntax": true,
  "isolatedModules": true,
  "moduleDetection": "force",
  "module": "preserve",
  "moduleResolution": "bundler"
}
```

- Library packages (`core`, `builtins`, `node`, `cli`, `lsp`, ui node side) add `isolatedDeclarations: true`, so every export has an explicit type and tsdown can emit declarations fast.
- Cross-package imports resolve to source through `paths` in `tsconfig.base.json`, so typecheck needs no build.
- The Nuxt app typechecks with `nuxt typecheck` (vue-tsc) on top of the same base options.
- Rules from the workbench apply: no `any`, `unknown` or `object` in public signatures; parse at boundaries with valibot; `as` only with a reason comment; `satisfies` over widening annotations.
- Type tests (`expectTypeOf` in `*.test-d.ts`) cover `defineConfig`, `definePlugin`, `definePreset`, config id autocompletion through declaration merging, and RPC function types.

## Tests

| Layer | How |
| --- | --- |
| core | Memory host. Unit tests for key model, locale info, config resolution, plugin order, edit planner. |
| builtins | Per plugin. Formats: parse, edit round-trip tests that assert unchanged bytes outside the edited range. Scanners: inline fixtures with expected usages. |
| presets | **Fixture projects** under `test/fixtures/<preset>/`, ported from i18n-ally examples. Each has an expected snapshot of `explain()`, keys, usages and diagnostics. |
| node | Temp dirs; config loading for every file type; watch events. |
| cli | Run the built binary on fixtures; snapshot `--json` output, `x18n check` pretty output and exit codes. |
| lsp | In-process connection over streams; one stdio smoke test. |
| ui | Component tests where logic lives in the UI; Playwright e2e for the dev server (including auth refusal) and the static build on one fixture; local mode in 1.x. |
| vscode | `@vscode/test-electron` e2e: activation, in-place decorations, rename on a typed key literal reaches x18n while tsserver is active, references without duplicates, UI panel. |
| API | tsnapi snapshots per published package. |

Test behaviour, not implementation: assert outputs and file contents, avoid module mocks; the host interface is the seam.

## Performance budgets

These are the 1.0 bar. They are measured in CI on a generated fixture (5,000 source files, 4 locales, 3,000 keys) with a benchmark script, tracked from M3 and gated from M11. CI fails on a regression of more than 20% against the main branch.

| Scenario | Budget |
| --- | --- |
| `x18n check` cold | < 10 s |
| `x18n check` warm cache | < 2 s |
| LSP: re-scan of one changed file and diagnostics publish | < 50 ms |
| LSP: memory for the fixture | < 300 MB |
| UI: first render of `/keys` with 3,000 keys | < 500 ms after data arrives |

## Gates

Before every PR: `pnpm lint && pnpm knip && pnpm test && pnpm typecheck && pnpm build`. Commits and PR titles follow Conventional Commits.

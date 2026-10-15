# x18n plans

x18n is a tool for viewing and maintaining the i18n files of any project, by humans and by agents. It works with any editor. It takes the ideas of [i18n-ally](https://github.com/lokalise/i18n-ally) and rebuilds them as layers:

```
@x18n/core  ->  x18n (CLI)  ->  @x18n/lsp  ->  x18n-vscode
     \______________ @x18n/ui (devframe) ______________/
```

These documents are the plan. Each document owns one area. Where code and plan disagree after implementation, the code and its tests win, and the plan gets fixed or the finished section gets removed.

## Reading order

| # | Document | Owns |
| --- | --- | --- |
| 00 | [Vision](./00-vision.md) | Goals, non-goals, users, success criteria |
| 01 | [Architecture](./01-architecture.md) | Packages, layer rules, dependency graph |
| 02 | [Core](./02-core.md) | Domain model, host interface, project engine, edits |
| 03 | [Plugins](./03-plugins.md) | Plugin and preset API, hooks, YAML plugins |
| 04 | [Config](./04-config.md) | Config files, schema, resolution, JSON Schema |
| 05 | [Built-ins](./05-builtins.md) | Built-in formats, finders, scanners, presets, checks, reporters |
| 06 | [CLI](./06-cli.md) | Commands, flags, JSON output contract, exit codes |
| 07 | [LSP](./07-lsp.md) | Language server features and custom protocol |
| 08 | [VS Code](./08-vscode.md) | Extension features on top of the LSP |
| 09 | [UI](./09-ui.md) | devframe app: dev server, static build, in-browser, VS Code embed |
| 10 | [Agents](./10-agents.md) | Agent workflows, translate prompts, MCP, shipped skill |
| 11 | [Extraction](./11-extraction.md) | Hard-string detection and extraction |
| 12 | [Reviews](./12-reviews.md) | Review comments and suggestions |
| 13 | [Migration](./13-migration.md) | Moving from i18n-ally |
| 14 | [Vendoring](./14-vendoring.md) | What we take from i18n-ally and how |
| 15 | [Quality](./15-quality.md) | Typing rules, tests, fixtures, performance budgets |
| 16 | [Docs site](./16-docs.md) | comark-docs site and hosted playground |
| 17 | [Roadmap](./17-roadmap.md) | Milestones, order, exit criteria |
| -- | [Decisions](./decisions.md) | Decision log with reasons |
| -- | [Glossary](./glossary.md) | Canonical names |

## Status

| Milestone | Title | Status |
| --- | --- | --- |
| M0 | Plan and monorepo scaffold | IN PROGRESS |
| M1 | Core engine (read path) | TODO |
| M2 | Node host, config loading, CLI read commands | TODO |
| M3 | Usage scanning and analysis | TODO |
| M4 | Edits and write commands | TODO |
| M5 | Agent surface (prompts, MCP, skill) | TODO |
| M6 | UI: dev server and static build | TODO |
| M7 | Language server | TODO |
| M8 | VS Code extension | TODO |
| M9 | Extraction | TODO |
| M10 | Reviews | TODO |
| M11 | i18n-ally migration and preset parity | TODO |
| M12 | In-browser workspace and docs playground | TODO |
| M13 | Performance and scale | TODO |

Status values: TODO, IN PROGRESS, DONE, BLOCKED (with reason). The full breakdown is in [17-roadmap.md](./17-roadmap.md).

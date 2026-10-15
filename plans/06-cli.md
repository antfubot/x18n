# 06 - CLI

Package `x18n`, binary `x18n`, built with `cac`. The CLI is a thin layer: it builds a node host, resolves config, creates a project, calls the core API and formats the result.

## Global flags

| Flag | Meaning |
| --- | --- |
| `--root <dir>` | Project root (default: cwd, or nearest config upward). |
| `--config <file>` | Explicit config file. |
| `--project <name>` | Pick one project in a monorepo config. Default: all. |
| `--json` | Print the JSON contract instead of human output. Implies no color and no prompts. |
| `--no-cache` | Ignore the persistent cache. |
| `--yes` | Accept default answers for decisions. Without a TTY and without `--yes`, a command that needs a decision fails with `X18N4003` and lists the decisions. |

## Commands

### Look

| Command | Does |
| --- | --- |
| `x18n status` | Locales with coverage, resource count, key count, diagnostics summary. |
| `x18n keys [glob]` | List keys. `--missing <locale>`, `--unused`, `--namespace`, `--values` (include values per locale). |
| `x18n get <key>` | All values, resources, usages and reviews of one key. |
| `x18n usages [key]` | Usages of a key, or all usages. `--file <path>` limits to a file. |
| `x18n locales` | Locales with tags, flags and resources. |
| `x18n doctor` | `project.explain()`: detected presets, finders, formats, scanners, config origins. |

### Check

| Command | Does |
| --- | --- |
| `x18n check` | Run checks. `--reporter <id>` (repeatable), `--output <file>`, `--only <checkIds>`, `--locale`, `--max-warnings <n>`. |

### Change

All write commands support `--dry-run`, which prints the plan (files and edits) instead of writing.

| Command | Does |
| --- | --- |
| `x18n set <key> --locale <l> --value <v>` | Set one value. `--value -` reads stdin. |
| `x18n apply <file \| ->` | Batch set from JSON: `{ "<locale>": { "<key>": "<value>" } }`. The same shape the translate prompt asks for. Validates placeholders before writing; `--force` writes anyway. |
| `x18n rename <from> <to>` | Rename in all locales and in code usages. `--no-usages` keeps code. |
| `x18n delete <key>` | Delete in all locales. `--locale` limits. |
| `x18n fill [--locale]` | Add missing keys with empty values (or source values with `--copy-source`). |
| `x18n format` | Re-write resources with configured sort and indent. |
| `x18n extract [files...]` | Hard-string extraction ([11-extraction.md](./11-extraction.md)). `--list` prints candidates, `--plan <file>` applies an edited plan. |

### Agents and prompts

| Command | Does |
| --- | --- |
| `x18n prompt translate --to <locale>` | Prints a translation prompt ([10-agents.md](./10-agents.md)). `--keys <glob>`, `--limit <n>`, `--format markdown\|json`. |
| `x18n prompt review --locale <l>` | Prompt to review existing translations against source and glossary. |
| `x18n mcp` | MCP server over stdio ([10-agents.md](./10-agents.md)). |

### Reviews

`x18n review list | comment <key> | approve <key> | request-change <key> | suggest <key> --value | resolve <id>`, all with `--locale`. See [12-reviews.md](./12-reviews.md).

### UI

| Command | Does |
| --- | --- |
| `x18n ui` (also bare `x18n`) | Start the devframe dev server and open the browser ([09-ui.md](./09-ui.md)). `--port`, `--host`, `--no-open`. |
| `x18n build` | Static snapshot report. `--out-dir`, `--base`. |

### Setup

| Command | Does |
| --- | --- |
| `x18n init` | Detect and write `x18n.config.ts` (or `--format yml`). |
| `x18n migrate i18n-ally` | Convert i18n-ally settings ([13-migration.md](./13-migration.md)). |
| `x18n plugin eject <file.yml>` | Print the TS equivalent of a YAML plugin. |
| `x18n schema [config\|plugin]` | Print a JSON Schema. |

## JSON contract

Every `--json` output has this envelope:

```json
{
  "x18n": 1,
  "command": "keys",
  "data": {},
  "diagnostics": [],
  "errors": []
}
```

- `x18n` is the contract version. A breaking change to any `data` shape bumps it. Adding optional fields does not.
- `data` shapes are valibot schemas in `@x18n/core` (`contracts/`), and the docs publish them as JSON Schema.
- Errors carry `code`, `message`, `hint`. They are also printed, but in JSON mode only inside the envelope, so stdout is always one JSON document.
- Snapshot tests cover the output of every command on fixture projects.

## Exit codes

| Code | Meaning |
| --- | --- |
| 0 | Success. For `check`: no errors and warnings within `--max-warnings`. |
| 1 | `check` found errors (or too many warnings). `apply` rejected values. |
| 2 | Usage or config error. |
| 3 | A decision is needed and no answer was given. |
| 4 | Plan is stale (files changed during the command). |

## Output rules

- Human output goes to stdout; progress and logs go to stderr, so `x18n keys > keys.txt` works.
- No spinners or colors without a TTY. `NO_COLOR` and `FORCE_COLOR` are honoured.
- Paths are printed relative to the cwd.

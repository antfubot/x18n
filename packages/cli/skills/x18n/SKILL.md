---
name: x18n
description: Maintain the i18n files of a project with the x18n CLI - find missing, unused and broken keys, add and rename keys, translate missing messages, and extract hard-coded strings. Use when the task touches locale files (JSON, YAML, Vue i18n blocks) or translation keys in code, instead of editing locale files by hand.
---

# x18n

x18n reads the project's i18n setup (locale files, translate calls in code) and changes it safely. Use the `x18n` CLI instead of editing locale files directly: it keeps formatting, key style, file choice and placeholders correct, and every command has stable JSON output.

## Rules

- Do not edit locale files by hand. Use `x18n set`, `x18n apply`, `x18n rename` and `x18n delete`.
- Before using a key in code, check whether it exists: `x18n get <key> --json`.
- Never drop or rename placeholders (`{name}`, `{{count}}`, `%s`, `@:key`).
- Pass `--json` and read the envelope `{ "x18n": 1, "command", "data", "diagnostics", "errors" }`. Never parse the human output.
- Prefer `--dry-run` first for renames and deletes, and read the plan.

## Exit codes

- `0` success
- `1` `x18n check` found errors, or `x18n apply` rejected values
- `2` usage or config error
- `3` a decision is needed: re-run with `--yes` to accept the defaults
- `4` files changed during the command: run it again

## Loops

### Check the project

```sh
x18n check --json
x18n status --json
```

### Add a key while coding

```sh
x18n get settings.title --json
x18n set settings.title --value "Settings" --json
x18n keys --missing de --json --limit 50
```

`x18n set` without `--locale` writes the source locale. Then use the key in code, for example `t('settings.title')`.

### Translate missing messages

```sh
x18n prompt translate --to de --limit 50
```

Follow the prompt: write `{ "de": { "<key>": "<translation>" } }` to a file, then:

```sh
x18n apply translations.json --json
x18n check --only placeholder-mismatch,invalid-syntax --locale de --json
```

`x18n apply` refuses values whose placeholders differ from the source and lists them in `data.rejected`; fix them and apply again. When the prompt reports more keys, continue with `x18n prompt translate --to de --cursor <nextCursor>`.

### Review translations

```sh
x18n prompt review --locale de --limit 50
```

Fix wrong values with `x18n set <key> --locale de --value <text> --json` and list what you changed.

### Clean up

```sh
x18n keys --unused --json
x18n delete old.key --dry-run --json
x18n delete old.key --json
```

### Rename keys

```sh
x18n rename home.title home.heading --dry-run --json
x18n rename home.title home.heading --json
x18n rename pages screens --json
```

A rename updates every locale and every usage in code. Renaming a parent (`pages`) moves every key under it. A rename to an existing key is refused (exit code 1).

### Extract hard-coded strings

```sh
x18n extract --list --json
x18n extract --plan extract-plan.json
x18n extract --apply extract-plan.json --json
```

Edit the keys in the plan file before applying it.

## Paging

List commands take `--limit` and return `nextCursor`; pass it as `--cursor` to get the next page:

```sh
x18n keys --json --limit 100 --cursor 100
```

## Monorepos

When `x18n status --json` lists several projects, pass `--project <name>` to write commands.

import type { CAC } from 'cac'
import type { GlobalOptions } from './context'
import process from 'node:process'
import cac from 'cac'
import { version } from '../package.json' with { type: 'json' }
import { apply, fill, format, remove, rename, set } from './commands/change'
import { check } from './commands/check'
import { doctor, get, keys, locales, status, usages } from './commands/look'
import { prompt } from './commands/prompt'
import { eject, init, schema } from './commands/setup'
import { errorInfo, exitCodeOf, printJson, stdinArg } from './context'

type Action = (...args: never[]) => Promise<number | void>

/** Runs a command and turns errors into the JSON envelope or a printed hint, with the matching exit code. */
function run(command: string, action: Action): (...args: unknown[]) => Promise<void> {
  return async (...args) => {
    const options = args.at(-1) as GlobalOptions // cac always passes the parsed options last
    try {
      const code = await (action as (...a: unknown[]) => Promise<number | void>)(...args)
      process.exitCode = code ?? 0
    }
    catch (error) {
      const info = errorInfo(error)
      if (options.json) {
        printJson(command, null, [], [info])
      }
      else {
        process.stderr.write(`error ${info.code}: ${info.message}\n`)
        if (info.hint)
          process.stderr.write(`  ${info.hint}\n`)
        if (!(error instanceof Error && 'code' in error) && error instanceof Error && process.env.DEBUG)
          process.stderr.write(`${error.stack}\n`)
      }
      process.exitCode = exitCodeOf(error)
    }
  }
}

export function createCli(): CAC {
  const cli = cac('x18n')
  cli
    .option('--root <dir>', 'Project root (default: nearest config upward from the cwd)')
    .option('--config <file>', 'Explicit config file')
    .option('--project <name>', 'Pick one project in a monorepo')
    .option('--json', 'Print the JSON contract instead of human output')
    .option('--no-cache', 'Ignore the persistent cache')
    .option('--yes', 'Accept default answers for decisions')

  cli.command('', 'Show the status and the main commands').action(run('status', async (options: GlobalOptions) => {
    await status(options)
    if (!options.json)
      process.stdout.write('\nCommands: check, keys, get, usages, set, apply, rename, delete, fill, prompt translate, ui. Run `x18n --help` for all.\n')
  }))
  cli.command('status', 'Locales with coverage, resources, keys and diagnostics').action(run('status', status))
  cli.command('keys [glob]', 'List keys')
    .option('--missing <locale>', 'Only keys missing or empty in a locale')
    .option('--unused', 'Only keys without usages')
    .option('--namespace <ns>', 'Only keys of a namespace')
    .option('--values', 'Include the value per locale')
    .option('--limit <n>', 'Page size')
    .option('--cursor <cursor>', 'Start of the page (from `nextCursor`)')
    .action(run('keys', keys))
  cli.command('get <key>', 'Values, resources, usages and diagnostics of one key').action(run('get', get))
  cli.command('usages [key]', 'Usages of a key, or all usages')
    .option('--file <path>', 'Only usages in a file')
    .option('--limit <n>', 'Page size')
    .option('--cursor <cursor>', 'Start of the page')
    .action(run('usages', usages))
  cli.command('locales', 'Locale codes as found, with display names and resources').action(run('locales', locales))
  cli.command('doctor', 'How the project was understood: presets, finders, formats, scanners, config origins').action(run('doctor', doctor))

  cli.command('check', 'Report invalid, untranslated and unused keys, like `tsc --noEmit`')
    .option('--watch', 'Re-check on change')
    .option('--strict', 'Turn every warning into an error')
    .option('--locale <locale>', 'Only report for these locales (repeatable)')
    .option('--only <checks>', 'Only these check ids (comma separated)')
    .option('--skip <checks>', 'Skip these check ids (comma separated)')
    .option('--max-warnings <n>', 'Fail when there are more warnings')
    .option('--reporter <id>', 'pretty, json, markdown, github or sarif (repeatable)')
    .option('--output <file>', 'Write the matching reporter output to a file (repeatable)')
    .action(run('check', check))

  cli.command('set <key>', 'Set one value')
    .option('--locale <locale>', 'Locale (default: source locale)')
    .option('--value <value>', 'The value; `-` reads stdin')
    .option('--dry-run', 'Print the plan instead of writing')
    .action(run('set', set))
  cli.command('apply <file>', 'Batch set from JSON `{ "<locale>": { "<key>": "<value>" } }`; `-` reads stdin')
    .option('--force', 'Write values with placeholder problems')
    .option('--dry-run', 'Print the plan instead of writing')
    .action(run('apply', apply))
  cli.command('rename <from> <to>', 'Rename a key (or every key under a parent) in all locales and usages')
    .option('--no-usages', 'Keep code unchanged')
    .option('--dry-run', 'Print the plan instead of writing')
    .action(run('rename', rename))
  cli.command('delete <key>', 'Delete a key (or every key under a parent) in all locales')
    .option('--locale <locale>', 'Only in these locales (repeatable)')
    .option('--dry-run', 'Print the plan instead of writing')
    .action(run('delete', remove))
  cli.command('fill', 'Add missing keys with empty values')
    .option('--locale <locale>', 'Only these locales (repeatable)')
    .option('--copy-source', 'Use the source value instead of an empty string')
    .option('--dry-run', 'Print the plan instead of writing')
    .action(run('fill', fill))
  cli.command('format', 'Re-write resources with the configured sort and indent')
    .option('--dry-run', 'Print the plan instead of writing')
    .action(run('format', format))

  cli.command('prompt <kind>', 'Print a prompt for an agent or LLM: `prompt translate --to <locale>` or `prompt review --locale <locale>`')
    .option('--to <locale>', 'Target locale (translate)')
    .option('--locale <locale>', 'Locale to review')
    .option('--keys <glob>', 'Only keys matching a glob')
    .option('--namespace <ns>', 'Only keys of a namespace')
    .option('--limit <n>', 'Messages per prompt (default 50)')
    .option('--cursor <cursor>', 'Continue from `nextCursor`')
    .option('--format <format>', 'markdown (default) or json')
    .option('--no-context', 'Leave out code around usages')
    .action(run('prompt', prompt))

  cli.command('init', 'Detect the setup and write x18n.config.ts')
    .option('--format <format>', 'ts (default), yml or json')
    .option('--force', 'Replace an existing config')
    .action(run('init', init))
  cli.command('schema [name]', 'Print a JSON Schema: config (default) or plugin').action(run('schema', schema))
  cli.command('plugin <action> <file>', 'Plugin tools: `plugin eject <file.yml>` prints the TS equivalent')
    .action(run('plugin eject', async (action: string, file: string, options: GlobalOptions) => {
      if (action !== 'eject')
        throw new Error(`unknown plugin action "${action}"`)
      await eject(file, options)
    }))

  cli.help()
  cli.version(version)
  return cli
}

// mri drops a lone `-`; keep it as a sentinel that `readInput` maps to stdin.
const argv = process.argv.map(arg => arg === '-' ? stdinArg : arg)
try {
  createCli().parse(argv)
}
catch (error) {
  process.stderr.write(`error: ${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 2
}

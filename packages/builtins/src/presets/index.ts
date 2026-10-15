// Detection and syntax adapted from i18n-ally (MIT), src/frameworks/*
import type { CallSpec, ConfigDraft, DetectContext, ExtractTemplate, LocaleFinder, Plugin, Preset, PresetFactory, ResourceSpec } from '@x18n/core'
import { sfcBlocks } from '../finders/sfc-blocks'
import { braces, doubleBraces, icu, linked, nesting, placeholders } from '../placeholders'
import { nlsFinder } from './nls'

interface LibraryOptions {
  readonly name: string
  readonly calls?: readonly CallSpec[]
  readonly derivedKeys?: readonly string[]
  readonly namespace?: { readonly separator: string, readonly default?: string }
  readonly resources?: readonly ResourceSpec[]
  readonly templates?: readonly ExtractTemplate[]
  readonly finders?: readonly LocaleFinder[]
  readonly extra?: (draft: ConfigDraft) => void
}

/** One plugin holding a library's call specs, namespace rules, derived keys and extraction templates. */
function library(options: LibraryOptions): Plugin {
  return {
    name: `x18n:${options.name}`,
    config(draft) {
      if (options.namespace) {
        draft.namespace = {
          separator: options.namespace.separator,
          default: draft.namespace.default ?? options.namespace.default,
        }
      }
      if (options.resources && draft.resources.length === 0)
        draft.resources = options.resources
      draft.usage = {
        ...draft.usage,
        calls: [...draft.usage.calls, ...options.calls ?? []],
        derivedKeys: [...draft.usage.derivedKeys, ...options.derivedKeys ?? []],
      }
      options.extra?.(draft)
    },
    localeFinders: options.finders,
    extractors: options.templates ? [{ id: options.name, templates: options.templates }] : undefined,
  }
}

function dependsOn(names: readonly string[], prefixes: readonly string[] = []): (ctx: DetectContext) => boolean {
  return ctx => ctx.hasAnyDependency(names) || [...ctx.dependencies].some(dep => prefixes.some(prefix => dep.startsWith(prefix)))
}

const vueI18nCalls: CallSpec[] = [
  { callee: ['$t', 't', 'tc', '$tc', 'te', '$te', 'tm', '$tm', 'i18n.t', 'i18n.global.t', '$i18n.t', 'i18n.tc', 'i18n.te'] },
  { callee: 'useI18n', factory: true, returns: ['t', 'tc', 'te', 'tm'] },
]

export function vueI18n(): Preset {
  return {
    name: 'vue-i18n',
    detect: dependsOn(['vue-i18n', 'vuex-i18n', 'petite-vue-i18n', 'vue-i18n-bridge'], ['@intlify/']),
    plugins: [
      library({
        name: 'vue-i18n',
        calls: vueI18nCalls,
        templates: [
          { template: '{{ $t(\'{key}\'{args}) }}', kinds: ['vue-template-text'] },
          { template: ':{attr}="$t(\'{key}\'{args})"', kinds: ['vue-attribute'] },
          { template: 't(\'{key}\'{args})', kinds: ['js-string', 'js-template'], files: ['**/*.vue'], imports: ['import { useI18n } from \'vue-i18n\'', 'const { t } = useI18n()'] },
        ],
      }),
      placeholders(braces, linked),
      sfcBlocks(),
    ],
  }
}

export function nuxtI18n(): Preset {
  return {
    name: 'nuxt-i18n',
    detect: dependsOn(['@nuxtjs/i18n', 'nuxt-i18n']),
    exclusive: false,
    plugins: [
      ...vueI18n().plugins,
      {
        name: 'x18n:nuxt-i18n',
        async config(draft, ctx) {
          if (draft.resources.length > 0 || ctx.user.resources)
            return
          const nuxtConfig = await ctx.host.readFile('nuxt.config.ts') ?? await ctx.host.readFile('nuxt.config.js')
          const langDir = nuxtConfig ? /langDir:\s*['"]([^'"]+)['"]/.exec(nuxtConfig)?.[1]?.replace(/^\.\/|\/$/g, '') : undefined
          const dirs = langDir ? [`i18n/${langDir}`, langDir] : ['i18n/locales', 'locales', 'lang']
          draft.resources = dirs.map(dir => ({ pattern: `${dir}/{locale}.{ext}` }))
        },
      },
    ],
  }
}

const i18nextPlugin = library({
  name: 'i18next',
  namespace: { separator: ':', default: 'translation' },
  calls: [
    { callee: ['t', 'i18next.t', 'i18n.t'], namespace: { arg: 1, property: 'ns' } },
    { callee: ['getFixedT', 'i18next.getFixedT', 'i18n.getFixedT'], factory: true, returns: ['t'], namespace: { arg: 1 }, keyPrefix: { arg: 2 } },
    { callee: 'tr', types: ['TFunction'] },
  ],
  derivedKeys: ['{key}_*'],
  templates: [
    { template: 'i18next.t(\'{key}\'{args})', kinds: ['js-string', 'js-template'], imports: ['import i18next from \'i18next\''] },
  ],
})

export function i18next(): Preset {
  return {
    name: 'i18next',
    detect: dependsOn(['i18next']),
    plugins: [i18nextPlugin, placeholders(doubleBraces, nesting)],
  }
}

export function reactI18next(): Preset {
  return {
    name: 'react-i18next',
    detect: dependsOn(['react-i18next', 'next-i18next']),
    exclusive: true,
    plugins: [
      i18nextPlugin,
      placeholders(doubleBraces, nesting),
      library({
        name: 'react-i18next',
        calls: [
          { callee: 'useTranslation', factory: true, returns: ['t'], namespace: { arg: 0 }, keyPrefix: { arg: 1, property: 'keyPrefix' } },
          { callee: 'Trans', key: { arg: 0, property: 'i18nKey' }, namespace: { arg: 0, property: 'ns' } },
          { callee: 'Translation', factory: true, returns: ['t'], namespace: { arg: 0, property: 'ns' } },
        ],
        templates: [
          { template: '<Trans i18nKey="{key}" />', kinds: ['jsx-text'], imports: ['import { Trans } from \'react-i18next\''] },
          { template: '{attr}={i18next.t(\'{key}\'{args})}', kinds: ['jsx-attribute'], imports: ['import i18next from \'i18next\''] },
        ],
      }),
    ],
  }
}

export function nextIntl(): Preset {
  return {
    name: 'next-intl',
    detect: dependsOn(['next-intl', 'use-intl']),
    plugins: [
      library({
        name: 'next-intl',
        calls: [
          { callee: ['useTranslations', 'getTranslations'], factory: true, returns: ['t', 't.rich', 't.markup', 't.raw', 't.has'], keyPrefix: { arg: 0 } },
          { callee: 'getTranslations', factory: true, returns: ['t', 't.rich', 't.markup', 't.raw', 't.has'], keyPrefix: { arg: 0, property: 'namespace' } },
        ],
        resources: [{ pattern: 'messages/{locale}.json' }, { pattern: 'src/messages/{locale}.json' }],
        templates: [
          { template: '{t(\'{key}\'{args})}', kinds: ['jsx-text'] },
          { template: '{attr}={t(\'{key}\'{args})}', kinds: ['jsx-attribute'] },
          { template: 't(\'{key}\'{args})', kinds: ['js-string', 'js-template'] },
        ],
      }),
      placeholders(icu),
    ],
  }
}

export function reactIntl(): Preset {
  return {
    name: 'react-intl',
    detect: dependsOn(['react-intl'], ['@formatjs/']),
    plugins: [
      library({
        name: 'react-intl',
        calls: [
          { callee: ['intl.formatMessage', 'formatMessage', 'defineMessage', 'FormattedMessage'], key: { arg: 0, property: 'id' } },
          { callee: 'defineMessages', key: { arg: 0, property: '*.id' } },
        ],
        templates: [
          { template: '<FormattedMessage id="{key}" />', kinds: ['jsx-text'], imports: ['import { FormattedMessage } from \'react-intl\''] },
          { template: '{attr}={intl.formatMessage({ id: \'{key}\' }{args})}', kinds: ['jsx-attribute'] },
          { template: 'intl.formatMessage({ id: \'{key}\' }{args})', kinds: ['js-string', 'js-template'] },
        ],
      }),
      placeholders(icu),
    ],
  }
}

export function svelteI18n(): Preset {
  return {
    name: 'svelte-i18n',
    detect: dependsOn(['svelte-i18n']),
    plugins: [
      library({
        name: 'svelte-i18n',
        calls: [{ callee: ['$_', '$t', '$format', '_', 't', 'format', '$json', 'json'] }],
        templates: [
          { template: '{$_(\'{key}\'{args})}', kinds: ['svelte-text'], imports: ['import { _ } from \'svelte-i18n\''] },
          { template: '{attr}={$_(\'{key}\'{args})}', kinds: ['svelte-attribute'], imports: ['import { _ } from \'svelte-i18n\''] },
        ],
      }),
      placeholders(icu),
    ],
  }
}

export function vscodeExtension(): Preset {
  return {
    name: 'vscode-extension',
    detect: ctx => ctx.hasAnyDependency(['vscode', '@types/vscode']),
    plugins: [
      library({
        name: 'vscode-extension',
        calls: [{ callee: ['l10n.t', 'vscode.l10n.t'] }],
        finders: [nlsFinder],
        extra: (draft) => {
          draft.usage = {
            ...draft.usage,
            regex: [...draft.usage.regex, { extensions: ['json'], patterns: ['"%({key})%"'] }],
          }
        },
      }),
      placeholders(braces),
    ],
  }
}

/** Always last: hard-string extraction templates for plain JS, TS and HTML. */
export function general(): Preset {
  return {
    name: 'general',
    detect: () => true,
    plugins: [{
      name: 'x18n:general',
      extractors: [{ id: 'general', templates: [{ template: 't(\'{key}\'{args})' }] }],
    }],
  }
}

/** Presets by name, in detection order. */
export const presets: { readonly [name: string]: PresetFactory } = {
  'nuxt-i18n': () => nuxtI18n(),
  'vue-i18n': () => vueI18n(),
  'react-i18next': () => reactI18next(),
  'i18next': () => i18next(),
  'next-intl': () => nextIntl(),
  'react-intl': () => reactIntl(),
  'svelte-i18n': () => svelteI18n(),
  'vscode-extension': () => vscodeExtension(),
  'general': () => general(),
}

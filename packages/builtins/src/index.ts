import type { Builtins } from '@x18n/core'
import { recommended } from './checks'
import { pattern } from './finders'
import { json, json5, jsonc, yaml } from './formats'
import { manifests } from './manifests'
import { presets } from './presets'
import { reporters } from './reporters'
import { regex } from './scanners/regex'

/** Plugins that are always on, and the presets that `'auto'` detects. */
export function createBuiltins(): Builtins {
  return {
    plugins: [manifests(), json(), jsonc(), json5(), yaml(), pattern(), regex(), recommended(), reporters()],
    presets,
  }
}

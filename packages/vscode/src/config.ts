import type { NestedScopedConfigs } from './generated/meta'
import { defineConfig } from 'reactive-vscode'
import { scopedConfigs } from './generated/meta'

/** Reactive `x18n.*` settings. */
export const config = defineConfig<NestedScopedConfigs>(scopedConfigs.scope)

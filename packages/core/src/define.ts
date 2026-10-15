import type { Plugin, Preset, UserConfig } from './types'

export function definePlugin<const T extends Plugin>(plugin: T): T {
  return plugin
}

export function definePreset<const T extends Preset>(preset: T): T {
  return preset
}

export function defineConfig(config: UserConfig): UserConfig {
  return config
}

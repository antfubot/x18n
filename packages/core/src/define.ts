import type { Plugin, UserConfig } from './types'

export function definePlugin<const T extends Plugin>(plugin: T): T {
  return plugin
}

export function defineConfig(config: UserConfig): UserConfig {
  return config
}

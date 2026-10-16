// Detection and syntax adapted from i18n-ally (MIT), src/frameworks/flutter.ts
import type { Preset } from '@x18n/core'
import { braces, placeholders } from '../placeholders'
import { dependsOn, library } from './shared'

/** Flutter with `flutter_i18n`: JSON or YAML assets, `FlutterI18n.translate(context, 'key')`. */
export function flutter(): Preset {
  return {
    name: 'flutter',
    detect: dependsOn(['flutter_i18n']),
    plugins: [
      library({
        name: 'flutter',
        regex: [{
          extensions: ['dart'],
          patterns: [
            '[^\\w\\d]FlutterI18n\\.(?:plural|translate)\\(\\s*[\\w\\d.]+,\\s*[\'"`]({key})[\'"`]',
            '[^\\w\\d]I18n(?:Plural|Text)\\(\\s*[\'"`]({key})[\'"`]',
          ],
        }],
        resources: [{ pattern: 'assets/flutter_i18n/{locale}.{ext}' }, { pattern: 'assets/i18n/{locale}.{ext}' }],
        templates: [{ template: 'FlutterI18n.translate(context, \'{key}\')' }],
      }),
      placeholders(braces),
    ],
  }
}

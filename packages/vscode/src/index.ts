import type { ProjectInfo } from '@x18n/lsp'
import type { Annotations } from './annotations'
import type { X18nClient } from './model/client'
import { methods } from '@x18n/lsp'
import { computed, defineExtension, shallowRef, useActiveTextEditor, useDisposable, useEventEmitter, useStatusBarItem, watch } from 'reactive-vscode'
import { StatusBarAlignment, window } from 'vscode'
import { State } from 'vscode-languageclient/node'
import { useAnnotations } from './annotations'
import { createClient } from './client'
import { useCommands } from './commands'
import { config } from './config'
import { commands } from './generated/meta'
import { migratableFolders, migrate } from './migrate'
import { projectFor } from './model/client'
import { useUiPanel } from './panel'
import { registerNativePreviewMiddleware } from './typescript-native'
import { useViews } from './views'

/** Returned from `activate`; the e2e suite reads in-place state through it. */
export interface X18nExtensionApi {
  readonly inPlace: Annotations['inPlace']
}

const { activate, deactivate } = defineExtension((context): X18nExtensionApi => {
  // Fired when views and annotations must reload: server (re)start, `x18n/changed`, display locale switch.
  const refresh = useEventEmitter<void>()
  // The client's middleware calls into annotations and commands, which in turn need the client.
  let annotations: Annotations | undefined
  let extractAtCursor = async (): Promise<void> => {}
  const client = createClient(context, {
    decorations: uri => annotations?.decorations(uri) ?? Promise.resolve([]),
    extractAtCursor: () => extractAtCursor(),
  })
  const x18n: X18nClient = {
    request: async (method, params) => {
      if (!client.isRunning())
        throw new Error('the language server is not running')
      return client.sendRequest(method, params)
    },
  }
  annotations = useAnnotations(x18n, refresh.event)
  useViews(x18n, refresh.event)
  const panel = useUiPanel(x18n)
  extractAtCursor = useCommands({ client, x18n, openUi: panel.open }).extractAtCursor

  registerNativePreviewMiddleware(x18n).forEach(useDisposable)
  useDisposable(client.onNotification(methods.changed, () => refresh.fire()))
  useDisposable(client.onDidChangeState(({ newState }) => {
    if (newState === State.Running)
      refresh.fire()
  }))
  useDisposable({ dispose: () => void client.stop() })

  watch(() => config.enabled, async (enabled) => {
    if (!enabled) {
      await client.stop()
      return
    }
    try {
      await client.start()
    }
    catch {
      // The client reports start failures in its output channel.
      return
    }
    void offerMigration()
  }, { immediate: true })
  watch(() => [config.annotationMaxLength, config.codeLens], () => client.isRunning() && void client.restart())
  watch(() => [config.displayLocale, config.annotations, config.inPlace], () => {
    if (!client.isRunning())
      return
    // Re-sending the locale also makes the server refresh inlay hints, which the in-place switch filters.
    void client.sendNotification(methods.setDisplayLocale, { locale: config.displayLocale || undefined })
    refresh.fire()
  })

  // Status bar: display locale of the active file's project.
  const projects = shallowRef<ProjectInfo[]>([])
  useDisposable(refresh.event(() => void x18n.request('x18n/projects', undefined).then(list => projects.value = list, () => projects.value = [])))
  const editor = useActiveTextEditor()
  const current = computed(() => {
    const path = editor.value?.document.uri.fsPath
    return (path === undefined ? undefined : projectFor(projects.value, path)) ?? projects.value[0]
  })
  const status = useStatusBarItem({
    id: 'x18n.displayLocale',
    alignment: StatusBarAlignment.Right,
    text: () => `$(globe) ${current.value?.displayLocale ?? ''}`,
    tooltip: 'x18n display locale',
    command: commands.setDisplayLocale,
  })
  watch(current, value => value ? status.show() : status.hide(), { immediate: true })

  async function offerMigration(): Promise<void> {
    const [folder] = await migratableFolders()
    const action = 'Migrate from i18n-ally'
    if (folder && await window.showInformationMessage(`x18n: ${folder.name} has i18n-ally settings and no x18n config.`, action) === action && await migrate(client, folder))
      await client.restart()
  }

  return { inPlace: annotations.inPlace }
})

export { activate, deactivate }

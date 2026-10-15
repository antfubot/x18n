import type { ShallowRef } from 'vue'
import type { ProjectList, ProjectSummary } from '../src/node/types'
import type { UiBackend } from './backend'
import { computed, ref, shallowRef, watchEffect } from 'vue'

export const backend = shallowRef<UiBackend>()
export const projectList = shallowRef<ProjectList>()
export const projectName = ref<string>()
/** Bumps after every change from any surface; live data reloads on it. */
export const revision = ref(0)
export const recentKeys = shallowRef<readonly string[]>([])

export const currentProject = computed<ProjectSummary | undefined>(() =>
  projectList.value?.projects.find(p => p.name === projectName.value))

/** Data for the current project, reloaded when the project or anything in it changes. */
export function useLive<T>(load: (backend: UiBackend, project: string) => Promise<T>): ShallowRef<T | undefined> {
  const data = shallowRef<T>()
  let latest = 0
  watchEffect(() => {
    const b = backend.value
    const project = projectName.value
    void revision.value
    if (!b || !project)
      return
    const request = ++latest
    void load(b, project).then((value) => {
      if (request === latest)
        data.value = value
    })
  })
  return data
}

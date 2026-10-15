<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { NuxtLink, NuxtPage } from '#components'
import { pendingAuth, useBackend } from './backend'
import { t } from './i18n'
import { backend, projectList, projectName, recentKeys, revision } from './state'
import { setupTheme } from './theme'

const nav = [
  { to: '/', label: t('nav.overview'), icon: 'i-ph-gauge-duotone' },
  { to: '/keys', label: t('nav.keys'), icon: 'i-ph-rows-duotone' },
  { to: '/usages', label: t('nav.usages'), icon: 'i-ph-code-duotone' },
  { to: '/extract', label: t('nav.extract'), icon: 'i-ph-magic-wand-duotone' },
  { to: '/project', label: t('nav.project'), icon: 'i-ph-info-duotone' },
]

const error = ref<string>()
const code = ref('')
const codeRejected = ref(false)

async function submitCode(): Promise<void> {
  codeRejected.value = !(await pendingAuth.value?.(code.value.trim()))
}

async function refreshProjects(): Promise<void> {
  const list = await backend.value!.project()
  projectList.value = list
  if (!list.projects.some(p => p.name === projectName.value))
    projectName.value = list.projects[0]?.name
}

setupTheme()
onMounted(async () => {
  try {
    const b = await useBackend()
    backend.value = b
    await refreshProjects()
    b.onChange((state) => {
      recentKeys.value = state.changedKeys
      revision.value++
      void refreshProjects()
    })
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
})
</script>

<template>
  <div class="h-full flex flex-col bg-base color-base font-sans text-compact">
    <header class="h-10 shrink-0 flex items-center gap-1 px-2 border-b border-base">
      <span class="font-semibold px2 flex items-center gap-1">
        <span class="i-ph-translate-duotone color-active" />
        {{ t('app.name') }}
      </span>
      <nav class="flex items-center gap-1">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="btn-text text-sm"
          :active-class="item.to === '/' ? '' : 'btn-action-active'"
          exact-active-class="btn-action-active"
        >
          <span :class="item.icon" />
          {{ item.label }}
        </NuxtLink>
      </nav>
      <div class="flex-auto" />
      <span v-if="backend?.mode === 'static'" class="badge-muted" :title="t('app.staticHint')">{{ t('app.static') }}</span>
      <select
        v-if="(projectList?.projects.length ?? 0) > 1"
        v-model="projectName"
        class="input-base text-sm font-mono"
        :aria-label="t('app.project')"
      >
        <option v-for="p in projectList?.projects" :key="p.name" :value="p.name">
          {{ p.name }}
        </option>
      </select>
    </header>

    <main class="flex-auto min-h-0 of-auto">
      <form v-if="pendingAuth" class="max-w-sm mx-auto mt-20 flex flex-col gap-3" @submit.prevent="submitCode">
        <h1 class="text-lg font-semibold">
          {{ t('auth.title') }}
        </h1>
        <p class="op-fade">
          {{ t('auth.hint') }}
        </p>
        <input v-model="code" class="input-base font-mono text-lg tracking-widest" inputmode="numeric" autocomplete="one-time-code" :aria-label="t('auth.code')" autofocus>
        <p v-if="codeRejected" class="color-red">
          {{ t('auth.rejected') }}
        </p>
        <button class="btn-primary self-start" type="submit">
          {{ t('auth.submit') }}
        </button>
      </form>
      <p v-else-if="error" class="p-4 color-red">
        {{ t('app.error', { message: error }) }}
      </p>
      <p v-else-if="!projectName" class="p-4 op-fade">
        {{ t('app.loading') }}
      </p>
      <NuxtPage v-else />
    </main>
  </div>
</template>

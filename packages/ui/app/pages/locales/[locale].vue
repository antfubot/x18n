<script setup lang="ts">
import { computed } from 'vue'
import { NuxtLink } from '#components'
import { useRoute } from '#imports'
import CopyPrompt from '../../components/CopyPrompt.vue'
import { t } from '../../i18n'
import { currentProject, projectName, useLive } from '../../state'

const route = useRoute()
const locale = computed(() => String(route.params.locale))
const summary = computed(() => currentProject.value?.locales.find(l => l.code === locale.value))
const table = useLive((b, project) => b.keys(project))
const analysis = useLive((b, project) => b.analysis(project))

const missing = computed(() => (table.value?.rows ?? []).filter(r => r.missing.includes(locale.value) && r.values[locale.value] === undefined))
const empty = computed(() => (table.value?.rows ?? []).filter(r => r.missing.includes(locale.value) && r.values[locale.value] !== undefined))
const groups = computed(() => [
  { title: t('locale.missing', { count: missing.value.length }), rows: missing.value },
  { title: t('locale.empty', { count: empty.value.length }), rows: empty.value },
])
const problems = computed(() => (analysis.value?.diagnostics ?? []).filter(d => d.locale === locale.value && (d.code === 'placeholder-mismatch' || d.code === 'invalid-syntax')))
</script>

<template>
  <div v-if="summary" class="p-4 grid gap-4 max-w-5xl">
    <header class="flex items-center gap-3">
      <span class="text-2xl">{{ summary.flag }}</span>
      <h1 class="text-lg font-semibold">
        {{ summary.displayName ?? summary.code }} <span class="font-mono op-fade">{{ summary.code }}</span>
      </h1>
      <div class="flex-auto" />
      <CopyPrompt v-if="summary.code !== currentProject?.sourceLocale" :query="{ project: projectName, locale: summary.code }" />
      <NuxtLink :to="{ path: '/keys', query: { missing: summary.code } }" class="btn-action-sm">
        {{ t('locale.openInGrid') }}
      </NuxtLink>
    </header>

    <div class="grid gap-1">
      <div class="h-2 rounded bg-sunken of-hidden">
        <div class="h-full bg-primary-500" :style="{ width: `${summary.percent}%` }" />
      </div>
      <p class="op-fade tabular-nums">
        {{ t('locale.progress', { translated: summary.translated, total: summary.total, percent: summary.percent }) }}
      </p>
    </div>

    <section v-for="group in groups" :key="group.title" class="border border-base rounded">
      <h2 class="px-3 py-2 border-b border-base font-semibold">
        {{ group.title }}
      </h2>
      <NuxtLink v-for="row in group.rows" :key="row.key" :to="`/keys/${encodeURIComponent(row.key)}`" class="block px-3 py-1 font-mono hover:bg-hover truncate">
        {{ row.key }}
      </NuxtLink>
    </section>

    <section class="border border-base rounded">
      <h2 class="px-3 py-2 border-b border-base font-semibold">
        {{ t('locale.problems', { count: problems.length }) }}
      </h2>
      <NuxtLink v-for="(d, i) in problems" :key="i" :to="`/keys/${encodeURIComponent(d.key ?? '')}`" class="flex gap-2 px-3 py-1 hover:bg-hover">
        <span class="font-mono">{{ d.key }}</span>
        <span class="op-fade">{{ d.message }}</span>
      </NuxtLink>
    </section>
  </div>
</template>

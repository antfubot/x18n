<script setup lang="ts">
import type { UsageView } from '../../src/node/types'
import { computed, ref } from 'vue'
import { NuxtLink } from '#components'
import CodeSnippet from '../components/CodeSnippet.vue'
import { t } from '../i18n'
import { useLive } from '../state'

const analysis = useLive((b, project) => b.analysis(project))
const usages = useLive((b, project) => b.usages(project))

const tab = ref<'missing' | 'unused' | 'dynamic' | 'all'>('missing')
const filter = ref('')

const undefinedByKey = computed(() => {
  const groups = new Map<string, UsageView[]>()
  for (const usage of analysis.value?.undefinedUsages ?? []) {
    const list = groups.get(usage.key ?? usage.raw) ?? []
    groups.set(usage.key ?? usage.raw, list)
    list.push(usage)
  }
  return [...groups]
})
const dynamic = computed(() => (usages.value ?? []).filter(u => u.dynamic !== false))
const all = computed(() => (usages.value ?? []).filter(u => !filter.value || u.path.includes(filter.value) || (u.key ?? u.raw).includes(filter.value)))

const tabs = computed(() => [
  { id: 'missing' as const, label: t('usages.missing', { count: undefinedByKey.value.length }) },
  { id: 'unused' as const, label: t('usages.unused', { count: analysis.value?.unused.length ?? 0 }) },
  { id: 'dynamic' as const, label: t('usages.dynamic', { count: dynamic.value.length }) },
  { id: 'all' as const, label: t('usages.all', { count: usages.value?.length ?? 0 }) },
])
</script>

<template>
  <div class="p-4 grid gap-3 max-w-5xl">
    <div class="flex gap-1" role="tablist">
      <button v-for="item in tabs" :key="item.id" role="tab" :aria-selected="tab === item.id" class="btn-action-sm" :class="tab === item.id ? 'btn-action-active' : ''" @click="tab = item.id">
        {{ item.label }}
      </button>
    </div>

    <template v-if="tab === 'missing'">
      <p class="op-fade">
        {{ t('usages.missingHint') }}
      </p>
      <div v-for="[key, list] in undefinedByKey" :key="key" class="border border-base rounded p-2 grid gap-1">
        <span class="font-mono font-semibold">{{ key }}</span>
        <CodeSnippet v-for="(usage, i) in list" :key="i" :usage="usage" />
      </div>
    </template>

    <template v-else-if="tab === 'unused'">
      <p class="op-fade">
        {{ t('usages.unusedHint') }}
      </p>
      <NuxtLink v-for="key in analysis?.unused" :key="key" :to="`/keys/${encodeURIComponent(key)}`" class="font-mono hover:bg-hover px-2 py-0.5 rounded">
        {{ key }}
      </NuxtLink>
    </template>

    <template v-else-if="tab === 'dynamic'">
      <p class="op-fade">
        {{ t('usages.dynamicHint') }}
      </p>
      <div v-for="(usage, i) in dynamic" :key="i" class="grid gap-1">
        <span class="font-mono text-mini op-fade">{{ usage.path }}:{{ usage.line }} · {{ usage.raw }}</span>
        <CodeSnippet :usage="usage" />
      </div>
    </template>

    <template v-else>
      <input v-model="filter" class="input-base w-72" :placeholder="t('usages.filter')" :aria-label="t('usages.filter')">
      <div v-for="(usage, i) in all" :key="i" class="flex gap-3 font-mono text-mini px-2 py-0.5 hover:bg-hover">
        <span class="op-fade w-72 truncate" :title="usage.path">{{ usage.path }}:{{ usage.line }}</span>
        <NuxtLink v-if="usage.key" :to="`/keys/${encodeURIComponent(usage.key)}`">
          {{ usage.key }}
        </NuxtLink>
        <span v-else class="op-fade">{{ usage.raw }}</span>
      </div>
    </template>
  </div>
</template>

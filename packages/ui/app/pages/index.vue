<script setup lang="ts">
import { computed } from 'vue'
import { NuxtLink } from '#components'
import { t } from '../i18n'
import { currentProject as project, recentKeys } from '../state'

const stats = computed(() => project.value && [
  { label: t('overview.keys'), value: project.value.keys, to: '/keys' },
  { label: t('overview.resources'), value: project.value.resources, to: '/project' },
  { label: t('overview.usages'), value: project.value.usages, to: '/usages' },
  { label: t('overview.locales'), value: project.value.locales.length, to: '/keys' },
])
</script>

<template>
  <div v-if="project" class="p-4 grid gap-4 max-w-5xl">
    <section class="grid grid-cols-2 md:grid-cols-4 gap-2">
      <div v-for="stat in stats" :key="stat.label" class="border border-base rounded p-3">
        <NuxtLink :to="stat.to" class="block">
          <div class="text-2xl font-mono tabular-nums">
            {{ stat.value }}
          </div>
          <div class="op-fade text-mini uppercase tracking-wide">
            {{ stat.label }}
          </div>
        </NuxtLink>
      </div>
    </section>

    <section class="border border-base rounded">
      <h2 class="px-3 py-2 border-b border-base font-semibold">
        {{ t('overview.coverage') }}
      </h2>
      <NuxtLink
        v-for="locale in project.locales"
        :key="locale.code"
        :to="`/locales/${encodeURIComponent(locale.code)}`"
        class="grid grid-cols-[2rem_8rem_1fr_6rem_8rem] items-center gap-3 px-3 py-1.5 hover:bg-hover"
      >
        <span>{{ locale.flag }}</span>
        <span class="font-mono">{{ locale.code }} <span v-if="locale.code === project.sourceLocale" class="badge-muted">{{ t('overview.source') }}</span></span>
        <span class="h-1.5 rounded bg-sunken of-hidden" :title="locale.displayName">
          <span class="block h-full bg-primary-500" :style="{ width: `${locale.percent}%` }" />
        </span>
        <span class="font-mono tabular-nums text-right">{{ locale.percent }}%</span>
        <span class="op-fade text-mini tabular-nums">{{ t('overview.missing', { missing: locale.missing, empty: locale.empty }) }}</span>
      </NuxtLink>
    </section>

    <div class="grid md:grid-cols-2 gap-4">
      <section class="border border-base rounded">
        <h2 class="px-3 py-2 border-b border-base font-semibold flex gap-3">
          {{ t('overview.diagnostics') }}
          <span class="font-normal color-red-500 tabular-nums">{{ t('overview.errors', { count: project.diagnostics.errors }) }}</span>
          <span class="font-normal color-amber-500 tabular-nums">{{ t('overview.warnings', { count: project.diagnostics.warnings }) }}</span>
        </h2>
        <p v-if="!project.diagnostics.byCode.length" class="px-3 py-2 op-fade">
          {{ t('overview.clean') }}
        </p>
        <div v-for="d in project.diagnostics.byCode" :key="d.code" class="flex items-center gap-2 px-3 py-1">
          <span :class="d.severity === 'error' ? 'i-ph-x-circle-duotone color-red-500' : 'i-ph-warning-duotone color-amber-500'" />
          <span class="font-mono flex-auto">{{ d.code }}</span>
          <span class="font-mono tabular-nums">{{ d.count }}</span>
        </div>
      </section>

      <section class="border border-base rounded">
        <h2 class="px-3 py-2 border-b border-base font-semibold">
          {{ t('overview.presets') }}
        </h2>
        <div class="px-3 py-2 flex flex-wrap gap-1">
          <span v-for="preset in project.presets" :key="preset" class="badge-active font-mono">{{ preset }}</span>
          <span v-if="!project.presets.length" class="op-fade">{{ t('overview.noPresets') }}</span>
        </div>
        <h2 class="px-3 py-2 border-y border-base font-semibold">
          {{ t('overview.recent') }}
        </h2>
        <div class="px-3 py-2 flex flex-wrap gap-1">
          <NuxtLink v-for="key in recentKeys" :key="key" :to="`/keys/${encodeURIComponent(key)}`" class="badge-muted font-mono">
            {{ key }}
          </NuxtLink>
          <span v-if="!recentKeys.length" class="op-fade">{{ t('overview.noRecent') }}</span>
        </div>
      </section>
    </div>
  </div>
</template>

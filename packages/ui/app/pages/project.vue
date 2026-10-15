<script setup lang="ts">
import type { ExplainList } from '../../src/node/types'
import { computed, onMounted, shallowRef } from 'vue'
import { t } from '../i18n'
import { backend, projectName } from '../state'

const list = shallowRef<ExplainList>()
onMounted(async () => {
  list.value = await backend.value!.explain()
})
const explain = computed(() => list.value?.projects.find(p => p.name === projectName.value))
</script>

<template>
  <div v-if="explain" class="p-4 grid gap-4 max-w-5xl">
    <section class="border border-base rounded">
      <h2 class="px-3 py-2 border-b border-base font-semibold">
        {{ t('project.presets') }}
      </h2>
      <div v-for="preset in explain.presets" :key="preset.name" class="flex gap-2 px-3 py-1">
        <span :class="preset.reason === 'listed' || preset.reason === 'detected' ? 'i-ph-check-circle-duotone color-active' : 'i-ph-circle op-mute'" />
        <span class="font-mono flex-auto">{{ preset.name }}</span>
        <span class="op-fade">{{ preset.reason }}</span>
      </div>
    </section>

    <section class="border border-base rounded">
      <h2 class="px-3 py-2 border-b border-base font-semibold">
        {{ t('project.finders') }}
      </h2>
      <details v-for="finder in explain.finders" :key="finder.id" class="px-3 py-1">
        <summary class="cursor-pointer font-mono">
          {{ finder.id }} <span class="op-fade">{{ t('project.resources', { count: finder.resources.length }) }}</span>
        </summary>
        <div v-for="path in finder.resources" :key="path" class="font-mono text-mini op-fade pl-4">
          {{ path }}
        </div>
      </details>
    </section>

    <div class="grid md:grid-cols-2 gap-4">
      <section class="border border-base rounded">
        <h2 class="px-3 py-2 border-b border-base font-semibold">
          {{ t('project.formats') }}
        </h2>
        <div v-for="format in explain.formats.filter(f => f.resources > 0)" :key="format.id" class="flex gap-2 px-3 py-1 font-mono">
          <span class="flex-auto">{{ format.id }} <span class="op-fade">{{ format.extensions.join(', ') }}</span></span>
          <span class="tabular-nums">{{ format.resources }}</span>
        </div>
      </section>
      <section class="border border-base rounded">
        <h2 class="px-3 py-2 border-b border-base font-semibold">
          {{ t('project.scanners') }}
        </h2>
        <div v-for="scanner in explain.scanners" :key="scanner.id" class="flex gap-2 px-3 py-1 font-mono">
          <span class="flex-auto">{{ scanner.id }} <span class="op-fade">{{ scanner.extensions.join(', ') }}</span></span>
          <span class="tabular-nums">{{ t('project.files', { count: scanner.files }) }}</span>
        </div>
      </section>
    </div>

    <section v-if="explain.errors.length || explain.conflicts.length" class="border border-base rounded">
      <h2 class="px-3 py-2 border-b border-base font-semibold">
        {{ t('project.problems') }}
      </h2>
      <div v-for="(e, i) in explain.errors" :key="`e${i}`" class="px-3 py-1 color-red-500">
        <span class="font-mono">{{ e.code }}</span> {{ e.message }} <span v-if="e.path" class="font-mono op-fade">{{ e.path }}</span>
      </div>
      <div v-for="c in explain.conflicts" :key="c.extension" class="px-3 py-1 color-amber-500">
        {{ t('project.conflict', { extension: c.extension, winner: c.winner, loser: c.loser }) }}
      </div>
    </section>

    <section class="border border-base rounded">
      <h2 class="px-3 py-2 border-b border-base font-semibold">
        {{ t('project.config') }}
      </h2>
      <div v-for="(origin, field) in explain.config.origins" :key="field" class="flex gap-2 px-3 py-1 font-mono">
        <span class="flex-auto">{{ field }}</span>
        <span class="op-fade">{{ origin }}</span>
      </div>
      <pre class="bg-code m-2 p-2 rounded text-mini of-x-auto">{{ JSON.stringify(explain.config, null, 2) }}</pre>
    </section>
  </div>
</template>

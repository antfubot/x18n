<script setup lang="ts">
import type { ExtractCandidate } from '@x18n/builtins/extractors'
import { computed, ref, watch } from 'vue'
import { t } from '../i18n'
import { backend, projectName, useLive } from '../state'

const candidates = useLive((b, project) => b.extractCandidates(project))

interface Draft { candidate: ExtractCandidate, key: string, picked: boolean }
const drafts = ref<Draft[]>([])
watch(candidates, (list) => {
  drafts.value = (list ?? []).map(candidate => ({ candidate, key: candidate.key, picked: true }))
})

const byFile = computed(() => {
  const groups = new Map<string, Draft[]>()
  for (const draft of drafts.value) {
    const list = groups.get(draft.candidate.path) ?? []
    groups.set(draft.candidate.path, list)
    list.push(draft)
  }
  return [...groups]
})
const picked = computed(() => drafts.value.filter(d => d.picked))
const result = ref<string>()

async function apply(): Promise<void> {
  const items = picked.value.map(({ candidate: c, key }) => ({
    path: c.path,
    range: c.range,
    original: c.original,
    key,
    value: c.value,
    replacement: c.replacement.replace(c.key, key),
    imports: c.imports,
  }))
  const applied = await backend.value!.extractApply({ project: projectName.value, items })
  result.value = t('extract.done', { count: applied.keys.length, files: applied.changes.length })
}
</script>

<template>
  <div class="p-4 grid gap-3 max-w-6xl">
    <header class="flex items-center gap-3">
      <p class="op-fade flex-auto">
        {{ t('extract.hint') }}
      </p>
      <span v-if="result" class="color-active">{{ result }}</span>
      <button v-if="backend?.capabilities.write" class="btn-primary" :disabled="!picked.length" @click="apply">
        {{ t('extract.apply', { count: picked.length }) }}
      </button>
    </header>
    <p v-if="candidates && !drafts.length" class="op-fade">
      {{ t('extract.none') }}
    </p>
    <section v-for="[path, list] in byFile" :key="path" class="border border-base rounded">
      <h2 class="px-3 py-2 border-b border-base font-mono">
        {{ path }}
      </h2>
      <label v-for="draft in list" :key="draft.candidate.range.start" class="grid grid-cols-[auto_3rem_1fr_16rem] gap-3 items-center px-3 py-1 border-b border-mute">
        <input v-model="draft.picked" type="checkbox" :disabled="!backend?.capabilities.write">
        <span class="font-mono op-fade tabular-nums text-right">{{ draft.candidate.line }}</span>
        <span class="truncate" :title="draft.candidate.text">{{ draft.candidate.text }}</span>
        <input v-model="draft.key" class="input-base font-mono" :readonly="!backend?.capabilities.write" :aria-label="t('extract.key')">
      </label>
    </section>
  </div>
</template>

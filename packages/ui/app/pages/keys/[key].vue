<script setup lang="ts">
import type { Fix, MessageLeaf } from '@x18n/core'
import type { UiEditOp, UsageView } from '../../../src/node/types'
import { computed, ref } from 'vue'
import { NuxtLink } from '#components'
import { useRoute } from '#imports'
import CodeSnippet from '../../components/CodeSnippet.vue'
import CopyPrompt from '../../components/CopyPrompt.vue'
import MessageText from '../../components/MessageText.vue'
import { applyEdit, describeProblem, setMessage } from '../../edit'
import { t } from '../../i18n'
import { backend, currentProject, projectName, useLive } from '../../state'

const route = useRoute()
const key = computed(() => String(route.params.key))
const detail = useLive((b, project) => b.key(project, key.value))

const rows = computed(() => (currentProject.value?.locales ?? []).map(locale => ({
  locale: locale.code,
  message: detail.value?.messages.find(m => m.locale === locale.code),
})))

const editing = ref<{ locale: string, draft: string }>()
const problem = ref<string>()

async function save(force = false): Promise<void> {
  const edit = editing.value
  if (!edit)
    return
  const result = await setMessage(key.value, edit.locale, edit.draft, force)
  if (result.applied) {
    editing.value = undefined
    problem.value = undefined
  }
  else {
    problem.value = result.problems.map(describeProblem).join('; ')
  }
}

function edit(locale: string, value: MessageLeaf | undefined): void {
  editing.value = { locale, draft: value === undefined || value === null ? '' : String(value) }
  problem.value = undefined
}

function isUiOp(op: Fix['ops'][number]): op is UiEditOp {
  return op.type !== 'extract' && op.type !== 'format'
}

function openUsage(usage: UsageView): void {
  void backend.value?.openInEditor({ project: projectName.value, path: usage.path, line: usage.line, column: usage.column })
}
</script>

<template>
  <div class="p-4 grid gap-4 max-w-5xl">
    <header class="flex items-center gap-2">
      <NuxtLink to="/keys" class="btn-icon-compact" :aria-label="t('detail.back')">
        <span class="i-ph-arrow-left" />
      </NuxtLink>
      <h1 class="text-lg font-mono font-semibold break-all">
        {{ key }}
      </h1>
      <span v-if="detail?.namespace" class="badge-muted font-mono">{{ detail.namespace }}</span>
    </header>

    <p v-if="detail === null" class="op-fade">
      {{ t('detail.notFound') }}
    </p>

    <template v-else-if="detail">
      <section class="border border-base rounded">
        <h2 class="px-3 py-2 border-b border-base font-semibold">
          {{ t('detail.values') }}
        </h2>
        <div v-for="row in rows" :key="row.locale" class="grid grid-cols-[6rem_1fr_auto] gap-3 px-3 py-2 border-b border-mute items-start">
          <span class="font-mono">{{ row.locale }}</span>
          <div v-if="editing?.locale === row.locale" class="grid gap-1">
            <textarea v-model="editing.draft" class="input-base font-mono" rows="2" :aria-label="t('keys.editValue', { key, locale: row.locale })" @keydown.enter.exact.prevent="save()" @keydown.escape="editing = undefined" />
            <p v-if="problem" class="color-amber-500 flex gap-2 items-center">
              {{ problem }}
              <button class="btn-action-sm" @click="save(true)">
                {{ t('edit.saveAnyway') }}
              </button>
            </p>
          </div>
          <div v-else>
            <MessageText :value="row.message?.value" :placeholders="row.message?.placeholders ?? []" />
            <div v-if="row.message" class="text-mini op-mute font-mono">
              {{ row.message.path }}:{{ row.message.line }}
            </div>
          </div>
          <div class="flex gap-1">
            <button v-if="backend?.capabilities.write && editing?.locale !== row.locale" class="btn-icon-compact" :title="t('detail.edit')" @click="edit(row.locale, row.message?.value)">
              <span class="i-ph-pencil-simple" />
            </button>
            <CopyPrompt v-if="row.locale !== currentProject?.sourceLocale" :query="{ project: projectName, locale: row.locale, keys: [key] }" />
          </div>
        </div>
      </section>

      <section v-if="detail.diagnostics.length" class="border border-base rounded">
        <h2 class="px-3 py-2 border-b border-base font-semibold">
          {{ t('detail.diagnostics') }}
        </h2>
        <div v-for="(d, i) in detail.diagnostics" :key="i" class="px-3 py-2 border-b border-mute flex items-center gap-2">
          <span :class="d.severity === 'error' ? 'i-ph-x-circle-duotone color-red-500' : 'i-ph-warning-duotone color-amber-500'" />
          <span class="font-mono op-fade">{{ d.code }}</span>
          <span class="flex-auto">{{ d.message }}</span>
          <template v-if="backend?.capabilities.write">
            <button v-for="fix in d.fixes.filter(f => f.ops.every(isUiOp))" :key="fix.title" class="btn-action-sm" @click="applyEdit(fix.ops.filter(isUiOp))">
              {{ fix.title }}
            </button>
          </template>
        </div>
      </section>

      <section class="border border-base rounded">
        <h2 class="px-3 py-2 border-b border-base font-semibold">
          {{ t('detail.usages', { count: detail.usages.length }) }}
        </h2>
        <p v-if="!detail.usages.length" class="px-3 py-2 op-fade">
          {{ t('detail.noUsages') }}
        </p>
        <div v-for="(usage, i) in detail.usages" :key="i" class="px-3 py-2 border-b border-mute grid gap-1">
          <div class="flex items-center gap-2 font-mono text-mini">
            <span class="op-fade">{{ usage.path }}:{{ usage.line }}:{{ usage.column }}</span>
            <span v-if="usage.possible" class="badge-muted">{{ t('detail.possible') }}</span>
            <button v-if="backend?.capabilities.openInEditor" class="btn-text text-mini" @click="openUsage(usage)">
              <span class="i-ph-arrow-square-out" /> {{ t('detail.openInEditor') }}
            </button>
          </div>
          <CodeSnippet :usage="usage" />
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { KeyRow } from '../../../src/node/types'
import { useVirtualList } from '@vueuse/core'
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from '#imports'
import MessageText from '../../components/MessageText.vue'
import { describeProblem, setMessage } from '../../edit'
import { fuzzyScore } from '../../fuzzy'
import { t } from '../../i18n'
import { backend, useLive } from '../../state'

const ROW_HEIGHT = 30

const route = useRoute()
const router = useRouter()
const table = useLive((b, project) => b.keys(project))

const search = ref('')
const namespace = ref('')
const missingIn = ref(typeof route.query.missing === 'string' ? route.query.missing : '')
const unusedOnly = ref(false)
const withDiagnostics = ref(false)

const locales = computed(() => {
  const all = table.value?.locales ?? []
  const source = table.value?.sourceLocale
  return [...all.filter(l => l === source), ...all.filter(l => l !== source)]
})
const namespaces = computed(() => [...new Set((table.value?.rows ?? []).flatMap(r => r.namespace ?? []))].sort())

const rows = computed<KeyRow[]>(() => {
  const query = search.value.trim()
  const filtered = (table.value?.rows ?? []).filter(row =>
    (!namespace.value || row.namespace === namespace.value)
    && (!missingIn.value || row.missing.includes(missingIn.value))
    && (!unusedOnly.value || row.unused)
    && (!withDiagnostics.value || row.diagnostics > 0))
  if (!query)
    return filtered
  const scored = filtered.map((row) => {
    const values = Object.values(row.values).map(v => fuzzyScore(query, String(v)) / 2)
    return { row, score: Math.max(fuzzyScore(query, row.key), ...values) }
  })
  return scored.filter(s => s.score >= 0).sort((a, b) => b.score - a.score).map(s => s.row)
})

const { list, containerProps, wrapperProps, scrollTo } = useVirtualList(rows, { itemHeight: ROW_HEIGHT, overscan: 12 })

// Spreadsheet-like cursor: column 0 is the key, then one column per locale.
const active = ref({ row: 0, col: 0 })
const editing = ref<{ key: string, locale: string, draft: string }>()
const problem = ref<{ key: string, locale: string, value: string, message: string }>()
const searchInput = useTemplateRef<HTMLInputElement>('searchInput')
const editor = useTemplateRef<HTMLInputElement[]>('editor')

watch(rows, () => {
  active.value = { row: Math.min(active.value.row, Math.max(rows.value.length - 1, 0)), col: active.value.col }
})

const columns = computed(() => `minmax(16rem, 1.2fr) repeat(${locales.value.length}, minmax(12rem, 1fr))`)

function move(row: number, col: number): void {
  const next = { row: Math.max(0, Math.min(rows.value.length - 1, row)), col: Math.max(0, Math.min(locales.value.length, col)) }
  active.value = next
  const el = containerProps.ref.value
  if (el) {
    const top = next.row * ROW_HEIGHT
    if (top < el.scrollTop || top + ROW_HEIGHT * 2 > el.scrollTop + el.clientHeight)
      scrollTo(next.row)
  }
}

async function startEdit(row: KeyRow, locale: string): Promise<void> {
  if (!backend.value?.capabilities.write)
    return
  const value = row.values[locale]
  editing.value = { key: row.key, locale, draft: value === undefined || value === null ? '' : String(value) }
  await nextTick()
  editor.value?.[0]?.focus()
}

async function commit(force = false): Promise<void> {
  const edit = editing.value
  if (!edit)
    return
  editing.value = undefined
  const result = await setMessage(edit.key, edit.locale, edit.draft, force)
  problem.value = result.applied
    ? undefined
    : { key: edit.key, locale: edit.locale, value: edit.draft, message: result.problems.map(describeProblem).join('; ') }
  containerProps.ref.value?.focus()
}

function cancel(): void {
  editing.value = undefined
  containerProps.ref.value?.focus()
}

async function forceSave(): Promise<void> {
  const p = problem.value
  if (!p)
    return
  editing.value = { key: p.key, locale: p.locale, draft: p.value }
  await commit(true)
}

function open(row: KeyRow): void {
  void router.push(`/keys/${encodeURIComponent(row.key)}`)
}

function activate(): void {
  const row = rows.value[active.value.row]
  if (!row)
    return
  const locale = locales.value[active.value.col - 1]
  if (locale)
    void startEdit(row, locale)
  else
    open(row)
}

const keymap: Record<string, () => void> = {
  'ArrowDown': () => move(active.value.row + 1, active.value.col),
  'ArrowUp': () => move(active.value.row - 1, active.value.col),
  'ArrowRight': () => move(active.value.row, active.value.col + 1),
  'ArrowLeft': () => move(active.value.row, active.value.col - 1),
  'PageDown': () => move(active.value.row + 20, active.value.col),
  'PageUp': () => move(active.value.row - 20, active.value.col),
  'Home': () => move(0, active.value.col),
  'End': () => move(rows.value.length - 1, active.value.col),
  'Enter': activate,
  'F2': activate,
  'o': () => rows.value[active.value.row] && open(rows.value[active.value.row]!),
  'j': () => move(active.value.row + 1, active.value.col),
  'k': () => move(active.value.row - 1, active.value.col),
  '/': () => searchInput.value?.focus(),
}

function onKey(event: KeyboardEvent): void {
  if (editing.value || event.metaKey || event.ctrlKey || event.altKey)
    return
  const action = keymap[event.key]
  if (action) {
    event.preventDefault()
    action()
  }
}

function onEditorKey(event: KeyboardEvent): void {
  // The grid's own keymap must not see keys typed into the editor.
  event.stopPropagation()
  if (event.key === 'Escape') {
    event.preventDefault()
    cancel()
  }
  else if (event.key === 'Enter' || event.key === 'Tab') {
    event.preventDefault()
    void commit().then(() => {
      if (event.key === 'Tab')
        move(active.value.row, active.value.col + 1)
    })
  }
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="shrink-0 flex flex-wrap items-center gap-2 px-3 py-2 border-b border-base">
      <label class="flex items-center gap-1 input-base w-72">
        <span class="i-ph-magnifying-glass op-mute" />
        <input ref="searchInput" v-model="search" class="bg-transparent outline-none flex-auto" :placeholder="t('keys.search')" :aria-label="t('keys.search')" @keydown.escape="containerProps.ref.value?.focus()" @keydown.enter="containerProps.ref.value?.focus()">
      </label>
      <select v-if="namespaces.length" v-model="namespace" class="input-base" :aria-label="t('keys.namespace')">
        <option value="">
          {{ t('keys.allNamespaces') }}
        </option>
        <option v-for="ns in namespaces" :key="ns" :value="ns">
          {{ ns }}
        </option>
      </select>
      <select v-model="missingIn" class="input-base" :aria-label="t('keys.missingIn')">
        <option value="">
          {{ t('keys.anyLocale') }}
        </option>
        <option v-for="locale in locales" :key="locale" :value="locale">
          {{ t('keys.missingInLocale', { locale }) }}
        </option>
      </select>
      <label class="flex items-center gap-1 select-none"><input v-model="unusedOnly" type="checkbox"> {{ t('keys.unused') }}</label>
      <label class="flex items-center gap-1 select-none"><input v-model="withDiagnostics" type="checkbox"> {{ t('keys.withDiagnostics') }}</label>
      <div class="flex-auto" />
      <span class="op-fade tabular-nums">{{ t('keys.count', { shown: rows.length, total: table?.rows.length ?? 0 }) }}</span>
    </div>

    <div v-if="problem" class="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border-b border-base" role="alert">
      <span class="i-ph-warning-duotone color-amber-500" />
      <span>{{ t('edit.rejected', { key: problem.key, locale: problem.locale, message: problem.message }) }}</span>
      <button class="btn-action-sm" @click="forceSave">
        {{ t('edit.saveAnyway') }}
      </button>
      <button class="btn-text text-sm" @click="problem = undefined">
        {{ t('edit.dismiss') }}
      </button>
    </div>

    <div
      v-bind="containerProps"
      class="flex-auto min-h-0 of-auto outline-none"
      tabindex="0"
      role="grid"
      :aria-label="t('keys.grid')"
      :aria-rowcount="rows.length"
      @keydown="onKey"
    >
      <div class="sticky top-0 z-grid-head grid bg-base border-b border-base font-semibold text-mini uppercase tracking-wide" :style="{ gridTemplateColumns: columns, height: `${ROW_HEIGHT}px` }" role="row">
        <div class="px-3 flex items-center" role="columnheader">
          {{ t('keys.key') }}
        </div>
        <div v-for="locale in locales" :key="locale" class="px-3 flex items-center gap-1 border-l border-base font-mono" role="columnheader">
          {{ locale }}
          <span v-if="locale === table?.sourceLocale" class="badge-muted normal-case">{{ t('overview.source') }}</span>
        </div>
      </div>
      <div v-bind="wrapperProps">
        <div
          v-for="{ data: row, index } in list"
          :key="row.key"
          class="grid border-b border-mute"
          :class="index === active.row ? 'bg-hover' : ''"
          :style="{ gridTemplateColumns: columns, height: `${ROW_HEIGHT}px` }"
          role="row"
          :aria-rowindex="index + 1"
          :data-key="row.key"
        >
          <div
            class="px-3 flex items-center gap-1 font-mono truncate cursor-pointer"
            :class="index === active.row && active.col === 0 ? 'outline outline-1 outline-primary-500 -outline-offset-1' : ''"
            role="gridcell"
            :title="row.key"
            @click="move(index, 0)"
            @dblclick="open(row)"
          >
            <span class="truncate">{{ row.key }}</span>
            <span v-if="row.unused" class="i-ph-ghost-duotone op-mute shrink-0" :title="t('keys.unusedHint')" />
            <span v-if="row.diagnostics" class="badge bg-red-500/10 color-red-500 shrink-0" :title="t('keys.diagnosticsHint')">{{ row.diagnostics }}</span>
          </div>
          <div
            v-for="(locale, col) in locales"
            :key="locale"
            class="px-3 flex items-center border-l border-mute min-w-0"
            :class="index === active.row && active.col === col + 1 ? 'outline outline-1 outline-primary-500 -outline-offset-1' : ''"
            role="gridcell"
            :data-locale="locale"
            @click="move(index, col + 1)"
            @dblclick="startEdit(row, locale)"
          >
            <input
              v-if="editing && editing.key === row.key && editing.locale === locale"
              ref="editor"
              v-model="editing.draft"
              class="w-full bg-transparent outline-none"
              :aria-label="t('keys.editValue', { key: row.key, locale })"
              @keydown="onEditorKey"
              @blur="commit()"
            >
            <span v-else class="truncate" :title="String(row.values[locale] ?? '')"><MessageText :value="row.values[locale]" /></span>
          </div>
        </div>
      </div>
      <p v-if="table && !rows.length" class="p-4 op-fade">
        {{ t('keys.empty') }}
      </p>
    </div>

    <div class="shrink-0 px-3 py-1 border-t border-base text-mini op-fade flex gap-3">
      <span>{{ t('keys.helpMove') }}</span>
      <span v-if="backend?.capabilities.write">{{ t('keys.helpEdit') }}</span>
      <span>{{ t('keys.helpOpen') }}</span>
      <span>{{ t('keys.helpSearch') }}</span>
    </div>
  </div>
</template>

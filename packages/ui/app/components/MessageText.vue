<script setup lang="ts">
import type { MessageLeaf } from '@x18n/core'
import type { MessageView } from '../../src/node/types'
import { computed } from 'vue'
import { t } from '../i18n'

const props = defineProps<{
  value: MessageLeaf | undefined
  placeholders?: MessageView['placeholders']
}>()

/** The value split around its placeholders, so they can be highlighted. */
const parts = computed(() => {
  if (typeof props.value !== 'string')
    return []
  const out: { text: string, placeholder: boolean }[] = []
  let at = 0
  for (const ph of props.placeholders ?? []) {
    if (ph.start > at)
      out.push({ text: props.value.slice(at, ph.start), placeholder: false })
    out.push({ text: props.value.slice(ph.start, ph.end), placeholder: true })
    at = ph.end
  }
  if (at < props.value.length)
    out.push({ text: props.value.slice(at), placeholder: false })
  return out
})
</script>

<template>
  <span v-if="value === undefined" class="color-red-500 op-fade italic">{{ t('value.missing') }}</span>
  <span v-else-if="value === ''" class="color-amber-500 op-fade italic">{{ t('value.empty') }}</span>
  <span v-else-if="typeof value !== 'string'" class="font-mono color-active">{{ JSON.stringify(value) }}</span>
  <span v-else class="whitespace-pre-wrap break-words"><template v-for="(part, i) in parts" :key="i"><span v-if="part.placeholder" class="rounded-sm bg-sky-500/20 color-sky-700 dark:color-sky-300 font-mono" data-placeholder>{{ part.text }}</span><template v-else>{{ part.text }}</template></template></span>
</template>

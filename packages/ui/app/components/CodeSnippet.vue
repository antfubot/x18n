<script setup lang="ts">
import type { UsageView } from '../../src/node/types'

defineProps<{ usage: UsageView }>()
</script>

<template>
  <pre class="bg-code rounded p-2 text-mini font-mono of-x-auto"><code><span
    v-for="(text, i) in usage.snippet.lines"
    :key="i"
    class="block"
    :class="usage.snippet.line + i === usage.line ? 'bg-active' : 'op-fade'"
  ><span class="inline-block w-8 text-right pr-3 op-mute select-none tabular-nums">{{ usage.snippet.line + i }}</span>{{ text }}</span></code></pre>
</template>

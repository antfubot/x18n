<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const title = t('app.title')
const page = 'home'
</script>

<template>
  <header>
    <h1>{{ $t('app.greeting', { name: 'x' }) }}</h1>
    <nav>
      <a>{{ t('nav.home') }}</a>
      <a v-t="'nav.about'" />
    </nav>
    <p>{{ $t(`pages.${page}.title`) }}</p>
    <p>{{ $t('app.titel') }}</p>
    <p>{{ title }}</p>
  </header>
</template>

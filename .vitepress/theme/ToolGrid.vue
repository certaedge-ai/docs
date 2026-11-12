<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import navigation from '../navigation.json'

const { lang } = useData()
const tools = computed(() => navigation.flatMap((section) => section.items)
  .filter((page) => 'icon' in page)
  .map((page) => ({
    ...page,
    text: lang.value.startsWith('en') ? page.textEn : page.text,
    route: `${lang.value.startsWith('en') ? '/en' : ''}${page.route}`,
  })))
</script>

<template>
  <div class="ce-tool-grid">
    <a v-for="tool in tools" :key="tool.route" :href="withBase(`${tool.route}.html`)" class="ce-tool-link">
      <img :src="withBase(`/images/tools/${tool.icon}`)" alt="" width="32" height="32" loading="lazy" />
      <span>{{ tool.text }}</span>
      <span class="ce-tool-arrow" aria-hidden="true">↗</span>
    </a>
  </div>
</template>

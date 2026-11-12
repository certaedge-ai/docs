<script setup lang="ts">
import { useData } from 'vitepress'

defineProps<{ to: 'home' | 'support' | 'keys' | 'models' | 'signUp' | 'wallet' | 'logs' | 'tasks' }>()
const { theme } = useData()
</script>

<template>
  <a :href="theme.platformLinks[to]"><slot /></a>
</template>
